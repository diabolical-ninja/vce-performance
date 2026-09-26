import type { ReactElement } from "react";
import { DataValue } from "@/components/data-value";
import { measures } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure, Selection } from "@/types/data";

export function AnnualTable({
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
  return (
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label="Scrollable annual results"
    >
      <table>
        <caption className="sr-only">Annual {measures[measure].label}</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            {schools.map((school): ReactElement => (
              <th scope="col" className="number" key={school.id}>
                {school.name} · {school.locality}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((year): ReactElement => (
            <tr key={year}>
              <th scope="row">{year}</th>
              {schools.map((school): ReactElement => (
                <td key={school.id} className="number">
                  <DataValue
                    measure={measure}
                    value={
                      rows.find(
                        (row): boolean =>
                          row.id === school.id && row.year === year,
                      )?.[measure] ?? null
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
