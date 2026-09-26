"use client";
import type { ReactElement } from "react";
import { X } from "lucide-react";
import { useSelection } from "@/components/selection";
import { seriesStyles } from "@/lib/chart";
import type { Selection } from "@/types/data";

export function SelectedSchools({
  schools,
}: {
  schools: Selection[];
}): ReactElement {
  const { toggle } = useSelection();
  return (
    <div className="flex flex-wrap gap-2">
      {schools.map((school, index): ReactElement => (
        <div
          key={school.id}
          className="flex items-center gap-2 rounded-md border border-border bg-white pl-3"
        >
          <span aria-hidden="true" style={{ color: seriesStyles[index].color }}>
            ●
          </span>
          <span className="text-sm">
            {school.name}{" "}
            <span className="text-xs capitalize text-muted">
              · {school.locality.toLowerCase()}
            </span>
          </span>
          <button
            className="flex size-11 items-center justify-center"
            aria-label={`Remove ${school.name}`}
            onClick={(): void => toggle(school.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
