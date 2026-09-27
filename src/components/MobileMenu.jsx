import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./icons";
import { useContent } from "../context/ContentContext";
import { EASE } from "../utils/motion";
import { Button, Magnetic } from "./Button";
import ThemeToggle from "./ThemeToggle";

export default function MobileMenu({ open, onClose, active, onNavigate }) {
  const { nav, profile } = useContent();
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] lg:hidden"
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-0 h-full w-full cursor-default bg-bg/60 backdrop-blur-[32px]"
          />

          <motion.div
            variants={{
              hidden: { opacity: 0, y: -18, filter: "blur(14px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.55, ease: EASE }}
            className="relative flex h-full flex-col px-6 pt-28 pb-10"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {nav.map((item, i) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    show: { opacity: 1, y: 0, transition: { delay: 0.06 + i * 0.055, duration: 0.7, ease: EASE } },
                  }}
                  className="group flex items-baseline justify-between border-b border-line py-4 text-left"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] text-muted">{`0${i + 1}`}</span>
                    <span
                      className={`text-[30px] leading-none font-semibold tracking-[-0.03em] transition-colors ${
                        active === item.id ? "text-accent" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              ))}
            </nav>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6, ease: EASE } } }}
              className="mt-auto space-y-5"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={Download}
                onClick={() => onNavigate("resume")}
              >
                Download Resume
              </Button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[
                    { href: profile.github, Icon: GithubIcon, label: "GitHub" },
                    { href: profile.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
                    { href: `mailto:${profile.email}`, Icon: Mail, label: "Email" },
                  ].map(({ href, Icon, label }) => (
                    <Magnetic key={label} strength={0.2}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={label}
                        className="liquid liquid-edge flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
                      >
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </a>
                    </Magnetic>
                  ))}
                </div>
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
