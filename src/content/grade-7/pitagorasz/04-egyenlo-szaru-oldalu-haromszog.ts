/**
 * 7. osztály › Pitagorasz tétele › 4. A Pitagorasz-tétel alkalmazása egyenlő szárú és
 * egyenlő oldalú háromszögre
 *
 * Height to the base of an isosceles triangle, height and area of an equilateral triangle,
 * and the 30°–60°–90° triangle as half of an equilateral one, with reverse problems.
 */
import {
  choice,
  defineSubtopic,
  num,
  rootText,
  simplifyRoot,
  suffix,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** An isosceles triangle with base a (BC) and equal legs b = c; the height goes from A to BC. */
function isoscelesFigure(
  base: number,
  leg: number,
  height: number,
  unit: string,
  opts: { unknownHeight?: boolean; unknownLeg?: boolean } = {},
): Figure {
  return {
    type: 'triangle',
    coords: [
      [base / 2, height],
      [0, 0],
      [base, 0],
    ],
    vertices: ['A', 'B', 'C'],
    sideLabels: {
      a: `${num(base)} ${unit}`,
      b: opts.unknownLeg ? 'b = ?' : `${num(leg)} ${unit}`,
    },
    heights: [{ from: 'A', label: opts.unknownHeight ? 'm = ?' : `m = ${num(height, 2)}` }],
    ticks: { b: 1, c: 1 },
    fill: true,
  };
}

/** An equilateral triangle with side a and height m. */
function equilateralFigure(
  a: number,
  m: number,
  unit: string,
  opts: { unknownHeight?: boolean; unknownSide?: boolean } = {},
): Figure {
  return {
    type: 'triangle',
    coords: [
      [a / 2, m],
      [0, 0],
      [a, 0],
    ],
    vertices: ['A', 'B', 'C'],
    sideLabels: { a: opts.unknownSide ? 'a = ?' : `${num(a)} ${unit}` },
    heights: [{ from: 'A', label: opts.unknownHeight ? 'm = ?' : `m = ${num(m, 2)}` }],
    ticks: { a: 1, b: 1, c: 1 },
    fill: true,
  };
}

/** A 30°–60°–90° triangle with short leg b = x, long leg a = x√3 and hypotenuse c = 2x. */
function right306090Figure(
  x: number,
  unit: string,
  labels: { long?: string; short?: string; hyp?: string },
): Figure {
  return {
    type: 'triangle',
    coords: [
      [0, x],
      [x * Math.sqrt(3), 0],
      [0, 0],
    ],
    vertices: ['A', 'B', 'C'],
    rightAngleAt: 'C',
    sideLabels: { a: labels.long, b: labels.short, c: labels.hyp },
    angleLabels: { A: '60°', B: '30°' },
    fill: true,
  };
}

function pickUnit(rng: { pick<T>(items: readonly T[]): T }): string {
  return rng.pick(['cm', 'cm', 'dm', 'm']);
}

/** Base, height, leg triples of an isosceles right triangle (half base, height, leg). */
const ISO_TRIPLES: [number, number, number][] = [
  [6, 4, 5],
  [8, 3, 5],
  [10, 12, 13],
  [12, 8, 10],
  [16, 6, 10],
];

/** Base + leg pairs where the height is not an integer. */
const ISO_ROOT_PAIRS: [number, number][] = [
  [6, 4],
  [8, 6],
  [10, 7],
  [12, 8],
  [10, 6],
  [14, 9],
];

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Height of an isosceles triangle from the base and a leg. */
const isoscelesHeight: GeneratorDef = {
  id: 'isosceles-height',
  title: 'Az egyenlő szárú háromszög magassága',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [base, m, leg] = rng.pick(ISO_TRIPLES);
      return {
        prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, szára $${num(leg)}$ ${unit}. Milyen magas?`,
        figure: isoscelesFigure(base, leg, m, unit, { unknownHeight: true }),
        answer: { type: 'number', value: m, unit },
        inputLabel: '$m =$',
        hint: 'A magasság felezi az alapot. A derékszögű háromszög befogói $a : 2$ és $m$, átfogója a szár.',
        solution: [
          tex`A magasság talppontja felezi az alapot: $${num(base)} : 2 = ${num(base / 2)}$ ${unit}.`,
          tex`A derékszögű háromszögben $m^2 + ${num(base / 2)}^2 = ${num(leg)}^2$.`,
          tex`$m^2 = ${num(leg)}^2 - ${num(base / 2)}^2 = ${num(leg * leg)} - ${num((base / 2) ** 2)} = ${num(m * m)}$`,
          tex`$m = \sqrt{${num(m * m)}} = ${num(m)}$`,
          tex`A háromszög **${num(m)} ${unit}** magas.`,
        ],
      };
    }
    const [base, leg] = rng.pick(ISO_ROOT_PAIRS);
    const diff = leg * leg - (base / 2) ** 2;
    const root = simplifyRoot(diff);
    const m = Math.sqrt(diff);
    return {
      prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, szára $${num(leg)}$ ${unit}. Milyen magas? (Gyökös alakban add meg!)`,
      figure: isoscelesFigure(base, leg, m, unit, { unknownHeight: true }),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
      inputLabel: '$m =$',
      hint: 'Az alap felével és a magassággal derékszögű háromszöget kapsz; a szár az átfogó.',
      solution: [
        tex`Az alap fele: $${num(base)} : 2 = ${num(base / 2)}$ ${unit}.`,
        tex`$m^2 = ${num(leg)}^2 - ${num(base / 2)}^2 = ${num(leg * leg)} - ${num((base / 2) ** 2)} = ${num(diff)}$`,
        tex`$m = \sqrt{${num(diff)}}${root.coef === 1 ? '' : tex` = ${texRoot(root.coef, root.radicand)}`} \approx ${num(m, 2)}$`,
        tex`A háromszög **$${texRoot(root.coef, root.radicand)}$ ${unit}** magas.`,
      ],
    };
  },
};

