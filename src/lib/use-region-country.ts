"use client";

import { useSyncExternalStore } from "react";
import { REGION_CHANGE_EVENT, readRegion } from "@/lib/region";

function subscribe(onChange: () => void) {
  window.addEventListener(REGION_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(REGION_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The visitor's country (ISO code) from the region selector (lib/region),
 *  or null before it is known: always null while rendering on the server
 *  and hydrating, then the stored country. Re-renders on a change. */
export function useRegionCountry(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readRegion()?.region.country ?? null,
    () => null
  );
}
