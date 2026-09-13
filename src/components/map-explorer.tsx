"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import { MapCanvas } from "@/components/map-canvas";
import { MapList } from "@/components/map-list";
import { Button } from "@/components/ui/button";
import { inside, located, mapRange, victoria, type Bounds } from "@/lib/map";
import { formatValue, measures } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

export function MapExplorer({
  rows,
  measure,
}: {
  rows: SchoolRow[];
  measure: Measure;
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
    pending: Bounds;
    applied: Bounds;
  }>({ viewport: victoria, pending: victoria, applied: victoria });
  const [selected, setSelected] = useState(""),
    [failed, setFailed] = useState(false),
    [view, setView] = useState("map");
  const moved = useCallback(
    (bounds: Bounds): void =>
      setArea((previous): typeof previous => ({
        ...previous,
        pending: bounds,
      })),
    [],
  );
  const failure = useCallback((): void => setFailed(true), []);
  const visible = points.filter((row): boolean => inside(row, area.applied));
  const selection = points.find((row): boolean => row.id === selected);
  function reset(): void {
    setArea({
      viewport: { ...victoria },
      pending: victoria,
      applied: victoria,
    });
  }
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={reset}>
          All Victoria
        </Button>
        <Button
          onClick={(): void => setArea({ ...area, applied: area.pending })}
        >
          Search this area
        </Button>
        <Button
          variant="outline"
          aria-pressed={view === "list"}
          onClick={(): void => setView(view === "map" ? "list" : "map")}
        >
          {view === "map" ? "Show list" : "Show map"}
        </Button>
      </div>
      <p className="mb-3 text-xs text-muted">
        {visible.length} located records in this area ·{" "}
        {rows.length - points.length} omitted because coordinates are
        unavailable. Equal-sized points show reported values; overlapping points
        remain separate school records in the list.
      </p>
      {failed && (
        <p role="status" className="notice mb-4">
          Map tiles could not be loaded. The school list and exact results
          remain available.
        </p>
      )}
      <div className="mb-4 flex items-center gap-3 text-xs">
        <span>{formatValue(range[0], measure)}</span>
        <span
          aria-hidden="true"
          className="h-3 w-36 bg-gradient-to-r from-blue-300 to-blue-800"
        />
        <span>{formatValue(range[1], measure)}</span>
        <span>Grey: unavailable</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className={view === "list" ? "hidden lg:block" : "block"}>
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
        <div className={view === "map" ? "hidden lg:block" : "block"}>
          <MapList
            rows={visible}
            selected={selected}
            measure={measure}
            onSelect={setSelected}
          />
        </div>
      </div>
      {selection && (
        <p className="notice mt-4" role="status">
          Selected: {selection.name} · {measures[measure].label}:{" "}
          {formatValue(selection[measure], measure)} · Results {selection.year}{" "}
          · Location {selection.locationYear}.{" "}
          <a href={`/schools/${selected}`}>Open school profile</a>
        </p>
      )}
    </>
  );
}
