import { config as loadDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// The workspace keeps a single `.env` at the repository root. drizzle-kit only
// auto-loads a `.env` from its own directory, so load the root one explicitly.
loadDotenv({ path: new URL("../../.env", import.meta.url), quiet: true });

/**
 * Drizzle Kit configuration — powers `db:generate`, `db:migrate` and
 * `db:studio`.
 *
 * The URL is read here rather than from `@goonfall/db` so the CLI does not pull
 * in the client (and its Neon driver) just to introspect the schema.
 */
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
