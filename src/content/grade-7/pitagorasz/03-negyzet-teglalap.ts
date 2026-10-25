/**
 * 7. osztály › Pitagorasz tétele › 3. A Pitagorasz-tétel alkalmazása négyzetre és téglalapra
 *
 * The diagonal of a square (d = a√2) and of a rectangle (d² = a² + b²), the isosceles right
 * triangle as half a square, and reverse problems (side/area/perimeter from the diagonal).
 */
import {
  choice,
  clean,
  defineSubtopic,
  num,
  PYTHAGOREAN_TRIPLES,
  rootText,
  simplifyRoot,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** Triples with hypotenuse ≤ 20, so the rectangle stays a comfortable figure. */
const TRIPLES = PYTHAGOREAN_TRIPLES.filter(([, , c]) => c <= 20);

/** Non-triple leg pairs: the diagonal stays a root. */
const ROOT_PAIRS: [number, number][] = [
  [2, 3],
  [2, 5],
  [3, 5],
  [3, 6],
  [4, 5],
  [4, 6],
  [5, 6],
];

/** A square with the (dashed) diagonal and the right triangle ABC highlighted. */
function squareFigure(a: number, unit: string, diag = 'd = ?', opts: { unknownSide?: boolean } = {}): Figure {
  const side = opts.unknownSide ? 'a = ?' : `${num(a)} ${unit}`;
  return {
    type: 'quadrilateral',
    shape: 'square',
    a,
    sideLabels: { a: side },
    diagonals: { e: diag },
    highlight: ['e'],
    highlightTriangle: ['A', 'B', 'C'],
    fill: true,
  };
}

/** A rectangle with the diagonal and the right triangle ABC highlighted. */
function rectangleFigure(a: number, b: number, unit: string, diag = 'd = ?', opts: { unknownB?: boolean } = {}): Figure {
  return {
    type: 'quadrilateral',
    shape: 'rectangle',
    a,
    b,
    sideLabels: { a: `${num(a)} ${unit}`, b: opts.unknownB ? 'b = ?' : `${num(b)} ${unit}` },
    diagonals: { e: diag },
    highlight: ['e'],
    highlightTriangle: ['A', 'B', 'C'],
    fill: true,
  };
}

/** An isosceles right triangle with equal legs (right angle at C). */
function isoscelesRightFigure(a: number, unit: string, labels: { leg: string; hyp: string }): Figure {
  return {
    type: 'triangle',
    legs: [a, a],
    sideLabels: { a: labels.leg, c: labels.hyp },
    ticks: { a: 1, b: 1 },
    highlight: ['c'],
    fill: true,
  };
}

/** "√50 = 5√2" or "√34" — for solution lines. */
function rootSteps(n: number): string {
  const { coef, radicand } = simplifyRoot(n);
  if (radicand === 1) return tex`\sqrt{${num(n)}} = ${num(coef)}`;
  if (coef === 1) return tex`\sqrt{${num(n)}}`;
  return tex`\sqrt{${num(n)}} = ${texRoot(coef, radicand)}`;
}

function pickUnit(rng: { pick<T>(items: readonly T[]): T }): string {
  return rng.pick(['cm', 'cm', 'dm', 'm']);
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Diagonal of a square, d = a√2. */
const squareDiagonal: GeneratorDef = {
  id: 'square-diagonal',
  title: 'A négyzet átlója',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 3) {
      const a = rng.int(12, 30);
      const d = clean(a * Math.SQRT2);
      const saved = clean(2 * a - d);
      return {
        prompt: tex`Egy négyzet alakú park oldala $${num(a)}$ m. Átlósan vág át rajta. Hány méterrel rövidebb ez, mint két oldal mentén?`,
        figure: squareFigure(a, 'm'),
        answer: { type: 'number', value: saved, precision: 2, unit: 'm' },
        inputLabel: 'rövidebb:',
        hint: tex`Az átló ${article(num(a))} $${num(a)}$ méteres oldalból $a\sqrt{2}$. Hasonlítsd össze a két útvonal hosszát!`,
        solution: [
          tex`Az átló: $d = ${num(a)}\sqrt{2} \approx ${num(d, 2)}$ m.`,
          tex`Két oldal mentén: $${num(a)} + ${num(a)} = ${num(2 * a)}$ m.`,
          tex`A különbség: $${num(2 * a)} - ${num(d, 2)} \approx ${num(saved, 2)}$ m.`,
          tex`Az átlós út **${num(saved, 2)} m-rel** rövidebb.`,
        ],
      };
    }
    if (level === 2) {
      const a = rng.pick([0.5, 1.5, 2.5, 3.5, 4.5]);
      const d = clean(a * Math.SQRT2);
      return {
        prompt: tex`Egy négyzet oldala $${num(a)}$ ${unit}. Milyen hosszú az átlója? Két tizedesjegyre kerekíts!`,
        figure: squareFigure(a, unit),
        answer: { type: 'number', value: d, precision: 2, unit },
        inputLabel: '$d =$',
        hint: 'Az átló $a\\sqrt{2}$; helyettesítsd be az oldal hosszát, aztán számolj!',
        solution: [
          tex`$d = a\sqrt{2} = ${num(a)} \cdot \sqrt{2}$`,
          tex`$\sqrt{2} \approx 1,41$, ezért $d \approx ${num(d, 2)}$ ${unit}.`,
          tex`Az átló **${num(d, 2)} ${unit}**.`,
        ],
      };
    }
    const a = rng.int(2, 12);
    return {
      prompt: tex`Egy négyzet oldala $${num(a)}$ ${unit}. Milyen hosszú az átlója? (Gyökös alakban add meg!)`,
      figure: squareFigure(a, unit),
      answer: { type: 'root', coef: a, radicand: 2, unit },
      inputLabel: '$d =$',
      hint: 'Az átló a négyzetet két derékszögű háromszögre vágja; a két befogó az oldal.',
      solution: [
        tex`Az átló két derékszögű háromszöget vág ki, a befogók $${num(a)}$ ${unit} hosszúak.`,
        tex`$d^2 = ${num(a)}^2 + ${num(a)}^2 = ${num(a * a)} + ${num(a * a)} = ${num(2 * a * a)}$`,
        tex`$d = \sqrt{${num(2 * a * a)}} = ${num(a)}\sqrt{2}$`,
        tex`Az átló **$${num(a)}\sqrt{2}$ ${unit}**.`,
      ],
    };
  },
};

