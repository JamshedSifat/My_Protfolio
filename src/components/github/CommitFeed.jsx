import { motion } from "framer-motion";
import { GitCommitHorizontal } from "lucide-react";
import { formatWhen, formatWhenSafe } from "../../utils/github";
import { EASE } from "../../utils/motion";

export default function CommitFeed({ commits = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="liquid liquid-edge relative overflow-hidden rounded-[24px] p-6 elevate-2 sm:p-7"
    >
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Latest commits</h3>
      <p className="mt-1 text-[13px] text-muted">Straight from the default branches</p>

      <ul className="mt-6 space-y-1">
        {commits.map((commit, i) => (
          <motion.li
            key={`${commit.sha}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.06 * i }}
            className="group flex items-start gap-3 rounded-xl px-2 py-3 transition-colors duration-300 hover:bg-surface-2/60"
          >
            <GitCommitHorizontal
              className="mt-[2px] h-4 w-4 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.8}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] leading-snug text-ink">{commit.message}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted">
                <span className="text-accent/80">{commit.sha}</span>
                <span className="opacity-50">/</span>
                <span className="truncate">{commit.repo}</span>
                <span className="opacity-50">/</span>
                <span className="shrink-0">{formatWhenSafe(commit.when)}</span>
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
