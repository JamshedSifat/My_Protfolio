import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Upload, X } from "lucide-react";
import { cn } from "../utils/cn";

/* ── Shell pieces ──────────────────────────────────────────────────────── */

export function Card({ title, description, actions, children, className }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface/60 p-6 backdrop-blur-xl", className)}>
      {title ? (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
            {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Button({ variant = "primary", size = "md", loading, icon: Icon, className, children, ...props }) {
  const styles = {
    primary: "bg-accent text-white hover:brightness-110",
    secondary: "border border-line bg-surface-2/60 text-ink hover:border-line-strong",
    danger: "border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/16",
    ghost: "text-muted hover:text-ink",
  };
  const sizes = { sm: "h-8 px-3 text-[12.5px]", md: "h-10 px-4 text-[13.5px]", lg: "h-11 px-5 text-[14px]" };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-55",
        styles[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
      ) : Icon ? (
        <Icon className="h-3.5 w-3.5" strokeWidth={1.95} />
      ) : null}
      {children}
    </motion.button>
  );
}

/* ── Inputs ────────────────────────────────────────────────────────────── */

export function Field({ label, value, onChange, type = "text", placeholder, hint, rows, monospace }) {
  const id = useId();
  const shared = cn(
    "w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-all duration-200",
    "placeholder:text-muted/60 hover:border-line-strong focus:border-accent/70 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.15)]",
    monospace && "font-mono text-[12.5px]",
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-medium tracking-[0.02em] text-muted">
        {label}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(shared, "resize-y leading-relaxed")} />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
      {hint ? <p className="text-[11.5px] text-muted/80">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        {hint ? <p className="mt-0.5 text-[11.5px] text-muted">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm", checked ? "right-[3px]" : "left-[3px]")}
        />
      </button>
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-medium tracking-[0.02em] text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-all duration-200 hover:border-line-strong focus:border-accent/70 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.15)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Toast ─────────────────────────────────────────────────────────────── */

export function Toast({ message, tone = "ok" }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-[160] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] font-medium backdrop-blur-xl elevate-3",
        tone === "ok"
          ? "border-accent/30 bg-accent/12 text-ink"
          : "border-red-500/30 bg-red-500/12 text-red-500",
      )}
    >
      {tone === "ok" ? (
        <Check className="h-4 w-4 text-accent" strokeWidth={2.4} />
      ) : (
        <X className="h-4 w-4" strokeWidth={2.4} />
      )}
      {message}
    </motion.div>
  );
}

/* ── Uploads ───────────────────────────────────────────────────────────── */

export function DropZone({ label, accept = "image/*", onFile, current, busy, error, hint }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[12px] font-medium tracking-[0.02em] text-muted">
        {label}
      </label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={cn(
          "flex items-center gap-4 rounded-xl border border-dashed p-4 transition-colors duration-200",
          error ? "border-red-500/50 bg-red-500/5" : "border-line-strong bg-bg/40 hover:border-accent/50",
        )}
      >
        {current ? (
          <img src={current} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-line" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-2/70 text-muted">
            <Upload className="h-5 w-5" strokeWidth={1.7} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-ink">{current ? "Uploaded" : "Drop a file or browse"}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-muted">{error || hint || accept}</p>
        </div>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : (
          <span className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted">Browse</span>
        )}
      </div>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium tracking-[0.04em] text-muted uppercase">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-accent" strokeWidth={1.9} /> : null}
      </div>
      <p className="mt-3 text-[32px] leading-none font-semibold tracking-[-0.03em] text-ink">{value}</p>
      {delta ? <p className="mt-2 text-[12px] text-muted">{delta}</p> : null}
    </div>
  );
}
