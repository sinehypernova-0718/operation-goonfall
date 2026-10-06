import { z } from "zod";

/**
 * The single place environment variables are read and validated.
 *
 * Everything that needs configuration imports from here, so there is exactly
 * one definition of what is required and one error message when something is
 * missing. Nothing else in the workspace should touch `process.env` directly.
 */

/** Which environment a process is running as. */
export const appEnvs = ["development", "production"] as const;

export type AppEnv = (typeof appEnvs)[number];

export const serverEnvSchema = z.object({
  APP_ENV: z.enum(appEnvs).default("development"),

  /** Neon PostgreSQL connection string. */
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: "DATABASE_URL must be a postgres:// or postgresql:// connection string",
  }),

  /** Signing secret for sessions and tokens. */
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  /** Public origin of the API, as the browser reaches it. */
  BETTER_AUTH_URL: z.url({ error: "BETTER_AUTH_URL must be a full URL" }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Thrown when the process environment does not satisfy {@link serverEnvSchema}. */
export class EnvValidationError extends Error {
  constructor(issues: string[]) {
    super(`Invalid environment configuration:\n${issues.join("\n")}`);
    this.name = "EnvValidationError";
  }
}

/**
 * Validate a raw environment bag and return typed, parsed configuration.
 *
 * Kept pure — it takes the environment rather than reading the global — so it
 * stays easy to call from a script, a test, or a deployment adapter.
 */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const key = issue.path.join(".") || "(root)";
      return `  - ${key}: ${issue.message}`;
    });

    throw new EnvValidationError([
      ...issues,
      "",
      "Copy .env.example to .env in the repository root and fill in the missing values.",
    ]);
  }

  return result.data;
}

/** Validate `process.env`. The API calls this once at startup and fails fast. */
export function loadServerEnv(): ServerEnv {
  return parseServerEnv(process.env);
}