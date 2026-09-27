/**
 * Central content source. Edit here — the whole site updates.
 */

const profile = {
  name: "Sifat",
  role: "Full Stack Developer",
  statement:
    "Building production-ready web applications with modern frontend, scalable backend and AI-powered solutions.",
  location: "Dhaka, Bangladesh · Remote friendly",
  email: "hello@sifat.dev",
  github: "https://github.com/sifat",
  githubUser: "sifat",
  linkedin: "https://www.linkedin.com/in/sifat",
  availability: "Open to internship & junior roles",
  bookingUrl: "https://cal.com/sifat/15min",
  portrait: "https://images.pexels.com/photos/29082534/pexels-photo-29082534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=840",
  aboutIntro:
    "I'm Sifat, a full stack developer focused on taking products from an empty repository to something people rely on daily. My work sits at the intersection of considered interface design and dependable backend engineering.",
  aboutBody:
    "Most recently that means React front ends talking to strict TypeScript services on PostgreSQL — with authentication, media pipelines, background jobs and deployments handled properly. I like problems where the answer is architecture, not more code, and I'm currently looking for a team where I can contribute at production scale.",
  focusAreas: ["React", "TypeScript", "PostgreSQL", "AI Integration", "Open to Internship"],
  resumeFile: "Sifat-Full-Stack-Developer-Resume.pdf",
  canonical: "https://sifat.dev/",
};

