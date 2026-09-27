import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  PANELS,
  buildIconAtlas,
  drawCodePanel,
  drawGitPanel,
  drawScrollPanel,
} from "./screenTextures";

/* ── Palette ───────────────────────────────────────────────────────────── */
const ALUMINIUM = "#d3d7dd";
const ALUMINIUM_DARK = "#b9bec6";
const GRAPHITE = "#2c3038";
const INK = "#1a1d23";
const ACCENT = "#0a84ff";

/** Thin aluminium slab. Shared material keeps draw setup cheap. */
function Slab({ position, rotation, args, color = ALUMINIUM, metal = 0.55, rough = 0.42 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={metal} roughness={rough} />
    </mesh>
  );
}

/* ── Monitor: 3×2 tiled developer workspace ───────────────────────────── */
function Display({ panels }) {
  const group = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    // Slow breathing of the whole workspace.
    const t = clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 0.55) * 0.012;
  });

  return (
    <group position={[0, 0.36, 0]}>
      {/* enclosure */}
      <Slab position={[0, 0, 0]} args={[3.34, 2.06, 0.11]} color={ALUMINIUM} metal={0.7} rough={0.34} />
      {/* bezel */}
      <Slab position={[0, 0, 0.055]} args={[3.2, 1.92, 0.02]} color={INK} metal={0.2} rough={0.6} />

      {/* the workspace itself — six panels in a 3×2 grid */}
      <group ref={group} position={[0, 0, 0.074]}>
        {panels.map((p, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <mesh
              key={p.key}
              position={[-1.02 + col * 1.02, 0.45 - row * 0.9, 0.001]}
              scale={[0.98, 0.84, 1]}
            >
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={p.texture} toneMapped={false} />
            </mesh>
          );
        })}
      </group>

      {/* glass glare over the workspace */}
      <mesh position={[0, 0, 0.086]}>
        <planeGeometry args={[3.06, 1.78]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.045}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Apple-style chin */}
      <Slab position={[0, -1.09, 0.03]} args={[3.34, 0.16, 0.06]} color={ALUMINIUM_DARK} metal={0.65} rough={0.4} />

      {/* stand */}
      <Slab position={[0, -1.28, -0.05]} args={[0.3, 0.36, 0.14]} color={ALUMINIUM_DARK} metal={0.7} rough={0.36} />
      <Slab position={[0, -1.5, -0.05]} args={[1.5, 0.07, 0.6]} color={ALUMINIUM} metal={0.72} rough={0.34} />
    </group>
  );
}

/* ── Compact desktop PC: restrained, practical, no gamer lighting ────── */
function DesktopPC() {
  return (
    <group position={[2.15, -0.84, 0.18]} rotation={[0, -0.14, 0]}>
      {/* A normal compact aluminium tower with a removable side panel. */}
      <Slab position={[0, 0, 0]} args={[0.78, 1.34, 0.86]} color={GRAPHITE} metal={0.42} rough={0.48} />
      <Slab position={[-0.397, 0, 0]} args={[0.012, 1.18, 0.72]} color="#424852" metal={0.5} rough={0.42} />

      {/* Front fascia. */}
      <Slab position={[0, 0, 0.438]} args={[0.68, 1.2, 0.018]} color="#20242b" metal={0.28} rough={0.62} />

      {/* Power button and a single quiet status light. */}
      <mesh position={[0.22, 0.43, 0.452]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.018, 18]} />
        <meshStandardMaterial color={ALUMINIUM_DARK} metalness={0.65} roughness={0.34} />
      </mesh>
      <mesh position={[0.22, 0.35, 0.454]}>
        <sphereGeometry args={[0.014, 10, 8]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>

      {/* Two simple intake slots suggest cooling without visual noise. */}
      <Slab position={[0, -0.25, 0.452]} args={[0.43, 0.025, 0.012]} color="#080b10" metal={0.1} rough={0.9} />
      <Slab position={[0, -0.33, 0.452]} args={[0.43, 0.025, 0.012]} color="#080b10" metal={0.1} rough={0.9} />

      {/* Small rubber feet keep it grounded on the desk. */}
      <Slab position={[-0.24, -0.7, 0]} args={[0.16, 0.06, 0.58]} color="#111318" metal={0} rough={0.9} />
      <Slab position={[0.24, -0.7, 0]} args={[0.16, 0.06, 0.58]} color="#111318" metal={0} rough={0.9} />
    </group>
  );
}

