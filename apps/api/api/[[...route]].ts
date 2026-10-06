import { handle } from "hono/vercel";

import { app } from "../src/app.js";

/**
 * Vercel function entrypoint.
 *
 * Exports the same Hono app that `src/server.ts` serves locally, so there is no
 * separate server to keep running and no long-lived process to manage. The
 * catch-all filename means nested paths reach the app — including Better Auth's
 * `/api/auth/*` routes.
 *
 * Vercel mounts this function at `/api`, so deployed routes carry that prefix:
 * the health check is `/api/health`. Local development serves it at the root
 * (`http://localhost:3001/health`) instead.
 *
 * Deploying is out of scope for this bootstrap — this file only makes sure the
 * application is not built around an assumption that it lives in a permanent
 * Node process.
 */
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);