const nav = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "terminal", label: "Workflow" },
  { id: "work", label: "Work" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

const stats = [
  { value: "12+", label: "Production projects" },
  { value: "4", label: "Full stack products shipped" },
  { value: "60k+", label: "Lines of code written" },
];

const capabilities = [
  {
    title: "Production Projects",
    body: "Real products with authentication, payments, roles, media pipelines and deployment — not tutorial clones.",
    meta: "Shipped & maintained",
  },
  {
    title: "Modern Full Stack",
    body: "React on the front, TypeScript on the back, PostgreSQL underneath. Typed contracts, clean architecture, tested endpoints.",
    meta: "React · TypeScript · PostgreSQL",
  },
  {
    title: "Internship Ready",
    body: "Comfortable inside code review, Git flow, sprint planning and shipping on a deadline with a team.",
    meta: "Available immediately",
  },
];

const stack = [
  {
    group: "Frontend",
    accent: "from-sky-400/20 to-blue-500/10",
    items: [
      { name: "React", note: "Hooks, context, perf" },
      { name: "JavaScript", note: "ES2023" },
      { name: "Tailwind CSS", note: "Design systems" },
      { name: "Framer Motion", note: "Interaction" },
    ],
  },
  {
    group: "Backend",
    accent: "from-indigo-400/20 to-blue-600/10",
    items: [
      { name: "TypeScript", note: "Strict services" },
      { name: "Express", note: "Versioned APIs" },
      { name: "JWT Authentication", note: "Rotation and revocation" },
      { name: "Celery", note: "Queues & tasks" },
    ],
  },
  {
    group: "Database",
    accent: "from-cyan-400/20 to-sky-500/10",
    items: [
      { name: "PostgreSQL", note: "Indexes, transactions" },
      { name: "MongoDB", note: "Flexible documents" },
      { name: "Redis", note: "Cache & sessions" },
    ],
  },
  {
    group: "Tools",
    accent: "from-blue-400/20 to-indigo-500/10",
    items: [
      { name: "Git", note: "Trunk based flow" },
      { name: "Docker", note: "Compose, multi-stage" },
      { name: "Cloudinary", note: "Media pipeline" },
      { name: "GitHub", note: "Actions & CI" },
      { name: "Vercel", note: "Edge deploys" },
    ],
  },
];

const projects = [
  {
    id: "photography-studio",
    index: "01",
    title: "Photography Studio Management System",
    tagline: "A studio operating system, from booking to delivery.",
    description:
      "A complete platform for a working photography studio: clients book sessions online, staff manage calendars, photographers deliver galleries and invoices are settled in one place. Built with a React front end, a TypeScript API and a Cloudinary media pipeline for high-resolution delivery.",
    highlights: [
      "Role based dashboards for admin, photographer and client",
      "Cloudinary pipeline with signed uploads and responsive variants",
      "JWT auth with refresh rotation and per-object permissions",
    ],
    tech: ["React", "TypeScript", "PostgreSQL", "JWT", "Cloudinary"],
    image:
      "https://images.pexels.com/photos/18880006/pexels-photo-18880006.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    demo: "https://github.com/sifat",
    repo: "https://github.com/sifat",
    problem:
      'A working studio was running bookings over WhatsApp, tracking sessions in a spreadsheet and delivering galleries by WeTransfer. Nothing reconciled, and photographers spent their evenings on admin instead of shooting.',
    solution:
      'One platform that owns the whole client lifecycle: a public booking page, a staff calendar, a signed-upload gallery pipeline, and invoicing tied to session state. The TypeScript API owns the rules; React presents three role-specific experiences.',
    architecture:
      'React SPA → TypeScript API (JWT, refresh rotation) → PostgreSQL. Cloudinary handles signed uploads and responsive variants. Queue workers process originals in the background so uploads never block a request.',
    features: [
      'Self-service booking with real availability and buffer windows',
      'Role-based dashboards for admin, photographer and client',
      'Signed Cloudinary uploads with automatic variant generation',
      'Invoices generated from session state, exported as PDF'
    ],
    challenges: [
      'Signed uploads had to be authorised per object without leaking the API secret into the browser.',
      'Gallery originals are 40MB+ — direct uploads blocked the worker.',
      'Three roles meant three permission models that had to stay in sync.'
    ],
    results: [
      'Booking-to-delivery time cut from days to minutes.',
      'Roughly 6 hours of admin per week recovered per photographer.',
      'Zero payment disputes since invoices became event-driven.'
    ],
    gallery: [
      'https://images.pexels.com/photos/18880006/pexels-photo-18880006.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180',
      'https://images.pexels.com/photos/11234300/pexels-photo-11234300.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180'
    ],
  },
  {
    id: "saudi-pos",
    index: "02",
    title: "Saudi POS System",
    tagline: "Retail checkout that keeps up with the queue.",
    description:
      "A bilingual point of sale built for retail floors in Saudi Arabia — Arabic-first interface, VAT compliant receipts, offline-tolerant sales entry and live inventory sync. Typed React front end with a TypeScript and PostgreSQL backbone.",
    highlights: [
      "Full RTL Arabic and English layout with instant switching",
      "VAT compliant receipts, Z-report and shift reconciliation",
      "Optimistic sale creation that survives flaky store Wi-Fi",
    ],
    tech: ["React", "TypeScript", "Express", "PostgreSQL"],
    image:
      "https://images.pexels.com/photos/6023604/pexels-photo-6023604.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    demo: "https://github.com/sifat",
    repo: "https://github.com/sifat",
    problem:
      'A retailer needed checkout software for Saudi Arabia, but every off-the-shelf system was English-first, VAT-unaware and assumed reliable store Wi-Fi.',
    solution:
      'A bilingual POS built Arabic-first with full RTL, VAT compliant receipts, shift reconciliation and optimistic sale creation that survives a dropped connection.',
    architecture:
      'React + TypeScript front end with a typed API client. Express API core, PostgreSQL for transactions. A local outbox queues sales and replays them once connectivity returns.',
    features: [
      'Full RTL Arabic and English with instant switching',
      'VAT compliant receipts plus Z-report and shift reconciliation',
      'Optimistic sale queue that survives flaky store Wi-Fi',
      'Inventory synced in real time across terminals'
    ],
    challenges: [
      'RTL is not a text-direction flag — number formatting, receipt layout and keyboard order all invert.',
      'Receipts must be VAT compliant to the letter, so rounding rules are centralised.',
      'Duplicate sales are unacceptable; the outbox needed idempotency keys.'
    ],
    results: [
      'Checkout time down ~30% at peak.',
      'Reconciliation moved from a nightly spreadsheet to a single button.',
      'Deployed across multiple store floors.'
    ],
    gallery: [
      'https://images.pexels.com/photos/6023604/pexels-photo-6023604.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180',
      'https://images.pexels.com/photos/5239811/pexels-photo-5239811.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180'
    ],
  },
  {
    id: "smart-campus",
    index: "03",
    title: "Smart Campus Attendance",
    tagline: "Attendance that takes itself.",
    description:
      "Face verified attendance for university lecture halls. Students are recognised in under a second from a classroom camera, and lecturers get live analytics on attendance patterns instead of a paper sheet.",
    highlights: [
      "Face verification pipeline with liveness checks",
      "Live attendance analytics per course, section and term",
      "CSV / Excel export and LMS style gradebook integration",
    ],
    tech: ["React", "TypeScript", "Face Verification", "PostgreSQL"],
    image:
      "https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    demo: "https://github.com/sifat",
    repo: "https://github.com/sifat",
    problem:
      'Lecture-hall attendance was taken on paper. It was slow, easy to falsify, and produced no data anyone could act on.',
    solution:
      'Face verified attendance that registers a student in under a second from a fixed camera, and gives lecturers live analytics per course, section and term.',
    architecture:
      'React dashboard over a TypeScript core. A face-verification service runs as a separate worker, keeping the request path fast and the model swappable. PostgreSQL stores enrolments and a time-series of attendance.',
    features: [
      'Face verification with liveness checks to deter proxy attendance',
      'Live analytics per course, section and term',
      'CSV and Excel export plus gradebook integration',
      'Offline capture with deferred sync'
    ],
    challenges: [
      'False accepts are unacceptable, so the threshold had to be tuned on real classroom footage.',
      'A 400-seat hall in five minutes means the pipeline cannot block on one face.',
      'Student biometric data needs a defensible retention policy.'
    ],
    results: [
      'Attendance registration for a full hall dropped from ~10 minutes to under 60 seconds.',
      'Proxy attendance effectively eliminated.',
      'Lecturers got attendance trends they never had before.'
    ],
    gallery: [
      'https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180',
      'https://images.pexels.com/photos/8284724/pexels-photo-8284724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180'
    ],
  },
  {
    id: "ai-event",
    index: "04",
    title: "AI Event Website Generator",
    tagline: "Describe the event. Ship the website.",
    description:
      "A generator that turns a short brief into a deployed, editable event website — agenda, speakers, tickets and SEO handled automatically. The TypeScript service orchestrates model calls, streams the result and stores versions so organisers can roll back.",
    highlights: [
      "Prompt to deployed site in under a minute",
      "Streaming generation with versioned drafts and rollback",
      "Auto generated SEO, Open Graph and structured data",
    ],
    tech: ["React", "TypeScript", "AI Integration", "PostgreSQL"],
    image:
      "https://images.pexels.com/photos/17483906/pexels-photo-17483906.png?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    demo: "https://github.com/sifat",
    repo: "https://github.com/sifat",
    problem:
      'Organisers wanted an event website but had no developer, no budget and no time. Building one by hand was never going to scale.',
    solution:
      'A generator that turns a short brief into a deployed, editable event website — agenda, speakers, tickets and SEO handled automatically, with versioned drafts so nothing is ever lost.',
    architecture:
      'React editor streaming from a TypeScript core that orchestrates the model calls. Generated sites are stored as versioned documents, so an organiser can preview, publish and roll back.',
    features: [
      'Brief to deployed site in under a minute',
      'Streaming generation with versioned drafts and rollback',
      'Auto generated SEO, Open Graph and structured data',
      'Post-publish editing of every section'
    ],
    challenges: [
      'Streaming partial output into a structured document without corrupting it.',
      'Generated markup must be sanitised before it renders.',
      'Every draft needs to be restorable, which ruled out in-place mutation.'
    ],
    results: [
      'Event site launch time cut from days to about a minute.',
      'Organisers self-serve entirely — no developer in the loop.',
      'Rollback removed the fear of editing a live site.'
    ],
    gallery: [
      'https://images.pexels.com/photos/17483906/pexels-photo-17483906.png?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180',
      'https://images.pexels.com/photos/29502370/pexels-photo-29502370.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1180'
    ],
  },
];

const fallbackRepos = [
  {
    name: "photography-studio-platform",
    description:
      "Studio management platform — bookings, galleries, invoicing and role based dashboards.",
    primaryLanguage: { name: "JavaScript", color: "#f1e05a" },
    stargazerCount: 148,
    forkCount: 22,
    languages: [
      { name: "React", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "PostgreSQL", color: "#336791" },
    ],
    updatedAt: "2026-01-18T10:00:00Z",
    isPrivate: false,
  },
  {
    name: "saudi-pos",
    description: "Bilingual, VAT compliant point of sale with offline tolerant sales entry.",
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    stargazerCount: 96,
    forkCount: 11,
    languages: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "Express", color: "#68a063" },
    ],
    updatedAt: "2026-01-04T10:00:00Z",
    isPrivate: false,
  },
  {
    name: "smart-campus-attendance",
    description: "Face verified attendance with live analytics for lecture halls.",
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    stargazerCount: 132,
    forkCount: 18,
    languages: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "React", color: "#61dafb" },
    ],
    updatedAt: "2025-12-21T10:00:00Z",
    isPrivate: false,
  },
  {
    name: "ai-event-generator",
    description: "Prompt to deployed event website with versioned drafts and rollback.",
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    stargazerCount: 204,
    forkCount: 31,
    languages: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "React", color: "#61dafb" },
    ],
    updatedAt: "2025-12-02T10:00:00Z",
    isPrivate: false,
  },
  {
    name: "typescript-jwt-starter",
    description: "Opinionated TypeScript REST starter with JWT rotation, revocation and tests.",
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    stargazerCount: 311,
    forkCount: 44,
    languages: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "Docker", color: "#2496ed" },
    ],
    updatedAt: "2025-11-14T10:00:00Z",
    isPrivate: false,
  },
  {
    name: "portfolio",
    description: "This site — React, Vite, Tailwind, Framer Motion and React Three Fiber.",
    primaryLanguage: { name: "JavaScript", color: "#f1e05a" },
    stargazerCount: 87,
    forkCount: 6,
    languages: [
      { name: "React", color: "#61dafb" },
      { name: "Three.js", color: "#ffffff" },
    ],
    updatedAt: "2026-01-22T10:00:00Z",
    isPrivate: false,
  },
];

