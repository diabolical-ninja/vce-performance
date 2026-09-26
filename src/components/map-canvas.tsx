"use client";

import { useEffect, useRef, type ReactElement } from "react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import { highlightSchool } from "@/lib/map-selection";
import {
  mapLabel,
  pointColor,
  type Bounds,
  type LocatedSchool,
} from "@/lib/map";
import type { Measure } from "@/types/data";
import "leaflet/dist/leaflet.css";

interface Props {
  selected: string;
  rows: LocatedSchool[];
  measure: Measure;
  range: [number, number];
  viewport: Bounds;
  onMove: (bounds: Bounds) => void;
  onSelect: (id: string) => void;
  onFailure: () => void;
}
export function MapCanvas({
  selected,
  rows,
  measure,
  range,
  viewport,
  onMove,
  onSelect,
  onFailure,
}: Props): ReactElement {
  const container = useRef<HTMLDivElement>(null),
    mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, CircleMarker>());
  const currentSelection = useRef(selected);
  useEffect((): (() => void) => {
    const markerStore = markers.current;
    let cancelled = false;
    void import("leaflet")
      .then((L): void => {
        if (cancelled) return;
        const map = L.map(container.current!, { scrollWheelZoom: false });
        mapRef.current = map;
        map.fitBounds([
          [viewport.south, viewport.west],
          [viewport.north, viewport.east],
        ]);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        })
          .on("tileerror", onFailure)
          .addTo(map);
        rows.forEach((row): void => {
          const marker = L.circleMarker([row.lat, row.lng], {
            radius: 6,
            weight: 1,
            color: "#FFFFFF",
            fillColor: pointColor(row[measure], range),
            fillOpacity: 0.85,
          }).addTo(map);
          markerStore.set(row.id, marker);
          const label = document.createElement("span");
          label.textContent = mapLabel(row, measure);
          marker.bindTooltip(label).on("click", (): void => onSelect(row.id));
        });
        highlightSchool(map, markerStore, currentSelection.current);
        const reportBounds = (): void => {
          const bounds = map.getBounds();
          onMove({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        };
        map.on("moveend", reportBounds);
        reportBounds();
        const element = container.current!;
        const observer = new ResizeObserver((): void => {
          if (element.clientWidth > 0) map.invalidateSize();
        });
        observer.observe(element);
        map.on("unload", (): void => observer.disconnect());
      })
      .catch(onFailure);
    return (): void => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerStore.clear();
    };
  }, [rows, measure, range, viewport, onMove, onSelect, onFailure]);
  useEffect((): void => {
    currentSelection.current = selected;
    if (mapRef.current)
      highlightSchool(mapRef.current, markers.current, selected);
  }, [selected]);
  return (
    <div
      ref={container}
      className="h-[480px] w-full rounded-lg border border-border"
      aria-label="School locations map"
    />
  );
}
