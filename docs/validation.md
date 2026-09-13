# Redesign validation

Validated on 13 September 2026 on branch `feat/nextjs-approved-redesign`.

## Complete quality gate

`npm run validate` passed with no warnings. It includes:

| Check                         | Result                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------- |
| Python website export         | 7,007 rows, 744 conservative identities, 2014–2025                              |
| Python reconciliation tests   | 3 passed; every exported measure compared against its CSV source value          |
| Vitest                        | 30 tests passed                                                                 |
| Unit/component coverage       | 100% statements, branches, functions and lines; all application source included |
| TypeScript                    | Passed, strict mode                                                             |
| Development-server Playwright | 12 passed across desktop Chromium and mobile Chrome                             |
| ESLint                        | Passed with zero warnings                                                       |
| Prettier                      | Passed                                                                          |
| Knip                          | No dead-code or dependency issues                                               |
| jscpd                         | Zero clones                                                                     |
| Dependency Cruiser            | No architecture violations                                                      |
| Component complexity          | All reference-project thresholds passed                                         |
| Production build              | Passed                                                                          |
| Production-server Playwright  | 12 passed across desktop Chromium and mobile Chrome                             |

The production tests run against `next start`, not the development server. Every one of the 744 school-profile URLs is requested and checked for a rendered annual history in each server/browser configuration. Interactive browser tests cover rankings, the school directory, profiles, comparisons, the map, methodology, downloads and missing-page handling. All 12 result years and all seven measures are exercised. Browser runtime errors fail the tests.

## Browser checks

- Rankings: exact source values, cutoff ties, sector availability, minimum enrolments and unavailable measures.
- Directory and profiles: name/suburb searches, persistent selections, year changes, separately dated context and historical results.
- Comparisons: keyboard/pointer selection, no matches, four-school limit, removal, URL sharing/reload/history, annual tables, all measures and scale toggles.
- Map: actual Leaflet school markers, selected-school details, synchronized list, area controls, missing-coordinate explanation and intentionally failed tile requests.
- Accessibility: axe WCAG 2/2.1/2.2 A/AA checks on audited views, keyboard picker operation, focusable chart/table scrolling, fixed-light appearance under a dark OS preference and no document-level horizontal overflow.
- Visual inspection: production desktop comparison/profile views and mobile rankings were reviewed from screenshots generated under `test-results/`.

A separate live production-map check, without intercepted network requests, loaded eight OpenStreetMap tiles and 574 school markers with zero browser runtime errors.

## Python ETL preservation

`data_loader.py`, the original spreadsheets and the analytical CSV are unchanged. The original spreadsheet ETL was rerun with `save=False`; pandas verified exact equality with all 7,007 checked-in analytical rows. The existing source workbooks produce two openpyxl warnings about decorative header/footer and print-area metadata during this optional full rebuild. They do not alter the values. The website's standard-library Python export and complete validation command emit no warnings.

The deprecated Dash source is retained at `legacy/dash_app.py`; its dependencies are in an optional Poetry group. The website uses neither Dash nor Plotly.

## Interpretation boundaries

The 2025 records lack same-year profiles and coordinates. No context values or locations are invented or relabelled. IDs keep different source names/localities separate; the 744 identities are not independently verified current-school or campus counts. Original suppression markers cannot be recovered from the existing CSV and remain labelled unavailable. These boundaries are visible in the application and its methodology page.

Automated accessibility results and the exercised browser configurations are evidence of the tested behaviour, not a claim of a complete manual assistive-technology certification.
