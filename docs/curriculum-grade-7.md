# Grade 7 mathematics: official Serbian curriculum (summary)

This is a summary for content authors, so you don't have to look the curriculum up again. The app's
**structure follows the teacher's textbook** (see `docs/materials-grade-7.md` and
`src/content/grade-7/topics.draft.json`). This file says **what each topic must teach**.

## Source

- **Правилник о програму наставе и учења за седми разред основног образовања и васпитања**
  (Pravilnik o programu nastave i učenja za sedmi razred osnovnog obrazovanja i vaspitanja),
  „Службени гласник РС – Просветни гласник”, бр. 5/2019. Amended 1/2020, 6/2020, 8/2020, 5/2021,
  17/2021, 16/2022, 13/2023, 14/2023 and 6/2025. The amendments did not touch the mathematics
  program in substance: a school program for the 2026–2030 cycle repeats the same outcomes and
  contents.
  - Full text of the Pravilnik (mathematics is on pp. 152–161 of the PDF):
    https://edumedia-depot.gei.de/bitstreams/dce58ee0-8188-4a45-bac5-e70353e69d53/download
  - ZUOV list of regulations with the publication and amendment history (item 9):
    https://zuov.gov.rs/wp-content/uploads/wpfd/preview_files/2.-Основно-образовање-и-васпитање(78de269b6866c12394c883d83d5c41a7).pdf
  - A school program (2026–2030) that copies the official outcomes and contents:
    https://www.prvaskola.edu.rs/document/sk-26_30/matematikaa_7_sk.pdf
- **Annual load:** 144 lessons (4 per week).
- **Goal (cilj), paraphrased:** through mathematical concepts, knowledge and skills, students develop
  the basics of abstract and critical thinking and a positive attitude toward math. They learn to
  communicate in mathematical language and notation, and to apply what they know in further
  schooling and in everyday problems.
- **Key concepts (ključni pojmovi):** real number, power, square root, Pythagorean theorem,
  polynomial, polygon, orthocenter and centroid, circle, the number π, rotation, mean.

## Topics, suggested hours and suggested order

| # | Serbian (official) | Hungarian (textbook) | Hours (total; new + practice) |
|---|---|---|---|
| 1 | Реални бројеви (Realni brojevi) | Valós számok | 21 (8 + 13) |
| 2 | Питагорина теорема (Pitagorina teorema) | Pitagorasz tétele | 19 (6 + 13) |
| 3 | Цели алгебарски изрази (Celi algebarski izrazi) | Algebrai egész kifejezések | 48 (19 + 29) |
| 4 | Многоугао (Mnogougao) | Sokszögek | 21 (9 + 12) |
| 5 | Круг (Krug) | A kör | 18 (7 + 11) |
| 6 | Обрада података (Obrada podataka) | Adatfeldolgozás | 5 |

The remaining hours are 4 for review and the initial test, and 8 for four written tests with
their corrections.

**Suggested order (not mandatory):** Real numbers → Pythagoras → Algebra *part 1 (powers)* →
Polygons → Algebra *part 2 (polynomials)* → Circle → Data. The algebra topic is split so that
algebra and geometry alternate. **The textbook does not split it.** It keeps Algebrai egész
kifejezések as one chapter before Sokszögek, and the app follows the textbook.

## Learning outcomes (ishodi)

By the end of grade 7 the student will be able to:

1. compute a power of a real number and the square root of a perfect square, and apply the
   relevant properties of the operations;
2. find the numerical value of a simpler expression with real numbers;
3. from a real-life problem, set up and evaluate a simpler numerical expression with real numbers;
4. find an approximate value of a real number and estimate the absolute error;
5. draw the graph of the function y = kx, k ∈ R \ {0};
6. apply extended proportion (продужена пропорција, HU: *kibővített arány*) in real situations;
7. apply the Pythagorean theorem in computational and construction problems;
8. transform the sum, difference and product of polynomials;
9. apply the formulas for the difference of squares and the square of a binomial;
10. factor a polynomial (distributive law, square of a binomial, difference of squares);
11. apply polynomial transformations to solving equations;
12. apply properties of the sides, angles and diagonals of a polygon;
13. compute the area of a polygon using formulas or decomposition (разложива једнакост);
14. construct the orthocenter and the centroid of a triangle;
15. apply the triangle congruence theorems to prove simpler statements and in construction problems;
16. apply properties of central and inscribed angles in a circle;
17. compute the circumference and area of a circle and of its parts;
18. map a given geometric object by rotation;
19. find the mean, median and mode.

## Contents and teaching notes per topic

### 1. Valós számok / Реални бројеви

Contents:
- the square of a rational number;
- solving x² = a, which shows that irrational numbers exist (e.g. x² = 2);
- real numbers and the number line;
- the square root and the identity √(a²) = |a|;
- the decimal representation of a real number, approximate values and absolute error;
- basic properties of operations with real numbers;
- the direct-proportionality function y = kx;
- extended proportion.

