import bcrypt from "bcryptjs";
import { env } from "./config.js";
import { db } from "./db.js";
import { saveContent } from "./content.js";

if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the database.");
}

const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
await db.query(
  `INSERT INTO admin_users(email,password_hash,display_name)
   VALUES(lower($1),$2,'Portfolio Admin')
   ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash,is_active=true,updated_at=now()`,
  [env.ADMIN_EMAIL, passwordHash],
);

const initialContent: any = {
  profile: {
    name: "Sifat", role: "Full Stack Developer",
    statement: "Building production-ready web applications with modern frontend, scalable backend and AI-powered solutions.",
    availability: "Open to internship & junior roles", location: "Dhaka, Bangladesh · Remote friendly",
    email: "hello@sifat.dev", github: "https://github.com/sifat", githubUser: "sifat",
    linkedin: "https://www.linkedin.com/in/sifat", bookingUrl: "https://cal.com/sifat/15min",
    portrait: "https://images.pexels.com/photos/29082534/pexels-photo-29082534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=840",
    aboutIntro: "I'm Sifat, a full stack developer focused on taking products from an empty repository to something people rely on daily.",
    aboutBody: "My work sits at the intersection of considered interface design and dependable backend engineering.",
    focusAreas: ["React", "TypeScript", "PostgreSQL", "AI Integration", "Open to Internship"],
  },
  stats: [{ value: "12+", label: "Production projects" }, { value: "4", label: "Full stack products shipped" }, { value: "60k+", label: "Lines of code written" }],
  capabilities: [
    { title: "Production Projects", body: "Real products with authentication, roles, media pipelines and deployment.", meta: "Shipped & maintained" },
    { title: "Modern Full Stack", body: "React, typed services and PostgreSQL with clean contracts.", meta: "React · TypeScript · PostgreSQL" },
    { title: "Internship Ready", body: "Comfortable with code review, Git flow and sprint delivery.", meta: "Available immediately" },
  ],
  stack: [
    { group: "Frontend", items: [{ name: "React", note: "Hooks, context, performance" }, { name: "JavaScript", note: "ES2023" }, { name: "Tailwind CSS", note: "Design systems" }] },
    { group: "Backend", items: [{ name: "TypeScript", note: "Strict APIs" }, { name: "Node.js", note: "REST services" }, { name: "JWT Authentication", note: "Rotation and revocation" }] },
    { group: "Database", items: [{ name: "PostgreSQL", note: "Indexes, transactions" }, { name: "Redis", note: "Cache and sessions" }] },
    { group: "Tools", items: [{ name: "Git", note: "Trunk-based flow" }, { name: "Docker", note: "Multi-stage builds" }, { name: "Cloudinary", note: "Media pipeline" }] },
  ],
  experience: [
    { role: "Full Stack Developer", company: "Freelance & Product Work", period: "2023 — Present", summary: "Shipped production products end to end.", points: ["Versioned APIs", "Accessible React interfaces", "Deployment and migrations"] },
    { role: "Open Source Contributor", company: "React & TypeScript tooling", period: "2022 — Present", summary: "Maintains reusable full-stack tooling.", points: ["JWT starter", "Performance improvements"] },
  ],
  projects: [
    {
      id: "photography-studio", index: "01", title: "Photography Studio Management System",
      tagline: "A studio operating system, from booking to delivery.",
      description: "A complete platform for bookings, staff calendars, client galleries and invoicing.",
      image: "https://images.pexels.com/photos/18880006/pexels-photo-18880006.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
      demo: "https://github.com/sifat", repo: "https://github.com/sifat",
      tech: ["React", "TypeScript", "PostgreSQL", "JWT", "Cloudinary"],
      highlights: ["Role based dashboards", "Signed Cloudinary uploads", "JWT refresh rotation"],
      problem: "A working studio was running bookings over chat, tracking sessions in spreadsheets and delivering galleries manually.",
      solution: "One platform owns the client lifecycle from booking to final gallery delivery.",
      architecture: "React SPA to a TypeScript API with JWT, PostgreSQL persistence and Cloudinary media delivery.",
      features: ["Self-service booking", "Role-based dashboards", "Signed media uploads", "PDF invoices"],
      challenges: ["Large original images", "Per-object permissions", "Three role-specific workflows"],
      results: ["Faster delivery", "Less weekly admin", "Traceable invoices"], gallery: [],
    },
    {
      id: "saudi-pos", index: "02", title: "Saudi POS System",
      tagline: "Retail checkout that keeps up with the queue.",
      description: "A bilingual, VAT-compliant point of sale with offline-tolerant sales entry.",
      image: "https://images.pexels.com/photos/6023604/pexels-photo-6023604.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
      demo: "https://github.com/sifat", repo: "https://github.com/sifat",
      tech: ["React", "TypeScript", "Express", "PostgreSQL"],
      highlights: ["Arabic and English RTL", "VAT compliant receipts", "Offline sale queue"],
      problem: "Existing systems were English-first, VAT-unaware and assumed reliable store connectivity.",
      solution: "An Arabic-first checkout with idempotent offline sales and live inventory sync.",
      architecture: "Typed React client, TypeScript transaction API and PostgreSQL, with a local outbox for offline sales.",
      features: ["Full RTL", "Shift reconciliation", "Offline queue", "Live inventory"],
      challenges: ["RTL details", "VAT rounding", "Idempotent retries"],
      results: ["Faster checkout", "One-click reconciliation", "Multi-floor deployment"], gallery: [],
    },
    {
      id: "smart-campus", index: "03", title: "Smart Campus Attendance",
      tagline: "Attendance that takes itself.",
      description: "Face-verified attendance with live analytics for university lecture halls.",
      image: "https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
      demo: "https://github.com/sifat", repo: "https://github.com/sifat",
      tech: ["React", "TypeScript", "Face Verification", "PostgreSQL"],
      highlights: ["Liveness checks", "Live course analytics", "Gradebook export"],
      problem: "Paper attendance was slow, easy to falsify and generated no useful data.",
      solution: "A separate verification worker registers attendance and streams live analytics.",
      architecture: "React dashboard, TypeScript core, isolated verification worker and PostgreSQL attendance history.",
      features: ["Face verification", "Liveness checks", "Analytics", "Offline capture"],
      challenges: ["False accepts", "High throughput", "Biometric retention"],
      results: ["Under one-minute registration", "Proxy attendance reduced", "Actionable trends"], gallery: [],
    },
    {
      id: "ai-event", index: "04", title: "AI Event Website Generator",
      tagline: "Describe the event. Ship the website.",
      description: "A short brief becomes a deployed, editable event website with agenda, speakers, tickets and SEO.",
      image: "https://images.pexels.com/photos/17483906/pexels-photo-17483906.png?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
      demo: "https://github.com/sifat", repo: "https://github.com/sifat",
      tech: ["React", "TypeScript", "AI Integration", "PostgreSQL"],
      highlights: ["Streaming generation", "Versioned drafts", "Generated SEO"],
      problem: "Organisers needed event sites but had no developer, budget or time.",
      solution: "A versioned generator turns a brief into an editable, deployable site.",
      architecture: "React streaming editor, TypeScript orchestration and PostgreSQL versioned documents.",
      features: ["Prompt to site", "Streaming drafts", "Rollback", "Structured data"],
      challenges: ["Structured streaming", "Sanitised output", "Immutable drafts"],
      results: ["Minute-long launches", "Full self-service", "Safe rollback"], gallery: [],
    },
  ],
  seo: { title: "Sifat — Full Stack Developer", description: "Full Stack Developer building production-ready web applications.", canonical: "https://sifat.dev/", ogImage: "/og-image.png", indexable: true },
  settings: { defaultTheme: "system", accent: "#0A84FF", showGitHub: true, showHeatmap: true, maintenanceMode: false },
};

// Preserve any projects already inserted by an earlier seed or admin edit.
const existing = await db.query("SELECT count(*)::int AS count FROM projects");
if (existing.rows[0].count > 0) {
  const current = await import("./content.js").then((module) => module.getPublicContent());
  initialContent.projects = current.projects;
}
await saveContent(initialContent);

console.log(`Portfolio seeded. Admin: ${env.ADMIN_EMAIL}`);
await db.end();