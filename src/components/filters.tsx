"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { measureKeys, measures } from "@/lib/measures";
import { hrefWith, rankingLimits } from "@/lib/query";
import type { FilterState } from "@/types/data";

export function Filters({
  state,
  years,
  context,
  mode = "rankings",
}: {
  state: FilterState;
  years: number[];
  context: boolean;
  mode?: string;
}): ReactElement {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  function update(key: string, value: string): void {
    router.push(hrefWith(path, new URLSearchParams(params), { [key]: value }), {
      scroll: false,
    });
  }
  return (
    <div className="mb-5 flex flex-wrap items-end gap-4">
      <Field label="Results year">
        <select
          value={state.year}
          onChange={(event): void => update("year", event.target.value)}
        >
          {years.map((year): ReactElement => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </Field>
      {mode !== "schools" && (
        <Field label={mode === "rankings" ? "Rank by" : "Measure"}>
          <select
            value={state.measure}
            onChange={(event): void => update("measure", event.target.value)}
          >
            <MeasureOptions />
          </select>
        </Field>
      )}
      {mode !== "compare" && (
        <Field label="Sector">
          <select
            value={context ? state.sector : ""}
            disabled={!context}
            aria-describedby="context-note"
            onChange={(event): void => update("sector", event.target.value)}
          >
            <option value="">All sectors</option>
            {["Government", "Catholic", "Independent", "Unknown"].map(
              (sector): ReactElement => (
                <option key={sector}>{sector}</option>
              ),
            )}
          </select>
        </Field>
      )}
      {mode === "rankings" && (
        <Field label="Show">
          <select
            value={state.top}
            onChange={(event): void => update("top", event.target.value)}
          >
            {rankingLimits.map((top): ReactElement => (
              <option key={top} value={top}>
                Top {top}
              </option>
            ))}
          </select>
        </Field>
      )}
      {mode === "schools" && (
        <Field label="Sort by">
          <select
            value={state.sort}
            onChange={(event): void => update("sort", event.target.value)}
          >
            <option value="name">School name A–Z</option>
            <option value="median">Median study score ↓</option>
            <option value="high">Study scores 40+ ↓</option>
          </select>
        </Field>
      )}
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}): ReactElement {
  return (
    <label className="flex flex-col gap-2 text-xs font-medium text-muted">
      {label}
      {children}
    </label>
  );
}
function MeasureOptions(): ReactElement {
  return (
    <>
      {[false, true].map((context): ReactElement => (
        <optgroup
          key={String(context)}
          label={context ? "School context" : "VCE results"}
        >
          {measureKeys
            .filter((key): boolean => measures[key].context === context)
            .map((key): ReactElement => (
              <option key={key} value={key}>
                {measures[key].label}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );
}
