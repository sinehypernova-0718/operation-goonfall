/**
 * Minimal structured JSON-line logger built on the console.
 *
 * Deliberately tiny: one function, three levels, no framework. Request
 * completion logs are emitted by the request-logging middleware in `app.ts`;
 * error diagnostics are emitted by the centralized error handler.
 *
 * NEVER extend this to log cookies, authorization headers, request bodies,
 * secrets or any user data. Only the fields passed explicitly here are output.
 */

type LogLevel = "info" | "warn" | "error";

export type LogFields = {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  /** Server-side diagnostic only — never serialized into a client response. */
  error?: unknown;
  /** Free-text log line (startup/boot messages). */
  message?: string;
  /** Which environment this process is running as (boot logs only). */
  appEnv?: string;
};

export function log(level: LogLevel, fields: LogFields): void {
  const line = JSON.stringify({ level, ...fields }, (_key, value: unknown) =>
    // Replacing an Error with its name + message keeps stack traces out of the
    // log stream while preserving the useful part of the diagnostic.
    value instanceof Error ? { name: value.name, message: value.message } : value,
  );

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
