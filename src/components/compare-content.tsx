import type { ReactElement } from "react";
import { SchoolPicker } from "@/components/school-picker";
import { SelectedSchools } from "@/components/selected-schools";
import { ComparisonChart } from "@/components/comparison-chart";
import { ResultsSnapshot } from "@/components/results-snapshot";
import { Filters } from "@/components/filters";
import { CarryLink } from "@/components/navigation";
import type { SchoolRow } from "@/lib/contract";
import type { FilterState, Selection } from "@/types/data";

export function CompareContent({
  rows,
  schools,
  years,
  state,
}: {
  rows: SchoolRow[];
  schools: Selection[];
  years: number[];
  state: FilterState;
}): ReactElement {
  const selected = state.selected.flatMap((id): Selection[] =>
    schools.filter((school): boolean => school.id === id),
  );
  const history = rows.filter((row): boolean =>
    state.selected.includes(row.id),
  );
  return (
    <>
      {selected.length !== state.selected.length && (
        <p className="notice mb-4">
          Some selected school IDs are unavailable.{" "}
          <CarryLink
            href="/compare"
            updates={{
              schools: selected.map((school): string => school.id).join(","),
            }}
          >
            Clear unavailable selections
          </CarryLink>
        </p>
      )}
      <SelectedSchools schools={selected} />
      <SchoolPicker schools={schools} />
      {selected.length ? (
        <>
          <Filters state={state} years={years} context mode="compare" />
          <ComparisonChart
            schools={selected}
            rows={history}
            years={[...years].reverse()}
            measure={state.measure}
          />
          <ResultsSnapshot
            schools={selected}
            rows={history}
            year={state.year}
            measure={state.measure}
          />
        </>
      ) : (
        <div className="notice">
          Add a school to start comparing. Choose up to four schools from the
          complete historical directory.
        </div>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted">
        Histories follow exact source name, locality and ACARA ID. Name and
        campus changes are not automatically joined. Missing values mean
        unavailable in this dataset. School context uses the profile year, not a
        newer results year.
      </p>
    </>
  );
}
