/**
 * Ambient lighting: soft moving light, layered blur and a vignette.
 * Pure CSS transforms — no canvas, no particles, GPU friendly.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-bg" />

      {/* top light */}
      <div
        className="absolute -top-[26vh] left-1/2 h-[70vh] w-[110vw] -translate-x-1/2 animate-drift rounded-[50%] opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-accent) 16%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* secondary light */}
      <div
        className="absolute top-[42vh] -left-[16vw] h-[55vh] w-[60vw] animate-breathe rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--color-accent) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.85]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 20%, transparent 75%)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, transparent 40%, color-mix(in oklab, var(--bg) 92%, black 8%) 100%)",
        }}
      />
    </div>
  );
}
