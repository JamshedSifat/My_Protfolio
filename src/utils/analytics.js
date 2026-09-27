import { bumpStat, getStats, trackResumeDownload as storeDownload, trackView } from "./store";
import { analyticsApi, apiConfigured } from "./api";

/** Called once from the app shell. */
export const initAnalytics = () => {
  const snapshot = trackView();
  if (apiConfigured && typeof window !== "undefined") {
    const key = "sp.v1.api-view";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      analyticsApi.event("view", crypto.randomUUID?.() ?? String(Date.now())).catch(() => {});
    }
  }
  return snapshot;
};

export const trackResumeDownload = () => storeDownload();

export const trackMessageSent = () => bumpStat("contactMessages");

/** Convenience snapshot for the admin dashboard. */
export const analyticsSnapshot = () => getStats();

export { trackView };
