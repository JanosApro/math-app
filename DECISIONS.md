# Decisions

Architectural choices and why. Add new entries at the end of a section.

## Stack and dependencies
- **React 18 + Vite 5 + TypeScript (strict)**, as required. Vite 5 (not 6/7) and React 18 because
  the development machine has Node 18; both are mainstream and stable.
- **KaTeX** (`katex`, runtime dependency): math rendering for fractions, roots, powers. Bundled by
  Vite into the build (fonts included) — nothing is loaded from a CDN. Chosen over a hand-written
  renderer because LaTeX is robust and every model already knows the syntax.
- **No router library**: a 60-line hash router (`src/ui/router.ts`). Hash URLs work on GitHub
  Pages and Cloudflare Pages without server rewrites.
- **No state library**: a small external store + `useSyncExternalStore` (`src/state/store.ts`).
- **No UI framework**: plain CSS files with design tokens (`src/styles/theme.css`), light/dark.
- **Fonts**: system font stack with rounded faces first (`ui-rounded`, SF Pro Rounded, Nunito if
  installed …). No font download → nothing external, fast first load. Figures use KaTeX's
  bundled serif fonts so labels match the formulas (textbook-like italic variables).
- Dev-only: `tsx` (runs TypeScript scripts for `npm run check`), `playwright-core` (automated
  browser checks/screenshots with an already-installed Chromium; never shipped to students).

## Content
- **Content = typed data + generator functions** (`SubtopicModule`), no JSX. One file per
  subtopic, lazily imported with `import.meta.glob` (one JS chunk per lesson).
- **Catalog in JSON** (`grades.json`, `grade-N/topics.json`, `grade-N/daily.json`): the teacher
  can edit titles, order, statuses and the daily list without touching code. Adding grade 6 =
  adding files only.
- **IDs** `g<grade>-<topic folder>-<NN>` are globally unique, so prerequisites can point across
  topics and progress is keyed by id.
- **Topic-level `prerequisites`** (extension of the brief): a topic may list the topics it really
  depends on. Used once: grade 7 "Sokszögek" depends on "Valós számok" and "Pitagorasz tétele",
  not on "Algebrai egész kifejezések". Subtopic-level `prerequisites` still override everything.
- **`todo` subtopics never act as prerequisites** and never block anything — they can't be
  completed. Chapters only count as completed when *every* subtopic is done, so chapter badges are
  not handed out while lessons are still missing.
- **Single import point for content**: `src/kit.ts`. Content never imports engine internals.
- **Strings with math**: `$…$` LaTeX inside Hungarian text. The `tex` template tag avoids the
  classic "lost backslash" bug; the validator detects control characters it leaves behind.
- **Statuses**: the three gold lessons (`g7-pitagorasz-01`, `g5-tortek-2-01`,
  `g8-henger-kup-gomb-03`) were `draft` until they had been played through in the finished
  player (task 07, 2026-10-24); they are `done` now.
- **Inline fractions are rendered at full size** (`\frac` → `\dfrac` in `src/ui/Rich.tsx`, inline
  math only): KaTeX's text-style fractions were too small to read on a phone for 5th graders, and
  the printed textbooks also set fractions at full size inside sentences. Content keeps writing
  `\frac`.
- **List separators in math are semicolons** (`[2;\ 3] = 6`, `P(2;\ 3)`), because the comma is the
  decimal separator.

## Answers
- Answer checking is exact wherever possible: fractions by cross-multiplication, roots by comparing
  squares, expressions by expanding to a canonical polynomial with rational coefficients
  (`src/engine/polynomial.ts`). "Right value, wrong form" (6/8 instead of 3/4, √50 instead of 5√2,
  unexpanded polynomial) is answered with a friendly "simplify it" message instead of "wrong".
- Two answer types were added beyond the brief because the curriculum needs them:
  `numbers` (several fields: systems of equations, coordinates, 35° 48′) and `expression`
  (grade 7 algebra, and volumes in terms of π like `36π`).
- An input the engine cannot parse is not counted as a mistake (`parseError`).

## Figures
- Hand-written SVG library, no dependency. Layouts produce primitives in world coordinates (y up);
  one fitting step scales uniformly (true proportions), converts markers to fixed screen sizes
  and places labels with a collision-avoiding search. The same `Scene` renders in React and as an
  SVG string, so `npm run check` validates every figure in Node (NaN, outside the viewBox,
  overlapping labels).
- Colors are named roles mapped to CSS variables → automatic dark mode and per-topic accent color.
- 3D convention (from the grade-8 textbook): oblique cabinet projection (depth up-right at 45°,
  halved), flat ellipses for round bases, hidden edges dashed.
