import type { Request } from "express";

export type AdminClaims = {
  sub: string;
  email: string;
  role: "admin";
  type: "access" | "refresh";
  jti: string;
};

export type AuthenticatedRequest = Request & { admin?: AdminClaims };

export type ApiErrorShape = {
  status: number;
  code: string;
  detail: unknown;
};