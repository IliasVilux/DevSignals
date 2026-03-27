// Load .env file if it exists (local dev). On Render, env vars come from the dashboard.
// @ts-ignore — loadEnvFile is native Node >= 20.12, not in Prisma's TS context
try {
  process.loadEnvFile(".env");
} catch {}

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
