import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { databaseEnv } from "./env.js";
import * as schema from "./schema/index.js";

/**
 * The database client shared by everything that talks to PostgreSQL.
 *
 * Uses Neon's HTTP driver, so every query is a stateless fetch. That keeps the
 * API runnable both as a long-lived local process and as a serverless function
 * on Vercel, with no connection pool to manage.
 *
 * Nothing here knows about application tables — `./schema` holds the schema and
 * currently contains only what Better Auth requires.
 */
export const db = drizzle(neon(databaseEnv.DATABASE_URL), { schema });

export type Database = typeof db;