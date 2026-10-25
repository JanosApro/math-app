# Instructions for AI coding agents (OpenCode, Claude Code, …)

This repo is a static React + Vite + TypeScript math practice app for Hungarian-language
elementary school students (grades 5, 7, 8). The original brief is in `PROMPT.md`.

The app itself is finished; the remaining work is **lesson content**. Read these first:

1. `docs/OPENCODE_HANDOFF.md` — **the workflow for writing a lesson** (Part 3), git/GitHub rules.
2. `CONTENT_GUIDE.md` — the recipe for writing a subtopic (lesson). Follow it exactly.
3. `CONTENT_STATUS.md` — which subtopics are `todo` / `draft` / `done`, and each one's scope.
4. `HANDOFF.md` — project overview, how to run, folder layout. `DECISIONS.md` — why things are
   the way they are.

Git and publishing: the repository is on GitHub (`origin`, branch `master`). A push to `master`
**publishes the app to students** (GitHub Pages, automatic). So: `git pull origin master` at the
start, commit each lesson locally, and **push only when the teacher has approved the lesson**.
Never force-push, never rewrite history, never work on another branch.

Hard rules:

- If you are adding lesson content: **do not modify engine files** (`src/engine`, `src/figures`,
  `src/state`, `src/ui`, `src/lesson`, `src/dev`, `scripts`). Only add/edit files under
  `src/content/` and update `CONTENT_STATUS.md`. One subtopic per change/commit.
- Check the math of every lesson by reading `npm run samples -- <id>` (answers, hints and
  solutions as text) and recomputing the answers. `npm run check` cannot see wrong formulas.
- If you are continuing the *engine build* (see "Build progress" in `HANDOFF.md`), keep
  `HANDOFF.md` up to date as you go and commit after each milestone.
- All student-facing text is Hungarian. UI strings live in `src/i18n/hu.ts`.
- Never copy textbook text or exercises from `materials/`; they are structure/style references only.
- Before finishing any change run `npm run check` (type check + content validation + generator
  stress test + figure checks) and `npm run build`. Both must pass.
