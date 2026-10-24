# Task 08 — Verification and final docs

Brief: `PROMPT.md` §8 item 6.

1. `npm run check` and `npm run build` both succeed.
2. In a browser at ~375 px and at desktop width (use `scripts/dev/pw.mjs`), click through:
   choose a grade → complete the Pythagoras lesson including a FAILED and then a PASSED mini test
   → open a soft-locked subtopic and check the warning dialog → do the daily challenge → check the
   streak (header + profile calendar) → export progress → clear storage → import → progress
   restored. Light and dark mode. No console errors.
3. `npm run build && npx vite preview`: the production build works from `dist/`, `#/dev` is not
   reachable, the service worker registers, the app loads offline after the first visit.
4. Fix what you find. Update `HANDOFF.md` (Build progress, Known issues), `CONTENT_GUIDE.md`
   (figure parameters from tasks 04–06), `DECISIONS.md`, `CONTENT_STATUS.md` (`npm run status`).
