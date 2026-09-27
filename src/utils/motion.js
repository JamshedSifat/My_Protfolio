/**
 * Shared Framer Motion variants.
 * Every animation is GPU friendly (transform / opacity / filter only).
 */

export const EASE = [0.16, 1, 0.3, 1];
export const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: EASE } },
};

export const blurIn = {
  hidden: { opacity: 0, y: 18, filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const viewport = { once: true, amount: 0.25 };