/** Reverse: leg from the base and the height, or area from the base and a leg. */
const isoscelesReverse: GeneratorDef = {
  id: 'isosceles-reverse',
  title: 'Szár és terület egyenlő szárú háromszögnél',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 2) {
      const [base, m, leg] = rng.pick(ISO_TRIPLES);
      return {
        prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, magassága $${num(m)}$ ${unit}. Milyen hosszú a szára?`,
        figure: isoscelesFigure(base, leg, m, unit, { unknownLeg: true }),
        answer: { type: 'number', value: leg, unit },
        inputLabel: '$b =$',
        hint: 'A magasság derékszögű háromszöget vág ki: a befogók $a : 2$ és $m$, az átfogó a szár.',
        solution: [
          tex`Az alap fele: $${num(base)} : 2 = ${num(base / 2)}$ ${unit}.`,
          tex`A szár az átfogó: $b^2 = ${num(base / 2)}^2 + ${num(m)}^2 = ${num((base / 2) ** 2)} + ${num(m * m)} = ${num(leg * leg)}$`,
          tex`$b = \sqrt{${num(leg * leg)}} = ${num(leg)}$`,
          tex`A szár **${num(leg)} ${unit}** hosszú.`,
        ],
      };
    }
    const [base, m, leg] = rng.pick(ISO_TRIPLES);
    const area = (base * m) / 2;
    return {
      prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, szára $${num(leg)}$ ${unit}. Mekkora a területe?`,
      figure: isoscelesFigure(base, leg, m, unit, { unknownHeight: true }),
      answer: { type: 'number', value: area, unit: `${unit}²` },
      inputLabel: '$T =$',
      hint: 'Előbb a magasságot számítsd ki, aztán $T = a \\cdot m : 2$.',
      solution: [
        tex`A ${num(base)}-${suffix(base, 'nak', 'nek')} a fele $${num(base / 2)}$ ${unit}.`,
        tex`$m^2 = ${num(leg)}^2 - ${num(base / 2)}^2 = ${num(leg * leg)} - ${num((base / 2) ** 2)} = ${num(m * m)}$`,
        tex`$m = ${num(m)}$ ${unit}`,
        tex`$T = ${num(base)} \cdot ${num(m)} : 2 = ${num(area)}$ ${unit}²`,
        tex`A háromszög területe **${num(area)} ${unit}²**.`,
      ],
    };
  },
};

