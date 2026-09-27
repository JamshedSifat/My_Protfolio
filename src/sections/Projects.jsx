import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GithubIcon } from "../components/icons";
import { useContent } from "../context/ContentContext";
import { SectionHeading, Reveal, EASE } from "../components/Reveal";
import { Button } from "../components/Button";
import { useReducedMotion } from "../hooks/useMediaQuery";

function ProjectRow({ project, index }) {
  const reversed = index % 2 === 1;
  const reduced = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallax = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-6%", "6%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.12, 1.02, 1.1]);
  const captionY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);

  return (
    <article
      ref={ref}
      className="group relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20"
    >
      {/* ── Cinematic image ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: EASE }}
        className={`relative ${reversed ? "lg:order-2" : "lg:order-1"}`}
      >
        <Link to={`/work/${project.id}`} aria-label={`Read the ${project.title} case study`} tabIndex={-1}>
          <div className="relative overflow-hidden rounded-[26px] border border-line bg-surface-2 elevate-3 transition-shadow duration-700 group-hover:elevate-4">
          <motion.img
            src={project.image}
            alt={`${project.title} interface`}
            width={1400}
            height={900}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding="async"
            style={{ y: parallax, scale: imageScale }}
            className="aspect-[16/10] w-full object-cover will-change-transform"
          />
          {/* cinematic grade */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "linear-gradient(120deg, transparent 35%, rgba(10,132,255,0.16) 50%, transparent 65%)" }} />

          <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white/90 uppercase backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {project.index}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-black/35 px-3 py-1.5 text-[11.5px] text-white/85 backdrop-blur-md">
              {project.tech.slice(0, 3).join(" · ")}
            </span>
            <span className="rounded-full bg-accent/90 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-md">
              Full stack
            </span>
          </div>
          </div>
        </Link>

        {/* soft moving shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -bottom-8 h-24 rounded-[50%] opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-accent) 16%, transparent), transparent 70%)",
          }}
        />
      </motion.div>

      {/* ── Story copy ──────────────────────────────────────── */}
      <motion.div
        style={reduced ? undefined : { y: captionY }}
        className={`flex flex-col ${reversed ? "lg:order-1 lg:pr-6" : "lg:order-2 lg:pl-6"}`}
      >
        <Reveal>
          <span className="font-mono text-[11.5px] tracking-[0.2em] text-accent uppercase">
            {`Case ${project.index}`}
          </span>
        </Reveal>

        <Reveal delay={0.04}>
          <h3 className="mt-4 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-ink">
            <Link
              to={`/work/${project.id}`}
              className="decoration-accent/40 underline-offset-[6px] transition-colors hover:text-accent hover:underline"
              data-cursor-label="Read"
            >
              {project.title}
            </Link>
          </h3>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-3 text-[16px] font-medium text-accent/90">{project.tagline}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-xl text-[16.5px] leading-[1.7] text-muted">{project.description}</p>
        </Reveal>

        <Reveal delay={0.16}>
          <ul className="mt-7 space-y-3">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink/85 dark:text-white/85">
                <Sparkles className="mt-[3px] h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                {h}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2}>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies used">
            {project.tech.map((t) => (
              <li
                key={t}
                className="rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-[12px] font-medium text-muted backdrop-blur-md transition-colors duration-300 hover:border-accent/40 hover:text-ink"
              >
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="md" variant="secondary" icon={ArrowUpRight} href={`/#/work/${project.id}`}>
              Case Study
            </Button>
            <Button size="md" variant="ghost" icon={GithubIcon} href={project.repo} target="_blank" rel="noreferrer noopener">
              GitHub
            </Button>
            <Button size="md" iconRight={ArrowUpRight} href={project.demo} target="_blank" rel="noreferrer noopener">
              Live Demo
            </Button>
          </div>
        </Reveal>
      </motion.div>
    </article>
  );
}

export default function Projects() {
  const { projects, profile } = useContent();

  return (
    <section id="work" className="relative scroll-mt-24 py-28 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeading
          eyebrow="Featured Projects"
          title="Four products, built end to end."
          description="Each one solved a real operational problem — bookings, checkout, attendance and content generation."
        />

        <div className="mt-10 divide-y divide-line">
          {projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            icon={GithubIcon}
            href={`https://github.com/${profile.githubUser}?tab=repositories`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Browse all repositories
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
