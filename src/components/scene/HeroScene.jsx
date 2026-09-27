import { Canvas } from "@react-three/fiber";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

// Split into its own chunk so the 3D runtime never blocks first paint.
const Workstation = lazy(() => import("./Workstation"));

const Placeholder = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div
      className="h-[52%] w-[78%] rounded-[26px] opacity-60 blur-2xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, color-mix(in oklab, var(--color-accent) 20%, transparent), transparent 72%)",
      }}
    />
  </div>
);

/**
 * Performance notes:
 * - Mounts on browser idle, and only when the hero is actually on screen.
 * - `frameloop` flips to "never" once the hero leaves the viewport, so the
 *   render loop costs nothing while you read the rest of the page.
 * - DPR is capped and the scene is low-poly with no shadow maps or
 *   environment probes.
 */
export default function HeroScene() {
  // The hero remains stacked until Tailwind's `lg` breakpoint, so tablets
  // use the compact camera too — otherwise the desk can crop at 769–1023px.
  const isSmall = useMediaQuery("(max-width: 1023px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Defer the WebGL context until the main thread is idle.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setMounted(true));
    return () => cancel(id);
  }, []);

  // Only render while visible.
  useEffect(() => {
    const node = host.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full">
      {mounted && visible ? (
        <Suspense fallback={<Placeholder />}>
          <Canvas
            key={isSmall ? "sm" : "lg"}
            dpr={isSmall ? [1, 1.25] : [1, 1.6]}
            frameloop={reduced ? "demand" : visible ? "always" : "never"}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            camera={{
              position: isSmall ? [0, 0.2, 8.15] : [0, 0.3, 7.6],
              fov: isSmall ? 43 : 40,
            }}
            style={{ pointerEvents: "none" }}
          >
            <Workstation reduced={reduced} compact={isSmall} />
          </Canvas>
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
