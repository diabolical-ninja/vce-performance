"""All-year presentation summaries; analytical aggregation remains Python."""
from collections import defaultdict
from math import fsum


def summarize(rows: list[dict], measures: dict[str, str]) -> list[dict]:
    groups = defaultdict(list)
    for row in rows:
        groups[row["id"]].append(row)
    summaries = []
    for history in groups.values():
        history = sorted(history, key=lambda row: row["year"])
        summary = dict(history[-1])
        profiles = [row for row in history if row["profileYear"] is not None]
        locations = [row for row in history if row["locationYear"] is not None]
        if profiles:
            for key in ("sector", "schoolType", "profileYear"):
                summary[key] = profiles[-1][key]
        if locations:
            for key in ("lat", "lng", "locationYear"):
                summary[key] = locations[-1][key]
        counts = {}
        for measure in measures:
            values = [row[measure] for row in history if row[measure] is not None]
            counts[measure] = len(values)
            summary[measure] = fsum(values) / len(values) if values else None
        summary["aggregation"] = {
            "startYear": history[0]["year"], "endYear": history[-1]["year"],
            "counts": counts,
        }
        summaries.append(summary)
    return summaries
