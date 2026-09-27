import { app } from "./app.js";
import { env } from "./config.js";
import { db, pingDatabase } from "./db.js";

await pingDatabase();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`TypeScript portfolio API listening on :${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received; closing gracefully.`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));