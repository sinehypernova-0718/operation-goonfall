/**
 * `@goonfall/db` — database client, schema and migration tooling.
 *
 * Consumers import:
 *   - `@goonfall/db`         for the client (`db`) and the `Database` type
 *   - `@goonfall/db/schema`  for table definitions
 *
 * This package must not import from `apps/*`.
 */
export { db, type Database } from "./client.js";

export * as schema from "./schema/index.js";
