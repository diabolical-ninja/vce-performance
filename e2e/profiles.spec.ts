import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { datasetSchema } from "../src/lib/contract";

test("every published school profile returns a rendered history", async ({
  request,
}): Promise<void> => {
  test.setTimeout(180000);
  const rows = datasetSchema.parse(
    JSON.parse(readFileSync("data/website.json", "utf8")),
  ).rows;
  const ids = [...new Set(rows.map((row): string => row.id))];
  const concurrency = 6;
  for (let offset = 0; offset < ids.length; offset += concurrency) {
    await Promise.all(
      ids.slice(offset, offset + concurrency).map(async (id): Promise<void> => {
        const response = await request.get(`/schools/${id}`);
        expect(response.status(), id).toBe(200);
        const html = await response.text();
        expect(html, id).toContain("Annual history");
        expect(html, id).toContain("Analytical CSV row:");
        expect(html, id).not.toContain("Results could not be loaded");
      }),
    );
  }
});
