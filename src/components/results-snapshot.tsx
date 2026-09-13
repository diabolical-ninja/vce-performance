import type { ReactElement } from "react";
import { DataValue } from "@/components/data-value";
import { CarryLink } from "@/components/navigation";
import { measures } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure, Selection } from "@/types/data";

export function ResultsSnapshot({
  schools,
  rows,
  year,
  measure,
}: {
  schools: Selection[];
  rows: SchoolRow[];
  year: number;
  measure: Measure;
}): ReactElement {
  return (
    <section className="mt-7">
      <div className="mb-4 flex justify-between gap-3">
        <h2>Results at a glance</h2>
        <span className="text-xs text-muted">{year} results</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">School</th>
              <th scope="col" className="number">
                {measures[measure].label}
              </th>
              <th scope="col" className="number">
                Change from {year - 1}
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school): ReactElement => (
              <SnapshotRow
                key={school.id}
                school={school}
                rows={rows}
                year={year}
                measure={measure}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Changes compare annual school results. The students in each year are
        different.
      </p>
    </section>
  );
}
function SnapshotRow({
  school,
  rows,
  year,
  measure,
}: {
  school: Selection;
  rows: SchoolRow[];
  year: number;
  measure: Measure;
}): ReactElement {
  const value =
    rows.find((row): boolean => row.id === school.id && row.year === year)?.[
      measure
    ] ?? null;
  const previous =
    rows.find(
      (row): boolean => row.id === school.id && row.year === year - 1,
    )?.[measure] ?? null;
  return (
    <tr>
      <td>
        <CarryLink href={`/schools/${school.id}`}>{school.name}</CarryLink>
      </td>
      <td className="number">
        <DataValue value={value} measure={measure} />
      </td>
      <td className="number">{change(value, previous, measure)}</td>
    </tr>
  );
}
function change(
  value: number | null,
  previous: number | null,
  measure: Measure,
): ReactElement {
  if (value === null || previous === null)
    return <span aria-label="Unavailable in this dataset">—</span>;
  const delta = value - previous;
  return (
    <span>
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)} {measures[measure].unit}
    </span>
  );
}
