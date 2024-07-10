import { type Config, defineConfig } from "drizzle-kit";
export default defineConfig({
  schemaFilter: ["public"],
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
