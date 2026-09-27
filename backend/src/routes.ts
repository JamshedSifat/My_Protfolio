import { randomUUID } from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authenticate, requireAdmin, revokeRefresh, rotateRefresh } from "./auth.js";
import { destroyAsset, uploadBuffer } from "./cloudinary.js";
import { getPublicContent, mapProject, saveContent, upsertProject } from "./content.js";
import { db } from "./db.js";
import { ApiError } from "./errors.js";
import { imageUpload, resumeUpload } from "./upload.js";
import { contactSchema, loginSchema, projectSchema, refreshSchema } from "./validation.js";

export const routes = Router();
const asyncRoute = (handler: (...args: any[]) => Promise<unknown>) =>
  (request: any, response: any, next: any) => Promise.resolve(handler(request, response, next)).catch(next);

routes.get("/health/", asyncRoute(async (_request, response) => {
  await db.query("SELECT 1");
  response.json({ status: "ok" });
}));

routes.post("/auth/login/", asyncRoute(async (request, response) => {
  const credentials = loginSchema.parse(request.body);
  response.json(await authenticate(credentials.email, credentials.password));
}));
routes.post("/auth/refresh/", asyncRoute(async (request, response) => {
  const { refresh } = refreshSchema.parse(request.body);
  response.json(await rotateRefresh(refresh));
}));
routes.post("/auth/logout/", asyncRoute(async (request, response) => {
  const { refresh } = refreshSchema.parse(request.body);
  await revokeRefresh(refresh);
  response.status(204).end();
}));

