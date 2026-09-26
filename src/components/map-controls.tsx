import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

export function MapControls({
  view,
  onView,
  onReset,
}: {
  view: string;
  onView: (value: string) => void;
  onReset: () => void;
}): ReactElement {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Button variant="outline" onClick={onReset}>
        All Victoria
      </Button>
      <Button
        variant="outline"
        aria-pressed={view === "list"}
        onClick={(): void => onView(view === "list" ? "map" : "list")}
      >
        {view === "list" ? "Show map" : "Show list"}
      </Button>
      {view !== "both" && (
        <Button variant="outline" onClick={(): void => onView("both")}>
          Show map and list
        </Button>
      )}
    </div>
  );
}
export function MapNotices({
  query,
  matched,
  failed,
}: {
  query: string;
  matched: boolean;
  failed: boolean;
}): ReactElement {
  return (
    <>
      {query && !matched && (
        <p role="status" className="notice mb-3">
          No located suburb or school matches “{query}”. Try another name; all
          available schools remain on the map.
        </p>
      )}
      {failed && (
        <p role="status" className="notice mb-4">
          Map tiles could not be loaded. The school list and exact results
          remain available.
        </p>
      )}
    </>
  );
}
