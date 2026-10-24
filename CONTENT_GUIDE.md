# Content guide — how to write a subtopic (lesson)

This is the recipe for adding lesson content. **Copy the pattern of a gold-standard lesson** —
read the one closest to your topic completely before you start:

| template | shows |
|---|---|
| `src/content/grade-7/pitagorasz/01-bizonyitas-alapok.ts` | geometry lesson: triangle/quadrilateral/geometry figures that follow the numbers, root answers (5√2), varied labels and orientation, word problems, an explore card, a static proof figure |
| `src/content/grade-5/tortek-2/01-osszeadas-kivonas.ts` | non-geometry lesson: fraction answers (simplify flag, mixed numbers), decimal answers, typical-mistake distractors, true/false, bar models and fraction models, LaTeX column addition |
| `src/content/grade-8/henger-kup-gomb/03-henger-terfogata.ts` | short 3D lesson: solid figure (cylinder) following the numbers, π-form answers (`expression` with `'45π'`), π ≈ 3,14 answers with `precision`, reverse problems, "how does it change" choice, explore sliders |

## Rules
1. **Do not modify engine files** (`src/engine`, `src/figures`, `src/state`, `src/ui`, `src/lesson`,
   `src/screens`, `src/dev`, `scripts`). You only add/edit files in `src/content/` and the status
   files. If you think the engine needs a change, write it down in `HANDOFF.md` → "Known issues".
2. **Never copy textbook text or exercises** from `materials/`. Write your own explanations and
   generate your own problems. The screenshots are for structure and style only.
3. **One subtopic per change** (one commit per lesson).
4. All student-facing text is **Hungarian**: friendly, short sentences, for 11–14 year olds,
   addressing the student as "te" ("Számítsd ki…!", "Döntsd el…!"). Decimal comma (`0,5`).

## Step by step
1. Pick the next `todo` subtopic in `CONTENT_STATUS.md`. Its **Scope** column says what the lesson
   must cover. The curriculum summary is in `docs/curriculum-grade-N.md`, the textbook style in
   `docs/materials-grade-N.md`.
2. Find its entry in `src/content/grade-N/topics.json`: `id` (e.g. `g7-pitagorasz-02`), topic
   `folder` (e.g. `pitagorasz`) and `file` (e.g. `02-szerkesztesek`).
3. Create `src/content/grade-N/<folder>/<file>.ts` (copy the structure below).
4. Run `npm run check -- --only=<id>` until it prints no errors or warnings.
5. Open it in the browser: `npm run dev`, then `http://localhost:5173/#/dev/preview/<id>`.
   Play it through. Check the math by hand on a few seeds (the /dev page has a sample viewer).
6. Set `"status": "draft"` in topics.json (it becomes visible to students!) and, after the
   checklist below, `"done"`. Run `npm run status` to refresh `CONTENT_STATUS.md`.

## Module structure (annotated minimal example)

