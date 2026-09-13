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
  await page.getByText("Enrolment filter", { exact: true }).click();
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
  await expect(page.getByRole("status")).toHaveText("1 of 4 schools selected");
  await page.getByRole("link", { name: academy.name, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    academy.name,
  );
  await expect(page.getByText(/No 2025 profile is available/)).toBeVisible();
  await audit(page);
  await page.getByLabel("Results year").selectOption("2024");
  await expect(page.getByText(/^ACARA school profile/)).toContainText("2024");
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
test("comparison picker supports browsing, keyboard, four schools, removal, shared tables and all measures", async ({
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
  for (const name of [
    "Aitken College",
    "Albert Park College",
    "Melbourne High School",
  ]) {
    await input.fill(name);
    await page.getByRole("option").first().click();
    await expect(
      page.getByRole("button", { name: `Remove ${name}`, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText(/Four-school comparison limit/)).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Add a school" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Remove Aitken College", exact: true })
    .click();
  await expect(input).toBeVisible();
  await input.click();
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await audit(page);
  await page.getByRole("button", { name: "View annual data table" }).click();
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
    page.getByRole("button", { name: "View trend chart" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View trend chart" }).click();
  await expect(page.getByRole("img", { name: /Annual/ })).toBeVisible();
});
test("map has real points, exact list values, explicit area search and offline fallback", async ({
  page,
  isMobile,
}): Promise<void> => {
  await page.route("**/*.tile.openstreetmap.org/**", (route): Promise<void> =>
    route.abort(),
  );
  await page.goto("/map?q=fitzroy");
  await expect(page.getByLabel("Results year")).toHaveValue("2024");
  await expect(page.locator(".leaflet-interactive").first()).toBeAttached();
  await expect(page.getByText(/Map tiles could not be loaded/)).toBeVisible();
  if (isMobile) await page.getByRole("button", { name: "Show list" }).click();
  await page.getByRole("button", { name: "Select school" }).first().click();
  await expect(page.getByText(/Selected:/)).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Schools in this area" }),
  ).toContainText("Results 2024 · Location 2024");
  await audit(page);
  await page.getByRole("button", { name: "Search this area" }).click();
  await page.getByRole("button", { name: "All Victoria" }).click();
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
