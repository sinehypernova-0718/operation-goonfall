/**
 * Better Auth configuration.
 *
 * Username + password identity for Operation Goonfall, built entirely on the
 * installed Better Auth (v1.7.7) primitives — no parallel auth system, no
 * custom password hashing, no custom session/token layer:
 *
 *   - `emailAndPassword` provides the credential mechanism itself (Better Auth
 *     owns hashing and the `account` credential record);
 *   - the supported `username()` plugin adds the `username` /
 *     `displayUsername` fields, normalizes them (lowercase lookup key, original
 *     casing kept for display), validates and uniqueness-checks them on
 *     registration, and exposes `/sign-in/username`;
 *   - sessions are cookie-based and database-backed through the existing
 *     Drizzle adapter + `@goonfall/db`.
 *
 * About `email`: Better Auth's core schema requires a non-null unique email
 * column on `user`, and its only registration route (`/sign-up/email`)
 * validates a well-formed address before any plugin hook runs; the username
 * plugin ships no email-less registration endpoint. Rather than inventing an
 * unsupported workaround, this project uses the library's own storage with an
 * internal placeholder address derived deterministically from the unique
 * username (`<username>@username.invalid`). It is:
 *   - never collected from users, never displayed, never used for login;
 *   - never part of any application response — every API contract (see
 *     `@goonfall/contracts`) whitelists safe identity fields explicitly, so
 *     the placeholder cannot leak through the app's own endpoints;
 *   - reserved against real mail via the RFC 6761 `.invalid` TLD, so it can
 *     never route anywhere (there is no email infrastructure at all).
 * The public sign-up/sign-in contract (name + username + password /
 * username + password) is enforced by the facade in `../routes/auth.ts`,
 * which mounts `/sign-up` and `/sign-in` ahead of Better Auth's catch-all and
 * disables raw-email sign-up below so no client-supplied address is accepted.
 */
import { db } from "@goonfall/db";
import * as schema from "@goonfall/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

import { env } from "../config/env.js";

/**
 * Internal, never-exposed placeholder address backing Better Auth's required
 * email column. Deterministic from the (unique) username, so uniqueness of the
 * column follows from uniqueness of usernames. See the module comment.
 */
export const internalEmail = (username: string): string =>
  `${username.toLowerCase()}@username.invalid`;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Better Auth is an infrastructure concern of the API, so its base path
  // mirrors the mount point in `app.ts`.
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    // Registration goes exclusively through the username facade
    // (`../routes/auth.ts`), which supplies the internal placeholder itself.
    // Disabling the raw route means `/api/auth/sign-up/email` cannot be
    // reached directly and cannot accept a client-provided email address.
    // Sign-in, sign-out, session and cookie endpoints remain fully mounted;
    // the facade also claims `/sign-in` before the catch-all.
    disableSignUp: true,
  },

  plugins: [
    username({
      // Matches the facade's public validation (3-30 chars, [a-zA-Z0-9_.]);
      // declared explicitly so the policy lives here in one place.
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],
});

export type Auth = typeof auth;
