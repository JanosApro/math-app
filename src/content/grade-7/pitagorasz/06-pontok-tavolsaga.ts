/**
 * 7. osztály › Pitagorasz tétele › 6. Pontok egymástól való távolsága a koordináta-rendszerben
 *
 * Distance of A(x₁; y₁) and B(x₂; y₂) via the right triangle with legs |x₂ − x₁| and
 * |y₂ − y₁|, segment lengths, the perimeter of a triangle on the grid, and deciding whether
 * a triangle is right-angled or isosceles.
 */
import {
  choice,
  defineSubtopic,
  num,
  simplifyRoot,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type XY,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A coordinate range that contains every point with a little margin. */
function plane(points: XY[]): { x: [number, number]; y: [number, number]; labelEvery: number } {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x: [number, number] = [Math.min(0, ...xs) - 2, Math.max(0, ...xs) + 2];
  const y: [number, number] = [Math.min(0, ...ys) - 2, Math.max(0, ...ys) + 2];
  return { x, y, labelEvery: Math.max(x[1] - x[0], y[1] - y[0]) > 10 ? 2 : 1 };
}

/** Two points with the helper right triangle (Δx, Δy) and the segment highlighted. */
function distanceFigure(A: XY, B: XY, dLabel = 'd = ?'): Figure {
  const dx = Math.abs(B[0] - A[0]);
  const dy = Math.abs(B[1] - A[1]);
  return {
    type: 'coordinate',
    ...plane([A, B]),
    size: 'large',
    points: [
      { at: A, label: 'A' },
      { at: B, label: 'B' },
    ],
    distances: [{ from: A, to: B, labels: { dx: `${num(dx)}`, dy: `${num(dy)}`, d: dLabel } }],
  };
}

/** A triangle on the grid (A, B, C) with vertex labels and a light fill. */
function triangleFigure(A: XY, B: XY, C: XY): Figure {
  return {
    type: 'coordinate',
    ...plane([A, B, C]),
    size: 'large',
    polygons: [{ points: [A, B, C], fill: true, vertexLabels: ['A', 'B', 'C'] }],
  };
}

/** A tilted square given by two opposite vertices A and C. */
function squareFromDiagonal(A: XY, C: XY): Figure {
  const mx = (A[0] + C[0]) / 2;
  const my = (A[1] + C[1]) / 2;
  const vx = C[0] - A[0];
  const vy = C[1] - A[1];
  const B: XY = [mx - vy / 2, my + vx / 2];
  const D: XY = [mx + vy / 2, my - vx / 2];
  return {
    type: 'coordinate',
    ...plane([A, B, C, D]),
    size: 'large',
    polygons: [{ points: [A, B, C, D], fill: true, vertexLabels: ['A', 'B', 'C', 'D'] }],
    distances: [{ from: A, to: C, labels: { dx: `${num(Math.abs(vx))}`, dy: `${num(Math.abs(vy))}`, d: 'd = ?' } }],
  };
}

/** Small Pythagorean triples for integer distances. */
const SMALL_TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
];

