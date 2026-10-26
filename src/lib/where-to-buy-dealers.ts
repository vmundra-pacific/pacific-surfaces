/**
 * The Where to Buy outlets, for the server only.
 *
 * Kept out of where-to-buy.ts (which the browser bundles) so the directory
 * is never in the page's JavaScript or HTML until the visitor has left
 * their details: /where-to-buy renders it for a visitor holding the access
 * cookie (where-to-buy-access.ts), and /api/where-to-buy/lead returns it
 * once a lead is saved. `server-only` makes a client import a build error.
 */
import "server-only";
import dealerData from "@/data/dealers-bangalore.json";
import type { Dealer } from "./where-to-buy";

export const DEALERS = dealerData.dealers as Dealer[];
