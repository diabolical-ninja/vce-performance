"use client";
import { useId, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

export function ChartObservation({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}): ReactElement {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const id = useId();
  function show(target: SVGCircleElement): void {
    const bounds = target.getBoundingClientRect();
    const width = 288,
      offset = 12;
    setPosition({
      left: Math.max(
        offset,
        Math.min(bounds.left, window.innerWidth - width - offset),
      ),
      top: Math.max(offset, bounds.top - offset),
    });
  }
  return (
    <g>
      <circle cx={x} cy={y} r="3" fill={color} aria-hidden="true" />
      <circle
        cx={x}
        cy={y}
        r="9"
        fill="transparent"
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-describedby={position ? id : undefined}
        onPointerEnter={(event): void => show(event.currentTarget)}
        onPointerLeave={(): void => setPosition(null)}
        onFocus={(event): void => show(event.currentTarget)}
        onBlur={(): void => setPosition(null)}
        onClick={(event): void => show(event.currentTarget)}
        onKeyDown={(event): void => {
          if (event.key === "Escape") setPosition(null);
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            show(event.currentTarget);
          }
        }}
      />
      {position &&
        createPortal(
          <div
            role="tooltip"
            id={id}
            className="pointer-events-none fixed z-50 w-72 -translate-y-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white shadow-md"
            style={position}
          >
            {label}
          </div>,
          document.body,
        )}
    </g>
  );
}
