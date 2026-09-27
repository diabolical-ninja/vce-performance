"""Reconcile every published value against the existing Python ETL output."""
import csv
import json
import tempfile
import unittest
from pathlib import Path
from scripts.export_website import SOURCE, MEASURES, convert, export, number
from scripts.all_years import summarize


class WebsiteExportTests(unittest.TestCase):
    def setUp(self):
        with SOURCE.open(newline="") as handle:
            self.rows = list(csv.DictReader(handle))

    def test_lossless_export_and_stable_ids(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "data.json"
            result = export(SOURCE, target)
            self.assertEqual(json.loads(target.read_text()), result)
            self.assertEqual(len(result["rows"]), 7007)
            for index, (source, actual) in enumerate(zip(self.rows, result["rows"]), 2):
                self.assertEqual(actual["sourceRow"], index)
                self.assertEqual(actual["year"], int(source["year"]))
                for key, column in MEASURES.items():
                    self.assertEqual(actual[key], number(source[column]))
                self.assertEqual(actual["id"], convert(source, index + 100)["id"])
            self.assertEqual(result, export(SOURCE, target))

    def test_rejects_invalid_values_and_duplicate_identity_year(self):
        for value in ["nan", "inf", "not a number"]:
            with self.assertRaises(ValueError):
                number(value)
        for column, value in [("Median VCE study score", "51"), ("ICSEA", "-1"), ("Latitude", "91"), ("Longitude", "181")]:
            with self.assertRaises(ValueError):
                convert({**self.rows[0], column: value}, 2)
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "duplicate.csv"
            with source.open("w", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=self.rows[0].keys())
                writer.writeheader()
                writer.writerows([self.rows[0], self.rows[0]])
            with self.assertRaisesRegex(ValueError, "Duplicate identity"):
                export(source, Path(folder) / "output.json")

    def test_campuses_stay_separate_and_context_is_dated(self):
        first = convert(self.rows[0], 2)
        other = convert({**self.rows[0], "Locality": "OTHER"}, 3)
        self.assertNotEqual(first["id"], other["id"])
        self.assertEqual(first["profileYear"], 2014)
        recent = next(row for row in self.rows if row["year"] == "2025")
        self.assertIsNone(convert(recent, 4)["profileYear"])
        self.assertIsNone(convert(recent, 4)["locationYear"])

    def test_all_years_uses_unweighted_available_values_and_latest_known_context(self):
        old = convert(self.rows[0], 2)
        recent = {**old, "year": 2025, "median": 40, "high": None,
                  "profileYear": None, "sector": "Unknown", "locationYear": None, "lat": None, "lng": None}
        result = summarize([recent, old], MEASURES)[0]
        self.assertEqual(result["median"], 36)
        self.assertEqual(result["high"], old["high"])
        self.assertEqual(result["aggregation"]["counts"]["median"], 2)
        self.assertEqual(result["aggregation"]["counts"]["high"], 1)
        self.assertEqual(result["aggregation"]["years"]["median"], [2014, 2025])
        self.assertEqual(result["aggregation"]["years"]["high"], [2014])
        self.assertEqual(result["profileYear"], 2014)
        self.assertEqual(result["locationYear"], 2014)
        self.assertEqual(result["sector"], "Catholic")
        unknown = {**recent, "median": None}
        unavailable = summarize([unknown], MEASURES)[0]
        self.assertIsNone(unavailable["median"])
        self.assertEqual(unavailable["aggregation"]["counts"]["median"], 0)
        self.assertEqual(unavailable["aggregation"]["years"]["median"], [])
        self.assertIsNone(unavailable["profileYear"])
        self.assertIsNone(unavailable["locationYear"])
        self.assertEqual(len(summarize([old, {**old, "id": "other-campus"}], MEASURES)), 2)

    def test_coverage_tracks_each_measure_and_includes_zero(self):
        base = convert(self.rows[0], 2)
        history = [
            {**base, "year": 2014, "high": None},
            {**base, "year": 2015, "high": 0},
            {**base, "year": 2016, "high": None},
            {**base, "year": 2017, "high": 20},
            {**base, "year": 2018, "high": None},
        ]
        result = summarize(history, MEASURES)[0]
        self.assertEqual(result["high"], 10)
        self.assertEqual(result["aggregation"]["years"]["high"], [2015, 2017])
        self.assertEqual(result["aggregation"]["counts"]["high"], 2)
        self.assertEqual(result["aggregation"]["startYear"], 2014)
        self.assertEqual(result["aggregation"]["endYear"], 2018)