/** Height of an equilateral triangle. */
const equilateralHeight: GeneratorDef = {
  id: 'equilateral-height',
  title: 'Az egyenlő oldalú háromszög magassága',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const a = 2 * rng.int(1, 6);
      const m = (a * Math.sqrt(3)) / 2;
      const coef = a / 2;
      return {
        prompt: tex`Egy egyenlő oldalú háromszög oldala $${num(a)}$ ${unit}. Milyen magas? (Gyökös alakban add meg!)`,
        figure: equilateralFigure(a, m, unit, { unknownHeight: true }),
        answer: { type: 'root', coef, radicand: 3, unit },
        inputLabel: '$m =$',
        hint: 'A magasság az alapot két egyenlő részre osztja: $m^2 = a^2 - (a : 2)^2$.',
        solution: [
          tex`Az alap fele: $${num(a)} : 2 = ${num(a / 2)}$ ${unit}.`,
          tex`$m^2 = ${num(a)}^2 - ${num(a / 2)}^2 = ${num(a * a)} - ${num((a / 2) ** 2)} = ${num((3 * a * a) / 4)}$`,
          tex`$m = \frac{${num(a)}\sqrt{3}}{2} = ${texRoot(coef, 3)}$`,
          tex`A háromszög **$${texRoot(coef, 3)}$ ${unit}** magas.`,
        ],
      };
    }
    const k = rng.int(2, 8);
    const a = 2 * k;
    const m = k * Math.sqrt(3);
    return {
      prompt: tex`Egy egyenlő oldalú háromszög magassága $${num(k)}\sqrt{3}$ ${unit}. Milyen hosszú az oldala?`,
      figure: equilateralFigure(a, m, unit, { unknownSide: true }),
      answer: { type: 'number', value: a, unit },
      inputLabel: '$a =$',
      hint: 'A magasság az oldal $\\sqrt{3} : 2$-szerese. Melyik oldalnak a $\\sqrt{3} : 2$-szerese az adott magasság?',
      solution: [
        tex`$m = a \cdot \sqrt{3} : 2$, ezért $a = 2m : \sqrt{3}$.`,
        tex`$a = 2 \cdot ${num(k)}\sqrt{3} : \sqrt{3} = ${num(a)}$`,
        tex`Az oldal **${num(a)} ${unit}** hosszú.`,
      ],
    };
  },
};

/** Area of an equilateral triangle, and from the perimeter. */
const equilateralArea: GeneratorDef = {
  id: 'equilateral-area',
  title: 'Az egyenlő oldalú háromszög területe',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 2) {
      const a = 2 * rng.int(1, 5);
      const m = (a * Math.sqrt(3)) / 2;
      const coef = (a * a) / 4;
      return {
        prompt: tex`Egy egyenlő oldalú háromszög oldala $${num(a)}$ ${unit}. Mekkora a területe? (Gyökös alakban add meg!)`,
        figure: equilateralFigure(a, m, unit, { unknownHeight: true }),
        answer: { type: 'root', coef, radicand: 3, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'Előbb a magasság kell: $m = a\\sqrt{3} : 2$, aztán $T = a \\cdot m : 2$.',
        solution: [
          tex`A magasság: $m = ${num(a)}\sqrt{3} : 2 = ${texRoot(a / 2, 3)}$ ${unit}.`,
          tex`$T = ${num(a)} \cdot ${texRoot(a / 2, 3)} : 2 = ${texRoot(coef, 3)}$ ${unit}²`,
          tex`A háromszög területe **$${texRoot(coef, 3)}$ ${unit}²**.`,
        ],
      };
    }
    const a = 2 * rng.int(1, 4);
    const perimeter = 3 * a;
    const m = (a * Math.sqrt(3)) / 2;
    const coef = (a * a) / 4;
    return {
      prompt: tex`Egy egyenlő oldalú háromszög kerülete $${num(perimeter)}$ ${unit}. Mekkora a területe? (Gyökös alakban add meg!)`,
      figure: equilateralFigure(a, m, unit, { unknownSide: true, unknownHeight: true }),
      answer: { type: 'root', coef, radicand: 3, unit: `${unit}²` },
      inputLabel: '$T =$',
      hint: 'A kerületből előbb az oldalt kapod meg: $a = K : 3$.',
      solution: [
        tex`Az oldal: $a = ${num(perimeter)} : 3 = ${num(a)}$ ${unit}.`,
        tex`A magasság: $m = ${num(a)}\sqrt{3} : 2 = ${texRoot(a / 2, 3)}$ ${unit}.`,
        tex`$T = ${num(a)} \cdot ${texRoot(a / 2, 3)} : 2 = ${texRoot(coef, 3)}$ ${unit}²`,
        tex`A háromszög területe **$${texRoot(coef, 3)}$ ${unit}²**.`,
      ],
    };
  },
};