- Grade 8 solid notation: **r, H, B, M, P, V** (radius, height of the solid, base area, lateral
  surface, surface area, volume), π written after the factors (r²π). Inferred from the
  Serbian-origin textbook and curriculum; the screenshots did not show these letters.
  **Teacher: please confirm** — if your book uses m / T / A instead, the labels only appear in
  lesson content, so changing them is a content edit.
- Constructions are a figure type with step captions; the figure player animates each new step.

## Lesson player
- **Nothing that contains a `position: fixed` element may keep a `transform`** (or filter,
  backdrop-filter, will-change: transform): it becomes the containing block and the "fixed" action
  bar / feedback sheet / dialog scrolls with it. So the step transition animates the *cards*
  (`.lesson-stage > .lesson-card`), not the stage, and `.shell-view` animates without fill-mode.
- The correct-answer green flash is an `::after` overlay on the card, so it never restarts the
  card's own slide-in animation.
- On phones the keypad often starts below the fixed action bar, so: the "simplify it" / "I don't
  understand" notice is rendered between the display and the keypad, the hint above the answer
  area, and the answer area scrolls into view on the first key press (`scroll-margin-bottom`
  keeps it above the bar). Figures are at most 340 px tall (`FigureView`), so a tall thin triangle
  cannot push the answer off the screen.
- **A lesson is 3–5 short parts + the mini test** (teacher feedback: the Pythagoras lesson was
  great but too long in one go). `SubtopicModule.parts: { title, steps }[]`; the textbook
  structure (one subtopic = one lesson = one map node) stays, the parts live inside it. The
  lesson opens on an overview (goals + part list); every finished part shows a small celebration
  ("N. rész kész!", XP, streak, part dots) and is saved (`parts` in the subtopic progress), so a
  student can do one part a day. Parts can be replayed in any order; the mini test is offered
  once every part is done (and can be opened from the overview any time). There is no mid-part
  resume: a part is ~5 minutes, restarting it is cheap and keeps the state simple. The map shows
  a started lesson with a ring of part segments ("2/4 rész kész"); the part count comes from the
  lazily loaded module of started lessons only (module chunks stay lazy).
- `src/dev/demoLesson.ts` (`dev-demo`) is a developer lesson that uses every step and answer type;
  `npm run check` validates and stress-tests it like real content. Choice/order/match buttons carry
  `data-index` / `data-left` / `data-right` attributes for browser automation (dev scripts read the
  current question from `window.__mkQuestion`, dev builds only).

## Progress, streak, daily challenge
- localStorage key `matek-kaland:v1`, versioned and sanitised on load/import; every access in
  try/catch; in-memory fallback with a visible notice. Tabs stay in sync via the `storage` event.
- Progress is kept **per grade** (XP, subtopics, chapters, daily records, streak badges).
- The streak is **derived** from the set of active days (not stored as a counter), so it can't
  get out of sync; it stays alive until the end of the next day. A day is active when the daily
  challenge was completed **or** a lesson part / mini test was finished (`activity` per day in
  the grade progress). Finishing a part gives `XP.partComplete` (first time) / `XP.partReplay`.
- Daily challenge: seed = `daily:<grade>:<YYYY-MM-DD in Europe/Belgrade>`; 6 questions from the
  eligible subtopics (daily.json, or everything with content). Only the first completion of the
  day gives XP and counts for the streak; replays are practice.
- XP numbers live in `src/state/xp.ts`; level n needs 50·n·(n−1) XP.

## Dev tooling
- All validation logic lives in `src/dev/validate.ts` and is **environment-independent** (no Vite
  APIs, no DOM). `npm run check` runs it in Node via tsx (catalog JSON with fs, modules imported
  dynamically, gallery sections included); the `/dev` page runs the *same functions* in the browser
  in chunks (per module, per generator × level, with `setTimeout` ticks and a progress bar) so the
  UI stays responsive. One code path — the CLI report and the browser report cannot drift apart.
- Stress test: every generator × level × N seeds (CLI default 500; `/dev` buttons 100/500). Each
  generated question gets the full static validation (RichText + KaTeX, answer-spec sanity,
  canonical-input must pass its own checker, `formatAnswer`, figure checks, deep NaN/undefined
  scan). Identical failures are aggregated (first seed + ×count). Distinct-question counting
  compares prompt + answer JSON (some generators keep the prompt fixed and vary the figure), and
  warns below 10 distinct questions in ≥ 50 seeds. KaTeX renders are cached per formula, so a
  500-seed run finishes in ~1 s.