routes.get("/content/", asyncRoute(async (_request, response) => {
  response.set("Cache-Control", "no-store, max-age=0").json(await getPublicContent());
}));
routes.get("/admin/content/", requireAdmin, asyncRoute(async (_request, response) => response.json(await getPublicContent())));
routes.patch("/admin/content/", requireAdmin, asyncRoute(async (request, response) => response.json(await saveContent(request.body))));
routes.put("/admin/content/", requireAdmin, asyncRoute(async (request, response) => response.json(await saveContent(request.body))));

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
routes.post("/contact/", contactLimiter, asyncRoute(async (request, response) => {
  const input = contactSchema.parse(request.body);
  const result = await db.query(
    `INSERT INTO contact_messages(name,email,message,ip_address,user_agent)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [input.name, input.email, input.message, request.ip || null, String(request.get("user-agent") || "").slice(0, 500)],
  );
  await db.query("INSERT INTO site_events(kind) VALUES ('contact')");
  response.status(201).json({ id: result.rows[0].id, created: true });
}));

routes.get("/admin/messages/", requireAdmin, asyncRoute(async (_request, response) => {
  const result = await db.query(`SELECT id,name,email,message,is_read AS read,created_at AS "createdAt" FROM contact_messages ORDER BY created_at DESC`);
  response.json(result.rows);
}));
routes.patch("/admin/messages/:id/", requireAdmin, asyncRoute(async (request, response) => {
  const { read } = z.object({ read: z.boolean() }).parse(request.body);
  const result = await db.query(
    `UPDATE contact_messages SET is_read=$1,updated_at=now() WHERE id=$2
     RETURNING id,name,email,message,is_read AS read,created_at AS "createdAt"`,
    [read, request.params.id],
  );
  if (!result.rowCount) throw new ApiError(404, "not_found", "Message not found.");
  response.json(result.rows[0]);
}));
routes.post("/admin/messages/mark_all_read/", requireAdmin, asyncRoute(async (_request, response) => {
  await db.query("UPDATE contact_messages SET is_read=true,updated_at=now() WHERE is_read=false");
  response.json({ updated: true });
}));
routes.delete("/admin/messages/:id/", requireAdmin, asyncRoute(async (request, response) => {
  await db.query("DELETE FROM contact_messages WHERE id=$1", [request.params.id]);
  response.status(204).end();
}));

routes.post("/events/", asyncRoute(async (request, response) => {
  const input = z.object({ kind: z.enum(["view", "resume_download"]), session: z.string().max(80).optional().default("") }).parse(request.body);
  await db.query("INSERT INTO site_events(kind,session_key) VALUES ($1,$2)", [input.kind, input.session]);
  response.status(201).json({ created: true });
}));
routes.get("/admin/analytics/", requireAdmin, asyncRoute(async (_request, response) => {
  const [counts, unread, series] = await Promise.all([
    db.query(`SELECT kind,count(*)::int AS count FROM site_events GROUP BY kind`),
    db.query("SELECT count(*)::int AS count FROM contact_messages WHERE is_read=false"),
    db.query(`SELECT created_at::date AS date,count(*)::int AS count FROM site_events
              WHERE kind='view' AND created_at >= now()-interval '14 days' GROUP BY created_at::date ORDER BY date`),
  ]);
  const map = Object.fromEntries(counts.rows.map((row) => [row.kind, row.count]));
  response.json({
    views: map.view ?? 0,
    resumeDownloads: map.resume_download ?? 0,
    contactMessages: map.contact ?? 0,
    unreadMessages: unread.rows[0].count,
    series: series.rows,
  });
}));

routes.get("/resume/", asyncRoute(async (_request, response) => {
  const result = await db.query(`SELECT id,url,original_name AS name,bytes,is_active,created_at AS "uploadedAt" FROM resumes WHERE is_active=true LIMIT 1`);
  if (!result.rows[0]) throw new ApiError(404, "not_found", "No resume has been uploaded.");
  response.json(result.rows[0]);
}));
routes.get("/resume/download/", asyncRoute(async (_request, response) => {
  const result = await db.query("SELECT url FROM resumes WHERE is_active=true LIMIT 1");
  if (!result.rows[0]) throw new ApiError(404, "not_found", "No resume has been uploaded.");
  await db.query("INSERT INTO site_events(kind) VALUES ('resume_download')");
  response.redirect(302, result.rows[0].url);
}));
routes.get("/admin/resumes/", requireAdmin, asyncRoute(async (_request, response) => {
  const result = await db.query(`SELECT id,url,original_name AS name,bytes,is_active,created_at AS "uploadedAt" FROM resumes ORDER BY created_at DESC`);
  response.json(result.rows);
}));
routes.post("/admin/resumes/", requireAdmin, resumeUpload.single("file"), asyncRoute(async (request, response) => {
  if (!request.file) throw new ApiError(400, "file_required", "Choose a PDF to upload.");
  const uploaded = await uploadBuffer(request.file.buffer, { folder: "portfolio/resumes", resourceType: "raw", filename: request.file.originalname });
  const result = await db.query(
    `WITH disabled AS (UPDATE resumes SET is_active=false WHERE is_active=true)
     INSERT INTO resumes(url,public_id,original_name,bytes,is_active) VALUES ($1,$2,$3,$4,true)
     RETURNING id,url,original_name AS name,bytes,is_active,created_at AS "uploadedAt"`,
    [uploaded.secure_url, uploaded.public_id, request.file.originalname, uploaded.bytes],
  );
  response.status(201).json(result.rows[0]);
}));
routes.delete("/admin/resumes/:id/", requireAdmin, asyncRoute(async (request, response) => {
  const result = await db.query("DELETE FROM resumes WHERE id=$1 RETURNING public_id", [request.params.id]);
  if (result.rows[0]) await destroyAsset(result.rows[0].public_id, "raw");
  response.status(204).end();
}));

routes.get("/admin/media/", requireAdmin, asyncRoute(async (_request, response) => {
  const result = await db.query(`SELECT id,url,public_id,original_name AS name,bytes,resource_type,created_at AS "uploadedAt" FROM media_assets ORDER BY created_at DESC`);
  response.json(result.rows);
}));
routes.post("/admin/media/", requireAdmin, imageUpload.single("file"), asyncRoute(async (request, response) => {
  if (!request.file) throw new ApiError(400, "file_required", "Choose an image to upload.");
  const uploaded = await uploadBuffer(request.file.buffer, { folder: "portfolio/media", filename: request.file.originalname });
  const result = await db.query(
    `INSERT INTO media_assets(url,public_id,original_name,resource_type,bytes) VALUES($1,$2,$3,$4,$5)
     RETURNING id,url,public_id,original_name AS name,bytes,resource_type,created_at AS "uploadedAt"`,
    [uploaded.secure_url, uploaded.public_id, request.file.originalname, uploaded.resource_type, uploaded.bytes],
  );
  response.status(201).json(result.rows[0]);
}));
routes.delete("/admin/media/:id/", requireAdmin, asyncRoute(async (request, response) => {
  const result = await db.query("DELETE FROM media_assets WHERE id=$1 RETURNING public_id,resource_type", [request.params.id]);
  if (result.rows[0]) await destroyAsset(result.rows[0].public_id, result.rows[0].resource_type);
  response.status(204).end();
}));

// Full project CRUD. Bulk publishing continues to use /admin/content/ so the
// existing admin interaction remains unchanged.
routes.get("/admin/projects/", requireAdmin, asyncRoute(async (_request, response) => {
  const result = await db.query("SELECT * FROM projects ORDER BY sort_order,created_at DESC");
  response.json(result.rows.map(mapProject));
}));
routes.post("/admin/projects/", requireAdmin, asyncRoute(async (request, response) => {
  response.status(201).json(await upsertProject(db, projectSchema.parse(request.body)));
}));
routes.put("/admin/projects/:slug/", requireAdmin, asyncRoute(async (request, response) => {
  response.json(await upsertProject(db, projectSchema.parse({ ...request.body, id: request.params.slug })));
}));
routes.patch("/admin/projects/:slug/", requireAdmin, asyncRoute(async (request, response) => {
  const current = await db.query("SELECT * FROM projects WHERE slug=$1", [request.params.slug]);
  if (!current.rows[0]) throw new ApiError(404, "not_found", "Project not found.");
  response.json(await upsertProject(db, projectSchema.parse({ ...mapProject(current.rows[0]), ...request.body, id: request.params.slug })));
}));
routes.delete("/admin/projects/:slug/", requireAdmin, asyncRoute(async (request, response) => {
  const result = await db.query("DELETE FROM projects WHERE slug=$1 RETURNING image_public_id", [request.params.slug]);
  if (result.rows[0]?.image_public_id) await destroyAsset(result.rows[0].image_public_id);
  response.status(204).end();
}));
routes.post("/admin/projects/:slug/image/", requireAdmin, imageUpload.single("image"), asyncRoute(async (request, response) => {
  if (!request.file) throw new ApiError(400, "file_required", "Choose an image to upload.");
  const uploaded = await uploadBuffer(request.file.buffer, { folder: "portfolio/projects", filename: request.file.originalname });
  const result = await db.query("UPDATE projects SET image_url=$1,image_public_id=$2,updated_at=now() WHERE slug=$3 RETURNING *", [uploaded.secure_url, uploaded.public_id, request.params.slug]);
  if (!result.rows[0]) throw new ApiError(404, "not_found", "Project not found.");
  response.json(mapProject(result.rows[0]));
}));

routes.post("/admin/about/1/portrait/", requireAdmin, imageUpload.single("portrait"), asyncRoute(async (request, response) => {
  if (!request.file) throw new ApiError(400, "file_required", "Choose a profile image to upload.");
  const uploaded = await uploadBuffer(request.file.buffer, { folder: "portfolio/portraits", filename: request.file.originalname });
  const previous = await db.query("SELECT portrait_public_id FROM about WHERE id=1");
  await db.query("UPDATE about SET portrait_url=$1,portrait_public_id=$2,updated_at=now() WHERE id=1", [uploaded.secure_url, uploaded.public_id]);
  if (previous.rows[0]?.portrait_public_id) await destroyAsset(previous.rows[0].portrait_public_id);
  response.json((await db.query("SELECT * FROM about WHERE id=1")).rows[0]);
}));

// Fine-grained CRUD for skills, experience, hero, about, settings and socials.
crudRoutes("skills", "skills", { group: "group_name", name: "name", note: "note", order: "sort_order", group_order: "group_order", is_visible: "is_visible" });
crudRoutes("experience", "experiences", { role: "role", company: "company", period: "period", summary: "summary", points: "points", order: "sort_order", is_visible: "is_visible" });
crudRoutes("social-links", "social_links", { platform: "platform", label: "label", url: "url", order: "sort_order", is_visible: "is_visible" });

for (const singleton of ["hero", "about", "settings"] as const) {
  routes.get(`/admin/${singleton}/`, requireAdmin, asyncRoute(async (_request, response) => {
    const table = singleton === "settings" ? "site_settings" : singleton;
    response.json((await db.query(`SELECT * FROM ${table} WHERE id=1`)).rows);
  }));
}

singletonPatch("hero", "hero", {
  name: "name", role: "role", statement: "statement", availability: "availability",
  location: "location", email: "email", github_url: "github_url",
  github_username: "github_username", linkedin_url: "linkedin_url",
  booking_url: "booking_url", stats: "stats",
});
singletonPatch("about", "about", {
  intro: "intro", body: "body", portrait_url: "portrait_url",
  focus_areas: "focus_areas", capability_cards: "capability_cards",
});
singletonPatch("settings", "site_settings", {
  seo_title: "seo_title", seo_description: "seo_description", canonical_url: "canonical_url",
  og_image_url: "og_image_url", indexable: "indexable", default_theme: "default_theme",
  accent: "accent", show_github: "show_github", show_heatmap: "show_heatmap",
  maintenance_mode: "maintenance_mode",
});

function crudRoutes(path: string, table: string, fields: Record<string, string>) {
  routes.get(`/admin/${path}/`, requireAdmin, asyncRoute(async (_request, response) => {
    response.json((await db.query(`SELECT * FROM ${table} ORDER BY updated_at DESC`)).rows);
  }));
  routes.post(`/admin/${path}/`, requireAdmin, asyncRoute(async (request, response) => {
    const entries = Object.entries(fields).filter(([source]) => source in request.body);
    if (!entries.length) throw new ApiError(400, "validation_error", "No supported fields were submitted.");
    const columns = entries.map(([, column]) => column);
    const values = entries.map(([source]) => typeof request.body[source] === "object" ? JSON.stringify(request.body[source]) : request.body[source]);
    const result = await db.query(
      `INSERT INTO ${table}(id,${columns.join(",")}) VALUES($1,${columns.map((_, i) => `$${i + 2}`).join(",")}) RETURNING *`,
      [randomUUID(), ...values],
    );
    response.status(201).json(result.rows[0]);
  }));
  routes.patch(`/admin/${path}/:id/`, requireAdmin, asyncRoute(async (request, response) => {
    const entries = Object.entries(fields).filter(([source]) => source in request.body);
    if (!entries.length) throw new ApiError(400, "validation_error", "No supported fields were submitted.");
    const values = entries.map(([source]) => typeof request.body[source] === "object" ? JSON.stringify(request.body[source]) : request.body[source]);
    const set = entries.map(([, column], i) => `${column}=$${i + 1}`).join(",");
    const result = await db.query(`UPDATE ${table} SET ${set},updated_at=now() WHERE id=$${values.length + 1} RETURNING *`, [...values, request.params.id]);
    if (!result.rows[0]) throw new ApiError(404, "not_found", "Record not found.");
    response.json(result.rows[0]);
  }));
  routes.delete(`/admin/${path}/:id/`, requireAdmin, asyncRoute(async (request, response) => {
    await db.query(`DELETE FROM ${table} WHERE id=$1`, [request.params.id]);
    response.status(204).end();
  }));
}

function singletonPatch(path: string, table: string, fields: Record<string, string>) {
  routes.patch(`/admin/${path}/:id/`, requireAdmin, asyncRoute(async (request, response) => {
    const entries = Object.entries(fields).filter(([source]) => source in request.body);
    if (!entries.length) throw new ApiError(400, "validation_error", "No supported fields were submitted.");
    const values = entries.map(([source]) => typeof request.body[source] === "object" ? JSON.stringify(request.body[source]) : request.body[source]);
    const set = entries.map(([, column], index) => `${column}=$${index + 1}`).join(",");
    const result = await db.query(`UPDATE ${table} SET ${set},updated_at=now() WHERE id=1 RETURNING *`, values);
    response.json(result.rows[0]);
  }));
}