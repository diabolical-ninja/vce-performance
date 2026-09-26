import type { Measure } from "@/types/data";

interface Metric {
  label: string;
  unit: string;
  max: number | null;
  context: boolean;
  definition: string;
}
export const measures: Record<Measure, Metric> = {
  median: {
    label: "Median study score",
    unit: "study score points",
    max: 50,
    context: false,
    definition:
      "The reported annual school median, out of 50. This is not an ATAR or an estimate of teaching quality.",
  },
  high: {
    label: "Study scores 40+ (%)",
    unit: "percentage points",
    max: 100,
    context: false,
    definition:
      "Percentage of study scores of 40 or higher. The denominator is study scores, not students.",
  },
  completion: {
    label: "Satisfactory VCE completion (%)",
    unit: "percentage points",
    max: 100,
    context: false,
    definition: "The reported percentage of satisfactory VCE completions.",
  },
  tertiary: {
    label: "Tertiary applications (%)",
    unit: "percentage points",
    max: 100,
    context: false,
    definition:
      "VCE students applying for tertiary places through VTAC. Applications are not admissions.",
  },
  icsea: {
    label: "ICSEA",
    unit: "index points",
    max: null,
    context: true,
    definition:
      "Index of Community Socio-Educational Advantage. School context, not an academic outcome or teaching-quality score.",
  },
  enrolments: {
    label: "Total school enrolments",
    unit: "students",
    max: null,
    context: true,
    definition: "Whole-school enrolments, not the VCE cohort size.",
  },
  staff: {
    label: "Teaching staff",
    unit: "staff",
    max: null,
    context: true,
    definition:
      "Teaching staff reported in the ACARA school profile for the stated year.",
  },
};
export const measureKeys = Object.keys(measures) as Measure[];
export function formatValue(value: number | null, measure: Measure): string {
  if (value === null) return "—";
  if (measures[measure].unit === "percentage points")
    return `${value.toFixed(1)}%`;
  return value.toLocaleString("en-AU", { maximumFractionDigits: 1 });
}
