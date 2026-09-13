import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

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
  const lightness = 70,
    span = 40,
    hue = 216;
  const fraction = (value - range[0]) / Math.max(1, range[1] - range[0]);
  return `hsl(${hue} 65% ${lightness - fraction * span}%)`;
}
