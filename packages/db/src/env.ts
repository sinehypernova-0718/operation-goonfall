import { loadServerEnv, type ServerEnv } from "@goonfall/config/env";

/**
 * Database-scoped view of the environment.
 *
 * Re-exports only what this package needs, so `db` depends on the shape of the
 * configuration rather than on the whole server environment.
 *
 * Throws on the first import if configuration is missing or malformed — which
 * includes when drizzle-kit loads `drizzle.config.ts`. That is intentional: a
 * clear error beats a confusing connection failure.
 */
export const databaseEnv: ServerEnv = loadServerEnv();