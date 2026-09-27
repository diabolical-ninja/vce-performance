import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { RankingsTable } from "@/components/rankings-table";
import { getDataset } from "@/lib/data";
import { ALL_YEARS } from "@/lib/query";

it("shows shared coverage once and detects different contributing years even with matching ranges and counts", (): void => {
  const base = getDataset().allYears[0];
  const years = [2014, 2016, 2018];
  const row = {
    ...base,
    aggregation: {
      ...base.aggregation,
      years: {
        ...base.aggregation.years,
        median: years,
        high: years,
        completion: years,
      },
    },
  };
  const { rerender } = render(
    <RankingsTable
      entries={[{ row, rank: 1 }]}
      measure="high"
      year={ALL_YEARS}
      latestYear={2025}
    />,
  );
  expect(
    screen.getByRole("columnheader", { name: "Study scores 40+ (%)" }),
  ).toHaveTextContent(/^Study scores 40\+ \(%\)$/);
  const cells = screen.getAllByRole("cell");
  expect(
    within(cells[1]).getByText(/Mean · 2014–2018 · 3 years/),
  ).toBeVisible();
  for (const cell of cells.slice(2)) {
    expect(
      within(cell).queryByText(/Available years:/),
    ).not.toBeInTheDocument();
  }
  const differing = {
    ...row,
    aggregation: {
      ...row.aggregation,
      years: { ...row.aggregation.years, high: [2014, 2017, 2018] },
    },
  };
  rerender(
    <RankingsTable
      entries={[{ row: differing, rank: 1 }]}
      measure="high"
      year={ALL_YEARS}
      latestYear={2025}
    />,
  );
  const updatedCells = screen.getAllByRole("cell");
  expect(
    within(updatedCells[1]).getByText(". Available years: 2014, 2017, 2018"),
  ).toBeInTheDocument();
  expect(
    within(updatedCells[2]).queryByText(/Available years:/),
  ).not.toBeInTheDocument();
  for (const cell of updatedCells.slice(3)) {
    expect(
      within(cell).getByText(". Available years: 2014, 2016, 2018"),
    ).toBeInTheDocument();
  }
});

it("shows each mean's own coverage, including gaps, single years and unavailable measures", (): void => {
  const base = getDataset().allYears[0];
  const row = {
    ...base,
    median: 35,
    high: 0,
    completion: null,
    aggregation: {
      ...base.aggregation,
      startYear: 2014,
      endYear: 2020,
      years: {
        ...base.aggregation.years,
        median: [2015, 2017, 2019],
        high: [2016],
        completion: [],
        enrolments: [2014, 2020],
        icsea: [2018],
      },
    },
  };
  render(
    <RankingsTable
      entries={[{ row, rank: 1 }]}
      measure="median"
      year={ALL_YEARS}
      latestYear={2025}
    />,
  );
  expect(
    screen.getByRole("columnheader", { name: "Median study score" }),
  ).toBeVisible();
  expect(
    screen.getByRole("columnheader", { name: "Study scores 40+ (%)" }),
  ).toBeVisible();
  expect(
    screen.getByRole("columnheader", { name: "VCE completion (%)" }),
  ).toBeVisible();
  expect(screen.getByText(/2015–2019 · 3 years/)).toBeVisible();
  expect(
    screen.getByText(". Available years: 2015, 2017, 2019"),
  ).toBeInTheDocument();
  expect(screen.getByText(/2016 · 1 year/)).toBeVisible();
  expect(screen.getByText("No available years")).toBeVisible();
  expect(
    screen.getByText(/Historical record · last recorded 2020/),
  ).toBeVisible();
  screen.getByText("School context").click();
  expect(screen.getByText(/2014–2020 · 2 years/)).toBeVisible();
  expect(screen.getByText(/2018 · 1 year/)).toBeVisible();
});

it("shows Albert Park's main coverage beneath its name and only completion's exception beside its value", (): void => {
  const row = getDataset().allYears.find(
    (record): boolean => record.name === "Albert Park College",
  )!;
  render(
    <RankingsTable
      entries={[{ row, rank: 1 }]}
      measure="median"
      year={ALL_YEARS}
      latestYear={2025}
    />,
  );
  const cells = screen.getAllByRole("cell");
  expect(
    within(cells[1]).getByText(/Mean · 2014–2025 · 12 years/),
  ).toBeVisible();
  for (const cell of cells.slice(2, 4)) {
    expect(
      within(cell).queryByText(/Available years:/),
    ).not.toBeInTheDocument();
  }
  expect(within(cells[4]).getByText(/2016–2025 · 10 years/)).toBeVisible();
});

it("keeps Bialik source identities separate and identifies only the older record as historical", (): void => {
  const rows = getDataset().allYears.filter(
    (row): boolean => row.name.toLowerCase() === "bialik college",
  );
  expect(rows).toHaveLength(2);
  render(
    <RankingsTable
      entries={rows.map((row, index): { row: typeof row; rank: number } => ({
        row,
        rank: index + 1,
      }))}
      measure="median"
      year={ALL_YEARS}
      latestYear={2025}
    />,
  );
  const historical = screen.getByText("hawthorn east").closest("tr")!;
  const current = screen.getByText("hawthorn").closest("tr")!;
  expect(
    within(historical).getAllByText(/2014–2019 · 6 years/).length,
  ).toBeGreaterThan(0);
  expect(within(historical).getByText(/Historical record/)).toBeVisible();
  expect(
    within(current).getAllByText(/2020–2025 · 6 years/).length,
  ).toBeGreaterThan(0);
  expect(
    within(current).queryByText(/Historical record/),
  ).not.toBeInTheDocument();
});
