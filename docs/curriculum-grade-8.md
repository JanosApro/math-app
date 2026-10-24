# Grade 8 mathematics: official Serbian curriculum (summary)

This summary is for content authors, so nobody has to look the curriculum up again. The app's
**structure follows the teacher's textbook** (see `docs/materials-grade-8.md` and
`src/content/grade-8/topics.draft.json`). This file says **what each topic must teach**, how hard it
should be, and where the textbook and the curriculum differ.

## Source

- **Правилник о програму наставе и учења за осми разред основног образовања и васпитања**
  (Pravilnik o programu nastave i učenja za osmi razred osnovnog obrazovanja i vaspitanja),
  „Службени гласник РС – Просветни гласник”, бр. **11/2019**. Amended 2/2020, 6/2020, 5/2021,
  17/2021, 16/2022, 13/2023, 14/2023, 4/2024 and 6/2025. In force for grade 8 since 2020/2021.
  - ZUOV list of regulations with the publication and amendment history (item 4):
    https://zuov.gov.rs/wp-content/uploads/wpfd/preview_files/2.-Основно-образовање-и-васпитање(78de269b6866c12394c883d83d5c41a7).pdf
  - I could not fetch the Pravilnik itself (paragraf.rs returns 404 and the PIS portal needs
    JavaScript). Its mathematics part was read from two school programs that copy the official
    outcomes, contents and implementation guidance word for word:
    - https://www.prvaskola.edu.rs/document/sk-26_30/matematika_8_sk.pdf (2026–2030 school program:
      outcomes, contents and the full "način ostvarivanja" guidance, including formulas)
    - https://skolazagluve.edu.rs/wp-content/uploads/2022/10/skolski-program-osmi-razred.pdf
      (hours per topic, outcomes, achievement standards)
  - Older program, for comparison only (before 2020/21; it had statistics in grade 8):
    https://naucionica.com/plan-program-rada-matematika-osmi-razred/
- **Annual load:** 136 lessons (4 per week × 34 weeks; grade 8 has a shorter school year).
- **Goal (cilj), paraphrased:** through mathematical concepts, knowledge and skills, students develop
  the basics of abstract and critical thinking and a positive attitude toward math. They learn to
  communicate in mathematical language and notation, and to apply what they know in further
  schooling and in everyday problems.
- **Key concepts (ključni pojmovi sadržaja):** similarity, linear function, system of linear
  equations, prism, pyramid, cylinder, cone and sphere.
- Grade 8 ends with the national **final exam (završni ispit / záróvizsga)**, so the standards below
  (basic / intermediate / advanced) map well to the app's difficulty levels 1–3.

## Topics, suggested hours and order

| # | Serbian (official) | Hungarian (textbook) | Hours |
|---|---|---|---|
| 1 | Сличност (Sličnost) | Háromszögek hasonlósága | 16 |
| 2 | Тачка, права и раван (Tačka, prava i ravan) | Pont, egyenes és sík | 12 |
| 3 | Линеарне једначине и неједначине са једном непознатом | Egyismeretlenes lineáris egyenletek és egyenlőtlenségek | 20 |
| 4 | Призма (Prizma) | Hasáb | 15 |
| 5 | Пирамида (Piramida) | Gúla | 17 |
| 6 | Линеарна функција (Linearna funkcija) | Lineáris függvény | 14 |
| 7 | Системи линеарних једначина са две непознате | Elsőfokú kétismeretlenes egyenletrendszerek | 17 |
| 8 | Ваљак, купа и лопта (Valjak, kupa i lopta) | Henger, kúp és gömb | 17 |

The hours come from the school program that reproduces the official table: 128 lessons plus 8 for
four written tests with corrections, 136 in total. Schools may shift a few hours, for example to
make room for a project task. **The textbook's order matches the curriculum's order exactly.**

There is **no separate data-processing topic (Obrada podataka) in the current grade-8 program.**
Grade 7 has one. The old (pre-2020) grade-8 program had statistics (mean, median, charts), and some
websites still list it, but the 2019 program does not. Data-handling standards (reading charts and
tables, mean and median, percentages) are only practised across topics and on the final exam. The
textbook has no data chapter either, so **the app has 8 topics for grade 8**.

## Learning outcomes (ishodi)

By the end of grade 8 the student will be able to:

1. apply the intercept theorem (Talesova teorema) in geometry problems and real contexts;
2. apply similarity of triangles in geometry problems and real contexts;
3. analyse the relations of points, lines and planes in space and write them in mathematical notation;
4. draw the relations of geometric objects in the plane and in space, and use such drawings when
   solving problems;
