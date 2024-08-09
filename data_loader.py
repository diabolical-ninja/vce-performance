"""Loads & Returns All Available Result Years."""

import difflib
from typing import Iterable

import pandas as pd

STANDARDISED_COLUMN_NAMES = [
    "School",
    "Adult School",
    "Small School",
    "Locality",
    "Number of VCE studies at unit 3-4 level taken up by students",
    "Number of VET certificates with enrolments",
    "Availability of International Baccalaureate (Diploma)",
    "Number of students enrolled in at least one VCE unit at level 3-4",
    "Number of students enrolled in a VET certificate",
    "Number of students enrolled in VCAL",
    "Percentage of VCE students applying for tertiary places",
    "Percentage of satisfactory VCE completions",
    "Number of students awarded the VCE (Baccalaureate)",
    "Percentage of VET units of competency completed",
    "Percentage of VCAL units completed",
    "Median VCE study score",
    "Percentage of study scores of 40 and over",
    "year",
]


def get_results() -> pd.DataFrame:
    """Read & join annual school results

    Read results in 1 by 1 because they're all annoyingly slightly different....

    Returns:
        pd.DataFrame: Joined DF of annual school results from 2014 to 2023
    """
    xls = pd.ExcelFile("raw_data/postcompletiondata-schools-2014-2017.xlsx")
    results2014_2017 = []
    for sheet in xls.sheet_names:
        tmp = pd.read_excel(xls, sheet)
        tmp["year"] = int(sheet)
        tmp.columns = STANDARDISED_COLUMN_NAMES
        results2014_2017.append(tmp)

    results_2018 = pd.read_excel(
        "raw_data/2018_Senior_Secondary_Completion_and_Achievement_Information.xlsx",
        skiprows=range(1, 8),
        header=1,
    )
    results_2018["year"] = 2018
    results_2018.columns = STANDARDISED_COLUMN_NAMES

    results_2019 = pd.read_excel(
        "raw_data/2019SeniorSecondaryCompletionandAchievementInformation.xlsx",
        skiprows=range(1, 8),
        header=1,
    )
    results_2019["year"] = 2019
    results_2019.columns = STANDARDISED_COLUMN_NAMES

    results_2020 = pd.read_excel(
        "raw_data/2020SeniorSecondaryCompletionandAchievementInformation.xlsx",
        skiprows=range(1, 8),
        header=1,
    )
    results_2020["year"] = 2020
    results_2020.drop(columns=results_2020.columns[0], axis=1, inplace=True)
    results_2020.columns = STANDARDISED_COLUMN_NAMES

    results_2021 = pd.read_excel(
        "raw_data/2021SeniorSecondaryCompletionandAchievementInformation.xlsx",
        skiprows=range(1, 10),
        header=1,
    )
    results_2021["year"] = 2021
    results_2021.columns = STANDARDISED_COLUMN_NAMES

    results_2022 = pd.read_excel(
        "raw_data/2022SeniorSecondaryCompletionandAchievementInformation.xlsx",
        skiprows=range(1, 8),
        header=1,
    )
    results_2022["year"] = 2022
    results_2022.columns = STANDARDISED_COLUMN_NAMES

    results_2023 = pd.read_excel(
        "raw_data/2023SeniorSecondaryCompletionandAchievementInformation.xlsx",
        skiprows=range(1, 10),
        header=1,
    )
    results_2023["year"] = 2023
    results_2023.rename(
        columns={
            "School": "School",
            "Small School": "Small School",
            "Locality": "Locality",
            "Number of VCE and VCE Vocational Major (VM) studies at Units 3 and 4 level with enrolments ": "Number of VCE studies at unit 3-4 level taken up by students",
            "Number of Vocational Education and Training (VET) certificates with enrolments": "Number of VET certificates with enrolments",
            # This isn't strictly correct by will do
            "Enrolment(s) in the\xa0International\xa0Baccalaureate (IB) Diploma": "Availability of International Baccalaureate (Diploma)",
            "Number of students enrolled in at least one VCE or VCE Vocational Major (VM) study at Units 3 and 4": "Number of students enrolled in at least one VCE unit at level 3-4",
            "Number of students enrolled in a Vocational Education and Training (VET) certificate": "Number of students enrolled in a VET certificate",
            "Number of students enrolled in the Victorian Certificate of Applied Learning (VCAL) at Intermediate level (2023 only)": "Number of students enrolled in VCAL",
            "Percentage of VCE students applying for tertiary places through the Victorian Tertiary Admissions Centre (VTAC)": "Percentage of VCE students applying for tertiary places",
            "Percentage of satisfactory VCE completions": "Percentage of satisfactory VCE completions",
            "Number of students awarded the VCE (Baccalaureate)": "Number of students awarded the VCE (Baccalaureate)",
            "Percentage of Vocational Education and Training (VET) units of competency completed": "Percentage of VET units of competency completed",
            "Percentage of Victorian Certificate of Applied Learning (VCAL) units completed (2023 only)": "Percentage of VCAL units completed",
            "Median VCE study score": "Median VCE study score",
            "Percentage of study scores of 40 and over": "Percentage of study scores of 40 and over",
            "year": "year",
        },
        inplace=True,
    )
    results_2023["Adult School"] = None
    results_2023 = results_2023[STANDARDISED_COLUMN_NAMES]

    all_results = pd.concat(
        results2014_2017
        + [
            results_2018,
            results_2019,
            results_2020,
            results_2021,
            results_2022,
            results_2023,
        ]
    )

    val_cols_to_fix = [
        "Median VCE study score",
        "Percentage of study scores of 40 and over",
        "Percentage of VCE students applying for tertiary places",
        "Percentage of satisfactory VCE completions",
    ]

    for val_col in val_cols_to_fix:
        all_results[val_col] = all_results[val_col].apply(
            lambda x: None if x in ["-", "I/D"] else float(x)
        )

    return all_results