/** The 30°–60°–90° triangle as half of an equilateral triangle. */
const halfEquilateral: GeneratorDef = {
  id: 'half-equilateral',
  title: 'A 30°–60°–90° háromszög',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const c = 2 * rng.int(2, 8);
      const x = c / 2;
      const coef = x;
      return {
        prompt: tex`Egy $30°$–$60°$–$90°$-os háromszög átfogója $${num(c)}$ ${unit}. Milyen hosszú a hosszabb befogója?`,
        figure: right306090Figure(x, unit, { long: 'a = ?', short: `${num(x)} ${unit}`, hyp: `${num(c)} ${unit}` }),
        answer: { type: 'root', coef, radicand: 3, unit },
        inputLabel: '$a =$',
        hint: 'A rövidebb befogó az átfogó fele. A hosszabbra Pitagorasz tételét írd fel!',
        solution: [
          tex`A rövidebb befogó az átfogó fele: $${num(c)} : 2 = ${num(x)}$ ${unit}.`,
          tex`$a^2 = ${num(c)}^2 - ${num(x)}^2 = ${num(c * c)} - ${num(x * x)} = ${num(3 * x * x)}$`,
          tex`$a = ${num(x)}\sqrt{3}$ ${unit}`,
          tex`A hosszabb befogó **$${num(x)}\sqrt{3}$ ${unit}**.`,
        ],
      };
    }
    const k = rng.int(2, 8);
    const c = 2 * k;
    const long = k * Math.sqrt(3);
    return {
      prompt: tex`Egy $30°$–$60°$–$90°$-os háromszög hosszabb befogója $${num(k)}\sqrt{3}$ ${unit}. Milyen hosszú az átfogója?`,
      figure: right306090Figure(k, unit, { long: `${rootText(k, 3)} ${unit}`, short: 'b = ?', hyp: 'c = ?' }),
      answer: { type: 'number', value: c, unit },
      inputLabel: '$c =$',
      hint: 'A hosszabb befogó az átfogó $\\sqrt{3} : 2$-szerese. Melyik számnak a $\\sqrt{3} : 2$-szerese az adott hossz?',
      solution: [
        tex`A hosszabb befogó: $a = c\sqrt{3} : 2$.`,
        tex`$c = 2a : \sqrt{3} = 2 \cdot ${num(k)}\sqrt{3} : \sqrt{3} = ${num(c)}$`,
        tex`Az átfogó **${num(c)} ${unit}** hosszú.`,
      ],
    };
  },
};

