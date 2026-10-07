/**
 * Liveness endpoint: `GET /api/health`.
 *
 * Intentionally cheap — it confirms the HTTP application is alive and nothing
 * more. It must never query PostgreSQL/Neon, check dependencies, or require
 * authentication; dependency problems belong to deployment monitoring, not
 * this endpoint.
 */
import { healthResponseSchema, type HealthResponse } from "@goonfall/contracts";
import { Hono } from "hono";

export const healthRoute = new Hono();

healthRoute.get("/", (c) => {
  const body: HealthResponse = healthResponseSchema.parse({ status: "ok" });
  return c.json(body);
});
