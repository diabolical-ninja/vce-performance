import { CarryLink } from "@/components/navigation";
import { PageHeading } from "@/components/page-heading";
import { Filters } from "@/components/filters";
import { SearchForm } from "@/components/search-form";
import { CoverageNote } from "@/components/coverage-note";
import { DirectoryTable } from "@/components/directory-table";
import { SelectionBar } from "@/components/selection-bar";
import { pageData } from "@/lib/data";
import { filterRows, sortDirectory } from "@/lib/schools";
import type { Params } from "@/types/data";

export const metadata = { title: "Schools" };
export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<React.ReactElement> {
  const { rows, years, state } = await pageData(searchParams);
  const filtered = sortDirectory(filterRows(rows, state), state.sort);
  const context = rows.some(
    (row): boolean => row.year === state.year && row.profileYear !== null,
  );
  return (
    <>
      <PageHeading
        title="Explore VCE results"
        description="Find a school, read its results and compare changes over time."
      />
      <Filters mode="schools" state={state} years={years} context={context} />
      <CoverageNote year={state.year} context={context} />
      <SearchForm value={state.query} />
      <p className="my-4 text-xs text-muted">
        {filtered.length} school/locality records · Median study score is out of
        50 · Sorted by {state.sort === "name" ? "school name A–Z" : state.sort}
      </p>
      {filtered.length ? (
        <DirectoryTable rows={filtered} year={state.year} />
      ) : (
        <div className="notice">
          No schools match these filters. Try another name, suburb or year.{" "}
          <CarryLink
            href="/schools"
            updates={{ q: "", sector: "", minimum: "" }}
          >
            Clear filters
          </CarryLink>
        </div>
      )}
      <SelectionBar />
    </>
  );
}
