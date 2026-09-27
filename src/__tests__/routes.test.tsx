import { render, screen, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import RankingsPage from "@/app/page";
import SchoolsPage from "@/app/schools/page";
import ComparePage from "@/app/compare/page";
import ProfilePage, { generateMetadata } from "@/app/schools/[id]/page";
import MapPage from "@/app/map/page";
import AboutPage from "@/app/about/page";
import RootLayout from "@/app/layout";
import ErrorPage from "@/app/error";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import { GET } from "@/app/data/download/route";
import { getRows } from "@/lib/data";

vi.mock("@/components/map-canvas", (): object => ({
  MapCanvas: (): React.ReactElement => <div>Map canvas</div>,
}));
const rows = getRows();
const school = rows[0];
it("renders independent rankings, missing context and absent measures server-side", async (): Promise<void> => {
  render(
    await RankingsPage({
      searchParams: Promise.resolve({
        q: "never restrict rankings",
        schools: "invalid",
      }),
    }),
  );
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "VCE school rankings",
  );
  expect(screen.getByRole("table")).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Top 5 school source records" }),
  ).toBeVisible();
  expect(
    screen.getByText(/Coverage varies by record and measure/),
  ).toBeVisible();
  cleanup();
  render(
    await RankingsPage({
      searchParams: Promise.resolve({ year: "2025", measure: "icsea" }),
    }),
  );
  expect(screen.getByText("No available results")).toBeVisible();
  cleanup();
  render(
    await RankingsPage({
      searchParams: Promise.resolve({ year: "2024", sector: "Government" }),
    }),
  );
  expect(screen.getByText(/Sector and school context/)).toBeVisible();
});
it("renders directory rows including missing outcomes, sorting and empty search", async (): Promise<void> => {
  render(
    await SchoolsPage({ searchParams: Promise.resolve({ q: "Academy" }) }),
  );
  expect(screen.getByRole("table")).toBeVisible();
  cleanup();
  render(
    await SchoolsPage({
      searchParams: Promise.resolve({ q: "Adass", sort: "high", year: "2024" }),
    }),
  );
  expect(
    screen.getAllByLabelText("Unavailable in this dataset").length,
  ).toBeGreaterThan(0);
  cleanup();
  render(
    await SchoolsPage({
      searchParams: Promise.resolve({ q: "nomatchingname" }),
    }),
  );
  expect(screen.getByText(/No schools match/)).toBeVisible();
});
it("composes comparison routes with and without selected records", async (): Promise<void> => {
  render(await ComparePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("combobox")).toBeVisible();
  cleanup();
  render(
    await ComparePage({
      searchParams: Promise.resolve({ schools: school.id }),
    }),
  );
  expect(screen.getByRole("group", { name: /Annual/ })).toBeVisible();
});
it("renders valid historical profiles, source dates, unknown IDs and metadata", async (): Promise<void> => {
  expect(
    await generateMetadata({ params: Promise.resolve({ id: school.id }) }),
  ).toEqual({ title: school.name });
  expect(
    await generateMetadata({ params: Promise.resolve({ id: "invalid" }) }),
  ).toEqual({ title: "School not found" });
  await expect(
    ProfilePage({
      params: Promise.resolve({ id: "invalid" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
  for (const [id, year] of [
    [school.id, "2025"],
    [school.id, "2014"],
    [rows.find((row): boolean => !row.acaraId)!.id, "2025"],
  ]) {
    render(
      await ProfilePage({
        params: Promise.resolve({ id }),
        searchParams: Promise.resolve({ year }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Annual history" }),
    ).toBeVisible();
    cleanup();
  }
});
it("defaults the map to dated coverage and explains missing locations", async (): Promise<void> => {
  render(await MapPage({ searchParams: Promise.resolve({ q: "Fitzroy" }) }));
  expect(screen.getByLabelText("Results year")).toHaveValue("2024");
  cleanup();
  render(await MapPage({ searchParams: Promise.resolve({ year: "2025" }) }));
  expect(screen.getByText(/No same-year location coverage/)).toBeVisible();
  cleanup();
  render(await MapPage({ searchParams: Promise.resolve({ year: "all" }) }));
  expect(screen.getByLabelText("Results year")).toHaveValue("all");
});
it("renders the methodology and serves the exact downloadable analytical CSV", async (): Promise<void> => {
  render(<AboutPage />);
  expect(screen.getByText(/7,007 source rows/)).toBeVisible();
  const response = GET();
  expect(response.headers.get("Content-Type")).toContain("text/csv");
  expect((await response.text()).split("\n")).toHaveLength(7009);
});
it("provides the shell, loading, error recovery and not-found states", (): void => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <p>Page body</p>
    </RootLayout>,
  );
  expect(html).toContain('lang="en"');
  expect(html).toContain("Page body");
  render(<Loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
  cleanup();
  const reset = vi.fn();
  render(<ErrorPage reset={reset} />);
  screen.getByRole("button").click();
  expect(reset).toHaveBeenCalledOnce();
  cleanup();
  render(<NotFound />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/schools");
});