```ts
import { defineSubtopic, num, tex, choice, type GeneratorDef } from '../../../kit';

// A generator: same rng + same level ⇒ same question. ALL randomness from `rng`.
const area: GeneratorDef = {
  id: 'rect-area',                       // unique inside this file, kebab-case
  title: 'Téglalap területe',            // shown in /dev only
  levels: [1, 2],                        // which difficulty levels it supports (1 easy … 3 hard)
  generate(rng, level) {
    const a = rng.int(2, level === 1 ? 9 : 25);
    const b = rng.int(2, 9);
    return {
      prompt: tex`Egy téglalap oldalai $${num(a)}$ cm és $${num(b)}$ cm. Mekkora a területe?`,
      figure: { type: 'quadrilateral', shape: 'rectangle', a, b, sideLabels: { a: `${num(a)} cm`, b: `${num(b)} cm` } },
      answer: { type: 'number', value: a * b, unit: 'cm²' },   // computed by code ⇒ always right
      inputLabel: '$T =$',
      hint: 'A téglalap területe a két oldal szorzata: $T = a \\cdot b$.',
      solution: [
        tex`$T = a \cdot b$`,
        tex`$T = ${num(a)} \cdot ${num(b)} = ${num(a * b)}$`,
        tex`A terület **${num(a * b)} cm²**.`,
      ],
    };
  },
};

export default defineSubtopic({
  id: 'g5-pelda-01',                     // MUST equal the id in topics.json
  goals: ['kiszámítani a téglalap területét,'],   // 2–4 items, shown on the start screen
  parts: [                               // 3–5 short parts (~5 minutes each), then the mini test
    {
      title: 'A téglalap területe',      // shown in the part list and on the "N. rész kész!" screen
      steps: [
        { type: 'theory', title: 'A téglalap területe', body: '…', figure: { … }, remember: '$T = a \\cdot b$' },
        { type: 'check', question: { prompt: '…', answer: { type: 'truefalse', value: true }, hint: '…', solution: ['…'] } },
        { type: 'practice', generator: 'rect-area', level: 1, count: 2 },
      ],
    },
    {
      title: 'Kidolgozott példák',
      steps: [
        { type: 'example', title: '…', problem: '…', figure: { … }, steps: [{ text: '…' }, { text: '…' }], answer: '…' },
        { type: 'practice', generator: 'rect-area', level: 2 },
      ],
    },
    // … 3–5 parts in total
  ],
  generators: [area],
  miniTest: { items: [{ generator: 'rect-area', level: 1 }, /* … 5–8 items, mixed levels */] },
  daily: [{ generator: 'rect-area', level: 1 }],   // optional; default = the mini test items
});
```

### Step types (`src/engine/types.ts` has the full documentation)
| type | use it for | fields |
|---|---|---|
| `theory` | a short explanation card (2–5 sentences) | `title?`, `body`, `figure?`, `remember?` (pale-yellow formula box) |
| `check` | understanding check between theory cards (usually choice / true-false) | `question` (a static Question) |
| `example` | worked example, revealed one step at a time | `title?`, `problem`, `figure?`, `steps: [{ text, figure? }]`, `answer` |
| `practice` | generated exercises | `generator`, `level`, `count?` (default 1) |
| `explore` | sliders that change a figure + formula live (use sparingly) | `title?`, `body`, `sliders`, `render(values) → { figure?, text }` |

**Recommended order:** theory → check → theory → (explore) → example → practice L1 → example →
practice L1/L2 → theory → example → practice L2 → practice L3. The mini test comes automatically
after the last part. A whole lesson takes 15–25 minutes.

### Parts (3–5 per lesson)
Split the step sequence into **3–5 parts of about 5 minutes each**, one idea per part (e.g.
"the theorem", "computing the hypotenuse", "computing a leg", "is it a right triangle?"). Each
finished part gives XP and counts for the daily streak, so a student can do one part a day.
- Every part gets a short Hungarian `title` (a noun phrase, no full stop).
- Every part ends with at least one question (check or practice) — never a theory card alone.
- Keep a part to **at most 4 theory/example cards and 8 questions**; the validator warns above that.
- The first part introduces; later parts may start with a one-card recap.
- Parts can be replayed in any order; the mini test is offered when all are done.

## RichText (all student-facing text)
- Math between `$...$` in LaTeX: `$a^2 + b^2 = c^2$`, `$\frac{3}{4}$`, `$\sqrt{2}$`, `$3 \cdot 4$`.
- Decimal comma inside math is fine: `$0,5$` (shown as 0,5).
- `**bold**`, `\n` new line, `\n\n` new paragraph, lines starting with `- ` are bullets.
- **Backslashes!** In a normal string write two: `'$\\frac{1}{2}$'`. Easier: the `tex` tag keeps
  backslashes and allows `${}`: ``tex`$\frac{${p}}{${q}}$` ``. Inside a `tex` template, `\n`
  outside `$…$` is still a line break, inside `$…$` it stays LaTeX (`\ne`, `\neq`). A single
  backslash in a normal string silently breaks (`'\frac'` becomes a form-feed + "rac", `'\sqrt'`
  becomes the word "sqrt"); `npm run check` catches both.
- Multiplication: `\cdot` (·). Division: `:` . Units after a space, upright: `5 cm`, `cm²`, `m³`.

