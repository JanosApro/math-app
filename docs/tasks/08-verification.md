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

## Progress log
- 2026-10-24 (Claude Code, cloud session): **done.** `npm run check` (0 errors, 0 warnings) and
  `npm run build` pass. Full student flow verified in Chromium at 375 px light and 1280 px dark
  (onboarding → Pythagoras with a failed then passed mini test → soft-lock dialog → daily →
  streak in header + profile calendar → export → clear storage → import restores everything),
  no console errors. Production build (`vite preview`): `#/dev` routes redirect to the map, the
  service worker activates, map / lessons / daily load offline. Fixes: dialog buttons sticky
  (the second one was cut off on small phones); answer-button texts ignore pointer events
  (KaTeX fraction struts reached into the button above and stole taps); the dev question hook
  only clears its own question. New repeatable check: `node scripts/dev/e2e.mjs` (+ helpers in
  `scripts/dev/drive.mjs`) against `npm run dev`.
