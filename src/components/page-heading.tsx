import type { ReactElement } from "react";

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement {
  return (
    <div className="mb-4 border-b border-border pb-3">
      <h1 className="text-2xl md:text-[28px]">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
