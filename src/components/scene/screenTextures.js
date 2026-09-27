import * as THREE from "three";

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace';
const CELL = 220;
const COLS = 3;
const ROWS = 3; // 3x3 atlas holds all seven glyphs

/* ── Source samples drawn onto the monitor ─────────────────────────────── */
export const REACT_CODE = [
  [{ t: "import", c: "#ff7b72" }, { t: " { useState } ", c: "#c9d1d9" }, { t: "from", c: "#ff7b72" }, { t: ' "react";', c: "#a5d6ff" }],
  [],
  [{ t: "export", c: "#d2a8ff" }, { t: " ", c: "#c9d1d9" }, { t: "default", c: "#ff7b72" }, { t: " function ", c: "#d2a8ff" }, { t: "Card", c: "#79c0ff" }, { t: "() {", c: "#c9d1d9" }],
  [{ t: "  const", c: "#ff7b72" }, { t: " [n, set] = ", c: "#c9d1d9" }, { t: "useState", c: "#d2a8ff" }, { t: "(0);", c: "#c9d1d9" }],
  [{ t: "  return", c: "#ff7b72" }, { t: " (", c: "#c9d1d9" }],
  [{ t: "    <div ", c: "#79c0ff" }, { t: "className", c: "#ffa657" }, { t: '="glass">', c: "#a5d6ff" }],
  [{ t: "      <h2>{ n }</h2>", c: "#79c0ff" }],
  [{ t: "    </div>", c: "#79c0ff" }],
  [{ t: "  );", c: "#c9d1d9" }],
  [{ t: "}", c: "#c9d1d9" }],
];

export const API_CODE = [
  [{ t: "// api/routes.ts", c: "#8b949e" }],
  [{ t: "import", c: "#ff7b72" }, { t: " { Router } ", c: "#c9d1d9" }, { t: "from", c: "#ff7b72" }, { t: ' "express"', c: "#a5d6ff" }],
  [],
  [{ t: "const", c: "#ff7b72" }, { t: " router = ", c: "#c9d1d9" }, { t: "Router", c: "#79c0ff" }, { t: "();", c: "#c9d1d9" }],
  [{ t: "router.get", c: "#79c0ff" }, { t: "(", c: "#c9d1d9" }, { t: '"/projects"', c: "#a5d6ff" }, { t: ", async (_, res) => {", c: "#c9d1d9" }],
  [{ t: "  const", c: "#ff7b72" }, { t: " rows = ", c: "#c9d1d9" }, { t: "await", c: "#ff7b72" }, { t: " db.query(sql);", c: "#c9d1d9" }],
  [{ t: "  res.json", c: "#79c0ff" }, { t: "(rows);", c: "#c9d1d9" }],
  [{ t: "});", c: "#c9d1d9" }],
  [{ t: "export default", c: "#ff7b72" }, { t: " router;", c: "#c9d1d9" }],
];

export const SQL_LINES = [
  { t: "postgres=# \\l", c: "#7ee787" },
  { t: "                         List of databases", c: "#8b949e" },
  { t: "   Name    | Owner | Enc", c: "#8b949e" },
  { t: " -----------+-------+------", c: "#8b949e" },
  { t: " portfolio  | sifat | yes", c: "#79c0ff" },
  { t: " postgres   | postgres | yes", c: "#8b949e" },
  { t: "(2 rows)", c: "#8b949e" },
  [],
  { t: "postgres=# SELECT count(*) FROM projects;", c: "#7ee787" },
  { t: " count", c: "#8b949e" },
  { t: "-------", c: "#8b949e" },
  { t: "     4", c: "#79c0ff" },
  { t: "(1 row)", c: "#8b949e" },
  { t: "", c: "#8b949e" },
  { t: "Time: 1.284 ms", c: "#6e7681" },
  { t: "postgres=# ▍", c: "#7ee787" },
];

export const GIT_LINES = [
  { t: "* 3f9a1c2 (HEAD -> main) feat(api): cursor pagination", c: "#7ee787" },
  { t: "* 8b2e7d1 fix(ui): focus ring contrast", c: "#7ee787" },
  { t: "* c14b5e0 chore: prune docker layers", c: "#8b949e" },
  { t: "|\\", c: "#6e7681" },
  { t: "| * 9ad3f71 feat(admin): media library", c: "#79c0ff" },
  { t: "|/", c: "#6e7681" },
  { t: "* 21c8a44 test(api): auth rotation", c: "#7ee787" },
  { t: "* a0e5b93 docs: architecture", c: "#8b949e" },
  { t: "* 7d19f36 init: typescript api skeleton", c: "#8b949e" },
];

