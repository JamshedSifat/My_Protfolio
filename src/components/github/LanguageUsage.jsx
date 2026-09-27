import { motion } from "framer-motion";
import { EASE } from "../../utils/motion";

/** Weighted language usage across the visible repositories. */
export default function LanguageUsage({ languages = [] }) {
  if (!languages.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="liquid liquid-edge relative overflow-hidden rounded-[24px] p-6 elevate-2 sm:p-7"
    >
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Language usage</h3>
      <p className="mt-1 text-[13px] text-muted">Weighted by repository size, most recent first</p>

      {/* stacked share bar */}
      <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-line">
        {languages.map((lang, i) => (
          <motion.span
            key={lang.name}
            initial={{ width: 0 }}
            whileInView={{ width: `${lang.percent}%` }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.06 * i }}
            style={{ background: lang.color }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {languages.map((lang, i) => (
          <motion.li
            key={lang.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
            className="flex items-center gap-3"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: lang.color }} />
            <span className="flex-1 text-[13.5px] text-ink">{lang.name}</span>
            <span className="font-mono text-[12px] text-muted">{lang.percent.toFixed(1)}%</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
