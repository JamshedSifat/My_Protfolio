import { useMemo } from "react";
import { motion } from "framer-motion";
import { EASE } from "../../utils/motion";

const LEVELS = [
  "color-mix(in oklab, var(--ink) 8%, transparent)",
  "rgba(10,132,255,0.22)",
  "rgba(10,132,255,0.42)",
  "rgba(10,132,255,0.66)",
  "#0a84ff",
];

const levelOf = (count) => {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ContributionHeatmap({ calendar }) {
  const weeks = calendar?.weeks ?? [];
  const total = calendar?.totalContributions ?? 0;

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const first = week?.[0];
      if (!first) return;
      const month = new Date(first.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ index: i, label: MONTHS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  if (!weeks.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="liquid liquid-edge relative overflow-hidden rounded-[24px] p-6 elevate-2 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Contribution activity</h3>
          <p className="mt-1 text-[13px] text-muted">Last 12 months of commits, reviews and issues</p>
        </div>
        <p className="text-[13px] text-muted">
          <span className="font-semibold text-ink">{total.toLocaleString()}</span> contributions
        </p>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-[720px]">
          <div className="relative mb-1.5 h-3">
            {monthLabels.map(({ index, label }) => (
              <span
                key={`${label}-${index}`}
                className="absolute text-[10.5px] tracking-[0.08em] text-muted"
                style={{ left: `${(index / weeks.length) * 100}%` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week?.[di];
                  if (!day) return <span key={di} className="h-[11px] w-[11px]" />;
                  const level = levelOf(day.contributionCount);
                  return (
                    <span
                      key={day.date}
                      title={`${day.contributionCount} contributions · ${day.date}`}
                      className="heat-cell block h-[11px] w-[11px] rounded-[3px] transition-transform duration-300 hover:scale-[1.35]"
                      style={{
                        background: LEVELS[level],
                        boxShadow: level >= 3 ? "0 0 8px rgba(10,132,255,0.35)" : "none",
                        animationDelay: `${Math.min(700, wi * 9 + di * 4)}ms`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-end gap-1.5 text-[10.5px] text-muted">
            Less
            {LEVELS.map((color) => (
              <span key={color} className="h-[10px] w-[10px] rounded-[3px]" style={{ background: color }} />
            ))}
            More
          </div>
        </div>
      </div>
    </motion.div>
  );
}
