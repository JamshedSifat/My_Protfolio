import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";

const SmoothScrollContext = createContext({ lenis: null, scrollTo: () => {}, stop: () => {}, start: () => {} });

export function SmoothScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  const frame = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      lerp: 0.1,
      smoothWheel: true,
    });

    const raf = (time) => {
      instance.raf(time);
      frame.current = requestAnimationFrame(raf);
    };
    frame.current = requestAnimationFrame(raf);
    setLenis(instance);

    return () => {
      cancelAnimationFrame(frame.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const scrollTo = useCallback(
    (target, options = {}) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: -90, duration: 1.35, ...options });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [lenis],
  );

  const stop = useCallback(() => lenis?.stop(), [lenis]);
  const start = useCallback(() => lenis?.start(), [lenis]);

  const value = useMemo(() => ({ lenis, scrollTo, stop, start }), [lenis, scrollTo, stop, start]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside <SmoothScrollProvider>");
  return ctx;
}
