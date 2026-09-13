# Website engineering standards

Adopted from `/Users/yass/Repos/personal/melbournekidsactivities/AGENTS.md`, `specs/technical-specifications.md` and its executable quality configuration. The approved VCE design supersedes that project's unrelated activity-directory palette, content schema and analytics integrations.

## Stack and architecture

- Node 22.13.0 (`.nvmrc`), npm and lockfile v3.
- Next.js App Router in `src/app`, React, strict TypeScript, Tailwind CSS 3, PostCSS/Autoprefixer, shadcn conventions in `components.json`, Radix Slot, CVA, clsx and tailwind-merge. Lucide icons; Leaflet for maps.
- `src/components` shared UI, `src/components/ui` primitives, `src/lib` helpers, `src/types` shared contracts, `src/__tests__` unit/component tests and `e2e` browser tests. Source imports use `@/*`.
- Prefer Server Components and route-level composition. Client modules never import Node modules or server data loading. Send only selected histories to chart clients; the picker receives lightweight identity records.
- Explicit function return types; no `any`, unsafe operations, TypeScript suppression, implicit returns or switch fallthrough. No JavaScript application source.
- All styles use Tailwind and CSS-variable theme tokens; conditional classes use `cn`. Fixed-light design from PR #13. Native semantic HTML, keyboard support, visible focus, touch targets, reduced motion and WCAG 2.2 AA are required.

## Python ownership and data contract

`data_loader.py` remains the canonical Python ETL. Its spreadsheet processing and joining rules are unchanged. `scripts/export_website.py` publishes the analytical CSV to `data/website.json` using Python's standard library. `predev` and `prebuild` regenerate it. The website's TypeScript handles presentation queries, not source ETL. Zod validates the published contract on the server.

IDs hash the exact source ACARA ID, name and locality. No fuzzy identity merges or undated context borrowing. Duplicate identity/year records stop the export for review. All seven measures, source-row references, nulls, separately dated profiles and coordinates are preserved. There are no inferred alias or renamed-campus joins; name search normalizes punctuation/case, and locality search is supported. Add aliases only after source verification.

CSV SHA-256 identifies the source snapshot without inventing a refresh timestamp. Downloads serve the same analytical file. Context/source limitations and corrections are documented in `/about`.

## Quality gates

`npm run validate` executes Python export and reconciliation tests, Vitest with 100% coverage, TypeScript, desktop/mobile Playwright, ESLint with zero warnings, Prettier, Knip, jscpd, Dependency Cruiser, component complexity checks and production build. The Husky pre-commit hook and CI invoke the same command. Do not skip tests, lower thresholds, exclude application files or narrow collection to pass checks.

ESLint enforces the reference project's limits: complexity 10, nesting 3, 300 source lines/file, 120 lines/function, 5 parameters, cognitive complexity 10 and no unexplained magic numbers. SonarJS catches common code smells. Component limits are 200 file lines, 10 imports, JSX depth 6, 8 destructured props, 5 state hooks and 3 effects.

The component checker uses TypeScript's AST to measure JSX accurately instead of counting generic type parameters as elements. It fails on violations. Thresholds match the reference project. Knip recognizes `python3` as an external runtime binary rather than an npm package; no application files are exempted. jscpd's duplicate threshold is 1%, with only tests/specs/stories omitted. Dependency rules forbid cycles, upward shared imports, feature-to-app imports and cross-feature coupling.

Prettier and its Tailwind plugin own formatting. Generated data, Python caches, dependency outputs, the verbatim approved design export and the pre-existing OpenCode workflow are not reformatted. No application code is excluded from coverage.

## Runtime and deployment

Run from the repository root. Build hosts need Python 3.11+ and Node; no Python packages are needed to export the checked-in analytical CSV. ETL refreshes additionally need Poetry's pandas/openpyxl environment and the original source spreadsheets. The deployed Node app reads the generated JSON and CSV. Optional map tiles use OpenStreetMap with attribution; the list remains usable when tiles fail.

The retired Dash UI is isolated under `legacy/`, with optional Poetry dependencies. It is not part of the website runtime. No Mapbox token is needed for the new app.
