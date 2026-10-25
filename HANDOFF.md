# Zsebmatek — handoff

(First called "Matek Kaland"; renamed on 2026-10-24. Internal keys such as the localStorage key
`matek-kaland:v1` keep the old name on purpose, so saved progress survives.)

A "Duolingo-style" math practice web app for grades 5, 7 and 8 (Serbian curriculum, Hungarian
language of instruction). Pure static site: React + Vite + TypeScript; progress is stored only on
the student's device (localStorage). Original brief: `PROMPT.md`.

> **Start here if you are an AI model continuing the work:** read `AGENTS.md`, this file, then
> `docs/tasks/00-README.md` — it lists the remaining build tasks in order, each with a full spec.

## Handing off to OpenCode (or another model)
See **`docs/OPENCODE_HANDOFF.md`**: one-time setup (fresh clone or update of the old local
folder, `npm install`, GitHub login for pushing), the exact prompt to give OpenCode, and the
per-lesson workflow. The build tasks in `docs/tasks/` are all done.

GitHub: https://github.com/JanosApro/math-app (public, remote `origin`, branch `master`; a push
to `master` publishes the site). For a cloud session on claude.ai/code use
`docs/tasks/CLOUD_PROMPT.md`.

Git: this repository has a local git identity (`git config user.name onam`,
`user.email aprojanos2001@gmail.com`) because none was set on the machine. Change it with
`git config user.name "…"` / `git config user.email "…"` inside this folder if needed.

## ▶ RESUME HERE — the app is finished; next: lesson content with OpenCode
Everything below is built, merged to `master` and live at https://janosapro.github.io/math-app/.
What remains is lesson content (104 `todo` subtopics). **Read `docs/OPENCODE_HANDOFF.md`**: setup
on the teacher's computer, the prompt for OpenCode (start with a 3-lesson pilot), the per-lesson
workflow (`npm run check -- --only=<id>`, `npm run samples -- <id>`, local commit, teacher review,
then push = publish).

Tasks 01–08 are finished (rows below).

Teacher feedback round (same day), done so far:
- Light mode by default + sun/moon toggle in every top bar (DECISIONS "Theme and sound").
- Synthesized sound effects (correct / wrong / part / lesson / chapter fanfare), on by default.
- **Lessons are split into 3–5 parts** (`parts: [{ title, steps }]` in every module, state v2
  stores finished parts + active days): overview with part list, "N. rész kész!" celebration with
  XP, every finished part counts for the streak, map node ring "2/4 rész kész". The three gold
  lessons and the demo lesson are split; `npm run check` warns about parts that are too long.
- Visual refresh: bundled DynaPuff + Nunito fonts (Hungarian ő/ű checked), cartoon sticker style
  (ink outlines, hard offset shadows), popping effects (star burst, flying XP, exploding confetti,
  springy entrances). See DECISIONS "Look and feel". Checked at 360/375/1280, light and dark.
- Renamed to **Zsebmatek** with a "Z" trail logo (`public/icon*.svg`, PNGs via
  `node scripts/dev/icons.mjs`). Live site: **https://janosapro.github.io/math-app/** (GitHub
  Pages, `.github/workflows/deploy-pages.yml`, deploys every push to `master`).
- **Uncluttered UI:** small explanatory texts removed, useful ones behind ⓘ / 🔍 popups, every
  screen fits a 375 × 740 phone without scrolling (DECISIONS "Uncluttered screens"); lesson
  texts shortened; `npm run check` warns about long texts (CONTENT_GUIDE "Short texts").
