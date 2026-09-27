import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/** Hairline progress rail pinned to the very top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setVisible(v > 0.005));
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      animate={{ opacity: visible ? 1 : 0 }}
      className="fixed top-0 left-0 z-[120] h-[2px] w-full origin-left bg-gradient-to-r from-accent/40 via-accent to-accent/60"
    />
  );
}