/** Multiple choice: the formula, then a numeric height with typical mistakes. */
const isoscelesMc: GeneratorDef = {
  id: 'isosceles-mc',
  title: 'Melyik a magasság? (feleletválasztó)',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [base, m, leg] = rng.pick(ISO_TRIPLES);
      return {
        prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, szára $${num(leg)}$ ${unit}. Melyik összefüggéssel számolható ki a magassága?`,
        figure: isoscelesFigure(base, leg, m, unit, { unknownHeight: true }),
        answer: textChoice('$m^2 = b^2 - (a : 2)^2$', ['$m^2 = b^2 - a^2$', '$m^2 = b^2 + (a : 2)^2$', '$m^2 = (a : 2)^2 - b^2$']),
        hint: 'A magasság derékszögű háromszöget vág ki: az egyik befogó az alap fele, az átfogó a szár.',
        solution: [
          'A magasság talppontja felezi az alapot, így a befogók $a : 2$ és $m$, az átfogó $b$.',
          'Pitagorasz tétele: $(a : 2)^2 + m^2 = b^2$, ezért $m^2 = b^2 - (a : 2)^2$.',
        ],
      };
    }
    const [base, leg] = rng.pick([
      [4, 6],
      [6, 8],
      [4, 7],
      [6, 9],
      [8, 10],
    ]);
    const diff = leg * leg - (base / 2) ** 2;
    const correctRoot = simplifyRoot(diff);
    const forgot = simplifyRoot(leg * leg - base * base);
    const added = simplifyRoot(leg * leg + (base / 2) ** 2);
    const fmt = (coef: number, rad: number) => tex`$${texRoot(coef, rad)}$`;
    return {
      prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, szára $${num(leg)}$ ${unit}. Melyik a magassága?`,
      figure: isoscelesFigure(base, leg, Math.sqrt(diff), unit, { unknownHeight: true }),
      answer: choice(rng, fmt(correctRoot.coef, correctRoot.radicand), [
        fmt(forgot.coef, forgot.radicand),
        fmt(added.coef, added.radicand),
        `$${num(leg - base)}$`,
        `$${num(leg)}$`,
      ]),
      hint: 'Ne felejtsd el megfelezni az alapot! A magasság, az alap fele és a szár derékszögű háromszöget alkot.',
      solution: [
        tex`Az alap fele: $${num(base)} : 2 = ${num(base / 2)}$ ${unit}.`,
        tex`$m^2 = ${num(leg)}^2 - ${num(base / 2)}^2 = ${num(leg * leg)} - ${num((base / 2) ** 2)} = ${num(diff)}$`,
        tex`$m = \sqrt{${num(diff)}}${correctRoot.coef === 1 ? '' : tex` = ${texRoot(correctRoot.coef, correctRoot.radicand)}`}$ ${unit}.`,
        tex`Aki nem felezi meg az alapot, $${texRoot(forgot.coef, forgot.radicand)}$-t kap — ez hibás.`,
      ],
    };
  },
};

