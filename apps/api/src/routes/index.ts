/**
 * Route assembly for the canonical Hono application.
 *
 * Three namespaces, kept strictly separate:
 *
 *   /api/health    liveness (no auth, no dependencies)
 *   /api/v1/*      versioned application API (authenticated via requireAuth)
 *   /api/auth/*    hybrid: /auth/sign-up and /auth/sign-in are custom facades;
 *                 all other routes are owned by Better Auth
 *
 * Runtime prefixes (`/api` under Vercel) are handled by `app.ts`; this module
 * only knows the paths relative to wherever the app is mounted.
 */
import { Hono } from "hono";

import { auth } from "../auth/index.js";
import { authRoute } from "./auth.js";
import { healthRoute } from "./health.js";
import { v1 } from "./v1/index.js";

export const routes = new Hono();

routes.route("/health", healthRoute);
routes.route("/v1", v1);

// The username-only sign-up/sign-in facade must be claimed before Better
// Auth's catch-all below; Hono matches handlers in registration order. Every
// other Better Auth endpoint (session, sign-out, cookies) still falls through
// to the handler, which receives the raw request so the library controls its
// own routing entirely.
routes.route("/auth", authRoute);
routes.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
