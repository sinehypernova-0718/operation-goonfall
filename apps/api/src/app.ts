/**
 * The canonical Hono application composition.
 *
 * Exactly one app is assembled here; both runtimes import it unchanged:
 *
 *   - local Node:  `src/server.ts` serves it with @hono/node-server at `/`
 *     (namespaces therefore appear as /api/health, /api/v1/*, /api/auth/*)
 *   - Vercel:      `api/[[...route]].ts` functions are mounted at /api, so the
 *     same paths are prefixed here to keep deployed URLs identical.
 *
 * Middleware order is deterministic and matters:
 *
 *   request ID -> logging -> CORS -> routes -> error handling
 *
 * Logging is installed before CORS so the timing covers the whole pipeline and
 * every response (including CORS preflights and errors) carries a request-ID
 * header. Error handling uses Hono's own onError/notFound rather than a custom
 * mechanism.
 */
import { Hono } from "hono";

import { errorHandler, notFoundHandler } from "./errors/error-handler.js";
import { corsMiddleware } from "./middleware/cors.js";
import { log } from "./middleware/logger.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { routes } from "./routes/index.js";

type Variables = { requestId: string };

export const app = new Hono<{ Variables: Variables }>();

app.use(requestIdMiddleware);

// Request-completion logging: JSON-line, safe fields only — method, path,
// status, duration, request ID. Never bodies, headers or cookies.
app.use(async (c, next) => {
  const startedAt = performance.now();
  await next();
  log("info", {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Math.round(performance.now() - startedAt),
  });
});

app.use(corsMiddleware);

const api = new Hono();
api.route("/api", routes);

app.route("/", api);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export type AppType = typeof app;