const fallbackCommits = [
  { sha: "a91f4c2", message: "feat(pos): optimistic sale queue with retry", repo: "saudi-pos", when: "2 hours ago" },
  { sha: "7d20be1", message: "perf(api): select_related on gallery queryset", repo: "photography-studio-platform", when: "yesterday" },
  { sha: "c3a97f0", message: "feat(attendance): liveness threshold tuning", repo: "smart-campus-attendance", when: "3 days ago" },
  { sha: "e50b118", message: "fix(generator): rollback orphaned drafts", repo: "ai-event-generator", when: "5 days ago" },
  { sha: "12fe8aa", message: "ci: matrix test across node 20/22", repo: "typescript-jwt-starter", when: "1 week ago" },
];

export const experience = [
  {
    role: "Full Stack Developer",
    company: "Freelance & Product Work",
    period: "2023 — Present",
    summary:
      "Shipped four production products end to end — studio management, retail POS, campus attendance and an AI site generator.",
    points: [
      "Designed TypeScript REST APIs with JWT rotation, role based permissions and tested, versioned endpoints.",
      "Built React front ends with Tailwind design systems, accessible components and sub-second interactions.",
      "Owned Docker-based deployments, CI pipelines and database migrations.",
    ],
  },
  {
    role: "Open Source Contributor",
    company: "TypeScript & React tooling",
    period: "2022 — Present",
    summary: "Maintains tooling used as a base for several client builds.",
    points: [
      "Maintains a TypeScript REST starter with JWT rotation and a full test suite.",
      "Contributes performance and DX improvements back to upstream libraries.",
    ],
  },
];

const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "",
};

/**
 * Single source of truth for the whole site.
 * The admin panel writes overrides on top of this shape (see ContentContext),
 * so editing here changes both the public site and the admin defaults.
 */
export const baseContent = {
  profile,
  nav,
  stats,
  capabilities,
  stack,
  projects,
  experience,
  fallbackRepos,
  fallbackCommits,
  emailjs: {
    serviceId: emailjsConfig.serviceId,
    templateId: emailjsConfig.templateId,
    publicKey: emailjsConfig.publicKey,
  },
  seo: {
    title: "Sifat — Full Stack Developer",
    description:
      "Sifat is a Full Stack Developer building production-ready web applications with modern frontends, scalable TypeScript backends and AI-powered solutions. Open to internships.",
    canonical: profile.canonical,
    ogImage: "/og-image.png",
    indexable: true,
  },
  settings: {
    defaultTheme: "system",
    accent: "#0A84FF",
    showGitHub: true,
    showHeatmap: true,
    maintenanceMode: false,
  },
};

export { emailjsConfig };
