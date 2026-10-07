/**
 * Request-ID middleware.
 *
 * Policy:
 *
 * - header name: `X-Request-ID`
 * - an incoming value is preserved only if it passes a conservative check —
 *   up to 128 characters of `[A-Za-z0-9._-]`; anything else (missing, too
 *   long, malformed) is replaced with a freshly generated `crypto.randomUUID()`
 * - the ID is stored in the context (`c.get("requestId")`) so logging and
 *   error handling can reach it, and echoed back as a response header.
 *
 * Implemented directly rather than on top of Hono's built-in `requestId`,
 * which cannot express this validation policy (no `validate` option; its
 * default character whitelist would wrongly reject IDs containing `.`, such
 * as UUIDs).
 */
import type { MiddlewareHandler } from "hono";

const REQUEST_ID_HEADER = "X-Request-ID";

/** Conservative shape for a client-supplied request ID. */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const incoming = c.req.header(REQUEST_ID_HEADER);
  const requestId = incoming !== undefined && SAFE_REQUEST_ID.test(incoming)
    ? incoming
    : crypto.randomUUID();

  c.set("requestId", requestId);
  c.header(REQUEST_ID_HEADER, requestId);
  await next();
};
