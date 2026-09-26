import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { getDataset } from "@/lib/data";

const file = vi.hoisted(() => ({ version: 1 }));
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  const mocked = {
    ...actual,
    readFileSync: vi.fn(actual.readFileSync),
    statSync: (): object => ({ mtimeMs: file.version, ctimeMs: 0, size: 1 }),
  };
  return { ...mocked, default: mocked };
});

it("reuses validated data across calls, reloads changed exports and rejects corrupt replacements", (): void => {
  const first = getDataset();
  expect(getDataset()).toBe(first);
  expect(readFileSync).toHaveBeenCalledTimes(1);

  file.version++;
  const refreshed = getDataset();
  expect(refreshed).not.toBe(first);
  expect(refreshed).toEqual(first);
  expect(readFileSync).toHaveBeenCalledTimes(2);

  file.version++;
  vi.mocked(readFileSync).mockReturnValueOnce("{}");
  expect(() => getDataset()).toThrow();
  // A failed refresh must not poison the cache or silently serve stale data.
  expect(getDataset()).toEqual(first);
  expect(readFileSync).toHaveBeenCalledTimes(4);
});
