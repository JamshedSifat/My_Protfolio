import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, MapPin } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useSmoothScroll } from "../context/SmoothScrollContext";
import { downloadResume } from "../utils/resume";
import { Button } from "../components/Button";
import ErrorBoundary from "../components/ErrorBoundary";
import { EASE, stagger, blurIn } from "../components/Reveal";
import { useReducedMotion } from "../hooks/useMediaQuery";

const HeroScene = lazy(() => import("../components/scene/HeroScene"));

export default function Hero({ ready = true }) {
  const { profile, stats } = useContent();
  const { scrollTo } = useSmoothScroll();
  const reduced = useReducedMotion();

  return (
    <section id="home" className="relative isolate min-h-[100svh] w-full overflow-hidden pt-28 pb-16">
      {/* moving light behind the sculpture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] right-[-8%] h-[70vh] w-[70vw] animate-breathe rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--color-accent) 22%, transparent) 0%, transparent 62%)",
        }}
      />

      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
        {/* ── Left ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          variants={stagger(0.09, 0.05)}
          className="relative z-10 flex flex-col"
        >
          <motion.div variants={blurIn}>
            <span className="liquid liquid-edge inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium tracking-[-0.01em] text-ink">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {profile.availability}
            </span>
          </motion.div>

          <motion.h1
            variants={blurIn}
            className="mt-7 text-[clamp(3.2rem,9vw,6rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-gradient"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            variants={blurIn}
            className="mt-3 text-[clamp(1.4rem,3vw,2rem)] leading-tight font-medium tracking-[-0.03em] text-ink/85 dark:text-white/85"
          >
            {profile.role}
          </motion.p>

          <motion.p
            variants={blurIn}
            className="mt-6 max-w-[30rem] text-[18px] leading-[1.65] text-muted"
          >
            {profile.statement}
          </motion.p>

          <motion.div variants={blurIn} className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              iconRight={ArrowUpRight}
              onClick={() => scrollTo("#work")}
              data-cursor-label="View"
            >
              View Projects
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={Download}
              onClick={() => downloadResume(profile)}
            >
              Download Resume
            </Button>
          </motion.div>

          <motion.dl variants={blurIn} className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[24px] leading-none font-semibold tracking-[-0.03em] text-ink">
                  {s.value}
                </dt>
                <dd className="mt-2 text-[12.5px] leading-snug text-muted">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ── Right: responsive low-poly developer workstation ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, filter: "blur(18px)" }}
          animate={ready ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.5, ease: EASE, delay: 0.15 }}
          className="relative z-0 h-[46vh] min-h-[320px] w-full sm:h-[54vh] lg:h-[76vh]"
        >
          <div className="absolute inset-0">
            {/* layered blur frame */}
            <div className="absolute inset-[6%] rounded-[46px] bg-surface/20 backdrop-blur-[2px]" />
            <div
              aria-hidden="true"
              className="absolute inset-[10%] rounded-full opacity-70 blur-[70px]"
              style={{
                background:
                  "radial-gradient(circle at 60% 40%, color-mix(in oklab, var(--color-accent) 18%, transparent), transparent 70%)",
              }}
            />
            <ErrorBoundary
              silent
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-[58%] w-[74%] animate-breathe rounded-[42px] bg-gradient-to-br from-accent/20 via-transparent to-accent/10 blur-2xl" />
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="h-[58%] w-[74%] animate-breathe rounded-[42px] bg-gradient-to-br from-accent/20 via-transparent to-accent/10 blur-2xl" />
                  </div>
                }
              >
                <HeroScene />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* soft floor reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[6%] left-1/2 h-[90px] w-[62%] -translate-x-1/2 rounded-[50%] blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-accent) 14%, transparent) 0%, transparent 70%)",
            }}
          />

          {/* floating status card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.1, duration: 1, ease: EASE }}
            className="liquid liquid-edge liquid-sheen absolute bottom-2 left-0 hidden w-[236px] overflow-hidden rounded-2xl p-4 elevate-3 lg:block"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              <p className="text-[12px] font-medium text-ink">{profile.location}</p>
            </div>
            <div className="mt-3 flex gap-1">
              {["React", "TypeScript", "PostgreSQL", "AI"].map((t) => (
                <span key={t} className="rounded-md bg-surface-2/80 px-1.5 py-1 text-[10px] text-muted">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll cue */}
      {!reduced ? (
        <motion.button
          type="button"
          onClick={() => scrollTo("#about")}
          aria-label="Scroll to about section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-ink lg:flex"
        >
          <span className="text-[10.5px] font-medium tracking-[0.24em] uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.8} />
          </motion.span>
        </motion.button>
      ) : null}

    </section>
  );
}