/* ── Familiar desktop input devices keep the workstation believable ──── */
function KeyboardAndMouse() {
  return (
    <group position={[0, -1.49, 1.03]} rotation={[0, 0.02, 0]}>
      <Slab position={[-0.2, 0, 0]} args={[1.72, 0.055, 0.54]} color={ALUMINIUM_DARK} metal={0.62} rough={0.4} />
      <Slab position={[-0.2, 0.032, -0.015]} args={[1.56, 0.012, 0.4]} color="#343943" metal={0.18} rough={0.74} />

      {/* Key rows are broad insets, not dozens of individual draw calls. */}
      <Slab position={[-0.2, 0.041, -0.12]} args={[1.4, 0.008, 0.035]} color="#171a20" metal={0.08} rough={0.82} />
      <Slab position={[-0.2, 0.041, -0.02]} args={[1.4, 0.008, 0.035]} color="#171a20" metal={0.08} rough={0.82} />
      <Slab position={[-0.2, 0.041, 0.08]} args={[1.4, 0.008, 0.035]} color="#171a20" metal={0.08} rough={0.82} />

      <mesh position={[1.08, 0.035, 0.03]} scale={[0.22, 0.055, 0.32]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color={ALUMINIUM} metalness={0.58} roughness={0.38} />
      </mesh>
      <Slab position={[1.08, 0.092, -0.045]} args={[0.012, 0.018, 0.13]} color="#727984" metal={0.4} rough={0.55} />
    </group>
  );
}

/* ── Floating glyphs: seven icons, one shared atlas ───────────────────── */
const ICONS = [
  { key: "react", pos: [-2.3, 1.62, 0.5], size: 0.5, phase: 0 },
  { key: "typescript", pos: [2.42, 1.5, -0.3], size: 0.46, phase: 1.1 },
  { key: "postgres", pos: [-2.06, -0.4, 1.34], size: 0.42, phase: 2.2 },
  { key: "git", pos: [2.28, -0.06, 1.44], size: 0.44, phase: 0.7 },
  { key: "docker", pos: [-0.55, 2.12, -0.9], size: 0.4, phase: 1.7 },
  { key: "javascript", pos: [0.95, 2.28, 0.2], size: 0.36, phase: 2.7 },
  { key: "vscode", pos: [-2.6, 0.6, -0.6], size: 0.38, phase: 3.4 },
];

const ATLAS_INDEX = { react: 0, typescript: 1, postgres: 2, git: 3, docker: 4, javascript: 5, vscode: 6 };

/** Remaps a plane's UVs to one cell of the shared atlas. */
function atlasGeometry(index) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const uv = geo.attributes.uv;
  const c = index % ATLAS_COLS;
  const r = Math.floor(index / ATLAS_COLS);
  const u0 = c / ATLAS_COLS;
  const u1 = (c + 1) / ATLAS_COLS;
  const v1 = 1 - r / ATLAS_ROWS;
  const v0 = 1 - (r + 1) / ATLAS_ROWS;
  uv.setXY(0, u0, v1);
  uv.setXY(1, u1, v1);
  uv.setXY(2, u0, v0);
  uv.setXY(3, u1, v0);
  uv.needsUpdate = true;
  return geo;
}

function TechIcons({ atlas }) {
  const refs = useRef([]);
  const geometries = useMemo(() => ICONS.map((icon) => atlasGeometry(ATLAS_INDEX[icon.key])), []);

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const { phase } = ICONS[i];
      // Slow drift only — transform and rotation, never geometry.
      mesh.position.y = ICONS[i].pos[1] + Math.sin(t * 0.5 + phase) * 0.11;
      mesh.rotation.z = Math.sin(t * 0.32 + phase) * 0.13;
      mesh.rotation.y = Math.sin(t * 0.28 + phase) * 0.42;
    });
  });

  return (
    <group>
      {ICONS.map((icon, i) => (
        <mesh
          key={icon.key}
          ref={(node) => {
            refs.current[i] = node;
          }}
          geometry={geometries[i]}
          position={icon.pos}
          scale={icon.size}
        >
          <meshBasicMaterial map={atlas} transparent toneMapped={false} opacity={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Desk ──────────────────────────────────────────────────────────────── */
function Desk() {
  return (
    <group position={[0, -1.58, 0.2]}>
      <Slab position={[0, 0, 0]} args={[6.3, 0.1, 2.7]} color="#2b2f37" metal={0.15} rough={0.82} />
      <mesh position={[0, -0.055, 1.35]}>
        <planeGeometry args={[6.3, 0.03]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Scene root ────────────────────────────────────────────────────────── */
export default function Workstation({ reduced = false, compact = false }) {
  const group = useRef();

  const atlas = useMemo(() => buildIconAtlas(), []);

  // Six small workspace canvases are cheaper than a texture/video asset.
  const panels = useMemo(
    () =>
      PANELS.map((p) => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 190;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        return { ...p, canvas, ctx: canvas.getContext("2d"), texture };
      }),
    [],
  );

  useEffect(
    () => () => {
      panels.forEach((p) => p.texture.dispose());
      atlas.dispose();
    },
    [panels, atlas],
  );

  // Paint ~7× per second instead of every frame.
  const acc = useRef(0);
  const reveal = useRef(0);
  const scroll = useRef(0);
  const git = useRef(0);

  useFrame((state, delta) => {
    acc.current += delta;
    if (acc.current > 0.14) {
      acc.current = 0;
      reveal.current += 0.05;
      scroll.current += 1;
      git.current += 1;

      panels.forEach((p) => {
        const { ctx, canvas, lines, kind, label, accent } = p;
        if (kind === "code") drawCodePanel(ctx, canvas.width, canvas.height, lines, reveal.current % 1.2, label, accent);
        else if (kind === "git") drawGitPanel(ctx, canvas.width, canvas.height, git.current);
        else drawScrollPanel(ctx, canvas.width, canvas.height, lines, scroll.current);
        p.texture.needsUpdate = true;
      });

    }

    if (!group.current || reduced) return;
    const t = state.clock.getElapsedTime();
    const targetY = state.pointer.x * 0.2 + Math.sin(t * 0.16) * 0.045;
    const targetX = -state.pointer.y * 0.1 + Math.sin(t * 0.12) * 0.02;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.035;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.035;
  });

  return (
    <group
      ref={group}
      position={compact ? [0, 0.02, 0] : [0, 0.24, 0]}
      rotation={[0, -0.12, 0]}
      scale={compact ? 0.73 : 0.88}
    >
      <Desk />
      <Display panels={panels} />
      <DesktopPC />
      <KeyboardAndMouse />
      <TechIcons atlas={atlas} />

      {/* Two lights only — no shadow maps, no environment probe. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.45} color="#8ec5ff" />
    </group>
  );
}
