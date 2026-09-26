# VCE Compare: approved redesign

Design proposal for a future Next.js version. Recorded 13 September 2026.

**Implementation follow-up:** the owner's subsequent [compact-layout and interaction revision](interaction-revision.md) supersedes the original hero, four-school limit, single-year controls and map-search interaction below.

The agreed direction is a clear, professional public-data site for schools and parents. Use a fixed light appearance, white surfaces, soft blue accents and readable sans-serif typography. Give the site warmth through colour, spacing and helpful language while keeping the figures central.

This package captures the approved design and its final interaction change: **adding a school in Compare uses a searchable dropdown**. It documents the future build; it does not introduce a Next.js application or change the running Dash app.

## Review the mockup

- [prototype.html](prototype.html) is the standalone, browser-openable version of the final approved mockup.
- [concept.html](concept.html) preserves the original editable HTML fragment, including its embedded example data. Its accumulated styles record the design iterations; the final light-theme overrides are authoritative.

GitHub displays HTML as source. Download `prototype.html` from this directory and open it in a modern browser. Alternatively, from a local checkout run `python3 -m http.server 8000` and visit `http://localhost:8000/docs/design/prototype.html`. No Dash server, Node installation or build step is required. Charts and icons use CDN resources, so an internet connection is needed for those assets. The results data is embedded; the mockup does not fetch live school data.

The mockup opens on **Compare** to demonstrate the final search interaction. **Rankings remains the proposed entry page** and is populated immediately when its tab is opened, without selecting schools.

### What is demonstrated

| Area | Included in the mockup | Boundary for the future build |
| --- | --- | --- |
| Rankings | All 1,782 dataset rows for 2023–2025; year, measure, sector, minimum enrolment and Top N controls; ties; expandable context | Full historical coverage and resolved school/campus identities |
| Schools | Search, sorting, selection and profile examples for six schools | Complete school directory, aliases and shareable profiles |
| Compare | Up to four schools; searchable dropdown; three VCE measures; annual trend/table toggle; full/focused scale | Full directory, all applicable measures, URL state and sharing |
| School profile | Results summary and separately dated context for the six examples | Complete histories, source detail and route-level pages |
| About the data | Definitions and coverage notes | Full provenance, downloads and correction guidance |
| Map | Navigation placeholder only | Map, list and location interactions described below |

The example selection is illustrative. It is not a recommendation that those schools have comparable intakes. Ranking counts are source-row counts, not an independently reconciled count of unique schools or campuses. Some source names can occur at different localities.

## Product decisions

### Navigation and first visit

Use a compact white header with the text wordmark **VCE Compare** and five destinations: **Rankings · Schools · Compare · Map · About the data**. Keep the primary content in a centred, generous-width column. A sidebar is unnecessary for this navigation.

Rankings answers the broad discovery question immediately. Schools supports finding a particular school. Profiles, comparisons and the map should feel like connected views of the same data. Put source-code and methodology links in the footer and About the data.

### Rankings are a primary feature

Show the latest available results year and median study score by default. Calculate the ranking across all eligible records for the selected year and measure; comparison selections must never determine ranking membership.

- Keep year, ranking measure, sector and Top N visible. The mockup offers Top 5, 10, 25 and 50, with an optional minimum total-enrolment filter.
- Label Government, Catholic and Independent as **Sector**, separately from any school-type classification.
- Use a table with a rank, readable school name and locality, exact selected value, and a small number of supporting outcomes. Show bars from zero to the measure's full range; ICSEA uses a value without a bar.
- Equal reported values share a rank, with alphabetical ordering within a tie. Use competition ranking (1, 2, 3, 3, 5). Include ties at a Top N cutoff and explain the resulting row count.
- Count unavailable values separately. Do not convert them to zero or omit them without an explanation.
- Name the selected measure and year beside the results. A ranking of one measure is not an overall rating of school quality.

Single-year rankings are the initial design. If an explicit multi-year mode is introduced later, label the aggregation and available-year count precisely. The mean of annual school medians is not the median of all students' results over that period.

