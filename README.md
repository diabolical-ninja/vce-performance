# VCE School Performance

Explores VCE study scores by school. It produces a plotly dash web app that allows:

- Comparing how schools perform over time, eg via their median study score
- A ranking of the "top-N" schools

## To-Do

- [ ] Go through the fuzzy match of school names & correct the mistakes
  - There are quite a few unfortunately :(
- [ ] For the "top schools" plot, add a minimum enrolments selector

## Data

### Raw Files

Downloaded from: https://www.vcaa.vic.edu.au/administration/research-and-statistics/Pages/SeniorSecondaryCompletion.aspx

Note; you'll need to use the wayback machine to get all of the history

You'll also need school profile data from ACARA: https://acara.edu.au/docs/default-source/default-document-library/school-profile-2008-2022.xlsx?sfvrsn=d40e4c07_0

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
