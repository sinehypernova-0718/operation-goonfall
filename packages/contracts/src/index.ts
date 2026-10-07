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

/** Response body of `GET /api/health` on the API. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Stable, machine-readable error codes used across the API. */
export const apiErrorCodes = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "METHOD_NOT_ALLOWED",
  "CONFLICT",
  "UNPROCESSABLE_CONTENT",
  "TOO_MANY_REQUESTS",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

/** The single error envelope every API error is serialized through. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.enum(apiErrorCodes),
    message: z.string(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/**
 * Safe public identity returned by authenticated endpoints
 * (`GET /api/v1/me`). Deliberately minimal: only what identifies the current
 * user to the client. Never add email (an internal placeholder — see
 * `apps/api/src/auth/index.ts`), credentials, session tokens or any
 * authentication metadata to this shape.
 */
export const authenticatedUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  username: z.string().min(1),
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
