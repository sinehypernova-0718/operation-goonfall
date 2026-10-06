import { healthResponseSchema } from "@goonfall/contracts";
import { Hono } from "hono";

import { auth } from "./auth/index.js";

/**
 * The API application.
 *
 * Assembled separately from the server entrypoint so the same app can be
 * started locally (`src/server.ts`) and deployed as a Vercel function
 * (`api/index.ts`) without duplication.
 *
 * Only two things are mounted: the health check, so the workspace can prove it
 * is running, and Better Auth's catch-all handler, so the authentication
 * infrastructure is wired end to end. Application routes are added here as
 * Operation Goonfall's features are implemented.
 */
export const app = new Hono();

app.get("/health", (c) => {
  const body: unknown = healthResponseSchema.parse({ status: "ok" });
  return c.json(body);
});

// Better Auth exposes every authentication endpoint beneath a single base path.
// It is mounted with no routes of its own registered yet — no sign-in,
// sign-up or session logic is implemented in this bootstrap.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export type AppType = typeof app;