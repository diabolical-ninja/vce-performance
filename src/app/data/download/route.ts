import { readFileSync } from "node:fs";
export function GET(): Response {
  return new Response(
    readFileSync("vce_school_results_analysis_dataset.csv", "utf8"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vce-school-results.csv"',
      },
    },
  );
}
