import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { useSyncExternalStore } from "react";

vi.mock("next/navigation", (): object => ({
  usePathname: (): string =>
    useSyncExternalStore(
      (notify): (() => void) => {
        window.addEventListener("popstate", notify);
        return (): void => window.removeEventListener("popstate", notify);
      },
      (): string => window.location.pathname,
    ),
  useSearchParams: (): URLSearchParams => {
    const search = useSyncExternalStore(
      (notify): (() => void) => {
        window.addEventListener("popstate", notify);
        return (): void => window.removeEventListener("popstate", notify);
      },
      (): string => window.location.search,
    );
    return new URLSearchParams(search);
  },
  useRouter: (): object => ({
    push: (href: string): void => {
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
  }),
  notFound: (): never => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
HTMLElement.prototype.scrollIntoView = vi.fn();
vi.stubGlobal(
  "ResizeObserver",
  vi.fn((): ResizeObserver => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);
// Reproduce Next's native-history subscription for presentation-only URL state.
const originalPushState = window.history.pushState.bind(window.history);
window.history.pushState = (
  data: unknown,
  unused: string,
  url?: string | URL | null,
): void => {
  originalPushState(data, unused, url);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
beforeEach((): void => window.history.replaceState({}, "", "/"));

afterEach(cleanup);