export const DOCKER_LINES = [
  { t: "$ docker compose up -d", c: "#7ee787" },
  { t: "[+] Running 3/3", c: "#8b949e" },
  { t: " ✔ Container db       Started", c: "#2496ed" },
  { t: " ✔ Container redis    Started", c: "#2496ed" },
  { t: " ✔ Container api      Started", c: "#2496ed" },
  { t: "", c: "#8b949e" },
  { t: "$ docker compose ps", c: "#7ee787" },
  { t: "NAME    IMAGE           STATUS", c: "#8b949e" },
  { t: "db      postgres:16     healthy", c: "#2496ed" },
  { t: "api     web:latest      up 2 min", c: "#2496ed" },
  { t: "", c: "#8b949e" },
  { t: "$ docker compose exec api node dist/migrate.js", c: "#7ee787" },
  { t: "Operations to perform: 4", c: "#8b949e" },
  { t: "  Applying contenttypes.0001_initial... OK", c: "#2496ed" },
];

export const JS_CODE = [
  [{ t: "const", c: "#ff7b72" }, { t: " debounce = (fn, ms = 200) => {", c: "#c9d1d9" }],
  [{ t: "  let", c: "#ff7b72" }, { t: " t;", c: "#c9d1d9" }],
  [{ t: "  return", c: "#ff7b72" }, { t: " (...args) => {", c: "#c9d1d9" }],
  [{ t: "    clearTimeout", c: "#79c0ff" }, { t: "(t);", c: "#c9d1d9" }],
  [{ t: "    t = ", c: "#c9d1d9" }, { t: "setTimeout", c: "#79c0ff" }, { t: "(() => ", c: "#c9d1d9" }],
  [{ t: "      fn(...args), ms);", c: "#c9d1d9" }],
  [{ t: "  };", c: "#c9d1d9" }],
  [{ t: "};", c: "#c9d1d9" }],
  [],
  [{ t: "export default", c: "#ff7b72" }, { t: " debounce;", c: "#c9d1d9" }],
];

/* ── Panel painter: syntax sample that types itself out ────────────────── */
function drawCodePanel(ctx, w, h, lines, reveal, label, accent) {
  ctx.fillStyle = "#0b0f17";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, w, Math.round(h * 0.085));
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(18 + i * 17, Math.round(h * 0.042), 4.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#79c0ff";
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText(label, 74, Math.round(h * 0.052));
  ctx.fillStyle = accent;
  ctx.fillRect(w - 26, Math.round(h * 0.085) - 3, 22, 3);

  const total = lines.length;
  const shown = Math.max(1, Math.floor(reveal * total));
  const lineH = Math.max(15, (h * 0.86) / Math.max(total, 8));

  ctx.font = `400 ${Math.min(16, lineH - 2)}px ${MONO}`;
  lines.slice(0, shown).forEach((tokens, i) => {
    const y = Math.round(h * 0.135) + i * lineH;
    let x = 16;
    tokens.forEach(({ t, c }) => {
      ctx.fillStyle = c;
      ctx.fillText(t, x, y);
      x += ctx.measureText(t).width;
    });
  });

  if (shown < total) {
    const y = Math.round(h * 0.135) + shown * lineH;
    ctx.fillStyle = "rgba(122,192,255,0.85)";
    ctx.fillRect(16, y - 12, 2, Math.min(16, lineH));
  }
}

/* ── Panel painter: scrolling monochrome terminal ──────────────────────── */
function drawScrollPanel(ctx, w, h, lines, offset) {
  ctx.fillStyle = "#080b11";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, w, Math.round(h * 0.085));

  const lineH = Math.max(15, (h * 0.86) / lines.length);
  ctx.font = `400 ${Math.min(15, lineH - 1)}px ${MONO}`;
  const count = lines.length;

  lines.forEach((_, i) => {
    const idx = (i + Math.floor(offset)) % count;
    ctx.fillStyle = lines[idx].c;
    ctx.fillText(lines[idx].t, 14, Math.round(h * 0.14) + i * lineH);
  });
}

/* ── Panel painter: git commit graph ──────────────────────────────────── */
function drawGitPanel(ctx, w, h, offset) {
  ctx.fillStyle = "#080b11";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, w, Math.round(h * 0.085));
  ctx.fillStyle = "#f0553d";
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText("git log --graph", 74, Math.round(h * 0.052));

  const lineH = Math.max(15, (h * 0.86) / GIT_LINES.length);
  ctx.font = `400 ${Math.min(15, lineH - 1)}px ${MONO}`;
  // Offset is an integer here so the graph grows by one commit at a time.
  const start = Math.floor(offset) % GIT_LINES.length;
  const slice = [...GIT_LINES.slice(start), ...GIT_LINES.slice(0, start)];

  slice.forEach((line, i) => {
    const y = Math.round(h * 0.14) + i * lineH;
    ctx.fillStyle = line.c;
    ctx.fillText(line.t, 14, y);
  });
}

