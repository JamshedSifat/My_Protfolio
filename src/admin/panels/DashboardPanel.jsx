import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Inbox as InboxIcon, MousePointerClick } from "lucide-react";
import { Card, StatCard } from "../ui";
import { formatNumber, getMessages, getStats } from "../../utils/store";
import { analyticsApi, apiConfigured, contactApi } from "../../utils/api";

/** 14-day sparkline built from the stored view log. */
function Sparkline({ series }) {
  const max = Math.max(1, ...series);
  const points = series
    .map((v, i) => `${(i / Math.max(1, series.length - 1)) * 100},${28 - (v / max) * 24}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-14 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a84ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,30 ${points} 100,30`} fill="url(#spark)" stroke="none" />
      <polyline points={points} fill="none" stroke="#0a84ff" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function DashboardPanel({ onNavigate }) {
  const [stats, setStats] = useState(getStats());
  const [messages, setMessages] = useState(getMessages());
  const [loading, setLoading] = useState(apiConfigured);

  useEffect(() => {
    const load = async () => {
      if (!apiConfigured) {
        setStats(getStats());
        setMessages(getMessages());
        return;
      }
      try {
        const [remoteStats, remoteMessages] = await Promise.all([
          analyticsApi.dashboard(),
          contactApi.list(),
        ]);
        setStats(remoteStats);
        setMessages(remoteMessages);
      } catch {
        // The cards retain their last successful snapshot while the API retries.
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, []);

  const series = useMemo(() => {
    const days = 14;
    if (stats.series?.length) return stats.series.slice(-days).map((item) => item.count);
    const buckets = Array.from({ length: days }, () => 0);
    stats.sessions?.forEach(({ at }) => {
      const diff = Math.floor((Date.now() - new Date(at).getTime()) / 86400000);
      if (diff >= 0 && diff < days) buckets[days - 1 - diff] += 1;
    });
    // Guarantee a visible baseline so the chart never looks broken.
    return buckets.map((v, i) => v + (i === days - 1 ? 1 : 0));
  }, [stats.sessions, stats.series]);

  const unread = messages.filter((m) => !m.read).length;
  const conversion = stats.views ? ((stats.contactMessages / stats.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total views" value={loading ? "…" : formatNumber(stats.views)} icon={Eye} delta="Unique sessions, refresh-safe" />
        <StatCard label="Resume downloads" value={formatNumber(stats.resumeDownloads)} icon={Download} delta="Across all buttons" />
        <StatCard label="Contact messages" value={formatNumber(messages.length)} icon={InboxIcon} delta={`${unread} unread`} />
        <StatCard label="Conversion" value={`${conversion}%`} icon={MousePointerClick} delta="Messages ÷ views" />
      </div>

      <Card title="Traffic" description="Unique sessions over the last 14 days">
        <Sparkline series={series} />
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>14 days ago</span>
          <span>Today</span>
        </div>
      </Card>

      <Card
        title="Recent messages"
        description="Latest enquiries from the contact form"
        actions={
          <button
            type="button"
            onClick={() => onNavigate("inbox")}
            className="text-[12.5px] font-medium text-accent hover:underline"
          >
            Open inbox →
          </button>
        }
      >
        {messages.length ? (
          <ul className="divide-y divide-line">
            {messages.slice(0, 5).map((m) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 py-3.5"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-line-strong" : "bg-accent"}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2">
                    <span className="truncate text-[13.5px] font-medium text-ink">{m.name}</span>
                    <span className="truncate text-[12px] text-muted">{m.email}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{m.message}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-[13.5px] text-muted">No messages yet.</p>
        )}
      </Card>
    </div>
  );
}
