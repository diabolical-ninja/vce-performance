import type { ReactElement } from "react";
import { DataValue } from "@/components/data-value";
import { CompareAction } from "@/components/selection";
import { CarryLink } from "@/components/navigation";
import { measures } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure } from "@/types/data";

export function ProfileSummary({ row }: { row: SchoolRow }): ReactElement {
  const outcomes: Measure[] = ["median", "high", "completion", "tertiary"];
  const context: Measure[] = ["icsea", "enrolments", "staff"];
  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {outcomes.map((key): ReactElement => (
          <div className="panel p-5" key={key}>
            <h2 className="text-sm">{measures[key].label}</h2>
            <p className="my-4 text-2xl">
              <DataValue value={row[key]} measure={key} />
            </p>
            <p className="text-xs leading-relaxed text-muted">
              {measures[key].definition}
            </p>
          </div>
        ))}
      </div>
      <section className="panel mb-6 p-5">
        <h2>School context</h2>
        <p className="my-3 text-xs text-muted">
          {row.profileYear === null
            ? `No ${row.year} profile is available. Select an earlier year to see separately dated context.`
            : `ACARA school profile · ${row.profileYear} · ${row.sector} sector · ${row.schoolType}`}
        </p>
        <dl className="grid gap-5 sm:grid-cols-3">
          {context.map((key): ReactElement => (
            <div key={key}>
              <dt className="text-xs text-muted">{measures[key].label}</dt>
              <dd className="my-2 text-lg">
                <DataValue value={row[key]} measure={key} />
              </dd>
              <dd className="text-xs leading-relaxed text-muted">
                {measures[key].definition}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <CompareAction id={row.id} />
        <CarryLink href="/compare">Open comparison →</CarryLink>
      </div>
    </>
  );
}
