# Build: "Duolingo for math" — practice web app for grades 5, 7 and 8

You are building the foundation of a math practice web app for my students (Serbian elementary school, **Hungarian language of instruction**). I am their math teacher. Your job in this session is the **backbone**: architecture, engine, UI, the full topic skeleton, and a small number of gold-standard example lessons. Cheaper models (via OpenCode) will fill in the remaining lesson content afterwards, so everything you build must be easy for a less capable model to extend by following clear patterns.

Work autonomously. Don't ask me questions unless you're truly blocked; make sensible decisions and record them in `DECISIONS.md`.

---

## 1. Hard constraints

- **No backend, no accounts, no data collection.** Pure static site that can be hosted free on Cloudflare Pages or GitHub Pages. No analytics, no external tracking, no fonts or scripts from third parties except a math renderer if needed (prefer vendoring it locally).
- **Progress is stored on the device** (use `localStorage`, not cookies — cookies are too small). Wrap all storage access in try/catch so the app still works if storage is unavailable.
- **Export / import progress**: a button that downloads progress as a JSON file, and a button that restores it from that file. Also show a gentle reminder that clearing browser data deletes progress. Never ask for or store a student's real name; an optional nickname is fine.
- **Mobile-first.** Students will mostly use phones. Must work well at 360px width, with large tap targets and no horizontal scrolling. Desktop should also look good.
- **All student-facing text in Hungarian.** Put every UI string in one file (e.g. `src/i18n/hu.ts`) so wording can be fixed in one place. Use Hungarian conventions: decimal comma (`0,5`), and accept both `0,5` and `0.5` as input.
- **Stack: React + Vite + TypeScript**, with output as a static build (`npm run build` → `dist/`). Keep dependencies minimal and mainstream, and justify each one in `DECISIONS.md`. Avoid heavy UI frameworks; use CSS Modules or plain CSS. Use TypeScript types for the content schema so that content mistakes show up as type errors, which helps the next models catch their own bugs.
- **Running it must be dead simple.** Running it locally should take exactly `npm install` once, then `npm run dev`. Also add `npm run check`, which runs the type check plus the content validation and generator stress test from §8 in the terminal, so the OpenCode models can verify their own work. Deployment: document how to connect the repo to Cloudflare Pages so every git push redeploys automatically.
- **Original content only.** Reference materials are for topic structure and exercise style. Never copy textbook text or exercises verbatim; write your own explanations and generate your own problems.

## 2. Curriculum and source material

- Look up the official Serbian elementary curriculum for mathematics (ZUOV / Ministry of Education, "plan i program nastave i učenja" for 5th, 7th and 8th grade) to establish the topics for each grade.
- My textbook screenshots are in `materials/`, organized by grade. They contain:
  - **mostly the topic and subtopic lists.** These define the app's structure. **Where they differ from the curriculum, follow the screenshots**, since they reflect what I actually teach.
  - **a few sample pages** of explanations, worked examples and exercises. These are **style references only**: they show the tone, level of detail, notation and kind of visuals my students are used to. Match that style across the whole app.
- **Everything not covered by the screenshots should be inferred from the ZUOV curriculum.** That includes what each subtopic teaches, its learning outcomes, which exercise types fit and the difficulty level. Record your inferences per subtopic in `CONTENT_STATUS.md` (a one-line "scope" note) so the next models know what each subtopic must cover. Write your summary of the curriculum per grade to `docs/curriculum-grade-N.md`, so later models don't have to look it up again.
- Example (7th grade topics): Valós számok · Pitagorasz tétele · Algebrai egész kifejezések · Sokszögek · A kör · Adatfeldolgozás.
- Example (7th grade › Pitagorasz tétele subtopics):
  1. A Pitagorasz-tétel bizonyítása és alapszintű alkalmazása
  2. A Pitagorasz-tétel alkalmazása szerkesztéseknél
  3. A Pitagorasz-tétel alkalmazása négyzetre és téglalapra
  4. A Pitagorasz-tétel alkalmazása egyenlő szárú és egyenlő oldalú háromszögre
  5. A Pitagorasz-tétel alkalmazása rombuszra és trapézra
  6. Pontok egymástól való távolsága a koordináta-rendszerben
- Grades are **data-driven**: adding grade 6 later must only require adding content files, not code changes.

## 3. Structure and learning flow

**Hierarchy:** Grade → Topic (a "chapter") → Subtopic (a "lesson") → steps.

**Onboarding:** the first screen asks the student to choose a grade (5, 7 or 8). They can change it later in settings, and progress is kept separately per grade.

