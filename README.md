# Sifat — Full Stack Developer Portfolio

A production-ready full-stack portfolio built with React, Vite, Tailwind CSS v4,
Framer Motion, React Three Fiber, a strict TypeScript/Express API, PostgreSQL, JWT,
and Cloudinary.

---

## Deploy — Option B: Netlify

The frontend build is static (`dist/`) and uses `HashRouter`, while portfolio data,
authentication, inbox, analytics, and media live in the separately deployed TypeScript API.
Deploy the API first, then provide its URL to the Netlify build as `VITE_API_URL`.

### B1 · Local preview first (recommended)

Preview the exact production bundle before it goes anywhere:

```bash
npm run build
npm run preview        # → http://localhost:4173
```

Verify it actually *runs* (a green build only proves the code parses):

```bash
npm run smoke
```

This bundles the real source, executes it in a DOM, and fails on any uncaught
error, `console.error`, or blank render. It also signs into the admin panel with
the demo credentials and asserts the dashboard mounts.

Or preview with Netlify's own runtime, which applies `netlify.toml` redirects
and headers exactly as they will run in production:

```bash
npx netlify-cli@latest dev     # → http://localhost:8888
```

> `npx` runs it without installing anything globally.

### B2 · Deploy

Before deploying the frontend, deploy `backend/` using `render.yaml` (or its Dockerfile),
run the migrations and seed command, then add this Netlify environment variable:

```text
VITE_API_URL=https://your-api-host.example/api/v1
```

**From the terminal** (prompts for login on first run):

```bash
# Deploy PREVIEW — returns a shareable draft URL, does not touch production
npx netlify-cli@latest deploy --dir=dist

# Promote to the live URL when you're happy
npx netlify-cli@latest deploy --prod --dir=dist
```

The first command prints a **Website Draft URL** like
`https://690f2c1e4a8b--your-site.netlify.app` — that's your preview link.

**From the dashboard:**

