"""Publish the Python analytical CSV as a lossless, validated website contract.

No fuzzy joins: identities use ACARA ID + exact source name + locality. Name or
campus changes remain separate histories until a reviewed crosswalk exists.
"""

import csv
import hashlib
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.all_years import summarize
SOURCE = ROOT / "vce_school_results_analysis_dataset.csv"
TARGET = ROOT / "data" / "website.json"
MEASURES = {
    "median": "Median VCE study score",
    "high": "Percentage of study scores of 40 and over",
    "completion": "Percentage of satisfactory VCE completions",
    "tertiary": "Percentage of VCE students applying for tertiary places",
    "icsea": "ICSEA",
    "enrolments": "Total Enrolments",
    "staff": "Teaching Staff",
}


def number(value: str) -> float | None:
    if not value.strip():
        return None
    parsed = float(value)
    if not math.isfinite(parsed):
        raise ValueError(f"Non-finite value: {value}")
    return parsed


def convert(row: dict[str, str], source_row: int) -> dict:
    name, locality = row["School"].strip(), row["Locality"].strip()
    identity = json.dumps([row["ACARA SML ID"], name, locality], ensure_ascii=False)
    school_id = hashlib.sha256(identity.encode()).hexdigest()[:16]
    values = {key: number(row[column]) for key, column in MEASURES.items()}
    for key, value in values.items():
        ceiling = 50 if key == "median" else 100
        if value is not None and (value < 0 or (key in ("median", "high", "completion", "tertiary") and value > ceiling)):
            raise ValueError(f"Invalid {key} on source row {source_row}")
    year = int(row["year"])
    sector = row["School Sector"] or "Unknown"
    lat, lng = number(row["Latitude"]), number(row["Longitude"])
    if lat is not None and not -90 <= lat <= 90:
        raise ValueError("Invalid latitude")
    if lng is not None and not -180 <= lng <= 180:
        raise ValueError("Invalid longitude")
    return {
        "id": school_id, "sourceRow": source_row, "name": name,
        "locality": locality, "acaraId": row["ACARA SML ID"], "year": year,
        "sector": sector, "schoolType": row["School Type"] or "Unknown",
        "profileYear": year if sector != "Unknown" else None,
        "locationYear": year if lat is not None and lng is not None else None,
        "lat": lat, "lng": lng, **values,
    }


def export(source: Path = SOURCE, target: Path = TARGET) -> dict:
    with source.open(newline="", encoding="utf-8") as handle:
        rows = [convert(row, index) for index, row in enumerate(csv.DictReader(handle), start=2)]
    identities = [(row["id"], row["year"]) for row in rows]
    if len(set(identities)) != len(identities):
        raise ValueError("Duplicate identity/year: review source rows before publishing")
    payload = {
        "schemaVersion": 2,
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "rows": rows,
        "allYears": summarize(rows, MEASURES),
    }
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Exported {len(rows):,} source rows; {len({row['id'] for row in rows})} conservative identities; years {min(row['year'] for row in rows)}–{max(row['year'] for row in rows)}")
    return payload


if __name__ == "__main__":
    export()
