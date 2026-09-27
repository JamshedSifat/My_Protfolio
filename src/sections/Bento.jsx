import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, Clock, Compass, GitBranch, MapPin, Sparkles } from "lucide-react";
import { GithubIcon } from "../components/icons";
import { SectionHeading, Reveal } from "../components/Reveal";
import { EASE } from "../utils/motion";
import { useContent } from "../context/ContentContext";
import { useReducedMotion } from "../hooks/useMediaQuery";

/* ── Bento tile shell ────────────────────────────────────────────────────
   Apple bento: varied spans, generous radii, one idea per tile.           */
function Tile({ children, className, delay = 0 }) {
  const reduced = useReducedMotion();

  return (
    <Reveal delay={delay} className={className}>
      <motion.div
        whileHover={reduced ? undefined : { y: -5 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="liquid liquid-edge liquid-sheen group relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 elevate-2 transition-shadow duration-500 hover:elevate-4 sm:p-7"
      >
        <span className="sweep" aria-hidden="true" />
        {children}
      </motion.div>
    </Reveal>
  );
}

function TileHead({ icon: Icon, meta }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-surface-2/80 text-accent ring-1 ring-line transition-transform duration-500 group-hover:-translate-y-0.5">
        <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
      </span>
      {meta ? <span className="font-mono text-[11px] text-muted">{meta}</span> : null}
    </div>
  );
}

/* ── Tiles ─────────────────────────────────────────────────────────────── */

function StackTile({ stack }) {
  return (
    <Tile className="lg:col-span-3 lg:row-span-2">
      <TileHead icon={Compass} meta={`${stack.length} groups`} />
      <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.025em] text-ink">One stack, known deeply</h3>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
        React and TypeScript end to end. Every tool here runs in something currently deployed.
      </p>

      <div className="mt-auto space-y-3 pt-6">
        {stack.map((group, i) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: 0.05 * i, ease: EASE }}
          >
            <p className="mb-1.5 text-[11.5px] font-medium tracking-[0.12em] text-muted uppercase">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item.name}
                  className="rounded-lg border border-line bg-surface/60 px-2 py-1 text-[12px] font-medium text-ink/90 transition-colors duration-300"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Tile>
  );
}

function GitHubTile({ stats }) {
  const items = [
    { label: "Contributions", value: stats?.totalContributions ?? "1,480" },
    { label: "Pinned repos", value: stats?.pinned ?? "6" },
    { label: "Primary lang", value: stats?.language ?? "JavaScript" },
  ];

  return (
    <Tile className="lg:col-span-2">
      <TileHead icon={GithubIcon} meta="@sifat" />
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-ink">Open source activity</h3>
      <dl className="mt-auto grid grid-cols-3 gap-3 pt-6">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] tracking-[0.06em] text-muted uppercase">{item.label}</dt>
            <dd className="mt-1 text-[17px] leading-none font-semibold tracking-[-0.02em] text-ink">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Tile>
  );
}

function AvailabilityTile({ profile }) {
  return (
    <Tile className="lg:col-span-1">
      <TileHead icon={Clock} />
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-ink">Availability</h3>
      <p className="mt-2 flex items-center gap-2 text-[13px] leading-relaxed text-muted">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {profile.availability}
      </p>
    </Tile>
  );
}

function FocusTile({ profile }) {
  const areas = profile.focusAreas ?? [];
  return (
    <Tile className="lg:col-span-2">
      <TileHead icon={Sparkles} meta="now" />
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-ink">Current focus</h3>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
        {areas.map((area, i) => (
          <motion.li
            key={area}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: 0.04 * i, ease: EASE }}
            className="rounded-lg border border-line bg-surface/60 px-2.5 py-1 text-[12.5px] font-medium text-ink/90"
          >
            {area}
          </motion.li>
        ))}
      </ul>
    </Tile>
  );
}

function ExperienceTile({ experience }) {
  const latest = experience?.[0];
  if (!latest) return null;

  return (
    <Tile className="lg:col-span-2">
      <TileHead icon={Briefcase} meta={latest.period} />
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-ink">{latest.role}</h3>
      <p className="mt-1 text-[13px] text-accent/90">{latest.company}</p>
      <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{latest.summary}</p>
      <p className="mt-auto pt-5 font-mono text-[11.5px] text-muted">
        +{experience.length - 1} more role{experience.length - 1 === 1 ? "" : "s"}
      </p>
    </Tile>
  );
}

function LocationTile({ profile }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-14%", "14%"]);

  return (
    <Tile className="lg:col-span-2">
      <TileHead icon={MapPin} />
      <div className="relative mt-5 h-28 overflow-hidden rounded-2xl border border-line bg-surface-2/50">
        {/* stylised grid rather than a heavy map provider */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <motion.span ref={ref} style={{ y }} aria-hidden="true" className="absolute inset-0">
          <span className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/22 blur-xl" />
        </motion.span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent ring-4 ring-accent/25">
            <span className="h-1 w-1 rounded-full bg-white" />
          </span>
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-ink">{profile.location}</h3>
      <p className="mt-1 text-[13px] text-muted">Remote-first, happy to overlap EU and US hours.</p>
    </Tile>
  );
}

function CommitTile() {
  return (
    <Tile className="lg:col-span-2">
      <TileHead icon={GitBranch} meta="3f9a1c2" />
      <h3 className="mt-5 font-mono text-[13.5px] leading-relaxed text-ink">feat(api): cursor pagination</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Replaced offset pagination with keyset cursors on the three heaviest endpoints — 60% fewer rows
        scanned at page 100.
      </p>
      <div className="mt-auto flex items-center gap-3 pt-5 font-mono text-[11.5px] text-muted">
        <span className="text-accent">+128</span>
        <span className="text-red-400">−9</span>
        <span className="opacity-50">·</span>
        <span>4 files</span>
      </div>
    </Tile>
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */
export default function Bento() {
  const { profile, stack, experience } = useContent();

  return (
    <section id="bento" className="relative scroll-mt-24 py-28 sm:py-32">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeading
          eyebrow="At a glance"
          title="Everything that matters, in one grid."
          description="Stack, activity, availability and focus — arranged the way a spec sheet would do it."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          <StackTile stack={stack} />
          <GitHubTile />
          <AvailabilityTile profile={profile} />
          <FocusTile profile={profile} />
          <ExperienceTile experience={experience} />
          <LocationTile profile={profile} />
          <CommitTile />
        </div>
      </div>
    </section>
  );
}
