# Prompt for a cloud (or any new) session

Paste this as the task:

> Continue building the Matek Kaland app. Read CLAUDE.md, AGENTS.md and HANDOFF.md (start at the
> "RESUME HERE" table), then docs/tasks/00-README.md. Finish the remaining build tasks in this
> order: 02 (lesson player: lesson CSS, demoLesson, PreviewScreen, verification) → 01 (MapScreen,
> SoftLockDialog, Profile, Settings, PWA) → 04 (nets + solids/nets galleries) → 06 (coordinate and
> number-line galleries, visual review, triangle `squares` label collisions) → 05 (chart review)
> → 07 (play the three gold lessons, set them to done) → 08 (full browser verification, final
> docs). Each task file in docs/tasks/ is the full spec. Run `npm install` first. After every task:
> `npx tsc --noEmit -p .`, `npm run check`, `npm run build` must pass; update HANDOFF.md and the
> task's row in docs/tasks/00-README.md; commit. Do not write lesson content beyond the three gold
> lessons — the goal is the finished architecture.
