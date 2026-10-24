# Grade 5 textbook materials: structure and style notes

Source: 14 screenshots in `materials/grade-5/`. The textbook is *Matematika 5 – az általános
iskola ötödik osztálya számára* by Siniša Ješić, Aleksandra Rosić, Jasna Blagojević and Tanja
Njaradi, in Hungarian translation. The screenshots come from its **digital (interactive) edition**:
pages have round back/forward arrow buttons, some example tabs carry a mouse-cursor "click me"
icon (animated or interactive examples), and the main menu has an "Interaktív tesztek" entry.

Structure only: no textbook text or exercises are reproduced here or anywhere in the app.

## (a) Topic / subtopic structure

Short names: `12-24-45` = `Screenshot from 2026-10-24 12-24-45.png`, and so on.

### Main table of contents: `12-24-45` (cover + chapter menu)

1. Természetes számok és az oszthatóság – első rész
2. Mértani alapfogalmak
3. Természetes számok és az oszthatóság – második rész
4. Törtek – első rész
5. Szögek
6. Törtek – második rész
7. Tengelyes tükrözés
8. Törtek – harmadik rész
9. ~~Interaktív tesztek~~ **excluded.** It is the textbook's quiz section, not a learning unit.

### Chapter subtopic lists

Every chapter has a visible subtopic list, so **no subtopic is inferred**. The textbook writes
N₀ as an italic N with a subscript 0. In the JSON titles it is the Unicode `N₀`.

**1. Természetes számok és az oszthatóság – első rész** (`12-25-47`; chapter colour: dark green)
1. A természetes számok halmaza
2. Halmazműveletek
3. Számtani műveletek az N₀ halmazon
4. Matematikai kifejezések
5. Hozzárendelés és függő mennyiségek
6. Egyenletek az N₀ halmazon
7. Egyenlőtlenségek az N₀ halmazon

**2. Mértani alapfogalmak** (`12-28-33`; chapter colour: crimson / dark red)
1. A pont, az egyenes és a sík
2. Az egyenesek kölcsönös helyzete a síkban. A sík részei
3. A szakaszok mérése. A szakaszok egyenlősége
4. Körvonal és kör
5. A középpontos tükrözés
6. Vektorok. A párhuzamos eltolás. The page header on `12-29-28` drops the article
   ("Vektorok. Párhuzamos eltolás"); the JSON uses the TOC form.

**3. Természetes számok és az oszthatóság – második rész** (`12-29-59`; dark green)
1. Oszthatóság az N₀ halmazon
2. Oszthatóság meghatározott számokkal
3. Prímszámok és összetett számok
4. Közös osztó. A legnagyobb közös osztó
5. Közös többszörös. A legkisebb közös többszörös

**4. Törtek – első rész** (`12-30-30`; chapter colour: navy blue)
1. A tört fogalma. A törtek fajtái
2. Törtek bővítése és egyszerűsítése
3. A tört tizedes alakja
4. Törtek a számegyenesen
5. Törtek összehasonlítása
6. A szám közelítő értéke. Kerekítés

**5. Szögek** (`12-30-51`; chapter colour: orange)
1. A szög fogalma. A szög elemei és jelölése
2. Középponti szög. Szögek egyenlősége. Szögek összehasonlítása
3. Csatlakozó szögek. Szögek összeadása és kivonása szerkesztéssel
4. A mellékszögek. A szögek fajtái
5. Szögek mérése
6. Csúcsszögek. Két egyenes által bezárt szög
7. Párhuzamos egyenesek transzverzálisa. Párhuzamos szárú szögek

**6. Törtek – második rész** (`12-31-08`; navy blue)
1. Törtek összeadása és kivonása
2. Egyenletek és egyenlőtlenségek törtek összeadásával és kivonásával
3. Törtek szorzása és osztása
4. Egyenletek és egyenlőtlenségek törtek szorzásával és osztásával

**7. Tengelyes tükrözés** (`12-31-27`; chapter colour: plum / magenta)
1. A tengelyes tükrözés fogalma
2. Tengelyesen tükrös alakzatok a síkban
3. A szakasz felezőmerőlegese. Merőleges egyenesek
4. A szögfelező
5. Tengelyes tükrözés, középpontos tükrözés és párhuzamos eltolás

**8. Törtek – harmadik rész** (`12-31-59`; navy blue)
1. Százalék
2. Számtani közép
3. Az arány

**Total: 8 topics, 43 subtopics.** No "Ismétlés / Összefoglalás / Gyakorlás / Felmérő" items
appear in the chapter lists. The only exclusion is "Interaktív tesztek" from the main menu.

### Section level below subtopics (from the sample pages)

Some sample pages show how a subtopic is split into sections. These are **not** separate app
subtopics, but they show what the lesson covers and are worked into the `scope` notes.

- **T1 › 01 A természetes számok halmaza** (`12-26-31`, the section menu of the lesson):
  Természetes számok. Számhalmazok (with a "Példák" sub-item) · A számegyenes. A számok
  összehasonlítása · Az N és az N₀ halmazok · A halmaz részhalmaza · A halmazok egyenlősége ·
  A halmaz megadása elemeinek meghatározó tulajdonsága alapján.
  `12-27-13` is the "A halmaz részhalmaza" section of this lesson.
