import pg from "pg";
import { env } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 8_000,
});

db.on("error", (error) => console.error("Unexpected PostgreSQL pool error", error));

export async function transaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function pingDatabase() {
  await db.query("SELECT 1");
}