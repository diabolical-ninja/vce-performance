# VCE School Performance

Explores VCE study scores by school. It produces a plotly dash web app that allows:

- Comparing how schools perform over time, eg via their median study score
- A ranking of the "top-N" schools
- A map to see how VCE results change across Melbourne/the state

## To-Do

- [ ] Go through the fuzzy match of school names & correct the mistakes
  - There are quite a few unfortunately :(

## Data

### Raw Files

The data used for this project resides in `raw_data/`. If you want to reproduce it from scratch then you'll need to download it from: https://www.vcaa.vic.edu.au/administration/research-and-statistics/Pages/SeniorSecondaryCompletion.aspx

Some notes;

- the wayback machine will be required to get all of the history
- `postcompletiondata-schools-2014-2017.xlsx` has been manually created by copying the contents of the `pdf` files into a spreadsheet
- I think data for 2012 & 2013 should also exist. I can't find it but would love to add it in

You'll also need school profile & school location data from ACARA:

- https://acara.edu.au/docs/default-source/default-document-library/school-profile-2008-2022.xlsx?sfvrsn=d40e4c07_0
- https://acara.edu.au/docs/default-source/default-document-library/school-location-2008-2022.xlsx?sfvrsn=fc4e4c07_0

### Building an Analytical Dataset

To create a cleaned dataset for analysis run:

```sh
poetry run python data_loader.py
```

This merges all years into one, drops a bunch of columns that aren't of interest and merges the VCE results with the school profiles information. It will produce a file called `vce_school_results_analysis_dataset.csv`.

## Run the Web App

Start up the app:

```sh
poetry run python app.py
```

In a browser, navigate to `http://127.0.0.1:8050/`
