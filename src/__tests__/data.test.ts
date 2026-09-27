import { describe, expect, it } from "vitest";
import { getDataset, getRows, pageData } from "@/lib/data";
import { datasetSchema, type SchoolRow } from "@/lib/contract";
import { formatValue, measureKeys } from "@/lib/measures";
import { ALL_YEARS, readFilters, scalar, hrefWith } from "@/lib/query";
import {
  directory,
  filterRows,
  ranked,
  sortDirectory,
  yearsOf,
  matchesSchool,
} from "@/lib/schools";
import { chartDomain, chartPoints, linePath } from "@/lib/chart";
import {
  located,
  inside,
  mapRange,
  pointColor,
  victoria,
  searchBounds,
  mapLabel,
} from "@/lib/map";
import { nextOption } from "@/lib/picker";
import { cn } from "@/lib/utils";

const rows = getRows();
const base = rows[0];
describe("published data contract", (): void => {
  it("loads every source row with all seven measures and dated coverage", async (): Promise<void> => {
    expect(rows).toHaveLength(7007);
    expect(yearsOf(rows)).toEqual([
      2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
    ]);
    expect(directory(rows)).toHaveLength(744);
    expect(rows.filter((r): boolean => r.year === 2025)).toHaveLength(588);
    expect(
      rows
        .filter((r): boolean => r.year === 2025)
        .every(
          (r): boolean => r.profileYear === null && r.locationYear === null,
        ),
    ).toBe(true);
    expect(new Set(rows.map((r): string => `${r.id}-${r.year}`)).size).toBe(
      7007,
    );
    expect(getDataset().sourceSha256).toHaveLength(64);
    expect((await pageData(Promise.resolve({ year: "2024" }))).state.year).toBe(
      2024,
    );
    measureKeys.forEach((key): void =>
      expect(rows.some((r): boolean => r[key] !== null)).toBe(true),
    );
  });
  it("rejects invalid contracts and never turns missing data into zero", (): void => {
    expect(datasetSchema.safeParse({}).success).toBe(false);
    expect(
      datasetSchema.safeParse({
        ...getDataset(),
        rows: [{ ...base, median: 51 }],
      }).success,
    ).toBe(false);
    expect(formatValue(null, "median")).toBe("—");
    expect(formatValue(0, "high")).toBe("0.0%");
    expect(formatValue(1000, "icsea")).toBe("1,000");
  });
});
describe("URL and data queries", (): void => {
  it("normalizes untrusted state, selections, and shared links", (): void => {
    const defaults = readFilters(
      { year: ["2024"], top: "invalid", minimum: "bad", measure: "bad" },
      [2025, 2024],
    );
    expect(defaults).toMatchObject({
      year: 2025,
      top: 5,
      measure: "median",
      minimum: 0,
      sort: "name",
    });
    expect(
      readFilters(
        {
          year: "2024",
          measure: "high",
          top: "10",
          schools: "a,a,b,c,d,e",
          minimum: "-5",
        },
        [2025, 2024],
      ),
    ).toMatchObject({
      year: 2024,
      measure: "high",
      top: 10,
      selected: ["a", "b", "c", "d", "e"],
      minimum: 0,
    });
    expect(scalar(undefined)).toBe("");
    expect(scalar("ok")).toBe("ok");
    expect(
      hrefWith("/compare", new URLSearchParams("year=2024"), {
        year: "",
        schools: "a,b",
      }),
    ).toBe("/compare?schools=a%2Cb");
    expect(hrefWith("/", new URLSearchParams(), {})).toBe("/");
  });
  it("scopes minimum enrolments to Rankings while preserving shared URL state", (): void => {
    const params = new URLSearchParams("year=2024&minimum=1000&schools=a,b");
    expect(hrefWith("/", params, {})).toBe(
      "/?year=2024&minimum=1000&schools=a%2Cb",
    );
    for (const path of ["/schools", "/schools/a", "/compare", "/map", "/about"])
      expect(hrefWith(path, params, { minimum: "2000" })).toBe(
        `${path}?year=2024&schools=a%2Cb`,
      );
    expect(params.get("minimum")).toBe("1000");
  });
  it("searches punctuation-normalized names/localities and preserves distinct identities", (): void => {
    expect(
      matchesSchool(
        { ...base, name: "St. Anne’s", locality: "FITZROY" },
        "st annes",
      ),
    ).toBe(true);
    expect(matchesSchool(base, "fitzroy")).toBe(true);
    expect(matchesSchool(base, "no such suburb")).toBe(false);
    const options = directory([
      { ...base, id: "a", name: "Same", locality: "Z" },
      { ...base, id: "b", name: "Same", locality: "A" },
      base,
    ]);
    expect(options.map((r): string => r.id)).toEqual([base.id, "b", "a"]);
  });
  it("filters only same-year context and includes explicit Unknown sectors", (): void => {
    const state = readFilters({ year: "2014" }, [2014]);
    const fixtures = [
      base,
      { ...base, id: "b", sector: "Unknown", enrolments: null },
    ] as SchoolRow[];
    expect(filterRows(fixtures, state)).toHaveLength(2);
    expect(filterRows(fixtures, { ...state, sector: "Unknown" })).toHaveLength(
      1,
    );
    expect(filterRows(fixtures, { ...state, minimum: 600 })).toHaveLength(1);
    expect(filterRows(fixtures, { ...state, minimum: 9999 })).toHaveLength(0);
    expect(filterRows(fixtures, { ...state, query: "no-match" })).toHaveLength(
      0,
    );
    expect(
      filterRows(
        rows,
        readFilters(
          { year: "2025", sector: "Catholic", minimum: "99999" },
          [2025],
        ),
      ),
    ).toHaveLength(588);
  });
  it("uses competition ranking with alphabetical ties and includes the cutoff", (): void => {
    const scores = [40, 39, 38, 38, 37, 37, 36, null];
    const fixtures = scores.map((median, index): SchoolRow => ({
      ...base,
      id: String(index),
      name: index === 3 ? "A" : "Z",
      locality: String(index),
      median,
    }));
    const state = readFilters({}, [2014]);
    const result = ranked(fixtures, state);
    expect(result.map((entry): number => entry.rank)).toEqual([
      1, 2, 3, 3, 5, 5,
    ]);
    expect(result[2].row.name).toBe("A");
    expect(ranked([], state)).toEqual([]);
    expect(sortDirectory(fixtures, "median").at(-1)?.median).toBeNull();
    expect(sortDirectory(fixtures, "high")).toHaveLength(8);
    expect(sortDirectory(fixtures, "name")[0].name).toBe("A");
    expect(sortDirectory([...fixtures].reverse(), "median")[0].median).toBe(40);
  });
});
describe("visualization math", (): void => {
  it("preserves gaps and a shared scale including valid zeros", (): void => {
    expect(chartDomain([], "median", false)).toEqual([0, 50]);
    expect(chartDomain([], "icsea", true)).toEqual([0, 1]);
    expect(chartDomain([base], "median", true)).toEqual([0, 50]);
    expect(chartDomain([base], "median", false)).toEqual([30, 34]);
    expect(chartDomain([base], "icsea", true)).toEqual([0, 1061]);
    expect(
      chartDomain(
        [
          { ...base, median: null },
          { ...base, median: 0 },
        ],
        "median",
        false,
      ),
    ).toEqual([0, 2]);
    const points = chartPoints(
      base,
      [base, { ...base, year: 2016 }],
      [2014, 2015, 2016],
      "median",
      { domain: [0, 50] },
    );
    expect(points[1].value).toBeNull();
    expect(linePath(points).match(/M/g)).toHaveLength(2);
    expect(
      linePath(
        chartPoints(
          base,
          [base, { ...base, year: 2015 }],
          [2014, 2015],
          "median",
          { domain: [0, 50] },
        ),
      ),
    ).toContain("L");
    expect(
      chartPoints(base, [base], [2014], "median", { domain: [0, 50] })[0].x,
    ).toBe(65);
    expect(
      linePath(
        chartPoints(base, [{ ...base, median: null }], [2014], "median", {
          domain: [0, 50],
        }),
      ),
    ).toBe("");
  });
  it("maps located schools and null values without fabricating coordinates", (): void => {
    expect(
      located([base, { ...base, lat: null }, { ...base, lng: null }]),
    ).toHaveLength(1);
    const point = located([base])[0];
    expect(inside(point, victoria)).toBe(true);
    for (const moved of [{ lat: -90 }, { lat: 0 }, { lng: 0 }, { lng: 180 }])
      expect(inside({ ...point, ...moved }, victoria)).toBe(false);
    expect(mapRange([base, { ...base, median: null }], "median")).toEqual([
      32, 32,
    ]);
    expect(mapRange([], "median")).toEqual([0, 1]);
    expect(pointColor(null, [0, 50])).toBe("#6b7280");
    expect(pointColor(0, [0, 50])).toBe("rgb(78, 134, 212)");
    expect(pointColor(50, [0, 50])).toBe("rgb(200, 45, 55)");
    expect(pointColor(10, [10, 10])).toBe("rgb(78, 134, 212)");
  });
  it("wraps picker navigation and merges Tailwind classes", (): void => {
    expect(nextOption(0, 2, "ArrowUp", true)).toBe(1);
    expect(nextOption(1, 2, "ArrowDown", true)).toBe(0);
    expect(nextOption(1, 2, "ArrowDown", false)).toBe(0);
    expect(nextOption(0, 0, "ArrowDown", true)).toBe(0);
    expect(cn("p-2", false, "p-4")).toBe("p-4");
  });
});
it("loads Python all-year summaries with per-measure coverage and ignores All on single-year screens", async (): Promise<void> => {
  const data = await pageData(Promise.resolve({ year: "all" }), {
    allYears: true,
    minimum: 50,
  });
  expect(data.rows).toHaveLength(744);
  expect(data.state).toMatchObject({ year: ALL_YEARS, minimum: 50 });
  const aggregate = data.rows.find((row): boolean => row.id === base.id)!;
  expect(aggregate.aggregation?.counts.median).toBe(12);
  expect(mapLabel(aggregate, "median")).toContain(
    "Mean over 12 available years",
  );
  expect(mapLabel({ ...base, profileYear: null }, "median")).toContain(
    "profile unavailable",
  );
  expect(readFilters({ year: "all" }, [2025]).year).toBe(2025);
  expect(
    readFilters({ year: "2024" }, [2025, 2024], { allYears: true }).year,
  ).toBe(2024);
});
it("finds suburb bounds without filtering neighbouring visible schools", (): void => {
  const fixtures = located([
    base,
    {
      ...base,
      id: "nearby",
      name: "Neighbouring school",
      locality: "Neighbour",
      lat: base.lat! + 0.002,
    },
  ]);
  const bounds = searchBounds(fixtures, "fitzroy")!;
  expect(inside(fixtures[1], bounds)).toBe(true);
  expect(searchBounds(fixtures, "Academy")).toEqual(bounds);
  expect(searchBounds(fixtures, "missing")).toBeNull();
  expect(searchBounds(fixtures, "  ")).toBeNull();
});