### Schools and school profiles

Search by name or suburb, with known aliases supported in the eventual dataset. Start the directory in alphabetical order. Show median study score, study scores 40+ (%) and satisfactory VCE completion (%), with units in the headings and numbers aligned for comparison.

Keep school names readable and link them to durable profiles. Preserve comparison selections during searches, filters and navigation. Show unavailable values as an em dash with an accessible explanation. Avoid treating a missing result as a reason to remove a school from the directory.

Profiles should show the school identity, selected results year, concise outcome summaries, annual history and separately dated school context. ICSEA, total school enrolments and teaching staff belong in that context section. Total enrolments must not be labelled as the VCE cohort size.

### Compare: searchable school picker

Place removable selected-school labels above the chart. **Add a school combines type-to-search with dropdown browsing.** It must not require scrolling through a long select menu.

- Label the field **Add a school**, with the placeholder **Search schools or suburbs**.
- Opening the field or its chevron shows available options. Typing filters by school name or suburb; each result displays both.
- Exclude selected schools, prevent duplicates and allow a maximum of four. Preserve the existing selection after adding another school.
- Support mouse/touch selection, Arrow Up/Down, Enter to select, Escape to close and normal Tab navigation. Closing on outside interaction must not clear the comparison.
- Announce result counts and additions to assistive technology. Provide labelled removal controls and visible focus.
- Show a clear no-results state. At four selections, replace the add control with a clear limit state; removing a school makes adding available again.

Use one trend chart for one selected measure, with a consistent colour and line style for each school. Show annual observations, straight segments, restrained gridlines and explicit units. Keep an exact annual data table available without hover.

A focused line-chart scale is acceptable when clearly labelled, with a full-scale option. Bars always start at zero. Preserve gaps in missing annual results, use one shared scale for the selected schools, and identify reported annual values separately from any visual interpolation. Changes use **points** for study scores and **percentage points** for rates, without automatic red/green judgement.

### Map and About the data

The future map should combine a quiet basemap with a synchronized school list. Use equal-sized points, one ordered colour scale for the selected measure and a numerical legend. Cluster counts represent schools, not an unexplained average result. Selecting a school reveals its exact value and year.

Offer area search, All Victoria and an explicit Search this area action. On mobile, switch between Map and List. Keep the list useful if tiles fail, and explain omissions caused by missing coordinates. This behaviour is specified here and is not implemented in the mockup.

About the data should explain metric definitions, coverage, transformations, sources and corrections. Put concise definitions and relevant source years beside the corresponding values as well.

## Visual specification

| Element | Final direction |
| --- | --- |
| Appearance | Fixed light, including when the host or operating system uses dark mode |
| Page / content | `#F7F9FC` page; `#FFFFFF` header and surfaces |
| Main / heading text | `#22344B` / `#193C69` |
| Secondary text | `#5D6E82` |
| Primary action and links | `#2864D7` |
| Selection / heading panel | `#EDF4FF` / `#EDF5FF` |
| Borders | `#DCE4EF`, thin and restrained |
| Ranking bars / tracks | `#4E86D4` / `#E9F0FA` |
| Comparison series | Blue `#2864D7`, teal `#258393`, purple `#8765BD`, muted orange `#BB7629`, paired with labels and line styles |
| Typography | Inter, Segoe UI or system sans; approximately 34 px page titles (29 px on mobile), 20 px section titles, 14 px body and 12–13 px labels |
| Shape and spacing | Modest 6–10 px radii; consistent spacing; thin dividers; minimal shadows |
| Numbers | Tabular figures, right alignment and consistent precision |

Use the pale blue heading area, clear hierarchy and subtle interaction feedback to give the design life. Retain the simple, flat presentation; avoid decorative illustrations, dramatic gradients, large ornamental numbers and animated chart entrances. The earlier green/ivory palette, dark header and serif direction were superseded by this version.

