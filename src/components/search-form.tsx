"use client";

import { useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

export function SearchForm({
  label = "School or suburb",
  name = "q",
  value = "",
  disabled = false,
}: {
  label?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}): ReactElement {
  const params = useSearchParams();
  return (
    <form className="my-4 flex flex-wrap items-end gap-3">
      {[...params.entries()]
        .filter(([key]): boolean => key !== name)
        .map(([key, val]): ReactElement => (
          <input type="hidden" name={key} value={val} key={key} />
        ))}
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs font-medium text-muted">
        {label}
        <input
          key={value}
          className="w-full"
          name={name}
          defaultValue={value}
          disabled={disabled}
          type={name === "minimum" ? "number" : "search"}
          min={name === "minimum" ? 0 : undefined}
          placeholder="Search schools or suburbs"
        />
      </label>
      <Button variant="outline" disabled={disabled}>
        Apply {name === "minimum" ? "filter" : "search"}
      </Button>
    </form>
  );
}
