import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Cpu, Layers, Rocket } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { SectionHeading, Reveal, EASE } from "../components/Reveal";
import { useReducedMotion } from "../hooks/useMediaQuery";

const icons = [Layers, Cpu, Rocket];

function Portrait({ src, name, role }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 140, damping: 18 });
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 140, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ["20%", "80%"]);

  return (
    <motion.figure
      ref={ref}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      className="liquid liquid-edge group relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[26px] will-change-transform"
    >
      <div className="relative overflow-hidden rounded-[26px] border border-line bg-surface-2 elevate-3">
        <img
          src={src}
          alt={`Black and white portrait of ${name}, ${role}`}
          width={840}
          height={1100}
          loading="lazy"
          decoding="async"
          className="aspect-[4/5] w-full scale-[1.02] object-cover grayscale contrast-[1.06] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />
        {/* light sweep */}
        <motion.span
          aria-hidden="true"
          style={{ left: glareX }}
          className="pointer-events-none absolute top-0 h-full w-[45%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/14 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        />
        <figcaption className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
          <span className="text-[13px] font-medium tracking-[-0.01em] drop-shadow">{name}</span>
          <span className="text-[11px] tracking-[0.16em] uppercase opacity-80">{role}</span>
        </figcaption>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, color-mix(in oklab, var(--color-accent) 12%, transparent), transparent 70%)",
        }}
      />
    </motion.figure>
  );
}

const PORTRAIT_FALLBACK =
  "https://images.pexels.com/photos/29082534/pexels-photo-29082534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=840";

export default function About() {
  const { profile, capabilities } = useContent();
  const portrait = profile.portrait || PORTRAIT_FALLBACK;
  const focusAreas = profile.focusAreas ?? [];

  return (
    <section id="about" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeading
          eyebrow="About"
          title="A developer who ships the whole stack."
          description="I care about the parts users never see as much as the parts they touch — clean data models, predictable APIs and interfaces that feel effortless."
        />

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <Portrait src={portrait} name={profile.name} role={profile.role} />
          </Reveal>

          <div className="flex flex-col">
            <Reveal>
              <p className="text-[19px] leading-[1.7] text-ink/90 dark:text-white/90">
                {profile.aboutIntro}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 text-[17px] leading-[1.75] text-muted">{profile.aboutBody}</p>
            </Reveal>

            <Reveal delay={0.14} className="mt-9">
              <ul className="flex flex-wrap gap-2.5" aria-label="Core focus areas">
                {focusAreas.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.05 * i }}
                    className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-300 ${
                      i === focusAreas.length - 1
                        ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                        : "bg-surface-2/80 text-ink ring-1 ring-line hover:ring-line-strong"
                    }`}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Premium cards */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((card, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={card.title} delay={0.06 * i}>
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="liquid liquid-edge liquid-sheen group relative h-full overflow-hidden rounded-[22px] p-7 elevate-2 transition-shadow duration-500 hover:elevate-4"
                >
                  {/* moving light reflection */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 26%, transparent), transparent 70%)",
                    }}
                  />
                  
                  <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-surface-2/90 text-accent ring-1 ring-line transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>

                  <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em] text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{card.body}</p>

                  <div className="mt-7 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-[12px] tracking-[0.04em] text-muted">{card.meta}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
