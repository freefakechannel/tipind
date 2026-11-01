# Tipind — catalog "new system" (Google Sheet as source of truth) — DONE

## Goal (completed)
`scripts/build-catalog.mjs` now reads catalog data from the live Google Sheet
(via the Google Apps Script web app) instead of the missing local
`extras/source.json`.

## Sheet (source of truth)
https://docs.google.com/spreadsheets/d/1c3MbtLQ2LIKM-aJOwpXeNSuHF0Xg6ANSHQtZSuYzl08/edit?gid=979970326#gid=979970326

Columns: S. No. | Product Name | Packaging | Active Ingredient | URL | status | Manufacturer | Packaging | RATE (USD)

## Behavior (implemented)
- `build-catalog.mjs` gains a `--sheet <apps-script-url>` option that downloads
  the sheet as JSON via the deployed Apps Script web app:
  https://script.google.com/macros/s/AKfycbzU_8v_7SKok4XUsW_mzY-ohwAoFJbJVIm6Mvjeu8c/dev
- Existing `--input <file>` (local JSON) still works for offline testing.
- Rows whose `status` column is `needs review` are held out of the published
  catalog artifact and reported in the build stats.
- The raw source snapshot is saved to `extras/source.<hash>.json` using the
  same hash as the output catalog file (`catalog.<hash>.dat`) for traceability.
- The artifact format (FORMAT 4 / TIPCAT4:) is unchanged, so all repo features
  (catalog loader, store, search, filters, table, cart, checkout) keep working
  against the artifact built from the sheet.

## Files changed
- scripts/build-catalog.mjs — Apps Script fetching + status filtering + source snapshot saving
- package.json — catalog:build script now uses --sheet with the Apps Script URL (node, not bun)

## Verification
- Local `--input` test: 24 rows → 22 products, 2 "needs review" excluded, artifact
  `catalog.30917c7f.dat` produced and `extras/source.30917c7f.json` saved.
- Round-trip decode confirmed: magic TIPCAT4:, format 4, 22 products parse correctly.
- `node scripts/build-catalog.mjs --help` exits 0.

## Notes
- `docs.google.com` and `script.google.com` are not reachable from this sandbox,
  so the live `--sheet` path couldn't be end-to-end tested here; the `--input`
  path was tested instead and shares the same `build()` core.
- `extras/` is gitignored, so source snapshots never get committed.
