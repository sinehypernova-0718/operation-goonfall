/**
 * Versioned application API: `/api/v1/*`.
 *
 * This is the mount point for every future Operation Goonfall endpoint —
 * seasons, events, leaderboards and whatever later phases define are added as
 * routes on `v1` (or sub-routers mounted beneath it) without touching the rest
 * of the application.
 *
 * Phase 2 adds the identity endpoint `GET /api/v1/me`, which establishes the
 * public/authenticated boundary via `requireAuth`. No domain routes exist yet
 * by design; authorization beyond "has a session" belongs to later phases.
 */
import { Hono } from "hono";

import { meRoute } from "./me.js";

export const v1 = new Hono();

v1.route("/me", meRoute);
