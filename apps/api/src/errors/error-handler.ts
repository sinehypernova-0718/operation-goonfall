/**
 * Centralized error handling for the API.
 *
 * Registered via Hono's `app.onError` / `app.notFound`, so every runtime that
 * serves the canonical app (local Node and the Vercel function) shares it.
 *
 * Rules:
 * - Known `ApiError`s serialize through the standard envelope with their own
 *   status; their server-side cause is logged, never sent to the client.
 * - Everything else becomes a generic 500 `INTERNAL_ERROR`. Raw exception
 *   messages are never exposed — they can contain SQL, connection strings or
 *   filesystem paths. The full diagnostic goes to the structured log instead.
 */
import type { ErrorHandler, NotFoundHandler } from "hono";

import type { ApiErrorBody } from "@goonfall/contracts";

import { ApiError } from "./api-error.js";
import { log } from "../middleware/logger.js";

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get("requestId");
  const apiError = err instanceof ApiError ? err : ApiError.internal(err);

  if (!(err instanceof ApiError)) {
    // Unhandled failure: keep the real diagnostic server-side only.
    log("error", {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: 500,
      error: err,
    });
  } else if (apiError.cause !== undefined) {
    log("warn", {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: apiError.status,
      error: apiError.cause,
    });
  }

  const body: ApiErrorBody = {
    error: { code: apiError.code, message: apiError.message },
  };

  const response = c.json(body, apiError.status);
  if (requestId) response.headers.set("X-Request-ID", requestId);
  return response;
};

export const notFoundHandler: NotFoundHandler = () => {
  throw ApiError.notFound();
};
