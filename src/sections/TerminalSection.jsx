import { motion } from "framer-motion";
import { Activity, Command } from "lucide-react";
import Terminal from "../components/Terminal";
import { SectionHeading, Reveal } from "../components/Reveal";
import { EASE } from "../utils/motion";

const NOTES = [
  { icon: Command, label: "Trunk-based flow", body: "Small commits, feature branches, green CI before merge." },
  { icon: Activity, label: "Observable by default", body: "Structured logs, health checks and slow-query alerts." },
];

export default function TerminalSection() {
  return (
    <section id="terminal" className="relative scroll-mt-24 py-28 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeading
          eyebrow="Workflow"
          title="How the work actually gets shipped."
          description="A real session — commit, develop, containerise, serve, deploy. Replayed at the pace a shell would run it."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <Reveal>
            <Terminal />
          </Reveal>

          <div className="flex flex-col gap-5">
            {NOTES.map(({ icon: Icon, label, body }, i) => (
              <Reveal key={label} delay={0.1 + i * 0.08} className="flex-1">
                <div className="liquid liquid-edge liquid-sheen group relative h-full overflow-hidden rounded-[20px] p-6 elevate-2 transition-shadow duration-500 hover:elevate-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-surface-2/80 text-accent ring-1 ring-line transition-transform duration-500 group-hover:-translate-y-0.5">
                    <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-ink">{label}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-6 text-center font-mono text-[12px] text-muted"
        >
          // replayed at shell cadence — 58ms keystroke, 190ms output flush
        </motion.p>
      </div>
    </section>
  );
}
