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
import { ChartObservation } from "@/components/chart-observation";
import { ProfileSummary } from "@/components/profile-summary";
import { RankingsTable } from "@/components/rankings-table";
import { DataValue } from "@/components/data-value";
import { getRows } from "@/lib/data";
import { readFilters } from "@/lib/query";
import { directory } from "@/lib/schools";

const base = getRows()[0];
const schools = directory(getRows()).slice(0, 14);
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
  const menu = screen.getByRole("button", { name: "Menu" });
  expect(menu).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(menu);
  expect(menu).toHaveAttribute("aria-expanded", "true");
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
  const schoolsLink = screen.getByRole("link", { name: "Schools" });
  schoolsLink.addEventListener(
    "click",
    (event): void => event.preventDefault(),
    { once: true },
  );
  fireEvent.click(schoolsLink);
  expect(menu).toHaveAttribute("aria-expanded", "false");
});
it("exposes all filter modes and retains URL state on changes", (): void => {
  const state = readFilters({}, [2025, 2024]);
  const { rerender } = render(
    <Filters state={state} years={[2025, 2024]} context />,
  );
  fireEvent.click(screen.getByText(/More filters/));
  for (const [label, value] of [
    ["Results year", "2024"],
    ["Rank by", "high"],
    ["Sector", "Government"],
    ["Show", "10"],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  expect(window.location.search).toContain("top=10");
  fireEvent.change(screen.getByLabelText("Minimum total school enrolments"), {
    target: { value: "50" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply filter" }));
  expect(window.location.search).toContain("minimum=50");
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
  navigate("/?schools=c,d,e,f,g,h,i,j,k,l,m,n");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("checkbox")).toBeDisabled();
  navigate("/?schools=a,c,d,e,f,g,h,i,j,k,l,m");
  expect(screen.getByRole("checkbox")).toBeEnabled();
  fireEvent.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("status")).toHaveTextContent("11 of 12");
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
  expect(screen.getAllByRole("option")).toHaveLength(14);
  await user.keyboard("{ArrowDown}{ArrowUp}{Escape}");
  expect(input).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{ArrowDown}{Enter}");
  expect(window.location.search).toContain(schools[0].id);
  expect(screen.getByRole("status")).toHaveTextContent("added to comparison");
  await user.click(
    screen.getByRole("button", { name: "Show school suggestions" }),
  );
  expect(screen.getAllByRole("option")).toHaveLength(13);
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
      .slice(0, 12)
      .map((s): string => s.id)
      .join(",")}`,
  );
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    /12-school comparison limit/,
  );
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
  expect(screen.getByRole("group", { name: /Annual/ })).toBeVisible();
  expect(screen.getByText(/Focused scale/)).toBeVisible();
  fireEvent.click(screen.getByLabelText("Show full scale"));
  expect(window.location.search).toContain("scale=full");
  expect(screen.getByRole("table")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Hide annual data table" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "View annual data table" }),
  );
  expect(screen.getByRole("table")).toBeVisible();
  expect(screen.getAllByLabelText("Unavailable in this dataset")).toHaveLength(
    2,
  );
  expect(screen.getByRole("group", { name: /Annual/ })).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Hide annual data table" }),
  );
  fireEvent.click(screen.getByLabelText("Show full scale"));
  expect(window.location.search).toContain("scale=focused");
});
it("renders separately dated school context aligned beneath its headings", (): void => {
  const { rerender } = render(<ProfileSummary row={base} />);
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
      latestYear={2025}
    />,
  );
  expect(
    screen.getByRole("columnheader", { name: "Median study score" }),
  ).toHaveTextContent(/^Median study score$/);
  rerender(
    <RankingsTable
      entries={[{ row: base, rank: 1 }]}
      measure="high"
      year={2014}
      latestYear={2025}
    />,
  );
  expect(
    screen.getByRole("columnheader", { name: "Median study score" }),
  ).toBeVisible();
  expect(
    screen.getByRole("columnheader", { name: "Study scores 40+ (%)" }),
  ).toHaveTextContent(/^Study scores 40\+ \(%\)$/);
  rerender(
    <RankingsTable
      entries={[{ row: base, rank: 1 }]}
      measure="icsea"
      year={2014}
      latestYear={2025}
    />,
  );
  expect(screen.queryByText("50")).not.toBeInTheDocument();
  rerender(
    <RankingsTable
      entries={[{ row: { ...base, profileYear: null }, rank: 1 }]}
      measure="median"
      year={2025}
      latestYear={2025}
    />,
  );
  expect(
    screen.getByText("No same-year school profile is available."),
  ).toBeInTheDocument();
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
  expect(screen.queryByLabelText("Results year")).not.toBeInTheDocument();
  expect(screen.queryByText("Results at a glance")).not.toBeInTheDocument();
  expect(within(screen.getByRole("table")).getByText(/Academy/)).toBeVisible();
});
it("shows graph tooltips on hover, focus and touch, and dismisses with Escape", (): void => {
  render(
    <svg>
      <ChartObservation
        x={10}
        y={20}
        color="#4e79a7"
        label="Academy · 2024 · Median study score: 32"
      />
    </svg>,
  );
  const point = screen.getByRole("button");
  fireEvent.pointerEnter(point);
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "Median study score: 32",
  );
  fireEvent.pointerLeave(point);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.focus(point);
  fireEvent.keyDown(point, { key: "Tab" });
  expect(screen.getByRole("tooltip")).toBeVisible();
  fireEvent.keyDown(point, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.click(point);
  expect(screen.getByRole("tooltip")).toBeVisible();
  fireEvent.blur(point);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
