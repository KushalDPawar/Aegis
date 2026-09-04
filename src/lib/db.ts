import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

/**
 * Vercel serverless functions can only write under /tmp.
 * We ship a seeded prisma/deploy.db from the build and copy it into /tmp
 * on cold start so SQLite works without an external database.
 */
function configureDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/aegis.db";
    const bundled = path.join(process.cwd(), "prisma", "deploy.db");

    try {
      if (fs.existsSync(bundled)) {
        const shouldCopy =
          !fs.existsSync(tmpDb) ||
          fs.statSync(bundled).mtimeMs > fs.statSync(tmpDb).mtimeMs;
        if (shouldCopy) {
          fs.copyFileSync(bundled, tmpDb);
        }
      }
    } catch (err) {
      console.error("[aegis/db] failed to stage /tmp database", err);
    }

    process.env.DATABASE_URL = `file:${tmpDb}`;
    return;
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}

configureDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// On Vercel, warm instances should reuse the same client.
if (process.env.VERCEL) {
  globalForPrisma.prisma = prisma;
}
