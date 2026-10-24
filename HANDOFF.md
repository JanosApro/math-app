# Matek Kaland — handoff

A "Duolingo-style" math practice web app for grades 5, 7 and 8 (Serbian curriculum, Hungarian
language of instruction). Pure static site: React + Vite + TypeScript; progress is stored only on
the student's device (localStorage). Original brief: `PROMPT.md`.

> **Start here if you are an AI model continuing the work:** read `AGENTS.md`, this file, then
> `docs/tasks/00-README.md` — it lists the remaining build tasks in order, each with a full spec.

## Handing off to OpenCode (or another model)
Open OpenCode in this folder and give it:
> Read AGENTS.md and HANDOFF.md, then do the tasks in docs/tasks/ in the order given in
> docs/tasks/00-README.md. Commit after each task and tick it off in HANDOFF.md.

For content only (after tasks 01–03 exist):
> Read AGENTS.md and CONTENT_GUIDE.md. Write the next `todo` subtopic from CONTENT_STATUS.md,
> following the gold-standard lesson src/content/grade-7/pitagorasz/01-bizonyitas-alapok.ts.

Git: this repository has a local git identity (`git config user.name onam`,
`user.email aprojanos2001@gmail.com`) because none was set on the machine. Change it with
`git config user.name "…"` / `git config user.email "…"` inside this folder if needed.

## Current state (2026-10-24)

The **foundation is done and type-checks** (`npx tsc --noEmit -p .` passes); the **screens are
placeholders**, so the app runs but shows "Hamarosan…" pages until tasks 01–02 are built. The
**developer tooling works end to end**: `npm run check` (type check + full content validation +
generator stress test + figure checks + gallery checks), `npm run status` and the `/dev` pages
(validation report with stress test + sample viewer, `/dev/gallery` figure gallery).

### Session notes — 2026-10-24, OpenCode (GLM-5.3): task 03 done
What changed in this session (commit "Task 03: /dev page, figure gallery, npm run check + status"):
- **New** `src/dev/validate.ts` — all validation logic, environment-independent (works in Node via
  tsx and in the browser): catalog structure (grades.json ↔ topics.json ↔ daily.json, id/file
  patterns, prerequisites incl. cycles, module presence per status), module structure (steps,
  RichText syntax + KaTeX render of every formula, static figures, check-step questions, answer
  spec sanity, "canonical answer must pass its own checker", deep NaN/undefined scan) and the
  generator stress test (N seeds per generator × level, aggregated identical failures, distinct-
  question count with prompt+answer comparison, cached KaTeX).
- **New** `scripts/check.ts` (`npm run check`, flags `--seeds=N --only=<id> --quiet`) and
  `scripts/status.ts` (`npm run status`, regenerates CONTENT_STATUS.md — generator output was
  diffed byte-for-byte against the hand-written file; `npm run check` warns when it is stale).
- **Replaced placeholders** `src/dev/DevScreen.tsx` (chunked validation report with progress,
  stress buttons 100/500, subtopic list with issue counts + preview links, sample viewer:
  subtopic → generator → level → seed → rendered question + canonical input + answer JSON) and
  `src/dev/GalleryScreen.tsx` (type index, FigureView cards, validation messages, JSON +
  "Másolás", light/dark + --topic color + 360/600 width controls). New `src/dev/dev.css`.
- **Registry** grew two dev-only exports (`allModulePaths`, `importModule`) so `/dev` can load
  every module file, orphans included (documented in DECISIONS.md).
- **Verified**: `npm run check` + `npm run build` pass; `/dev` and `/dev/gallery` checked at
  1280 px and 375 px — no console errors, no horizontal scroll, stress test finishes in ~1.2 s
  without freezing the UI. Dev screenshots live in `/tmp/opencode/dev-shots/`.
- **Known follow-up**: `npm run check` reports 5 warnings in the Pythagoras lesson (figure label
  collisions in `square-areas` + explore step 6, low variety in `square-areas` L2) — a small
  content fix, see "Known issues" below. The dev server was left running on port 5173.

