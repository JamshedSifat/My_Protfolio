import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useHasPointer, useReducedMotion } from "../hooks/useMediaQuery";

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

export default function Cursor() {
  const enabled = useHasPointer();
  const reduced = useReducedMotion();
  const active = enabled && !reduced;

  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.5 });
  const dotX = useSpring(x, { stiffness: 900, damping: 40, mass: 0.25 });
  const dotY = useSpring(y, { stiffness: 900, damping: 40, mass: 0.25 });

  useEffect(() => {
    if (!active) return undefined;
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      setHovering(Boolean(target));
      setLabel(target?.getAttribute("data-cursor-label") ?? "");
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [active, visible, x, y]);

  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[999] hidden md:block">
      {/* soft glow */}
      <motion.div
        className="absolute h-40 w-40 rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(10,132,255,0.16) 0%, rgba(10,132,255,0.06) 40%, transparent 70%)",
          opacity: visible ? 1 : 0,
        }}
        animate={{ scale: pressed ? 0.8 : hovering ? 1.35 : 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
      />

      {/* morphing ring */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: hovering ? "rgba(10,132,255,0.55)" : "color-mix(in oklab, var(--ink) 22%, transparent)",
          backgroundColor: hovering ? "rgba(10,132,255,0.08)" : "transparent",
          opacity: visible ? 1 : 0,
        }}
        animate={{
          width: hovering ? (label ? 76 : 46) : 30,
          height: hovering ? (label ? 76 : 46) : 30,
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        {label ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-medium tracking-[0.14em] text-accent uppercase"
          >
            {label}
          </motion.span>
        ) : null}
      </motion.div>

      {/* precise dot */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%", opacity: visible ? 1 : 0 }}
        animate={{ scale: pressed ? 2.4 : hovering ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      />
    </div>
  );
}
