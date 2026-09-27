import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Database, Server, SlidersHorizontal, Smartphone } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { SectionHeading, Reveal } from "../components/Reveal";
import { useReducedMotion } from "../hooks/useMediaQuery";

const GROUP_ICONS = {
  Frontend: Smartphone,
  Backend: Server,
  Database: Database,
  Tools: SlidersHorizontal,
};

function Panel({ group, index }) {
  const Icon = GROUP_ICONS[group.group] ?? SlidersHorizontal;
  const reduced = useReducedMotion();
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-5, 5]), { stiffness: 150, damping: 20 });
  const rotateX = useSpring(useTransform(py, [0, 1], [4, -4]), { stiffness: 150, damping: 20 });
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);

  return (
    <Reveal delay={0.05 * index} className="h-full">
      <motion.section
        ref={ref}
        aria-label={group.group}
        onPointerMove={(e) => {
          if (reduced || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
        className="liquid liquid-edge liquid-sheen group relative flex h-full flex-col overflow-hidden rounded-[24px] p-7 elevate-2 transition-shadow duration-500 hover:elevate-4"
      >
        {/* pointer tracked light reflection */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-100"
          style={{
            left: glowX,
            top: glowY,
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 68%)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 dark:via-white/18"
        />

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-surface-2/90 text-accent ring-1 ring-line transition-transform duration-500 group-hover:-translate-y-0.5">
              <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </span>
            <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">{group.group}</h3>
          </div>
          <span className="font-mono text-[11px] text-muted">{`0${index + 1}`}</span>
        </header>

        <ul className="mt-6 flex flex-wrap gap-2">
          {group.items.map((item, i) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduced ? undefined : { y: -3, scale: 1.02 }}
              className="group/chip relative overflow-hidden rounded-xl border border-line bg-surface/60 px-3 py-2.5 backdrop-blur-md transition-all duration-300 hover:border-accent/35 hover:elevate-1"
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 transition-opacity duration-500 group-hover/chip:opacity-100 dark:from-white/8" />
              <span className="relative block text-[13.5px] leading-tight font-medium text-ink">
                {item.name}
              </span>
              <span className="relative mt-0.5 block text-[11px] leading-tight text-muted">
                {item.note}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.section>
    </Reveal>
  );
}

export default function TechStack() {
  const { stack } = useContent();

  return (
    <section id="stack" className="relative scroll-mt-24 py-28 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeading
          eyebrow="Tech Stack"
          title="Tools chosen for the job, not the trend."
          description="A deliberately small stack I know deeply — from the component tree down to the database index."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {stack.map((group, i) => (
            <Panel key={group.group} group={group} index={i} />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <p className="text-center text-[13px] text-muted">
            Depth over breadth — every tool here is used in something currently running in production.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
