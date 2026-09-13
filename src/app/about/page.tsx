import type { ReactElement } from "react";
import { PageHeading } from "@/components/page-heading";
import { getDataset } from "@/lib/data";
import { measureKeys, measures } from "@/lib/measures";
import { yearsOf, directory } from "@/lib/schools";

export const metadata = { title: "About the data" };
export default function AboutPage(): ReactElement {
  const dataset = getDataset(),
    years = yearsOf(dataset.rows);
  return (
    <>
      <PageHeading
        title="Data & methods"
        description="Understand what the figures measure and where they come from."
      />
      <div className="max-w-4xl space-y-6 leading-relaxed">
        <section>
          <h2>Results and school profiles have different coverage</h2>
          <p className="mt-3">
            This dataset contains {dataset.rows.length.toLocaleString("en-AU")}{" "}
            source rows from {years[years.length - 1]}–{years[0]}, represented
            as {directory(dataset.rows).length} exact school/name/locality
            identities. These are not a reconciled current-school or campus
            count. School profile and coordinate fields end in 2024; 2025
            results are still included.
          </p>
        </section>
        <section>
          <h2>What each measure means</h2>
          {measureKeys.map((key): ReactElement => (
            <details className="border-b border-border" key={key}>
              <summary>{measures[key].label}</summary>
              <p className="pb-4">{measures[key].definition}</p>
            </details>
          ))}
        </section>
        <section>
          <h2>Sources and downloads</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <a href="https://www.vcaa.vic.edu.au/administration/research-and-statistics/Pages/SeniorSecondaryCompletion.aspx">
                VCAA Senior Secondary Completion and Achievement Information
              </a>{" "}
              — annual reported school results.
            </li>
            <li>
              <a href="https://www.acara.edu.au/contact-us/acara-data-access">
                ACARA data access
              </a>{" "}
              — school profiles and locations.
            </li>
            <li>
              <a href="/data/download">Download the analytical CSV</a> — all
              source rows and seven measures.
            </li>
            <li>
              <a href="https://github.com/diabolical-ninja/vce-performance/tree/main/raw_data">
                Original source files and reviewed joining keys
              </a>
              .
            </li>
          </ul>
        </section>
        <section>
          <h2>Transformations and identity</h2>
          <p className="mt-3">
            The Python ETL reads the source spreadsheets, standardises yearly
            columns and joins ACARA context using the manually maintained
            school-name crosswalk and the same year. Its existing inner join can
            omit schools missing from that crosswalk. The website publishes that
            analytical CSV without dropping any further source rows.
          </p>
          <p className="mt-3">
            A deterministic ID uses the exact ACARA ID, source name and
            locality. Names at different localities stay separate. Name changes
            and campuses are not automatically merged into a supposedly
            continuous history. Confirm identities against the original sources
            before interpreting historical changes.
          </p>
        </section>
        <section>
          <h2>Missing results, rankings and interpretation</h2>
          <p className="mt-3">
            The existing ETL collapses source markers such as “–” and “I/D” into
            nulls. We display “Unavailable in this dataset”, not zero, because
            the analytical file cannot distinguish the original states. Rankings
            count unavailable values separately and include ties at the cutoff
            using competition ranking. No average of school medians is presented
            as a statewide student benchmark.
          </p>
          <p className="mt-3">
            Annual cohorts differ. Changes in study scores use points; rates use
            percentage points. Intake, size, subjects and student circumstances
            affect results. No single measure is an overall school-quality
            rating.
          </p>
        </section>
        <section>
          <h2>Dates and reproducibility</h2>
          <p className="mt-3">
            Results, profiles and coordinates each retain their actual source
            year. No verified dataset refresh timestamp is supplied, so none is
            invented. The map defaults to the latest year with location coverage
            and does not borrow coordinates for newer results.
          </p>
          <p className="mt-3 break-all text-xs">
            Analytical CSV SHA-256: <code>{dataset.sourceSha256}</code>
          </p>
        </section>
        <section>
          <h2>Corrections</h2>
          <p className="mt-3">
            Found a mismatched school or a transcription problem?{" "}
            <a href="https://github.com/diabolical-ninja/vce-performance/issues/new">
              Open a correction issue
            </a>{" "}
            with the school name, locality, year, measure and original source
            reference. Source-row numbers appear on school profiles. This
            independent project is not affiliated with VCAA or ACARA.
          </p>
        </section>
      </div>
    </>
  );
}
