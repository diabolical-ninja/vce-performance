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
          All years: unweighted annual averages · Coverage details
        </summary>
        <p className="pb-3">
          Averages use available annual values, with available-year counts. The
          mean of annual school medians is not a pooled student median.
          Enrolments use the average whole-school count (default minimum 50 on
          Rankings), not the VCE cohort. Sector uses the latest available
          profile; map locations use the latest recorded coordinates.
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