**Each subtopic is a sequence of steps**, roughly in this order:
1. **Theory explainer**: short, friendly, split into small cards rather than one wall of text. Use visuals (SVG diagrams) wherever geometry is involved.
2. **Worked examples**: shown step by step, revealed one step at a time with a tap.
3. **Understanding checks** mixed in between the theory cards: multiple choice and true/false.
4. **Practice exercises**: procedurally generated (see §4). Each comes with a hint and, after an answer, a worked solution.
5. **Mini test** at the end: about 5–8 questions, no hints. Passing requires ≥ 80%. On failure the student sees what went wrong and can retry right away; no punishment and no lockout.

Passing the mini test **completes the subtopic**. It should feel like a real milestone: a celebration screen with an animation, XP earned and a progress update.

Completing **all subtopics in a topic** completes the chapter, with a bigger celebration and a chapter badge.

**Year goal:** a visible progress indicator toward completing every topic in the grade by the end of the school year.

**Navigation:** a Duolingo-style path or map per grade, with topics as sections and subtopics as nodes. Completed, in-progress and not-started nodes must be visually distinct, and the path highlights the **recommended next subtopic** (the first one not yet completed, in order).

**Soft lock for skipping ahead.** Every subtopic can be opened, but subtopics beyond the recommended next one appear soft-locked: a padlock-style icon, slightly muted, still tappable. Tapping one opens a friendly warning dialog in Hungarian that:
- explains the student is skipping ahead and may lack knowledge needed to understand this lesson
- lists the uncompleted prerequisite subtopics, each tappable to jump there
- offers two buttons: "Vissza az ajánlotthoz" (primary) and "Mégis megnyitom" (secondary)

Once a student has opened a soft-locked subtopic, don't warn again for that one. **Prerequisites:** by default, a subtopic requires all earlier subtopics in its topic. A content file can override this with an optional `prerequisites` field (a list of subtopic IDs, which may point to other topics), because some lessons only depend on one specific earlier lesson. Whole topics follow the same rule: starting a later topic while earlier ones are unfinished triggers the warning, unless the subtopic's prerequisites say otherwise. The daily challenge is never soft-locked.

**No hearts or lives system.** Wrong answers should never block learning. Use encouragement instead.

## 4. Exercise engine (the most important part)

Exercises are produced by **generator functions**, not stored question lists. A generator takes a seeded RNG and a difficulty and returns a question object containing at least:
- the prompt
- the correct answer
- the answer type
- a hint
- a step-by-step solution

Answers are **computed by code** so they are always correct.

**Answer types to support:**
- integer and decimal input (comma or dot)
- fraction input (accept `3/4`; normalize equivalent fractions where it makes sense; decide whether unsimplified answers are accepted per exercise, with a flag)
- expressions with roots where needed, e.g. `5√2` (support at least `a√b` form with a friendly input helper on mobile)
- multiple choice (generated distractors that reflect typical mistakes, not random numbers)
- true/false
- optionally: ordering, and matching pairs

**Requirements for the engine:**
- **Numeric tolerance and units:** accept reasonable formatting variations and whitespace. Where rounding is involved, the exercise defines its precision.
- **Seeded randomness:** the same seed always produces the same exercise. The daily challenge depends on this.
- **A mobile-friendly answer input:** a custom on-screen keypad with digits, comma, fraction bar, √ and minus, so students don't have to fight the phone keyboard.
- **Figures:** any theory card, example or exercise can include a figure built with the graphics library (§4a). Figures generated for an exercise must match its numbers, or be clearly marked "nem méretarányos" (not to scale).
- **Difficulty levels** (e.g. 1–3) within a subtopic. Practice ramps up, and the mini test mixes levels.

## 4a. Graphics library (equally important)

Math textbooks for this age group are full of figures: geometric shapes, solids, graphs, number lines, diagrams and charts. The app must match that. Build a **reusable, parametric SVG figure library** that content authors can use with a few lines of data, for example "draw a cylinder with r = 3 and h = 7, labeling r and h", without writing SVG by hand.

**Must cover, at minimum:**
- **2D geometry:**
  - points, segments, rays and lines
  - polygons: triangles, quadrilaterals and regular polygons
  - circles, arcs and sectors
  - angles with arc markers and labels, and right-angle markers
  - side and vertex labels, equal-length tick marks, parallel-line markers
  - heights, diagonals, medians and other auxiliary lines, drawn dashed
  - shading and highlighting of regions
