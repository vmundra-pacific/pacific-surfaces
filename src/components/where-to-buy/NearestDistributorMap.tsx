"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./nearest-distributor.css";

/**
 * The map under the Poland nearest-distributor result: the distributor and
 * the visitor's postal code, fitted to both. OpenStreetMap tiles through
 * Leaflet, no API key; postal code positions are GeoNames' (CC BY 4.0), so
 * both are credited. Loaded in the browser only (next/dynamic, ssr: false),
 * since Leaflet touches `window` on import.
 */
export default function NearestDistributorMap({
  origin,
  place,
  originLabel,
}: {
  origin: { lat: number; lng: number };
  place: { lat: number; lng: number; name: string };
  originLabel: string;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.control.zoom({ position: "topright" }).addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · postal codes <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a>',
    }).addTo(m);
    m.attributionControl.setPrefix(false);

    L.marker([origin.lat, origin.lng], {
      icon: L.divIcon({
        className: "nd-you",
        html: "<span></span>",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      keyboard: false,
    })
      .addTo(m)
      .bindTooltip(originLabel, {
        direction: "bottom",
        offset: [0, 10],
        className: "nd-tip",
      });
    L.marker([place.lat, place.lng], {
      icon: L.divIcon({
        className: "nd-pin",
        html: "<span></span>",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      keyboard: false,
    })
      .addTo(m)
      .bindTooltip(place.name, {
        permanent: true,
        direction: "top",
        offset: [0, -12],
        className: "nd-tip",
      });

    m.fitBounds(
      L.latLngBounds([
        [origin.lat, origin.lng],
        [place.lat, place.lng],
      ]),
      { padding: [56, 56], maxZoom: 11 }
    );
    return () => {
      m.remove();
    };
  }, [origin.lat, origin.lng, place.lat, place.lng, place.name, originLabel]);

  return (
    <div
      ref={box}
      className="nd-map h-full w-full"
      role="img"
      aria-label={`Map showing ${place.name} and ${originLabel}`}
    />
  );
}
