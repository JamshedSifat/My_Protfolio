import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Response } from "express";
import { db } from "./db.js";
import { env } from "./config.js";
import { ApiError } from "./errors.js";
import type { AdminClaims, AuthenticatedRequest } from "./types.js";

type AdminRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  is_active: boolean;
  last_login: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function signAccess(admin: AdminRow) {
  return jwt.sign(
    { email: admin.email, role: "admin", type: "access", jti: randomUUID() },
    env.JWT_ACCESS_SECRET,
    { subject: admin.id, expiresIn: env.ACCESS_TOKEN_MINUTES * 60 },
  );
}

function signRefresh(admin: AdminRow, jti: string) {
  return jwt.sign(
    { email: admin.email, role: "admin", type: "refresh", jti },
    env.JWT_REFRESH_SECRET,
    { subject: admin.id, expiresIn: env.REFRESH_TOKEN_DAYS * 86_400 },
  );
}

export async function authenticate(email: string, password: string) {
  const result = await db.query<AdminRow>(
    "SELECT id, email, password_hash, display_name, is_active, last_login FROM admin_users WHERE lower(email) = lower($1)",
    [email],
  );
  const admin = result.rows[0];
  if (!admin || !admin.is_active || !(await bcrypt.compare(password, admin.password_hash))) {
    // The same error and expensive compare path prevents account discovery.
    if (!admin) await bcrypt.compare(password, "$2b$12$KIXQ6vNnAjgu1FS.EbQ5veqWxRx3uFY6BEJHhBzKG9dG4r6Ls3v.m");
    throw new ApiError(401, "invalid_credentials", "Invalid email or password.");
  }
  await db.query("UPDATE admin_users SET last_login = now() WHERE id = $1", [admin.id]);
  return issueTokens(admin);
}

async function issueTokens(admin: AdminRow) {
  const jti = randomUUID();
  const access = signAccess(admin);
  const refresh = signRefresh(admin, jti);
  await db.query(
    `INSERT INTO refresh_tokens (jti, admin_id, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' days')::interval)`,
    [jti, admin.id, hashToken(refresh), String(env.REFRESH_TOKEN_DAYS)],
  );
  return {
    access,
    refresh,
    token: access,
    user: { id: admin.id, email: admin.email, display_name: admin.display_name, is_staff: true, last_login: admin.last_login },
  };
}

export async function rotateRefresh(token: string) {
  let claims: AdminClaims;
  try {
    claims = jwt.verify(token, env.JWT_REFRESH_SECRET) as AdminClaims;
  } catch {
    throw new ApiError(401, "invalid_refresh", "The refresh token is invalid or expired.");
  }
  if (claims.type !== "refresh" || !claims.jti) throw new ApiError(401, "invalid_refresh", "Invalid refresh token.");

  const result = await db.query<AdminRow & { revoked_at: string | null; token_hash: string }>(
    `SELECT u.id, u.email, u.password_hash, u.display_name, u.is_active, u.last_login,
            r.revoked_at, r.token_hash
       FROM refresh_tokens r JOIN admin_users u ON u.id = r.admin_id
      WHERE r.jti = $1 AND r.expires_at > now()`,
    [claims.jti],
  );
  const row = result.rows[0];
  if (!row || row.revoked_at || row.token_hash !== hashToken(token) || !row.is_active) {
    throw new ApiError(401, "invalid_refresh", "The refresh token has been revoked.");
  }

  await db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE jti = $1", [claims.jti]);
  return issueTokens(row);
}

export async function revokeRefresh(token: string) {
  try {
    const claims = jwt.verify(token, env.JWT_REFRESH_SECRET) as AdminClaims;
    if (claims.jti) await db.query("UPDATE refresh_tokens SET revoked_at=now() WHERE jti=$1", [claims.jti]);
  } catch {
    // Logout is idempotent; an expired token is already unusable.
  }
}

export function requireAdmin(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(new ApiError(401, "authentication_required", "Sign in to continue."));
  try {
    const claims = jwt.verify(token, env.JWT_ACCESS_SECRET) as AdminClaims;
    if (claims.type !== "access" || claims.role !== "admin") throw new Error("Wrong token type");
    request.admin = claims;
    return next();
  } catch {
    return next(new ApiError(401, "invalid_token", "Your session has expired."));
  }
}