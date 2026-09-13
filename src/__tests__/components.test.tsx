import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { Filters } from "@/components/filters";
import { SearchForm } from "@/components/search-form";
import { Brand, Navigation, CarryLink } from "@/components/navigation";
import { SchoolPicker } from "@/components/school-picker";
import { SelectSchool, CompareAction } from "@/components/selection";
import { SelectionBar } from "@/components/selection-bar";
import { SelectedSchools } from "@/components/selected-schools";
import { ComparisonChart } from "@/components/comparison-chart";
import { CompareContent } from "@/components/compare-content";
import { ResultsSnapshot } from "@/components/results-snapshot";
import { ProfileSummary } from "@/components/profile-summary";
import { RankingsTable } from "@/components/rankings-table";
import { DataValue } from "@/components/data-value";
import { getRows } from "@/lib/data";
import { readFilters } from "@/lib/query";
import { directory } from "@/lib/schools";

const base = getRows()[0];
const schools = directory(getRows()).slice(0, 6);
function navigate(url: string): void {
  act((): void => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}

it("provides shadcn variants, composed links, and active route navigation", (): void => {
  const clicked = vi.fn();
  render(
    <>
      <Button onClick={clicked}>Action</Button>
      <Button variant="outline" asChild>
        <a href="/about">Linked action</a>
      </Button>
      <Brand />
      <Navigation />
      <CarryLink href="/compare">Keep state</CarryLink>
    </>,
  );
  fireEvent.click(screen.getByText("Action"));
  expect(clicked).toHaveBeenCalledOnce();
  expect(screen.getByRole("link", { name: "Rankings" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  navigate("/schools/example?schools=a&year=2024");
  expect(screen.getByRole("link", { name: "Schools" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByText("Keep state")).toHaveAttribute(
    "href",
    "/compare?schools=a&year=2024",
  );
});
it("exposes all filter modes and retains URL state on changes", (): void => {
  const state = readFilters({}, [2025, 2024]);
  const { rerender } = render(
    <Filters state={state} years={[2025, 2024]} context />,
  );
  for (const [label, value] of [
    ["Results year", "2024"],
    ["Rank by", "high"],
    ["Sector", "Government"],
    ["Show", "10"],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  expect(window.location.search).toContain("top=10");
  rerender(
    <Filters
      state={state}
      years={[2025, 2024]}
      context={false}
      mode="schools"
    />,
  );
  expect(screen.getByLabelText("Sector")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Sort by"), {
    target: { value: "high" },
  });
  expect(window.location.search).toContain("sort=high");
  rerender(<Filters state={state} years={[2025]} context mode="compare" />);
  expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Measure"), {
    target: { value: "staff" },
  });
  expect(window.location.search).toContain("measure=staff");
});
it("preserves hidden search parameters and supports a disabled enrolment filter", (): void => {
  navigate("/?q=old&schools=a");
  const { rerender } = render(<SearchForm />);
  expect(
    screen.getByPlaceholderText("Search schools or suburbs"),
  ).toHaveAttribute("type", "search");
  expect(document.querySelector('input[name="schools"]')).toHaveValue("a");
  rerender(
    <SearchForm
      name="minimum"
      label="Minimum enrolments"
      value="500"
      disabled
    />,
  );
  expect(screen.getByLabelText("Minimum enrolments")).toBeDisabled();
  expect(screen.getByRole("button")).toBeDisabled();
});
it("adds, removes and caps persistent selections from directory and profile controls", (): void => {
  render(
    <>
      <SelectSchool id="a" name="Alpha" />
      <CompareAction id="b" />
      <SelectionBar />
    </>,
  );
  fireEvent.click(screen.getByRole("checkbox"));
  expect(window.location.search).toContain("schools=a");
  fireEvent.click(screen.getByRole("checkbox"));
  expect(window.location.search).toBe("");
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveTextContent(
    "Remove from comparison",
  );
  fireEvent.click(screen.getByRole("button"));
  expect(window.location.search).toBe("");
  navigate("/?schools=c,d,e,f");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("checkbox")).toBeDisabled();
  navigate("/?schools=a,c,d,e");
  expect(screen.getByRole("checkbox")).toBeEnabled();
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("status")).toHaveTextContent("3 of 4");
});
it("operates the full picker by keyboard, pointer, outside focus, empty search and limit state", async (): Promise<void> => {
  const user = userEvent.setup();
  render(
    <>
      <SchoolPicker schools={schools} />
      <button>Outside</button>
    </>,
  );
  const input = screen.getByRole("combobox");
  await user.click(input);
  expect(screen.getAllByRole("option")).toHaveLength(6);
  await user.keyboard("{ArrowDown}{ArrowUp}{Escape}");
  expect(input).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{ArrowDown}{Enter}");
  expect(window.location.search).toContain(schools[0].id);
  expect(screen.getByRole("status")).toHaveTextContent("added to comparison");
  await user.click(
    screen.getByRole("button", { name: "Show school suggestions" }),
  );
  expect(screen.getAllByRole("option")).toHaveLength(5);
  await user.type(input, "zzzzzz");
  expect(screen.getByText(/No matching schools/)).toBeVisible();
  await user.keyboard("{ArrowDown}{Enter}{Escape}");
  await user.clear(input);
  await user.type(input, schools[1].locality);
  expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
  await user.click(screen.getAllByRole("option")[0]);
  await user.click(input);
  await user.click(screen.getByText("Outside"));
  expect(input).toHaveAttribute("aria-expanded", "false");
  await user.click(
    screen.getByRole("button", { name: "Show school suggestions" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Show school suggestions" }),
  );
  expect(input).toHaveAttribute("aria-expanded", "false");
  navigate(
    `/?schools=${schools
      .slice(0, 4)
      .map((s): string => s.id)
      .join(",")}`,
  );
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByText(/Four-school comparison limit/)).toBeVisible();
});
it("removes chips and reopens comparison capacity", (): void => {
  navigate(`/?schools=${schools[0].id}`);
  render(<SelectedSchools schools={[schools[0]]} />);
  fireEvent.click(
    screen.getByRole("button", { name: `Remove ${schools[0].name}` }),
  );
  expect(window.location.search).toBe("");
});
it("makes annual charts, gaps, exact tables and scale toggles accessible", (): void => {
  const data = [base, { ...base, year: 2016, median: null }];
  render(
    <ComparisonChart
      schools={[base]}
      rows={data}
      years={[2014, 2015, 2016]}
      measure="median"
    />,
  );
  expect(screen.getByRole("img")).toBeVisible();
  expect(screen.getByText(/Focused scale/)).toBeVisible();
  fireEvent.click(screen.getByLabelText("Show full scale"));
  expect(window.location.search).toContain("scale=full");
  fireEvent.click(
    screen.getByRole("button", { name: "View annual data table" }),
  );
  expect(screen.getByRole("table")).toBeVisible();
  expect(screen.getAllByLabelText("Unavailable in this dataset")).toHaveLength(
    2,
  );
  fireEvent.click(screen.getByRole("button", { name: "View trend chart" }));
  fireEvent.click(screen.getByLabelText("Show full scale"));
  expect(window.location.search).toContain("scale=focused");
});
it("renders honest snapshots for gains, falls, missing years and context", (): void => {
  const fixtures = [
    base,
    { ...base, year: 2015, median: 35 },
    { ...base, id: "second", year: 2014, median: 39 },
    { ...base, id: "second", year: 2015, median: 30 },
  ];
  const { rerender } = render(
    <ResultsSnapshot
      schools={[base, { ...base, id: "second" }, { ...base, id: "missing" }]}
      rows={fixtures}
      year={2015}
      measure="median"
    />,
  );
  expect(screen.getByText("+3.0 study score points")).toBeVisible();
  expect(screen.getByText("-9.0 study score points")).toBeVisible();
  rerender(
    <ResultsSnapshot
      schools={[base]}
      rows={[{ ...base, year: 2015 }]}
      year={2015}
      measure="median"
    />,
  );
  expect(screen.getByLabelText("Unavailable in this dataset")).toBeVisible();
  rerender(<ProfileSummary row={base} />);
  expect(screen.getByText(/^ACARA school profile/)).toHaveTextContent("2014");
  rerender(<ProfileSummary row={{ ...base, profileYear: null }} />);
  expect(screen.getByText(/No 2014 profile/)).toBeVisible();
});
it("renders ranking measures, full-range bars and unavailable values", (): void => {
  const { rerender } = render(
    <RankingsTable
      entries={[{ row: base, rank: 1 }]}
      measure="median"
      year={2014}
    />,
  );
  expect(screen.getByText("50")).toBeVisible();
  rerender(
    <RankingsTable
      entries={[{ row: base, rank: 1 }]}
      measure="high"
      year={2014}
    />,
  );
  expect(
    screen.getByRole("columnheader", { name: "Median study score" }),
  ).toBeVisible();
  rerender(
    <RankingsTable
      entries={[{ row: base, rank: 1 }]}
      measure="icsea"
      year={2014}
    />,
  );
  expect(screen.queryByText("50")).not.toBeInTheDocument();
  rerender(<DataValue value={null} measure="median" />);
  expect(screen.getByLabelText("Unavailable in this dataset")).toBeVisible();
});
it("provides an empty comparison and selected-school histories without shipping unrelated histories", (): void => {
  const state = readFilters({}, [2014]);
  const { rerender } = render(
    <CompareContent
      rows={[base]}
      schools={[base]}
      years={[2014]}
      state={state}
    />,
  );
  expect(screen.getByText(/Add a school to start/)).toBeVisible();
  navigate(`/?schools=${base.id}`);
  rerender(
    <CompareContent
      rows={[base, { ...base, id: "other" }]}
      schools={[base]}
      years={[2014]}
      state={{ ...state, selected: [base.id, "bad"] }}
    />,
  );
  expect(within(screen.getByRole("table")).getByText(base.name)).toBeVisible();
});