/** Perimeter of an isosceles triangle from the base and the height. */
const isoscelesPerimeter: GeneratorDef = {
  id: 'isosceles-perimeter',
  title: 'Az egyenlő szárú háromszög kerülete',
  levels: [3],
  generate(rng): Question {
    const unit = pickUnit(rng);
    const [base, m, leg] = rng.pick(ISO_TRIPLES);
    const perimeter = base + 2 * leg;
    return {
      prompt: tex`Egy egyenlő szárú háromszög alapja $${num(base)}$ ${unit}, magassága $${num(m)}$ ${unit}. Mekkora a kerülete?`,
      figure: isoscelesFigure(base, leg, m, unit, { unknownLeg: true }),
      answer: { type: 'number', value: perimeter, unit },
      inputLabel: '$K =$',
      hint: 'Előbb a szár hosszát számítsd ki a magasságból és az alap feléből, aztán add össze a három oldalt!',
      solution: [
        tex`Az alap fele: $${num(base)} : 2 = ${num(base / 2)}$ ${unit}.`,
        tex`$b^2 = ${num(base / 2)}^2 + ${num(m)}^2 = ${num((base / 2) ** 2)} + ${num(m * m)} = ${num(leg * leg)}$, így $b = ${num(leg)}$ ${unit}.`,
        tex`$K = ${num(base)} + 2 \cdot ${num(leg)} = ${num(perimeter)}$ ${unit}`,
        tex`A háromszög kerülete **${num(perimeter)} ${unit}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-04',
  goals: [
    'kiszámítani az egyenlő szárú háromszög magasságát, szárát és területét,',
    'alkalmazni az egyenlő oldalú háromszög magasság- és területképletét,',
    'megérteni a 30°–60°–90°-os háromszög oldalainak arányát.',
  ],
  parts: [
    {
      title: 'Az egyenlő szárú háromszög magassága',
      steps: [
        {
          type: 'theory',
          title: 'A magasság és az alap fele',
          body: 'A magasság felezi az alapot, és derékszögű háromszöget vág ki. Ott a befogók $a : 2$ és $m$, az átfogó a $b$ szár.',
          figure: isoscelesFigure(8, 5, 3, 'cm', { unknownHeight: true }),
          remember: '$m^2 = b^2 - (a : 2)^2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik összefüggés igaz az egyenlő szárú háromszög $m$ magasságára?',
            answer: textChoice('$m^2 = b^2 - (a : 2)^2$', ['$m^2 = b^2 - a^2$', '$m^2 = b^2 + (a : 2)^2$', '$m^2 = (a : 2)^2 - b^2$']),
            hint: 'Rajzold meg a magasságot! Az alapot felezni kell.',
            solution: [
              'A magasság derékszögű háromszöget vág ki; az egyik befogó az alap fele.',
              'Ezért $m^2 = b^2 - (a : 2)^2$.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A magasság kiszámítása',
          problem: 'Egy egyenlő szárú háromszög alapja $6$ cm, szára $5$ cm. Milyen magas?',
          figure: isoscelesFigure(6, 5, 4, 'cm', { unknownHeight: true }),
          steps: [
            { text: 'Az alap fele: $6 : 2 = 3$ cm.' },
            { text: '$m^2 = 5^2 - 3^2 = 25 - 9 = 16$' },
            { text: '$m = \\sqrt{16} = 4$ cm' },
          ],
          answer: 'A háromszög **$4$ cm** magas.',
        },
        { type: 'practice', generator: 'isosceles-height', level: 1, count: 2 },
        { type: 'practice', generator: 'isosceles-mc', level: 2 },
      ],
    },
    {
      title: 'Az egyenlő oldalú háromszög',
      steps: [
        {
          type: 'theory',
          title: 'Az egyenlő oldalú háromszög magassága',
          body: 'Minden oldal $a$. A magasság felezi az alapot, így $m^2 = a^2 - (a : 2)^2 = 3a^2 : 4$.',
          figure: equilateralFigure(6, 3 * Math.sqrt(3), 'cm', { unknownHeight: true }),
          remember: '$m = a\\sqrt{3} : 2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\\n\\n**Az egyenlő oldalú háromszög magassága az oldal $\\sqrt{3} : 2$-szerese.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Írd fel Pitagorasz tételét az oldal felével!',
            solution: [
              '$m^2 = a^2 - (a : 2)^2 = a^2 - a^2 : 4 = 3a^2 : 4$.',
              'Gyököt vonva $m = a\\sqrt{3} : 2$, tehát az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Az egyenlő oldalú háromszög magassága',
          problem: 'Egy egyenlő oldalú háromszög oldala $6$ cm. Milyen magas?',
          figure: equilateralFigure(6, 3 * Math.sqrt(3), 'cm', { unknownHeight: true }),
          steps: [
            { text: '$m^2 = 6^2 - 3^2 = 36 - 9 = 27$' },
            { text: '$m = \\sqrt{27} = 3\\sqrt{3}$' },
            { text: '$3\\sqrt{3} \\approx 5,20$ cm' },
          ],
          answer: 'A háromszög **$3\\sqrt{3}$ cm** magas (kb. $5,20$ cm).',
        },
        { type: 'practice', generator: 'equilateral-height', level: 1, count: 2 },
        { type: 'practice', generator: 'equilateral-height', level: 2 },
      ],
    },
    {
      title: 'Terület és visszaszámolás',
      steps: [
        {
          type: 'theory',
          title: 'A terület',
          body: 'Minden háromszögnél $T = a \\cdot m : 2$. Az egyenlő oldalúnál ebből $T = a^2\\sqrt{3} : 4$ lesz.',
          figure: equilateralFigure(4, 2 * Math.sqrt(3), 'cm'),
          remember: '$T = a \\cdot m : 2 = a^2\\sqrt{3} : 4$',
        },
        {
          type: 'example',
          title: 'Terület az alapból és a szárból',
          problem: 'Egy egyenlő szárú háromszög alapja $12$ cm, szára $10$ cm. Mekkora a területe?',
          figure: isoscelesFigure(12, 10, 8, 'cm', { unknownHeight: true }),
          steps: [
            { text: 'Az alap fele: $12 : 2 = 6$ cm.' },
            { text: '$m^2 = 10^2 - 6^2 = 100 - 36 = 64$, így $m = 8$ cm.' },
            { text: '$T = 12 \\cdot 8 : 2 = 48$ cm²' },
          ],
          answer: 'A háromszög területe **$48$ cm²**.',
        },
        { type: 'practice', generator: 'isosceles-reverse', level: 3 },
        { type: 'practice', generator: 'isosceles-perimeter', level: 3 },
        { type: 'practice', generator: 'isosceles-reverse', level: 2 },
        { type: 'practice', generator: 'equilateral-area', level: 2 },
        { type: 'practice', generator: 'equilateral-area', level: 3 },
      ],
    },
    {
      title: 'A 30°–60°–90° háromszög',
      steps: [
        {
          type: 'theory',
          title: 'Az egyenlő oldalú háromszög fele',
          body: 'A magasság két $30°$–$60°$–$90°$-os háromszögre vágja. Az átfogó $c$, a rövidebb befogó $c : 2$, a hosszabb $c\\sqrt{3} : 2$.',
          figure: right306090Figure(1, 'cm', { long: '√3', short: '1', hyp: '2' }),
          remember: 'Az átfogó kétszerese a rövidebb befogónak.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Egy $30°$–$60°$–$90°$-os háromszög átfogója $12$ cm. Milyen hosszú a rövidebb befogója?',
            answer: textChoice('$6$ cm', ['$6\\sqrt{3}$ cm', '$12\\sqrt{3}$ cm', '$3$ cm']),
            hint: 'A rövidebb befogó az átfogó fele.',
            solution: ['A rövidebb befogó: $12 : 2 = 6$ cm.', 'A $6\\sqrt{3}$ cm a hosszabb befogó.'],
          },
        },
        {
          type: 'example',
          title: 'A hosszabb befogó',
          problem: 'Egy $30°$–$60°$–$90°$-os háromszög átfogója $10$ cm. Milyen hosszú a hosszabb befogója?',
          figure: right306090Figure(5, 'cm', { long: 'a = ?', short: '5 cm', hyp: '10 cm' }),
          steps: [
            { text: 'A rövidebb befogó: $10 : 2 = 5$ cm.' },
            { text: '$a^2 = 10^2 - 5^2 = 100 - 25 = 75$' },
            { text: '$a = \\sqrt{75} = 5\\sqrt{3}$ cm' },
          ],
          answer: 'A hosszabb befogó **$5\\sqrt{3}$ cm**.',
        },
        { type: 'practice', generator: 'half-equilateral', level: 1, count: 2 },
        { type: 'practice', generator: 'half-equilateral', level: 2 },
        { type: 'practice', generator: 'isosceles-height', level: 2 },
      ],
    },
  ],
  generators: [isoscelesHeight, isoscelesReverse, isoscelesPerimeter, equilateralHeight, equilateralArea, halfEquilateral, isoscelesMc],
  miniTest: {
    items: [
      { generator: 'isosceles-height', level: 1 },
      { generator: 'equilateral-height', level: 1 },
      { generator: 'isosceles-mc', level: 1 },
      { generator: 'isosceles-reverse', level: 2 },
      { generator: 'equilateral-area', level: 2 },
      { generator: 'half-equilateral', level: 1 },
      { generator: 'isosceles-height', level: 2 },
      { generator: 'isosceles-perimeter', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'isosceles-height', level: 1 },
    { generator: 'equilateral-height', level: 1 },
    { generator: 'isosceles-mc', level: 1 },
    { generator: 'isosceles-reverse', level: 2 },
    { generator: 'equilateral-area', level: 2 },
    { generator: 'half-equilateral', level: 1 },
  ],
});
