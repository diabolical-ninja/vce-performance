import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop rankings stay compact with keyboard-accessible context", async ({
  page,
}): Promise<void> => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const path of ["/", "/?year=2025"]) {
    await page.goto(path);
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const typicalRows = rows.filter({ hasNotText: "Historical record" });
    for (const row of (await typicalRows.all()).slice(0, 5)) {
      const box = await row.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(64);
      expect(box!.height).toBeLessThanOrEqual(80);
    }
    const first = typicalRows.first();
    const details = first.locator("details");
    const summary = details.locator("summary");
    await expect(summary).toHaveAccessibleName(/School context for /);
    await expect(details).not.toHaveAttribute("open");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(first.getByText(/Whole-school enrolments/)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("Space");
    await expect(details).not.toHaveAttribute("open");
    expect((await first.boundingBox())!.height).toBeLessThanOrEqual(80);
  }
});

test("mobile ranking context keeps a full touch target and expands in flow", async ({
  page,
}): Promise<void> => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const first = page.locator("tbody tr").first();
  const summary = first.locator("summary");
  await expect(summary).toBeVisible();
  const target = await summary.boundingBox();
  expect(target!.height).toBeGreaterThanOrEqual(44);
  expect(target!.width).toBeGreaterThanOrEqual(44);
  await summary.click();
  await expect(first.getByText(/Whole-school enrolments/)).toBeVisible();
  expect(
    await page.evaluate(
      (): boolean => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await summary.click();
  await expect(first.locator("details")).not.toHaveAttribute("open");
});
