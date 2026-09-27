import { motion } from "framer-motion";
import { GitFork, Star } from "lucide-react";
import { EASE } from "../../utils/motion";

export default function RepoCard({ repo, index = 0 }) {
  return (
    <motion.a
      href={repo.url ?? "https://github.com"}
      target="_blank"
      rel="noreferrer noopener"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.05 * (index % 3) }}
      whileHover={{ y: -6 }}
      className="liquid liquid-edge liquid-sheen group relative flex h-full flex-col overflow-hidden rounded-[20px] p-5 elevate-2 transition-shadow duration-500 hover:elevate-4"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 70%)",
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <h4 className="font-mono text-[14px] font-medium text-ink transition-colors group-hover:text-accent">
          {repo.name}
        </h4>
        {repo.isPrivate ? (
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] tracking-wider text-muted uppercase">
            Private
          </span>
        ) : null}
      </div>

      <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">
        {repo.description || "No description provided."}
      </p>

      <div className="mt-auto flex items-center gap-4 pt-5 text-[12px] text-muted">
        {repo.primaryLanguage ? (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: repo.primaryLanguage.color ?? "#0a84ff" }}
            />
            {repo.primaryLanguage.name}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3" strokeWidth={1.9} />
          {repo.stargazerCount}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3 w-3" strokeWidth={1.9} />
          {repo.forkCount}
        </span>
      </div>
    </motion.a>
  );
}