/** Reverse: side or area from the diagonal of a square. */
const squareReverse: GeneratorDef = {
  id: 'square-reverse',
  title: 'Oldal és terület az átlóból',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const k = rng.int(2, 12);
      return {
        prompt: tex`Egy négyzet átlója $${num(k)}\sqrt{2}$ ${unit}. Milyen hosszú az oldala?`,
        figure: squareFigure(k, unit, `${rootText(k, 2)} ${unit}`, { unknownSide: true }),
        answer: { type: 'number', value: k, unit },
        inputLabel: '$a =$',
        hint: 'A négyzet átlója az oldal $\\sqrt{2}$-szöröse. Melyik szám $\\sqrt{2}$-szöröse az adott átló?',
        solution: [
          tex`$d^2 = 2a^2$, ezért $a^2 = d^2 : 2$.`,
          tex`$a^2 = (${num(k)}\sqrt{2})^2 : 2 = ${num(2 * k * k)} : 2 = ${num(k * k)}$`,
          tex`$a = \sqrt{${num(k * k)}} = ${num(k)}$`,
          tex`A négyzet oldala **${num(k)} ${unit}**.`,
        ],
      };
    }
    if (level === 2) {
      const k = rng.int(2, 10);
      return {
        prompt: tex`Egy négyzet átlója $${num(k)}\sqrt{2}$ ${unit}. Mekkora a területe?`,
        figure: squareFigure(k, unit, `${rootText(k, 2)} ${unit}`, { unknownSide: true }),
        answer: { type: 'number', value: k * k, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'Előbb az oldalt keresd meg az átlóból, aztán számold ki a négyzet területét!',
        solution: [
          tex`$a^2 = d^2 : 2 = (${num(k)}\sqrt{2})^2 : 2 = ${num(2 * k * k)} : 2 = ${num(k * k)}$`,
          tex`$a = ${num(k)}$ ${unit}`,
          tex`$T = a^2 = ${num(k)}^2 = ${num(k * k)}$ ${unit}²`,
          tex`A négyzet területe **${num(k * k)} ${unit}²**.`,
        ],
      };
    }
    const d = rng.int(6, 14);
    const a = clean(d / Math.SQRT2);
    return {
      prompt: tex`Egy négyzet átlója $${num(d)}$ ${unit}. Milyen hosszú az oldala? Két tizedesjegyre kerekíts!`,
      figure: squareFigure(a, unit, `${num(d)} ${unit}`, { unknownSide: true }),
      answer: { type: 'number', value: a, precision: 2, unit },
      inputLabel: '$a =$',
      hint: 'A $d^2 = 2a^2$ összefüggésből $a^2 = d^2 : 2$.',
      solution: [
        tex`$a^2 = d^2 : 2 = ${num(d)}^2 : 2 = ${num(d * d)} : 2 = ${num(clean((d * d) / 2))}$`,
        tex`$a = \sqrt{${num(clean((d * d) / 2))}} \approx ${num(a, 2)}$`,
        tex`A négyzet oldala **${num(a, 2)} ${unit}**.`,
      ],
    };
  },
};

