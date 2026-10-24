# Task 07 — Gold-standard example lessons

> **Status (2026-10-24):** all three lessons are WRITTEN and pass the math/text/answer checks of
> `npm run check` (status `draft`). Remaining: once tasks 02 (player), 04 (solids) and 06
> (fraction/bar models) are done, run `npm run check` (their figures must then render without
> errors), play each lesson in the browser at phone width, fix anything odd, and set
> `"status": "done"` in topics.json + `npm run status`.

Brief: `PROMPT.md` §8 item 3. These are the templates other models imitate — make them
excellent: mathematically correct, pedagogically sound for 11–14 year olds, natural Hungarian,
full range of exercise types and difficulty levels. Follow `CONTENT_GUIDE.md`.

## 1. Grade 7 › Pitagorasz tétele › 01 — WRITTEN (status `draft`)
`src/content/grade-7/pitagorasz/01-bizonyitas-alapok.ts`. Generators were smoke-tested
(300 seeds × level: no exceptions, canonical answers pass, KaTeX parses, figures lay out).
Remaining: run `npm run check` once task 03 exists, play it through in the browser (task 02),
fix anything odd, then set `"status": "done"` in `src/content/grade-7/topics.json`.

## 2. Grade 5 › Törtek – második rész › 01 "Törtek összeadása és kivonása" (`g5-tortek-2-01`) — WRITTEN (draft)
File: `src/content/grade-5/tortek-2/01-osszeadas-kivonas.ts`. Scope: see `CONTENT_STATUS.md`.
Style notes: `docs/materials-grade-5.md` (imperatives "Számítsd ki…!", everyday hooks, dinárs).
Suggested content:
- theory: same denominator (add numerators), with `fractionModel` figures; different
  denominators → common denominator (lcm) via expanding; mixed numbers; simplifying the result;
  decimals: line up the decimal comma (short card).
- checks: truefalse "1/2 + 1/3 = 2/5" (false — typical mistake), choice of common denominator.
- examples: 2/7 + 3/7; 1/2 + 1/3; 2 1/4 − 3/4; 0,75 + 1,5.
- generators: `same-den` (L1), `diff-den` (L1: one den multiple of the other; L2: lcm needed;
  L3: three fractions or mixed numbers), `mixed` (L2/L3, `form: 'mixed'`), `decimal-add` (number
  answers with decimal comma), `common-den` (choice), `word` (L3: pizza, ribbon in m, money in
  dinár), `mistake` (truefalse/choice with the "add numerators and denominators" distractor).
  Fraction answers `{ type: 'fraction', num, den }` with `requireSimplified: true` (default) —
  the result must be simplified; a few L1 items may set `requireSimplified: false`.
- mini test 6–7 items mixing levels; daily pool.

## 3. Grade 8 › Henger, kúp és gömb › 03 "Az egyenes henger térfogata" (`g8-henger-kup-gomb-03`) — WRITTEN (draft)
File: `src/content/grade-8/henger-kup-gomb/03-henger-terfogata.ts`. Short example (needs task 04
for the cylinder figure). Notation (see `DECISIONS.md`): r radius, H height, B base area
(B = r²π), V volume (V = B·H = r²πH); π written after the factors; units cm³.
At least: a theory card with a labelled cylinder figure, an `explore` card (sliders r and H →
cylinder figure + live formula), a worked example, and generators whose cylinder figure follows
the generated numbers: `volume` (answer in terms of π via `{ type: 'expression', value: '36π' }`
at L1, numeric with π ≈ 3,14 and `precision` at L2), `height-from-volume` (L3). Mini test 5 items.
Set status to `draft` when written, `done` after browser verification.
