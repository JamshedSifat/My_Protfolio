/**
 * Minimal, dependency-free PDF writer.
 * Generates a clean one-page résumé at download time so the resume
 * button always yields a real file (no dead links, no binary asset).
 */

const PAGE_W = 595.28; // A4 in points
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const WIDTH = {
  regular: { 8: 4.45, 9: 5.0, 10: 5.55, 11: 6.1, 12: 6.66, 14: 7.77, 16: 8.88, 22: 12.2, 26: 14.4 },
  bold: { 8: 4.75, 9: 5.34, 10: 5.93, 11: 6.52, 12: 7.11, 14: 8.3, 16: 9.49, 22: 13.0, 26: 15.4 },
};

const esc = (s = "") =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");

const width = (text, size, weight) => (WIDTH[weight]?.[size] ?? size * 0.55) * esc(text).length;

const wrap = (text, size, weight, maxWidth = CONTENT_W) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (width(next, size, weight) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/**
 * @param {object} p profile object from src/data/site.js
 */
export function buildResumePdf(p) {
  const ops = [];
  let y = PAGE_H - 64;

  const text = (str, x, opts = {}) => {
    const { size = 10, weight = "regular", color = "0.06 0.09 0.16", align } = opts;
    let posX = x;
    if (align === "right") posX = x - width(str, size, weight);
    ops.push(`${color} rg`);
    ops.push(`BT /${weight === "bold" ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${posX.toFixed(2)} ${y.toFixed(2)} Tm (${esc(str)}) Tj ET`);
  };

  const paragraph = (str, opts = {}) => {
    const { size = 10, gap = 13, x = MARGIN, color = "0.32 0.39 0.48" } = opts;
    for (const line of wrap(str, size, "regular")) {
      text(line, x, { size, color });
      y -= gap;
    }
  };

  const rule = (gapBefore = 8, gapAfter = 14, color = "0.85 0.88 0.92") => {
    y -= gapBefore;
    ops.push(`${color} RG 0.8 w ${MARGIN} ${(y + 3).toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${(y + 3).toFixed(2)} l S`);
    y -= gapAfter;
  };

  // Header
  text(p.name.toUpperCase(), MARGIN, { size: 26, weight: "bold", color: "0.06 0.09 0.16" });
  text(p.role, PAGE_W - MARGIN, { size: 11, align: "right", color: "0.04 0.52 1" });
  y -= 20;
  paragraph(`${p.email}  ·  github.com/${p.githubUser}  ·  linkedin.com/in/sifat  ·  ${p.location}`, { size: 9, color: "0.45 0.52 0.6" });
  rule(4, 16);

  text("PROFILE", MARGIN, { size: 9, weight: "bold", color: "0.04 0.52 1" });
  y -= 13;
  paragraph(p.statement, { size: 10, color: "0.32 0.39 0.48" });
  rule(2, 14);

  text("EXPERIENCE", MARGIN, { size: 9, weight: "bold", color: "0.04 0.52 1" });
  y -= 15;
  const roles = [
    {
      title: "Full Stack Developer — Freelance & Product Work",
      meta: "2023 — Present",
      lines: [
        "Shipped four production products end to end: studio management, retail POS, campus attendance and an AI site generator.",
        "Designed TypeScript REST APIs with JWT rotation, role based permissions and tested, versioned endpoints.",
        "Built React front ends with Tailwind design systems, accessible components and sub-second interactions.",
      ],
    },
    {
      title: "Open Source — TypeScript & React tooling",
      meta: "2022 — Present",
      lines: [
        "Maintains a TypeScript REST + rotating JWT starter used as a base for several client builds.",
        "Contributes performance and DX improvements back to the libraries the work depends on.",
      ],
    },
  ];
  for (const r of roles) {
    text(r.title, MARGIN, { size: 11, weight: "bold", color: "0.06 0.09 0.16" });
    text(r.meta, PAGE_W - MARGIN, { size: 9, align: "right", color: "0.45 0.52 0.6" });
    y -= 14;
    for (const line of r.lines) {
      const wrapped = wrap(`- ${line}`, 9.5, "regular");
      wrapped.forEach((l, i) => {
        text(l, MARGIN + (i ? 8 : 0), { size: 9.5, color: "0.32 0.39 0.48" });
        y -= 12;
      });
    }
    y -= 6;
  }
  rule(2, 14);

  text("SELECTED PROJECTS", MARGIN, { size: 9, weight: "bold", color: "0.04 0.52 1" });
  y -= 15;
  const projects = [
    ["Photography Studio Management System", "React, TypeScript, PostgreSQL, JWT, Cloudinary"],
    ["Saudi POS System", "React, TypeScript, Express, PostgreSQL"],
    ["Smart Campus Attendance", "React, TypeScript, Face Verification"],
    ["AI Event Website Generator", "React, TypeScript, AI Integration"],
  ];
  for (const [name, stackStr] of projects) {
    text(name, MARGIN, { size: 10, weight: "bold", color: "0.06 0.09 0.16" });
    text(stackStr, PAGE_W - MARGIN, { size: 9, align: "right", color: "0.45 0.52 0.6" });
    y -= 14;
  }
  rule(2, 14);

  text("TECHNICAL SKILLS", MARGIN, { size: 9, weight: "bold", color: "0.04 0.52 1" });
  y -= 14;
  const skills = [
    ["Frontend", "React, JavaScript (ES2023), Tailwind CSS, Framer Motion, Vite"],
    ["Backend", "TypeScript, Node.js, Express, JWT Authentication"],
    ["Data", "PostgreSQL, MongoDB, Redis"],
    ["Tools", "Git, Docker, GitHub Actions, Cloudinary, Vercel"],
  ];
  for (const [label, value] of skills) {
    text(label, MARGIN, { size: 10, weight: "bold", color: "0.06 0.09 0.16" });
    y -= 12;
    paragraph(value, { size: 9.5, x: MARGIN + 62, color: "0.32 0.39 0.48", gap: 12 });
    y -= 2;
  }
  y -= 6;
  paragraph(`${p.availability}.`, { size: 9.5, color: "0.45 0.52 0.6" });

  const content = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function downloadResume(p) {
  // Tracked here so every call site (hero, navbar, mobile menu) is counted.
  import("./analytics")
    .then((m) => m.trackResumeDownload())
    .catch(() => {});

  // In full-stack mode the TypeScript API tracks the download and redirects to the active
  // Cloudinary PDF. The generated document remains an offline fallback.
  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (apiBase) {
    window.open(`${apiBase}/resume/download/`, "_blank", "noopener,noreferrer");
    return;
  }

  const pdf = buildResumePdf(p);
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = p.resumeFile || "resume.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
