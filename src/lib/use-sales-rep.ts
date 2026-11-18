"use client";

import { repFor, type SalesRep } from "@/data/sales-reps";
import { useRegionCountry } from "@/lib/use-region-country";

/** The visitor's regional sales rep for WhatsApp and Call (data/sales-reps):
 *  the international contact until the region is known, then the region's. */
export function useSalesRep(): SalesRep {
  return repFor(useRegionCountry());
}
