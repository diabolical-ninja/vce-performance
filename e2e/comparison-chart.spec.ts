import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { datasetSchema } from "../src/lib/contract";
import { formatValue } from "../src/lib/measures";

const rows = datasetSchema
  .parse(JSON.parse(readFileSync("data/website.json", "utf8")))
  .rows.filter((row): boolean => row.name === "Bialik College");

test("the Bialik comparison shows both histories with readable axes at every width", async ({
  page,
  isMobile,
}): Promise<void> => {
  const ids = [...new Set(rows.map((row): string => row.id))];
  expect(ids).toHaveLength(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/compare?schools=${ids.join(",")}`);
  const chart = page.getByRole("region", { name: "Annual trend chart" });
  const svg = chart.getByRole("group");
  for (const width of [390, 320, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        svg.evaluate((element: SVGSVGElement): number =>
          Math.abs(
            element.viewBox.baseVal.width -
              element.getBoundingClientRect().width,
          ),
        ),
      )
      .toBeLessThan(1);
    await expect(svg.getByText("2014", { exact: true })).toBeVisible();
    await expect(svg.getByText("2025", { exact: true })).toBeVisible();
    const geometry = await svg.evaluate((element: SVGSVGElement) => {
      const bounds = element.getBoundingClientRect();
      const labels = [...element.querySelectorAll("text")];
      const yearBounds = labels
        .filter((label): boolean => /^20\d{2}$/.test(label.textContent!))
        .map((label): DOMRect => label.getBoundingClientRect());
      return {
        scale: element.getScreenCTM()!.a,
        fontSizes: labels.map(
          (label): string => getComputedStyle(label).fontSize,
        ),
        labelsInside: labels.every((label): boolean => {
          const box = label.getBoundingClientRect();
          return box.left >= bounds.left && box.right <= bounds.right;
        }),
        separated: yearBounds
          .slice(1)
          .every(
            (box, index): boolean => box.left - yearBounds[index].right >= 10,
          ),
        pointsInside: [...element.querySelectorAll("circle")].every(
          (point): boolean => {
            const box = point.getBoundingClientRect();
            return box.left >= bounds.left && box.right <= bounds.right;
          },
        ),
      };
    });
    expect(geometry.scale).toBeCloseTo(1);
    expect(new Set(geometry.fontSizes)).toEqual(new Set(["12px"]));
    expect(geometry.labelsInside).toBe(true);
    expect(geometry.separated).toBe(true);
    expect(geometry.pointsInside).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const latest = rows.find((row): boolean => row.year === 2025)!;
  const label = `${latest.name} · 2025 · Median study score: ${formatValue(latest.median, "median")}`;
  const point = chart.getByRole("button", { name: label, exact: true });
  await point.focus();
  await expect(page.getByRole("tooltip")).toHaveText(label);
  await point.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  for (const key of ["Enter", "Space"]) {
    await point.press(key);
    await expect(page.getByRole("tooltip")).toHaveText(label);
    await point.press("Escape");
  }
  if (isMobile) await point.tap();
  else await point.hover();
  await expect(page.getByRole("tooltip")).toHaveText(label);
  const table = page.getByRole("table");
  await expect(table.locator("tbody tr")).toHaveCount(12);
  await expect(table.locator("tbody tr").first()).toContainText(
    formatValue(latest.median, "median"),
  );
  await expect(
    table.locator("tbody tr").first().getByLabel("Unavailable in this dataset"),
  ).toHaveCount(1);
});
