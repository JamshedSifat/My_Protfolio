import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { baseContent } from "../data/site";
import { EASE } from "../utils/motion";

/**
 * Luxury boot sequence: wordmark fade → hairline progress → blur dissolve.
 * No spinner, ever.
 */
export default function Preloader({ duration = 1000, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  // Hold the viewport still until the reveal is complete.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out curve so the line glides into the end
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!finished.current) {
        finished.current = true;
        setDone(true);
        window.setTimeout(() => onComplete?.(), 620);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-bg"
          exit={{ opacity: 0, filter: "blur(22px)", scale: 1.04 }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <div className="flex w-[min(78vw,320px)] flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.85, ease: EASE }}
              className="flex flex-col items-center gap-3"
            >
              <div className="liquid liquid-edge flex h-11 w-11 items-center justify-center rounded-[14px]">
                <span className="text-[17px] font-semibold tracking-tight text-accent">S</span>
              </div>
              <p className="text-[13px] font-medium tracking-[0.32em] text-muted uppercase">
                {baseContent.profile.name}
              </p>
            </motion.div>

            <div className="h-[2px] w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-accent"
                style={{ width: `${progress * 100}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
