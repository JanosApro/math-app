# Grade 7: what the textbook screenshots show

Source folder: `materials/grade-7/`, 8 PNG screenshots of a Hungarian-language digital textbook
(Serbian curriculum). There are 6 chapter-opener pages listing the lessons, 1 lesson-opener page
and 1 page of worked examples.

> Titles below are transcribed exactly as structural data. **No textbook explanations or exercises
> are reproduced here or anywhere in the app.** Style notes are descriptions only.

## (a) Topic and subtopic structure

Each chapter opener has a full-width colored band with the chapter title in white, bold, uppercase
serif type. Below it, on a pale grey geometric background, the lesson titles are listed in a plain
serif font. There are no numbers. The band colors were sampled from the screenshots and work well
as each topic's color in the app.

### 1. Valós számok
Screenshot: `Screenshot from 2026-10-24 12-32-54.png`. Band color: dark green `#0E6931`.

1. A racionális szám négyzete
2. Négyzetgyök
3. *R*, a valós számok halmaza. The "R" is italic in the book. We store it as plain "R".
4. A valós szám közelítő értéke
5. Számtani műveletek valós számokkal
6. Az egyenes arányosság függvénye
7. A kibővített arány

The lesson opener in `Screenshot from 2026-10-24 12-33-43.png` lists three **internal sections**
of lesson 7. These are not separate subtopics:
- the definition and properties of the extended ratio;
- the extended ratio of directly and inversely proportional quantities;
- worked examples that turn an extended ratio into simple ratios.

They are used in that subtopic's `scope`.

### 2. Pitagorasz tétele
Screenshot: `Screenshot from 2026-10-24 12-34-02.png`. Band color: magenta/raspberry `#B74B80`.

1. A Pitagorasz-tétel bizonyítása és alapszintű alkalmazása
2. A Pitagorasz-tétel alkalmazása szerkesztéseknél
3. A Pitagorasz-tétel alkalmazása négyzetre és téglalapra
4. A Pitagorasz-tétel alkalmazása egyenlő szárú és egyenlő oldalú háromszögre
5. A Pitagorasz-tétel alkalmazása rombuszra és trapézra
6. Pontok egymástól való távolsága a koordináta-rendszerben

This matches the list the teacher gave in PROMPT.md exactly.

### 3. Algebrai egész kifejezések
Screenshot: `Screenshot from 2026-10-24 12-34-37.png`. Band color: navy `#242E7D`.

1. Hatványok – a hatványkitevő természetes szám (the dash is an en dash)
2. A tízes egység egész kitevőjű hatványa
3. Algebrai egész kifejezések
4. Műveletek monomokkal
5. Műveletek polinomokkal
6. A binom négyzete
7. Négyzetek különbsége
8. Polinomok tényezőre bontása

### 4. Sokszögek
Screenshot: `Screenshot from 2026-10-24 12-34-57.png`. Band color: orange-red `#E94F2A`.

1. A sokszög fogalma és elemei
2. A háromszög magasságpontja és súlypontja
3. Háromszögek és négyszögek szerkesztése
4. Szabályos sokszögek
5. Szabályos sokszögek szerkesztése
6. Szabályos sokszögek kerülete és területe

The sample page `12-37-17` belongs to lesson 6. Its running header reads "A szabályos sokszög
kerülete és területe" (singular), but the chapter list uses the plural. We use the chapter-list
title.

### 5. A kör
Screenshot: `Screenshot from 2026-10-24 12-37-41.png`. Band color: crimson `#B61F34`.

1. A középponti és kerületi szög
2. A kör kerülete. A körív hossza
3. A kör területe. A körcikk és a körgyűrű területe
4. Elforgatás

### 6. Adatfeldolgozás
Screenshot: `Screenshot from 2026-10-24 12-38-15.png`. Band color: purple `#823B8F`.

1. Adatok fajtái és ábrázolásuk
2. Adatfeldolgozás. It has the same name as the chapter. Its content is processing data sets:
   mean, median and mode.

### Notes on the structure

