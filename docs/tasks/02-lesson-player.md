# Task 02 — Lesson player, inputs + keypad, mini test, celebrations, daily challenge, preview

Brief: `PROMPT.md` §3 (learning flow), §4 (exercise engine), §5 (daily), §6 (gamification).

## Already exists (read first)
- Schema `src/engine/types.ts`: SubtopicModule; LessonStep = theory | example | check |
  practice | explore; Question; AnswerSpec = number | numbers (multi-field) | expression
  (polynomial incl. π) | fraction | root | choice | truefalse | order | match; StudentAnswer;
  CheckResult (`almost`: 'notSimplified' | 'wrongForm', `parseError`).
- `src/engine/answers.ts`: `checkAnswer`, `isTextAnswer`, `formatAnswer`, `choiceOrder(n, shuffle, seed)`,
  `expressionVars`, `canonicalInput`. `src/engine/polynomial.ts`: `expressionToTex`.
  `src/engine/session.ts`: `generateQuestion(mod, ref, seed)`, `seedOf(...)`,
  `eligibleDailySubtopics`, `planDaily`, `DAILY_COUNT`.
- `src/ui/Rich.tsx` (`<Rich text>`, `<RichInline text>`), `src/figures/FigureView.tsx`
  (`<FigureView figure>`; constructions have their own step buttons), `src/ui/sound.ts` (`playSound`).
- State: `saveLessonStep`, `addXp`, `recordTestResult(grade, topics, id, percent, passPercent)` →
  TestOutcome (incl. `chapterCompleted`), `recordDaily(grade, date, correct, total)` → DailyOutcome
  (streak, milestone), `streakOf`; XP constants in `src/state/xp.ts`; `todayBelgrade`.
- Content: `loadSubtopic(grade, id)`, `getGradeTopics`, `getDailyConfig`, `hasModule`,
  `gradeOfSubtopic` (registry.ts); `findSubtopic`, `topicColor` (catalog.ts).
- Strings: `t.lesson`, `t.feedback`, `t.input`, `t.test`, `t.celebrate`, `t.daily`, `t.streak`.
- A real lesson to test with: `src/content/grade-7/pitagorasz/01-bizonyitas-alapok.ts`
  (`g7-pitagorasz-01`, status draft) — uses theory, check, explore, example, practice, number,
  root, choice, truefalse answers and triangle/quadrilateral/geometry figures.
- Placeholders to REPLACE: `src/lesson/LessonScreen.tsx` (prop `subtopicId`),
  `src/lesson/DailyScreen.tsx` (prop `grade`), `src/dev/PreviewScreen.tsx` (prop `subtopicId`).

## Build (`src/lesson/**`, CSS prefix `lesson-` / `kp-`)
- **LessonScreen**: grade from id (`gradeOfSubtopic`), meta (`findSubtopic`), module
  (`loadSubtopic`); todo/missing → friendly "készül" screen; else `LessonPlayer`.
- **LessonPlayer** (exported; `preview` flag disables saving progress/XP): start screen (title,
  goals, resume "Folytatás"/"Elölről"), top progress bar + ✕ (confirm → map), one step at a time
  with transitions; `--topic` set on the root from `topicColor`.
  - theory: title, body, figure, `remember` in a pale-yellow box (`--remember-bg`).
  - example: problem + figure, steps revealed one by one ("Következő lépés"; a step's own figure
    replaces the figure), final answer, "Mutasd az egészet".
  - check/practice: practice seeds `seedOf('practice', id, sessionNonce, stepIndex, k)` (nonce =
    Date.now() at lesson start). Hint button (XP.correctWithHint instead of XP.correct). Feedback
    sheet from the bottom: correct → green flash + pop + praise (`t.feedback.correct`, varied) +
    "+10 XP" count-up + sound; wrong → gentle shake, encouragement, correct answer
    (`formatAnswer`), worked solution — never blocking; `almost` → `t.feedback.notSimplified` /
    `wrongForm`, student edits and re-checks, no penalty; `parseError` → `t.feedback.parseError`.
    A wrong practice item is re-queued ONCE as a fresh variant at the end of that practice step.
  - explore: big touch-friendly sliders → `render(values)` → figure + Rich text, live.
  - after the last step: `t.lesson.toTestBody` → MiniTest.
  - `saveLessonStep` on every step (not in preview).
- **MiniTest**: `module.miniTest.items`, fresh seeds per attempt, no hints/solutions during the
  test; result vs `passPercent` (default 80). Fail → list wrong items with student answer, correct
  answer and solution; "Újrapróbálom" immediately (new seeds), no lockout. Pass →
  `recordTestResult` → Celebration.
- **Celebration**: confetti (CSS/SVG, short), XP count-up, grade progress (completed/total),
  streak; chapter completed → bigger celebration with badge (topic color + `TopicIcon`).
- **QuestionView**: prompt, figure, inputLabel, input, unit — any AnswerSpec.
- **Inputs** (`src/lesson/inputs/*`): custom **Keypad** (digits, comma, minus, backspace, clear;
  "/" and space for fractions/mixed numbers; √ for roots; letters from `expressionVars`, ^, ( ),
  + − · and π for expressions; suffix units like °, ′ for `numbers` fields). Display shows typed
  text plus a live KaTeX preview ("Így értem:"). Physical keyboard on desktop (Enter = check);
  the OS keyboard must never pop up on phones (`inputMode="none"`, no focused <input>).
  `numbers`: several labelled fields, tap to focus. Choice: big buttons, shuffled with
  `choiceOrder(n, spec.shuffle ?? true, seed)`, mapped back to the original index. True/false:
  "Igaz"/"Hamis". Order: tap in order (numbered chips, undo). Match: tap left then right, pairs get
  the same color + number, tap again to unpair.
- **DailyScreen**: today (`todayBelgrade`), eligible subtopics
  (`eligibleDailySubtopics(getGradeTopics(g), getDailyConfig(g), id => hasModule(g, id))`), load
  modules, `planDaily(...)` → 6 questions, no hints, solutions after wrong answers, result →
  `recordDaily`; streak 🔥 prominent, milestone (7/30/100) celebration; already done today →
  "done" screen + replay as practice (no XP/streak, `t.daily.practiceMode`); nothing eligible →
  `t.daily.noContent`.
- **`src/dev/demoLesson.ts`** (id `dev-demo`): exercises EVERY step type and EVERY answer type
  (number with unit/precision, numbers e.g. 35° 48′, expression e.g. 3x^2−2x, expression with π,
  fraction with requireSimplified + mixed, root, choice, truefalse, order, match) + a mini test.
  Imports only from `src/kit.ts`.
- **PreviewScreen**: LessonPlayer in preview mode for any subtopic id or `dev-demo`, with buttons
  to jump to any step and to start the mini test directly.

## Verify
Drive `#/dev/preview/dev-demo` and `#/lesson/g7-pitagorasz-01` with `scripts/dev/pw.mjs` at
375×740 and 1280×800, light and dark: every step type, every answer type correct AND wrong
(incl. an `almost` case and a parse error), keypad by tapping, fail then pass the mini test,
celebration, daily challenge (needs a draft/done subtopic: Pythagoras), replay of the daily.
Look at the screenshots. No console errors.
