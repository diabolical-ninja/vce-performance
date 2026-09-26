import { runInNewContext } from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";
import type { ScriptProps } from "next/script";
import type { ReactElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "@/components/google-analytics";

vi.mock("next/script", (): object => ({
  default: ({ strategy, ...props }: ScriptProps): ReactElement => (
    <script data-strategy={strategy} {...props} />
  ),
}));

afterEach((): void => {
  vi.unstubAllEnvs();
});

it.each([undefined, "", "UA-1234", "G-123';alert(1)//"])(
  "does not load analytics with an absent or invalid ID: %s",
  (id): void => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", id);
    expect(renderToStaticMarkup(<GoogleAnalytics />)).toBe("");
  },
);

it("loads GA4 after hydration and initializes one page view without losing queued events", (): void => {
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABC1234567");
  const container = new DOMParser().parseFromString(
    renderToStaticMarkup(<GoogleAnalytics />),
    "text/html",
  );
  const scripts = container.querySelectorAll("script");
  expect(scripts).toHaveLength(2);
  expect(scripts[1].getAttribute("src")).toBe(
    "https://www.googletagmanager.com/gtag/js?id=G-ABC1234567",
  );
  for (const script of scripts) {
    expect(script.getAttribute("data-strategy")).toBe("afterInteractive");
  }
  const context: { window?: object; dataLayer?: unknown[] } = {};
  context.window = context;
  runInNewContext(scripts[0].textContent!, context);
  expect(context.dataLayer).toHaveLength(2);
  expect(Array.from(context.dataLayer![1] as ArrayLike<unknown>)).toEqual([
    "config",
    "G-ABC1234567",
  ]);
  const queue = context.dataLayer;
  runInNewContext(scripts[0].textContent!, context);
  expect(context.dataLayer).toBe(queue);
  expect(context.dataLayer).toHaveLength(4);
});
