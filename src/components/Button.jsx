import { forwardRef, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../utils/cn";
import { useReducedMotion } from "../hooks/useMediaQuery";

/**
 * Magnetic wrapper: element leans toward the pointer, then springs home.
 */
export function Magnetic({ children, strength = 0.28, className, as: Tag = "div", ...rest }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.4 });

  const handleMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Comp = motion[Tag] ?? motion.div;

  return (
    <Comp
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-flex", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const VARIANTS = {
  primary:
    "bg-accent text-white shadow-[0_1px_2px_rgba(10,132,255,0.35),0_12px_32px_-14px_rgba(10,132,255,0.85)] hover:shadow-[0_2px_8px_rgba(10,132,255,0.4),0_22px_50px_-18px_rgba(10,132,255,0.95)]",
  secondary:
    "glass text-ink elevate-1 hover:elevate-2 hover:border-[color-mix(in_oklab,var(--ink)_16%,transparent)]",
  ghost: "text-muted hover:text-ink",
  link: "text-accent hover:underline decoration-1 underline-offset-4",
};

const SIZES = {
  sm: "h-9 px-4 text-[13px] rounded-full gap-1.5",
  md: "h-11 px-5 text-[14px] rounded-full gap-2",
  lg: "h-[52px] px-7 text-[15px] rounded-full gap-2.5",
};

/**
 * Button with tactile press, ripple feedback and optional magnetism.
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    magnetic = true,
    icon: Icon,
    iconRight: IconRight,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const reduced = useReducedMotion();
  const hostRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const spawnRipple = (e) => {
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const id = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      { id, size, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2 },
    ]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 620);
  };

  // Render as an anchor when given an href, so links stay real links.
  const isLink = Boolean(props.href);
  const Comp = isLink ? motion.a : motion.button;

  const inner = (
    <Comp
      ref={(node) => {
        hostRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      whileTap={reduced ? undefined : { scale: 0.965 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      onPointerDown={spawnRipple}
      className={cn(
        "group relative isolate inline-flex select-none items-center justify-center overflow-hidden align-middle font-medium tracking-[-0.01em] transition-[box-shadow,color,background-color,border-color,transform] duration-300 ease-out will-change-transform disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)",
        }}
      />
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 rounded-full bg-white/35 dark:bg-white/20"
          initial={{ opacity: 0.55, scale: 0.2 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {Icon ? (
        <Icon className="relative h-[16px] w-[16px] transition-transform duration-300 group-hover:-translate-y-[1px]" strokeWidth={1.9} />
      ) : null}
      <span className="relative">{children}</span>
      {IconRight ? (
        <IconRight className="relative h-[16px] w-[16px] transition-transform duration-300 group-hover:translate-x-[2px]" strokeWidth={1.9} />
      ) : null}
    </Comp>
  );

  if (!magnetic || reduced) return inner;
  return <Magnetic strength={0.22}>{inner}</Magnetic>;
});

export default Button;