/* ── 3x3 glyph atlas ──────────────────────────────────────────────────── */
export function buildIconAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * COLS;
  canvas.height = CELL * ROWS;
  const ctx = canvas.getContext("2d");
  const centre = (i) => [(i % COLS) * CELL + CELL / 2, Math.floor(i / COLS) * CELL + CELL / 2];

  // 0 React
  {
    const [cx, cy] = centre(0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "#61dafb";
    ctx.lineWidth = 7;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 74, 28, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#61dafb";
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 1 TypeScript API
  {
    const [cx, cy] = centre(1);
    ctx.fillStyle = "#3178c6";
    const r = 46;
    ctx.beginPath();
    ctx.moveTo(cx - r + 26, cy - r);
    ctx.arcTo(cx + r, cy - r, cx + r, cy + r, 26);
    ctx.arcTo(cx + r, cy + r, cx - r, cy + r, 26);
    ctx.arcTo(cx - r, cy + r, cx - r, cy - r, 26);
    ctx.arcTo(cx - r, cy - r, cx + r, cy - r, 26);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 62px ${MONO}`;
    ctx.fillText("TS", cx - 39, cy + 22);
  }
  // 2 PostgreSQL
  {
    const [cx, cy] = centre(2);
    ctx.strokeStyle = "#336791";
    ctx.lineWidth = 8;
    ctx.fillStyle = "rgba(51,103,145,0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 44, 62, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 62, cy - 44);
    ctx.lineTo(cx - 62, cy + 44);
    ctx.moveTo(cx + 62, cy - 44);
    ctx.lineTo(cx + 62, cy + 44);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 44, 62, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // 3 Git
  {
    const [cx, cy] = centre(3);
    ctx.strokeStyle = "#f0553d";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy + 62);
    ctx.lineTo(cx - 46, cy - 20);
    ctx.quadraticCurveTo(cx - 46, cy - 52, cx - 8, cy - 52);
    ctx.lineTo(cx + 46, cy - 52);
    ctx.stroke();
    ctx.fillStyle = "#f0553d";
    [cy + 62, cy - 20].forEach((y) => {
      ctx.beginPath();
      ctx.arc(cx - 46, y, 13, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(cx + 46, cy - 52, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  // 4 Docker
  {
    const [cx, cy] = centre(4);
    ctx.fillStyle = "#2496ed";
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 4 - row; col += 1) {
        ctx.fillRect(cx - 62 + col * 37, cy - 6 - row * 33, 30, 26);
      }
    }
    ctx.fillRect(cx - 62, cy + 30, 124, 13);
    ctx.beginPath();
    ctx.arc(cx + 74, cy + 28, 15, 0.6, 4.2);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#2496ed";
    ctx.stroke();
  }
  // 5 JavaScript
  {
    const [cx, cy] = centre(5);
    ctx.fillStyle = "#f7df1e";
    ctx.beginPath();
    ctx.roundRect(cx - 46, cy - 46, 92, 92, 20);
    ctx.fill();
    ctx.fillStyle = "#1c1c1c";
    ctx.font = `700 66px ${MONO}`;
    ctx.fillText("JS", cx - 41, cy + 24);
  }
  // 6 VS Code
  {
    const [cx, cy] = centre(6);
    ctx.strokeStyle = "#0078d4";
    ctx.lineWidth = 8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy - 48);
    ctx.lineTo(cx + 18, cy - 10);
    ctx.lineTo(cx - 46, cy + 28);
    ctx.lineTo(cx - 46, cy + 52);
    ctx.lineTo(cx + 44, cy + 16);
    ctx.lineTo(cx + 48, cy - 4);
    ctx.lineTo(cx + 44, cy - 24);
    ctx.lineTo(cx - 46, cy - 40);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "#3aa0f0";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx + 44, cy - 24);
    ctx.lineTo(cx + 48, cy + 16);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

export const ATLAS_COLS = COLS;
export const ATLAS_ROWS = ROWS;

/** Exposed so the scene can build its panel list declaratively. */
export const PANELS = [
  { key: "react", label: "App.jsx", lines: REACT_CODE, kind: "code", accent: "#61dafb" },
  { key: "typescript", label: "routes.ts", lines: API_CODE, kind: "code", accent: "#3178c6" },
  { key: "sql", label: "psql", lines: SQL_LINES, kind: "scroll", accent: "#336791" },
  { key: "git", label: "git log", lines: GIT_LINES, kind: "git", accent: "#f0553d" },
  { key: "docker", label: "compose.yml", lines: DOCKER_LINES, kind: "scroll", accent: "#2496ed" },
  { key: "js", label: "debounce.js", lines: JS_CODE, kind: "code", accent: "#f7df1e" },
];

export { drawCodePanel, drawScrollPanel, drawGitPanel };
