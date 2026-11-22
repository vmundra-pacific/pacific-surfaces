import { assertContentSettings } from "@/cms/content-source";

/**
 * Runs once when the server starts. A wrong content-source setting stops
 * the start with a plain message, instead of the site quietly reading
 * from the other store.
 */
export function register(): void {
  assertContentSettings();
}