/** Diagonal of a rectangle, d² = a² + b². */
const rectangleDiagonal: GeneratorDef = {
  id: 'rectangle-diagonal',
  title: 'A téglalap átlója',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [x, y, c] = rng.pick(TRIPLES);
      const [a, b] = rng.shuffle([x, y]);
      return {
        prompt: tex`Egy téglalap oldalai $${num(a)}$ ${unit} és $${num(b)}$ ${unit}. Milyen hosszú az átlója?`,
        figure: rectangleFigure(a, b, unit),
        answer: { type: 'number', value: c, unit },
        inputLabel: '$d =$',
        hint: 'Az átló a téglalapot derékszögű háromszögre vágja: az oldalak a befogók.',
        solution: [
          tex`Az átló ${article(num(a))} $${num(a)}$ és $${num(b)}$ befogójú derékszögű háromszög átfogója.`,
          tex`$d^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(c * c)}$`,
          tex`$d = \sqrt{${num(c * c)}} = ${num(c)}$`,
          tex`A téglalap átlója **${num(c)} ${unit}**.`,
        ],
      };
    }
    if (level === 3) {
      const [x, y, c] = rng.pick(TRIPLES.filter(([, , z]) => z >= 10));
      const [a, b] = rng.shuffle([x, y]);
      const p = 2 * (a + b);
      return {
        prompt: tex`Egy téglalap átlója $${num(c)}$ ${unit}, az egyik oldala $${num(a)}$ ${unit}. Mekkora a kerülete?`,
        figure: rectangleFigure(a, b, unit, `${num(c)} ${unit}`, { unknownB: true }),
        answer: { type: 'number', value: p, unit },
        inputLabel: '$K =$',
        hint: 'Előbb a másik oldalt keresd meg: $b^2 = d^2 - a^2$. Utána jön a kerület.',
        solution: [
          tex`Az átló az átfogó: $d = ${num(c)}$, az egyik befogó $a = ${num(a)}$.`,
          tex`$b^2 = d^2 - a^2 = ${num(c * c)} - ${num(a * a)} = ${num(b * b)}$`,
          tex`$b = \sqrt{${num(b * b)}} = ${num(b)}$ ${unit}`,
          tex`$K = 2 \cdot (a + b) = 2 \cdot (${num(a)} + ${num(b)}) = ${num(p)}$`,
          tex`A téglalap kerülete **${num(p)} ${unit}**.`,
        ],
      };
    }
    const [a, b] = rng.pick(ROOT_PAIRS);
    const n = a * a + b * b;
    const root = simplifyRoot(n);
    return {
      prompt: tex`Egy téglalap oldalai $${num(a)}$ ${unit} és $${num(b)}$ ${unit}. Milyen hosszú az átlója? (Gyökös alakban add meg!)`,
      figure: rectangleFigure(a, b, unit),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
      inputLabel: '$d =$',
      hint: 'Írd fel Pitagorasz tételét az átlóra: $d^2 = a^2 + b^2$, aztán vonj gyököt!',
      solution: [
        tex`$d^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(n)}$`,
        tex`$d = ${rootSteps(n)} \approx ${num(Math.sqrt(n), 2)}$`,
        tex`A téglalap átlója **$${texRoot(root.coef, root.radicand)}$ ${unit}**.`,
      ],
    };
  },
};

