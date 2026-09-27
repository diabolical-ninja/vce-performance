import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function noOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(
      (): boolean => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("mobile rankings expose the first school and value before scrolling", async ({
  page,
}): Promise<void> => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const first = page.locator("tbody tr").first();
  await expect(first.getByRole("link")).toBeInViewport({ ratio: 1 });
  await expect(first.locator("td").nth(2)).toBeInViewport({ ratio: 1 });
  await expect(page.getByLabel("Minimum total school enrolments")).toBeHidden();
  const more = page.getByText(/More filters/);
  await expect(more).toContainText("Enrolments ≥ 50");
  await more.focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Minimum total school enrolments").fill("100");
  await page.getByRole("button", { name: "Apply filter" }).click();
  await expect(page).toHaveURL(/minimum=100/);
  await expect(more).toContainText("Enrolments ≥ 100");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(more).toContainText("Enrolments ≥ 100");
  const coverage = page.getByText(/All years: available-year means/);
  await coverage.press("Enter");
  await expect(page.getByText(/not a pooled student median/)).toBeVisible();
  await noOverflow(page);
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link")).toHaveCount(5);
  await expect(nav.getByRole("link", { name: "Rankings" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await noOverflow(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await nav.getByRole("link", { name: "Map", exact: true }).click();
  await expect(page).toHaveURL(/\/map\?.*minimum=100/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("mobile map exposes a useful map area and narrow controls do not overflow", async ({
  page,
}): Promise<void> => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/*.tile.openstreetmap.org/**", (route): Promise<void> =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#edf4ff"/></svg>',
    }),
  );
  await page.goto("/map");
  const map = page.getByLabel("School locations map", { exact: true });
  await expect(page.locator(".leaflet-interactive").first()).toBeAttached();
  const box = await map.boundingBox();
  expect(box).not.toBeNull();
  expect(844 - box!.y).toBeGreaterThanOrEqual(200);
  await noOverflow(page);
  await page.getByRole("button", { name: "Show list", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Schools in this area" })
      .getByRole("link")
      .first(),
  ).toBeInViewport({ ratio: 1 });
  for (const path of ["/", "/map", "/schools", "/compare"]) {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(path);
    if (path === "/") await page.getByText(/More filters/).click();
    await noOverflow(page);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await noOverflow(page);
  }
});
