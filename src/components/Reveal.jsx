import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { EASE, blurIn, fadeUp, stagger } from "../utils/motion";
import { useReducedMotion } from "../hooks/useMediaQuery";

/** Generic reveal on scroll. */
export function Reveal({ children, className, delay = 0, y = 26, once = true, amount = 0.25 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word editorial reveal for headlines. */
export function TextReveal({ text, className, wordClassName, delay = 0, as: Tag = "h2" }) {
  const reduced = useReducedMotion();
  const words = String(text).split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      <motion.span
        className="inline"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger(0.055, delay)}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className={cn("inline-block", wordClassName)}
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration: 1, ease: EASE } },
              }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Section eyebrow + headline + description, used across every section. */
export function SectionHeading({ eyebrow, title, description, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col", centered ? "items-center text-center" : "items-start", className)}>
      {eyebrow ? (
        <Reveal>
          <span className="inline-flex items-center gap-2.5 text-[13px] font-medium tracking-[0.18em] text-accent uppercase">
            <span className="h-[5px] w-[5px] rounded-full bg-accent" />
            {eyebrow}
          </span>
        </Reveal>
      ) : null}

      <TextReveal
        as="h2"
        text={title}
        className={cn(
          "mt-5 max-w-4xl text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-semibold text-gradient",
          centered && "mx-auto",
        )}
      />

      {description ? (
        <motion.p
          variants={blurIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.12 }}
          className={cn("mt-5 max-w-2xl text-[17px] leading-relaxed text-muted", centered && "mx-auto")}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}

export { fadeUp, blurIn, stagger, EASE };
