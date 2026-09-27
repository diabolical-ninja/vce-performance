import type { ReactElement } from "react";
import { ALL_YEARS } from "@/lib/query";

export function CoverageNote({
  year,
  context,
}: {
  year: number;
  context: boolean;
}): ReactElement {
  if (year === ALL_YEARS)
    return (
      <details className="mb-3 text-xs leading-relaxed text-muted">
        <summary id="context-note" className="min-h-11">
          All years: available-year means · Coverage varies by record and
          measure
        </summary>
        <p className="pb-3">
          Means are unweighted averages of available annual values; missing
          values are excluded. In rankings, coverage beneath the school name
          applies to the shown means unless a different coverage is noted beside
          a value. Each period spans the first and last available year; the
          count excludes missing years within that period. Historical records
          end before the latest dataset year, which does not imply a school has
          closed. Matching names or localities are not merged. The mean of
          annual school medians is not a pooled student median. Enrolments use
          the average whole-school count (default minimum 50 on Rankings), not
          the VCE cohort. Sector uses the latest available profile; map
          locations use the latest recorded coordinates.
        </p>
      </details>
    );
  return (
    <p id="context-note" className="mb-3 text-xs leading-relaxed text-muted">
      {context
        ? `Sector and school context: ${year}. Unknown categories remain included in All sectors.`
        : `Sector and enrolment filters are unavailable for ${year}. Results remain available; this dataset has no same-year school profiles.`}
    </p>
  );
}
