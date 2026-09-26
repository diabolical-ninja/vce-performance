"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { hrefWith, MAX_SELECTION, scalar } from "@/lib/query";

export function useSelection(): {
  ids: string[];
  toggle: (id: string) => void;
} {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  const ids = [
    ...new Set(
      scalar(params.get("schools") ?? undefined)
        .split(",")
        .filter(Boolean),
    ),
  ].slice(0, MAX_SELECTION);
  const [optimisticIds, setOptimisticIds] = useOptimistic(ids);
  const [, startTransition] = useTransition();
  function toggle(id: string): void {
    const next = optimisticIds.includes(id)
      ? optimisticIds.filter((entry): boolean => entry !== id)
      : [...optimisticIds, id].slice(0, MAX_SELECTION);
    startTransition((): void => {
      setOptimisticIds(next);
      router.push(
        hrefWith(path, new URLSearchParams(params), {
          schools: next.join(","),
        }),
        { scroll: false },
      );
    });
  }
  return { ids: optimisticIds, toggle };
}
export function SelectSchool({
  id,
  name,
}: {
  id: string;
  name: string;
}): ReactElement {
  const { ids, toggle } = useSelection(),
    selected = ids.includes(id);
  return (
    <input
      className="size-5 min-h-5 accent-primary"
      type="checkbox"
      aria-label={`Compare ${name}`}
      checked={selected}
      disabled={!selected && ids.length >= MAX_SELECTION}
      onChange={(): void => toggle(id)}
    />
  );
}
export function CompareAction({ id }: { id: string }): ReactElement {
  const { ids, toggle } = useSelection(),
    selected = ids.includes(id);
  return (
    <Button
      variant="outline"
      disabled={!selected && ids.length >= MAX_SELECTION}
      onClick={(): void => toggle(id)}
    >
      {selected ? "Remove from comparison" : "Add to comparison"}
    </Button>
  );
}
