/**
 * Identity endpoint: `GET /api/v1/me`.
 *
 * The smallest possible proof of the authenticated-request abstraction:
 * it requires a session (`requireAuth`), resolves the current user from the
 * Hono context, and returns only the safe public identity fields defined by
 * the shared `authenticatedUserSchema` contract — id, name, username.
 *
 * Explicitly NOT a profile-management API: no reads of account/verification
 * records, no email (internal placeholder — see ../auth/index.ts), no session
 * tokens, no password hashes, no internal metadata. Updates, if ever needed,
 * belong to a later phase.
 */
import { authenticatedUserSchema, type AuthenticatedUser } from "@goonfall/contracts";
import { Hono } from "hono";
import { ApiError } from "../../errors/api-error";

import { requireAuth, type AuthContext } from "../../middleware/require-auth.js";

export const meRoute = new Hono<{ Variables: AuthContext }>();

meRoute.get("/", requireAuth, (c) => {
  const user = c.get("user");

  if (!user.username) {
    throw ApiError.internal();
  }

  const body: AuthenticatedUser = authenticatedUserSchema.parse({
    id: user.id,
    name: user.name,
    // `username` is nullable at the DB-schema level (plugin-added column) but
    // is guaranteed present for every account created through this API.
    username: user.username,
  });

  return c.json(body);
});