/** Differences where the distance is a root (not a whole number). */
const ROOT_DIFFS: [number, number][] = [
  [1, 3],
  [2, 3],
  [3, 5],
  [4, 5],
  [2, 5],
  [5, 6],
];

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Distance of two grid points. */
const distance: GeneratorDef = {
  id: 'distance',
  title: 'Két pont távolsága',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = 'egység';
    if (level === 1) {
      const [dx, dy, d] = rng.pick(SMALL_TRIPLES);
      const x = rng.int(1, 9 - dx);
      const y = rng.int(1, 9 - dy);
      const A: XY = [x, y];
      const B: XY = [x + dx, y + dy];
      return {
        prompt: tex`Mekkora az $A(${num(A[0])}; ${num(A[1])})$ és $B(${num(B[0])}; ${num(B[1])})$ pontok távolsága?`,
        figure: distanceFigure(A, B),
        answer: { type: 'number', value: d, unit },
        inputLabel: '$d =$',
        hint: 'Rajzolj vízszintes és függőleges szakaszt! A két befogó a koordináták különbsége.',
        solution: [
          tex`A vízszintes különbség: $|${num(B[0])} - ${num(A[0])}| = ${num(dx)}$.`,
          tex`A függőleges különbség: $|${num(B[1])} - ${num(A[1])}| = ${num(dy)}$.`,
          tex`$d^2 = ${num(dx)}^2 + ${num(dy)}^2 = ${num(dx * dx)} + ${num(dy * dy)} = ${num(d * d)}$`,
          tex`$d = \sqrt{${num(d * d)}} = ${num(d)}$`,
          tex`A két pont távolsága **${num(d)} ${unit}**.`,
        ],
      };
    }
    if (level === 2) {
      const [dx, dy] = rng.pick(ROOT_DIFFS);
      const x = rng.int(-6, -2);
      const y = rng.int(-6, -2);
      const A: XY = [x, y];
      const B: XY = [x + dx, y + dy];
      const n = dx * dx + dy * dy;
      const root = simplifyRoot(n);
      return {
        prompt: tex`Mekkora az $A(${num(A[0])}; ${num(A[1])})$ és $B(${num(B[0])}; ${num(B[1])})$ pontok távolsága? (Gyökös alakban add meg!)`,
        figure: distanceFigure(A, B),
        answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
        inputLabel: '$d =$',
        hint: 'A negatív koordinátáknál is a különbség abszolút értékével számolj!',
        solution: [
          tex`A vízszintes különbség: $|${num(B[0])} - (${num(A[0])})| = ${num(dx)}$.`,
          tex`A függőleges különbség: $|${num(B[1])} - (${num(A[1])})| = ${num(dy)}$.`,
          tex`$d^2 = ${num(dx)}^2 + ${num(dy)}^2 = ${num(dx * dx)} + ${num(dy * dy)} = ${num(n)}$`,
          tex`$d = \sqrt{${num(n)}}${root.coef === 1 ? '' : tex` = ${texRoot(root.coef, root.radicand)}`} \approx ${num(Math.sqrt(n), 2)}$`,
          tex`A két pont távolsága **$${texRoot(root.coef, root.radicand)}$ ${unit}**.`,
        ],
      };
    }
    const [dx, dy, diag] = rng.pick([
      [3, 4, 5],
      [6, 8, 10],
      [4, 3, 5],
      [8, 6, 10],
    ]);
    const x = rng.int(-3, -1);
    const y = rng.int(-2, 0);
    const A: XY = [x, y];
    const C: XY = [x + dx, y + dy];
    const side = diag / Math.SQRT2;
    return {
      prompt: tex`Egy négyzet két szemközti csúcsa $A(${num(A[0])}; ${num(A[1])})$ és $C(${num(C[0])}; ${num(C[1])})$. Milyen hosszú az oldala? Két tizedesjegyre kerekíts!`,
      figure: squareFromDiagonal(A, C),
      answer: { type: 'number', value: side, precision: 2, unit },
      inputLabel: '$a =$',
      hint: 'Előbb az átló hosszát számítsd ki a koordinátákból, aztán használd a négyzet átlójának képletét!',
      solution: [
        tex`Az átló a koordinátákból: $d^2 = ${num(dx)}^2 + ${num(dy)}^2 = ${num(diag * diag)}$, így $d = ${num(diag)}$.`,
        tex`A négyzetnél $d = a\sqrt{2}$, ezért $a = d : \sqrt{2}$.`,
        tex`$a = ${num(diag)} : \sqrt{2} \approx ${num(side, 2)}$ ${unit}`,
        tex`A négyzet oldala **${num(side, 2)} ${unit}**.`,
      ],
    };
  },
};

