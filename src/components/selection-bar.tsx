"use client";
import type { ReactElement } from "react";
import { CarryLink } from "@/components/navigation";
import { useSelection } from "@/components/selection";

export function SelectionBar(): ReactElement {
  const { ids } = useSelection();
  return (
    <div className="sticky bottom-3 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-accent px-5 py-3 shadow-sm">
      <p role="status">{ids.length} of 4 schools selected</p>
      <CarryLink
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 font-medium text-white"
        href="/compare"
      >
        Compare schools
      </CarryLink>
    </div>
  );
}
