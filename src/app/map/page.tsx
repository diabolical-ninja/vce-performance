import type { ReactElement } from "react";
import { PageHeading } from "@/components/page-heading";
import { MapExplorer } from "@/components/map-explorer";
import { Filters } from "@/components/filters";
import { SearchForm } from "@/components/search-form";
import { CoverageNote } from "@/components/coverage-note";
import { getRows } from "@/lib/data";
import { filterRows, yearsOf } from "@/lib/schools";
import { readFilters, scalar } from "@/lib/query";
import type { Params } from "@/types/data";

export const metadata = { title: "School results map" };
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<ReactElement> {
  const rows = getRows(),
    params = await searchParams,
    locationYears = yearsOf(
      rows.filter((row): boolean => row.locationYear !== null),
    );
  const state = readFilters(
    { ...params, year: scalar(params.year, String(locationYears[0])) },
    yearsOf(rows),
  );
  const filtered = filterRows(rows, state),
    context = locationYears.includes(state.year);
  return (
    <>
      <PageHeading
        title="School results across Victoria"
        description="Explore published results by location. Search a suburb, or move the map and choose Search this area."
      />
      <Filters
        state={state}
        years={yearsOf(rows)}
        context={context}
        mode="map"
      />
      <CoverageNote year={state.year} context={context} />
      <SearchForm label="Area or school search" value={state.query} />
      {!context && (
        <p className="notice mb-4">
          No same-year location coverage for {state.year}.{" "}
          <a href="/map?year=2024">View the 2024 map</a>. Newer results are not
          overlaid at unverified older locations.
        </p>
      )}
      <MapExplorer
        key={`${state.year}-${state.query}-${state.sector}`}
        rows={filtered}
        measure={state.measure}
      />
    </>
  );
}
