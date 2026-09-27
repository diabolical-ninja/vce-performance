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

    def test_reviewed_school_mappings_use_historical_identities(self):
        # Evidence and merger dates: raw_data/school_name_joining_keys.md.
        cases = [
            ("Shepparton High School", "Shepparton High School", "45465", 2019, "Government", "Secondary"),
            ("Sherbrooke Community School", "Sherbrooke Community School", "45316", 2025, "Government", "Combined"),
            ("Siena College", "Siena College Ltd", "45857", 2025, "Catholic", "Secondary"),
            ("Simonds Catholic College", "Simonds Catholic College", "45631", 2025, "Catholic", "Secondary"),
        ]
        with (SOURCE.parent / "raw_data" / "school_name_joining_keys.csv").open(newline="") as handle:
            mappings = list(csv.DictReader(handle))
        for name, profile_name, acara_id, last_year, sector, school_type in cases:
            with self.subTest(school=name):
                matches = [row for row in mappings if row["vce_school_name"] == name]
                self.assertEqual(len(matches), 1)
                self.assertEqual(matches[0]["acara_school_name"], profile_name)
                self.assertEqual(matches[0]["ACARA SML ID"], acara_id)
                history = [row for row in self.rows if row["School"] == name]
                self.assertEqual([int(row["year"]) for row in history], list(range(2014, last_year + 1)))
                for row in history:
                    self.assertEqual(number(row["ACARA SML ID"]), int(acara_id))
                    expected_sector = sector if int(row["year"]) <= 2024 else ""
                    expected_type = school_type if int(row["year"]) <= 2024 else ""
                    self.assertEqual(row["School Sector"], expected_sector)
                    self.assertEqual(row["School Type"], expected_type)

    def test_reviewed_profiles_have_their_own_annual_context(self):
        # Independent samples from the ACARA workbook, not the analytical CSV.
        cases = [
            ("Shepparton High School", "2019", 924, 492, 49),
            ("Sherbrooke Community School", "2024", 980, 108, 17),
            ("Siena College", "2024", 1143, 733, 77),
            ("Simonds Catholic College", "2024", 1045, 389, 40),
        ]
        for name, year, icsea, enrolments, staff in cases:
            with self.subTest(school=name, year=year):
                matches = [row for row in self.rows if row["School"] == name and row["year"] == year]
                self.assertEqual(len(matches), 1)
                row = convert(matches[0], 2)
                self.assertEqual((row["icsea"], row["enrolments"], row["staff"]), (icsea, enrolments, staff))

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
