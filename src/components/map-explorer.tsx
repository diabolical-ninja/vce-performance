"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import { MapCanvas } from "@/components/map-canvas";
import { MapList } from "@/components/map-list";
import { MapControls, MapNotices } from "@/components/map-controls";
import {
  inside,
  located,
  mapRange,
  mapLabel,
  pointColor,
  victoria,
  type Bounds,
} from "@/lib/map";
import { formatValue } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

export function MapExplorer({
  rows,
  measure,
  searchArea = null,
  query = "",
}: {
  rows: SchoolRow[];
  measure: Measure;
  searchArea?: Bounds | null;
  query?: string;
}): ReactElement {
  const points = useMemo(
    (): ReturnType<typeof located> => located(rows),
    [rows],
  );
  const range = useMemo(
    (): [number, number] => mapRange(rows, measure),
    [rows, measure],
  );
  const [area, setArea] = useState<{
    viewport: Bounds;
    visible: Bounds;
  }>({ viewport: searchArea ?? victoria, visible: searchArea ?? victoria });
  const [selected, setSelected] = useState(""),
    [failed, setFailed] = useState(false),
    [view, setView] = useState("both");
  const moved = useCallback(
    (bounds: Bounds): void =>
      setArea((previous): typeof previous => ({
        ...previous,
        visible: bounds,
      })),
    [],
  );
  const failure = useCallback((): void => setFailed(true), []);
  const visible = points.filter((row): boolean => inside(row, area.visible));
  const selection = points.find((row): boolean => row.id === selected);
  function reset(): void {
    setArea({
      viewport: { ...victoria },
      visible: victoria,
    });
  }
  return (
    <>
      <MapControls view={view} onView={setView} onReset={reset} />
      <MapNotices query={query} matched={Boolean(searchArea)} failed={failed} />
      <p className="mb-3 text-xs text-muted">
        {visible.length} located records in this area ·{" "}
        {rows.length - points.length} omitted because coordinates are
        unavailable.
      </p>
      <div className="mb-4 flex items-center gap-3 text-xs">
        <span>{formatValue(range[0], measure)}</span>
        <span
          aria-hidden="true"
          className="h-3 w-36"
          style={{
            background: `linear-gradient(to right, ${pointColor(range[0], range)}, ${pointColor(range[1], range)})`,
          }}
        />
        <span>{formatValue(range[1], measure)}</span>
        <span>Grey: unavailable</span>
      </div>
      <div
        className={
          view === "both"
            ? "grid gap-4 lg:grid-cols-[1.5fr_1fr]"
            : "grid min-w-0 gap-4"
        }
      >
        <div className={view === "list" ? "hidden" : "min-w-0"}>
          <MapCanvas
            selected={selected}
            rows={points}
            measure={measure}
            range={range}
            viewport={area.viewport}
            onMove={moved}
            onSelect={setSelected}
            onFailure={failure}
          />
        </div>
        <div className={view === "map" ? "hidden" : "min-w-0"}>
          <MapList
            rows={visible}
            selected={selected}
            measure={measure}
            onSelect={setSelected}
          />
        </div>
      </div>
      <p className="mb-4 text-xs text-muted">
        Equal-sized points show reported values; overlapping points remain
        separate school records in the list.
      </p>
      {selection && (
        <p className="notice mt-4" role="status">
          Selected: {mapLabel(selection, measure)}.{" "}
          <a href={`/schools/${selected}`}>Open school profile</a>
        </p>
      )}
    </>
  );
}