- **T1 › 06 Egyenletek az N₀ halmazon** (`12-27-36`): four sections on equations where the unknown
  is one addend; the minuend or the subtrahend; one factor; the dividend or the divisor. (The page
  has a missing space, "ismeretlenaz", fixed here.)
- **T1 › 07 Egyenlőtlenségek az N₀ halmazon** (`12-28-07`): one section is "Az összeg változása.
  Összeadással kapcsolatos egyenlőtlenségek". By analogy, the lesson probably also has sections on
  how differences, products and quotients change, with matching inequalities. That part is
  inferred.
- **T2 › 06 Vektorok. A párhuzamos eltolás** (`12-29-28`): the section "Vektor" (vector,
  direction, orientation, magnitude, equal and opposite vectors), presumably followed by the
  translation itself.

## (b) Sample / style pages

There are five style pages: `12-26-31`, `12-27-13`, `12-27-36`, `12-28-07` and `12-29-28`. The
other nine screenshots are TOC pages: `12-24-45` is the cover with the chapter menu, and the rest
are chapter title pages with subtopic lists.

### Shared layout and visual language (all sample pages)

- **Chapter colour coding.** Each chapter has one accent colour, used for the title band of the
  chapter page, lesson headings, the round back/forward arrow buttons, the thin rule along the top
  and bottom, the running header (top right, lesson name in accent colour), and the example tabs.
  Green = natural numbers, crimson = geometry basics, navy = fractions, orange = angles,
  plum = axial reflection.
- **Typography.** Headings and body text in a classic book serif; lesson titles bold in the accent
  colour, section titles bold black. Example tabs ("13. példa:") are white bold sans-serif on a
  filled accent-colour rectangle. Chapter openers have a short motivational paragraph in accent
  colour, sans-serif.
- **Boxes.**
  - *Definition / rule boxes*: flat pale tinted background (sage green in the green chapters, pale
    rose in the crimson chapter, light grey for rules), centred text, key terms in **bold**.
  - *Side notes*: pale yellow boxes with short "remember this" remarks about notation or
    conventions (what a variable is, that the multiplication dot may be omitted, how to draw a
    vector).
  - *Highlighted rule*: white box with a thin accent-colour (red) border, for a one-sentence summary.
  - *Carousel*: an example in a rounded red-bordered box with dot pagination (one active red dot,
    grey ones), i.e. a multi-step example shown one step at a time. This maps directly onto the
    app's tap-to-reveal worked examples.
- **Example flow.** Examples are numbered continuously across the chapter ("13. példa", "14.
  példa", …). Each states the task, then a bold "Megoldás:" whose content is hidden until opened.
  Some example tabs are only titles with a cursor icon, which are animated or interactive.
- **Illustrations.** Lesson openers use friendly cartoon illustrations (a child explorer with
  binoculars, lions) or simple clip-art (digital kitchen scales showing a mass). There is no
  mascot inside the lessons. (The cover's mascot is the publisher's; don't reuse it.)

### `12-26-31`: lesson opener, "A természetes számok halmaza"

- Cartoon scene top left; two short paragraphs top right in green sans-serif motivate counting
  and comparing quantities with a story about animals and people.
- Green serif lesson title, then a menu of the lesson's sections (bold serif, indented, one
  sub-item "Példák"). Each section is short and focused.
- Tone: storytelling, everyday-life hook before any definition.

### `12-27-13`: content page, "A halmaz részhalmaza" (green chapter)

- **Definition box** (sage green): defines subset, then how to *read* the notation aloud, then
  the reverse notation (superset) and the "not a subset" symbol. Pattern: definition → symbol →
  how to read it → negation.
- **Venn diagram**: a large green ellipse labelled B (green letter) and a small orange circle
  labelled A (orange letter) inside it, outlines only, no fill. The caption "A ⊂ B" colours each
  letter like its shape. Colour-matching labels to shapes is a convention worth copying.
- **Examples**: a set with one unknown element x (find the possible values); "every set is a
  subset of itself"; the set of two-digit numbers with digit sum 9; finding an unknown element;
  the even and odd numbers as subsets of N written with a general element (2n and 2n − 1); listing
  **all** subsets of a 3-element set and counting them.
- **Notation**:
  - Sets are italic capitals (A, B, S, P, N), elements in braces separated by ", " and "..." for
    "and so on".
  - Symbols: ∈, ⊂, ⊃, ⊄.
  - **N** for the natural numbers is a plain italic capital (not blackboard bold), N₀ with a
    subscript zero.
  - Variables are italic (x, n).
  - Multiplication is the centred dot with spaces, "2 · n", and a side note says the dot may be
    dropped: "2n".
  - The set of all natural numbers is written with a generic element, e.g. {2, 4, 6, ..., 2n, ...}.
- **Tone**: precise but plain; tasks are imperatives in the 2nd person singular ("Határozd meg
  …!", "Hány … van?"), exposition sometimes in the 1st person plural ("kiválaszthatjuk").

### `12-27-36`: lesson opener, "Egyenletek az N₀ halmazon" (green chapter)

- Starts with a **real-life story problem** (a mass of gold shared equally among bracelets),
  illustrated with two kitchen scales showing the same mass. The story leads to an equation with
  unknown x, written "x · 6 = 150".
- Definition box (sage green) defines *egyenlet* and *az egyenlet megoldása*, both bold.
- "Let's recall …" (1st person plural) leads into four sections by role of the unknown: addend;
  minuend/subtrahend; factor; dividend/divisor. **Students solve equations by the inverse-operation
  relation of the unknown's role, not by "transposing" terms.** Generated solutions in the app
  should use the same reasoning (e.g. "unknown factor = product : known factor").
- Units: number, space, unit symbol ("150 g").

### `12-28-07`: content page, "Az összeg változása. Összeadással kapcsolatos egyenlőtlenségek" (running header: Egyenlőtlenségek az N₀ halmazon)

- Rules in **light grey boxes**, in words: what happens to a sum when one addend grows or shrinks
  by n, and when one grows and the other shrinks by n.
- **Bar models (tape diagrams)** under each rule: stacked horizontal bars, **blue** for a, **red**
  for b, **green** for n, with white italic labels inside (a, b + n, a + b, n). A bracket under the
  bars points to the formula in a grey box, e.g. "a + (b + n) = (a + b) + n" or "(a + n) + (b − n)
  = a + b". This is a good template for an app figure type.
- **Exercise formats**:
  - Solve a simple inequality with an unknown addend.
  - A money story (dinárs) where the student picks the matching inequality from a **bordered table
    of four options labelled a)–d)**: "circle the letter of the correct answer" (multiple choice
    with very similar distractors that differ in the inequality sign: <, ≤, >, ≥).
  - A sticker story with "at most / at least" wording.
  - Interactive examples on evaluating expressions and on everyday problems.