5. spot a right triangle in space and apply the Pythagorean theorem in geometry and real contexts;
6. solve a linear equation and a linear inequality in one unknown, and solve real problems with them;
7. draw and analyse the graph of a linear function;
8. solve a system of two linear equations in two unknowns, and solve real problems with one;
9. compute the surface area and volume of a right prism, of a four-sided pyramid with a rectangular
   base and of regular three- and six-sided pyramids, and of a cylinder, a cone and a sphere;
10. apply the surface-area and volume formulas in real situations;
11. take part in choosing a research project and how to carry it out (a project task, not app content).

## Contents and guidance per topic

Notes on what to stress come from the program's "način ostvarivanja programa" (implementation
guidance). They are paraphrased here.

### 1. Sličnost → Háromszögek hasonlósága
- **Contents:** proportional quantities (proportional segments), the intercept theorem, similarity of
  triangles, applications of similarity.
- **Guidance:**
  - Start from map scales: compute real distances from a scale and a measured length. Then
    generalise ratio of segments, compute the fourth proportional numerically, and construct it.
  - Commensurable segments (a triangle's base and midline; centroid-to-vertex distance and the median)
    and incommensurable ones (side and diagonal of a square).
  - The intercept theorem is **not proved rigorously**. Students reach the statement through a
    simplified model. Its converse may be proved, but doesn't have to be.
  - Practise the theorem and its converse both numerically and by construction. Pay special attention
    to **dividing a segment into equal parts by construction**.
  - Introduce similar triangles and the similarity ratio (k) naturally, by comparing similar and
    non-similar examples. Derive the proportionality of sides and the similarity criteria from the
    intercept theorem.
  - Applications:
    - Thales measuring the Cheops pyramid by its shadow. The textbook's chapter opener uses this
      legend too.
    - Measuring the width of a river without crossing it, and the height of a hill.
    - Similarity in a right triangle: a proof of the Pythagorean theorem, and the altitude to the
      hypotenuse versus the two hypotenuse segments.
- **HU terminology warning:** in Hungary, "Thalész-tétel" means the angle in a semicircle. In this
  textbook "Thalész párhuzamos szelők tétele" is the **intercept theorem** (Talesova teorema). Never mix
  them up in content.

### 2. Tačka, prava i ravan → Pont, egyenes és sík
- **Contents:**
  - relation of a point to a line and to a plane;
  - relations of two lines, including skew lines (mimoilazne prave, HU *kitérő egyenesek*);
  - relations of a line and a plane: the normal to a plane and the distance of a point from a plane;
  - relations of two planes;
  - orthogonal projection onto a plane of a point, a segment and a line;
  - the angle between a line and a plane;
  - polyhedra (poliedar).
- **Guidance:**
  - Base everything on observing real objects. Use correct terminology and symbols.
  - Stress **parallel** and **perpendicular** for line–line, line–plane and plane–plane.
  - Link a line's relation to a plane with its orthogonal projection on that plane. The angle between
    a line and a plane is the angle between the line and its projection.
  - Revise the Pythagorean theorem and use it with projections of segments.
  - A polyhedron is a part of space bounded by polygons. Analyse the shape and number of faces on
    real-life examples. Revise the properties of the cube and cuboid and link them to this topic.
  - Encourage spatial visualisation and drawing solids. Students must use **solid lines for visible
    edges and dashed lines for hidden edges**. They should notice that some elements, mainly right
    angles, are not shown true-to-life in a flat drawing.
- **Textbook extra:** the "Poliéderek" lesson also covers surface area and volume as concepts, volume
  units, the liter, and the cube and cuboid. That is review from grades 5–6, placed here as a bridge
  to prisms.

### 3. Linearne jednačine i nejednačine sa jednom nepoznatom → Egyismeretlenes lineáris egyenletek és egyenlőtlenségek
- **Contents:** linear equation; solving linear equations in one unknown; linear inequality; solving
  linear inequalities in one unknown; applications in real situations.
- **Guidance:**
  - Students already solved simple equations through the relations between operations and with the
    balance method. That is the basis for **equivalent transformations**.
  - Show on examples that ax = b has exactly one solution if a ≠ 0. It has no solution if a = 0 and
    b ≠ 0 (the solution set is empty). Every real number is a solution if a = 0 and b = 0.
  - **No equations with parameters in grade 8.**
  - Students learn to reduce equations to the form ax = b. Include equations that reduce to linear
    ones and revise:
    - absolute value;
    - square of a binomial and difference of squares, where the squared terms cancel;
    - when a product or quotient equals zero.
  - Inequalities are solved the same way, but stress that **multiplying or dividing by a negative
    number reverses the inequality sign**. Show solutions on a **number line** and in **set
    notation**.
  - Word problems, also from physics, chemistry and everyday life: set up the equation or inequality,
    solve it and justify the answer.

### 4. Prizma → Hasáb
- **Contents:** prism: concept, types, elements; net of a right prism; surface area of a right prism;
  volume of a right prism.
- **Required bodies:**
  - **right triangular and right quadrilateral prisms**;
  - **the regular hexagonal prism**.
- **Guidance:**
  - Use models, nets and sketches. Students draw nets and build models.
  - Insist on precise sketches: visible edges solid, hidden edges dashed. Notice diagonal sections.
  - Link the volume formula to the cuboid's.
  - Compute from the basic elements and from dependent ones, such as the radius of the circumscribed
    or inscribed circle and the diagonals.
  - Always start from the **general formulas** and specialise. The program writes them as
    **P = 2B + M and V = B·H** (P = surface area, B = base area, M = lateral surface, H = height of
    the solid).
  - Look at equal-edged solids separately. In review lessons, use everyday situations.

### 5. Piramida → Gúla
- **Contents:** pyramid: concept, types, elements; net of a pyramid; surface area; volume.
- **Required bodies:**
  - **a four-sided pyramid with a rectangular base**;
  - **regular triangular and regular hexagonal pyramids**.
- **Guidance:** same approach as for the prism. The general formulas are **P = B + M and V = B·H/3**.
  Compute with dependent elements too: the lateral face height (bočna visina, HU *oldalmagasság*),
  the lateral edge, and the inscribed or circumscribed radius of the base. The right triangles inside
  the pyramid are the key tool.

### 6. Linearna funkcija → Lineáris függvény
- **Contents:**
  - the linear function y = kx + n and its graph;
  - the zero and the sign of the function (HU *zérushely*, *előjel*), and monotonicity (*növekvő* /
    *csökkenő*);
  - the implicit form ax + by = c;
  - drawing and reading graphs of linear functions.
- **Guidance:**
  - First revise direct proportionality y = kx and its graph from grade 7. Then introduce y = kx + n
    **without the general concept of a function**.
  - Show that the graph is a line. Look at k = 0, k > 0, k < 0 and n = 0, n > 0, n < 0 separately.
  - Introduce zero, sign, increasing and decreasing, and how each shows on the graph and depends on
    k and n.
  - Students must fully master drawing the graph and "reading" properties from a given graph.
  - Cover the linear function given implicitly as ax + by = c.

### 7. Sistemi linearnih jednačina sa dve nepoznate → Elsőfokú kétismeretlenes egyenletrendszerek
- **Contents:**
  - a linear equation in two unknowns, and a system of two such equations;
  - solving by **substitution** (metoda zamene, HU *behelyettesítő módszer*) and by **opposite
    coefficients** (metoda suprotnih koeficijenata, HU likely *ellentett együtthatók módszere*);
  - graphical interpretation;
  - applications.
- **Guidance:**
  - The graph of ax + by = c is a line when a or b is not 0. Students draw it.
  - A solution of a system is an **ordered pair**. Explain the graphical interpretation of a system:
    one intersection, parallel lines or coincident lines.
  - Word problems come from geometry, physics, chemistry and everyday life.

### 8. Valjak, kupa i lopta → Henger, kúp és gömb
- **Contents:**
  - the cylinder and its elements; its net; surface area and volume of a right cylinder;
  - the cone and its elements; its net; surface area and volume of a right cone;
  - the ball and the sphere (lopta i sfera); sections of a sphere by a plane; surface area and volume
    of a sphere.
- **Guidance:**
  - The cylinder, cone and sphere are **solids of revolution**. Use models to see the elements and the
    axial sections of the cylinder and cone, and the plane sections of a sphere.
  - Students draw nets of the cylinder and cone, and precise sketches.
  - Link the cylinder to the prism and the cone to the pyramid, and use these analogies to justify
    the formulas.
  - For the cone's surface area, link the lateral surface to a circular sector and the base
    circumference to the arc length.
  - Before the sphere, revise the circle and the disc. The **sphere formulas are stated without
    proof**.
  - In review lessons, use everyday situations.
- **Formulas, in the program's letters** (Serbian convention, see `materials-grade-8.md` for the
  notation question):

  | Solid | Surface area | Volume |
  |---|---|---|
  | cylinder | P = 2B + M = 2r²π + 2rπH = 2rπ(r + H) | V = B·H = r²πH |
  | cone | P = B + M = r²π + rπs = rπ(r + s), with s² = r² + H² | V = B·H/3 = r²πH/3 |
  | sphere | P = 4r²π | V = 4r³π/3 |

