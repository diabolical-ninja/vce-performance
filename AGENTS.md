# Engineering standards

- Follow `specs/technical-specifications.md` and the approved visual design in `docs/design/README.md`.
- ETL, spreadsheet normalization, joins and website data export remain Python. Do not port them to JavaScript or TypeScript.
- Use strict TypeScript, App Router Server Components by default, Tailwind CSS and shadcn-style UI primitives.
- Run `npm run validate` after code changes. Every check must pass with zero warnings.
- Require 100% unit coverage for statements, branches, functions and lines. Do not skip tests, add coverage exclusions or lower thresholds to pass validation.
- Keep the main branch up to date before new feature work.
