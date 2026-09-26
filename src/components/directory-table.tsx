import type { ReactElement } from "react";
import { CarryLink } from "@/components/navigation";
import { SelectSchool } from "@/components/selection";
import { DataValue } from "@/components/data-value";
import type { SchoolRow } from "@/lib/contract";

export function DirectoryTable({
  rows,
  year,
}: {
  rows: SchoolRow[];
  year: number;
}): ReactElement {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">School results · {year}</caption>
        <thead>
          <tr>
            <th scope="col">Select</th>
            <th scope="col">School</th>
            <th scope="col" className="number">
              Median study score
            </th>
            <th scope="col" className="number">
              Study scores 40+ (%)
            </th>
            <th scope="col" className="number">
              Satisfactory VCE completion (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row): ReactElement => (
            <DirectoryRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DirectoryRow({ row }: { row: SchoolRow }): ReactElement {
  return (
    <tr className="hover:bg-accent/40">
      <td>
        <SelectSchool id={row.id} name={`${row.name}, ${row.locality}`} />
      </td>
      <td className="min-w-52">
        <CarryLink href={`/schools/${row.id}`} className="font-medium">
          {row.name}
        </CarryLink>
        <p className="mt-1 text-xs capitalize text-muted">
          {row.locality.toLowerCase()}
        </p>
      </td>
      <td className="number">
        <DataValue value={row.median} measure="median" />
      </td>
      <td className="number">
        <DataValue value={row.high} measure="high" />
      </td>
      <td className="number">
        <DataValue value={row.completion} measure="completion" />
      </td>
    </tr>
  );
}
