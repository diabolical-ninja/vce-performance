import type { ReactElement } from "react";
import type { Selection } from "@/types/data";

export function PickerOptions({
  options,
  active,
  add,
}: {
  options: Selection[];
  active: number;
  add: (school: Selection) => void;
}): ReactElement {
  return (
    <div
      className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-white shadow-md"
      id="school-options"
      role="listbox"
      aria-label="Matching schools"
    >
      {options.length ? (
        options.map((school, index): ReactElement => (
          <div
            id={`option-${school.id}`}
            key={school.id}
            role="option"
            aria-selected={index === active}
            className="cursor-pointer border-b border-border px-4 py-3 hover:bg-accent aria-selected:bg-accent"
            onMouseDown={(event): void => event.preventDefault()}
            onClick={(): void => add(school)}
          >
            <span className="block font-medium">{school.name}</span>
            <span className="text-xs capitalize text-muted">
              {school.locality.toLowerCase()}
            </span>
          </div>
        ))
      ) : (
        <p className="p-4">No matching schools. Try another name or suburb.</p>
      )}
    </div>
  );
}