- Warnings never fail `npm run check`; errors exit 1. This lets figure-label collisions and
  low-variety findings stay visible without blocking content commits.
- `CONTENT_STATUS.md` is **generated** from `src/content/grade-N/topics.json` by `npm run status`
  (the generator reproduced the hand-written file byte-for-byte before it was switched on);
  `npm run check` warns when it is stale. Never edit the markdown by hand.
- `src/content/registry.ts` has two dev-only exports (`allModulePaths`, `importModule`) so `/dev`
  can load every module file directly, including orphan files no subtopic references.

## Theme and sound (teacher feedback, 2026-10-24)
- **Light mode by default**, dark only when chosen: the theme is always explicit
  (`<html data-theme>`), set before the first paint by a tiny inline script in index.html. The
  sun/moon toggle is in the top bar of every main screen (and on the welcome screen), and in
  settings. "Automatic" (system) was removed — it made the app dark on dark-mode phones.
- **Sounds are synthesized** with Web Audio (`src/ui/sound.ts`, no audio files: nothing to
  download, no licences): bell "ding-ding" (correct), soft descending "bwomp" (wrong, never
  harsh), neutral two-note nudge ("almost" / unreadable input), an encouraging phrase when a mini
  test is not passed yet, a jingle for a finished lesson part and a brass-like fanfare with a
  cymbal swell for a finished lesson / daily challenge (longer for a chapter or streak milestone).
  A compressor on the master bus keeps overlapping sounds from clipping. On by default; mute
  button in the lesson top bar, toggle + preview buttons in settings.
- State version 2: v1 saves are migrated once — 'auto' → light, and sound → on (it was off by
  default before, so a stored `false` was not a real choice).

## Look and feel: cartoon "sticker" style (teacher feedback, 2026-10-24)
- **Fonts are bundled** (no CDN, works offline): DynaPuff for headings, buttons and big numbers,
  Nunito for body text (`src/styles/fonts.css`, `@fontsource-variable/*`, SIL OFL). Only the latin
  and latin-ext subsets (~140 kB in total, variable weight). The display font must have the
  Hungarian **ő / ű**: Fredoka, Lilita One, Sniglet and Bubblegum Sans were rejected because they
  lack them (the browser silently fell back to another font for those two letters); DynaPuff,
  Baloo 2 and Grandstander have them, DynaPuff is the most playful.
- **Sticker look**: ink outlines (`--outline`, `--line`) and hard diagonal offset shadows
  (`--pop`, `--pop-sm`, `--pop-lg` in `--ink`) on cards, buttons, answer tiles, keys, chips and map
  nodes. Pressing a button pushes it into its shadow. Deliberately *not* the Duolingo look: no
  colored bottom border, no green. In dark mode the outline is a light violet (black would vanish
  on dark cards) and the shadows stay black.
- **Popping effects** (all switched off by reduced motion, globally in theme.css): springy
  `boing` entrances, a star burst + flying "+10" on a correct answer, a wobbling ✗ on a wrong one,
  confetti that explodes from the middle of the screen (stars, dots, strips), a spinning star
  medal, staggered pop-in of map nodes and part rows, a hopping ▶ on the recommended lesson.
- Effects that leave their box (burst, "+10") live in an effects layer of the feedback sheet,
  outside its scroll container, so they are not clipped.

## PWA / offline
- No PWA library: a ~60-line Vite plugin in `vite.config.ts` writes `dist/sw.js` with the list of
  emitted files (+ `public/`, woff2 fonts only — every browser that runs service workers reads
  woff2). Page navigations are **network first** (a new deploy reaches students at once) with the
  cached `index.html` as the offline fallback; all other same-origin GETs are **cache first**
  (file names are content-hashed). The cache name contains a hash of the file list, old caches
  are deleted on activate. Registered only in production (`src/pwa.ts`).
- Icons: original logo (an "M" drawn as a path with a start dot and a star), SVG + PNG renders
  (192, 512, maskable 512, apple-touch 180) committed in `public/`.
- Text on bright accent backgrounds uses tokens (`--on-primary`, `--on-xp`), not `#fff`, so it keeps
  its contrast in dark mode, where the accents are lighter.

## Hosting
- **GitHub Pages** via GitHub Actions (`.github/workflows/deploy-pages.yml`): free for a public
  repository, deploys on every push to `master`, and runs `npm run check` first.
- `base: './'` in vite.config.ts so `dist/` works under any path (GitHub Pages project sites,
  Cloudflare Pages). Cloudflare Pages: build command `npm run build`, output directory `dist`
  (see HANDOFF.md).
