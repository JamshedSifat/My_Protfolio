import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(here, "schema.sql"), "utf8");

try {
  await db.query(schema);
  console.log("PostgreSQL schema is current.");
} finally {
  await db.end();
}