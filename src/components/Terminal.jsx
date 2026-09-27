import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import { EASE } from "../utils/motion";
import { useReducedMotion } from "../hooks/useMediaQuery";

/**
 * Command script. Each step types its command character by character, then
 * flushes real output lines one at a time — the cadence of an actual shell,
 * not a fake instant dump.
 */
const SCRIPT = [
  {
    cmd: "git commit -m 'Production Ready'",
    out: [
      { t: "[main 3f9a1c2] Production Ready", c: "#7ee787" },
      { t: " 4 files changed, 128 insertions(+), 9 deletions(-)", c: "#8b949e" },
      { t: " create mode 100644 src/sections/Projects.jsx", c: "#6e7681" },
    ],
  },
  {
    cmd: "npm run dev",
    out: [
      { t: "> portfolio@1.0.0 dev", c: "#8b949e" },
      { t: "> vite --host", c: "#8b949e" },
      { t: "", c: "#8b949e" },
      { t: "  VITE v7.3.2  ready in 214 ms", c: "#7ee787" },
      { t: "  ➜  Local:   http://localhost:5173/", c: "#79c0ff" },
      { t: "  ➜  Network: http://192.168.1.14:5173/", c: "#79c0ff" },
    ],
  },
  {
    cmd: "docker compose up -d",
    out: [
      { t: "[+] Running 3/3", c: "#8b949e" },
      { t: " ✔ Container portfolio-db    Started", c: "#2496ed" },
      { t: " ✔ Container portfolio-api   Started", c: "#2496ed" },
      { t: " ✔ Container portfolio-web   Started", c: "#2496ed" },
    ],
  },
  {
    cmd: "npx tsx backend/src/server.ts",
    out: [
      { t: "Loading strict environment configuration...", c: "#8b949e" },
      { t: "PostgreSQL connection healthy", c: "#7ee787" },
      { t: "JWT rotation and Cloudinary routes ready", c: "#8b949e" },
      { t: "TypeScript portfolio API listening on :8000", c: "#79c0ff" },
    ],
  },
  {
    cmd: "git push origin main",
    out: [
      { t: "Enumerating objects: 27, done.", c: "#8b949e" },
      { t: "Counting objects: 100% (27/27), done.", c: "#8b949e" },
      { t: "Compressing objects: 100% (16/16), done.", c: "#8b949e" },
      { t: "To github.com:sifat/portfolio.git", c: "#8b949e" },
      { t: "   9ad3f71..3f9a1c2  main -> main", c: "#7ee787" },
    ],
  },
];

const PHASE = { CMD: "cmd", OUT: "out", DONE: "done" };

export default function Terminal({ className }) {
  const reduced = useReducedMotion();
  const bodyRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  const [outIndex, setOutIndex] = useState(0);

  const entry = SCRIPT[step % SCRIPT.length];
  const phase = useMemo(() => {
    if (chars < entry.cmd.length) return PHASE.CMD;
    if (outIndex < entry.out.length) return PHASE.OUT;
    return PHASE.DONE;
  }, [chars, entry, outIndex]);

  // Drive the script on a real clock.
  useEffect(() => {
    if (reduced) return undefined;

    const tick = (cb, ms) => window.setTimeout(cb, ms);

    if (phase === PHASE.CMD) {
      const id = tick(() => setChars((c) => c + 1), 58);
      return () => window.clearTimeout(id);
    }

    if (phase === PHASE.OUT) {
      const id = tick(() => setOutIndex((i) => i + 1), 190);
      return () => window.clearTimeout(id);
    }

    const id = tick(() => {
      setLines((prev) => [
        ...prev,
        { cmd: entry.cmd, out: entry.out },
      ]);
      setStep((s) => s + 1);
      setChars(0);
      setOutIndex(0);
    }, 900);
    return () => window.clearTimeout(id);
  }, [phase, chars, outIndex, entry, reduced]);

  // Smooth auto-scroll, like a real shell following its output.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    // scrollTo isn't universal on scroll containers — fall back to scrollTop.
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines, chars, outIndex, reduced]);

  if (reduced) {
    return (
      <StaticTerminal className={className} />
    );
  }

  return (
    <div
      className={`liquid liquid-edge liquid-sheen relative overflow-hidden rounded-[20px] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-3">
        <TerminalIcon className="h-3.5 w-3.5 text-accent" strokeWidth={1.9} />
        <span className="font-mono text-[12px] text-muted">sifat@portfolio: ~/portfolio</span>
        <span className="ml-auto flex gap-1.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
      </div>

      <div
        ref={bodyRef}
        role="log"
        aria-label="Terminal session output"
        className="max-h-[340px] min-h-[300px] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75]"
      >
        {lines.map((l, i) => (
          <div key={i} className="mb-2">
            <p className="flex flex-wrap gap-2">
              <span className="text-accent">➜</span>
              <span className="text-ink">{l.cmd}</span>
            </p>
            {l.out.map((o, j) => (
              <p key={j} style={{ color: o.c }} className="pl-5 whitespace-pre-wrap">
                {o.t}
              </p>
            ))}
          </div>
        ))}

        {/* active line */}
        <div>
          <p className="flex flex-wrap gap-2">
            <span className="text-accent">➜</span>
            <span className="text-ink">
              {entry.cmd.slice(0, chars)}
              <span className="caret ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-accent" />
            </span>
          </p>
          {entry.out.slice(0, outIndex).map((o, j) => (
            <motion.p
              key={j}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ color: o.c }}
              className="pl-5 whitespace-pre-wrap"
            >
              {o.t}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Fallback that still shows the full script when motion is reduced. */
function StaticTerminal({ className }) {
  return (
    <div
      className={`liquid liquid-edge relative overflow-hidden rounded-[20px] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-3">
        <TerminalIcon className="h-3.5 w-3.5 text-accent" strokeWidth={1.9} />
        <span className="font-mono text-[12px] text-muted">sifat@portfolio: ~/portfolio</span>
      </div>
      <div className="max-h-[340px] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75]">
        {SCRIPT.map((s, i) => (
          <div key={i} className="mb-2">
            <p className="flex gap-2">
              <span className="text-accent">➜</span>
              <span className="text-ink">{s.cmd}</span>
            </p>
            {s.out.map((o, j) => (
              <p key={j} style={{ color: o.c }} className="pl-5 whitespace-pre-wrap">
                {o.t}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
