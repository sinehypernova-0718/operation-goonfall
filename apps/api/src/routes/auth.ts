/**
 * Sign-up/sign-in facade: `/api/auth/sign-up` and `/api/auth/sign-in`.
 *
 * Operation Goonfall authenticates with **username + password** only. This
 * module adapts Better Auth's endpoints to that external contract without
 * inventing a parallel authentication system — passwords are still hashed by
 * Better Auth, sessions are still created and stored by Better Auth, and every
 * response (including its `set-cookie` headers) passes through untouched.
 * Both routes are registered ahead of Better Auth's catch-all in
 * `./index.ts`, so the raw email-shaped paths are no longer reachable.
 *
 *   POST /sign-up   { name, username, password }  -> Better Auth sign-up
 *   POST /sign-in   { username, password }        -> Better Auth /sign-in/username
 *
 * Why the sign-up facade exists: Better Auth v1.7.7's built-in sign-up route
 * (`/sign-up/email`) validates `email` as a required, well-formed address
 * before any plugin hook runs, while its supported username plugin offers no
 * email-less registration endpoint of its own. The platform requires no email,
 * so this route performs the public validation itself and delegates to
 * `auth.api.signUpEmail`, supplying an internal, never-displayed placeholder
 * address derived from the unique username (see `internalEmail` in
 * `../auth/index.ts`). The username/password flow itself is entirely Better
 * Auth's: the username plugin's hooks normalize and uniqueness-check the
 * username during creation (registration keeps the plugin's full validation),
 * and the password is hashed by Better Auth. Because the facade calls the API
 * programmatically rather than over HTTP, `disableSignUp: true` in the auth
 * configuration does not block it — it only removes the raw public route.
 *
 * Security notes:
 * - Duplicate usernames receive Better Auth's generic "username is already
 *   taken" failure; nothing about existing accounts leaks otherwise.
 * - Invalid credentials surface as Better Auth's generic
 *   "Invalid username or password" — it never distinguishes unknown usernames
 *   from wrong passwords.
 * - Request bodies contain passwords. They are parsed here and never logged;
 *   the app-level request logger records method/path/status only.
 */
import type { Context } from "hono";

import { z } from "zod";

import { Hono } from "hono";

import { auth, internalEmail } from "../auth/index.js";
import { ApiError } from "../errors/api-error.js";

/** Public sign-up body: exactly name + username + password. No email field. */
const signUpBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  // Mirrors the Better Auth username plugin policy configured in
  // ../auth/index.ts (3-30 chars, [a-zA-Z0-9_.]) so clients get the standard
  // error envelope instead of a pass-through 400 from deeper inside the
  // library.
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username may only contain letters, numbers, underscores and dots.",
    ),
  // Matches Better Auth's default minimum password length (8).
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/** Public sign-in body: exactly username + password. No email field. */
const signInBodySchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

/**
 * Parse the JSON body against `schema`, converting any failure (malformed
 * JSON included) into the project's standard 422 envelope. The invalid input
 * itself is never echoed back or logged.
 */
async function parseBody<T extends z.ZodTypeAny>(c: Context, schema: T) {
  const json = await c.req.json().catch(() => null);
  const result = schema.safeParse(json);

  if (!result.success) {
    throw ApiError.unprocessable(result.error.issues[0]?.message ?? "The request is invalid.");
  }

  return result.data as z.infer<T>;
}

/**
 * Better Auth throws its own `APIError`s; unwrap them into `ApiError`s so the
 * centralized handler serializes auth failures through the same envelope as
 * everything else. Only the library's safe client message survives — its
 * internals/stack go to the server-side cause.
 */
function rethrowAsApiError(error: unknown): never {
  const candidate = error as {
    statusCode?: number;
    body?: { message?: string };
    headers?: Headers;
  };

  if (typeof candidate?.statusCode === "number" && typeof candidate.body?.message === "string") {
    const status = candidate.statusCode >= 400 && candidate.statusCode < 600
      ? candidate.statusCode
      : 500;

    throw new ApiError(
      status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : status === 409 ? "CONFLICT" : status === 422 ? "UNPROCESSABLE_CONTENT" : status < 500 ? "BAD_REQUEST" : "INTERNAL_ERROR",
      candidate.body.message,
      status as 400 | 401 | 403 | 409 | 422 | 500,
      error,
    );
  }

  throw ApiError.internal(error);
}

export const authRoute = new Hono();

authRoute.post("/sign-up", async (c) => {
  const { name, username, password } = await parseBody(c, signUpBodySchema);

  try {
    // Better Auth's own sign-up API: it hashes the password, creates the user
    // + credential account + session through the Drizzle adapter, sets the
    // session cookie, and runs the username plugin's normalization/uniqueness
    // validation for registration paths. The placeholder email is internal
    // bookkeeping only (never collected, never displayed) — see ../auth/index.ts.
    const result = await auth.api.signUpEmail({
      headers: c.req.raw.headers,
      body: {
        name,
        username,
        password,
        email: internalEmail(username),
      },
    });
    return c.json(result);
  } catch (error) {
    rethrowAsApiError(error);
  }
});

authRoute.post("/sign-in", async (c) => {
  const body = await parseBody(c, signInBodySchema);

  try {
    // Better Auth's username-plugin sign-in: resolves the account by username,
    // verifies the Better Auth password hash, creates the DB-backed session and
    // sets the session cookie. Generic failures only — no account enumeration.
    const result = await auth.api.signInUsername({
      headers: c.req.raw.headers,
      body,
    });
    return c.json(result);
  } catch (error) {
    rethrowAsApiError(error);
  }
});