## Helpers (`src/kit.ts` — the only import you need)
| helper | what it does |
|---|---|
| `num(x, decimals?)` | Hungarian number: `num(0.5)` → `0,5`, `num(12500)` → `12 500`, `num(-3)` → `−3`, `num(2/3, 2)` → `0,67` |
| `signed(x)` | `+ 3` / `− 3` for building expressions |
| `paren(x)` | negative numbers in parentheses: `(−2)` |
| `tex`…`` | template tag keeping backslashes |
| `m(latex)` | wraps in `$…$` |
| `texFrac(n, d)` / `texFrac(frac)` | `\frac{3}{4}` (integers stay integers) |
| `texMixed(frac)` | `1\frac{3}{4}` |
| `texRoot(coef, radicand, den?)` | `5\sqrt{2}`, `\frac{\sqrt{3}}{2}` |
| `rootText(coef, radicand)` | `5√2` for figure labels (figures use plain text, not LaTeX) |
| `withUnit(x, 'cm')` | `3,5 cm` |
| `joinHu(['a','b','c'])` | `a, b és c` |
| `article(x)` | Hungarian article: `article(5)` → `az`, `article(3)` → `a` |
| `suffix(n, back, front, rounded?)` | suffix after a number with vowel harmony: `` `${num(n)}-${suffix(n, 'nak', 'nek')}` `` → `6-nak`, `4-nek`; `suffix(5, 'hoz', 'hez', 'höz')` → `höz` |
| `gcd`, `lcm`, `round(x, d)`, `clean(x)` (removes float noise like 0.30000000004) | |
| `frac(n, d)`, `simplify`, `fracAdd/Sub/Mul/Div`, `fracEquals`, `fracCompare`, `fracValue`, `toMixed`, `decimalToFrac`, `isTerminating` | exact fractions |
| `simplifyRoot(50)` → `{ coef: 5, radicand: 2 }`, `isSquareFree`, `isPerfectSquare` | roots |
| `PYTHAGOREAN_TRIPLES`, `PRIMITIVE_TRIPLES` | triples with c ≤ 100 |
| `choice(rng, correct, wrongs, opts?)` | multiple-choice answer (see below) |
| `textChoice(correct, wrongs)` | multiple choice from fixed texts (static checks) |
| `nearbyInt(value, spread)`, `nearbyScaled(value)` | fallback distractor makers |
| `perpendicularFoot(p, a, b)` | foot of a perpendicular (for figure coordinates) |

**Random numbers** — only through `rng`: `rng.int(min, max)` (inclusive), `rng.pick(list)`,
`rng.shuffle(list)`, `rng.sample(list, k)`, `rng.chance(p)`, `rng.sign()`,
`rng.intExcept(min, max, [values])`. Never `Math.random()`.

**Floating point:** compute with integers where possible; for decimals use `clean()` or `round()`
before comparing/formatting. Prefer exact fractions (`frac`) for fraction lessons.

## Answer types (`answer` field of a Question)
| type | example | checking |
|---|---|---|
| `number` | `{ type: 'number', value: 12.5, unit: 'cm' }` | comma or dot, spaces in 12 500, trailing unit ignored. `precision: 2` → must be rounded to 2 decimals (more decimals also OK). `acceptFraction: true` accepts 1/2 for 0,5 |
| `numbers` | `{ type: 'numbers', fields: [{ label: '$x =$', value: 2 }, { label: '$y =$', value: -1 }] }` | several fields, all must be right (systems of equations, coordinates, 35° 48′ with `unit: '°'` / `'′'`) |
| `fraction` | `{ type: 'fraction', num: 3, den: 4 }` | accepts `3/4`, mixed `1 3/4`, integers. `requireSimplified` (default **true**: 6/8 gets a friendly "simplify" message), `form: 'mixed' \| 'improper' \| 'any'`, `acceptDecimal: true` |
| `root` | `{ type: 'root', coef: 5, radicand: 2 }` = 5√2; `den: 2` for √3/2; radicand 1 = no root | exact comparison (√50 = 5√2). `requireSimplified` (default true: √50 → "simplify"; set false before partial root extraction is taught), `acceptDecimal: 2` |
| `expression` | `{ type: 'expression', value: '3x^2-2x+1' }`, `'36π'` | polynomial comparison after expansion. `form: 'expanded'` (default: no parentheses, like terms combined), `'factored'` (must be a product with parentheses), `'any'`. Keypad shows the letters in `value` (or `vars`) |
| `choice` | `choice(rng, 10, [14, 100, 7])` | one correct option; shuffled for display |
| `truefalse` | `{ type: 'truefalse', value: false }` | Igaz / Hamis buttons |
| `order` | `{ type: 'order', items: ['$\\frac12$', '$\\frac23$', '$\\frac34$'], direction: 'A legkisebbtől' }` | items listed in the CORRECT order; shown shuffled |
| `match` | `{ type: 'match', pairs: [['$\\frac12$', '$0,5$'], ['$\\frac14$', '$0,25$']] }` | pairs listed correctly matched |

