# Matek Kaland — handoff

A "Duolingo-style" math practice web app for grades 5, 7 and 8 (Serbian curriculum, Hungarian
language of instruction). Pure static site: React + Vite + TypeScript, progress stored only on
the student's device (localStorage). Original brief: `PROMPT.md`.

> **This file is kept up to date during the build.** The "Build progress" checklist below is
> the source of truth for what exists and what is next.

## Build progress

Milestone 1 — engine and app shell
- [x] Project scaffold (Vite, React 18, TypeScript strict, KaTeX)
- [x] Content schema `src/engine/types.ts`, seeded RNG, exact math, Hungarian number formatting
- [x] Answer checking for every answer type (`src/engine/answers.ts`, `polynomial.ts`)
- [x] Figure library core (`src/figures/scene.ts`, `geometry.ts`, `FigureView.tsx`)
- [ ] Figure families: shapes/constructions/fraction & bar models, 3D solids & nets, coordinate plane/number line/charts
- [x] Progress store, streak/XP logic, export/import (`src/state/`)
- [x] Content catalog + registry, soft-lock prerequisite logic (`src/content/catalog.ts`, `registry.ts`)
- [ ] App shell, onboarding, map/path, soft-lock dialog, profile, settings, PWA
- [ ] Lesson player, answer inputs + keypad, mini test, celebrations, daily challenge
- [ ] `/dev` page, figure gallery, `npm run check` (validation + stress test)

Milestone 2 — skeleton
- [x] All topics/subtopics for grades 5, 7, 8 in `src/content/grade-N/topics.json` (status `todo`)
- [x] Curriculum summaries `docs/curriculum-grade-N.md`, style notes `docs/materials-grade-N.md`

Milestone 3 — gold-standard lessons
- [ ] 7th › Pitagorasz tétele › 01 (`g7-pitagorasz-01`)
- [ ] 5th › Törtek összeadása és kivonása (`g5-tortek-2-01`)
- [ ] 8th › Az egyenes henger térfogata (`g8-henger-kup-gomb-03`) — short 3D example

Milestone 4/5/6 — dev page, docs (`CONTENT_GUIDE.md`, `CONTENT_STATUS.md`, `DECISIONS.md`), browser verification

## How to run (local)

1. Install Node.js 18 or newer (https://nodejs.org, "LTS").
2. In a terminal, inside this folder, run once: `npm install`
3. Start: `npm run dev`, then open the address it prints (usually http://localhost:5173).
4. Before committing content: `npm run check` (must print no errors) and `npm run build`.

## Folder structure

```
src/
  engine/      content schema (types.ts), rng, math, format, answers, polynomial, richtext, session
  figures/     SVG figure library: types.ts (all figure parameters), scene.ts (fitting, labels),
               geometry.ts, shapes.ts, solids.ts, coordinate.ts, charts.ts, fraction.ts, construction.ts
  state/       progress store (localStorage), progress actions, dates (Europe/Belgrade), XP
  content/     grades.json, grade-N/topics.json, grade-N/daily.json, grade-N/<topic>/<NN-file>.ts
  kit.ts       the ONLY import content files need
  i18n/hu.ts   every UI string (Hungarian)
  ui/          shared UI (router, Rich text, shell, dialogs, sound)
  screens/     onboarding, map, profile, settings
  lesson/      lesson player, inputs, keypad, mini test, daily challenge, celebrations
  dev/         /dev page, figure gallery, previews (dev builds only)
scripts/       check.ts (npm run check), dev tools (figure-preview.ts)
docs/          curriculum summaries and textbook style notes per grade
materials/     the teacher's textbook screenshots (reference only — never copy text)
```
