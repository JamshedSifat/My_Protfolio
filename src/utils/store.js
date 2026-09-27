/**
 * Client-side persistence for analytics, the contact inbox and content
 * cache. With VITE_API_URL configured, PostgreSQL is authoritative and these
 * values are used only for a fast first paint or temporary offline fallback.
 */

const NS = "sp.v1";
export const KEYS = {
  content: `${NS}.content`,
  analytics: `${NS}.analytics`,
  messages: `${NS}.messages`,
  settings: `${NS}.settings`,
  resume: `${NS}.resume`,
  token: `${NS}.token`,
  refreshToken: `${NS}.refresh-token`,
};

export function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — non fatal */
  }
}

export function remove(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ── Analytics ─────────────────────────────────────────────────────────── */
const emptyStats = { views: 0, resumeDownloads: 0, contactMessages: 0, sessions: [] };

export const getStats = () => ({ ...emptyStats, ...read(KEYS.analytics, {}) });

export function bumpStat(field, amount = 1) {
  const stats = getStats();
  stats[field] = (stats[field] ?? 0) + amount;
  write(KEYS.analytics, stats);
  return stats;
}

/** Counted once per browser session so refreshes don't inflate the number. */
export function trackView() {
  if (typeof window === "undefined") return getStats();
  const flag = `${NS}.counted`;
  if (window.sessionStorage.getItem(flag)) return getStats();
  window.sessionStorage.setItem(flag, "1");

  const stats = bumpStat("views");
  stats.sessions = [...(stats.sessions ?? []), { at: new Date().toISOString() }].slice(-90);
  write(KEYS.analytics, stats);
  return stats;
}

export function trackResumeDownload() {
  return bumpStat("resumeDownloads");
}

/* ── Contact inbox ─────────────────────────────────────────────────────── */
export const getMessages = () => read(KEYS.messages, []);

export function addMessage({ name, email, message }) {
  const list = getMessages();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    source: "website",
  };
  write(KEYS.messages, [entry, ...list].slice(0, 200));
  bumpStat("contactMessages");
  return entry;
}

export function markMessageRead(id, isRead = true) {
  const list = getMessages().map((m) => (m.id === id ? { ...m, read: isRead } : m));
  write(KEYS.messages, list);
  return list;
}

export function markAllRead() {
  const list = getMessages().map((m) => ({ ...m, read: true }));
  write(KEYS.messages, list);
  return list;
}

export function deleteMessage(id) {
  const list = getMessages().filter((m) => m.id !== id);
  write(KEYS.messages, list);
  return list;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */
export const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n ?? 0);

export const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

/** Tiny uid for list keys. */
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
