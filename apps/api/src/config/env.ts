/**
 * The API's environment configuration.
 *
 * Validation lives in `@goonfall/config` so the API, the database package and
 * any future script all agree on what a valid environment looks like. This
 * module is the API's single entry point to it: import `env` from here, never
 * read `process.env` directly and never branch on `APP_ENV` anywhere else.
 *
 * Loaded once at startup — `src/server.ts` imports it first, so a missing or
 * malformed variable stops the process with a readable error instead of
 * surfacing later as a failed request.
 */
import { loadServerEnv } from "@goonfall/config/env";

export const env = loadServerEnv();

export type { AppEnv, ServerEnv } from "@goonfall/config/env";
