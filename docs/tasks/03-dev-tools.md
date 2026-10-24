# Task 03 — `/dev` page, figure gallery, `npm run check`, `npm run status`

Brief: `PROMPT.md` §4a (gallery + figure checks), §8 item 4. The tooling is how content
authors find out whether their content is correct — make the output clear.

## Already exists
- Schema/engine: `src/engine/types.ts`, `answers.ts` (`checkAnswer`, `canonicalInput`,
  `formatAnswer`), `richtext.ts` (`parseRich`, `mathSegments`, `richTextProblems`),
  `session.ts` (`generateQuestion`, `seedOf`), `rng.ts`, `polynomial.ts` (`parseExpression`).
- Figures: `src/figures/index.ts` (`layoutFigure`, `checkFigure(fig)` → {errors, warnings, svg}).
- Gallery sections `src/dev/gallery/*.ts` exporting `section: GallerySection` (types in
  `src/dev/gallery/types.ts`). Only `geometry.ts` exists so far; task 06 adds more — discover dynamically.
- Content: `src/content/grades.json`, `grade-N/topics.json`, `grade-N/daily.json`, modules at
  `src/content/grade-N/<topic.folder>/<sub.file>.ts`; `catalog.ts` (pure), `registry.ts` (Vite only).
- `package.json`: `"check": "tsc --noEmit && tsx scripts/check.ts"` (scripts/check.ts is missing).
- Placeholders to REPLACE: `src/dev/DevScreen.tsx`, `src/dev/GalleryScreen.tsx`.
- `scripts/dev/smoke-lesson.ts` is a working mini version of the stress test for one lesson — a good starting point.

## Build
1. **`src/dev/validate.ts`** — environment-independent (no Vite APIs, no DOM; runs in Node via
   tsx and in the browser). Returns `{ level: 'error'|'warning', where, message }[]`:
   - grades.json ↔ topics.json; topics.json structure (required fields, unique ids across all
     grades, id pattern `g<grade>-<folder>-NN`, valid status, `file` pattern, color, subtopic- and
     topic-level `prerequisites` exist, no cycles/self-reference); daily.json ids exist.
   - draft/done subtopics have a module; module for a todo subtopic → warning; module `id` matches.
   - module structure: goals non-empty; steps contain theory, example and practice (warning);
     practice/miniTest/daily refs exist with supported levels; unique generator ids; miniTest 5–8
     items and ≥ 2 levels (warnings); passPercent 1..100; unused generators (warning).
   - every RichText (goals, theory, examples, checks, explore texts for a few slider values,
     generated prompt/hint/solution/inputLabel/options/order+match items, `formatAnswer` output):
     `richTextProblems` + KaTeX parse of each math segment
     (`katex.renderToString(latex, { throwOnError: true, strict: 'ignore' })`).
   - every figure (static and generated): `checkFigure` errors → error, warnings → warning
     (aggregate per generator).
   - **stress test**: each generator × level × N seeds (500 CLI default): exceptions; NaN /
     undefined / Infinity anywhere (deep scan); empty prompt/hint/solution; invalid specs (choice
     `correct` out of range, < 2 options, duplicate options, fraction den ≤ 0 or non-integer, root
     radicand < 1, empty numbers fields, unparsable expression, order < 2 items, duplicate match
     rights); **`checkAnswer(spec, canonicalInput(spec))` must be correct**; distinct-prompt count
     (warning if very low — note: some generators deliberately keep the prompt fixed and vary the
     figure/options, so compare prompt + JSON of answer). Aggregate identical failures (first seed + count).
2. **`scripts/check.ts`** (`npm run check`, after `tsc --noEmit`): loads catalog JSON with fs,
   imports each module file (tsx) + `src/dev/demoLesson.ts` if present, runs validate.ts, checks
   all gallery sections, prints a grouped report (✔/✖, file + step / generator + level + seed),
   a summary table and timing; exit code 1 on any error. Flags `--seeds=N`, `--only=<subtopicId>`,
   `--quiet`. Note: in tsx/Node, import katex as `katex` (it is a dependency) — works from inside the project.
3. **`scripts/status.ts`** + `"status": "tsx scripts/status.ts"`: regenerates `CONTENT_STATUS.md`
   from topics.json (intro, statuses explained, one table per grade: ID | Topic | Subtopic | Status
   | Scope, counts). `npm run check` warns if CONTENT_STATUS.md is out of date.
4. **DevScreen** (`#/dev`, CSS prefix `dev-`): links to the gallery and demo preview; validation
   report computed in the browser in chunks (keep UI responsive, show progress); every subtopic per
   grade/topic with status, module present, generator count, issue counts and a link
   `#/dev/preview/<id>`; stress-test button (100/500 seeds); **sample viewer**: subtopic →
   generator → level → seed (prev/next) → rendered question with figure, answer spec JSON,
   formatted answer, hint and solution (for checking the math by hand).
5. **GalleryScreen** (`#/dev/gallery`): all sections via `import.meta.glob('./gallery/*.ts')`
   (skip types.ts); type index with anchors; each entry: title, note, `<FigureView>` in a ~360 px
   card, pretty-printed copy-paste figure object with a "Másolás" button, validation messages.
   Controls: light/dark (`data-theme` on `<html>`), topic color picker (`--topic`), width 360/600.

## Verify
`npm run status`, `npm run check` (the Pythagoras lesson must pass), dev pages at 1280 px and
375 px via `scripts/dev/screenshot.mjs`; no console errors.
