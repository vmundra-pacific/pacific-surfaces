"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FACTORY } from "@/data/business";
import type { Origin, Ranked } from "@/lib/where-to-buy";

/**
 * The slippy map for /where-to-buy: OpenStreetMap tiles through Leaflet,
 * no API key, attribution shown. Tiles are greyed in CSS to sit in the
 * site's black-on-white skin; markers are numbered to match the list.
 *
 * The Pacific factory in Hosur is always on the map, whatever was
 * searched, with a factory icon; it is not an outlet, so it is never in
 * the list (marketing, 2026-10-26). It sits outside the view fitted to
 * the results, so a control in the corner flies to it, and its popup
 * shows the plant's photographs and the Google Business Profile.
 *
 * Loaded only in the browser (next/dynamic, ssr: false) since Leaflet
 * touches `window` on import.
 */

const BENGALURU: L.LatLngTuple = [12.9716, 77.5946];

function pinIcon(n: number, active: boolean) {
  const size = active ? 34 : 26;
  return L.divIcon({
    className: "wtb-pin",
    html: `<span data-active="${active}" style="width:${size}px;height:${size}px">${n}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const originIcon = L.divIcon({
  className: "wtb-origin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FACTORY_AT: L.LatLngTuple = [FACTORY.geo.latitude, FACTORY.geo.longitude];

/** lucide's "factory" icon, as markup for Leaflet's DOM. */
const FACTORY_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M8 16h.01"/></svg>';

const factoryIcon = L.divIcon({
  className: "wtb-factory",
  html: `<span>${FACTORY_SVG}</span>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function DealerMap({
  results,
  origin,
  activeId,
  focusToken,
  onSelect,
  popupFor,
  factoryPopup,
}: {
  results: Ranked[];
  origin: Origin | null;
  activeId: string | null;
  /** Bumped when the list asks the map to fly to the active outlet. */
  focusToken: number;
  onSelect: (id: string) => void;
  /** Renders the popup's HTML element for an outlet. */
  popupFor: (r: Ranked, index: number) => HTMLElement;
  /** Renders the factory's popup. */
  factoryPopup: () => HTMLElement;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(
    new Map<string, { marker: L.Marker; index: number }>()
  );
  const originMarker = useRef<L.Marker | null>(null);
  /** Re-applies the current fit (after the box was hidden, say). */
  const refit = useRef<() => void>(() => {});
  /** Whether the box had no size when last measured. */
  const wasHidden = useRef(false);
  const select = useRef(onSelect);
  const popup = useRef(popupFor);
  const factoryPop = useRef(factoryPopup);
  select.current = onSelect;
  popup.current = popupFor;
  factoryPop.current = factoryPopup;

  // Create once.
  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, {
      center: BENGALURU,
      zoom: 11,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.control.zoom({ position: "topright" }).addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(m);
    m.attributionControl.setPrefix(false);
    // Wheel zoom only once the visitor has clicked into the map, so the
    // page scrolls past it freely.
    m.on("click focus", () => m.scrollWheelZoom.enable());
    m.on("mouseout blur", () => m.scrollWheelZoom.disable());
    layer.current = L.layerGroup().addTo(m);
    map.current = m;

    // The factory: on the map for every search, never in the list.
    const factory = L.marker(FACTORY_AT, {
      icon: factoryIcon,
      title: "Pacific Surfaces factory, Hosur",
      alt: "Pacific Surfaces factory",
      keyboard: true,
      riseOnHover: true,
      zIndexOffset: 500,
    })
      .bindTooltip("Our factory", {
        permanent: true,
        direction: "right",
        offset: [16, 0],
        className: "wtb-factory-label",
      })
      .bindPopup(() => factoryPop.current(), {
        maxWidth: 320,
        minWidth: 280,
        autoPanPadding: [24, 24],
        className: "wtb-factory-popup",
      })
      .addTo(m);
    // And a way to it from any view.
    const FactoryControl = L.Control.extend({
      onAdd() {
        const b = L.DomUtil.create("button", "wtb-factory-control");
        b.type = "button";
        b.setAttribute("data-testid", "factory-control");
        b.innerHTML = `${FACTORY_SVG}<span>Our factory</span>`;
        L.DomEvent.disableClickPropagation(b);
        L.DomEvent.on(b, "click", () => {
          m.flyTo(FACTORY_AT, Math.max(m.getZoom(), 13), { duration: 0.8 });
          m.once("moveend", () => factory.openPopup());
        });
        return b;
      },
    });
    new FactoryControl({ position: "topleft" }).addTo(m);
    // The box may be hidden at first (the List view on phones): when it
    // gets a size, fit the results again, since a fit into 0 x 0 is lost.
    wasHidden.current =
      box.current.clientWidth === 0 || box.current.clientHeight === 0;
    const ro = new ResizeObserver(() => {
      const el = box.current;
      if (!el) return;
      const hidden = el.clientWidth === 0 || el.clientHeight === 0;
      m.invalidateSize();
      if (wasHidden.current && !hidden) refit.current();
      wasHidden.current = hidden;
    });
    ro.observe(box.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);

  // Markers for the current results, and a view that fits them.
  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    markers.current.clear();
    results.forEach((r, i) => {
      const marker = L.marker([r.dealer.lat, r.dealer.lng], {
        icon: pinIcon(i + 1, false),
        title: r.dealer.name,
        keyboard: true,
        riseOnHover: true,
      });
      marker.bindPopup(() => popup.current(r, i), {
        maxWidth: 300,
        minWidth: 240,
        autoPanPadding: [24, 24],
        closeButton: true,
      });
      marker.on("click", () => select.current(r.dealer.id));
      marker.addTo(g);
      markers.current.set(r.dealer.id, { marker, index: i });
    });

    originMarker.current?.remove();
    originMarker.current = null;
    if (origin) {
      originMarker.current = L.marker([origin.lat, origin.lng], {
        icon: originIcon,
        interactive: false,
        keyboard: false,
        zIndexOffset: -100,
      }).addTo(m);
    }

    // Fit: the origin and its nearest few, or everything.
    const pts: L.LatLngTuple[] = (origin ? results.slice(0, 6) : results).map(
      (r) => [r.dealer.lat, r.dealer.lng]
    );
    if (origin) pts.push([origin.lat, origin.lng]);
    refit.current = () => {
      if (pts.length === 1) m.setView(pts[0], 14);
      else if (pts.length)
        m.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 14 });
    };
    refit.current();
  }, [results, origin]);

  // Highlight the active outlet.
  useEffect(() => {
    markers.current.forEach(({ marker, index }, id) => {
      const on = id === activeId;
      marker.setIcon(pinIcon(index + 1, on));
      marker.setZIndexOffset(on ? 1000 : 0);
    });
  }, [activeId, results]);

  // Fly to it when the list asks.
  useEffect(() => {
    if (!focusToken || !activeId) return;
    const hit = markers.current.get(activeId);
    const m = map.current;
    if (!hit || !m) return;
    // The box has just been shown (phones): size it now and let the fly-to
    // stand instead of a refit.
    m.invalidateSize();
    wasHidden.current = false;
    m.flyTo(hit.marker.getLatLng(), Math.max(m.getZoom(), 14), {
      duration: 0.6,
    });
    m.once("moveend", () => hit.marker.openPopup());
  }, [focusToken, activeId]);

  return (
    <div
      ref={box}
      data-lenis-prevent
      className="wtb-map h-full w-full"
      role="region"
      aria-label="Map of Pacific Surfaces outlets"
    />
  );
}
