/**
 * Prepare a seeded SQLite database for Vercel builds.
 *
 * Vercel serverless functions are read-only except /tmp, so we:
 * 1. Create prisma/deploy.db during `next build`
 * 2. Bundle it with the deployment
 * 3. Copy it to /tmp on cold start (see src/lib/db.ts)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbFile = path.join(root, "prisma", "deploy.db");
const databaseUrl = "file:./deploy.db";

process.env.DATABASE_URL = databaseUrl;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Fresh file every build so schema/seed never drift from the repo.
for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const target = `${dbFile}${suffix}`;
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

console.log("[vercel-prepare-db] generating client…");
run("npx", ["prisma", "generate"]);

console.log("[vercel-prepare-db] pushing schema → prisma/deploy.db…");
run("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"]);

console.log("[vercel-prepare-db] seeding demo data…");
run("npx", ["tsx", "--conditions=react-server", "prisma/seed.ts"]);

if (!fs.existsSync(dbFile)) {
  console.error("[vercel-prepare-db] deploy.db was not created");
  process.exit(1);
}

console.log(`[vercel-prepare-db] ready (${(fs.statSync(dbFile).size / 1024).toFixed(1)} KB)`);
