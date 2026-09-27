import { API_BASE, apiConfigured, apiRequest, clearTokens, publicRequest, refreshAccess, storeTokens } from "./api";
import { KEYS, read, write } from "./store";

const DEMO_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_ADMIN === "true";
const DEMO_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@sifat.dev";
const DEMO_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

function decode(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function mintDevelopmentToken(email) {
  const payload = {
    sub: email,
    email,
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    issuer: "development-only",
  };
  const b64 = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  return `${b64({ alg: "none", typ: "JWT" })}.${b64(payload)}.`;
}

export function getSession() {
  const token = read(KEYS.token, null);
  if (!token) return null;
  const claims = decode(token);
  if (!claims) {
    clearTokens();
    return null;
  }
  if (claims.exp * 1000 <= Date.now()) {
    // Keep the rotating refresh token so restoreSession can obtain a new
    // access token without forcing another login.
    write(KEYS.token, null);
    return null;
  }
  return { token, claims, demo: claims.issuer === "development-only" };
}

export async function restoreSession() {
  const active = getSession();
  if (active) return active;
  if (!apiConfigured || !read(KEYS.refreshToken, null)) return null;
  try {
    const token = await refreshAccess();
    return { token, claims: decode(token), demo: false };
  } catch {
    return null;
  }
}

export const logout = () => {
  const refresh = read(KEYS.refreshToken, null);
  if (apiConfigured && refresh) {
    publicRequest("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }
  clearTokens();
};

export async function login(email, password) {
  const address = String(email ?? "").trim().toLowerCase();
  if (apiConfigured) {
    const data = await publicRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email: address, password }),
    });
    storeTokens(data);
    return { token: data.access, claims: decode(data.access), user: data.user, demo: false };
  }

  if (!DEMO_ENABLED) throw new Error("Admin API is unavailable. Configure VITE_API_URL.");
  if (address !== DEMO_EMAIL.toLowerCase() || password !== DEMO_PASSWORD) {
    throw new Error("Invalid credentials");
  }
  const token = mintDevelopmentToken(address);
  write(KEYS.token, token);
  return { token, claims: decode(token), demo: true };
}

export { apiRequest, API_BASE };