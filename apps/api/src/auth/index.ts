import { db } from "@goonfall/db";
import * as schema from "@goonfall/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "../config/env.js";

/**
 * Better Auth configuration.
 *
 * This is infrastructure only. It wires authentication to the database and the
 * environment; it defines no sign-in methods, no user roles and no session
 * logic, and no authentication UI exists in the web app.
 *
 * `app.ts` mounts `auth.handler` at Better Auth's base path, so the endpoints
 * beneath `/api/auth/*` are live and ready for the application to use. The
 * remaining work when features are implemented is to register the providers
 * this project wants and build the corresponding pages.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Better Auth is an infrastructure concern of the API, so its base path
  // mirrors the mount point in `app.ts`.
  basePath: "/api/auth",
});

export type Auth = typeof auth;