- **Notation**:
  - Inequality signs <, >, ≤, ≥ with spaces.
  - **Thousands separated by a space**: "2 700".
  - Names of Hungarian children (Sanyi, Szilárd).
  - Brackets ( ) around sub-expressions.

### `12-29-28`: content page, "Vektor" (running header: Vektorok. Párhuzamos eltolás; crimson chapter)

- **Definition boxes in pale rose.** Each box has a **figure to its right inside a dotted-border
  frame**. Key terms bold (irányított szakasz, vektor, iránya, irányítása, nagysága, ellentettje,
  ellentett vektorok).
- **Figures**:
  - Thin black lines.
  - A vector is a segment with a **small filled dot at the start and an arrowhead at the end**.
  - Points are labelled with italic capital letters (A, B, M, N); lines with italic lowercase
    letters and **subscripts** (p₁, p₂).
  - One vector is **highlighted in red** on a carrier line, with a parallel black line beside it.
  - Labels sit next to the object, not on it.
  - A pale yellow side note states the drawing convention (dot at the start, arrow at the end).
- **Notation**:
  - Vector as an arrow over two capital letters (AB with →) or over a lowercase letter (v with →).
  - Magnitude in absolute-value bars: |v→| = |MN|. The **same |MN| notation means the length of a
    segment**.
  - Parallel lines written "p₁ ∥ p₂".
  - Opposite vectors: AB→ and BA→.
- Summary sentence in a white box with a red border. Interactive examples: comparing vectors by
  direction, orientation and magnitude; finding vectors.

### What the samples do NOT show (infer, mark as convention)

- **Fractions and decimals.** No sample page shows them. Use Hungarian/Serbian school conventions:
  stacked fractions with a horizontal bar in display (inline "3/4" only as typed input), a
  **decimal comma** (0,5), mixed numbers as a whole number next to a stacked fraction, and the
  colon ":" as the division sign in running text (the program and Hungarian schools use ":"; the
  "÷" sign is not used).
- **Angles.** No sample page shows them. The curriculum says to label angles with small Greek
  letters (α, β, γ, δ); the vertex is a capital letter; the three-letter notation has the vertex
  in the middle (∢AOB is common in Serbian/Vojvodina textbooks). Degrees, minutes, seconds as
  35°48′20″.
- **Units.** Space between number and unit, SI symbols (mm, cm, dm, m, km, g, kg, l); money in
  "dinár" (abbreviated "din").

### Takeaways for the app's style

- Short definition cards with bold key terms, a "how to read the symbol" line, and an optional
  yellow "tipp" note, which is the textbook's pattern.
- Open each lesson with a 1–2 sentence everyday hook (food, money in dinárs, sport, animals).
- Worked examples numbered and revealed step by step (the textbook's carousel).
- Figures: thin dark strokes, one highlighted element in an accent colour (red/orange), outlines
  rather than fills for Venn diagrams, colour-matched labels, dashed lines for auxiliary elements
  (standard; not shown on these pages), a dotted frame or card around figures.
- Bar models (coloured tape diagrams) are worth adding as a figure type for operations,
  equations, inequalities and fractions.
- Multiple-choice options labelled a), b), c), d); distractors that differ in one detail (the
  direction of an inequality sign, the role of an operand).
