import { z } from "zod";

/**
 * Shared request/response contracts between the API and the web app.
 *
 * The API validates its input against these schemas and the web app derives its
 * types from them, so the two can never drift apart.
 *
 * Deliberately tiny: this package currently holds only the health check that
 * proves the workspace is wired correctly. Game, leaderboard, season and
 * challenge contracts get added here as those features are implemented.
 *
 * This package must not import from `apps/*` or from `@goonfall/db`.
 */

/** Response body of `GET /health` on the API. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;