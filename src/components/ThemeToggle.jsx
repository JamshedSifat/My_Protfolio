import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} appearance`}
      aria-pressed={isDark}
      className={cn(
        "group relative flex h-9 w-[62px] items-center rounded-full border border-line bg-surface-2/70 px-[3px] backdrop-blur-xl transition-colors duration-500 hover:border-line-strong",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span className="absolute -top-6 left-1/2 h-12 w-24 -translate-x-1/2 rounded-full bg-accent/20 blur-xl" />
      </span>

      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className={cn(
          "relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface elevate-1",
          isDark ? "ml-auto" : "mr-auto",
        )}
      >
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex"
        >
          {isDark ? (
            <Moon className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
          ) : (
            <Sun className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
          )}
        </motion.span>
      </motion.span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] font-medium tracking-widest text-muted transition-opacity duration-300",
          isDark ? "left-3 opacity-70" : "right-3 opacity-70",
        )}
      >
        {isDark ? "OFF" : "ON"}
      </span>
    </button>
  );
}
