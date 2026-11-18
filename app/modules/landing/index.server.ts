import { db } from "~/db";
import { getLandingPage, type Db } from "./lib/landing";

export type {
  CatalogueStats,
  FeaturedCourse,
  LandingPage,
  Topic,
} from "./lib/landing";

/**
 * The landing page's data bound to a database. The app uses `landing`, which
 * reads the app database; tests build their own against a test database.
 */
export function createLanding(database: Db) {
  return {
    /**
     * The newest published courses, each with its lesson count; the
     * categories with the most published courses; and the size of the
     * published catalogue. Drafts and archived courses count
     * for nothing.
     */
    get() {
      return getLandingPage(database);
    },
  };
}

// Pure so a route importing this only for its loader doesn't pull the
// database into the client bundle (see `~/db`).
export const landing = /* @__PURE__ */ createLanding(db);
