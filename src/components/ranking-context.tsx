import type { ReactElement } from "react";
import type { SchoolRow } from "@/lib/contract";
import { DataValue } from "@/components/data-value";

export function RankingContext({ row }: { row: SchoolRow }): ReactElement {
  return (
    <details className="mt-1 text-xs">
      <summary className="py-2 font-normal text-muted">School context</summary>
      {row.aggregation && (
        <p className="mb-2">
          Context averages · {row.aggregation.startYear}–
          {row.aggregation.endYear}; latest sector shown below.
        </p>
      )}
      <p className="mb-2">
        {row.profileYear === null
          ? "No same-year school profile is available."
          : `${row.sector} sector · ${row.schoolType} · ACARA ${row.profileYear}`}
      </p>
      <dl className="space-y-2">
        <div className="flex justify-between gap-4">
          <dt>Whole-school enrolments</dt>
          <dd>
            <DataValue value={row.enrolments} measure="enrolments" />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>ICSEA</dt>
          <dd>
            <DataValue value={row.icsea} measure="icsea" />
          </dd>
        </div>
      </dl>
    </details>
  );
}
