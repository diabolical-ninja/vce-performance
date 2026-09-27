import type { ReactElement } from "react";
import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

export function MeanCoverage({
  row,
  measure,
  label,
}: {
  row: SchoolRow;
  measure: Measure;
  label?: string;
}): ReactElement | null {
  if (!row.aggregation) return null;
  const years = row.aggregation.years[measure];
  return (
    <span className="mt-1 block text-xs font-normal text-muted">
      {label}
      {years.length === 0 ? (
        "No available years"
      ) : (
        <>
          {years[0]}
          {years.length > 1 && `–${years.at(-1)}`} · {years.length}{" "}
          {years.length === 1 ? "year" : "years"}
          <span className="sr-only">. Available years: {years.join(", ")}</span>
        </>
      )}
    </span>
  );
}
