# Grade 5 mathematics: official Serbian curriculum (summary)

This is a summary for content authors, so you don't have to look the curriculum up again. The app's
**structure follows the teacher's textbook** (see `docs/materials-grade-5.md` and
`src/content/grade-5/topics.draft.json`). This file says **what each topic must teach**.

## Source

- **Правилник о плану наставе и учења за пети и шести разред основног образовања и васпитања и
  програму наставе и учења за пети и шести разред основног образовања и васпитања**
  (Pravilnik o planu nastave i učenja za peti i šesti razred ... i programu nastave i učenja za peti
  i šesti razred ...), „Службени гласник РС – Просветни гласник”, бр. 15/2018. Amended 18/2018,
  3/2019, 3/2020, 6/2020, 17/2021, 16/2022, 13/2023, 14/2023, 3/2024, 6/2025, 1/2026. A school
  program for the 2026–2030 cycle still reproduces the 2018 mathematics text, so the amendments
  up to 6/2025 did not change it in substance.
  - Official register entry with the amendment history (Pravno-informacioni sistem, JavaScript page):
    https://pravno-informacioni-sistem.rs/eli/rep/pg/ministarstva/pravilnik/2018/15/2/reg
  - A school program (2026–2030 cycle) that copies the official outcomes, contents and key concepts
    word for word. This is the text the summary below is taken from:
    https://www.prvaskola.edu.rs/document/sk-26_30/matematika_5_sk.pdf
  - **New program from 2027/28:** Prosvetni glasnik 1/2026 (dated 26 Feb 2026) replaces the grade 5
    mathematics program. It **applies from the 2027/2028 school year**, so it does not affect the
    current year. See "Upcoming changes" at the end.
    https://zuov.gov.rs/preuzimanje/2281/prosvetni-glasnik-2026-1/603007/pg-2026-1-6-os5
- **Annual load:** 144 lessons (4 per week, 36 weeks).
- **Goal (cilj), paraphrased:** by mastering mathematical concepts, knowledge and skills, students
  develop the basics of abstract and critical thinking and a positive attitude toward math. They
  learn to communicate in mathematical language and notation, apply what they know in further
  schooling and everyday problems, and build a basis for later concepts.

## Topics and suggested hours

