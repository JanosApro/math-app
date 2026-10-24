# Remaining build tasks (engine/UI) — do them in this order

These are self-contained specs for finishing the app. Each one lists the files it owns, what
already exists, and how to verify it. Work on ONE task at a time, run `npx tsc --noEmit -p .`
after every change, and commit after each task (`git commit`). Then tick the task off in
`HANDOFF.md` → "Build progress".

| # | Task | Status |
|---|------|--------|
| 01 | [App shell, onboarding, map, soft-lock dialog, profile, settings, PWA](01-app-shell.md) | todo (placeholders exist) |
| 02 | [Lesson player, answer inputs + keypad, mini test, celebrations, daily challenge, dev preview](02-lesson-player.md) | todo (placeholders exist) |
| 03 | [`/dev` page, figure gallery screen, `npm run check`, `npm run status`](03-dev-tools.md) | done |
| 04 | [Figures: 3D solids and nets](04-figures-solids.md) | todo (stubs throw) |
| 05 | [Figures: charts, pictogram, table](05-figures-charts.md) | todo (stubs throw) |
| 06 | [Figures: constructions, fraction model, bar model + galleries for shapes/coordinate/number line](06-figures-construction-fraction.md) | todo (stubs throw) |
| 07 | [Gold-standard lessons: grade 5 fractions, grade 8 cylinder; finish grade 7 Pythagoras](07-gold-lessons.md) | Pythagoras written (draft) |
| 08 | [Verification in a browser + final docs](08-verification.md) | todo |

Suggested order: 03 (so you can check your work) → 02 → 01 → 06 → 04 → 05 → 07 → 08.
Tasks 04–06 are independent of each other. 03 is done (2026-10-24): use `npm run check` after
every change and `npm run status` after editing topics.json.

## Ground rules (all tasks)
- Read `PROMPT.md` (the original brief), `AGENTS.md`, `HANDOFF.md`, `DECISIONS.md` first.
- The content schema (`src/engine/types.ts`), figure types (`src/figures/types.ts`), state
  (`src/state/*`) and catalog logic (`src/content/catalog.ts`) are the contracts. Don't change
  them casually: other parts depend on them. Additive changes are fine; document them.
- Every student-facing string is Hungarian and lives in `src/i18n/hu.ts` (lesson content excepted).
- Styling: plain CSS files next to components, tokens from `src/styles/theme.css` (light + dark).
  Never hard-code colors; no UI frameworks; nothing that looks like Duolingo (no owl, no
  Duolingo green, no 3D bottom-border buttons).
- Mobile-first: 360 px wide without horizontal scroll, tap targets ≥ 44 px. Desktop must look good.
- Animations short, CSS only, respect `prefers-reduced-motion` and `:root.reduce-motion`.

## Tools
- `npm run dev` → http://localhost:5173 (dev pages: `#/dev`, `#/dev/gallery`, `#/dev/preview/<id>`).
- Figures without a browser: `npx tsx scripts/dev/figure-preview.ts <gallery-section> <outDir> [--dark]`
  renders `src/dev/gallery/<section>.ts` to PNG screenshots + prints validation errors.
- Browser automation: `scripts/dev/pw.mjs` (`import { launch } from './scripts/dev/pw.mjs'`,
  playwright-core with a local Chromium; set `CHROME_PATH` if needed) and
  `node scripts/dev/screenshot.mjs "<url>" out.png [width] [--dark] [--full]`.
- To skip onboarding in automated tests, set
  `localStorage['matek-kaland:v1'] = '{"version":1,"grade":7,"nickname":"","settings":{"sound":false,"reduceMotion":false,"theme":"auto"},"grades":{}}'`.
