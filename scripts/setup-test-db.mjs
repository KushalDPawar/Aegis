import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const testDbPath = path.resolve(root, "prisma/test.db");

console.log("Preparing isolated test database...");
execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: `file:${testDbPath}` },
});
