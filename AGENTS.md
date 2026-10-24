# Instructions for AI coding agents (OpenCode, Claude Code, …)

This repo is a static React + Vite + TypeScript math practice app for Hungarian-language
elementary school students (grades 5, 7, 8). The original brief is in `PROMPT.md`.

Read these before doing anything:

1. `HANDOFF.md` — project overview, how to run, folder layout, **current build state and
   the "Build progress" checklist** (what is done, what is next).
2. `CONTENT_GUIDE.md` — the recipe for writing a subtopic (lesson). Follow it exactly.
3. `CONTENT_STATUS.md` — which subtopics are `todo` / `draft` / `done`.
4. `DECISIONS.md` — why things are the way they are.

Hard rules:

- If you are adding lesson content: **do not modify engine files** (`src/engine`, `src/figures`,
  `src/state`, `src/ui`, `src/lesson`, `src/dev`, `scripts`). Only add/edit files under
  `src/content/` and update `CONTENT_STATUS.md`. One subtopic per change/commit.
- If you are continuing the *engine build* (see "Build progress" in `HANDOFF.md`), keep
  `HANDOFF.md` up to date as you go and commit after each milestone.
- All student-facing text is Hungarian. UI strings live in `src/i18n/hu.ts`.
- Never copy textbook text or exercises from `materials/`; they are structure/style references only.
- Before finishing any change run `npm run check` (type check + content validation + generator
  stress test + figure checks) and `npm run build`. Both must pass.