At narrow widths, wrap navigation, stack controls and prioritise school names and the selected measure. Keep horizontal scrolling inside genuinely wide data tables. Reflow chart labels and legends instead of shrinking a desktop chart until its text is unreadable.

The implementation should target WCAG 2.2 AA: semantic tables, labelled controls, announced sort/selection state, visible focus, colour-independent chart identification and practical touch targets. The mockup is not a completed accessibility audit.

## Data communication and review basis

This proposal follows a review of the repository's app, loader, README and analytical CSV at commit [`3d30fed`](https://github.com/diabolical-ninja/vce-performance/commit/3d30fedab8bd2993f1ad8909350f6e37a9d10a30). The live site did not finish loading in the review environment, so observations about its current behaviour are source-derived rather than a verified visual audit of the deployment.

The checked CSV has 7,007 rows and 679 distinct historical school-name strings across 2014–2025. Those name strings are not a current-school count. The embedded ranking subset contains 588 rows for 2025, 596 for 2024 and 598 for 2023. [Dataset snapshot](https://github.com/diabolical-ninja/vce-performance/blob/3d30fedab8bd2993f1ad8909350f6e37a9d10a30/vce_school_results_analysis_dataset.csv)

The 2025 rows have results but no populated sector, profile or coordinate fields. The loader joins same-year school profiles and locations, whose checked inputs end in 2024. Keep 2025 results discoverable while explaining the missing context. The mockup disables sector and minimum-enrolment filters for 2025. Selecting ICSEA for that year gives a clear empty state with an explicit way to view 2024. [Loader snapshot](https://github.com/diabolical-ninja/vce-performance/blob/3d30fedab8bd2993f1ad8909350f6e37a9d10a30/data_loader.py)

Future profiles may use an earlier verified school-context record, labelled with its actual year. Never relabel 2024 information as 2025. Keep unknown categories explicit and avoid silently dropping unmatched schools. Start the map with a year that has location coverage; overlaying newer results at older coordinates requires validated identities and both dates displayed.

Preserve these interpretation rules:

- Study scores 40+ (%) uses study scores as its denominator, not students.
- Tertiary applications measure applications, not admissions.
- ICSEA describes socio-educational context; it is not an academic result or teaching-quality score.
- School medians must not be averaged into an invented statewide student benchmark.
- The current loader collapses source markers such as `–` and `I/D` into nulls. Until their meanings can be preserved and verified, display **Unavailable in this dataset**.
- Distinguish results year, profile year, location year and dataset refresh date. Do not invent an update timestamp.
- Resolve school identities and campus/name changes before presenting historical joins as certain.

These choices also address the current app's unlabelled multi-year ranking average, sector control labelled School Type, cropped ranking bars and redundant colour/size map encoding. [App snapshot](https://github.com/diabolical-ninja/vce-performance/blob/3d30fedab8bd2993f1ad8909350f6e37a9d10a30/app.py)

## Future Next.js handoff

Use route-level pages for Rankings, Schools, individual profiles, Compare, Map and About the data. Keep shareable state such as year, measure, filters and selected school IDs in the URL. Render initial tables, profile facts and explanations on the server; use client components for interactive search, charts and the map.

Build a validated data contract around stable school IDs and separately dated results/context. Preserve all seven existing measures where applicable, grouping VCE outcomes separately from school context. The mockup is a visual and interaction reference, not production component architecture or a decision about package versions.

Before implementation is considered complete, verify:

1. Rankings work immediately for the whole eligible dataset and include ties correctly.
2. Compare search works by name/suburb, with keyboard operation, no duplicates and the four-school limit.
3. Exact chart values, missing observations, units and source years agree with the validated dataset.
4. Navigation, filters and selections survive URL sharing and browser history.
5. Empty searches, absent data, unavailable filters, loading failures and map failure have usable states.
6. Mobile layouts, zoom, contrast and assistive-technology behaviour are checked in browsers.

This PR deliberately stops at the design package. The exported source was checked for syntax and embedded-data consistency; browser rendering and assistive-technology conformance still require verification during the build.
