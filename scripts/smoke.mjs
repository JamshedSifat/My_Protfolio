/**
 * Runtime smoke test.
 *
 * `vite build` only proves the code parses. This bundles the real source as
 * an IIFE (jsdom ignores type="module") and executes it in a DOM, failing on
 * any uncaught error, console.error, or blank render.
 *
 *   node scripts/smoke.mjs
 */
import { build } from "esbuild";
import { JSDOM, VirtualConsole } from "jsdom";

/* ── 1. Bundle the app so jsdom can run it ─────────────────────────────── */
const result = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  format: "iife",
  write: false,
  minify: false,
  jsx: "automatic",
  target: "es2020",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.DEV": "true",
    "import.meta.env.VITE_ENABLE_DEMO_ADMIN": '"true"',
    "import.meta.env.VITE_API_URL": '""',
    "import.meta.env.VITE_EMAILJS_SERVICE_ID": '""',
    "import.meta.env.VITE_EMAILJS_TEMPLATE_ID": '""',
    "import.meta.env.VITE_EMAILJS_PUBLIC_KEY": '""',
    "import.meta.env.VITE_GITHUB_TOKEN": '""',
    "import.meta.env.VITE_ADMIN_API_URL": '""',
    "import.meta.env.VITE_ADMIN_EMAIL": '"admin@sifat.dev"',
    "import.meta.env.VITE_ADMIN_PASSWORD": '"admin123"',
    "import.meta.env.VITE_CLOUDINARY_CLOUD_NAME": '""',
    "import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET": '""',
    "import.meta.env.VITE_CLOUDINARY_FOLDER": '"portfolio"',
  },
  loader: { ".css": "empty", ".png": "dataurl", ".svg": "dataurl" },
  logLevel: "silent",
});

const code = result.outputFiles[0].text;

/* ── 2. Execute it ─────────────────────────────────────────────────────── */
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (e) => errors.push(`uncaught: ${e.message}`));
virtualConsole.on("error", (...args) => errors.push(`console.error: ${args.join(" ")}`));

const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "https://example.com/",
  virtualConsole,
});

const { window } = dom;
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.scrollTo = () => {};
window.requestIdleCallback = (cb) => window.setTimeout(() => cb({ timeRemaining: () => 8 }), 1);
window.cancelIdleCallback = (id) => window.clearTimeout(id);
window.HTMLCanvasElement.prototype.getContext = () => null;
window.fetch = () => Promise.reject(new Error("offline in smoke test"));

try {
  window.eval(code);
} catch (e) {
  errors.push(`bootstrap: ${e.message}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(2800); // preloader ~1050ms + lazy sections

const root = window.document.getElementById("root");
const text = root?.textContent ?? "";
const nodes = root?.querySelectorAll("*").length ?? 0;

/* ── 3. Report ─────────────────────────────────────────────────────────── */
// WebGL cannot run in jsdom. That path is guarded by ErrorBoundary, so it is
// expected here and filtered out rather than reported as a defect.
const ignorable = /webgl|WebGLRenderer|THREE|canvas|getContext|not implemented/i;
const real = errors.filter((e) => !ignorable.test(e));

const checks = [
  ["app mounts", nodes > 50, `${nodes} nodes`],
  ["hero name renders", text.includes("Sifat")],
  ["role renders", text.includes("Full Stack Developer")],
  ["about copy renders", text.includes("full stack developer") || text.includes("About")],
  ["stack renders", text.includes("Frontend") && text.includes("Backend")],
  ["projects render", text.includes("Photography Studio")],
  ["contact renders", text.includes("exceptional")],
  ["footer renders", text.includes("Back to top")],
];

let failed = 0;
console.log("\n  Runtime smoke test\n");
for (const [label, pass, note] of checks) {
  if (!pass) failed += 1;
  console.log(`   ${pass ? "PASS" : "FAIL"}  ${label}${note ? `  (${note})` : ""}`);
}

if (errors.length) {
  console.log("\n  All captured errors (including filtered):");
  for (const e of [...new Set(errors)].slice(0, 6)) console.log(`   ·  ${e.slice(0, 180)}`);
}

if (real.length) {
  failed += real.length;
  console.log("\n  Runtime errors:");
  for (const e of [...new Set(real)].slice(0, 12)) console.log(`   x  ${e.slice(0, 260)}`);
}

/* ── 4. Admin route ────────────────────────────────────────────────────── */
window.location.hash = "#/admin";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await wait(900);

const adminText = root?.textContent ?? "";
const adminChecks = [
  ["admin route renders login", adminText.includes("Admin access")],
  ["login form present", Boolean(root?.querySelector("#admin-email") && root?.querySelector("#admin-password"))],
  ["public site not leaking into admin", !adminText.includes("Back to top")],
];

console.log("");
for (const [label, pass] of adminChecks) {
  if (!pass) failed += 1;
  console.log(`   ${pass ? "PASS" : "FAIL"}  ${label}`);
}

// Sign in with the demo credentials and confirm the dashboard mounts.
const emailEl = root?.querySelector("#admin-email");
const passEl = root?.querySelector("#admin-password");
if (emailEl && passEl) {
  const setValue = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
  };
  setValue(emailEl, "admin@sifat.dev");
  setValue(passEl, "admin123");
  root.querySelector("form")?.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await wait(900);

  const dash = root?.textContent ?? "";
  const loggedIn = dash.includes("Overview") || dash.includes("Total views");
  if (!loggedIn) failed += 1;
  console.log(`   ${loggedIn ? "PASS" : "FAIL"}  demo login reaches dashboard`);
}

const late = errors.filter((e) => !ignorable.test(e));
if (late.length > real.length) {
  console.log("\n  Admin runtime errors:");
  for (const e of [...new Set(late.slice(real.length))].slice(0, 8)) {
    console.log(`   x  ${e.slice(0, 240)}`);
    failed += 1;
  }
}

/* ── 4b. Contact actions ───────────────────────────────────────────────── */
const contactChecks = [
  ["vCard action present", text.includes("Save vCard")],
  ["calendar action present", text.includes("Book a call")],
  ["copy email action present", text.includes("Copy email")],
  // The terminal types at 58ms/char, so assert on static chrome rather than
  // waiting for a specific command to finish typing.
  // This assertion runs after the route has switched to admin, so use the
  // captured home-page text rather than querying the live root.
  ["terminal section present", text.includes("sifat@portfolio") && text.includes("Trunk-based flow")],
  ["bento grid present", text.includes("At a glance") && text.includes("Current focus")],
];

console.log("");
for (const [label, pass] of contactChecks) {
  if (!pass) failed += 1;
  console.log(`   ${pass ? "PASS" : "FAIL"}  ${label}`);
}

/* ── 5. Case study route ───────────────────────────────────────────────── */
window.location.hash = "#/work/saudi-pos";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
await wait(1200);

const caseText = root?.textContent ?? "";
const caseChecks = [
  ["case study route renders", caseText.includes("Saudi POS")],
  ["case chapters render", caseText.includes("The problem") && caseText.includes("System architecture")],
  ["results render", caseText.includes("outcome") || caseText.includes("Checkout time")],
  ["screenshots render", (root?.querySelectorAll("img").length ?? 0) > 1],
];

console.log("");
for (const [label, pass] of caseChecks) {
  if (!pass) failed += 1;
  console.log(`   ${pass ? "PASS" : "FAIL"}  ${label}`);
}

console.log(failed ? `\n  ${failed} problem(s)\n` : "\n  All checks passed.\n");

window.close();
process.exit(failed ? 1 : 0);
