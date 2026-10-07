/**
 * CORS middleware.
 *
 * Origins are explicit — taken from `CORS_ORIGIN` in the root `.env`, parsed
 * into a list by `@goonfall/config`. The wildcard is never used: an origin
 * outside the allowlist simply receives no `Access-Control-Allow-Origin`
 * header, so the browser blocks it.
 *
 * Credentials are enabled because Phase 2's sessions are cookie-based: a
 * browser may only send the Better Auth session cookie cross-origin when the
 * response carries `Access-Control-Allow-Credentials: true`. That is safe here
 * precisely because the origin resolver above echoes back only origins from
 * the explicit `CORS_ORIGIN` list and never a wildcard — credentialed CORS
 * with `*` is invalid and is never emitted. Unlisted origins receive no
 * allow headers at all, in development and production alike.
 */
import { cors } from "hono/cors";

import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: (origin) => (env.CORS_ORIGIN.includes(origin) ? origin : null),
  allowHeaders: ["Content-Type", "X-Request-ID"],
  exposeHeaders: ["X-Request-ID"],
  maxAge: 600,
  credentials: true,
});