1. Push this repo to GitHub.
2. Go to [app.netlify.com/start](https://app.netlify.com/start).
3. Pick your Git provider → select this repository.
4. Netlify reads `netlify.toml` automatically — **leave every field at its default**.
5. Click **Deploy site**.

**No Git at all** — drag and drop:

```bash
npm run build
```
Then drop the `dist` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

You'll get: `https://<random-name>.netlify.app`
→ *Site configuration → Change site name* to claim something like `https://sifat.netlify.app`.

### What `netlify.toml` already handles

| Concern | Setting |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `20` |
| SPA fallback | `/* → /index.html` (200, `force = false` so real files win) |
| HTML caching | `max-age=0, must-revalidate` — the whole app is one `index.html`, so this guarantees visitors never see a stale bundle after a deploy |
| Security headers | `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` |
| Asset caching | 7 days for `og-image.png` / `favicon.svg`, 1 day for manifest, robots, sitemap |
| Sitemap MIME | Served as `application/xml; charset=utf-8` |

> Do **not** add a `_redirects` or `_headers` file. `netlify.toml` takes precedence
> and duplicates drift out of sync.

### B3 · After the first deploy

1. Copy your live URL.
2. Replace every `https://sifat.dev/` in `index.html` (canonical, OG, Twitter)
   and in `public/sitemap.xml` + `public/robots.txt`.
3. Redeploy — a one-line `npx netlify-cli@latest deploy --prod --dir=dist` is enough.

---

## Other options

### Option A · Vercel

```bash
npx vercel@latest --prod
```
→ `https://<your-project>.vercel.app` · `vercel.json` is included
(build command, output dir, caching, security headers).

### Option C · GitHub Pages

1. Push to GitHub.
2. **Settings → Pages → Source → GitHub Actions.**
3. Push to `main`. `.github/workflows/deploy.yml` builds and publishes.

→ `https://<username>.github.io/<repo>/`
Use a repo named `<username>.github.io` for a root URL with no path suffix.

---

## Local development

```bash
# PostgreSQL + TypeScript API
cp backend/.env.example backend/.env
docker compose up -d db
npx tsx backend/src/migrate.ts
npx tsx backend/src/seed.ts
npx tsx backend/src/server.ts        # http://localhost:8000

# React app (a second terminal, from the project root)
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Environment variables

Frontend variables belong in `.env`; backend secrets belong in `backend/.env`.
Neither file should be committed.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | TypeScript API base URL, e.g. `http://localhost:8000/api/v1`. Required for production admin and database content. |
| `VITE_GITHUB_TOKEN` | GitHub GraphQL access. Read-only, public-repo scope only. |
| `VITE_ENABLE_DEMO_ADMIN` | Local-only fallback; keep `false` in production. |

Backend essentials: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`,
`ALLOWED_ORIGINS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`. See `backend/.env.example` for the complete list.

Never commit `.env`. To add them on Netlify:
*Site configuration → Environment variables* → add → **redeploy** (env vars are
baked in at build time, so a redeploy is required).

---

## Before you share the link

1. Run `npx tsx backend/src/seed.ts`, then edit content through `/#/admin`.
2. Set real GitHub, LinkedIn, demo, booking and repository URLs in the admin.
3. Update the canonical domain, sitemap and robots file after assigning your domain.
4. Compress the Open Graph image to under 300 KB before uploading it.

---

## Admin panel

Reach it at **`#/admin`** — e.g. `https://your-site.netlify.app/#/admin`. It's excluded
from the public navigation and ships as its own lazy-loaded chunk.

The login is backed by signed TypeScript JWT services. The seed command creates the administrator
from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`.

### Features

| Panel | What it does |
| --- | --- |
| **Dashboard** | Views, resume downloads, contact messages, conversion rate, 14-day traffic sparkline |
| **Content** | Edit Hero, About, Skills, Experience and Contact — tabbed, with repeaters for stats, cards and stack groups |
| **Projects** | Full CRUD, reordering, inline modal editor for highlights/tech/links |
| **Inbox** | Contact submissions, unread badges, mark read/unread, mark all read, delete |
| **Settings** | SEO metatags, indexing toggle, default theme, accent colour, section visibility, Cloudinary image upload, résumé PDF upload, reset |

### Full-stack data flow

`ContentContext` fetches `GET /api/v1/content/` and keeps the bundled content only as a
fast first-paint/offline fallback. Admin publishing sends an authenticated PATCH to
`/api/v1/admin/content/`; Zod validates the payload inside a PostgreSQL transaction and
returns the canonical PostgreSQL representation. The public site updates immediately.

The contact form posts directly to the TypeScript API, the inbox reads the same database records,
resume downloads redirect through a tracked API endpoint, and Cloudinary credentials
never enter the frontend bundle.

### Security

- JWT access tokens expire after 15 minutes; refresh tokens rotate and are revoked in PostgreSQL.
- All write endpoints require an authenticated staff user.
- Contact submission is validated and rate-limited to five requests per hour per IP.
- CORS is allow-listed; production cookies are secure; HSTS and HTTPS redirect are enabled.
- Cloudinary uploads occur only on the TypeScript API.
- Production startup fails when either JWT secret is missing or too short.

### API surface

- Public: `/content/`, `/contact/`, `/resume/`, `/resume/download/`, `/events/`
- Auth: `/auth/login/`, `/auth/refresh/`
- Admin CRUD: `/admin/hero/`, `/admin/about/`, `/admin/skills/`,
  `/admin/experience/`, `/admin/projects/`, `/admin/messages/`, `/admin/settings/`,
  `/admin/resumes/`, `/admin/social-links/`, `/admin/media/`
- Dashboard: `/admin/analytics/`

All paths above are relative to `/api/v1`.

### Production deployment

Deploy the React `dist/` directory to Netlify and the `backend/` Docker image to
Railway, Render, Fly.io, or another container host with PostgreSQL. Set
`VITE_API_URL=https://api.your-domain.com/api/v1` during the Netlify build. On the API
host, run:

```bash
npx tsx backend/src/migrate.ts
node backend/dist/seed.js         # first deployment only in the container
node backend/dist/check.js
```

---

## Performance notes

The 3D scene was deliberately rebuilt for speed:

- **Removed** the PMREM `RoomEnvironment` probe and the `transmission` /
  `iridescence` glass material — refraction rendering was the single most expensive
  thing on the page.
- The workstation is now ~13 low-poly meshes sharing two materials: no shadow maps, no
  environment probe, two directional lights.
- Code on the displays is a `CanvasTexture` repainted ~7×/second, never per frame.
- All six tech glyphs share **one** atlas texture across six planes.
- The canvas mounts on browser idle and only while the hero intersects the viewport;
  `frameloop` flips to `never` once you scroll past, so the render loop costs nothing
  for the rest of the page.
- Projects dropped the `clip-path` reveal (not GPU-composited) in favour of
  transform/opacity only.

**One caveat worth being honest about:** every section *is* split with `React.lazy`
(`Projects`, `GitHubShowcase`, `Contact`, `AdminApp`, and the 3D `Workstation`), but the
project also runs `vite-plugin-singlefile`, which re-inlines those chunks into one
`dist/index.html`. So the real-world Lighthouse *Performance* win arrives only if you
remove `viteSingleFile()` from `vite.config.ts` — then the splits become genuine network
requests and the 3D runtime loads off the critical path. I left the plugin in place
because it wasn't mine to remove and single-file deploys are convenient; delete one line
to switch behaviour.
