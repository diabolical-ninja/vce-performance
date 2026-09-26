import type { ReactElement } from "react";
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
  return (
    <div
      className="overflow-x-auto p-4"
      tabIndex={0}
      role="region"
      aria-label="Scrollable annual trend chart"
    >
      <svg
        role="group"
        aria-label={`Annual ${measures[measure].label}. Exact values are available in the annual data table.`}
        viewBox={`0 0 ${plot.width} ${plot.height}`}
        className="w-full min-w-[680px]"
      >
        <ChartAxes years={years} domain={domain} />
        {schools.map((school, index): ReactElement => {
          const points = chartPoints(school, rows, years, measure, domain),
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
}: {
  years: number[];
  domain: [number, number];
}): ReactElement {
  const ticks = 4;
  const labelOffset = { x: 10, y: 4, bottom: 15 };
  const fractions = Array.from(
    { length: ticks + 1 },
    (_, index): number => index / ticks,
  );
  return (
    <g fill="#5D6E82" fontSize="12">
      {fractions.map((fraction): ReactElement => {
        const y = plot.top + fraction * (plot.height - plot.top - plot.bottom);
        return (
          <g key={fraction}>
            <line
              x1={plot.left}
              x2={plot.width - plot.right}
              y1={y}
              y2={y}
              stroke="#DCE4EF"
            />
            <text
              x={plot.left - labelOffset.x}
              y={y + labelOffset.y}
              textAnchor="end"
            >
              {(domain[1] - fraction * (domain[1] - domain[0])).toFixed(1)}
            </text>
          </g>
        );
      })}
      {years.map((year, index): ReactElement => (
        <text
          key={year}
          x={
            plot.left +
            (index / Math.max(1, years.length - 1)) *
              (plot.width - plot.left - plot.right)
          }
          y={plot.height - labelOffset.bottom}
          textAnchor="middle"
        >
          {year}
        </text>
      ))}
    </g>
  );
}