- **Content review of the 30 OpenCode lessons (2026-10-25):** currency is always dinár; every
  generator gives varied questions (random data instead of fixed lists) and its levels are
  disjoint and get harder. `npm run check` now also warns when two levels of a generator share
  questions; it passes with 0 errors and 0 warnings. Overlap *between* lessons was left as it is
  (teacher's decision).
- Browser scripts: `openPage({ motion: true })` in `scripts/dev/drive.mjs` keeps animations on
  (default is reduced motion, which makes the e2e run fast and stable).

### Earlier notes (2026-10-24 evening, Claude Code, lead)
Five parallel agents (tasks 01, 02, 04, 05, 06) were stopped by a usage limit mid-work. Their work
is committed in "WIP checkpoint" (91ef4de). `npx tsc --noEmit -p .` passes and `npm run check`
passes (0 errors, 7 warnings). Exact state per task — continue each from here:

| task | done | still to do |
|---|---|---|
| 02 lesson player | **done** (cloud session): lesson.css, demoLesson (`#/dev/preview/dev-demo`), PreviewScreen with 🛠 jump panel, verified in Chromium at 375/1280, light/dark | — |
| 01 app shell | **done** (cloud session): MapScreen + map.css, Profile, Settings, PWA (manifest, icons, `sw.js` from vite.config.ts), verified at 375/1280, light/dark, offline | — |
| 04 solids | **done** (cloud session): nets (`solids-net.ts`), galleries `solids.ts` (34) + `nets.ts` (12), reviewed light/dark, CONTENT_GUIDE rows | — |
| 05 charts | **done** (cloud session): all 30 gallery entries reviewed light/dark, 2 fixes, CONTENT_GUIDE rows; `npm run check` 0 warnings | — |
| 06 constructions etc. | **done** (cloud session): galleries `coordinate.ts` (15) + `numberline.ts` (14), shapes/coordinate/number-line review light/dark, square-label collisions fixed (Pythagoras: 0 warnings), CONTENT_GUIDE rows | — |
| 07 gold lessons | **done** (cloud session): all three played through at 375 px and set to `done` | — |
| 08 verification | **done** (cloud session): full flow at 375/1280, light/dark; production build + offline; `node scripts/dev/e2e.mjs` added | — |

Each task file `docs/tasks/0X-*.md` has the full spec (and a short progress log). Work in the
order 02 → 01 → 04 → 06 → 05 → 07 → 08; commit after each.

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
- [x] Figures `solid`, `net` (+ galleries `solids`, `nets`) → task 04
- [x] Coordinate + number-line galleries, shapes review, square-label collisions → task 06
- [x] Chart review (charts/pictogram/table) → task 05
- [x] Progress store, streak/XP, export/import, Belgrade dates (`src/state/`)
- [x] Content catalog + registry, soft-lock prerequisite logic, daily-challenge composition (`src/content/`, `src/engine/session.ts`)
- [x] Hash router, App routing, theme tokens (light/dark), i18n file `src/i18n/hu.ts`, sound effects
- [x] App shell, onboarding, map/path, soft-lock dialog, profile, settings, PWA → task 01
      (`src/screens/*`, `src/ui/SoftLockDialog.tsx`, `public/` icons + manifest, service worker
      generated by the plugin in `vite.config.ts`; works offline after the first load)
- [x] Lesson player, inputs + keypad, mini test, celebrations, daily challenge, dev preview → task 02
      (`src/lesson/**` + `lesson.css`, `src/dev/demoLesson.ts` = every step/answer type,
      `src/dev/PreviewScreen.tsx`; verified with Playwright at 375×740 and 1280×800, light/dark)
- [x] `/dev` page, gallery screen, `npm run check`, `npm run status` → task 03
      (`src/dev/validate.ts` + `scripts/check.ts` + `scripts/status.ts` + `src/dev/DevScreen.tsx` +
      `GalleryScreen.tsx` + `dev.css`; verified at 1280/375 px, no console errors, no horizontal
      scroll; `npm run check` passes: 0 errors, 5 warnings — all in the Pythagoras lesson figures,
      see Known issues)

Milestone 2 — skeleton
- [x] All topics/subtopics for grades 5 (43), 7 (33), 8 (31) in `src/content/grade-N/topics.json`, with a scope note each
- [x] Curriculum summaries `docs/curriculum-grade-N.md`, textbook style notes `docs/materials-grade-N.md`

Milestone 3 — gold-standard lessons → task 07
- [x] 7th › Pitagorasz tétele › 01 (`g7-pitagorasz-01`) — **done** (played through in the player)
- [x] 5th › Törtek összeadása és kivonása (`g5-tortek-2-01`) — **done**
- [x] 8th › Az egyenes henger térfogata (`g8-henger-kup-gomb-03`) — **done**

Milestone 4–6
- [x] `CONTENT_GUIDE.md`, `CONTENT_STATUS.md`, `DECISIONS.md`, task specs in `docs/tasks/`
- [x] Lessons split into 3–5 parts (XP + streak per part, map ring) — teacher feedback
- [x] Browser verification of the full flow → task 08 (repeat it any time: `npm run dev`, then
      `node scripts/dev/e2e.mjs [--width=1280] [--dark]` — about a minute, exit code 1 on failure)

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
- ~~5 warnings in the Pythagoras lesson~~ — fixed in task 06 (square-area labels that do not fit
  their square move outside it; the low-variety warning had already been fixed by more variety).
  `npm run check` now reports 0 warnings for the lessons.
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

## Deployment: GitHub Pages (set up, automatic on every push to master)
Live at **https://janosapro.github.io/math-app/**. `.github/workflows/deploy-pages.yml` runs
`npm ci`, `npm run check` and `npm run build`, then publishes `dist/`. A failing check stops the
deploy, so broken content never goes live. One-time setup (already needed only once): repository
Settings → Pages → Build and deployment → Source: **GitHub Actions**. Manual re-deploy: Actions →
"Deploy to GitHub Pages" → Run workflow.

### Alternative: Cloudflare Pages
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
scripts/       check.ts (npm run check), status.ts (npm run status), samples.ts (npm run samples:
               a lesson's questions + answers as text), dev/figure-preview.ts
               (figures → PNG), dev/pw.mjs + dev/screenshot.mjs (browser automation),
               dev/drive.mjs + dev/e2e.mjs (Playwright: plays the lessons, 30 checks)
docs/          curriculum summaries, textbook style notes, tasks/ (remaining work specs)
materials/     the teacher's textbook screenshots (reference only — never copy text)
```
