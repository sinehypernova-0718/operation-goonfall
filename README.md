--- README.md (原始)


+++ README.md (修改后)
# Operation Goonfall

A private, three-player web application.

> **Status: development workspace only.** The repository contains the monorepo
> scaffold, tooling, and infrastructure wiring. The application itself — game
> rules, scoring, leaderboard, seasons, challenges, dashboard, and the
> authentication UI — has not been built yet.

## Stack

| Layer          | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| Runtime        | Node.js 26                                                   |
| Package mgmt   | pnpm workspaces                                              |
| Task runner    | Turborepo                                                    |
| Frontend       | Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Vue Router + Pinia |
| Backend        | Hono (Node server locally, Vercel function in production)    |
| Auth           | Better Auth                                                  |
| Database       | PostgreSQL on Neon, via Drizzle ORM and `@neondatabase/serverless` |
| Validation     | Zod                                                          |
| Deployment     | Vercel                                                       |

## Repository structure

```
operation-goonfall/
├── apps/
│   ├── api/                    # @goonfall/api — Hono HTTP API
│   │   ├── api/[[...route]].ts # Vercel serverless entrypoint
│   │   └── src/
│   │       ├── app.ts          # canonical Hono composition (both runtimes)
│   │       ├── server.ts       # local dev server (@hono/node-server)
│   │       ├── auth/index.ts   # Better Auth instance
│   │       ├── config/env.ts   # API's single env entry point
│   │       ├── errors/         # ApiError + centralized error handling
│   │       ├── middleware/     # request ID, structured logging, CORS
│   │       └── routes/         # /api/health, /api/v1/*, /api/auth/*
│   └── web/                    # @goonfall/web — Vue 3 SPA
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── router/index.ts
│       │   ├── views/HomeView.vue
│       │   └── style.css       # Tailwind v4 entry (@import "tailwindcss")
│       ├── vite.config.ts
│       └── vercel.json
├── packages/
│   ├── config/                 # @goonfall/config — centralized env parsing
│   ├── contracts/              # @goonfall/contracts — shared types/schemas
│   └── db/                     # @goonfall/db — Drizzle client + schema
│       ├── drizzle.config.ts
│       └── src/schema/auth.ts  # ONLY Better Auth tables, for now
├── .env.example
├── turbo.json
└── pnpm-workspace.yaml
```

Workspace packages export raw TypeScript source and are consumed directly by
Vite and tsx — there is no build step for `packages/*`. Dependency direction is
one-way: `web` and `api` may depend on `contracts`/`config`/`db`, never the
reverse.

## Prerequisites

- **Node.js 26+** — the API uses Node's native `--env-file` flag
- **pnpm 12+** — `corepack enable` is the easiest way to get the pinned version
- A **Neon** PostgreSQL project (see below)

## Installation

```bash
pnpm install
```

## Environment setup

The repository uses a **single environment file** at the root: `.env`. There is
no `.env.development` or `.env.production`. Both apps read from this one file —
`apps/web` via Vite's `envDir`, `apps/api` via `--env-file`.

```bash
cp .env.example .env
```

Then fill in the values. `.env.example` documents each variable.

| Variable             | Exposed to browser | Notes                                              |
| -------------------- | ------------------ | -------------------------------------------------- |
| `APP_ENV`            | no                 | `development` or `production`                       |
| `DATABASE_URL`       | **never**          | Neon connection string, must include `sslmode=require` |
| `BETTER_AUTH_SECRET` | **never**          | At least 32 characters; generate a random value    |
| `BETTER_AUTH_URL`    | no                 | API base URL — `http://localhost:3001` locally      |
| `VITE_API_URL`       | yes                | Leave empty in development; the Vite proxy handles it |

Only variables prefixed with `VITE_` reach browser code. **Never give
`DATABASE_URL` or `BETTER_AUTH_SECRET` a `VITE_` prefix** — that would ship your
database credentials to every visitor.

Environment variables are parsed and validated in exactly one place,
`packages/config/src/env.ts`, so the API, the database package, and the
drizzle-kit CLI all agree on what "valid" means. Misconfiguration fails loudly
at startup with a list of the offending variables.

Generate a secret with:

```bash
node -e "console.log(crypto.randomUUID().replace(/-/g,'') + crypto.randomUUID().replace(/-/g,''))"
```

## Neon setup

1. Create a project at [neon.tech](https://neon.tech) and a database (the
   example uses `operation_goonfall`).
2. Open **Connection Details** and copy the **pooled** connection string.
3. Paste it into `.env` as `DATABASE_URL`. Confirm it ends with
   `?sslmode=require`.

The database client uses the Neon HTTP driver, which is stateless — the same
client works from a long-lived local process and from a Vercel function without
connection-pool exhaustion.

## Better Auth setup

Better Auth is mounted in `apps/api/src/app.ts` at `/api/auth/*`. Its
configuration lives in `apps/api/src/auth/index.ts` and uses the Drizzle adapter
with `provider: "pg"`.

The four tables Better Auth needs — `user`, `session`, `account`,
`verification` — are hand-written in `packages/db/src/schema/auth.ts`. They are
infrastructure tables, verified field-by-field against the installed Better Auth
version. No application tables exist yet.

> **Before first run:** create the tables in your Neon database with the
> migration commands below. Better Auth will not work against an empty database.

Better Auth has no CLI binary of its own. If you later add a plugin that
requires schema changes, regenerate the tables by hand from
`@better-auth/core/dist/db/get-tables.mjs` and then run `pnpm db:generate`.

## Database commands

Run from the repository root:

```bash
pnpm db:generate   # generate SQL migrations from the Drizzle schema
pnpm db:migrate    # apply pending migrations to the Neon database
pnpm db:studio     # open Drizzle Studio
```

The generated SQL lands in `packages/db/drizzle/` and should be committed.

## Starting development

```bash
pnpm dev
```

Turborepo starts everything:

- **Web** — http://localhost:5173
- **API** — http://localhost:3001, health check at `/health`

The Vite dev server proxies `/health` and `/api/*` to the API, so the frontend
can call the API on the same origin with no CORS configuration.

Verify the API is up:

```bash
curl http://localhost:3001/health
# {"status":"ok"}
```

## Deployment notes

`apps/web` and `apps/api` are deployed as two separate Vercel projects from the
same repository. Set the **Root Directory** to `apps/web` and `apps/api`
respectively in each project's settings.

`apps/api/api/[[...route]].ts` is the serverless entrypoint; Vercel mounts it
under `/api`, so the health check becomes `/api/health` in production. Set
`BETTER_AUTH_URL` to the deployed API origin and point `VITE_API_URL` at it.

## Deliberately not configured

This scaffold is intentionally narrow. The following are **not** set up yet and
should be added when the application work begins:

- Linting and formatting (ESLint, Biome, Prettier)
- Testing (Vitest, Jest, Playwright, Cypress, Testing Library)
- Root `build`, `typecheck`, `lint`, or `format` scripts
- CI/CD pipelines and Docker
- Any Operation Goonfall domain logic, database tables, or API routes beyond
  `/health` and the Better Auth mount
