import type { ReactElement } from "react";
import type { FilterState } from "@/types/data";

export function FilterSummary({
  state,
  context,
  mode,
}: {
  state: FilterState;
  context: boolean;
  mode: string;
}): ReactElement {
  return (
    <summary className="min-h-11 text-xs">
      More filters ·{" "}
      {context ? state.sector || "All sectors" : "Sector unavailable"}
      {mode === "rankings" && (
        <>
          {" "}
          · Top {state.top} ·{" "}
          {context ? `Enrolments ≥ ${state.minimum}` : "Enrolments unavailable"}
        </>
      )}
    </summary>
  );
}