The canonical correct answer must pass its own checker — e.g. with `requireSimplified: true`,
`num`/`den` may be unsimplified (the checker simplifies), but for `expression` with
`form: 'expanded'` the `value` itself must be written expanded. `npm run check` verifies this.

## Good distractors, hints and solutions
- **Distractors = typical mistakes**, most important first: forgot the square root (c² instead
  of c), added instead of squared (a + b), subtracted instead of added, mixed up leg and
  hypotenuse, added numerators AND denominators (1/2 + 1/3 = 2/5), forgot to halve, wrong unit
  (cm instead of cm²). `choice()` removes duplicates and values equal to the answer; give a
  `fallback` when your mistake list may be too short.
- **Hints** nudge without giving the answer: name the formula or the first step.
- **Solutions** are the worked steps (3–5 entries), each one short; the last states the result in
  bold with the unit. Use the generated numbers. They are shown after a wrong answer.
- Every generator needs `hint` and `solution`.

## Difficulty levels
- **1** — direct application, small whole numbers, standard figure orientation.
- **2** — less friendly numbers (roots, decimals, fractions), varied labels/orientation, reverse questions.
- **3** — word problems, two-step problems, combining with earlier knowledge.
The mini test mixes levels (5–8 items, pass mark 80 % by default).

## Figures
A figure is a plain object `{ type: '…', … }`. **The full parameter documentation is in
`src/figures/types.ts`** (every field has a comment). Browse all types with examples and
copy-paste code in the gallery: `npm run dev` → `http://localhost:5173/#/dev/gallery`.
Figure labels are plain text (Unicode: `α β γ √ π ² ³ ·`), not LaTeX. Lower-case single letters
are drawn italic automatically (variables), numbers + units upright.

**Make figures follow the generated numbers:** build the figure inside `generate()` from the same
variables (`legs: [a, b]`, `r`, `h` …) — the library keeps true proportions. If a figure cannot
follow the numbers (e.g. extreme ratios), set `notToScale: true`.