/** The isosceles right triangle (half a square). */
const isoscelesRight: GeneratorDef = {
  id: 'isosceles-right',
  title: 'Egyenlő szárú derékszögű háromszög',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const a = rng.int(2, 12);
      return {
        prompt: tex`Egy egyenlő szárú derékszögű háromszög befogói $${num(a)}$ ${unit} hosszúak. Milyen hosszú az átfogója?`,
        figure: isoscelesRightFigure(a, unit, { leg: `${num(a)} ${unit}`, hyp: 'c = ?' }),
        answer: { type: 'root', coef: a, radicand: 2, unit },
        inputLabel: '$c =$',
        hint: 'A két befogó egyenlő: $c^2 = a^2 + a^2 = 2a^2$.',
        solution: [
          tex`A befogók egyenlők: $a = b = ${num(a)}$ ${unit}.`,
          tex`$c^2 = ${num(a)}^2 + ${num(a)}^2 = ${num(2 * a * a)}$`,
          tex`$c = \sqrt{${num(2 * a * a)}} = ${num(a)}\sqrt{2}$`,
          tex`Az átfogó **$${num(a)}\sqrt{2}$ ${unit}**.`,
        ],
      };
    }
    if (level === 2) {
      const k = rng.int(2, 10);
      return {
        prompt: tex`Egy egyenlő szárú derékszögű háromszög átfogója $${num(k)}\sqrt{2}$ ${unit}. Milyen hosszú a befogója?`,
        figure: isoscelesRightFigure(k, unit, { leg: 'a = ?', hyp: `${rootText(k, 2)} ${unit}` }),
        answer: { type: 'number', value: k, unit },
        inputLabel: '$a =$',
        hint: 'Az átfogó a befogó $\\sqrt{2}$-szöröse. Melyik szám $\\sqrt{2}$-szöröse az adott átfogó?',
        solution: [
          tex`$c^2 = 2a^2$, ezért $a^2 = c^2 : 2$.`,
          tex`$a^2 = (${num(k)}\sqrt{2})^2 : 2 = ${num(2 * k * k)} : 2 = ${num(k * k)}$`,
          tex`$a = \sqrt{${num(k * k)}} = ${num(k)}$`,
          tex`A befogó **${num(k)} ${unit}**.`,
        ],
      };
    }
    const h = 2 * rng.int(3, 8);
    const area = (h * h) / 4;
    const legSquare = (h * h) / 2;
    const legRoot = simplifyRoot(legSquare);
    return {
      prompt: tex`Egy egyenlő szárú derékszögű háromszög átfogója $${num(h)}$ ${unit}. Mekkora a területe?`,
      figure: isoscelesRightFigure(h / Math.SQRT2, unit, { leg: 'a = ?', hyp: `${num(h)} ${unit}` }),
      answer: { type: 'number', value: area, unit: `${unit}²` },
      inputLabel: '$T =$',
      hint: 'A területhez előbb a befogó kell. Az átfogóból $a = c : \\sqrt{2}$.',
      solution: [
        tex`A befogó: $a^2 = c^2 : 2 = ${num(h)}^2 : 2 = ${num(h * h)} : 2 = ${num(legSquare)}$`,
        tex`$a = ${texRoot(legRoot.coef, legRoot.radicand)}$ ${unit}`,
        tex`$T = a^2 : 2 = ${num(legSquare)} : 2 = ${num(area)}$ ${unit}²`,
        tex`A háromszög területe **${num(area)} ${unit}²**.`,
      ],
    };
  },
};