Teaching notes:
- **Squares.** Introduce the square of p/q as the area of a square with side p/q, which shows that
  a square is never negative. Treat p/q form and decimal form equally.
- **x² = a.** It has 2 solutions (a > 0), 1 solution (a = 0) or none (a < 0). Stress the
  difference between the value √4 (which is 2) and the solutions of x² = 4 (which are ±2).
- **Irrational numbers.** Show that x² = 2 has no rational solution, but don't require students to
  reproduce the proof. Then R = Q ∪ I (disjoint), the real number line has rational and irrational
  points, and π is mentioned as another irrational number.
- **Decimal representations.** Rational numbers have finite or infinite periodic decimals,
  irrational numbers have infinite non-periodic ones. Show this on examples without a general
  proof. A calculator is allowed for irrational roots.
- **Rounding.** Define approximate value and absolute error. Rounding rules are derived as
  "choose the approximation with the smaller absolute error".
- **Root properties in R⁺.** Cover the root of a product and of a quotient, and contrast
  √(a+b) with √a + √b. Pay special attention to √(a²) = |a|.
- **y = kx.** Use real contexts such as distance and time at constant speed. Start with a dotted
  graph for discrete values, then draw the full line in the coordinate system.
- **Extended proportion.** Use real contexts: dividing a sum in a given ratio, triangle angles
  given in a ratio, alloys. Link it to compound (double) proportion.

### 2. Pitagorasz tétele / Питагорина теорема

Contents:
- the Pythagorean theorem and its converse, and its most important applications;
- constructing the points √2, √3, √5, … on the number line;
- the distance between two points in the coordinate system.

Teaching notes:
- **Motivation.** Use history, the Egyptian 3-4-5 rope triangle, a drawing or dynamic software.
  Then state the theorem with a **complete proof**.
- **Understanding over memorizing.** Students must understand the concept, not memorize the
  statement. **Vary the labels of the legs and the hypotenuse and the orientation of the
  triangle** in exercises.
- **Triples and the converse.** Introduce Pythagorean triples (there are infinitely many). State
  the converse and use it in exercises.
- **Second part of the topic.** Cover:
  - constructing segments of irrational length;
  - applications to the square, rectangle, isosceles and equilateral triangles, rhombus, and
    right and isosceles trapezoids;
  - the isosceles right triangle;
  - the right triangle with a 30° angle;
  - the distance between two points.

### 3. Algebrai egész kifejezések / Цели алгебарски изрази

Part 1: powers with a natural exponent, powers of ten with an integer exponent, and operations
with powers (power of a product, of a quotient and of a power).

Part 2: algebraic expressions, polynomials and their operations, the square of a binomial, the
difference of squares, factoring, and applications. Specifically:
- monomials and the standard (simplified) form of a polynomial;
- sum, difference and product of polynomials;
- factoring with the distributive law, the binomial-square formula and the difference of
  squares.

Teaching notes:
- **Power rules.** Cover a^m·a^n, a^m : a^n, (a^m)^n, (ab)^n and (a:b)^n. Students must fully
  master these, because polynomials depend on them.
- **Zero and negative exponents.** These appear **only for base 10**. Use them for writing very
  small numbers (physics) and for the expanded decimal form of rational numbers.
- **Polynomials.** Start with evaluating expressions for given values. Then add, subtract and
  multiply polynomials and bring them to standard form, using (a + b)(x + y) = ax + ay + bx + by
  and (a + b)² = a² + 2ab + b².
- **Factoring.** Motivate it with solving equations. Use the same formulas read backwards, plus
  the difference of squares. Factoring an incomplete quadratic trinomial is **additional
  (enrichment) material only**.
- **Applications.** Solve equations of the form ax² + bx = 0 and x² − c² = 0, and simple geometry
  problems that need polynomial operations.

### 4. Sokszögek / Многоугао

Contents:
- the polygon and types of polygons;
- the sum of the angles and the number of diagonals;
- regular polygons: the concept, properties and constructions;
- the perimeter and area of a polygon;
- the median of a triangle, and the orthocenter and centroid of a triangle;
- more complex applications of the congruence theorems.

Teaching notes:
- **Definition.** A polygon is the part of the plane bounded by a closed polygonal line. Mention
  convex versus concave, then work only with convex polygons. Students discover how the number
  of diagonals and the angle sum depend on n.
- **Regular polygons.** Show counterexamples: equal sides do not make a polygon regular (rhombus),
  and neither do equal angles (rectangle). Cover the axes of symmetry and the inscribed and
  circumscribed circles.
- **Hexagon.** Derive the relations in the regular hexagon from the equilateral triangle: side,
  longer and shorter diagonals, inradius and circumradius. Give special attention to the area of
  the regular hexagon.
- **Congruence.** Use it to develop proof skills. Prove the main properties of triangles and
  parallelograms. Introduce the orthocenter, median and centroid with their properties.
- **Constructions.** Distinguish drawing from constructing. Cover:
  1. triangles determined by sides and angles plus a height or a median;
  2. parallelograms and trapezoids determined by sides and angles plus a height;
  3. kites (deltoid);
  4. regular polygons with 3, 4, 6, 8 or 12 vertices, given the side or the circumradius or
     inradius.

  Mention cases with several solutions or none, but don't insist on them.
