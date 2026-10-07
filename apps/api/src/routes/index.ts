/**
 * Route assembly for the canonical Hono application.
 *
 * Three namespaces, kept strictly separate:
 *
 *   /api/health    liveness (no auth, no dependencies)
 *   /api/v1/*      versioned application API (empty in Phase 1 by design)
 *   /api/auth/*    owned end to end by Better Auth — nothing else mounts here
 *
 * Runtime prefixes (`/api` under Vercel) are handled by `app.ts`; this module
 * only knows the paths relative to wherever the app is mounted.
 */
import { Hono } from "hono";

import { auth } from "../auth/index.js";
import { healthRoute } from "./health.js";
import { v1 } from "./v1/index.js";

export const routes = new Hono();

routes.route("/health", healthRoute);
routes.route("/v1", v1);

// Better Auth owns everything beneath its base path; the handler receives the
// raw request so the library controls its own routing entirely.
routes.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
