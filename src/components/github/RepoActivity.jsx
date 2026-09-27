import { motion } from "framer-motion";
import { GitCommitHorizontal, Star } from "lucide-react";
import { formatWhenSafe } from "../../utils/github";
import { EASE } from "../../utils/motion";

/** Repositories pushed in the recent window, with a compact activity bar. */
export default function RepoActivity({ repos = [] }) {
  if (!repos.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="liquid liquid-edge relative overflow-hidden rounded-[24px] p-6 elevate-2 sm:p-7"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Repository activity</h3>
          <p className="mt-1 text-[13px] text-muted">Pushed in the last 30 days</p>
        </div>
        <span className="rounded-full bg-accent/12 px-2.5 py-1 font-mono text-[11.5px] text-accent">
          {repos.length} active
        </span>
      </div>

      <ul className="mt-6 space-y-1">
        {repos.map((repo, i) => (
          <motion.li
            key={repo.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 * i }}
            className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-300 hover:bg-surface-2/60"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: repo.primaryLanguage?.color ?? "#0a84ff" }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[13px] text-ink transition-colors group-hover:text-accent">
                {repo.name}
              </p>
              <p className="truncate text-[11.5px] text-muted">
                {repo.primaryLanguage?.name ?? "Code"} · {formatWhenSafe(repo.updatedAt)}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2.5 font-mono text-[11.5px] text-muted">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" strokeWidth={1.9} />
                {repo.stargazerCount}
              </span>
              <span className="flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <GitCommitHorizontal className="h-3 w-3" strokeWidth={1.9} />
                {repo.forkCount}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
