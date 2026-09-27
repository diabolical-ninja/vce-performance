import { z } from "zod";

const limits = {
  schemaVersion: 3,
  rate: 100,
  firstYear: 2014,
  lastYear: 2100,
  latitude: 90,
  longitude: 180,
  score: 50,
  hashLength: 64,
};
const rate = z.number().min(0).max(limits.rate).nullable();
const count = z.number().nonnegative().nullable();
const year = z.number().int().min(limits.firstYear).max(limits.lastYear);
const yearCount = z.number().int().nonnegative();
const aggregation = z.object({
  startYear: year,
  endYear: year,
  years: z.object({
    median: z.array(year),
    high: z.array(year),
    completion: z.array(year),
    tertiary: z.array(year),
    icsea: z.array(year),
    enrolments: z.array(year),
    staff: z.array(year),
  }),
  counts: z.object({
    median: yearCount,
    high: yearCount,
    completion: yearCount,
    tertiary: yearCount,
    icsea: yearCount,
    enrolments: yearCount,
    staff: yearCount,
  }),
});
const row = z.object({
  id: z.string().regex(/^[a-f0-9]{16}$/),
  sourceRow: z.number().int(),
  name: z.string().min(1),
  locality: z.string(),
  acaraId: z.string(),
  year,
  sector: z.enum(["Government", "Catholic", "Independent", "Unknown"]),
  schoolType: z.string(),
  profileYear: year.nullable(),
  locationYear: year.nullable(),
  lat: z.number().min(-limits.latitude).max(limits.latitude).nullable(),
  lng: z.number().min(-limits.longitude).max(limits.longitude).nullable(),
  median: z.number().min(0).max(limits.score).nullable(),
  high: rate,
  completion: rate,
  tertiary: rate,
  icsea: count,
  enrolments: count,
  staff: count,
  aggregation: aggregation.optional(),
});
export const datasetSchema = z.object({
  schemaVersion: z.literal(limits.schemaVersion),
  sourceSha256: z.string().length(limits.hashLength),
  rows: z.array(row).min(1),
  allYears: z.array(row.extend({ aggregation })).min(1),
});
export type SchoolRow = z.infer<typeof row>;