- **Excluded items:** none. No chapter list contains review, summary, practice or test entries
  ("Ismétlés", "Összefoglalás", "Gyakorlás", "Felmérő"). The only things left out of the subtopic
  list are the three internal sections of *A kibővített arány* described above.
- **Inferred subtopics:** none. Every chapter has a visible lesson list, so every subtopic has
  `source: "screenshot"`.
- **Completeness:** every list ends with blank space or a decorative footer band, so the lists
  appear complete. The Algebra screenshot ends close to its last item, but the decorative bottom
  band is visible, so nothing seems to be cut off.
- **Totals:** 6 topics with 7 + 6 + 8 + 6 + 4 + 2 = **33 subtopics**.

## (b) Style of the sample pages

There are two style pages:
- `Screenshot from 2026-10-24 12-33-43.png`, a lesson opener (*A kibővített arány*);
- `Screenshot from 2026-10-24 12-37-17.png`, a page of worked examples (*Szabályos sokszögek
  kerülete és területe*).

Both come from an interactive, digital textbook with page-navigation buttons.

### 12-33-43: lesson opener for "A kibővített arány" (Valós számok)

- **Layout:**
  - small running header at the top left with the chapter name in the chapter's green and a thin
    green rule across the page;
  - lesson title in large bold green serif;
  - below it, the lesson's internal sections as an indented list of bold black serif lines;
  - a round pale-pink "back" button with a white chevron on the left edge.
- **Illustration:** a "concept card" at the top right.
  - A tilted pale-yellow note sheet (`#FAF1B9`) sits on a grey oval, like a photo of a notebook
    page.
  - It shows the general proportion **a : b = c : d**. The **outer terms (kültagok)** a and d are
    dark navy (`#242E7D`), and the **inner terms (beltagok)** b and c are red (`#CD1719`).
  - Each pair is joined by a bracket arrow in its own color, with a hand-lettered label in a
    Comic-style font.
  - A thick navy arrow points down to the product rule **a · d = b · c**, which keeps the same
    colors.
- **What this tells us:**
  - The book uses **color-coding to tie terms to their roles**, and repeats the same colors in the
    derived formula.
  - Multiplication is a **centered dot "·"**, and ratios use a colon ":" with spaces.
  - Variables are **italic serif**.
  - Informal, hand-lettered callouts sit next to formal italic math.
- **Tone:** the opener is short. It gives a title, a topic list and one visual that states the key
  idea at a glance.

### 12-37-17: worked-example page in "Szabályos sokszögek kerülete és területe" (Sokszögek)

- **Page chrome:**
  - running header at the top right with the lesson title in small orange (the chapter color);
  - a thin light-orange rule across the page;
  - round orange-red "previous" and "next" arrow buttons at the top left and bottom right.
- **Structure:**
  1. A one-sentence intro saying the next examples revisit the area of the equilateral triangle
     and the square.
  2. Three worked examples, each laid out the same way.
  3. A short connecting sentence.
  4. A boxed general rule.
  5. A third example applies the rule.
- **Example label:** "NN. példa:" in **white bold sans-serif on a filled orange-red rectangle**
  (`#E94F2A`, the chapter color). The examples are numbered continuously through the book (79, 80,
  81). The task text follows on the same line in a normal serif font.
- **Task format:**
  - The task starts with an imperative ("Számítsd ki … , ha:").
  - It has **three parts a), b), c)**, set side by side on one line with the part letters in
    italic. The parts end with ";" and the last one with "!" (or ".").
  - The parts give *different starting data for the same question*: (a) the side, (b) the
    inradius, (c) the circumradius. This **reverse direction** is a key way the difficulty
    ramps up.
  - Under the task is a bold "**Megoldás:**" label. The solution is collapsed or hidden in the
    screenshot, which fits the app's tap-to-reveal worked examples.
