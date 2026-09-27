import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderGit2,
  Gauge,
  ImageIcon,
  Inbox,
  LogOut,
  Menu,
  SlidersHorizontal,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { useContent } from "../context/ContentContext";
import { logout, restoreSession } from "../utils/auth";
import { formatNumber, getMessages, getStats } from "../utils/store";
import { apiConfigured, contactApi, analyticsApi } from "../utils/api";
import { cn } from "../utils/cn";
import AdminLogin from "./AdminLogin";
import ContentPanel from "./panels/ContentPanel";
import DashboardPanel from "./panels/DashboardPanel";
import InboxPanel from "./panels/InboxPanel";
import MediaPanel from "./panels/MediaPanel";
import ProjectsPanel from "./panels/ProjectsPanel";
import SettingsPanel from "./panels/SettingsPanel";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "content", label: "Content", icon: SlidersHorizontal },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const TITLES = {
  dashboard: "Overview",
  content: "Content",
  projects: "Projects",
  inbox: "Inbox",
  media: "Media",
  settings: "Settings",
};

function AdminShell({ session }) {
  const { content, saveContent, resetContent } = useContent();
  const [panel, setPanel] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [unread, setUnread] = useState(0);
  const [remoteViews, setRemoteViews] = useState(null);

  // Keep the sidebar badge and header counters honest.
  useEffect(() => {
    const read = async () => {
      if (apiConfigured) {
        try {
          const [messages, analytics] = await Promise.all([contactApi.list(), analyticsApi.dashboard()]);
          setUnread(messages.filter((message) => !message.read).length);
          setRemoteViews(analytics.views);
        } catch {
          // The active panel displays the actionable session error.
        }
        return;
      }
      setUnread(getMessages().filter((message) => !message.read).length);
    };
    read();
    const id = window.setInterval(read, 15000);
    return () => window.clearInterval(id);
  }, []);

  const notify = useCallback((message) => {
    setNotifyMsg(message);
    window.setTimeout(() => setNotifyMsg(""), 2600);
  }, []);

  const shared = useMemo(
    () => ({ content, save: saveContent, reset: resetContent, notify }),
    [content, saveContent, resetContent, notify],
  );

  return (
    <div className="min-h-[100svh]">
      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 py-6 lg:px-6">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[140] flex w-[248px] shrink-0 flex-col border-r border-line bg-surface/85 p-5 backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)] lg:translate-x-0 lg:rounded-2xl lg:border",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent/12 text-[13px] font-semibold text-accent">
                S
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Portfolio</p>
                <p className="text-[11px] text-muted">Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              className="rounded-lg p-1.5 text-muted hover:bg-surface-2 lg:hidden"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <nav aria-label="Admin sections" className="mt-7 flex flex-col gap-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPanel(id);
                  setMenuOpen(false);
                }}
                aria-current={panel === id ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  panel === id ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2/70 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                {label}
                {id === "inbox" && unread ? (
                  <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-1.5 pt-6">
            <p className="truncate text-[11.5px] text-muted">Signed in as {session?.claims?.sub ?? content.profile.email}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.hash = "#/";
                window.location.reload();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.9} />
              Sign out
            </button>
          </div>
        </aside>

        {menuOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[135] bg-black/40 backdrop-blur-sm lg:hidden"
          />
        ) : null}

        {/* ── Main ────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <header className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-line p-2 text-muted lg:hidden"
            >
              <Menu className="h-4 w-4" strokeWidth={1.9} />
            </button>
            <div>
              <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-ink">{TITLES[panel]}</h1>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {formatNumber(remoteViews ?? getStats().views)} views · {unread} unread
              </p>
            </div>
          </header>

          {panel === "dashboard" ? <DashboardPanel onNavigate={setPanel} /> : null}
          {panel === "content" ? <ContentPanel {...shared} /> : null}
          {panel === "projects" ? <ProjectsPanel {...shared} /> : null}
          {panel === "inbox" ? <InboxPanel notify={notify} /> : null}
          {panel === "media" ? <MediaPanel notify={notify} /> : null}
          {panel === "settings" ? <SettingsPanel {...shared} /> : null}

          {notifyMsg ? (
            <div
              role="status"
              aria-live="polite"
              className="fixed bottom-6 right-6 z-[160] rounded-xl border border-accent/30 bg-accent/12 px-4 py-3 text-[13.5px] font-medium text-ink backdrop-blur-xl elevate-3"
            >
              {notifyMsg}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    document.title = "Admin · Sifat";
    return () => {
      document.title = "Sifat — Full Stack Developer";
    };
  }, []);

  // Restoring the session asynchronously avoids flashing the login screen.
  useEffect(() => {
    let cancelled = false;
    restoreSession().then((restored) => {
      if (!cancelled) {
        setSession(restored);
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) return <div className="min-h-[100svh] bg-bg" aria-busy="true" />;
  if (!session) return <AdminLogin onAuth={setSession} />;

  // No ContentProvider here — App already provides one. Nesting a second
  // provider would give the admin its own isolated state, so published
  // edits would not reach the public site until a reload.
  return <AdminShell session={session} />;
}
