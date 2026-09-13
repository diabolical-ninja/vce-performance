import type { SchoolRow } from "@/lib/contract";
import type { FilterState, Selection } from "@/types/data";

export function yearsOf(rows: SchoolRow[]): number[] {
  return [...new Set(rows.map((row): number => row.year))].sort(
    (a, b): number => b - a,
  );
}
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
export function matchesSchool(school: Selection, query: string): boolean {
  return normalize(`${school.name} ${school.locality}`).includes(
    normalize(query),
  );
}
export function directory(rows: SchoolRow[]): Selection[] {
  return [
    ...new Map(
      rows.map((row): [string, Selection] => [
        row.id,
        { id: row.id, name: row.name, locality: row.locality },
      ]),
    ).values(),
  ].sort(
    (a, b): number =>
      a.name.localeCompare(b.name) || a.locality.localeCompare(b.locality),
  );
}
export function filterRows(rows: SchoolRow[], state: FilterState): SchoolRow[] {
  const annual = rows.filter((row): boolean => row.year === state.year);
  const hasContext = annual.some((row): boolean => row.profileYear !== null);
  return annual.filter(
    (row): boolean =>
      matchesSchool(row, state.query) &&
      (!hasContext || !state.sector || row.sector === state.sector) &&
      (!hasContext ||
        !state.minimum ||
        (row.enrolments !== null && row.enrolments >= state.minimum)),
  );
}
export function ranked(
  rows: SchoolRow[],
  state: FilterState,
): { row: SchoolRow; rank: number }[] {
  const eligible = rows
    .filter((row): boolean => row[state.measure] !== null)
    .sort(
      (a, b): number =>
        Number(b[state.measure]) - Number(a[state.measure]) ||
        a.name.localeCompare(b.name) ||
        a.locality.localeCompare(b.locality),
    );
  let rank = 0;
  let previous: number | null = null;
  return eligible
    .map((row, index): { row: SchoolRow; rank: number } => {
      if (row[state.measure] !== previous) rank = index + 1;
      previous = row[state.measure];
      return { row, rank };
    })
    .filter((entry): boolean => entry.rank <= state.top);
}
export function sortDirectory(rows: SchoolRow[], sort: string): SchoolRow[] {
  const metric = sort === "high" ? "high" : "median";
  return [...rows].sort((a, b): number => {
    if (sort !== "name") {
      const difference = (b[metric] ?? -1) - (a[metric] ?? -1);
      if (difference) return difference;
    }
    return a.name.localeCompare(b.name) || a.locality.localeCompare(b.locality);
  });
}