## Achievement standards → app difficulty levels

The national standards have three levels. They map well to the generator difficulty levels:

| App level | Standard level | Pattern in grade 8 (examples) |
|---|---|---|
| 1 | basic (MA.1.x) | recognise elements, solve equations where x appears once, cube and cuboid, read a value from a table or formula |
| 2 | intermediate (MA.2.x) | surface area and volume of prisms, pyramids, cylinders, cones and spheres when **all needed elements are given directly**; solve linear equations and systems; simple word problems |
| 3 | advanced (MA.3.x) | surface area and volume when **elements must first be computed** (Pythagoras, diagonals, radii); set up and solve inequalities and systems from complex texts; similarity and congruence combined with other properties |

Relevant standards:
- MA.3.3.6: apply congruence and similarity of triangles.
- MA.1.2.1, MA.2.2.1, MA.3.2.1, MA.2.2.5, MA.3.2.5: equations, inequalities, systems, word problems.
- MA.1.3.4, MA.2.3.4, MA.3.3.4: cube and cuboid, then prisms and pyramids.
- MA.1.2.4, MA.2.2.4, MA.3.2.4: functions, proportionality, linear function.
- MA.1.3.5, MA.2.3.5, MA.3.3.5: cylinder, cone and sphere.
- MA.x.5.x: data, charts, mean and median, percentages. These are cross-cutting only.

