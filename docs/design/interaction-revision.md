# Compact layout and interaction revision

This records the owner's follow-up feedback after the initial Next.js implementation. These changes supersede the corresponding interaction/layout choices in the original mockup; its HTML remains an archival visual reference.

- Page introductions are compact title/subtitle rows with a thin divider. Remove the repeated “Victorian school results” kicker and large tinted hero panel.
- Rankings defaults to **All years** and **50 minimum whole-school enrolments**, matching the legacy Dash defaults for these controls. Keep the enrolment input visible alongside the other filters. Users can set zero to remove the minimum.
- All-years rankings and maps show **unweighted averages of available annual reported values**, calculated by Python. Show available-year counts for the selected measure. Missing observations are not zero and school medians are not pooled student medians. Ranking order uses the unrounded mean.
- All-years summaries preserve the existing exact school/name/locality identities. Sector/type use the latest recorded profile, with its actual date; map coordinates use the latest recorded location, with its actual date. Single-year views still use only that year's context and coordinates.
- School-profile context values align left beneath their headings.
- Compare allows **12 schools**. Use the Tableau 10 categorical palette plus charcoal and deep purple, paired with line patterns. Tooltips expose school, year, measure and exact value on hover, keyboard focus and touch; Escape dismisses them.
- Compare has no results-year selector and no “Results at a glance” snapshot. The full annual table appears below the persistent chart, open by default, and can be collapsed. The chart's scale and table visibility remain shareable in the URL.
- The comparison-limit message is a compact amber warning with an icon and an alert announcement.
- Map colour runs from blue for low values to red for high values; the legend uses the same colour function as the points. Grey identifies unavailable values.
- Map/list controls work on every viewport: list-only, map-only, and both. Hiding the map does not replace its bounds with a zero-sized viewport.
- A suburb search fits the viewport to matching school locations (exact locality takes precedence over name/partial matches). It is a viewport search, not a membership filter. Markers retain all located schools satisfying the year/sector filters, including neighbouring suburbs; the list automatically follows actual visible bounds after panning, zooming and resizing. An unmatched search leaves all schools available with a clear message.
- Map tooltips and selection details include school, selected measure/value, sector and source dates; all-years tooltips also identify the averaging period and available-year count.

The original spreadsheet ETL remains in `data_loader.py`. Website export and all-years aggregation remain Python in `scripts/export_website.py` and `scripts/all_years.py`.
