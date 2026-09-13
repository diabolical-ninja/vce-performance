"""Reconcile every published value against the existing Python ETL output."""
import csv
import json
import tempfile
import unittest
from pathlib import Path
from scripts.export_website import SOURCE, MEASURES, convert, export, number


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