## Where the textbook differs from the curriculum

- **Same 8 topics, in the same order.** The app follows the textbook's titles.
- **Data processing:** neither the current program nor the textbook has it in grade 8, so nothing is
  added.
- **Sličnost:** the textbook starts with "Arányos mennyiségek" (proportional quantities) as its own
  lesson. That matches the curriculum's "proporcionalne veličine".
- **Tačka, prava i ravan:** the textbook has 3 lessons. The angle between a line and a plane and the
  distance from a point to a plane have no lesson title of their own, so they go into "Merőleges
  vetítés a síkra" and "A pont, az egyenes és a sík kölcsönös helyzete" (inferred). "Poliéderek" adds
  revision of volume units, the liter, and the cube and cuboid.
- **Equations:** the textbook spends a whole lesson on the theory behind equations (equivalent
  expressions, identities, equivalent transformations as numbered theorems) before solving them. It
  splits **applications** of equations and of inequalities into separate lessons.
- **Prism and pyramid:** the textbook's first lesson in each chapter covers more than the
  curriculum's minimum:
  - the oblique prism or pyramid (concept only);
  - equal-edged and regular solids;
  - space diagonals and diagonal sections;
  - nets of regular 3-, 4- and 6-sided solids.

  Calculations should stay with the required bodies listed above.
- **Linear function:** the textbook adds a lesson on linear relationships between real quantities
  before the formal y = kx + n.
- **Systems:** the textbook's first lesson combines the concept, the solution and the equivalence of
  systems. The second is about solving methods and the third about applications.
- **Cylinder, cone and sphere:** the textbook has 8 lessons: for the cylinder and the cone, one on the
  solid itself, one on surface area and one on volume; for the sphere, one on the solid and one on
  surface area and volume together. Plane sections of a sphere (curriculum) belong in "A gömb"
  (inferred).
- Each textbook chapter ends with a "Teszt – …" page. These are not lessons; the app's mini tests and
  daily challenge replace them.

## Serbian ↔ Hungarian glossary (for consistent wording)

| Serbian | Hungarian (use in the app) |
|---|---|
| sličnost, koeficijent sličnosti | hasonlóság, hasonlósági arány (k) |
| proporcionalne duži / veličine | arányos szakaszok / mennyiségek |
| Talesova teorema | Thalész párhuzamos szelők tétele |
| ortogonalna projekcija | merőleges vetület, merőleges vetítés |
| mimoilazne prave | kitérő egyenesek |
| prodor (prave kroz ravan) | döféspont |
| poliedar | poliéder |
| prizma / piramida | hasáb / gúla |
| valjak / kupa / lopta, sfera | henger / kúp / gömb (gömbtest), gömbfelület |
| baza, osnova | alaplap |
| omotač | palást |
| bočna strana / bočna ivica / osnovna ivica | oldallap / oldalél / alapél |
| visina tela / bočna visina (apotema) | (test)magasság / oldalmagasság |
| izvodnica | alkotó |
| osni presek / dijagonalni presek | tengelymetszet / átlós metszet |
| prostorna dijagonala | testátló |
| mreža | testháló |
| površina / zapremina | felszín / térfogat |
| jednakoivična / pravilna | egyenlő élű / szabályos |
| linearna funkcija, nula funkcije | lineáris függvény, zérushely |
| rastuća / opadajuća | növekvő / csökkenő |
| sistem dve linearne jednačine | (kétismeretlenes) egyenletrendszer |
| metoda zamene / suprotnih koeficijenata | behelyettesítő módszer / ellentett együtthatók módszere |
| ekvivalentne jednačine / transformacije | ekvivalens egyenletek / ekvivalens transzformációk |
