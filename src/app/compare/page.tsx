import type { ReactElement } from "react";
import { PageHeading } from "@/components/page-heading";
import { CompareContent } from "@/components/compare-content";
import { getRows } from "@/lib/data";
import { directory, yearsOf } from "@/lib/schools";
import { readFilters } from "@/lib/query";
import type { Params } from "@/types/data";

export const metadata = { title: "Compare schools" };
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<ReactElement> {
  const rows = getRows(),
    years = yearsOf(rows),
    state = readFilters(await searchParams, years);
  return (
    <>
      <PageHeading
        title="Compare schools"
        description="See how reported VCE results change from year to year."
      />
      <CompareContent
        rows={rows}
        schools={directory(rows)}
        years={years}
        state={state}
      />
    </>
  );
}
