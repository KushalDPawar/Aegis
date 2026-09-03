import path from "node:path";

// Point every test worker at a dedicated SQLite file, never the dev/demo
// database. Must run before any module imports "@/lib/db".
process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../prisma/test.db")}`;
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test-only-secret-do-not-use-in-production-32b";