/** Multiple choice with the typical diagonal mistakes. */
const diagonalMc: GeneratorDef = {
  id: 'diagonal-mc',
  title: 'Az átló kiszámítása (feleletválasztó)',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(3, 9);
      const correct = tex`$${num(a)}\sqrt{2}$`;
      return {
        prompt: tex`Egy négyzet oldala $${num(a)}$ cm. Melyik a négyzet átlója?`,
        figure: squareFigure(a, 'cm'),
        answer: choice(rng, correct, [tex`$${num(2 * a)}$`, tex`$${num(a * a)}$`, tex`$${num(2 * a * a)}$`]),
        hint: 'Az átló a négyzetet két egyenlő szárú derékszögű háromszögre vágja.',
        solution: [
          tex`$d^2 = a^2 + a^2 = 2a^2$, ezért $d = a\sqrt{2}$.`,
          tex`$d = ${num(a)}\sqrt{2}$ cm.`,
          tex`${Article(num(2 * a))} $${num(2 * a)}$ a kétszeres oldal, ${article(num(a * a))} $${num(a * a)}$ a terület, ${article(num(2 * a * a))} $${num(2 * a * a)}$ pedig $d^2$ — egyik sem az átló.`,
        ],
      };
    }
    const [a, b] = rng.pick(ROOT_PAIRS);
    const n = a * a + b * b;
    const root = simplifyRoot(n);
    const correct = tex`$${texRoot(root.coef, root.radicand)}$`;
    return {
      prompt: tex`Egy téglalap oldalai $${num(a)}$ cm és $${num(b)}$ cm. Melyik az átlója?`,
      figure: rectangleFigure(a, b, 'cm'),
      answer: choice(rng, correct, [tex`$${num(a + b)}$`, tex`$${num(n)}$`, tex`$${num(2 * (a + b))}$`]),
      hint: 'Az átló a téglalapot derékszögű háromszögre vágja; a két oldal a befogó.',
      solution: [
        tex`$d^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(n)}$`,
        tex`$d = ${rootSteps(n)}$ cm.`,
        tex`${Article(num(a + b))} $${num(a + b)}$ az oldalak összege, ${article(num(n))} $${num(n)}$ a $d^2$, ${article(num(2 * (a + b)))} $${num(2 * (a + b))}$ a kerület.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-03',
  goals: [
    'kiszámítani a négyzet és a téglalap átlóját,',
    'felismerni az egyenlő szárú derékszögű háromszöget a négyzet felében,',
    'az átlóból visszaszámolni az oldalt, a területet vagy a kerületet.',
  ],
  parts: [
    {
      title: 'A négyzet átlója',
      steps: [
        {
          type: 'theory',
          title: 'A négyzet átlója',
          body: 'Az átló két egyenlő szárú derékszögű háromszögre vágja a négyzetet. A befogók az oldalak, az átló az átfogó.',
          figure: squareFigure(6, 'cm'),
          remember: '$d^2 = a^2 + a^2 = 2a^2$, ezért $d = a\\sqrt{2}$.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik összefüggés igaz a négyzet $a$ oldalára és $d$ átlójára?',
            answer: textChoice('$d = a\\sqrt{2}$', ['$d = 2a$', '$d = a^2$', '$d = a : 2$']),
            hint: 'Az átló az átfogó, a két oldal a befogó. Írd fel Pitagorasz tételét!',
            solution: ['$d^2 = a^2 + a^2 = 2a^2$.', 'Gyököt vonva: $d = a\\sqrt{2}$, mert $a > 0$.'],
          },
        },
        {
          type: 'example',
          title: 'A négyzet átlója',
          problem: 'Egy négyzet oldala $6$ cm. Milyen hosszú az átlója?',
          figure: squareFigure(6, 'cm'),
          steps: [
            { text: '$d^2 = 6^2 + 6^2 = 36 + 36 = 72$' },
            { text: '$d = \\sqrt{72} = 6\\sqrt{2}$' },
            { text: '$6\\sqrt{2} \\approx 8,49$, tehát az átló kb. $8,49$ cm.' },
          ],
          answer: 'Az átló **$6\\sqrt{2}$ cm** (kb. $8,49$ cm).',
        },
        { type: 'practice', generator: 'square-diagonal', level: 1, count: 2 },
        { type: 'practice', generator: 'diagonal-mc', level: 1 },
      ],
    },
    {
      title: 'A téglalap átlója',
      steps: [
        {
          type: 'theory',
          title: 'A téglalap átlója',
          body: 'Az átló derékszögű háromszöget vág ki: a két oldal a befogó, az átló az átfogó.',
          figure: rectangleFigure(3, 4, 'cm'),
          remember: '$d^2 = a^2 + b^2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A téglalap átlója hosszabb mindkét oldalánál.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Az átló az átfogó, az oldalak a befogók. Melyik a leghosszabb oldal?',
            solution: [
              'Az átfogó mindig hosszabb mindkét befogónál.',
              'Ezért az átló valóban hosszabb mindkét oldalnál — az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A téglalap átlója',
          problem: 'Egy téglalap oldalai $6$ cm és $8$ cm. Milyen hosszú az átlója?',
          figure: rectangleFigure(6, 8, 'cm'),
          steps: [
            { text: '$d^2 = 6^2 + 8^2 = 36 + 64 = 100$' },
            { text: '$d = \\sqrt{100} = 10$' },
            { text: 'Ellenőrzés: $10 > 8$ és $10 > 6$. ✓' },
          ],
          answer: 'A téglalap átlója **$10$ cm**.',
        },
        { type: 'practice', generator: 'rectangle-diagonal', level: 1, count: 2 },
        { type: 'practice', generator: 'rectangle-diagonal', level: 2 },
        { type: 'practice', generator: 'diagonal-mc', level: 2 },
      ],
    },
    {
      title: 'Visszafelé: oldal és terület',
      steps: [
        {
          type: 'theory',
          title: 'Az átlóból az oldal',
          body: 'A négyzetnél $d^2 = 2a^2$, ezért $a^2 = d^2 : 2$. Ha $d = k\\sqrt{2}$, akkor az oldal $k$.',
          remember: '$a^2 = d^2 : 2$',
        },
        {
          type: 'example',
          title: 'Oldal és terület az átlóból',
          problem: 'Egy négyzet átlója $8\\sqrt{2}$ cm. Milyen hosszú az oldala, és mekkora a területe?',
          figure: squareFigure(8, 'cm', '8√2 cm', { unknownSide: true }),
          steps: [
            { text: '$a^2 = (8\\sqrt{2})^2 : 2 = 128 : 2 = 64$' },
            { text: '$a = \\sqrt{64} = 8$ cm' },
            { text: '$T = a^2 = 8^2 = 64$ cm²' },
          ],
          answer: 'Az oldal **$8$ cm**, a terület **$64$ cm²**.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Ha egy négyzet átlója $10$ cm, akkor az oldala $5$ cm.**',
            answer: { type: 'truefalse', value: false },
            hint: 'Az átló nem kétszerese az oldalnak, hanem $\\sqrt{2}$-szöröse.',
            solution: [
              '$a^2 = 10^2 : 2 = 100 : 2 = 50$',
              '$a = \\sqrt{50} \\approx 7,07$ cm, nem $5$ cm — az állítás **hamis**.',
            ],
          },
        },
        { type: 'practice', generator: 'square-reverse', level: 1, count: 2 },
        { type: 'practice', generator: 'square-reverse', level: 2 },
        { type: 'practice', generator: 'isosceles-right', level: 2 },
      ],
    },
    {
      title: 'Egyenlő szárú derékszögű háromszög',
      steps: [
        {
          type: 'theory',
          title: 'A négyzet fele',
          body: 'A négyzet átlója két egyenlő szárú derékszögű háromszöget ad. A befogók egyenlők, a szögek $45°$, $45°$ és $90°$.',
          figure: isoscelesRightFigure(5, 'cm', { leg: 'a', hyp: 'a√2' }),
          remember: 'Az átfogó a befogó $\\sqrt{2}$-szöröse.',
        },
        {
          type: 'example',
          title: 'Befogó az átfogóból',
          problem: 'Egy egyenlő szárú derékszögű háromszög átfogója $10\\sqrt{2}$ cm. Mekkora a befogója?',
          figure: isoscelesRightFigure(10, 'cm', { leg: 'a = ?', hyp: '10√2 cm' }),
          steps: [
            { text: '$c^2 = 2a^2$, ezért $a^2 = c^2 : 2$' },
            { text: '$a^2 = (10\\sqrt{2})^2 : 2 = 200 : 2 = 100$' },
            { text: '$a = \\sqrt{100} = 10$ cm' },
          ],
          answer: 'A befogó **$10$ cm**.',
        },
        { type: 'practice', generator: 'isosceles-right', level: 1, count: 2 },
        { type: 'practice', generator: 'isosceles-right', level: 3 },
        { type: 'practice', generator: 'square-diagonal', level: 2 },
        { type: 'practice', generator: 'square-reverse', level: 3 },
      ],
    },
  ],
  generators: [squareDiagonal, squareReverse, rectangleDiagonal, isoscelesRight, diagonalMc],
  miniTest: {
    items: [
      { generator: 'square-diagonal', level: 1 },
      { generator: 'diagonal-mc', level: 1 },
      { generator: 'rectangle-diagonal', level: 1 },
      { generator: 'square-reverse', level: 1 },
      { generator: 'isosceles-right', level: 2 },
      { generator: 'rectangle-diagonal', level: 2 },
      { generator: 'isosceles-right', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'square-diagonal', level: 1 },
    { generator: 'rectangle-diagonal', level: 1 },
    { generator: 'square-reverse', level: 1 },
    { generator: 'diagonal-mc', level: 1 },
    { generator: 'rectangle-diagonal', level: 2 },
    { generator: 'isosceles-right', level: 2 },
  ],
});
