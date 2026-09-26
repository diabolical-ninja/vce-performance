export type Measure =
  | "median"
  | "high"
  | "completion"
  | "tertiary"
  | "icsea"
  | "enrolments"
  | "staff";
export type Params = Record<string, string | string[] | undefined>;
export interface Selection {
  id: string;
  name: string;
  locality: string;
}
export interface FilterState {
  year: number;
  measure: Measure;
  sector: string;
  top: number;
  minimum: number;
  query: string;
  sort: string;
  selected: string[];
}
