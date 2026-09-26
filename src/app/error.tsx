"use client";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}): ReactElement {
  return (
    <div role="alert" className="notice">
      <h1>Results could not be loaded</h1>
      <p className="my-4">
        Please try again. If the problem persists, report it through the source
        repository.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
