/**
 * Authenticated-request middleware: `requireAuth`.
 *
 * The single reusable session-resolution step for protected routes:
 *
 *   request -> auth.api.getSession({ headers }) -> valid session?
 *     ├── no  -> ApiError.unauthorized()  (standard 401 envelope)
 *     └── yes -> c.set("user" | "session") for downstream handlers
 *
 * Handlers never call Better Auth themselves and never re-implement session
 * lookup — they read the authenticated identity from the Hono context via the
 * exported `AuthContext` type.
 *
 * Scope discipline: this layer establishes only the public/authenticated
 * distinction. No roles, no permissions, no game-domain authorization — those
 * belong to later phases and will be layered on top of (not inside) this.
 *
 * Security: an invalid/expired/missing session always produces the same
 * generic 401; nothing about why the session failed is returned or logged.
 * Session tokens live in cookies, which the request logger never touches.
 */
import type { MiddlewareHandler } from "hono";

import { auth } from "../auth/index.js";
import { ApiError } from "../errors/api-error.js";

/**
 * Context variables populated by `requireAuth`. Routes that require auth
 * should be declared with this type so `c.get("user")` is fully typed:
 *
 *   const route = new Hono<{ Variables: AuthContext }>();
 */
export type AuthContext = {
  /** The authenticated user record (Better Auth's `user` shape). */
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  /** The resolved session record (Better Auth's `session` shape). */
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"];
};

export const requireAuth: MiddlewareHandler<{ Variables: AuthContext }> = async (c, next) => {
  // Cookie-based resolution through Better Auth's own server API — the
  // library validates the session token, expiry and DB state itself.
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    throw ApiError.unauthorized();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};
