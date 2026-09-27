import { measureKeys } from "@/lib/measures";
import type { FilterState, Params, Measure } from "@/types/data";

export const MAX_SELECTION = 12;
export const ALL_YEARS = 0;
export const DEFAULT_ENROLMENTS = 50;
export interface FilterOptions {
  allYears?: boolean;
  minimum?: number;
}
export function yearLabel(year: number): string {
  return year === ALL_YEARS ? "All years" : String(year);
}
const TOP_FIVE = 5,
  TOP_TEN = 10,
  TOP_TWENTY_FIVE = 25,
  TOP_FIFTY = 50;
export const rankingLimits = [TOP_FIVE, TOP_TEN, TOP_TWENTY_FIVE, TOP_FIFTY];
export function scalar(
  value: string | string[] | undefined,
  fallback = "",
): string {
  return typeof value === "string" ? value : fallback;
}
export function readFilters(
  params: Params,
  years: number[],
  options: FilterOptions = {},
): FilterState {
  const requestedYear = Number(scalar(params.year));
  let year = years.includes(requestedYear) ? requestedYear : years[0];
  if (options.allYears && scalar(params.year).toLowerCase() === "all")
    year = ALL_YEARS;
  const requestedMeasure = scalar(params.measure) as Measure;
  const measure = measureKeys.includes(requestedMeasure)
    ? requestedMeasure
    : "median";
  const requestedTop = Number(scalar(params.top));
  const limits = rankingLimits;
  const top = limits.includes(requestedTop) ? requestedTop : limits[0];
  return {
    year,
    measure,
    top,
    sector: scalar(params.sector),
    minimum: Math.max(
      0,
      Number(scalar(params.minimum, String(options.minimum ?? 0))) || 0,
    ),
    query: scalar(params.q),
    sort: scalar(params.sort, "name"),
    selected: [
      ...new Set(scalar(params.schools).split(",").filter(Boolean)),
    ].slice(0, MAX_SELECTION),
  };
}
export function hrefWith(
  path: string,
  params: URLSearchParams,
  updates: Record<string, string>,
): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  // Minimum enrolments is only exposed and applied on Rankings.
  if (path !== "/") next.delete("minimum");
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}
