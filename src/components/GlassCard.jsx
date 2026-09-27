import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { useReducedMotion } from "../hooks/useMediaQuery";

/**
 * The single glass surface used across the site.
 *
 * `tier` controls the depth:
 *   flat  — dense, for small chips
 *   card  — the default surface
 *   float — lifted, for overlays and featured blocks
 *
 * Every tier gets a soft edge highlight, a top sheen and a hover reflection
 * sweep, which is what makes it read as glass rather than a grey box.
 */
export default function GlassCard({
  as: Tag = "div",
  tier = "card",
  interactive = true,
  sweep = true,
  className,
  children,
  ...props
}) {
  const reduced = useReducedMotion();
  const node = useRef(null);

  const tiers = {
    flat: "liquid bg-surface/45 backdrop-blur-[16px]",
    card: "liquid elevate-2 bg-surface/40",
    float: "liquid elevate-3 bg-surface/55",
  };

  const Motion = motion[Tag] ?? motion.div;

  return (
    <Motion
      ref={node}
      className={cn(
        "liquid-edge liquid-sheen group relative overflow-hidden rounded-[22px]",
        tiers[tier],
        interactive && "transition-shadow duration-500",
        className,
      )}
      {...(interactive && !reduced ? { whileHover: { y: -4 } } : {})}
      {...(interactive && !reduced ? { transition: { type: "spring", stiffness: 260, damping: 22 } } : {})}
      {...props}
    >
      {sweep ? <span className="sweep" aria-hidden="true" /> : null}
      {children}
    </Motion>
  );
}

/** Pointer-tracked glow that follows the cursor across the glass. */
export function GlassSpotlight({ className, strength = 0.5 }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  if (reduced) return null;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        className,
      )}
      style={{
        background: "var(--spotlight, none)",
        ["--spotlight"]: `radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--color-accent) ${strength * 22}%, transparent), transparent 65%)`,
      }}
      onPointerMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    />
  );
}
