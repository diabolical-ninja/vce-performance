import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TrendChart } from "@/components/trend-chart";
import { getRows } from "@/lib/data";

it("fits the entire period to the container, thinning labels without dropping observations or closing gaps", (): void => {
  let resize: ResizeObserverCallback;
  const observer = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
  vi.mocked(ResizeObserver).mockImplementationOnce(
    (callback): ResizeObserver => {
      resize = callback;
      return observer;
    },
  );
  const base = getRows()[0];
  const years = Array.from({ length: 12 }, (_, index): number => 2014 + index);
  const rows = years.map((year) => ({
    ...base,
    year,
    median: year === 2020 ? null : 32,
  }));
  const props = {
    schools: [base],
    rows,
    years,
    measure: "median" as const,
    full: false,
  };
  const { unmount, rerender } = render(<TrendChart {...props} />);
  const svg = screen.getByRole("group");
  expect(observer.observe).toHaveBeenCalledWith(svg);
  function resizeTo(width: number): void {
    act((): void =>
      resize([{ contentRect: { width } } as ResizeObserverEntry], observer),
    );
  }
  resizeTo(324);
  expect(svg).toHaveAttribute("viewBox", "0 0 324 310");
  expect(screen.getByText("2014")).toBeInTheDocument();
  expect(screen.getByText("2025")).toBeInTheDocument();
  expect(svg.querySelectorAll("text")).toHaveLength(9);
  expect(screen.getAllByRole("button")).toHaveLength(11);
  expect(screen.getAllByRole("button").at(-1)).toHaveAttribute("cx", "299");
  expect(
    svg.querySelector("path")?.getAttribute("d")?.match(/M/g),
  ).toHaveLength(2);
  resizeTo(0);
  expect(svg).toHaveAttribute("viewBox", "0 0 324 310");
  resizeTo(900);
  expect(svg.querySelectorAll("text")).toHaveLength(17);
  expect(screen.getAllByRole("button").at(-1)).toHaveAttribute("cx", "875");
  rerender(<TrendChart {...props} years={[2014]} />);
  expect(svg.querySelectorAll("text")).toHaveLength(6);
  rerender(<TrendChart {...props} years={[]} />);
  expect(svg.querySelectorAll("text")).toHaveLength(5);
  unmount();
  expect(observer.disconnect).toHaveBeenCalledOnce();
});
