import { readFileSync } from "node:fs";
import { cache } from "react";
import { datasetSchema, type SchoolRow } from "@/lib/contract";
import { readFilters } from "@/lib/query";
import { yearsOf } from "@/lib/schools";
import type { Params, FilterState } from "@/types/data";

export const getDataset = cache((): ReturnType<typeof datasetSchema.parse> =>
  datasetSchema.parse(JSON.parse(readFileSync("data/website.json", "utf8"))),
);
export function getRows(): SchoolRow[] {
  return getDataset().rows;
}
export async function pageData(
  params: Promise<Params>,
): Promise<{ rows: SchoolRow[]; years: number[]; state: FilterState }> {
  const rows = getRows(),
    years = yearsOf(rows);
  return { rows, years, state: readFilters(await params, years) };
}
