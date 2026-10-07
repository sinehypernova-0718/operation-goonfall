/**
 * CORS middleware.
 *
 * Origins are explicit — taken from `CORS_ORIGIN` in the root `.env`, parsed
 * into a list by `@goonfall/config`. The wildcard is never used: an origin
 * outside the allowlist simply receives no `Access-Control-Allow-Origin`
 * header, so the browser blocks it.
 *
 * Credentials are disabled: Phase 1 exposes no authenticated API behavior that
 * would require them. If a later phase needs cookie-authenticated cross-origin
 * calls, this is the single place to revisit.
 */
import { cors } from "hono/cors";

import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: (origin) => (env.CORS_ORIGIN.includes(origin) ? origin : null),
  allowHeaders: ["Content-Type", "X-Request-ID"],
  exposeHeaders: ["X-Request-ID"],
  maxAge: 600,
  credentials: false,
});
