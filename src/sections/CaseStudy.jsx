import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Quote } from "lucide-react";
import { GithubIcon } from "../components/icons";
import { useContent } from "../context/ContentContext";
import { Button } from "../components/Button";
import GlassCard from "../components/GlassCard";
import { EASE } from "../utils/motion";
import { useReducedMotion } from "../hooks/useMediaQuery";

/* ── Scroll-revealed copy block ────────────────────────────────────────── */
function Chapter({ label, index, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.95, ease: EASE }}
      className="grid gap-8 border-t border-line py-14 lg:grid-cols-[0.4fr_1fr] lg:gap-16"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <span className="font-mono text-[11.5px] tracking-[0.2em] text-accent uppercase">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="mt-3 text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
          {label}
        </h2>
      </div>
      <div className="max-w-2xl">{children}</div>
    </motion.section>
  );
}

function Prose({ children }) {
  return <p className="text-[17.5px] leading-[1.75] text-muted">{children}</p>;
}

function BulletList({ items, tone = "ink" }) {
  return (
    <ul className="mt-6 space-y-3.5">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 * i }}
          className="flex items-start gap-3.5 text-[15.5px] leading-relaxed text-ink/90 dark:text-white/90"
        >
          <span
            className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${
              tone === "accent" ? "bg-accent" : "bg-muted/60"
            }`}
          />
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

/* ── Architecture diagram (pure SVG — no image request) ────────────────── */
function ArchitectureDiagram({ project }) {
  const nodes = [
    { x: 60, y: 34, label: "React", sub: "Client" },
    { x: 220, y: 34, label: "TypeScript API", sub: "Express · JWT" },
    { x: 380, y: 34, label: "PostgreSQL", sub: "Persistence" },
    { x: 220, y: 128, label: "Workers", sub: "Async jobs" },
  ];

  return (
    <GlassCard tier="flat" sweep={false} className="p-6">
      <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label={`${project.title} system architecture`}>
        <defs>
          <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#0a84ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0a84ff" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* links */}
        <path d="M110 50 H160" stroke="url(#arc)" strokeWidth="1.5" fill="none" />
        <path d="M280 50 H330" stroke="url(#arc)" strokeWidth="1.5" fill="none" />
        <path d="M220 62 V98" stroke="url(#arc)" strokeWidth="1.5" fill="none" />
        <path d="M280 128 H330 V62" stroke="url(#arc)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />

        {nodes.map((n) => (
          <g key={n.label}>
            <rect
              x={n.x - 50}
              y={n.y - 20}
              width="100"
              height="40"
              rx="12"
              fill="var(--surface)"
              stroke="var(--line)"
              strokeWidth="1"
            />
            <text
              x={n.x}
              y={n.y - 2}
              textAnchor="middle"
              fill="var(--ink)"
              fontSize="11.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {n.label}
            </text>
            <text
              x={n.x}
              y={n.y + 12}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {n.sub}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center font-mono text-[11px] text-muted">
        {project.tech.join("  ·  ")}
      </p>
    </GlassCard>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function CaseStudy({ projectId }) {
  const { projects } = useContent();
  const reduced = useReducedMotion();
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);

  if (!project) {
    return (
      <main className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-semibold tracking-[-0.035em] text-gradient">
          Project not found.
        </h1>
        <Link to="/" className="mt-6 text-[14px] font-medium text-accent hover:underline">
          Back to work
        </Link>
      </main>
    );
  }

  const { scrollYProgress } = useScroll();
  const bannerY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "18%"]);
  const bannerScale = useTransform(scrollYProgress, [0, 0.5], reduced ? [1, 1] : [1.06, 1.16]);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <header className="relative isolate -mt-[68px] overflow-hidden pt-[104px] pb-16">
        <div className="absolute inset-0 -z-10">
          <motion.img
            src={project.image}
            alt=""
            style={{ y: bannerY, scale: bannerScale }}
            className="h-[112%] w-full object-cover"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/85 to-bg" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="mx-auto max-w-[1080px] px-6">
          <Link
            to="/#work"
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2} />
            All work
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-7 font-mono text-[11.5px] tracking-[0.22em] text-accent uppercase"
          >
            {`Case ${project.index}`}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE, delay: 0.06 }}
            className="mt-4 max-w-4xl text-[clamp(2.3rem,6vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-gradient"
          >
            {project.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.14 }}
            className="mt-5 max-w-2xl text-[clamp(1.05rem,2vw,1.35rem)] leading-relaxed text-muted"
          >
            {project.tagline}
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Technology stack"
          >
            {project.tech.map((t) => (
              <li
                key={t}
                className="rounded-lg border border-line bg-surface/70 px-3 py-1.5 text-[12.5px] font-medium text-ink backdrop-blur-md"
              >
                {t}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.26 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button size="lg" iconRight={ArrowUpRight} href={project.demo} target="_blank" rel="noreferrer noopener">
              Live Demo
            </Button>
            <Button size="lg" variant="secondary" icon={GithubIcon} href={project.repo} target="_blank" rel="noreferrer noopener">
              View Source
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-6 pb-28">
        <Chapter label="The problem" index={1}>
          <Prose>{project.problem}</Prose>
        </Chapter>

        <Chapter label="The solution" index={2}>
          <Prose>{project.solution}</Prose>
          <BulletList items={project.features} tone="accent" />
        </Chapter>

        <Chapter label="System architecture" index={3}>
          <Prose>{project.architecture}</Prose>
          <div className="mt-8">
            <ArchitectureDiagram project={project} />
          </div>
        </Chapter>

        {/* ── Screenshots ─────────────────────────────────────── */}
        <section className="border-t border-line py-14">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink"
          >
            Screenshots
          </motion.h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <motion.figure
                key={src}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1, ease: EASE, delay: 0.08 * i }}
                whileHover={reduced ? undefined : { y: -6 }}
                className="group relative overflow-hidden rounded-[20px] border border-line bg-surface-2 elevate-2 transition-shadow duration-500 hover:elevate-4"
              >
                <img
                  src={src}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  width={1180}
                  height={760}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </motion.figure>
            ))}
          </div>
        </section>

        <Chapter label="What was hard" index={4}>
          <Prose>
            Three constraints shaped every decision on this build — and none of them showed up in the
            original spec.
          </Prose>
          <BulletList items={project.challenges} />
        </Chapter>

        <Chapter label="The outcome" index={5}>
          <Prose>Measured after launch, not estimated:</Prose>
          <BulletList items={project.results} tone="accent" />
        </Chapter>

        {/* ── Quote / closing ─────────────────────────────────── */}
        <motion.blockquote
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="liquid liquid-edge liquid-sheen relative mt-8 overflow-hidden rounded-[24px] p-8 elevate-2 sm:p-10"
        >
          <span className="sweep" aria-hidden="true" />
          <Quote className="h-6 w-6 text-accent/60" strokeWidth={1.6} />
          <p className="mt-5 text-[clamp(1.15rem,2.4vw,1.6rem)] leading-[1.4] font-medium tracking-[-0.025em] text-ink">
            “{project.tagline}”
          </p>
          <footer className="mt-6 text-[13.5px] text-muted">
            {project.title} · {project.tech.join(" · ")}
          </footer>
        </motion.blockquote>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <Link to="/#work" className="text-[14px] font-medium text-accent hover:underline">
            ← Back to all work
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary" icon={GithubIcon} href={project.repo} target="_blank" rel="noreferrer noopener">
              Source
            </Button>
            <Button iconRight={ArrowUpRight} href={project.demo} target="_blank" rel="noreferrer noopener">
              Live Demo
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