- **3D solids** in a consistent oblique or isometric projection: cube, cuboid, prisms (triangular and other), pyramids, cylinder, cone and sphere.
  - Hidden edges are drawn dashed.
  - Dimensions are labeled: radius, height, slant height, edges and space diagonal.
  - Key segments can be highlighted. For example, the right triangle inside a cone or pyramid that's used to apply the Pythagorean theorem.
  - Optional bonus: nets of solids.
- **Coordinate plane:**
  - axes with ticks and labels, and an optional grid
  - plotting points, segments and polygons
  - graphs of linear functions and direct and inverse proportionality
  - marking distances between points (needed for "Pontok egymástól való távolsága")
- **Number lines:** points, intervals, fractions and decimals on a number line, and negative numbers.
- **Data and statistics** (Adatfeldolgozás): bar charts, pie charts, line charts, frequency tables and pictograms.
- **Constructions** (szerkesztés): show a compass-and-straightedge construction as a sequence of steps the student taps through, each step adding arcs and lines, with an optional short animation.

**Requirements:**
- **Parametric and data-driven.** A figure is described as a plain object (type plus parameters plus label options). The library handles layout, scaling, label placement and projection.
- **Correct.** Scale to fit, but keep proportions true to the given numbers unless the figure is explicitly marked not to scale. Labels must not overlap the figure or each other in common cases.
- **Readable on phones.** Figures should be responsive, sharp at any size, use a large enough font and look good in both light and dark mode. Use the topic's color scheme.
- **Hungarian notation and conventions**, for example `a`, `b`, `c` for sides, `r` for radius, `m` for height, and `α`, `β`, `γ` for angles. Match the style in my sample screenshots.
- **Light interactivity where it helps learning** (bonus): for example a draggable point on the coordinate plane, or a slider that changes a cylinder's radius and updates the figure and the formula live. Only do this where it's cheap and clearly worth it.
- **No heavy dependencies.** Prefer hand-written SVG helpers. A small, well-justified library for something genuinely hard is acceptable, but record why in `DECISIONS.md`.
- **A figure gallery in `/dev`**, showing every figure type with several parameter sets, including edge cases: very thin triangles, large numbers, long labels and tiny radii. This is how the next models will discover what's available and check that their figures render correctly. `npm run check` should also render every figure used in the content and flag errors such as `NaN` coordinates or elements outside the viewBox.

## 5. Daily challenge

- **One challenge per grade per day, identical for every student in that grade.** Derive the seed from the date (in the `Europe/Belgrade` timezone) plus the grade.
- About 5–8 questions, taking roughly 5–10 minutes.
- Questions come from a pool of eligible subtopics defined in a simple config file per grade, e.g. `content/grade-7/daily.json` listing the subtopic IDs covered in class so far. I will edit this file as the year goes on, so make it trivially easy to edit and document how in the handoff file. If the list is empty, fall back to all subtopics that have content.
- **Completing the daily challenge maintains the daily streak.** Show the streak prominently (🔥 + number) and celebrate milestones (7, 30, 100 days).
- Make sure a student cannot repeat the same day's challenge for extra streak or XP; replaying for practice is fine.

## 6. Gamification and UI feel

- **XP** for steps, subtopics, chapters and daily challenges; a simple level system is optional.
- **Streak:** current streak, best streak, and a small calendar of completed days.
- **Badges** for chapter completion and streak milestones.
- **Style:** colorful, playful and fun, with a distinct color per topic. Rounded shapes, friendly typography (a bundled font or a good system font stack), and a cheerful mascot-free illustration style made of simple SVG shapes. **Do not use any existing brand's characters or visual identity**, including Duolingo's owl, colors or logo.
- **Animations:** simple but satisfying.
  - Correct answers: a bounce or pop, a green flash, and XP counting up.
  - Wrong answers: a gentle shake.
  - Completing a node: confetti.
  - Moving between screens: smooth transitions.
  - Use CSS animations, keep them short, and respect `prefers-reduced-motion`.
- **Sound:** optional, off by default, with a toggle.
- **Accessibility:** good contrast, readable sizes, and nothing that depends on color alone.
- **Bonus if cheap to add:** make it an installable PWA that works offline after first load.

## 7. Content format (designed for handoff)

Content lives in data and modules that are **separate from the engine**. For example:

```
src/content/
  grades.json                     # list of grades
  grade-7/
    topics.json                   # topics + subtopics (id, title, order, status, optional prerequisites)
    daily.json                    # eligible subtopics for the daily challenge
    pitagorasz/
      01-bizonyitas-alapok.ts     # one module per subtopic
      02-szerkesztesek.ts
      ...
```

