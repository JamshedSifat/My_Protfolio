import { useEffect, useState } from "react";

/**
 * True while the visitor is scrolling down — used to tuck the
 * navigation out of the way so content owns the viewport.
 */
export function useScrollDirection(threshold = 12) {
  const [direction, setDirection] = useState("up");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const current = window.scrollY;
      const delta = current - last;

      if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? "down" : "up");
        last = current;
      }
      setScrolled(current > 24);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, scrolled };
}
