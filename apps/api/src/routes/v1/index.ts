/**
 * Versioned application API: `/api/v1/*`.
 *
 * This is the mount point for every future Operation Goonfall endpoint —
 * seasons, events, leaderboards and whatever later phases define are added as
 * routes on `v1` (or sub-routers mounted beneath it) without touching the rest
 * of the application.
 *
 * Phase 1 deliberately ships no domain routes here. The boundary exists so
 * versioning is a routing decision, not a refactor.
 */
import { Hono } from "hono";

export const v1 = new Hono();

// No endpoints yet by design — see Phase 1 scope restrictions.
