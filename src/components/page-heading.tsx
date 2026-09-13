import type { ReactElement } from "react";

export function PageHeading({
  title,
  description,
  kicker = "Victorian school results",
}: {
  title: string;
  description: string;
  kicker?: string;
}): ReactElement {
  return (
    <div className="mb-6 rounded-lg border border-border bg-[#EDF5FF] px-5 py-6 md:px-7">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        {kicker}
      </p>
      <h1>{title}</h1>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted">{description}</p>
    </div>
  );
}
