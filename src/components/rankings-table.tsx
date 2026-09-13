import type { ReactElement } from "react";
import { DataValue } from "@/components/data-value";
import { CarryLink } from "@/components/navigation";
import { RankingContext } from "@/components/ranking-context";
import { measures } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

export function RankingsTable({
  entries,
  measure,
  year,
}: {
  entries: { row: SchoolRow; rank: number }[];
  measure: Measure;
  year: number;
}): ReactElement {
  const secondary = measure === "high" ? "median" : "high";
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">
          {measures[measure].label} rankings · {year}
        </caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">School</th>
            <th scope="col" className="number">
              {measures[measure].label}
              <RankingScale maximum={measures[measure].max} />
            </th>
            <th scope="col" className="number hidden md:table-cell">
              {measures[secondary].label}
            </th>
            <th scope="col" className="number hidden md:table-cell">
              VCE completion (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ row, rank }): ReactElement => (
            <tr key={row.id} className="hover:bg-accent/40">
              <td className="w-10 px-3 tabular-nums text-muted md:w-16">
                {rank}
              </td>
              <td className="min-w-32 px-3 md:min-w-48 md:px-4">
                <CarryLink className="font-medium" href={`/schools/${row.id}`}>
                  {row.name}
                </CarryLink>
                <p className="mt-1 text-xs capitalize text-muted">
                  {row.locality.toLowerCase()}
                </p>
                <RankingContext row={row} />
              </td>
              <td className="number w-28 min-w-24 px-3 md:w-auto md:min-w-40 md:px-4">
                <DataValue value={row[measure]} measure={measure} bar />
              </td>
              <td className="number hidden md:table-cell">
                <DataValue value={row[secondary]} measure={secondary} />
              </td>
              <td className="number hidden md:table-cell">
                <DataValue value={row.completion} measure="completion" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function RankingScale({
  maximum,
}: {
  maximum: number | null;
}): ReactElement | null {
  return maximum === null ? null : (
    <span className="mt-2 flex justify-between font-normal">
      <span>0</span>
      <span>{maximum}</span>
    </span>
  );
}
