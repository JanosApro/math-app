# Task 01 — App shell, onboarding, map, soft-lock dialog, profile, settings, PWA

Brief: `PROMPT.md` §1, §3, §5, §6.

## Already exists (read first)
- `src/App.tsx` — routing switch (lazy screens), theme + reduce-motion classes on `<html>`,
  redirect to `#/welcome` while no grade is chosen. `src/ui/router.ts` — hash router
  (`useRoute`, `navigate`, route list in the header comment).
- `src/state/store.ts` — `AppState`, `useAppState(selector)` (**selectors must return stable
  references or primitives**, e.g. `s => s.grade`, `s => gradeProgress(s, g)`; never build new
  objects/arrays inside a selector — compute with `useMemo` after selecting),
  `isStorageAvailable()`.
- `src/state/progress.ts` — `setGrade`, `setNickname`, `setSetting`, `acknowledgeSkip`,
  `streakOf`/`computeStreak`, `isCompleted`, `completedCount`, `downloadProgress`,
  `parseProgressFile`, `importProgress`, `resetProgress`.
- `src/state/dates.ts` — `todayBelgrade`, `schoolYearProgress`, `weekdayMon0`, `formatDateHu`, `addDays`.
- `src/state/xp.ts` — `levelFromXp`, `STREAK_MILESTONES`.
- `src/content/registry.ts` — `GRADES` (data-driven), `getGradeTopics`, `hasModule`.
- `src/content/catalog.ts` — `flatten`, `nodeState` ('done' | 'recommended' | 'available' |
  'softLocked' | 'soon'), `unmetPrerequisites`, `recommendedNext`, `topicCompleted`, `topicColor`.
- `src/i18n/hu.ts` — strings for onboarding, map, softLock, streak, profile, badges, settings.
- `src/styles/theme.css` — tokens, `.btn` variants, `.card`, `.page`, animations.
- Placeholders to REPLACE (keep default exports + props): `src/ui/AppShell.tsx`,
  `src/screens/Onboarding.tsx`, `MapScreen.tsx` (prop `grade`), `ProfileScreen.tsx`, `SettingsScreen.tsx`.

## Build
- **AppShell**: top bar (app name/grade, prominent streak 🔥 + number, XP chip); bottom nav
  (Térkép, Napi kihívás, Profil, Beállítások) with safe-area insets and a dot on "Napi kihívás"
  when today's challenge isn't done. Desktop (≥ 900 px): side rail or centered column.
- **Onboarding**: welcome, grade picker from `GRADES` (grade 6 appears automatically when added),
  optional nickname with "ne a valódi neved" hint, privacy note → `setGrade` → map.
- **MapScreen**: Duolingo-style winding path per grade. Topics = sections with a colored header
  (`--topic` CSS variable = `topicColor()`, `TopicIcon`, title, "x/y lecke", trophy when the
  chapter is done). Subtopics = round nodes in a zig-zag with their (long, Hungarian) titles
  wrapping nicely. States distinct **without relying on color**: done (filled + ✓), recommended
  (bigger, pulsing ring, "Kezdd itt!"/"Folytasd!" bubble, scrolled into view), available,
  softLocked (padlock, muted, still tappable → SoftLockDialog), soon/todo ("Hamarosan…", greyed,
  tap → toast `t.map.noContentYet`). Top cards: **year goal** (completed / total subtopics of the
  grade + a marker at `schoolYearProgress(todayBelgrade())`) and the **daily challenge** card
  (streak, done-today state, button → `#/daily`; never soft-locked).
- **SoftLockDialog** (`src/ui/SoftLockDialog.tsx`): `t.softLock.*`; lists uncompleted
  prerequisites (`unmetPrerequisites`, max ~5 + "…és még N", each tappable → that lesson);
  primary "Vissza az ajánlotthoz" (scroll to recommended), secondary "Mégis megnyitom" →
  `acknowledgeSkip` → open the lesson. Accessible modal (role="dialog", Esc closes, focus).
- Reusable `src/ui/Dialog.tsx`, `src/ui/Toast.tsx`, `src/ui/TopicIcon.tsx` (inline SVG,
  `currentColor`, names used in topics.json: numbers, shapes, divide, fraction, angle, mirror,
  percent, root, triangle, algebra, polygon, circle, chart, similar, plane, equation, prism,
  pyramid, function, system, cylinder + fallback).
- **ProfileScreen**: nickname, level + progress bar, total XP, current/best streak, calendar of
  the last ~5 weeks (Monday first, today highlighted, done days marked with 🔥 not only color),
  chapter badges (`GradeProgress.chapters`), streak badges 7/30/100 earned/unearned, counts.
- **SettingsScreen**: change grade (progress kept per grade), nickname, sound (off by default),
  reduce motion, theme (auto/light/dark), export (`downloadProgress`), import (file input →
  `parseProgressFile` → confirm → `importProgress`; friendly error), the permanent
  `t.settings.storageWarning`, a banner if `!isStorageAvailable()`, reset (confirm), about.
- **PWA**: `public/manifest.webmanifest`, original `public/icon.svg` (no brand look-alikes), and a
  small Vite plugin in `vite.config.ts` that writes `sw.js` into `dist/` with a precache list of
  all emitted files + index.html, cache-first for same-origin GET, versioned cache name, old caches
  deleted on activate. `src/pwa.ts` already registers `./sw.js` in production. Keep `base: './'`.

## Verify
Dev server + screenshots at 375 px and 1280 px, light and dark (see `00-README.md` tools). Fake
progress via localStorage to see every node state. Test: onboarding → map; soft-lock flow;
export → reset → import restores progress; theme switch; no console errors; `npm run build`.
