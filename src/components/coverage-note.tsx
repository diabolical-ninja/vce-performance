import type { ReactElement } from "react";

export function CoverageNote({
  year,
  context,
}: {
  year: number;
  context: boolean;
}): ReactElement {
  return (
    <p id="context-note" className="mb-5 text-xs leading-relaxed text-muted">
      {context
        ? `Sector and school context: ${year}. Unknown categories remain included in All sectors.`
        : `Sector and enrolment filters are unavailable for ${year}. Results remain available; this dataset has no same-year school profiles.`}
    </p>
  );
}