Next task in the suggested order: **02 (lesson player)** → 01 (app shell) → 06 → 04 → 05 → 07 → 08.

### Build progress
Milestone 1 — engine and app shell
- [x] Project scaffold (Vite 5, React 18, TypeScript strict, KaTeX)
- [x] Content schema `src/engine/types.ts`, seeded RNG, exact fraction/root math, Hungarian number formatting
- [x] Answer checking for every answer type incl. expressions and multi-field (`src/engine/answers.ts`, `polynomial.ts`) — unit-tested by hand
- [x] Rich text (`$math$`, bold, lists) parser + React renderer (`src/engine/richtext.ts`, `src/ui/Rich.tsx`)
- [x] Figure library core: fitting, label placement, validation, React renderer, SVG export (`src/figures/scene.ts`, `FigureView.tsx`)
- [x] Figures ready: `geometry`, `triangle`, `quadrilateral`, `regularPolygon`, `circle`, `coordinate`, `numberLine`
      (`geometry` was visually reviewed. The other six were written by an agent that was cut off: they render the
      examples in CONTENT_GUIDE.md and the Pythagoras lesson without validation errors, but have NOT been visually
      reviewed and have no gallery sections yet — task 06 adds the galleries; look at the screenshots and fix what looks off.)
- [ ] Figures missing (stubs throw): `solid`, `net` → task 04 · charts/pictogram/table → task 05 · `construction`, `fractionModel`, `barModel` + galleries → task 06
- [x] Progress store, streak/XP, export/import, Belgrade dates (`src/state/`)
- [x] Content catalog + registry, soft-lock prerequisite logic, daily-challenge composition (`src/content/`, `src/engine/session.ts`)
- [x] Hash router, App routing, theme tokens (light/dark), i18n file `src/i18n/hu.ts`, sound effects
- [ ] App shell, onboarding, map/path, soft-lock dialog, profile, settings, PWA → task 01
- [ ] Lesson player, inputs + keypad, mini test, celebrations, daily challenge, dev preview → task 02
- [x] `/dev` page, gallery screen, `npm run check`, `npm run status` → task 03
      (`src/dev/validate.ts` + `scripts/check.ts` + `scripts/status.ts` + `src/dev/DevScreen.tsx` +
      `GalleryScreen.tsx` + `dev.css`; verified at 1280/375 px, no console errors, no horizontal
      scroll; `npm run check` passes: 0 errors, 5 warnings — all in the Pythagoras lesson figures,
      see Known issues)

Milestone 2 — skeleton
- [x] All topics/subtopics for grades 5 (43), 7 (33), 8 (31) in `src/content/grade-N/topics.json`, with a scope note each
- [x] Curriculum summaries `docs/curriculum-grade-N.md`, textbook style notes `docs/materials-grade-N.md`

Milestone 3 — gold-standard lessons → task 07
- [x] 7th › Pitagorasz tétele › 01 (`g7-pitagorasz-01`) — written, smoke-tested (status `draft` until played in the real player)
- [ ] 5th › Törtek összeadása és kivonása (`g5-tortek-2-01`)
- [ ] 8th › Az egyenes henger térfogata (`g8-henger-kup-gomb-03`) — needs the `solid` figure (task 04)

Milestone 4–6
- [x] `CONTENT_GUIDE.md`, `CONTENT_STATUS.md`, `DECISIONS.md`, task specs in `docs/tasks/`
- [ ] Browser verification of the full flow → task 08

### Known issues / open questions
- **Grade 8 solid notation** (r, H, B, M, P, V) is inferred — the teacher should confirm (see DECISIONS.md).
- Grade 5 "Szögek 05" and "Tengelyes tükrözés 04" need degree–minute answers: use the
  `numbers` answer type with units `°` and `′`.
