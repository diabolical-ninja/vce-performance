import type { ReactElement } from "react";
import { CarryLink } from "@/components/navigation";
import { DataValue } from "@/components/data-value";
import { Button } from "@/components/ui/button";
import type { LocatedSchool } from "@/lib/map";
import type { Measure } from "@/types/data";

export function MapList({
  rows,
  selected,
  measure,
  onSelect,
}: {
  rows: LocatedSchool[];
  selected: string;
  measure: Measure;
  onSelect: (id: string) => void;
}): ReactElement {
  return (
    <section
      aria-label="Schools in this area"
      className="panel max-h-[480px] overflow-y-auto"
    >
      <h2 className="border-b border-border p-4">Schools in this area</h2>
      {rows.length ? (
        <ul>
          {rows.map((row): ReactElement => (
            <li key={row.id} className="border-b border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <CarryLink href={`/schools/${row.id}`} className="font-medium">
                  {row.name}
                </CarryLink>
                <span>
                  <DataValue value={row[measure]} measure={measure} />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {row.locality} · Results {row.year} · Location{" "}
                {row.locationYear}
              </p>
              <Button
                variant="ghost"
                aria-pressed={row.id === selected}
                onClick={(): void => onSelect(row.id)}
              >
                Select school
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4">
          No located schools in this area. Try All Victoria or clear your
          search.
        </p>
      )}
    </section>
  );
}
