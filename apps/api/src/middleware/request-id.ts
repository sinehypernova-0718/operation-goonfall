/**
 * Request-ID middleware.
 *
 * Wraps Hono's built-in `requestId` with the API's fixed policy:
 *
 * - header name: `X-Request-ID`
 * - an incoming value is preserved only if it passes a conservative check —
 *   up to 128 characters of `[A-Za-z0-9._-]`; anything else (missing, too
 *   long, malformed) is replaced with a freshly generated `crypto.randomUUID()`
 * - the ID is stored in the context (`c.get("requestId")`) so logging and
 *   error handling can reach it, and echoed back as a response header.
 */
import { requestId } from "hono/middleware";

const REQUEST_ID_HEADER = "X-Request-ID";

/** Conservative shape for a client-supplied request ID. */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

export const requestIdMiddleware = requestId({
  headerName: REQUEST_ID_HEADER,
  generator: () => crypto.randomUUID(),
  // Hono rejects incoming values longer than `limitLength` or containing
  // characters outside [\w-=]; this callback replaces anything that still
  // fails our stricter pattern, and validates IDs we generate ourselves
  // (which always pass).
  validate: (id) => SAFE_REQUEST_ID.test(id),
});