- `g5-termeszetes-szamok-1-01` and a few grade 8 lessons have very broad scopes; they may be split later.
- Textbook-vs-curriculum differences and naming traps are listed in `docs/curriculum-grade-N.md` and
  `docs/materials-grade-N.md` — read them before writing a lesson. Notable: grade 8 "Thalész párhuzamos szelők
  tétele" is the intercept theorem (not the semicircle theorem); a new grade 5 curriculum starts in 2027/28
  (drops vectors/translation) — not relevant this year; grade 7 "Adatfeldolgozás" is a survey project in the
  curriculum, the app practises it with given data sets and charts.
- `npm run check` passes with **5 warnings in the Pythagoras lesson** (found by the new validator,
  content fix — small, do it with the next content change): `square-areas` figures have overlapping
  square-area labels at some sizes (e.g. "49 cm²", seeds ~11 %), and `square-areas` L2 produces only
  9 distinct questions (add variety); the explore step 6 figure has a colliding "1" label at a=1, b=8.
- `CONTENT_STATUS.md` is **generated** (`npm run status`) — edit statuses/scopes in
  `src/content/grade-N/topics.json`, never in the markdown file; `npm run check` warns if it is stale.

## How to run (local)

1. Install **Node.js 18 or newer** from https://nodejs.org (the "LTS" button).
2. Open a terminal in this folder (on Windows: right-click the folder → "Open in Terminal").
3. Run once: `npm install`
4. Start: `npm run dev`, then open the address it prints (usually http://localhost:5173).
5. Before committing content: `npm run check` (must print no errors) and `npm run build`.

## The daily challenge list (for the teacher)
Each grade has `src/content/grade-N/daily.json`:
```json
{ "_help": "…", "subtopics": ["g7-pitagorasz-01", "g7-pitagorasz-02"] }
```
Add the ids of the lessons you have covered in class (ids are in `CONTENT_STATUS.md`). The daily
challenge only picks from these. An empty list means "every lesson that has content". Commit and
push — the site redeploys automatically (see below).

## Deployment (Cloudflare Pages, automatic on every push)
1. Push this repository to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → "Connect to Git" → pick the repo.
3. Build settings: framework preset **None** (or Vite), build command **`npm run build`**,
   output directory **`dist`**, environment variable `NODE_VERSION` = `20`.
4. Save and deploy. Every `git push` to the main branch now rebuilds and publishes the site.
(GitHub Pages also works: the build uses relative paths and hash URLs.)

## Folder structure
```
src/
  engine/      content schema (types.ts), rng, math, format, answers, polynomial, richtext, session
  figures/     SVG figure library: types.ts (all figure parameters, documented), scene.ts (fitting,
               labels, validation), geometry.ts, shapes.ts, coordinate.ts, solids.ts*, charts.ts*,
               fraction.ts*, construction.ts*  (* = stubs, see docs/tasks)
  state/       progress store (localStorage), progress actions, dates (Europe/Belgrade), XP
  content/     grades.json, grade-N/topics.json, grade-N/daily.json, grade-N/<topic>/<NN-file>.ts,
               catalog.ts (pure logic), registry.ts (Vite loader)
  kit.ts       the ONLY import content files need
  i18n/hu.ts   every UI string (Hungarian)
  ui/          router, Rich text, sound, shell (placeholder)
  screens/     onboarding, map, profile, settings (placeholders)
  lesson/      lesson player, daily challenge (placeholders)
  dev/         /dev page (DevScreen) + figure gallery (GalleryScreen) + validate.ts (the engine
               behind npm run check, also runs in the browser) + gallery sections in dev/gallery/
  styles/      theme.css (design tokens, light/dark, buttons, animations)
scripts/       check.ts (npm run check), status.ts (npm run status), dev/figure-preview.ts
               (figures → PNG), dev/pw.mjs + dev/screenshot.mjs (browser automation),
               dev/smoke-lesson.ts (legacy one-lesson smoke test)
docs/          curriculum summaries, textbook style notes, tasks/ (remaining work specs)
materials/     the teacher's textbook screenshots (reference only — never copy text)
```
