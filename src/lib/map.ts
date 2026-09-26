import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";
import { matchesSchool } from "@/lib/schools";
import { formatValue, measures } from "@/lib/measures";

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
export type LocatedSchool = SchoolRow & { lat: number; lng: number };
export const victoria: Bounds = {
  north: -33.9,
  south: -39.2,
  west: 140.8,
  east: 150.1,
};
export function located(rows: SchoolRow[]): LocatedSchool[] {
  return rows.filter(
    (row): row is LocatedSchool => row.lat !== null && row.lng !== null,
  );
}
export function inside(row: LocatedSchool, bounds: Bounds): boolean {
  return (
    row.lat >= bounds.south &&
    row.lat <= bounds.north &&
    row.lng >= bounds.west &&
    row.lng <= bounds.east
  );
}
export function mapRange(
  rows: SchoolRow[],
  measure: Measure,
): [number, number] {
  const values = rows.flatMap((row): number[] =>
    row[measure] === null ? [] : [row[measure]],
  );
  return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
}
export function pointColor(
  value: number | null,
  range: [number, number],
): string {
  if (value === null) return "#6b7280";
  const low = { r: 78, g: 134, b: 212 },
    high = { r: 200, g: 45, b: 55 };
  const fraction = Math.max(
    0,
    Math.min(1, (value - range[0]) / Math.max(1, range[1] - range[0])),
  );
  const channels = ["r", "g", "b"] as const;
  const rgb = channels.map((key): number =>
    Math.round(low[key] + (high[key] - low[key]) * fraction),
  );
  return `rgb(${rgb.join(", ")})`;
}
export function searchBounds(
  rows: LocatedSchool[],
  query: string,
): Bounds | null {
  if (!query.trim()) return null;
  const exact = rows.filter(
    (row): boolean => row.locality.toLowerCase() === query.trim().toLowerCase(),
  );
  const matching = exact.length
    ? exact
    : rows.filter((row): boolean => matchesSchool(row, query));
  if (!matching.length) return null;
  const padding = 0.012;
  return {
    north: Math.max(...matching.map((row): number => row.lat)) + padding,
    south: Math.min(...matching.map((row): number => row.lat)) - padding,
    east: Math.max(...matching.map((row): number => row.lng)) + padding,
    west: Math.min(...matching.map((row): number => row.lng)) - padding,
  };
}
export function mapPeriod(row: SchoolRow, measure: Measure): string {
  return row.aggregation
    ? `All years ${row.aggregation.startYear}–${row.aggregation.endYear} · Mean over ${row.aggregation.counts[measure]} available years`
    : `Results ${row.year}`;
}
export function mapLabel(row: SchoolRow, measure: Measure): string {
  return `${row.name} · ${measures[measure].label}: ${formatValue(row[measure], measure)} · ${row.sector} sector (profile ${row.profileYear ?? "unavailable"}) · ${mapPeriod(row, measure)} · Location ${row.locationYear}`;
}
