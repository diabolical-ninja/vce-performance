import { notFound } from "next/navigation";
import { CarryLink } from "@/components/navigation";
import { PageHeading } from "@/components/page-heading";
import { ProfileSummary } from "@/components/profile-summary";
import { Filters } from "@/components/filters";
import { ComparisonChart } from "@/components/comparison-chart";
import { getRows } from "@/lib/data";
import { yearsOf } from "@/lib/schools";
import { readFilters } from "@/lib/query";
import type { Params } from "@/types/data";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Params>;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  return {
    title:
      getRows().find((row): boolean => row.id === id)?.name ??
      "School not found",
  };
}
export default async function ProfilePage({
  params,
  searchParams,
}: Props): Promise<React.ReactElement> {
  const { id } = await params,
    history = getRows().filter((row): boolean => row.id === id);
  if (!history.length) notFound();
  const years = yearsOf(history),
    state = readFilters(await searchParams, years);
  const row = history.find((entry): boolean => entry.year === state.year)!;
  return (
    <>
      <CarryLink href="/schools" className="mb-5 inline-block">
        ← Explore schools
      </CarryLink>
      <PageHeading
        title={row.name}
        description={`${row.locality} · ${state.year} results`}
      />
      <Filters
        state={state}
        years={years}
        context={row.profileYear !== null}
        mode="profile"
      />
      <ProfileSummary row={row} />
      <h2 className="mb-4">Annual history</h2>
      <ComparisonChart
        schools={[row]}
        rows={history}
        years={[...years].reverse()}
        measure={state.measure}
      />
      <p className="mt-5 text-xs leading-relaxed text-muted">
        Source: VCAA results · {row.year}. ACARA ID:{" "}
        {row.acaraId || "Unavailable"}. Location year:{" "}
        {row.locationYear ?? "Unavailable"}. Analytical CSV row: {row.sourceRow}
        . This profile groups only the exact source name, locality and ACARA ID;
        campus and name changes may appear separately.{" "}
        <CarryLink href="/about">Data provenance and corrections</CarryLink>.
      </p>
    </>
  );
}
