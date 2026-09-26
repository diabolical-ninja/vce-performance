# VCE School Performance

Explore published Victorian school results with Next.js App Router, Tailwind CSS and shadcn-style components. The [approved design](docs/design/README.md) is implemented across:

- Rankings for all available years and seven measures, including an All-years average, competition ranks and ties at the Top N cutoff. The visible minimum-enrolment filter defaults to 50.
- A searchable school directory and durable profiles with dated context and annual histories.
- Shareable comparisons for up to 12 schools, keyboard-searchable school selection, hover/focus tooltips, exact annual tables below the chart and focused/full-scale axes.
- A school results map with blue-to-red values, working map/list modes, suburb zoom and an automatically synchronized viewport list, including tile-failure fallback.
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

## Google Analytics (GA4)

The site loads Google Analytics after hydration when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set to a valid `G-...` ID. With no ID configured, no Analytics scripts load. The Measurement ID is public, not a secret. Leave it unset in development and preview deployments to avoid polluting production reports.

### Production configuration

- Property: **VCE Compare** (`555976157`), with Australia/Melbourne reporting time zone and AUD currency.
- Web stream: **VCE Compare website**, for `https://vcecompare.com`.
- Vercel project: `vce-performance`, with the following variable configured for **Production**:

```sh
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WMG9GHSSVW
```

Rebuild and redeploy after changing the variable: Next.js embeds public environment values at build time. For local verification, put the variable in `.env.local` and restart the development server; remove it after testing.

### Page views and verification

In the Google Analytics web stream's **Enhanced measurement** settings, ensure **Page views → Advanced settings → Page changes based on browser history events** is enabled. This tracks Next.js client-side navigation as well as initial page loads; do not add a second manual page-view tracker.

Open the deployed site with content blockers disabled, then check **Reports → Realtime** in [Google Analytics](https://analytics.google.com/). Visit Rankings, Schools and Compare using the site navigation and confirm page views appear. Google Tag Assistant can inspect individual events and confirm each navigation produces one page view. Standard reports can take 24–48 hours to populate.

GA4 collects page URLs (including this site's filter/search query parameters) and uses cookies. Describe this in the site's published privacy information, and configure consent handling before enabling collection where required for your audience.

## Validation

```sh
npx playwright install chromium
npm run validate
```

Validation includes Python row-by-row reconciliation, 100% Vitest unit/component coverage, strict TypeScript, desktop/mobile Playwright, axe accessibility checks, zero-warning lint, formatting, dead code, duplication, architecture, component complexity and production build. See [engineering standards](specs/technical-specifications.md). The Husky pre-commit hook and GitHub Actions run the same command.

## Coverage and interpretation

The analytical CSV contains 7,007 rows across 2014–2025. The website preserves every row and all seven measures. Its 744 exact name/locality/ACARA identities are conservative source groupings, not a current-school count or a claim that renamed campuses have been reconciled.

2025 results lack same-year school profiles and coordinates. Context filters are disabled for that year; the map defaults to 2024. Missing values remain unavailable rather than becoming zero. Total enrolments are not VCE cohort counts; tertiary applications are not admissions. Read `/about` for complete definitions and caveats.

Rankings defaults to All years, using Python-generated unweighted means of available annual observations. The mean of annual school medians is not a pooled student median. All-years map points use the latest recorded coordinates for each exact source identity and display the location date. See the [interaction revision](docs/design/interaction-revision.md).

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
