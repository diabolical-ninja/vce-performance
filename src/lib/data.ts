import { readFileSync, statSync } from "node:fs";
import { datasetSchema, type SchoolRow } from "@/lib/contract";
import { ALL_YEARS, readFilters, type FilterOptions } from "@/lib/query";
import { yearsOf } from "@/lib/schools";
import type { Params, FilterState } from "@/types/data";

let cached: { version: string; data: ReturnType<typeof datasetSchema.parse> };

// Reuse validated data across requests, refreshing when the export changes.
export function getDataset(): ReturnType<typeof datasetSchema.parse> {
  const { mtimeMs, ctimeMs, size } = statSync("data/website.json");
  const version = `${mtimeMs}:${ctimeMs}:${size}`;
  if (cached?.version !== version) {
    const data = datasetSchema.parse(
      JSON.parse(readFileSync("data/website.json", "utf8")),
    );
    cached = { version, data };
  }
  return cached.data;
}
export function getRows(): SchoolRow[] {
  return getDataset().rows;
}
export async function pageData(
  params: Promise<Params>,
  options: FilterOptions = {},
): Promise<{ rows: SchoolRow[]; years: number[]; state: FilterState }> {
  const rows = getRows(),
    years = yearsOf(rows);
  const state = readFilters(await params, years, options);
  return {
    rows: state.year === ALL_YEARS ? getDataset().allYears : rows,
    years,
    state,
  };
}
