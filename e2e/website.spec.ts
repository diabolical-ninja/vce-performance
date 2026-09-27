import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { datasetSchema } from "../src/lib/contract";
import { formatValue, measureKeys, measures } from "../src/lib/measures";

const rows = datasetSchema.parse(
  JSON.parse(readFileSync("data/website.json", "utf8")),
).rows;
const latest = rows.filter((row): boolean => row.year === 2025);
const academy = latest.find(
  (row): boolean => row.name === "Academy of Mary Immaculate",
)!;
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }): void => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error): void => {
    errors.push(error.message);
  });
});
test.afterEach(async ({ page }): Promise<void> => {
  await page.waitForLoadState("networkidle");
  expect(browserErrors.get(page)).toEqual([]);
});
async function audit(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(
    await page.evaluate(
      (): boolean => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test
      .info()
      .outputPath(
        `${new URL(page.url()).pathname.replaceAll("/", "-") || "rankings"}.png`,
      ),
    fullPage: true,
  });
}
test("rankings load immediately, use exact source values, include ties and handle absent context", async ({
  page,
}): Promise<void> => {
  await page.goto("/");
  await expect(page.getByLabel("Results year")).toHaveValue("all");
  await page.getByText(/More filters/).click();
  await expect(page.getByLabel("Minimum total school enrolments")).toHaveValue(
    "50",
  );
  await expect(
    page.getByLabel("Minimum total school enrolments"),
  ).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("Mean");
  expect(
    await page
      .getByRole("heading", { level: 1 })
      .locator("..")
      .evaluate((element): number => element.getBoundingClientRect().height),
  ).toBeLessThan(110);
  await page.getByLabel("Results year").selectOption("2025");
  await expect(page.getByRole("table")).toHaveAccessibleName(
    "Median study score rankings · 2025",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "VCE school rankings",
  );
  const sorted = latest
    .filter((r): boolean => r.median !== null)
    .sort(
      (a, b): number =>
        Number(b.median) - Number(a.median) || a.name.localeCompare(b.name),
    );
  const cutoff = sorted[4].median!;
  const expected = sorted.filter((r): boolean => r.median! >= cutoff);
  await expect(page.locator("tbody tr")).toHaveCount(expected.length);
  await expect(page.locator("tbody tr").first()).toContainText(
    expected[0].name,
  );
  await expect(
    page.locator("tbody tr").first().locator("td").nth(2),
  ).toHaveText(formatValue(expected[0].median, "median"));
  await expect(
    page.getByRole("combobox", { name: "Sector", exact: true }),
  ).toBeDisabled();
  await audit(page);
  await page.getByLabel("Rank by").selectOption("icsea");
  await expect(page.getByText("No available results")).toBeVisible();
  await page.getByRole("link", { name: "View 2024 results" }).click();
  await expect(page.getByLabel("Results year")).toHaveValue("2024");
  if (
    (await page
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "More filters" }) })
      .getAttribute("open")) === null
  )
    await page.getByText(/More filters/).click();
  await expect(
    page.getByRole("combobox", { name: "Sector", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("combobox", { name: "Sector", exact: true })
    .selectOption("Government");
  await expect(page).toHaveURL(/sector=Government/);
  for (const measure of measureKeys) {
    await page.getByLabel("Rank by").selectOption(measure);
    await expect(page.getByRole("table")).toHaveAccessibleName(
      `${measures[measure].label} rankings · 2024`,
    );
    await expect(page.getByRole("table")).toBeVisible();
    await expect(
      page.locator("tbody tr").first().locator("td").nth(2),
    ).not.toBeEmpty();
  }
  await page.getByLabel("Minimum total school enrolments").fill("99999");
  await page.getByRole("button", { name: "Apply filter" }).click();
  await expect(page.getByText("No available results")).toBeVisible();
});
test("directory, profiles, comparison selections and history survive search and navigation", async ({
  page,
}): Promise<void> => {
  await page.goto("/schools");
  await expect(page.locator("tbody tr")).toHaveCount(588);
  await page.getByLabel("School or suburb").fill("fitzroy");
  await page.getByRole("button", { name: "Apply search" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("Academy");
  await page.getByRole("checkbox", { name: /Compare Academy/ }).check();
  await expect(page.getByRole("status")).toHaveText("1 of 12 schools selected");
  await page.getByRole("link", { name: academy.name, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    academy.name,
  );
  await expect(page.getByText(/No 2025 profile is available/)).toBeVisible();
  await page
    .getByRole("button", {
      name: `${academy.name} · 2024 · Median study score: 32`,
      exact: true,
    })
    .hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "Median study score: 32",
  );
  await page.getByRole("heading", { level: 1 }).hover();
  await audit(page);
  await page.getByLabel("Results year").selectOption("2024");
  await expect(page.getByText(/^ACARA school profile/)).toContainText("2024");
  expect(
    await page
      .locator("dl dd")
      .first()
      .locator("span")
      .first()
      .evaluate((element): string => getComputedStyle(element).alignItems),
  ).toBe("flex-start");
  await page.getByRole("link", { name: "Open comparison →" }).click();
  await expect(
    page.getByRole("button", { name: `Remove ${academy.name}` }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: `Remove ${academy.name}` }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    academy.name,
  );
  await page.goto("/schools?q=zzznomatch");
  await expect(page.getByText(/No schools match/)).toBeVisible();
});
test("minimum enrolments stays on Rankings across directory navigation and browser history", async ({
  page,
}): Promise<void> => {
  const annual = rows.filter((row): boolean => row.year === 2024);
  const params = new URLSearchParams({
    year: "2024",
    minimum: "1000",
    schools: academy.id,
  });
  await page.goto(`/?${params}`);
  await expect(page.getByText(/More filters/)).toContainText(
    "Enrolments ≥ 1000",
  );
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Schools", exact: true }).click();
  await expect(page).toHaveURL(`/schools?year=2024&schools=${academy.id}`);
  await expect(page.locator("tbody tr")).toHaveCount(annual.length);
  await expect(
    page.getByRole("checkbox", { name: `Compare ${academy.name}` }),
  ).toBeChecked();
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(annual.length);
  await page.goBack();
  await expect(page).toHaveURL(`/?${params}`);
  await expect(page.getByText(/More filters/)).toContainText(
    "Enrolments ≥ 1000",
  );
  await page.goForward();
  await expect(page.locator("tbody tr")).toHaveCount(annual.length);
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Rankings", exact: true }).click();
  await expect(page).toHaveURL(`/?year=2024&schools=${academy.id}`);
  await page.getByText(/More filters/).click();
  await expect(page.getByLabel("Minimum total school enrolments")).toHaveValue(
    "50",
  );
  await page.goto(`/schools?${params}`);
  await expect(page.locator("tbody tr")).toHaveCount(annual.length);
});
test("comparison picker supports twelve schools, tooltips, persistent annual tables and all measures", async ({
  page,
}): Promise<void> => {
  await page.goto("/compare");
  const input = page.getByRole("combobox", { name: "Add a school" });
  await input.fill("zzzzzzz");
  await expect(page.getByText(/No matching schools/)).toBeVisible();
  await input.fill("fitzroy");
  await input.press("ArrowDown");
  await input.press("ArrowUp");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: `Remove ${academy.name}` }),
  ).toBeVisible();
  const names = [
    ...new Set(
      latest
        .filter(
          (row): boolean => row.name !== academy.name && row.median !== null,
        )
        .map((row): string => row.name),
    ),
  ].slice(0, 11);
  for (const name of names) {
    await input.fill(name);
    await page.getByRole("option").first().click();
    await expect(
      page.getByRole("button", { name: `Remove ${name}`, exact: true }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("alert").filter({ hasText: "12-school" }),
  ).toContainText("12-school comparison limit");
  await expect(page.getByRole("button", { name: /^Remove / })).toHaveCount(12);
  await expect(page.getByLabel("Results year")).toHaveCount(0);
  await expect(page.getByText("Results at a glance")).toHaveCount(0);
  await expect(page.getByRole("table")).toBeVisible();
  const point = page.getByRole("button", {
    name: `${academy.name} · 2024 · Median study score: 32`,
    exact: true,
  });
  await point.focus();
  await expect(page.getByRole("tooltip")).toHaveText(
    `${academy.name} · 2024 · Median study score: 32`,
  );
  await point.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(
    page.getByRole("combobox", { name: "Add a school" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: `Remove ${names[0]}`, exact: true })
    .click();
  await expect(input).toBeVisible();
  await input.click();
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await audit(page);
  await page.getByRole("button", { name: "Hide annual data table" }).click();
  await page.getByRole("button", { name: "View annual data table" }).click();
  await expect(page.getByRole("group", { name: /Annual/ })).toBeVisible();
  await expect(page.getByRole("table").first().locator("tbody tr")).toHaveCount(
    12,
  );
  await expect(
    page.getByRole("table").first().locator("tbody tr").first(),
  ).toContainText(formatValue(academy.median, "median"));
  for (const measure of measureKeys) {
    await page
      .getByRole("combobox", { name: "Measure", exact: true })
      .selectOption(measure);
    await expect(page.getByRole("table").first()).toHaveAccessibleName(
      `Annual ${measures[measure].label}`,
    );
    await expect(
      page.getByRole("table").first().locator("tbody tr"),
    ).toHaveCount(12);
  }
  await page.getByLabel("Show full scale").check();
  await expect(page).toHaveURL(/scale=full/);
  await page.reload();
  await expect(page.getByLabel("Show full scale")).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Hide annual data table" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hide annual data table" }).click();
  await expect(page.getByRole("group", { name: /Annual/ })).toBeVisible();
});
test("map zooms suburb searches, follows the viewport, switches desktop views and offers all-year results", async ({
  page,
}): Promise<void> => {
  await page.route("**/*.tile.openstreetmap.org/**", (route): Promise<void> =>
    route.abort(),
  );
  await page.goto("/map?q=fitzroy");
  await expect(page.getByLabel("Results year")).toHaveValue("2024");
  await expect(page.locator(".leaflet-interactive").first()).toBeAttached();
  await expect(page.getByText(/Map tiles could not be loaded/)).toBeVisible();
  const list = page.getByRole("region", { name: "Schools in this area" });
  await expect(list.locator("li").first()).toBeVisible();
  const zoomedCount = await list.locator("li").count();
  expect(zoomedCount).toBeLessThan(100);
  const names = await list.getByRole("link").allTextContents();
  expect(
    names.some((name): boolean =>
      rows.some(
        (row): boolean =>
          row.year === 2024 && row.name === name && row.locality !== "FITZROY",
      ),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Select school" }).first().click();
  await expect(page.getByText(/Selected:/)).toBeVisible();
  await page.locator('.leaflet-interactive[stroke="#193C69"]').hover();
  await expect(page.locator(".leaflet-tooltip")).toContainText(
    "Median study score:",
  );
  await expect(page.locator(".leaflet-tooltip")).toContainText("sector");
  await page.getByRole("heading", { level: 1 }).click();
  await expect(
    page.getByRole("region", { name: "Schools in this area" }),
  ).toContainText("Results 2024 · Location 2024");
  await audit(page);
  await page.getByRole("button", { name: "Show list", exact: true }).click();
  await expect(
    page.getByLabel("School locations map", { exact: true }),
  ).toBeHidden();
  await page.getByRole("button", { name: "Show map", exact: true }).click();
  await expect(list).toBeHidden();
  await page.getByRole("button", { name: "Show map and list" }).click();
  await expect(list).toBeVisible();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect
    .poll(async (): Promise<number> => list.locator("li").count())
    .toBeGreaterThan(zoomedCount);
  await page.getByRole("button", { name: "All Victoria" }).click();
  await expect
    .poll(async (): Promise<number> => list.locator("li").count())
    .toBeGreaterThan(500);
  await page.getByLabel("Results year").selectOption("all");
  await expect(list).toContainText("Mean over");
  await page.getByLabel("Results year").selectOption("2025");
  await expect(page.getByText(/No same-year location coverage/)).toBeVisible();
});
test("all years, methodology, downloads, 404s and fixed light mobile layout work", async ({
  page,
  request,
}): Promise<void> => {
  const errors: string[] = [];
  page.on("pageerror", (error): void => {
    errors.push(error.message);
  });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  for (let year = 2014; year <= 2025; year++) {
    await page.goto(`/?year=${year}`);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByLabel("Results year")).toHaveValue(String(year));
  }
  await page.goto("/about");
  await audit(page);
  await expect(page.getByText(/7,007 source rows/)).toBeVisible();
  expect(
    await page
      .locator("body")
      .evaluate((body): string => getComputedStyle(body).backgroundColor),
  ).toBe("rgb(247, 249, 252)");
  await page.getByText("Study scores 40+ (%)", { exact: true }).click();
  await expect(page.getByText(/denominator is study scores/)).toBeVisible();
  const download = await request.get("/data/download");
  expect(await download.text()).toBe(
    readFileSync("vce_school_results_analysis_dataset.csv", "utf8"),
  );
  await page.goto("/schools/invalid");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "School or page not found",
  );
  expect(errors).toEqual([]);
});
