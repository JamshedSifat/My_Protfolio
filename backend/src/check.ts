import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(here, "schema.sql"), "utf8");
await db.query(schema);
const required = ["admin_users", "hero", "about", "skills", "experiences", "projects", "contact_messages", "site_settings", "resumes", "social_links"];
const result = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=ANY($1)", [required]);
if (result.rowCount !== required.length) throw new Error("Database schema check failed.");
console.log("API schema check passed.");
await db.end();