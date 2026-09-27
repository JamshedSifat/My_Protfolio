import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { baseContent } from "../data/site";
import { apiConfigured, contentApi } from "../utils/api";
import { KEYS, read, remove, write } from "../utils/store";

/**
 * The public site reads every string through this provider, so the admin panel
 * can edit content without touching a single component. Overrides are merged
 * over `baseContent` and persisted locally (or synced to the backend).
 */
const ContentContext = createContext({
  content: baseContent,
  saveContent: () => {},
  resetContent: () => {},
  isCustomised: false,
});

function merge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  if (Array.isArray(base) || Array.isArray(patch)) return patch ?? base;

  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (value && typeof value === "object" && base?.[key] && typeof base[key] === "object") {
      out[key] = merge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function ContentProvider({ children }) {
  const [override, setOverride] = useState(() => read(KEYS.content, null));
  const [loading, setLoading] = useState(apiConfigured);
  const [error, setError] = useState(null);

  // PostgreSQL is authoritative. The local copy is only a fast cache and an
  // offline fallback, so first paint never waits for the API.
  useEffect(() => {
    if (!apiConfigured) return undefined;
    let cancelled = false;
    contentApi
      .public()
      .then((remote) => {
        if (cancelled) return;
        setOverride(remote);
        write(KEYS.content, remote);
        setError(null);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEYS.content) setOverride(read(KEYS.content, null));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const content = useMemo(
    () => (override ? merge(baseContent, override) : baseContent),
    [override],
  );

  useEffect(() => {
    const accent = content.settings?.accent;
    if (/^#[0-9a-f]{6}$/i.test(accent || "")) {
      document.documentElement.style.setProperty("--color-accent", accent);
    }
    applySeo(content.seo);
  }, [content.settings?.accent, content.seo]);

  const saveContent = useCallback(
    async (partial) => {
      const next = merge(content, partial);
      // Optimistic update keeps the admin interaction instantaneous.
      setOverride(next);
      write(KEYS.content, next);

      if (!apiConfigured) return next;
      try {
        const saved = await contentApi.update(next);
        setOverride(saved);
        write(KEYS.content, saved);
        setError(null);
        return saved;
      } catch (reason) {
        // Roll back so the UI never claims an edit was persisted when it was not.
        setOverride(content);
        write(KEYS.content, content);
        setError(reason);
        throw reason;
      }
    },
    [content],
  );

  const resetContent = useCallback(async () => {
    if (apiConfigured) {
      const saved = await contentApi.update(baseContent);
      setOverride(saved);
      write(KEYS.content, saved);
      return saved;
    }
    remove(KEYS.content);
    setOverride(null);
    return baseContent;
  }, []);

  /**
   * Content fields are spread at the top level so sections can read
   * `const { profile, nav } = useContent()` directly, while the admin can
   * still reach the whole tree via `content`.
   */
  const value = useMemo(
    () => ({
      ...content,
      content,
      saveContent,
      resetContent,
      isCustomised: Boolean(override),
      override,
      contentLoading: loading,
      contentError: error,
    }),
    [content, saveContent, resetContent, override, loading, error],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function applySeo(seo) {
  if (!seo) return;
  if (seo.title) document.title = seo.title;
  const set = (selector, attr, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute(attr, value);
  };
  set('meta[name="description"]', "content", seo.description);
  set('meta[property="og:title"]', "content", seo.title);
  set('meta[property="og:description"]', "content", seo.description);
  set('meta[property="og:image"]', "content", seo.ogImage);
  set('meta[name="robots"]', "content", seo.indexable === false ? "noindex, nofollow" : "index, follow");
  set('link[rel="canonical"]', "href", seo.canonical);
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
