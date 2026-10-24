@AGENTS.md

## Claude Code notes (local and cloud sessions)
- First command in a fresh environment: `npm install` (Node 18+; npm registry access needed).
- Verify every change with `npx tsc --noEmit -p .` and `npm run check`; before finishing also `npm run build`.
- Browser checks use `scripts/dev/pw.mjs` (playwright-core). It looks for Chromium in `CHROME_PATH`,
  `~/.cache/ms-playwright/…`, `/usr/bin/chromium`, `/usr/bin/google-chrome`. In a cloud environment
  without a browser try `npx playwright install chromium` (needs network); if that is not possible,
  rely on `npm run check` + `npx tsx scripts/dev/figure-preview.ts` and note the skipped browser
  checks in HANDOFF.md.
- Commit after each finished task with a clear message; keep HANDOFF.md ("RESUME HERE" table and
  "Build progress") accurate.
