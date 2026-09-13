import { CarryLink } from "@/components/navigation";
import { PageHeading } from "@/components/page-heading";
import { Filters } from "@/components/filters";
import { CoverageNote } from "@/components/coverage-note";
import { RankingsTable } from "@/components/rankings-table";
import { SearchForm } from "@/components/search-form";
import { pageData } from "@/lib/data";
import { filterRows, ranked } from "@/lib/schools";
import { measures } from "@/lib/measures";
import type { Params } from "@/types/data";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<React.ReactElement> {
  const { rows, years, state } = await pageData(searchParams);
  // Directory searches never restrict the independent ranking universe.
  const annual = filterRows(rows, { ...state, query: "" });
  const context = rows.some(
    (row): boolean => row.year === state.year && row.profileYear !== null,
  );
  const entries = ranked(annual, state),
    available = annual.filter(
      (row): boolean => row[state.measure] !== null,
    ).length;
  return (
    <>
      <PageHeading
        title="VCE school rankings"
        description="Find and compare schools using published VCE results."
      />
      <Filters state={state} years={years} context={context} />
      <CoverageNote year={state.year} context={context} />
      <details className="mb-6">
        <summary>Enrolment filter</summary>
        <SearchForm
          label="Minimum total school enrolments"
          name="minimum"
          value={String(state.minimum)}
          disabled={!context}
        />
        <p className="text-xs text-muted">
          Uses whole-school enrolments, not the VCE cohort. Unknown enrolments
          cannot meet a positive minimum.
        </p>
      </details>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2>Top {state.top} schools</h2>
        <p className="text-xs text-muted">
          {available} source records ranked · {state.year} ·{" "}
          {measures[state.measure].label}
        </p>
      </div>
      {entries.length ? (
        <RankingsTable
          entries={entries}
          measure={state.measure}
          year={state.year}
        />
      ) : (
        <div className="notice">
          <h2>No available results</h2>
          <p className="mt-2">
            {measures[state.measure].label} is unavailable for these filters.
            Choose another measure or year, or clear the filters.
          </p>
          <CarryLink
            className="mt-3 inline-block"
            href="/"
            updates={{ year: "2024", sector: "", minimum: "" }}
          >
            View 2024 results
          </CarryLink>
        </div>
      )}
      <p className="my-4 text-xs leading-relaxed text-muted">
        Showing {entries.length} records, including ties at the Top {state.top}{" "}
        cutoff. {annual.length - available} records unavailable for this
        measure. Counts represent source school/locality records, not
        independently reconciled campuses.
      </p>
      <details className="panel px-5">
        <summary>How to read these rankings</summary>
        <p className="mb-3 leading-relaxed">
          Equal reported values share a competition rank (1, 2, 3, 3, 5); ties
          are ordered alphabetically. These are rankings of one measure, not an
          overall rating of school quality.
        </p>
        <p className="mb-4 leading-relaxed">
          {measures[state.measure].definition} Unavailable values are never
          treated as zero.{" "}
          <CarryLink href="/about">
            Read definitions and coverage notes.
          </CarryLink>
        </p>
      </details>
    </>
  );
}
