import type { ReactElement } from "react";
import { formatValue, measures } from "@/lib/measures";
import type { Measure } from "@/types/data";

export function DataValue({
  value,
  measure,
  bar = false,
}: {
  value: number | null;
  measure: Measure;
  bar?: boolean;
}): ReactElement {
  if (value === null)
    return (
      <span
        aria-label="Unavailable in this dataset"
        title="Unavailable in this dataset"
      >
        —
      </span>
    );
  const maximum = measures[measure].max;
  const percent = 100;
  return (
    <span className="inline-flex w-full flex-col items-end gap-2 tabular-nums">
      <span>{formatValue(value, measure)}</span>
      {bar && maximum !== null && (
        <span
          aria-hidden="true"
          className="h-1.5 w-full min-w-16 rounded-sm bg-[#E9F0FA]"
        >
          <span
            className="block h-full rounded-sm bg-[#4E86D4]"
            style={{ width: `${(value / maximum) * percent}%` }}
          />
        </span>
      )}
    </span>
  );
}