- **Area.** Compute it by decomposing into triangles and quadrilaterals, and include practical
  applications.

### 5. A kör / Круг

Contents:
- central and inscribed angles;
- the circumference and π, and the arc length;
- the area of a circle, a sector and an annulus (ring);
- rotation.

Teaching notes:
- **Circle elements.** Review the positions of a circle and a line, and of two circles, plus the
  tangent and the chord. Use Pythagoras to relate the radius, the chord and the chord's distance
  from the center.
- **Angles.** The central and inscribed angle and their relation, with proof, are the core of the
  topic.
- **π.** Students find experimentally that circumference ÷ diameter is constant. Then introduce π
  and mention that it is irrational.
- **Formulas.** Derive the arc length and the areas of a sector and of an annulus.
- **Approximations.** Use π ≈ 3,14 in practice, and sometimes 3,142, 22/7 or 3,1.
- **Rotation.** Keep to simple figures rotated about a given point by a given angle. Cover the
  positive and negative directions and some rotations in the coordinate system. Lengths and angles
  don't change under rotation.

### 6. Adatfeldolgozás / Обрада података

Contents: mean, median and mode.

Teaching notes:
- **Run it as a survey project.** Students choose a topic, write 5–6 questions and run the
  survey. They then process the data in groups (Excel is allowed) and present the results.
- **Concepts.** Review the sample, numeric and percentage distribution, and graphical display.
  The new concepts are the mean, median and mode.

## Hungarian terminology (Serbian ↔ Hungarian)

| Serbian | Hungarian |
|---|---|
| квадрат, квадратни корен | négyzet, négyzetgyök |
| ирационалан / реалан број | irracionális / valós szám |
| приближна вредност, апсолутна грешка | közelítő érték, abszolút hiba |
| функција директне пропорционалности | az egyenes arányosság függvénye |
| продужена пропорција | kibővített arány |
| катета, хипотенуза | befogó, átfogó |
| обрат Питагорине теореме | a Pitagorasz-tétel megfordítása |
| Питагорине тројке | pitagoraszi számhármasok |
| степен, основа, изложилац | hatvány, alap, kitevő |
| декадна јединица | tízes egység |
| моном, полином, сређени облик | monom, polinom, rendezett alak |
| квадрат бинома, разлика квадрата | a binom négyzete, négyzetek különbsége |
| растављање на чиниоце | tényezőkre bontás |
| многоугао, дијагонала | sokszög, átló |
| правилни многоугао | szabályos sokszög |
| тежишна дуж, тежиште, ортоцентар | súlyvonal, súlypont, magasságpont |
| ставови подударности | az egybevágóság alapesetei |
| централни / периферијски угао | középponti / kerületi szög |
| обим, површина | kerület (K), terület (T) |
| кружни лук, кружни исечак, кружни прстен | körív, körcikk, körgyűrű |
| тангента, тетива | érintő, húr |
| ротација | elforgatás |
| средња вредност, медијана, мод | átlag (számtani közép), medián, módusz |

## Where the textbook structure differs from the curriculum

The app follows the textbook in every case below.

1. **Topic order.** The topics and their order match, but the textbook keeps *Algebrai egész
   kifejezések* as one chapter instead of splitting it around *Sokszögek*. Sokszögek does not
   depend on polynomials. It does depend on roots and on Pythagoras (the equilateral-triangle
   area). Prerequisite overrides may be worth setting.
2. **Valós számok.** It matches. The textbook gives *Számtani műveletek valós számokkal*,
   *Az egyenes arányosság függvénye* and *A kibővített arány* their own lessons inside this
   chapter, which is where the curriculum puts them.
3. **Pitagorasz tétele.** It matches. The converse and the Pythagorean triples have no separate
   lesson, so they belong in subtopic 01. The isosceles right triangle goes with the square
   (03), and the 30°–60°–90° triangle goes with the equilateral triangle (04). Right and
   isosceles trapezoids are both in 05.
4. **Sokszögek.**
   - The textbook's last lesson covers only *regular* polygons. The curriculum outcome "area of a
     polygon by formulas or decomposition" has no lesson of its own, so it is folded into 06 as
     the general principle and practice.
   - The "more complex applications of congruence" (proofs) have no lesson of their own and
     belong in 03, *Háromszögek és négyszögek szerkesztése*.
   - The median (súlyvonal) belongs in 02.
5. **A kör.** The curriculum's review of circle and line positions, two circles, tangents and the
   chord–radius–distance relation has no lesson of its own. It is folded into 01 as a short
   recap.
6. **Adatfeldolgozás.** The curriculum has only mean, median and mode, taught as a project. The
   textbook has two lessons. The first adds data types and their graphical display, which the
   curriculum treats as review in lesson 3 of the project. The app can't run a survey project,
   so the lessons focus on reading and computing from given data sets, tables and charts.
