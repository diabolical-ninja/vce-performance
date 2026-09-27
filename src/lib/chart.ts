import type { SchoolRow } from "@/lib/contract";
import { measures } from "@/lib/measures";
import type { Measure, Selection } from "@/types/data";

export const seriesStyles = [
  { color: "#4e79a7", dash: "" },
  { color: "#f28e2b", dash: "8 4" },
  { color: "#e15759", dash: "2 4" },
  { color: "#76b7b2", dash: "10 3 2 3" },
  { color: "#59a14f", dash: "" },
  { color: "#edc948", dash: "8 4" },
  { color: "#b07aa1", dash: "2 4" },
  { color: "#ff9da7", dash: "10 3 2 3" },
  { color: "#9c755f", dash: "" },
  { color: "#bab0ab", dash: "8 4" },
  { color: "#2f2f2f", dash: "2 4" },
  { color: "#6f42c1", dash: "10 3 2 3" },
];
export const plot = {
  width: 900,
  height: 310,
  left: 65,
  right: 25,
  top: 25,
  bottom: 45,
};
interface ChartPoint {
  year: number;
  value: number | null;
  x: number;
  y: number;
}
export function chartDomain(
  rows: SchoolRow[],
  measure: Measure,
  full: boolean,
): [number, number] {
  const values = rows.flatMap((row): number[] =>
    row[measure] === null ? [] : [row[measure]],
  );
  if (!values.length) return [0, measures[measure].max ?? 1];
  const padding = 2;
  const minimum = full ? 0 : Math.max(0, Math.min(...values) - padding);
  const maximum = full
    ? (measures[measure].max ?? Math.max(...values) + padding)
    : Math.max(...values) + padding;
  return [minimum, maximum];
}
export function chartPoints(
  school: Selection,
  rows: SchoolRow[],
  years: number[],
  measure: Measure,
  { domain, layout = plot }: { domain: [number, number]; layout?: typeof plot },
): ChartPoint[] {
  const [minimum, maximum] = domain;
  const width = layout.width - layout.left - layout.right,
    height = layout.height - layout.top - layout.bottom;
  return years.map((year, index): ChartPoint => {
    const row = rows.find(
      (entry): boolean => entry.id === school.id && entry.year === year,
    );
    const value = row?.[measure] ?? null;
    return {
      year,
      value,
      x: layout.left + (index / Math.max(1, years.length - 1)) * width,
      y:
        layout.top +
        ((maximum - (value ?? minimum)) / (maximum - minimum)) * height,
    };
  });
}
export function linePath(points: ChartPoint[]): string {
  let connected = false;
  return points
    .map((point): string => {
      if (point.value === null) {
        connected = false;
        return "";
      }
      const command = connected ? "L" : "M";
      connected = true;
      return `${command}${point.x},${point.y}`;
    })
    .join(" ");
}
