import { handle } from "hono/vercel";

import { app } from "../src/app.js";

/**
 * Vercel function entrypoint.
 *
 * Exports the same Hono app that `src/server.ts` serves locally — one canonical
 * composition (`src/app.ts`), two runtime adapters — so there is no separate
 * server to keep running and no long-lived process to manage. The catch-all
 * filename means nested paths reach the app — including Better Auth's
 * `/api/auth/*` routes.
 *
 * Vercel mounts this function at `/api` and strips that prefix before invoking
 * it, which is why `src/app.ts` registers its namespaces under `/api` itself:
 * deployed requests arrive as `/health`, `/v1/*` and `/auth/*` after stripping,
 * and the app re-applies the prefix so both runtimes expose identical URLs —
 * `/api/health`, `/api/v1/*`, `/api/auth/*`.
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
