import { serve } from "@hono/node-server";

// Imported first so the environment is validated before anything else loads.
import { env } from "./config/env.js";
import { app } from "./app.js";

/**
 * Local development server.
 *
 * Vercel does not use this file — it runs `api/index.ts` as a function. This
 * entrypoint exists so `pnpm dev` can start the API as an ordinary Node process
 * with file watching, which is what makes local development quick.
 */
const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port} (${env.APP_ENV})`);
});