| type | status | copy-paste example |
|---|---|---|
| `geometry` | ready | `{ type: 'geometry', points: { A: [0, 0], B: [4, 0], C: [0, 3] }, items: [{ kind: 'polygon', points: ['A', 'B', 'C'], sideLabels: ['c', 'a', 'b'], fill: true }, { kind: 'angle', vertex: 'A', from: 'B', to: 'C', right: true }] }` — items: point, segment, ray, line, polygon, circle, arc, sector, angle, parallel, height, squareOnSide, label, region |
| `triangle` | ready | `{ type: 'triangle', legs: [3, 4], sideLabels: { a: '3 cm', b: '4 cm', c: 'c = ?' }, highlight: ['c'] }`; also `sides: [a, b, c]`, `coords`, `vertices`, `angleLabels`, `heights`, `medians`, `ticks`, `squares` |
| `quadrilateral` | ready | `{ type: 'quadrilateral', shape: 'rhombus', e: 8, f: 6, diagonals: { e: 'e', f: 'f' } }`; shapes: square, rectangle, rhombus, parallelogram, trapezoid, deltoid |
| `regularPolygon` | ready | `{ type: 'regularPolygon', n: 6, side: 4, sideLabel: 'a', center: true, radius: 'r' }` |
| `circle` | ready | `{ type: 'circle', r: 3, radius: 'r', sector: { angle: 60, label: '60°' } }` |
| `coordinate` | ready | `{ type: 'coordinate', x: [-1, 6], y: [-1, 5], points: [{ at: [1, 1], label: 'A' }, { at: [5, 4], label: 'B' }], distances: [{ from: [1, 1], to: [5, 4], labels: { dx: '4', dy: '3', d: 'd = ?' } }] }`; functions: `{ kind: 'linear', k: 2, n: 1, label: 'y = 2x + 1' }`, `{ kind: 'inverse', k: 6 }` |
| `numberLine` | ready | `{ type: 'numberLine', min: 0, max: 2, step: 1, subdivisions: 4, fractionDenominator: 4, points: [{ value: 0.75, label: 'A' }] }` — also `tickLabels: 'major'|'all'|'ends'|'none'|[values]`, `points[].open` (hollow) / `below`, `intervals: [{ from, to, fromClosed, toClosed, label }]` (±Infinity = ray), `jumps: [{ from, to, label }]` (addition/subtraction arcs; overlapping jumps are drawn taller). |
| `solid` | ready | `{ type: 'solid', shape: 'cylinder', r: 3, h: 7, labels: { r: 'r = 3 cm', h: 'H = 7 cm' } }` — shapes: `cube` (a), `cuboid` (a, b, c), `prism` / `pyramid` (`base`: 'triangle', 'square', 'rectangle' + b, 'hexagon', 'regular' + n; a, h), `cylinder` / `cone` (r, h), `sphere` (r). `labels` / `show` / `highlight` take segment keys: a, b, c, h (height of the solid; dashed axis with a right-angle marker for pyramids/cones), r, d, s (cone generator / pyramid face height), edge (pyramid lateral edge), spaceDiagonal, faceDiagonal = baseDiagonal, apothem — labelling a key also draws it; asking for a key the shape does not have is a clear error. `triangle`: 'axial' (cone: r, H, s · pyramid: apothem, H, s), 'edge' (pyramid: half base diagonal, H, lateral edge), 'diagonal' (cuboid/cube/even prism: base diagonal, edge, space diagonal), 'face' (cuboid: a, b, base diagonal) — filled in the highlight color with a right-angle marker, exact for Pythagoras in 3D. `vertexLabels: true` (cuboid A–D bottom, E–H top; pyramid apex V) or your own list; `fill: false` for no tint. Oblique projection (depth up-right, halved), hidden edges dashed, true proportions. |
| `net` | ready | `{ type: 'net', of: 'cylinder', r: 2, h: 5, labels: { r: 'r', h: 'H', a: '2rπ' } }` — `of`: `cube` (a; labels a), `cuboid` (a, b, c), `triangularPrism` (a = edge of the equilateral base, h; labels a, h), `squarePyramid` (a, s = height of a side face, s > a/2; labels a, s — s is drawn dashed with its right angle), `cylinder` (r, h; labels r, h, a = the long side 2rπ), `cone` (r, s, r < s; sector angle 360°·r/s; labels r, s). Folds dashed, bases tinted stronger (`colorFaces: false` → one tint). True proportions. |
| `barChart`, `lineChart` | ready | `{ type: 'barChart', categories: ['H', 'K', 'Sze'], series: [{ values: [3, 5, 2] }], yLabel: 'tanulók száma', showValues: true }` — several `series` (with `name`) get a legend; `horizontal: true` for long names; `yMin`/`yMax`/`yStep` for the value axis (lineChart: `yMin` zooms in, drawn with an axis break); negative values work; long or many category names wrap or turn vertical (12 months: 'jan.', 'febr.' …). |
| `pieChart` | ready | `{ type: 'pieChart', slices: [{ label: 'labdarúgás', value: 10 }, { label: 'úszás', value: 5 }] }` — `show: 'percent'` (default, 1 decimal) / `'value'` / `'label'` / `'none'`; small slices labelled outside with a leader line; legend (off with `legend: false`); at most 8 slices without own colors. |
| `pictogram` | ready | `{ type: 'pictogram', rows: [{ label: '5.a', value: 25 }], unit: 10, unitLabel: 'tanuló', symbol: 'person' }` — symbols circle, square, star, person, heart; a remainder is a cut symbol; `showValues` writes the numbers. |
| `table` | ready | `{ type: 'table', header: ['Jegy', '1', '2', '3', '4', '5'], rows: [['Gyakoriság', 1, 4, 7, 9, 5]], rowHeaders: true, highlight: [[0, 4]] }` — numbers get a decimal comma; '' = empty cell. |
| `fractionModel` | ready | `{ type: 'fractionModel', shape: 'circle', parts: 4, shaded: 3, label: '3/4' }` — shapes `circle` (pizza), `bar` (chocolate), `rect` (grid, `rows` optional); `shaded > parts` draws several wholes (improper fractions; label e.g. `'1 3/4'`); `color` default 'accent'. A label like '3/4' is drawn as a stacked fraction. |
| `barModel` | ready | `{ type: 'barModel', rows: [{ label: 'Anna', segments: [{ value: 70, label: 'a' }, { value: 50, label: 'b' }] }], total: { label: '120' } }` — szalagmodell for word problems: rows of pieces in true proportions (shared scale), `unknown: true` = dashed piece with '?', `braces: [{ row, segments: [i, j] or span: [x0, x1], label, side }]` for totals, parts and differences. |
| `construction` | ready | `{ type: 'construction', points: { A: [0, 0], B: [5, 0] }, intersections: { P: { circles: [['A', 3.5], ['B', 3.5]] } }, given: [{ kind: 'segment', from: 'A', to: 'B' }], steps: [{ caption: 'Körzővel ívet rajzolunk…', items: [{ kind: 'compass', center: 'A', through: ['P'] }] }] }` — the student taps through the steps (new items are animated). `intersections` computes points from circles/lines (`pick: 'above'|'below'|'left'|'right'` or `near`), `compass` draws an arc (or a full circle without `through`), every geometry item works in a step, `numberLine` adds a number line (√2 constructions). Full example in `src/figures/types.ts` and the gallery. |

