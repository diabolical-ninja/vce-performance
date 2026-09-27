import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

export function MinimumEnrolments({
  value,
  disabled,
  onApply,
}: {
  value: number;
  disabled: boolean;
  onApply: (key: string, value: string) => void;
}): ReactElement {
  return (
    <form
      className="col-span-2 flex min-w-0 items-end gap-2"
      onSubmit={(event): void => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onApply("minimum", String(form.get("minimum")));
      }}
    >
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs font-medium text-muted">
        Minimum total school enrolments
        <input
          name="minimum"
          type="number"
          min="0"
          step="1"
          required
          disabled={disabled}
          defaultValue={value}
          key={value}
          className="w-full md:w-36"
          aria-describedby="context-note"
        />
      </label>
      <Button variant="outline" disabled={disabled}>
        Apply filter
      </Button>
    </form>
  );
}
