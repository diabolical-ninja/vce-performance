# VCE School Performance

Explore published Victorian school results with Next.js App Router, Tailwind CSS and shadcn-style components. The [approved design](docs/design/README.md) is implemented across:

- Rankings for all available years and seven measures, with competition ranks and ties at the Top N cutoff.
- A searchable school directory and durable profiles with dated context and annual histories.
- Shareable comparisons for up to four schools, keyboard-searchable school selection, exact annual tables and focused/full-scale charts.
- A school results map with an independent list, area search and tile-failure fallback.
- Data definitions, provenance, downloads and correction guidance.

**The ETL remains Python.** `data_loader.py` still owns spreadsheet normalization and joins. `scripts/export_website.py` publishes its CSV for the website. The deprecated Dash UI is retained in `legacy/dash_app.py`, outside the new runtime.

## Run the website

Requires Node 22.13.0+ and Python 3.11+. No Python packages or map API key are required when using the checked-in analytical CSV.

```sh
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. The Python website export runs automatically before development and production builds.

```sh
npm run build
npm start
```

Run these commands from the repository root; deploy the generated `data/website.json` and analytical CSV alongside the Node application. The generated JSON is validated on the server and is not committed.

## Validation

```sh
npx playwright install chromium
npm run validate
```

Validation includes Python row-by-row reconciliation, 100% Vitest unit/component coverage, strict TypeScript, desktop/mobile Playwright, axe accessibility checks, zero-warning lint, formatting, dead code, duplication, architecture, component complexity and production build. See [engineering standards](specs/technical-specifications.md). The Husky pre-commit hook and GitHub Actions run the same command.

## Coverage and interpretation

The analytical CSV contains 7,007 rows across 2014–2025. The website preserves every row and all seven measures. Its 744 exact name/locality/ACARA identities are conservative source groupings, not a current-school count or a claim that renamed campuses have been reconciled.

2025 results lack same-year school profiles and coordinates. Context filters are disabled for that year; the map defaults to 2024. Missing values remain unavailable rather than becoming zero. Total enrolments are not VCE cohort counts; tertiary applications are not admissions. Read `/about` for complete definitions and caveats.

## Data

### Raw Files

The data used for this project resides in `raw_data/`. If you want to reproduce it from scratch then you'll need to download it from: https://www.vcaa.vic.edu.au/administration/research-and-statistics/Pages/SeniorSecondaryCompletion.aspx

Some notes;

- the wayback machine will be required to get all of the history
- `postcompletiondata-schools-2014-2017.xlsx` has been manually created by copying the contents of the `pdf` files into a spreadsheet
- I think data for 2012 & 2013 should also exist. I can't find it but would love to add it in. Hit the repo up with a PR if you can find it

You'll also need school profile & school location data from ACARA:

- https://acara.edu.au/contact-us/acara-data-access
- https://dataandreporting.blob.core.windows.net/anrdataportal/Data-Access-Program/School%20Profile%202008-2024.xlsx
- https://acara.edu.au/docs/default-source/default-document-library/school-location-2008-2022.xlsx?sfvrsn=fc4e4c07_0

### Building an Analytical Dataset

To create a cleaned dataset for analysis run:

```sh
poetry install
poetry run python data_loader.py
npm run data:export
```

This merges all years into one, drops a bunch of columns that aren't of interest and merges the VCE results with the school profiles information. It will produce a file called `vce_school_results_analysis_dataset.csv`.

### Notes on the Data

Of course, OF COURSE, the Victorian and federal governments (ACARA) don't name schools the same thing. As such a lookup table has been manually created to map the Victorian school name to the ACARA name. This is required to join the VCE results to information such as the school location, school's ICSEA, etc.

This is by no means perfect so if you find errors please raise an issue or better yet raise a PR with the proposed fix.

## Deprecated Dash reference

The old UI is no longer the website entry point. To inspect it for migration reference, install its optional dependencies:

```bash
poetry install --with legacy
poetry run python legacy/dash_app.py
```

It runs on http://127.0.0.1:8050 and still requires its original `MAPBOX_TOKEN` for maps. The new Next.js website does not use that token or any Dash/Plotly dependencies.