Hours are from the school program (one school's distribution, not mandated by the Pravilnik).

| # | Serbian (official) | Hungarian (textbook) | Hours (new + practice) |
|---|---|---|---|
| 1 | Природни бројеви и дељивост (Prirodni brojevi i deljivost) | Természetes számok és az oszthatóság (első + második rész) | 30 (14 + 16) |
| 2 | Основни појмови геометрије (Osnovni pojmovi geometrije) | Mértani alapfogalmak | 19 (10 + 9) |
| 3 | Угао (Ugao) | Szögek | 15 (7 + 8) |
| 4 | Разломци (Razlomci) | Törtek (első, második, harmadik rész) | 52 (25 + 27) |
| 5 | Осна симетрија (Osna simetrija) | Tengelyes tükrözés | 12 (5 + 7) |

The other 16 lessons go to review of earlier grades, the initial test (4) and written tests with
preparation and correction (12).

## Key concepts (ključni pojmovi) per topic

- **Prirodni brojevi i deljivost:** properties of divisibility, factors (činioci), multiples
  (sadržaoci), sets and set operations, prime and composite numbers, prime factorisation, LCM
  (NZS), GCD (NZD).
- **Osnovni pojmovi geometrije:** incidence and betweenness (odnos pripadanja i rasporeda),
  relative position of lines in the plane, parallelism, circle line (kružnica), disc (krug),
  transferring and joining segments, central symmetry, vectors, translation.
- **Ugao:** central angle, equality of angles, joining (adding) angles, supplementary adjacent
  angles (uporedni), complementary and supplementary angles, measure of an angle, perpendicular
  lines, vertical angles (unakrsni), angles at a transversal, angles with parallel arms.
- **Razlomci:** the concept of a fraction; expanding, simplifying and comparing fractions; decimal
  notation; mixed number; rounding; reciprocal; percent; arithmetic mean; ratio (razmera).
- **Osna simetrija:** axis of symmetry, axially symmetric figures, perpendicular bisector of a
  segment, angle bisector.

## Contents (sadržaji) and outcomes (ishodi) per topic

"The student will be able to: …" Outcomes are numbered here only for reference.

### 1. Prirodni brojevi i deljivost (HU: Természetes számok és az oszthatóság)

Contents, part 1: properties of +, −, ·, : in N₀; division with remainder in N₀
(a = b·q + r, 0 ≤ r < b); properties of divisibility; factors and multiples; divisibility by 2, 5
and decimal units (10, 100, …); by 4 and 25; by 3 and 9; sets and set operations: union,
intersection, difference.
Part 2: prime and composite numbers, sieve of Eratosthenes; prime factorisation; common divisor
and GCD, **Euclid's algorithm** for the GCD; common multiple and LCM; relation between GCD and LCM.

Outcomes:
1. evaluate a simpler numerical expression and solve a simple linear equation or inequality (in N);
2. solve a simple everyday problem using a numerical expression, a linear equation or an inequality (in N);
3. apply divisibility rules for 2, 3, 4, 5, 9, 25 and decimal units;
4. tell prime from composite numbers and factorise a number into primes;
5. find and apply the LCM and GCD;
6. perform union, intersection and difference of sets and use set notation correctly;
7. use the words *and, or, not, every* (HU: *és, vagy, nem, minden*) in the mathematical-logical sense.

Guidance: review N and N₀ (predecessor/successor) and the number line. Build the ideas of numerical
expression, variable, expression with a variable, assignment (pridruživanje), formula and statement
through everyday tasks; keep equations and inequalities **simple**. Show simple (function-like)
dependencies: number → number, number → segment, number → area, with tables and flowcharts.
Students should discover the divisibility rules for 10, 2, 5, 4, 25; guide them to 3 and 9 with
examples; connect rules (divisible by 10 ⇒ by 2 and 5). Stress application, not formalism. Sets:
listing vs. property, empty and infinite set, subset, equality of sets, Venn diagrams, sets of
divisors/multiples as a lead-in to GCD and LCM; logic words *every, some, or, and, not,
if … then*.

### 2. Osnovni pojmovi geometrije (HU: Mértani alapfogalmak)

Contents: points and lines, incidence and betweenness; lines in the plane, parallelism; measuring
length and equality of segments; circle line and disc, circle and line; transferring and joining
segments; central symmetry; vector and translation.

Outcomes:
1. analyse relations between given geometric objects and write them in mathematical notation;
2. describe the basic circle terms (centre, radius, tangent, chord) and find the position of a point and of a line relative to a circle;
3. draw a line parallel to a given line with geometry tools;
4. compare, add and subtract segments, by construction and by calculation;
5. map a given object by central symmetry and by translation;
6. use geometry tools correctly.

Guidance: move from visual geometry to analysis and informal deduction. Segment and ray, notation;
unique parallel through a point (drawn with ruler and set square); regions of the plane cut out by
lines, especially triangles and parallelograms. Units of length, multi-unit lengths converted to
the smallest unit; equal segments = equal lengths. Circle terms: centre, radius, diameter, arc,
chord, tangent; two circles on examples. Broken lines (open/closed) and the perimeter of a closed
broken line. Central symmetry and translation applied to points, segments, circles, triangles,
squares, rectangles; link their properties to the parallelogram. Vector: magnitude, direction,
orientation (HU: *nagyság, irány, irányítás*).

### 3. Ugao (HU: Szögek)

Contents: angle, central angle, equality of angles; joining angles (adjacent angles, comparing,
adding and subtracting angles by construction); supplementary adjacent angles (uporedni), kinds of
angles; measuring angles, adding and subtracting angle measures; angle between two lines,
perpendicular lines, vertical angles; angles at a transversal; translation and angles.

Outcomes:
1. identify kinds of angles and describe their properties (adjacent, uporedni, vertical, at a transversal, with parallel arms) and use the relations between them;
2. draw a line perpendicular to a given line with geometry tools;
3. measure a given angle and draw an angle of given measure;
4. compare, add and subtract angles by calculation and by construction;
5. solve a simple task with the basic properties of a parallelogram (opposite sides and opposite angles equal).

Guidance: angle = two rays with a common endpoint plus a region; only convex angles afterwards.
Label angles with **small Greek letters**. Equal angles via equal chords in circles of equal radius,
then copying angles with compass and ruler. Protractor skills; **minutes and seconds** and adding
and subtracting measures. Perpendicular from a point with a set square; tangent ⊥ radius; distance
of a point from a line. Angle between non-perpendicular lines = the acute one. Transversal of two
parallels: all acute angles equal, all obtuse angles equal. Parallelogram: opposite angles equal;
distance between parallel lines; angles with parallel arms.

### 4. Razlomci (HU: Törtek)

Contents, part 1: fractions a/b (a, b ∈ N); points of the number ray for fractions; expanding,
simplifying and comparing fractions; decimal notation and conversion to a/b (b ≠ 0); comparing
decimals; rounding.
Part 2: the basic operations with fractions (in both notations) and their properties; expressions;
equations and inequalities with fractions.
Part 3: applications: percent, arithmetic mean, ratio; the basic inequality p < (p + q)/2 < q.

Outcomes:
1. read, write, compare and show fractions and decimals on the number ray, and convert between notations;
2. find the place value of a digit in a decimal;
3. round a number and estimate the rounding error;
4. evaluate a simpler numerical expression and solve a simple linear equation and inequality;
5. solve a simple everyday problem with a numerical expression, linear equation or inequality;
6. find a given percent of a quantity;
7. apply ratio in simple real situations;
8. apply the arithmetic mean of given numbers;
9. collect data and show it in a table and a **pie chart**, using a calculator or software if needed.

Guidance (difficulty notes that matter for generators):
- Proper and improper fractions and mixed numbers come first; converting mixed ↔ improper is tied
  to division with remainder.
- Number ray: varied examples, **denominators not greater than 10**, and the choice of unit
  segment matters.
- Expanding and simplifying rest on "the quotient doesn't change"; simplifying to lowest terms
  uses the GCD (stepwise is allowed but slower).
- Compare fractions with circle sectors or square-grid figures.
- Decimals: link to measuring length, mass and volume; start with fractions that convert to
  decimal fractions, then introduce **repeating decimals** (periodični decimalni zapis).
- Addition and subtraction use a common denominator, but **don't insist on the least one at first**.
- Show multiplication with an area model on a square grid. Teach the **reciprocal** before
  division; divide by a natural number first, then generalise: dividing by a fraction is
  multiplying by its reciprocal.
- Decimal operations work by analogy with natural numbers; divide a decimal by a natural number
  first, then reduce decimal ÷ decimal to that case.
- Expressions shouldn't be too complex. Equations and inequalities stay simple, by analogy with
  N₀ (these outcomes keep developing in later grades).
- Word problems are important, e.g. a household budget (financial literacy).
- Percent: visual models first (10×10 square, then rectangles, polygons, circles). Discounts and
  price rises, **first 25%, 50%, 75%**, then any percent. Also convert between fraction, decimal
  and percent.
- Mean: grades, sports, small investigations.
- Ratio: maps and plans, distances, dividing in a given ratio, enlarging and reducing pictures.
- The data outcome (table + pie chart) has no lesson of its own; it is practised across the topic.

### 5. Osna simetrija (HU: Tengelyes tükrözés)

Contents: axial symmetry in the plane and its properties; axis of symmetry of a figure;
perpendicular bisector of a segment and constructing a perpendicular; angle bisector.

Outcomes:
1. identify an axially symmetric figure and find its axis of symmetry;
2. reflect a point, a segment and a simpler figure with geometry tools;
3. construct the perpendicular bisector of a segment and the angle bisector, and apply their properties;
4. construct a line perpendicular to, or parallel to, a given line.

Guidance: start on a **square grid with axes along grid lines** so students discover the
properties, then move off the grid. Reflect points, segments, circles, triangles, squares and
rectangles. Teach symmetric figures intuitively, with figures that have one, several or no axes.
Construct the bisectors and the perpendicular from a point, and use their properties in problems.

## Where the textbook differs from the curriculum (the app follows the textbook)

- **Order is interleaved.** The textbook alternates arithmetic and geometry: Természetes számok I →
  Mértani alapfogalmak → Természetes számok II → Törtek I → Szögek → Törtek II → Tengelyes
  tükrözés → Törtek III. The curriculum lists the five themes in a block order.
- **Natural numbers split differently.** The curriculum puts divisibility rules, sets and
  divisibility properties in part 1 and primes/GCD/LCM in part 2. The textbook's **part 1 has
  no divisibility at all**: it covers sets, operations in N₀, expressions, dependent quantities
  (hozzárendelés), and equations and inequalities in N₀. **Part 2 has all of divisibility**:
  divisibility in N₀, the rules, primes, GCD, LCM.
- **"Hozzárendelés és függő mennyiségek"** has its own lesson in the textbook. In the curriculum it
  appears only in the guidance (simple functional dependencies, tables, flowcharts).
- **Equations and inequalities in N₀** have two lessons of their own in the textbook. The
  curriculum names them only in outcomes and guidance.
- **Complementary and supplementary angles** (pótszögek, kiegészítő szögek) and **parallelogram
  angle properties** are curriculum items with no subtopic title of their own in the textbook. They
  are folded into the scope of Szögek 04/05 and 07.
- **Data handling (table + pie chart)** has no textbook lesson. It is folded into the scope of
  *Százalék* (Törtek III, 01).
- **Number line vs. number ray.** The textbook says *számegyenes* (number line), the curriculum
  says *brojevna poluprava* (number ray). Grade 5 has no negative numbers, so use only the
  non-negative part.
- **Transformation synthesis.** Tengelyes tükrözés 05 compares reflection, point reflection and
  translation. The curriculum has central symmetry and translation in geometry basics and no
  explicit comparison lesson.

## Serbian ↔ Hungarian terminology (as used in Vojvodina Hungarian-language textbooks)

| Serbian | Hungarian | English |
|---|---|---|
| skup, element, podskup, prazan skup | halmaz, elem, részhalmaz, üres halmaz | set, element, subset, empty set |
| unija, presek, razlika | unió, metszet, különbség | union, intersection, difference |
| deljivost, delilac, sadržalac, činilac | oszthatóság, osztó, többszörös, tényező | divisibility, divisor, multiple, factor |
| prost / složen broj | prímszám / összetett szám | prime / composite |
| NZD / NZS | LNKO (legnagyobb közös osztó) / LKKT (legkisebb közös többszörös) | GCD / LCM |
| tačka, prava, ravan, duž, poluprava | pont, egyenes, sík, szakasz, félegyenes | point, line, plane, segment, ray |
| kružnica, krug, centar, poluprečnik, prečnik, tetiva, tangenta | körvonal, kör, középpont, sugár, átmérő, húr, érintő | circle line, disc, centre, radius, diameter, chord, tangent |
| centralna simetrija, translacija, vektor | középpontos tükrözés, párhuzamos eltolás, vektor | point reflection, translation, vector |
| ugao, krak, teme | szög, szár, csúcs | angle, arm, vertex |
| susedni / uporedni / unakrsni uglovi | csatlakozó szögek / mellékszögek / csúcsszögek | adjacent / supplementary adjacent / vertical angles |
| komplementni / suplementni uglovi | pótszögek / kiegészítő szögek | complementary / supplementary |
| oštar, prav, tup, opružen, pun ugao | hegyesszög, derékszög, tompaszög, egyenesszög, teljesszög | acute, right, obtuse, straight, full |
| normalne prave, transverzala | merőleges egyenesek, transzverzális | perpendicular lines, transversal |
| razlomak, brojilac, imenilac, mešoviti broj | tört, számláló, nevező, vegyes szám | fraction, numerator, denominator, mixed number |
| pravi / nepravi razlomak | valódi tört / áltört | proper / improper fraction |
| proširivanje, skraćivanje | bővítés, egyszerűsítés | expanding, simplifying |
| decimalni zapis, zaokrugljivanje | tizedes alak (tizedes tört), kerekítés | decimal notation, rounding |
| recipročna vrednost | reciprok érték | reciprocal |
| procenat, aritmetička sredina, razmera | százalék, számtani közép, arány | percent, arithmetic mean, ratio |
| osna simetrija, osa simetrije | tengelyes tükrözés, szimmetriatengely (tükörtengely) | axial reflection, axis of symmetry |
| simetrala duži / simetrala ugla | a szakasz felezőmerőlegese / szögfelező | perpendicular bisector / angle bisector |

## Upcoming changes (program valid from 2027/28, Prosvetni glasnik 1/2026)

These are for later. The current textbook and app follow the 2018 program.
- Themes: Prirodni brojevi i deljivost; Osnovni pojmovi geometrije; Razlomci; Ugao; **Osna i
  centralna simetrija**. Central symmetry moves into the symmetry theme, which adds a "centrally
  symmetric figure" and its centre of symmetry.
- **Vectors and translation are no longer listed** for grade 5. Neither are Euclid's algorithm,
  the GCD–LCM relation, the basic inequality of the mean, "translation and angles" or the
  parallelogram outcome.
- Additions: the midpoint of a segment as a construction; data shown in a **pie or bar chart**;
  using drawing/construction software; fractions a/b with a ∈ N₀; process outcomes (reasoning,
  modelling, project work).
- If the teacher switches textbooks in 2027/28, revisit `topics.json` for grade 5.