def get_vic_school_profiles() -> pd.DataFrame:
    # School Profile information
    xls = pd.ExcelFile("raw_data/school-profile-2008-2022.xlsx")
    school_profile_df = pd.read_excel(xls, "SchoolProfile 2008-2022")

    # Filter School Profile data to Vic Only for this analysis
    # And get rid of most of the columns as they're not needed
    wanted_cols = [
        "Calendar Year",
        "School Name",
        "ACARA SML ID",
        "Suburb",
        "School Sector",
        "School Type",
        "Campus Type",
        "ICSEA",
        "Total Enrolments",
        "Teaching Staff",
    ]

    return school_profile_df[
        (school_profile_df["State"] == "VIC")
        & (school_profile_df["School Type"] != "Primary")
    ][wanted_cols]


def get_vic_school_locations() -> pd.DataFrame:
    # School Location Information
    xls = pd.ExcelFile("raw_data/school-location-2008-2022.xlsx")
    school_locations_df = pd.read_excel(xls, "SchoolLocations 2008-2022")

    # Filter School Profile data to Vic Only for this analysis
    # And get rid of most of the columns as they're not needed
    wanted_cols = ["Calendar Year", "ACARA SML ID", "Latitude", "Longitude"]

    return school_locations_df[
        (school_locations_df["State"] == "VIC")
        & (school_locations_df["School Type"] != "Primary")
    ][wanted_cols]


def get_close_match(school_name: str, school_name_options: Iterable) -> str:
    match = difflib.get_close_matches(school_name, school_name_options, n=1)
    if len(match) > 0:
        return match[0]

    return None


def create_analysis_dataset(save: bool = True):
    print("Collating VCE Results Files")
    results_df = get_results()

    print("Sourcing school profile data")
    school_profile_df = get_vic_school_profiles()

    print("Sourcing school location data")
    school_locations_df = get_vic_school_locations()

    # Append location data to school profile data
    school_profile_df = pd.merge(
        school_profile_df, school_locations_df, on=["ACARA SML ID", "Calendar Year"]
    )

    # Append school information to results data
    print("Joining school profile data to VCE results")
    joining_table = pd.read_csv("raw_data/school_name_joining_keys.csv")

    results_df = pd.merge(
        results_df, joining_table, left_on="School", right_on="vce_school_name"
    )
    results_df = pd.merge(
        results_df,
        school_profile_df,
        left_on=["ACARA SML ID", "year"],
        right_on=["ACARA SML ID", "Calendar Year"],
        how="left",
    )

    # TO-DO:
    # Double check where "Locality" doesn't equal "Suburb"
    # It'll probably help find a bunch of schools that didn't join correctly. Eg:
    # results_df[results_df["Locality"].str.lower() != results_df["Suburb"].str.lower()]

    cols_for_analysis = [
        "School",
        "ACARA SML ID",
        "year",
        "Locality",
        "Median VCE study score",
        "Percentage of study scores of 40 and over",
        "Percentage of VCE students applying for tertiary places",
        "Percentage of satisfactory VCE completions",
        "ICSEA",
        "School Sector",
        "School Type",
        "Total Enrolments",
        "Teaching Staff",
        "Latitude",
        "Longitude",
    ]

    analysis_df = results_df[cols_for_analysis].sort_values(
        by=["School", "year"], ascending=True
    )

    if save:
        print("Writing CSV...")
        analysis_df.to_csv("vce_school_results_analysis_dataset.csv", index=False)
    else:
        return analysis_df


if __name__ == "__main__":
    create_analysis_dataset()
