"use client";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChartObservation } from "@/components/chart-observation";
import {
  chartDomain,
  chartPoints,
  linePath,
  plot,
  seriesStyles,
} from "@/lib/chart";
import { measures, formatValue } from "@/lib/measures";
import type { SchoolRow } from "@/lib/contract";
import type { Measure, Selection } from "@/types/data";

export function TrendChart({
  schools,
  rows,
  years,
  measure,
  full,
}: {
  schools: Selection[];
  rows: SchoolRow[];
  years: number[];
  measure: Measure;
  full: boolean;
}): ReactElement {
  const domain = chartDomain(rows, measure, full);
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(plot.width);
  const layout = { ...plot, width };
  useEffect((): (() => void) => {
    const observer = new ResizeObserver(([entry]): void => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(svg.current!);
    return (): void => observer.disconnect();
  }, []);
  return (
    <div className="p-4" role="region" aria-label="Annual trend chart">
      <svg
        ref={svg}
        role="group"
        aria-label={`Annual ${measures[measure].label}. Exact values are available in the annual data table.`}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block h-[310px] w-full"
      >
        <ChartAxes years={years} domain={domain} layout={layout} />
        {schools.map((school, index): ReactElement => {
          const points = chartPoints(school, rows, years, measure, {
              domain,
              layout,
            }),
            style = seriesStyles[index];
          return (
            <g key={school.id}>
              <path
                d={linePath(points)}
                fill="none"
                stroke={style.color}
                strokeWidth="2"
                strokeDasharray={style.dash}
              />
              {points
                .filter((point): boolean => point.value !== null)
                .map((point): ReactElement => (
                  <ChartObservation
                    key={point.year}
                    x={point.x}
                    y={point.y}
                    color={style.color}
                    label={`${school.name} · ${point.year} · ${measures[measure].label}: ${formatValue(point.value, measure)}`}
                  />
                ))}
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-3 text-xs">
        {schools.map((school, index): ReactElement => (
          <li key={school.id} className="flex items-center gap-2">
            <svg width="30" height="8" aria-hidden="true">
              <line
                x1="0"
                x2="30"
                y1="4"
                y2="4"
                stroke={seriesStyles[index].color}
                strokeWidth="2"
                strokeDasharray={seriesStyles[index].dash}
              />
            </svg>
            {school.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
function ChartAxes({
  years,
  domain,
  layout,
}: {
  years: number[];
  domain: [number, number];
  layout: typeof plot;
}): ReactElement {
  const ticks = 4;
  const plotWidth = layout.width - layout.left - layout.right;
  const yearLabelSpacing = 60;
  // Keep both endpoints and spread readable year labels across the full period.
  const yearLabelCount = Math.min(
    years.length,
    Math.max(2, Math.floor(plotWidth / yearLabelSpacing) + 1),
  );
  const yearIndices = Array.from(
    { length: yearLabelCount },
    (_, index): number =>
      Math.round(
        (index * (years.length - 1)) / Math.max(1, yearLabelCount - 1),
      ),
  );
  const labelOffset = { x: 10, y: 4, bottom: 15 };
  const fractions = Array.from(
    { length: ticks + 1 },
    (_, index): number => index / ticks,
  );
  return (
    <g fill="#5D6E82" fontSize="12">
      {fractions.map((fraction): ReactElement => {
        const y =
          layout.top + fraction * (layout.height - layout.top - layout.bottom);
        return (
          <g key={fraction}>
            <line
              x1={layout.left}
              x2={layout.width - layout.right}
              y1={y}
              y2={y}
              stroke="#DCE4EF"
            />
            <text
              x={layout.left - labelOffset.x}
              y={y + labelOffset.y}
              textAnchor="end"
            >
              {(domain[1] - fraction * (domain[1] - domain[0])).toFixed(1)}
            </text>
          </g>
        );
      })}
      {yearIndices.map((index): ReactElement => (
        <text
          key={years[index]}
          x={layout.left + (index / Math.max(1, years.length - 1)) * plotWidth}
          y={layout.height - labelOffset.bottom}
          textAnchor="middle"
        >
          {years[index]}
        </text>
      ))}
    </g>
  );
}
