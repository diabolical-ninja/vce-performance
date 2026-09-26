"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { useSelection } from "@/components/selection";
import { matchesSchool } from "@/lib/schools";
import { MAX_SELECTION } from "@/lib/query";
import type { Selection } from "@/types/data";
import { PickerOptions } from "@/components/picker-options";
import { nextOption } from "@/lib/picker";

export function SchoolPicker({
  schools,
}: {
  schools: Selection[];
}): ReactElement {
  const { ids, toggle } = useSelection();
  const [query, setQuery] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(0),
    [announcement, setAnnouncement] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const options = schools.filter(
    (school): boolean =>
      !ids.includes(school.id) && matchesSchool(school, query),
  );
  const activeId = options[active]?.id;
  useEffect((): void => {
    if (open && activeId)
      document
        .getElementById(`option-${activeId}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeId, open]);
  function add(school: Selection): void {
    toggle(school.id);
    setQuery("");
    setOpen(false);
    setActive(0);
    setAnnouncement(`${school.name} added to comparison.`);
    input.current?.focus();
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive(nextOption(active, options.length, event.key, open));
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (options[active]) add(options[active]);
    }
  }
  return (
    <div
      className="my-5 max-w-lg"
      onBlur={(event): void => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <p className="sr-only" role="status">
        {announcement} {open ? `${options.length} matching schools.` : ""}
      </p>
      {ids.length >= MAX_SELECTION ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          <TriangleAlert size={18} className="shrink-0" aria-hidden="true" />
          {MAX_SELECTION}-school comparison limit reached. Remove a school to
          add another.
        </p>
      ) : (
        <div className="relative">
          <label
            htmlFor="school-picker"
            className="mb-2 block text-xs font-medium text-muted"
          >
            Add a school
          </label>
          <div className="flex">
            <input
              id="school-picker"
              ref={input}
              className="w-full rounded-r-none"
              placeholder="Search schools or suburbs"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="school-options"
              aria-activedescendant={
                open && options.length
                  ? `option-${options[active].id}`
                  : undefined
              }
              value={query}
              onFocus={(): void => setOpen(true)}
              onChange={(event): void => {
                setQuery(event.target.value);
                setActive(0);
                setOpen(true);
              }}
              onKeyDown={keyDown}
            />
            <button
              className="min-h-11 rounded-r-md border border-l-0 border-border bg-white px-3"
              aria-label="Show school suggestions"
              aria-expanded={open}
              onClick={(): void => {
                input.current?.focus();
                setOpen(!open);
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
          {open && (
            <PickerOptions options={options} active={active} add={add} />
          )}
        </div>
      )}
    </div>
  );
}
