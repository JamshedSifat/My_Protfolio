import { KEYS, read, remove, write } from "./store";

const configuredBase = import.meta.env.VITE_API_URL || "";
export const API_BASE = configuredBase.replace(/\/$/, "");
export const apiConfigured = Boolean(API_BASE);

let refreshPromise = null;

const accessToken = () => read(KEYS.token, null);
const refreshToken = () => read(KEYS.refreshToken, null);

export function storeTokens({ access, refresh, token }) {
  write(KEYS.token, access || token);
  if (refresh) write(KEYS.refreshToken, refresh);
}

export function clearTokens() {
  remove(KEYS.token);
  remove(KEYS.refreshToken);
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const detail = body?.error?.detail || body?.detail || body || `Request failed (${response.status})`;
    const error = new Error(typeof detail === "string" ? detail : "Please check the submitted fields.");
    error.status = response.status;
    error.fields = typeof detail === "object" ? detail : null;
    throw error;
  }
  return body;
}

async function renewAccess() {
  if (refreshPromise) return refreshPromise;
  const refresh = refreshToken();
  if (!refresh) throw new Error("Your session has expired. Please sign in again.");

  refreshPromise = fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(parseResponse)
    .then((data) => {
      storeTokens({ access: data.access, refresh: data.refresh || refresh });
      return data.access;
    })
    .catch((error) => {
      clearTokens();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export const refreshAccess = renewAccess;

export async function apiRequest(path, options = {}, retry = true) {
  if (!apiConfigured) throw new Error("The backend API is not configured.");
  const token = accessToken();
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401 && retry && refreshToken()) {
    await renewAccess();
    return apiRequest(path, options, false);
  }
  return parseResponse(response);
}

export async function publicRequest(path, options = {}) {
  if (!apiConfigured) throw new Error("The backend API is not configured.");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  return parseResponse(response);
}

export const contentApi = {
  public: () => publicRequest("/content/"),
  update: (content) => apiRequest("/admin/content/", { method: "PATCH", body: JSON.stringify(content) }),
};

export const contactApi = {
  create: (entry) => publicRequest("/contact/", { method: "POST", body: JSON.stringify(entry) }),
  list: () => apiRequest("/admin/messages/"),
  update: (id, readValue) => apiRequest(`/admin/messages/${id}/`, { method: "PATCH", body: JSON.stringify({ read: readValue }) }),
  markAllRead: () => apiRequest("/admin/messages/mark_all_read/", { method: "POST", body: "{}" }),
  remove: (id) => apiRequest(`/admin/messages/${id}/`, { method: "DELETE" }),
};

export const analyticsApi = {
  dashboard: () => apiRequest("/admin/analytics/"),
  event: (kind, session = "") => publicRequest("/events/", { method: "POST", body: JSON.stringify({ kind, session }) }),
};

export const resumeApi = {
  current: () => publicRequest("/resume/"),
  list: () => apiRequest("/admin/resumes/"),
  upload: (file) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest("/admin/resumes/", { method: "POST", body });
  },
  remove: (id) => apiRequest(`/admin/resumes/${id}/`, { method: "DELETE" }),
  downloadUrl: `${API_BASE}/resume/download/`,
};

export const mediaApi = {
  list: () => apiRequest("/admin/media/"),
  upload: (file) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest("/admin/media/", { method: "POST", body });
  },
  remove: (id) => apiRequest(`/admin/media/${id}/`, { method: "DELETE" }),
};