Colors (theme-aware, never hex): `'ink'` (default), `'accent'` (topic color), `'highlight'`
(the unknown / key segment), `'muted'`, `'good'`, `'bad'`, `'blue'`, `'green'`, `'orange'`,
`'purple'`, `'red'`, `'teal'`.

Hungarian notation: triangle sides a = BC, b = CA, c = AB; angles α, β, γ; right angle at C;
legs "befogó", hypotenuse "átfogó"; height m; area T; perimeter K; rhombus diagonals e, f;
circle center O, radius r; solids (grade 8): r, H (height of the solid), B (base area),
M (lateral surface), P (surface area), V (volume) — see `DECISIONS.md`.

## Prerequisites
By default a subtopic requires every earlier subtopic of its topic and every subtopic of the
earlier topics (a topic can narrow that with its own `prerequisites` list of topic ids). If a
lesson only depends on specific lessons, add to its entry in topics.json:
`"prerequisites": ["g7-pitagorasz-01", "g7-valos-szamok-02"]` (ids may be in other topics;
`[]` = no prerequisites). Subtopics still `todo` never block anything.

## Checklist before `"status": "done"`
- [ ] `npm run check` prints **no errors** for this subtopic (and no unexplained warnings).
- [ ] `npm run build` succeeds.
- [ ] The scope in `CONTENT_STATUS.md` is fully covered; goals match the content.
- [ ] Theory → checks → examples → practice L1 → L2 → L3; mini test 5–8 items with mixed levels.
- [ ] Every generator has levels, hint, solution; answers computed by code; figures follow the numbers.
- [ ] Distractors are typical mistakes, no duplicates.
- [ ] Math verified **by hand** on at least 3 seeds per generator and level (/dev sample viewer).
- [ ] Played through in the browser at phone width (`#/dev/preview/<id>`), light and dark mode.
- [ ] Natural Hungarian, decimal comma, short sentences, no textbook text copied.
- [ ] `npm run status` run, CONTENT_STATUS.md updated; one commit for this subtopic.