- **Notation conventions seen:**
  - Variables are italic serif (Times-like): *a* for the side, *n* for the number of sides,
    *T* for area.
  - **Area** is *T* with a subscript for the number of sides: T₃, T₄, T₆, Tₙ.
  - **Inradius is r_b** (beírt kör sugara) and **circumradius is r_k** (körülírt kör sugara). The
    book uses these subscripts, not r and R.
  - The **characteristic triangle** is written J with a subscript n (Jₙ), and its area as T(Jₙ).
  - The polygon name is written "n-szög".
  - Multiplication is the centered dot: Tₙ = n · T(Jₙ).
  - Fractions are stacked (1/4, 3/2) and placed before the variable part, e.g. ¹⁄₄·a²·√3 is
    written as a stacked fraction followed by a²√3. The coefficient comes first and the radical
    last.
  - **Roots** have the coefficient directly before the radical, with no dot: 2√3, 5√2.
  - **Units** are upright, with a space after the number: "6 cm", "2√3 cm". There is no unit in
    formulas.
  - The decimal comma doesn't appear on this page. It is the Hungarian convention anyway.
- **Key formulas:** these are shown in **pale-yellow filled boxes without a border** (`#FFF8BD`),
  next to the matching figure (T₃ = …, T₄ = a², T₆ = …).
- **General rules and theorems:** these are shown in a **centered box with a thin orange-red
  border** (chapter color) on white, as one or two lines of text with inline italic math.
- **Figures:**
  - Small, clean **line drawings in thin black strokes**, placed to the right of each example
    (equilateral triangle, square, regular hexagon).
  - **Vertices are small filled black dots.** There are no vertex letters here. Only the side
    label *a* appears, in italic, outside the midpoint of every side.
  - The center is a dot. Thin black segments join it to the vertices or to the side midpoints,
    which splits the polygon into its characteristic triangles.
  - **Auxiliary segments are color-coded and labeled in the same color:**
    - r_k (center to vertex) in **crimson/raspberry** `≈ #C4485A`;
    - r_b (center to side midpoint) in **olive green** `≈ #869033`.
  - In the hexagon, one characteristic triangle has both of its r_k sides and its r_b height
    colored, which highlights the triangle used in the computation.
  - There are **no right-angle markers** on r_b, even though it is perpendicular to the side.
    There are no dashed lines and no shading on this page.
  - Figures are drawn to true proportions and are not labeled "not to scale".
- **Tone and level of detail:**
  - Very concise and formal-but-friendly. It uses the second person singular ("Számítsd ki").
  - There is almost no prose. The page is driven by examples, with one sentence of framing
    before each block.
  - Formulas are given as reference boxes rather than derived at length on the page.

### Recommendations for the app (derived from the samples)

These are not seen directly in the samples where noted.

- **Topic colors:** use the six band colors above, adjusted for dark mode.
- **Example cards:** a filled topic-color label ("1. példa"), the task, a)–c) parts, then a
  "Megoldás" section revealed step by step.
- **Formula chips:** pale yellow (`#FFF8BD`-ish, a darker variant in dark mode), with no border.
- **Rule and theorem cards:** white with a thin border in the topic color.
- **Figures:**
  - thin dark strokes and dot vertices;
  - italic serif labels;
  - color-coded auxiliary segments with the label in the same color: one warm color (crimson) and
    one cool or olive color for the second kind;
  - highlight the triangle used in the computation;
  - per PROMPT.md §4a, heights and diagonals are dashed and right angles are marked. The sample
    page itself shows neither, so use them where they help.
- **Pythagoras notation:** not shown in the samples. Use the standard notation of Hungarian
  textbooks from Vojvodina:
  - legs (befogók) *a*, *b* and hypotenuse (átfogó) *c*, with the right angle at *C* (γ = 90°)
    and angles α, β, γ at A, B, C;
  - height *m* (m_a, m_b, m_c), area *T* and perimeter *K*;
  - square diagonal *d*; rhombus diagonals *e*, *f*; trapezoid bases *a*, *c*, legs *b*, *d* and
    height *m*;
  - in regular polygons, r_b and r_k as in the book.
- **Exercise formats:**
  - multi-part tasks that give "the same question from different data", including reverse tasks;
  - root answers written as k√n;
  - units after the number, separated by a space.
