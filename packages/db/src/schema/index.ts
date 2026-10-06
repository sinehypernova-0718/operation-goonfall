/**
 * The Drizzle schema.
 *
 * Currently it contains only the tables Better Auth owns. Operation Goonfall's
 * own tables (players, seasons, events, challenges, …) are added here as those
 * features are implemented — this bootstrap deliberately ships no application
 * schema.
 *
 * Re-export each schema module below so `@goonfall/db/schema` stays the single
 * import path for table definitions.
 */
export * from "./auth.js";