Content modules should be **plain typed data plus generator functions, not React components**, so authors never need to write JSX. The engine renders them. Load subtopic modules lazily (dynamic import) so the app stays fast as content grows.

**Each subtopic module** exports:
- its metadata
- theory cards
- worked examples
- understanding checks
- practice generators
- the mini-test composition

**Content statuses:** each subtopic has a `status` field (`todo` / `draft` / `done`). A `todo` subtopic shows as "Hamarosan…" in the UI and can't be opened, so a half-finished app is still usable.

**Shared helpers** (RNG, formatting, distractor helpers, SVG figure helpers) live in one place. Content files should only call helpers, not reimplement them.

## 8. What to deliver in this session, in priority order

Work in this order, so that if you run out of session time the most valuable parts exist and the handoff file is accurate. **Commit to git after each milestone** with clear messages, and keep `HANDOFF.md` updated as you go, not only at the end.

1. **Engine and app shell:**
   - routing
   - storage, export and import
   - the grade picker
   - the path/map
   - the lesson player with all step types
   - the answer input and keypad
   - the mini test
   - celebrations
   - streak and XP
   - the daily challenge
   - settings
   - **the graphics library from §4a with the figure gallery.** Build it early, since both example lessons depend on it.
2. **The full skeleton for grades 5, 7 and 8:** every topic and subtopic, with correct Hungarian titles, all set to `todo` except the examples below.
3. **Gold-standard example lessons, fully written (`done`):**
   - 7th grade › Pitagorasz tétele › subtopic 1 (*A Pitagorasz-tétel bizonyítása és alapszintű alkalmazása*). This is a geometry lesson with figures and root answers.
   - One non-geometry subtopic from 5th grade, ideally involving fractions or decimals, so a second answer-type family is covered.
   - **One short third example using a 3D solid figure** from the grade 8 solids topic, such as the cylinder (volume or surface area) with labeled radius and height. It doesn't need to be a complete lesson, but it must include at least a theory card, a worked example and one generator with a figure that changes with the generated numbers.
   - These are the templates the other models will imitate, so make them excellent. Mathematically correct, pedagogically sound for 11–14 year olds, natural Hungarian, and with a full range of exercise types and difficulty levels.
4. **A developer page** at the route `/dev`, available in dev mode and hidden from students in production, plus the same checks in `npm run check`. It should:
   - validate all content files against the expected structure and report errors clearly
   - list every subtopic with its status
   - let me preview any subtopic directly, skipping the path
   - **stress-test every generator**: run each one many times (e.g. 500 seeds × each difficulty) and flag exceptions, `NaN` or `undefined` values, answers that fail their own checker, duplicate distractors and broken SVGs
5. **Handoff documentation** (see §9).
6. **Self-verification:**
   - Run the app in a browser at mobile width (around 375px) and at desktop width.
   - Click through the full flow: choose a grade, complete the example subtopic including a failed and then passed mini test, open a soft-locked subtopic and check the warning, do the daily challenge, check the streak, export, clear storage, import, and confirm progress is restored.
   - Run `npm run check` and `npm run build`, and confirm both succeed.
   - Fix what you find, then list anything still incomplete in `HANDOFF.md`.

## 9. Handoff files (critical)

The next models are less capable than you. They should be able to add a complete subtopic by reading these files and copying the pattern, without touching the engine.

- **`HANDOFF.md`**: the project overview, how to run it locally (the simplest possible way; I'm not comfortable with the terminal), the folder structure, and the current state including known issues.
- **`CONTENT_GUIDE.md`**: a step-by-step recipe for authoring a subtopic. It should cover:
  - the exact module structure, with an annotated minimal example
  - every helper available and when to use it
  - **the figure library:** every figure type, its parameters and a copy-paste example for each, plus how to make a figure follow generated numbers. Point to the `/dev` gallery.
  - every answer type and how to configure checking
  - how to write good distractors, hints and solutions
  - tone and language rules: Hungarian, friendly, short sentences, the age group, decimal comma
  - how to set `prerequisites` when the default order doesn't fit
  - a **checklist** to complete before setting `status: "done"`, including passing `npm run check` with no errors and verifying the math by hand on a few seeds
  - rules: **don't modify engine files**, don't copy textbook text, keep one subtopic per change
- **`CONTENT_STATUS.md`**: a table of every subtopic (grade, topic, subtopic, status, notes) so the next model can pick up the next `todo`.
- **`DECISIONS.md`**: the architectural choices you made and why.