/** Perimeter of a triangle on the grid. */
const perimeter: GeneratorDef = {
  id: 'perimeter',
  title: 'Háromszög kerülete a koordináta-rendszerben',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = 'egység';
    const x = rng.int(-3, 3);
    const y = rng.int(-3, 3);
    if (level === 2) {
      const [a, b, c] = rng.pick([
        [3, 4, 5],
        [4, 3, 5],
        [6, 8, 10],
        [8, 6, 10],
      ]);
      const A: XY = [x, y];
      const B: XY = [x + a, y];
      const C: XY = [x, y + b];
      const k = a + b + c;
      return {
        prompt: tex`Az $A(${num(A[0])}; ${num(A[1])})$, $B(${num(B[0])}; ${num(B[1])})$ és $C(${num(C[0])}; ${num(C[1])})$ pontok háromszöget alkotnak. Mekkora a kerülete?`,
        figure: triangleFigure(A, B, C),
        answer: { type: 'number', value: k, unit },
        inputLabel: '$K =$',
        hint: 'Az $AB$ és $AC$ oldal a tengelyekkel párhuzamos, a $BC$ oldalt Pitagorasz-tétellel számíthatod ki.',
        solution: [
          tex`$AB = ${num(a)}$ ${unit}, mert vízszintes; $AC = ${num(b)}$ ${unit}, mert függőleges.`,
          tex`$BC^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(c * c)}$, így $BC = ${num(c)}$ ${unit}.`,
          tex`$K = ${num(a)} + ${num(b)} + ${num(c)} = ${num(k)}$ ${unit}`,
          tex`A háromszög kerülete **${num(k)} ${unit}**.`,
        ],
      };
    }
    const [a, b] = rng.pick(ROOT_DIFFS);
    const n = a * a + b * b;
    const hypotenuse = Math.sqrt(n);
    const k = a + b + hypotenuse;
    const A: XY = [x, y];
    const B: XY = [x + a, y];
    const C: XY = [x, y + b];
    return {
      prompt: tex`Az $A(${num(A[0])}; ${num(A[1])})$, $B(${num(B[0])}; ${num(B[1])})$ és $C(${num(C[0])}; ${num(C[1])})$ pontok háromszöget alkotnak. Mekkora a kerülete? Két tizedesjegyre kerekíts!`,
      figure: triangleFigure(A, B, C),
      answer: { type: 'number', value: k, precision: 2, unit },
      inputLabel: '$K =$',
      hint: 'Két oldal tengelypárhuzamos; a harmadikat Pitagorasz-tétellel számold ki, aztán add össze!',
      solution: [
        tex`$AB = ${num(a)}$ ${unit}, $AC = ${num(b)}$ ${unit}.`,
        tex`$BC^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(n)}$`,
        tex`$BC = \sqrt{${num(n)}} \approx ${num(hypotenuse, 2)}$ ${unit}`,
        tex`$K = ${num(a)} + ${num(b)} + ${num(hypotenuse, 2)} \approx ${num(k, 2)}$ ${unit}`,
        tex`A háromszög kerülete **${num(k, 2)} ${unit}**.`,
      ],
    };
  },
};

/** Multiple choice: the formula and a numeric distance with typical mistakes. */
const distanceMc: GeneratorDef = {
  id: 'distance-mc',
  title: 'A távolság kiszámítása (feleletválasztó)',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = 'egység';
    if (level === 1) {
      const A: XY = [1, 2];
      const B: XY = [4, 6];
      return {
        prompt: tex`Melyik képlettel számolható ki az $A(x_1; y_1)$ és $B(x_2; y_2)$ pontok távolsága?`,
        figure: distanceFigure(A, B),
        answer: textChoice(
          '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$',
          ['$d = |x_2 - x_1| + |y_2 - y_1|$', '$d = (x_2 - x_1)^2 + (y_2 - y_1)^2$', '$d = |x_2 - x_1| \\cdot |y_2 - y_1|$'],
        ),
        hint: 'A két pont és a segédpont derékszögű háromszöget alkot; a távolság az átfogó.',
        solution: [
          'A vízszintes befogó hossza $|x_2 - x_1|$, a függőlegesé $|y_2 - y_1|$.',
          'Pitagorasz tétele szerint $d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$, tehát $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.',
        ],
      };
    }
    const [dx, dy] = rng.pick(ROOT_DIFFS);
    const x = rng.int(-6, -2);
    const y = rng.int(-6, -2);
    const A: XY = [x, y];
    const B: XY = [x + dx, y + dy];
    const n = dx * dx + dy * dy;
    const root = simplifyRoot(n);
    return {
      prompt: tex`Mekkora az $A(${num(A[0])}; ${num(A[1])})$ és $B(${num(B[0])}; ${num(B[1])})$ pontok távolsága?`,
      figure: distanceFigure(A, B),
      answer: choice(rng, `$${texRoot(root.coef, root.radicand)}$`, [
        `$${num(dx + dy)}$`,
        `$${num(n)}$`,
        `$${num(Math.max(dx, dy))}$`,
      ]),
      hint: 'A koordináták különbségei a befogók; a távolság az átfogó.',
      solution: [
        tex`A különbségek: $${num(dx)}$ és $${num(dy)}$.`,
        tex`$d^2 = ${num(dx)}^2 + ${num(dy)}^2 = ${num(n)}$`,
        tex`$d = \sqrt{${num(n)}}${root.coef === 1 ? '' : tex` = ${texRoot(root.coef, root.radicand)}`}$ ${unit}.`,
        tex`${Article(num(dx + dy))} $${num(dx + dy)}$ a befogók összege, ${article(num(n))} $${num(n)}$ a $d^2$ — egyik sem a távolság.`,
      ],
    };
  },
};

