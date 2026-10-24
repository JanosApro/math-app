# Decisions

Architectural choices and why. Add new entries at the end of a section.

## Stack and dependencies
- **React 18 + Vite 5 + TypeScript (strict)**, as required. Vite 5 (not 6/7) and React 18 because
  the development machine has Node 18; both are mainstream and stable.
- **KaTeX** (`katex`, runtime dependency): math rendering for fractions, roots, powers. Bundled by
  Vite into the build (fonts included) — nothing is loaded from a CDN. Chosen over a hand-written
  renderer because LaTeX is robust and every model already knows the syntax.
- **No router library**: a 60-line hash router (`src/ui/router.ts`). Hash URLs work on GitHub
  Pages and Cloudflare Pages without server rewrites.
- **No state library**: a small external store + `useSyncExternalStore` (`src/state/store.ts`).
- **No UI framework**: plain CSS files with design tokens (`src/styles/theme.css`), light/dark.
- **Fonts**: system font stack with rounded faces first (`ui-rounded`, SF Pro Rounded, Nunito if
  installed …). No font download → nothing external, fast first load. Figures use KaTeX's
  bundled serif fonts so labels match the formulas (textbook-like italic variables).
- Dev-only: `tsx` (runs TypeScript scripts for `npm run check`), `playwright-core` (automated
  browser checks/screenshots with an already-installed Chromium; never shipped to students).

## Content
- **Content = typed data + generator functions** (`SubtopicModule`), no JSX. One file per
  subtopic, lazily imported with `import.meta.glob` (one JS chunk per lesson).
- **Catalog in JSON** (`grades.json`, `grade-N/topics.json`, `grade-N/daily.json`): the teacher
  can edit titles, order, statuses and the daily list without touching code. Adding grade 6 =
  adding files only.
- **IDs** `g<grade>-<topic folder>-<NN>` are globally unique, so prerequisites can point across
  topics and progress is keyed by id.
- **Topic-level `prerequisites`** (extension of the brief): a topic may list the topics it really
  depends on. Used once: grade 7 "Sokszögek" depends on "Valós számok" and "Pitagorasz tétele",
  not on "Algebrai egész kifejezések". Subtopic-level `prerequisites` still override everything.
- **`todo` subtopics never act as prerequisites** and never block anything — they can't be
  completed. Chapters only count as completed when *every* subtopic is done, so chapter badges are
  not handed out while lessons are still missing.
- **Single import point for content**: `src/kit.ts`. Content never imports engine internals.
- **Strings with math**: `$…$` LaTeX inside Hungarian text. The `tex` template tag avoids the
  classic "lost backslash" bug; the validator detects control characters it leaves behind.
- **Statuses**: the Pythagoras gold lesson is `draft` until it has been played through in the
  finished lesson player (task 02); then it becomes `done`.

## Answers
- Answer checking is exact wherever possible: fractions by cross-multiplication, roots by comparing
  squares, expressions by expanding to a canonical polynomial with rational coefficients
  (`src/engine/polynomial.ts`). "Right value, wrong form" (6/8 instead of 3/4, √50 instead of 5√2,
  unexpanded polynomial) is answered with a friendly "simplify it" message instead of "wrong".
- Two answer types were added beyond the brief because the curriculum needs them:
  `numbers` (several fields: systems of equations, coordinates, 35° 48′) and `expression`
  (grade 7 algebra, and volumes in terms of π like `36π`).
- An input the engine cannot parse is not counted as a mistake (`parseError`).

## Figures
- Hand-written SVG library, no dependency. Layouts produce primitives in world coordinates (y up);
  one fitting step scales uniformly (true proportions), converts markers to fixed screen sizes
  and places labels with a collision-avoiding search. The same `Scene` renders in React and as an
  SVG string, so `npm run check` validates every figure in Node (NaN, outside the viewBox,
  overlapping labels).
- Colors are named roles mapped to CSS variables → automatic dark mode and per-topic accent color.
- 3D convention (from the grade-8 textbook): oblique cabinet projection (depth up-right at 45°,
  halved), flat ellipses for round bases, hidden edges dashed.
- Grade 8 solid notation: **r, H, B, M, P, V** (radius, height of the solid, base area, lateral
  surface, surface area, volume), π written after the factors (r²π). Inferred from the
  Serbian-origin textbook and curriculum; the screenshots did not show these letters.
  **Teacher: please confirm** — if your book uses m / T / A instead, the labels only appear in
  lesson content, so changing them is a content edit.
- Constructions are a figure type with step captions; the figure player animates each new step.

## Progress, streak, daily challenge
- localStorage key `matek-kaland:v1`, versioned and sanitised on load/import; every access in
  try/catch; in-memory fallback with a visible notice. Tabs stay in sync via the `storage` event.
- Progress is kept **per grade** (XP, subtopics, chapters, daily records, streak badges).
- The streak is **derived** from the set of days with a completed daily challenge (not stored as a
  counter), so it can't get out of sync; it stays alive until the end of the next day.
- Daily challenge: seed = `daily:<grade>:<YYYY-MM-DD in Europe/Belgrade>`; 6 questions from the
  eligible subtopics (daily.json, or everything with content). Only the first completion of the
  day gives XP and counts for the streak; replays are practice.
- XP numbers live in `src/state/xp.ts`; level n needs 50·n·(n−1) XP.

## Hosting
- `base: './'` in vite.config.ts so `dist/` works under any path (GitHub Pages project sites,
  Cloudflare Pages). Cloudflare Pages: build command `npm run build`, output directory `dist`
  (see HANDOFF.md).
