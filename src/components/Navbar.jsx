import { useMemo, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Download, Menu } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useActiveSection } from "../hooks/useActiveSection";
import { useScrollDirection } from "../hooks/useScrollDirection";
import { useSmoothScroll } from "../context/SmoothScrollContext";
import { downloadResume } from "../utils/resume";
import { cn } from "../utils/cn";
import { EASE } from "../utils/motion";
import { Button } from "./Button";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { nav, profile } = useContent();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { direction, scrolled } = useScrollDirection(14);
  const { scrollTo } = useSmoothScroll();
  // Memoised so useActiveSection's effect does not re-run every render.
  const sectionIds = useMemo(() => nav.map((n) => n.id), [nav]);
  const active = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(direction === "down" && latest > 220 && latest > prev);
  });

  const go = (id) => {
    setOpen(false);
    if (id === "resume") {
      downloadResume(profile);
      return;
    }
    window.requestAnimationFrame(() => scrollTo(`#${id}`));
  };

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
          go("about");
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[130] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed top-0 right-0 left-0 z-[100] px-4 pt-3 sm:pt-4"
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          {/* Wordmark */}
          <motion.button
            type="button"
            onClick={() => go("home")}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5 transition-colors"
            aria-label="Back to top"
          >
            <span className="liquid liquid-edge flex h-8 w-8 items-center justify-center rounded-[10px] transition-transform duration-500 group-hover:scale-105">
              <span className="text-[13px] font-semibold text-accent">S</span>
            </span>
            <span className="hidden text-[14px] font-medium tracking-[-0.01em] text-ink sm:block">
              {profile.name}
              <span className="ml-2 hidden text-[12px] text-muted lg:inline">Full Stack</span>
            </span>
          </motion.button>

          {/* Floating glass pill */}
          <nav
            aria-label="Primary"
            className={cn(
              "liquid liquid-edge liquid-sheen absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1 lg:flex",
              scrolled ? "elevate-3" : "elevate-2",
            )}
          >
            {nav.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-[7px] text-[13px] font-medium transition-colors duration-300",
                    isActive ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-surface-2/90 elevate-1"
                    />
                  ) : null}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              className="hidden lg:inline-flex"
              onClick={() => downloadResume(profile)}
            >
              Resume
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="liquid liquid-edge flex h-9 w-9 items-center justify-center rounded-full text-ink transition-transform active:scale-95 lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={open} onClose={() => setOpen(false)} active={active} onNavigate={go} />
    </>
  );
}