/** Decide from the coordinates whether a triangle is right-angled / isosceles. */
const triangleType: GeneratorDef = {
  id: 'triangle-type',
  title: 'Derékszögű vagy egyenlő szárú a háromszög?',
  levels: [1, 2],
  generate(rng, level): Question {
    const shapes: { A: XY; B: XY; C: XY }[] = [
      { A: [0, 0], B: [4, 0], C: [0, 3] },
      { A: [0, 0], B: [4, 0], C: [0, 4] },
      { A: [0, 0], B: [6, 0], C: [3, 4] },
      { A: [0, 0], B: [6, 0], C: [2, 3] },
      { A: [0, 0], B: [5, 0], C: [0, 12] },
    ];
    const chosen = level === 1 ? rng.pick(shapes.slice(0, 3)) : rng.pick(shapes);
    const tx = rng.int(-3, 2);
    const ty = rng.int(-3, 2);
    const shift = (p: XY): XY => [p[0] + tx, p[1] + ty];
    const A = shift(chosen.A);
    const B = shift(chosen.B);
    const C = shift(chosen.C);
    const sq = (p: XY, q: XY) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    const ab = sq(A, B);
    const bc = sq(B, C);
    const ca = sq(C, A);
    const sorted = [ab, bc, ca].sort((x, y) => x - y);
    const isRight = sorted[0] + sorted[1] === sorted[2];
    const isIsosceles = ab === bc || bc === ca || ca === ab;
    const type = isRight && isIsosceles ? 'derékszögű és egyenlő szárú is' : isRight ? 'derékszögű' : isIsosceles ? 'egyenlő szárú' : 'egyik sem';
    return {
      prompt: tex`Az $A(${num(A[0])}; ${num(A[1])})$, $B(${num(B[0])}; ${num(B[1])})$ és $C(${num(C[0])}; ${num(C[1])})$ pontok háromszöge milyen?`,
      figure: triangleFigure(A, B, C),
      answer: textChoice(type, ['derékszögű', 'egyenlő szárú', 'derékszögű és egyenlő szárú is', 'egyik sem'].filter((t) => t !== type)),
      hint: 'Számítsd ki mindhárom oldal négyzetét! A legnagyobb négyzetet hasonlítsd a másik kettő összegéhez.',
      solution: [
        tex`$AB^2 = ${num(ab)}$, $BC^2 = ${num(bc)}$, $CA^2 = ${num(ca)}$.`,
        type === 'egyik sem'
          ? 'A legnagyobb négyzet nem egyenlő a másik kettő összegével, és nincs két egyenlő oldal — a háromszög **egyik sem**.'
          : type === 'egyenlő szárú'
            ? 'Két oldal négyzete egyenlő, de a legnagyobb nem a másik kettő összege — a háromszög **egyenlő szárú**.'
            : type === 'derékszögű'
              ? 'A két kisebb oldal négyzetének összege a legnagyobb négyzettel egyenlő — a háromszög **derékszögű**.'
              : 'Két oldal egyenlő, és a legnagyobb négyzet a másik kettő összege — a háromszög **derékszögű és egyenlő szárú is**.',
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-06',
  goals: [
    'kiszámítani két pont távolságát a koordináta-rendszerben,',
    'háromszög kerületét meghatározni a rácson,',
    'eldönteni a koordinátákból, hogy egy háromszög derékszögű vagy egyenlő szárú-e.',
  ],
  parts: [
    {
      title: 'Vízszintes és függőleges távolság',
      steps: [
        {
          type: 'theory',
          title: 'Ugyanaz az y vagy ugyanaz az x',
          body: 'Ha két pontnak ugyanaz az $y$-ja, a távolság $|x_2 - x_1|$. Ha ugyanaz az $x$-e, akkor $|y_2 - y_1|$.',
          figure: {
            type: 'coordinate',
            x: [0, 6],
            y: [0, 6],
            size: 'large',
            points: [
              { at: [1, 2], label: 'A' },
              { at: [5, 2], label: 'B' },
              { at: [1, 5], label: 'C' },
            ],
            segments: [
              { from: [1, 2], to: [5, 2], label: '4' },
              { from: [1, 2], to: [1, 5], label: '3' },
            ],
          },
          remember: 'Vízszintes: $|x_2 - x_1|$ · függőleges: $|y_2 - y_1|$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mekkora az $A(2; 3)$ és $B(7; 3)$ pontok távolsága?',
            answer: { type: 'number', value: 5, unit: 'egység' },
            inputLabel: '$d =$',
            hint: 'A két pont y-koordinátája ugyanaz, tehát vízszintes a szakasz.',
            solution: ['A közös y miatt a távolság $|7 - 2| = 5$ egység.'],
          },
        },
        {
          type: 'example',
          title: 'Vízszintes távolság',
          problem: 'Mekkora az $A(1; 2)$ és $B(6; 2)$ pontok távolsága?',
          figure: {
            type: 'coordinate',
            x: [0, 7],
            y: [0, 4],
            size: 'large',
            points: [
              { at: [1, 2], label: 'A' },
              { at: [6, 2], label: 'B' },
            ],
            segments: [{ from: [1, 2], to: [6, 2], label: '5' }],
          },
          steps: [
            { text: 'Mindkét pont y-koordinátája $2$.' },
            { text: 'A távolság: $|6 - 1| = 5$ egység.' },
          ],
          answer: 'A két pont távolsága **$5$ egység**.',
        },
        { type: 'practice', generator: 'distance', level: 1, count: 2 },
        { type: 'practice', generator: 'distance-mc', level: 1 },
      ],
    },
    {
      title: 'A derékszögű háromszög a rácson',
      steps: [
        {
          type: 'theory',
          title: 'A segédháromszög',
          body: 'Rajzolj a két ponton át vízszintes és függőleges szakaszt! A befogók $|x_2 - x_1|$ és $|y_2 - y_1|$, az átfogó a távolság.',
          figure: distanceFigure([1, 2], [4, 6], '5'),
          remember: '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Az $A(1; 1)$ és $B(4; 5)$ pontok távolsága $5$ egység.**',
            answer: { type: 'truefalse', value: true },
            hint: 'A különbségek $3$ és $4$; ismerős Pitagorasz-hármast kapsz.',
            solution: [
              'A különbségek: $|4 - 1| = 3$ és $|5 - 1| = 4$.',
              '$d^2 = 3^2 + 4^2 = 9 + 16 = 25$, így $d = 5$ — az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A távolság kiszámítása',
          problem: 'Mekkora az $A(1; 2)$ és $B(4; 6)$ pontok távolsága?',
          figure: distanceFigure([1, 2], [4, 6]),
          steps: [
            { text: 'Vízszintes különbség: $|4 - 1| = 3$.' },
            { text: 'Függőleges különbség: $|6 - 2| = 4$.' },
            { text: '$d^2 = 3^2 + 4^2 = 25$, így $d = 5$.' },
          ],
          answer: 'A két pont távolsága **$5$ egység**.',
        },
        { type: 'practice', generator: 'distance', level: 2, count: 2 },
        { type: 'practice', generator: 'distance-mc', level: 2 },
      ],
    },
    {
      title: 'Negatív koordináták',
      steps: [
        {
          type: 'theory',
          title: 'A mínuszjel nem zavar',
          body: 'A távolsághoz a koordináták különbségének abszolút értéke kell. A negatív koordinátáknál is ugyanaz a képlet.',
          figure: distanceFigure([-3, 1], [1, 4], '5'),
          remember: '$d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$',
        },
        {
          type: 'example',
          title: 'Negatív koordináták',
          problem: 'Mekkora az $A(-3; 1)$ és $B(1; 4)$ pontok távolsága?',
          figure: distanceFigure([-3, 1], [1, 4]),
          steps: [
            { text: 'Vízszintes különbség: $|1 - (-3)| = 4$.' },
            { text: 'Függőleges különbség: $|4 - 1| = 3$.' },
            { text: '$d^2 = 4^2 + 3^2 = 25$, így $d = 5$.' },
          ],
          answer: 'A két pont távolsága **$5$ egység**.',
        },
        { type: 'practice', generator: 'distance', level: 2, count: 2 },
        { type: 'practice', generator: 'distance', level: 3 },
        { type: 'practice', generator: 'perimeter', level: 2 },
      ],
    },
    {
      title: 'Háromszög a koordináta-rendszerben',
      steps: [
        {
          type: 'theory',
          title: 'Kerület és fajta',
          body: 'A kerület a három oldal összege. A három oldal négyzetéből eldöntheted, hogy a háromszög derékszögű-e, és azt is, hogy egyenlő szárú-e.',
          figure: triangleFigure([0, 0], [4, 0], [0, 3]),
          remember: 'Derékszögű: a két kisebb négyzet összege a legnagyobb.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Az $A(0; 0)$, $B(4; 0)$ és $C(0; 4)$ pontok háromszöge milyen?',
            answer: textChoice('derékszögű és egyenlő szárú is', ['derékszögű', 'egyenlő szárú', 'egyik sem']),
            hint: 'Számítsd ki az oldalak négyzetét: $16$, $16$ és $32$.',
            solution: [
              '$AB^2 = 16$, $AC^2 = 16$, $BC^2 = 32$.',
              'Két oldal egyenlő, és $16 + 16 = 32$, tehát **derékszögű és egyenlő szárú is**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Kerület a rácson',
          problem: 'Az $A(0; 0)$, $B(4; 0)$ és $C(0; 3)$ pontok háromszögének kerülete?',
          figure: triangleFigure([0, 0], [4, 0], [0, 3]),
          steps: [
            { text: '$AB = 4$, $AC = 3$ — tengelypárhuzamos oldalak.' },
            { text: '$BC^2 = 4^2 + 3^2 = 25$, így $BC = 5$.' },
            { text: '$K = 4 + 3 + 5 = 12$ egység.' },
          ],
          answer: 'A háromszög kerülete **$12$ egység**.',
        },
        { type: 'practice', generator: 'perimeter', level: 3 },
        { type: 'practice', generator: 'triangle-type', level: 1 },
        { type: 'practice', generator: 'triangle-type', level: 2 },
        { type: 'practice', generator: 'distance', level: 3 },
      ],
    },
  ],
  generators: [distance, perimeter, distanceMc, triangleType],
  miniTest: {
    items: [
      { generator: 'distance', level: 1 },
      { generator: 'distance-mc', level: 1 },
      { generator: 'distance', level: 2 },
      { generator: 'perimeter', level: 2 },
      { generator: 'triangle-type', level: 1 },
      { generator: 'distance', level: 3 },
      { generator: 'perimeter', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'distance', level: 1 },
    { generator: 'distance-mc', level: 1 },
    { generator: 'distance', level: 2 },
    { generator: 'perimeter', level: 2 },
    { generator: 'triangle-type', level: 1 },
    { generator: 'distance', level: 3 },
  ],
});
