/**
 * The Where to Buy outlets, for the server only.
 *
 * Kept out of where-to-buy.ts (which the browser bundles) so the directory
 * is never in the page's JavaScript or HTML. It leaves the server only
 * through `searchDirectory`, a search at a time and the nearest few only:
 * /api/where-to-buy/lead answers the lead form with the first search, and
 * /api/where-to-buy/search (behind the access cookie) every one after.
 * `server-only` makes a client import a build error.
 */
import "server-only";
import dealerData from "@/data/dealers-bangalore.json";
import { searchOutlets, type Dealer, type SearchQuery } from "./where-to-buy";

export const DEALERS = dealerData.dealers as Dealer[];

/** One search of the directory: the nearest MAX_SHOWN, never the list. */
export const searchDirectory = (q: SearchQuery) => searchOutlets(DEALERS, q);
