"use client";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { TrendChart } from "@/components/trend-chart";
import { AnnualTable } from "@/components/annual-table";
import { Button } from "@/components/ui/button";
import { measures } from "@/lib/measures";
import { hrefWith } from "@/lib/query";
import type { SchoolRow } from "@/lib/contract";
import type { Measure, Selection } from "@/types/data";

export function ComparisonChart({
  schools,
  rows,
  years,
  measure,
}: {
  schools: Selection[];
  rows: SchoolRow[];
  years: number[];
  measure: Measure;
}): ReactElement {
  const params = useSearchParams(),
    path = usePathname();
  const table = params.get("view") !== "chart",
    full = params.get("scale") === "full";
  function update(key: string, value: string): void {
    // Next integrates native History with useSearchParams. Presentation-only
    // changes are immediate and do not race a server navigation for a measure.
    window.history.pushState(
      null,
      "",
      hrefWith(path, new URLSearchParams(params), { [key]: value }),
    );
  }
  return (
    <>
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2>{measures[measure].label}</h2>
            <p className="mt-1 text-xs text-muted">
              Annual reported values · {measures[measure].unit}
            </p>
          </div>
        </div>
        <TrendChart
          schools={schools}
          rows={rows}
          years={years}
          measure={measure}
          full={full}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-muted">
          <p>
            {full ? "Full scale" : "Focused scale"} ·{" "}
            {measures[measure].definition}
          </p>
          <label className="flex min-h-11 items-center gap-2">
            <input
              className="size-4 min-h-4 accent-primary"
              type="checkbox"
              checked={full}
              onChange={(): void => update("scale", full ? "focused" : "full")}
            />
            Show full scale
          </label>
        </div>
        <p className="px-5 pb-4 text-xs text-muted">
          Straight segments connect reported observations, not estimates for
          intervening years. Missing annual values break the lines. Swipe the
          chart horizontally on small screens; labels retain their size.
        </p>
      </section>
      <section className="mt-5" aria-label="Annual data">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2>Annual data</h2>
          <Button
            variant="outline"
            aria-expanded={table}
            aria-controls="annual-data"
            onClick={(): void => update("view", table ? "chart" : "table")}
          >
            {table ? "Hide annual data table" : "View annual data table"}
          </Button>
        </div>
        {table && (
          <div id="annual-data">
            <AnnualTable
              schools={schools}
              rows={rows}
              years={[...years].reverse()}
              measure={measure}
            />
          </div>
        )}
      </section>
    </>
  );
}
