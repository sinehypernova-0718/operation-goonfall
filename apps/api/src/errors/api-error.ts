/**
 * The API's error abstraction.
 *
 * An `ApiError` carries everything needed to serialize the standard error
 * envelope — a stable machine-readable `code`, a safe human-readable `message`
 * and the HTTP `status` — plus an optional server-side `cause` for structured
 * logging. The cause is never included in the client response.
 *
 * Messages must be written for clients: put diagnostics in `cause`, never in
 * `message`.
 */
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { ApiErrorCode } from "@goonfall/contracts";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: ContentfulStatusCode;
  /** Server-side diagnostic only — never serialized to the client. */
  readonly cause: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: ContentfulStatusCode,
    cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }

  static readonly badRequest = (message = "The request is invalid.", cause?: unknown) =>
    new ApiError("BAD_REQUEST", message, 400, cause);

  static readonly unauthorized = (message = "Authentication is required.", cause?: unknown) =>
    new ApiError("UNAUTHORIZED", message, 401, cause);

  static readonly forbidden = (message = "You do not have access to this resource.", cause?: unknown) =>
    new ApiError("FORBIDDEN", message, 403, cause);

  static readonly notFound = (message = "Route not found.", cause?: unknown) =>
    new ApiError("NOT_FOUND", message, 404, cause);

  static readonly methodNotAllowed = (message = "Method not allowed.", cause?: unknown) =>
    new ApiError("METHOD_NOT_ALLOWED", message, 405, cause);

  static readonly conflict = (message = "The request conflicts with the current state.", cause?: unknown) =>
    new ApiError("CONFLICT", message, 409, cause);

  static readonly unprocessable = (message = "The request could not be processed.", cause?: unknown) =>
    new ApiError("UNPROCESSABLE_CONTENT", message, 422, cause);

  static readonly internal = (cause?: unknown) =>
    new ApiError("INTERNAL_ERROR", "An internal server error occurred.", 500, cause);
}
