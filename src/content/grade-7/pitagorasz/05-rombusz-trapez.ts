/**
 * 7. osztály › Pitagorasz tétele › 5. A Pitagorasz-tétel alkalmazása rombuszra és trapézra
 *
 * Rhombus: diagonals bisect each other at right angles, a² = (e/2)² + (f/2)², area e·f/2,
 * height from the area. Isosceles and right trapezoid: height/leg/diagonal from the bases,
 * perimeter and area.
 */
import {
  choice,
  defineSubtopic,
  num,
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

/** A rhombus from its diagonals; the right triangle A–B–O is highlighted. */
function rhombusFigure(
  e: number,
  f: number,
  unit: string,
  opts: { unknownF?: boolean; heightLabel?: string } = {},
): Figure {
  return {
    type: 'quadrilateral',
    shape: 'rhombus',
    e,
    f,
    diagonals: { e: `${num(e)}`, f: opts.unknownF ? 'f = ?' : `${num(f)}` },
    height: opts.heightLabel ? { label: opts.heightLabel } : undefined,
    highlightTriangle: ['A', 'B', 'O'],
    fill: true,
  };
}

/** An isosceles trapezoid with bases a (bottom), c (top), height m and leg b. */
function isoscelesTrapezoidFigure(
  a: number,
  c: number,
  m: number,
  b: number,
  unit: string,
  opts: { unknownHeight?: boolean; legLabel?: string } = {},
): Figure {
  return {
    type: 'quadrilateral',
    shape: 'trapezoid',
    a,
    c,
    m,
    sideLabels: { a: `${num(a)} ${unit}`, c: `${num(c)} ${unit}`, b: opts.legLabel ?? `${num(b)} ${unit}` },
    height: { label: opts.unknownHeight ? 'm = ?' : `m = ${num(m)}` },
    highlightTriangle: ['A', 'D', 'T'],
    fill: true,
  };
}

/** An isosceles trapezoid with one diagonal highlighted (clean geometry figure). */
function isoscelesTrapezoidDiagonalFigure(a: number, c: number, m: number, unit: string): Figure {
  return {
    type: 'geometry',
    points: {
      A: [0, 0],
      B: [a, 0],
      C: [(a + c) / 2, m],
      D: [(a - c) / 2, m],
    },
    items: [
      {
        kind: 'polygon',
        points: ['A', 'B', 'C', 'D'],
        fill: true,
        sideLabels: [`${num(a)} ${unit}`, null, `${num(c)} ${unit}`, null],
      },
      { kind: 'segment', from: 'A', to: 'C', label: 'd = ?', color: 'highlight', width: 'thick' },
      { kind: 'height', from: 'D', base: ['A', 'B'], label: 'm' },
    ],
  };
}

/** A right trapezoid (`shift: 0`); the height is the left side d. */
function rightTrapezoidFigure(a: number, c: number, m: number, unit: string): Figure {
  return {
    type: 'quadrilateral',
    shape: 'trapezoid',
    a,
    c,
    m,
    shift: 0,
    sideLabels: { a: `${num(a)} ${unit}`, c: `${num(c)} ${unit}`, d: `${num(m)} ${unit}`, b: 'b = ?' },
    height: { label: 'm', from: 'C' },
    highlightTriangle: ['B', 'C', 'T'],
    fill: true,
  };
}

function pickUnit(rng: { pick<T>(items: readonly T[]): T }): string {
  return rng.pick(['cm', 'cm', 'dm', 'm']);
}

/** e, f, side triples: half diagonals and the side form a right triangle. */
const RHOMBUS_TRIPLES: [number, number, number][] = [
  [6, 8, 5],
  [8, 6, 5],
  [10, 24, 13],
  [24, 10, 13],
  [16, 12, 10],
  [12, 16, 10],
];

/** e, f pairs where the side is not an integer. */
const RHOMBUS_ROOT_PAIRS: [number, number][] = [
  [4, 6],
  [6, 10],
  [8, 10],
  [10, 12],
  [6, 12],
  [8, 14],
];

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Side of a rhombus from its diagonals. */
const rhombusSide: GeneratorDef = {
  id: 'rhombus-side',
  title: 'A rombusz oldala az átlókból',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [e, f, a] = rng.pick(RHOMBUS_TRIPLES);
      return {
        prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Milyen hosszú az oldala?`,
        figure: rhombusFigure(e, f, unit),
        answer: { type: 'number', value: a, unit },
        inputLabel: '$a =$',
        hint: 'Az átlók merőlegesen felezik egymást. A keletkező derékszögű háromszög befogói $e : 2$ és $f : 2$.',
        solution: [
          tex`A $${num(e)}-${suffix(e, 'nak', 'nek')} és a $${num(f)}-${suffix(f, 'nak', 'nek')} a fele $${num(e / 2)}$, illetve $${num(f / 2)}$ ${unit}.`,
          tex`$a^2 = ${num(e / 2)}^2 + ${num(f / 2)}^2 = ${num((e / 2) ** 2)} + ${num((f / 2) ** 2)} = ${num(a * a)}$`,
          tex`$a = \sqrt{${num(a * a)}} = ${num(a)}$`,
          tex`A rombusz oldala **${num(a)} ${unit}**.`,
        ],
      };
    }
    if (level === 3) {
      const [e, f, a] = rng.pick(RHOMBUS_TRIPLES);
      const perimeter = 4 * a;
      return {
        prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Mekkora a kerülete?`,
        figure: rhombusFigure(e, f, unit),
        answer: { type: 'number', value: perimeter, unit },
        inputLabel: '$K =$',
        hint: 'Előbb az oldalt számítsd ki az átlókból, aztán a négy egyenlő oldal összegét!',
        solution: [
          tex`Az átlók fele: $${num(e / 2)}$ és $${num(f / 2)}$ ${unit}.`,
          tex`$a^2 = ${num(e / 2)}^2 + ${num(f / 2)}^2 = ${num((e / 2) ** 2)} + ${num((f / 2) ** 2)} = ${num(a * a)}$, így $a = ${num(a)}$ ${unit}.`,
          tex`$K = 4a = 4 \cdot ${num(a)} = ${num(perimeter)}$ ${unit}`,
          tex`A rombusz kerülete **${num(perimeter)} ${unit}**.`,
        ],
      };
    }
    const [e, f] = rng.pick(RHOMBUS_ROOT_PAIRS);
    const sum = (e / 2) ** 2 + (f / 2) ** 2;
    const root = simplifyRoot(sum);
    return {
      prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Milyen hosszú az oldala? (Gyökös alakban add meg!)`,
      figure: rhombusFigure(e, f, unit),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
      inputLabel: '$a =$',
      hint: 'Az átlók felezik egymást; a fél átlók a derékszögű háromszög befogói.',
      solution: [
        tex`Az átlók fele: $${num(e / 2)}$ és $${num(f / 2)}$ ${unit}.`,
        tex`$a^2 = ${num(e / 2)}^2 + ${num(f / 2)}^2 = ${num((e / 2) ** 2)} + ${num((f / 2) ** 2)} = ${num(sum)}$`,
        tex`$a = \sqrt{${num(sum)}}${root.coef === 1 ? '' : tex` = ${texRoot(root.coef, root.radicand)}`} \approx ${num(Math.sqrt(sum), 2)}$`,
        tex`A rombusz oldala **$${texRoot(root.coef, root.radicand)}$ ${unit}**.`,
      ],
    };
  },
};

/** Area of a rhombus, and the missing diagonal from the area. */
const rhombusArea: GeneratorDef = {
  id: 'rhombus-area',
  title: 'A rombusz területe',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [e, f] = rng.pick(RHOMBUS_TRIPLES);
      const area = (e * f) / 2;
      return {
        prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Mekkora a területe?`,
        figure: rhombusFigure(e, f, unit),
        answer: { type: 'number', value: area, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'A rombusz területe az átlók szorzatának a fele.',
        solution: [
          tex`Az átlók a rombuszt négy derékszögű háromszögre vágják.`,
          tex`$T = \frac{e \cdot f}{2} = \frac{${num(e)} \cdot ${num(f)}}{2} = \frac{${num(e * f)}}{2} = ${num(area)}$ ${unit}²`,
          tex`A rombusz területe **${num(area)} ${unit}²**.`,
        ],
      };
    }
    const [area, e] = rng.pick([
      [24, 6],
      [30, 10],
      [48, 12],
      [60, 10],
      [36, 8],
      [40, 8],
    ]);
    const f = (2 * area) / e;
    return {
      prompt: tex`Egy rombusz területe $${num(area)}$ ${unit}², az egyik átlója $${num(e)}$ ${unit}. Milyen hosszú a másik átlója?`,
      figure: rhombusFigure(e, f, unit, { unknownF: true }),
      answer: { type: 'number', value: f, unit },
      inputLabel: '$f =$',
      hint: 'Indulj ki a $T = e \\cdot f : 2$ képletből, és rendezd $f$-re!',
      solution: [
        tex`$T = \frac{e \cdot f}{2}$, ezért $f = \frac{2T}{e}$.`,
        tex`$f = \frac{2 \cdot ${num(area)}}{${num(e)}} = \frac{${num(2 * area)}}{${num(e)}} = ${num(f)}$`,
        tex`A másik átló **${num(f)} ${unit}**.`,
      ],
    };
  },
};

/** Height of a rhombus from the area and the side. */
const rhombusHeight: GeneratorDef = {
  id: 'rhombus-height',
  title: 'A rombusz magassága',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 2) {
      const [e, f, a] = rng.pick(RHOMBUS_TRIPLES);
      const area = (e * f) / 2;
      const m = area / a;
      return {
        prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Milyen magas?`,
        figure: rhombusFigure(e, f, unit),
        answer: { type: 'number', value: m, precision: 2, unit },
        inputLabel: '$m =$',
        hint: 'Előbb a területet számítsd ki az átlókból, aztán az oldalt. A terület $a \\cdot m$ is.',
        solution: [
          tex`$T = \frac{e \cdot f}{2} = \frac{${num(e)} \cdot ${num(f)}}{2} = ${num(area)}$ ${unit}²`,
          tex`Az oldal az átlókból: $a = ${num(a)}$ ${unit}.`,
          tex`$m = T : a = ${num(area)} : ${num(a)} = ${num(m, 2)}$ ${unit}`,
          tex`A rombusz **${num(m, 2)} ${unit}** magas.`,
        ],
      };
    }
    const [area, a] = rng.pick([
      [48, 10],
      [36, 8],
      [60, 12],
      [24, 5],
      [72, 10],
    ]);
    const m = area / a;
    const angle = (Math.asin(m / a) * 180) / Math.PI;
    return {
      prompt: tex`Egy rombusz területe $${num(area)}$ ${unit}², oldala $${num(a)}$ ${unit}. Milyen magas?`,
      figure: {
        type: 'quadrilateral',
        shape: 'rhombus',
        a,
        angle,
        sideLabels: { a: `${num(a)} ${unit}` },
        height: { label: 'm' },
        fill: true,
      },
      answer: { type: 'number', value: m, precision: 2, unit },
      inputLabel: '$m =$',
      hint: 'A rombusz területe $a \\cdot m$ is, ezért $m = T : a$.',
      solution: [
        tex`A rombusz területe $T = a \cdot m$.`,
        tex`$m = T : a = ${num(area)} : ${num(a)} = ${num(m, 2)}$ ${unit}`,
        tex`A rombusz **${num(m, 2)} ${unit}** magas.`,
      ],
    };
  },
};

/** Multiple choice: the relation and a numeric side with typical mistakes. */
const rhombusMc: GeneratorDef = {
  id: 'rhombus-mc',
  title: 'Melyik a rombusz oldala? (feleletválasztó)',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [e, f] = rng.pick([
        [8, 6],
        [6, 8],
        [10, 24],
        [16, 12],
      ]);
      return {
        prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Melyik összefüggéssel számolható ki az oldala?`,
        figure: rhombusFigure(e, f, unit),
        answer: textChoice('$a^2 = (e : 2)^2 + (f : 2)^2$', ['$a^2 = e^2 + f^2$', '$a = (e + f) : 2$', '$a^2 = (e : 2)^2 - (f : 2)^2$']),
        hint: 'Az átlók merőlegesen felezik egymást. Rajzold be a derékszögű háromszöget!',
        solution: [
          'Az átlók felezik egymást, ezért a derékszögű háromszög befogói $e : 2$ és $f : 2$.',
          'Az oldal az átfogó: $a^2 = (e : 2)^2 + (f : 2)^2$.',
        ],
      };
    }
    const [e, f, a] = rng.pick(RHOMBUS_TRIPLES);
    return {
      prompt: tex`Egy rombusz átlói $${num(e)}$ ${unit} és $${num(f)}$ ${unit}. Melyik az oldala?`,
      figure: rhombusFigure(e, f, unit),
      answer: choice(rng, `$${num(a)}$`, [`$${num((e + f) / 2)}$`, `$${num(e + f)}$`, `$${num(Math.sqrt(e * e + f * f))}$`, `$${num(Math.abs(f - e) / 2)}$`]),
      hint: 'Az átlók feléből kell derékszögű háromszöget rajzolni: $a^2 = (e : 2)^2 + (f : 2)^2$.',
      solution: [
        tex`Az átlók fele: $${num(e / 2)}$ és $${num(f / 2)}$ ${unit}.`,
        tex`$a^2 = ${num(e / 2)}^2 + ${num(f / 2)}^2 = ${num((e / 2) ** 2)} + ${num((f / 2) ** 2)} = ${num(a * a)}$`,
        tex`$a = ${num(a)}$ ${unit}.`,
        tex`Aki nem felezi meg az átlókat, $${num(Math.sqrt(e * e + f * f))}$-t kap — ez hibás.`,
      ],
    };
  },
};

/** Height of an isosceles trapezoid from the bases and a leg. */
const trapezoidHeight: GeneratorDef = {
  id: 'trapezoid-height',
  title: 'Az egyenlő szárú trapéz magassága',
  levels: [1, 2],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 1) {
      const [a, c, b, m] = rng.pick([
        [10, 4, 5, 4],
        [12, 6, 5, 4],
        [14, 8, 5, 4],
        [12, 4, 5, 3],
        [14, 6, 5, 3],
        [16, 8, 5, 3],
      ]);
      return {
        prompt: tex`Egy egyenlő szárú trapéz alapjai $${num(a)}$ ${unit} és $${num(c)}$ ${unit}, szára $${num(b)}$ ${unit}. Milyen magas?`,
        figure: isoscelesTrapezoidFigure(a, c, m, b, unit, { unknownHeight: true }),
        answer: { type: 'number', value: m, unit },
        inputLabel: '$m =$',
        hint: 'A magasság derékszögű háromszöget vág ki; az egyik befogó az alapok különbségének a fele.',
        solution: [
          tex`Az alapok különbségének a fele: $(${num(a)} - ${num(c)}) : 2 = ${num((a - c) / 2)}$ ${unit}.`,
          tex`$m^2 = ${num(b)}^2 - ${num((a - c) / 2)}^2 = ${num(b * b)} - ${num(((a - c) / 2) ** 2)} = ${num(m * m)}$`,
          tex`$m = \sqrt{${num(m * m)}} = ${num(m)}$`,
          tex`A trapéz **${num(m)} ${unit}** magas.`,
        ],
      };
    }
    const [a, c, b] = rng.pick([
      [9, 5, 4],
      [8, 4, 3],
      [10, 4, 4],
      [12, 6, 4],
      [14, 8, 4],
    ]);
    const overhang = (a - c) / 2;
    const diff = b * b - overhang * overhang;
    const root = simplifyRoot(diff);
    const m = Math.sqrt(diff);
    return {
      prompt: tex`Egy egyenlő szárú trapéz alapjai $${num(a)}$ ${unit} és $${num(c)}$ ${unit}, szára $${num(b)}$ ${unit}. Milyen magas? (Gyökös alakban add meg!)`,
      figure: isoscelesTrapezoidFigure(a, c, m, b, unit, { unknownHeight: true }),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit },
      inputLabel: '$m =$',
      hint: 'Az alapok különbségének felével és a magassággal derékszögű háromszöget kapsz; a szár az átfogó.',
      solution: [
        tex`Az alapok különbségének a fele: $(${num(a)} - ${num(c)}) : 2 = ${num(overhang)}$ ${unit}.`,
        tex`$m^2 = ${num(b)}^2 - ${num(overhang)}^2 = ${num(b * b)} - ${num(overhang * overhang)} = ${num(diff)}$`,
        tex`$m = \sqrt{${num(diff)}}${root.coef === 1 ? '' : tex` = ${texRoot(root.coef, root.radicand)}`} \approx ${num(m, 2)}$`,
        tex`A trapéz **$${texRoot(root.coef, root.radicand)}$ ${unit}** magas.`,
      ],
    };
  },
};

/** Area of a trapezoid; perimeter of a right trapezoid at L3. */
const trapezoidArea: GeneratorDef = {
  id: 'trapezoid-area',
  title: 'A trapéz területe és kerülete',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = pickUnit(rng);
    if (level === 2) {
      const [a, c, m] = rng.pick([
        [10, 6, 4],
        [12, 8, 5],
        [14, 6, 3],
        [9, 5, 4],
        [11, 7, 6],
        [13, 7, 5],
      ]);
      const area = ((a + c) / 2) * m;
      return {
        prompt: tex`Egy trapéz alapjai $${num(a)}$ ${unit} és $${num(c)}$ ${unit}, magassága $${num(m)}$ ${unit}. Mekkora a területe?`,
        figure: isoscelesTrapezoidFigure(a, c, m, Math.hypot((a - c) / 2, m), unit, { legLabel: 'b' }),
        answer: { type: 'number', value: area, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'A trapéz területe: az alapok átlaga szorozva a magassággal.',
        solution: [
          tex`$T = \frac{a + c}{2} \cdot m = \frac{${num(a)} + ${num(c)}}{2} \cdot ${num(m)}$`,
          tex`$T = ${num((a + c) / 2)} \cdot ${num(m)} = ${num(area)}$ ${unit}²`,
          tex`A trapéz területe **${num(area)} ${unit}²**.`,
        ],
      };
    }
    const [a, c, m] = rng.pick([
      [10, 6, 3],
      [12, 8, 3],
      [14, 10, 3],
      [11, 8, 4],
      [13, 10, 4],
    ]);
    const overhang = a - c;
    const b = Math.sqrt(overhang * overhang + m * m);
    const perimeter = a + c + b + m;
    return {
      prompt: tex`Egy derékszögű trapéz alapjai $${num(a)}$ ${unit} és $${num(c)}$ ${unit}, magassága $${num(m)}$ ${unit}. Mekkora a kerülete?`,
      figure: rightTrapezoidFigure(a, c, m, unit),
      answer: { type: 'number', value: perimeter, unit },
      inputLabel: '$K =$',
      hint: 'A ferde szár a magassággal és az alapok különbségével derékszögű háromszöget alkot.',
      solution: [
        tex`Az alapok különbsége: $${num(a)} - ${num(c)} = ${num(overhang)}$ ${unit}.`,
        tex`A ferde szár: $b^2 = ${num(overhang)}^2 + ${num(m)}^2 = ${num(overhang * overhang)} + ${num(m * m)} = ${num(b * b)}$, így $b = ${num(b)}$ ${unit}.`,
        tex`$K = ${num(a)} + ${num(c)} + ${num(m)} + ${num(b)} = ${num(perimeter)}$ ${unit}`,
        tex`A trapéz kerülete **${num(perimeter)} ${unit}**.`,
      ],
    };
  },
};

/** Diagonal of an isosceles trapezoid from the bases and the height. */
const trapezoidDiagonal: GeneratorDef = {
  id: 'trapezoid-diagonal',
  title: 'A trapéz átlója',
  levels: [3],
  generate(rng): Question {
    const unit = pickUnit(rng);
    const [a, c, m, d] = rng.pick([
      [6, 2, 3, 5],
      [4, 2, 4, 5],
      [10, 6, 6, 10],
      [8, 4, 8, 10],
      [18, 6, 5, 13],
    ]);
    const half = (a + c) / 2;
    return {
      prompt: tex`Egy egyenlő szárú trapéz alapjai $${num(a)}$ ${unit} és $${num(c)}$ ${unit}, magassága $${num(m)}$ ${unit}. Milyen hosszú az átlója?`,
      figure: isoscelesTrapezoidDiagonalFigure(a, c, m, unit),
      answer: { type: 'number', value: d, unit },
      inputLabel: '$d =$',
      hint: 'Az átló, a magasság és az alapok átlagának megfelelő vízszintes szakasz derékszögű háromszöget alkot.',
      solution: [
        tex`Az átló vízszintes vetülete: $(a + c) : 2 = (${num(a)} + ${num(c)}) : 2 = ${num(half)}$ ${unit}.`,
        tex`$d^2 = ${num(half)}^2 + ${num(m)}^2 = ${num(half * half)} + ${num(m * m)} = ${num(d * d)}$`,
        tex`$d = \sqrt{${num(d * d)}} = ${num(d)}$`,
        tex`A trapéz átlója **${num(d)} ${unit}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-05',
  goals: [
    'kiszámítani a rombusz oldalát, területét és magasságát az átlókból,',
    'megérteni a rombusz átlóinak merőleges felezését,',
    'kiszámítani az egyenlő szárú és a derékszögű trapéz magasságát, kerületét, területét.',
  ],
  parts: [
    {
      title: 'A rombusz oldala',
      steps: [
        {
          type: 'theory',
          title: 'A rombusz átlói',
          body: 'A rombusz átlói merőlegesen felezik egymást. A keletkező derékszögű háromszög befogói $e : 2$ és $f : 2$, átfogója az $a$ oldal.',
          figure: rhombusFigure(8, 6, 'cm'),
          remember: '$a^2 = (e : 2)^2 + (f : 2)^2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\\n\\n**A rombusz átlói merőlegesen felezik egymást.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Gondolj a rombusz szimmetriájára, vagy arra, hogy az átlók négy derékszögű háromszöget adnak.',
            solution: [
              'A rombusz átlói merőlegesek egymásra, és a metszéspontjuk felezi mindkettőt.',
              'Ezért az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Az oldal kiszámítása',
          problem: 'Egy rombusz átlói $6$ cm és $8$ cm. Milyen hosszú az oldala?',
          figure: rhombusFigure(6, 8, 'cm'),
          steps: [
            { text: 'Az átlók fele: $3$ cm és $4$ cm.' },
            { text: '$a^2 = 3^2 + 4^2 = 9 + 16 = 25$' },
            { text: '$a = \\sqrt{25} = 5$ cm' },
          ],
          answer: 'A rombusz oldala **$5$ cm**.',
        },
        { type: 'practice', generator: 'rhombus-side', level: 1, count: 2 },
        { type: 'practice', generator: 'rhombus-mc', level: 2 },
      ],
    },
    {
      title: 'A rombusz területe és magassága',
      steps: [
        {
          type: 'theory',
          title: 'Terület és magasság',
          body: 'A négy derékszögű háromszög együtt $T = e \\cdot f : 2$. Ugyanaz a terület $T = a \\cdot m$ is, ezért $m = T : a$.',
          figure: { type: 'quadrilateral', shape: 'rhombus', a: 5, angle: 60, height: { label: 'm' }, fill: true },
          remember: '$T = e \\cdot f : 2$ és $T = a \\cdot m$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik képlet adja a rombusz területét az átlóival?',
            answer: textChoice('$T = e \\cdot f : 2$', ['$T = e \\cdot f$', '$T = (e + f) : 2$', '$T = 2 \\cdot (e + f)$']),
            hint: 'A négy derékszögű háromszög területét add össze!',
            solution: [
              'Egy derékszögű háromszög területe $(e : 2) \\cdot (f : 2) : 2$.',
              'Négy ilyen háromszög együtt $e \\cdot f : 2$, tehát $T = e \\cdot f : 2$.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A terület és a magasság',
          problem: 'Egy rombusz átlói $6$ cm és $8$ cm. Mekkora a területe és a magassága?',
          figure: rhombusFigure(6, 8, 'cm'),
          steps: [
            { text: '$T = 6 \\cdot 8 : 2 = 24$ cm²' },
            { text: 'Az oldal az előző példából $5$ cm.' },
            { text: '$m = T : a = 24 : 5 = 4,8$ cm' },
          ],
          answer: 'A terület **$24$ cm²**, a magasság **$4,8$ cm**.',
        },
        { type: 'practice', generator: 'rhombus-area', level: 1 },
        { type: 'practice', generator: 'rhombus-area', level: 2 },
        { type: 'practice', generator: 'rhombus-height', level: 2 },
      ],
    },
    {
      title: 'Az egyenlő szárú trapéz',
      steps: [
        {
          type: 'theory',
          title: 'A trapéz magassága',
          body: 'A magasság derékszögű háromszöget vág ki. Az egyik befogó az alapok különbségének a fele: $(a - c) : 2$, az átfogó a $b$ szár.',
          figure: isoscelesTrapezoidFigure(10, 4, 4, 5, 'cm', { unknownHeight: true }),
          remember: '$m^2 = b^2 - ((a - c) : 2)^2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mekkora az alapok különbségének a fele, ha az alapok $10$ cm és $6$ cm?',
            answer: { type: 'number', value: 2, unit: 'cm' },
            inputLabel: '$x =$',
            hint: 'Előbb vond ki a kisebb alapot a nagyobból, aztán felezd meg!',
            solution: ['$10 - 6 = 4$ cm.', '$4 : 2 = 2$ cm.'],
          },
        },
        {
          type: 'example',
          title: 'A trapéz magassága',
          problem: 'Egy egyenlő szárú trapéz alapjai $10$ cm és $4$ cm, szára $5$ cm. Milyen magas?',
          figure: isoscelesTrapezoidFigure(10, 4, 4, 5, 'cm', { unknownHeight: true }),
          steps: [
            { text: 'Az alapok különbségének fele: $(10 - 4) : 2 = 3$ cm.' },
            { text: '$m^2 = 5^2 - 3^2 = 25 - 9 = 16$' },
            { text: '$m = \\sqrt{16} = 4$ cm' },
          ],
          answer: 'A trapéz **$4$ cm** magas.',
        },
        { type: 'practice', generator: 'trapezoid-height', level: 1, count: 2 },
        { type: 'practice', generator: 'trapezoid-height', level: 2 },
        { type: 'practice', generator: 'trapezoid-area', level: 2 },
      ],
    },
    {
      title: 'Trapéz: kerület és terület',
      steps: [
        {
          type: 'theory',
          title: 'Terület és kerület',
          body: 'A trapéz területe az alapok átlaga szorozva a magassággal. A derékszögű trapéznál a ferde szár a magassággal és az alapok különbségével derékszögű háromszöget ad.',
          remember: '$T = (a + c) : 2 \\cdot m$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik képlet adja a trapéz területét?',
            answer: textChoice('$T = (a + c) : 2 \\cdot m$', ['$T = (a + c) \\cdot m$', '$T = a \\cdot c \\cdot m$', '$T = (a - c) : 2 \\cdot m$']),
            hint: 'A trapéz két egyforma magasságú háromszögre bontható; az alapok átlagával számolunk.',
            solution: ['A trapéz területe $T = \\frac{a + c}{2} \\cdot m$.', 'Ez az alapok átlaga szorozva a magassággal.'],
          },
        },
        {
          type: 'example',
          title: 'A derékszögű trapéz kerülete',
          problem: 'Egy derékszögű trapéz alapjai $10$ cm és $6$ cm, magassága $3$ cm. Mekkora a kerülete?',
          figure: rightTrapezoidFigure(10, 6, 3, 'cm'),
          steps: [
            { text: 'Az alapok különbsége: $10 - 6 = 4$ cm.' },
            { text: 'A ferde szár: $b^2 = 4^2 + 3^2 = 16 + 9 = 25$, így $b = 5$ cm.' },
            { text: '$K = 10 + 6 + 3 + 5 = 24$ cm' },
          ],
          answer: 'A trapéz kerülete **$24$ cm**.',
        },
        { type: 'practice', generator: 'trapezoid-area', level: 3 },
        { type: 'practice', generator: 'trapezoid-diagonal', level: 3 },
        { type: 'practice', generator: 'rhombus-height', level: 3 },
        { type: 'practice', generator: 'rhombus-side', level: 2 },
      ],
    },
  ],
  generators: [rhombusSide, rhombusArea, rhombusHeight, rhombusMc, trapezoidHeight, trapezoidArea, trapezoidDiagonal],
  miniTest: {
    items: [
      { generator: 'rhombus-side', level: 1 },
      { generator: 'rhombus-area', level: 1 },
      { generator: 'rhombus-mc', level: 1 },
      { generator: 'trapezoid-height', level: 1 },
      { generator: 'rhombus-height', level: 2 },
      { generator: 'trapezoid-area', level: 2 },
      { generator: 'rhombus-side', level: 2 },
      { generator: 'trapezoid-diagonal', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'rhombus-side', level: 1 },
    { generator: 'rhombus-area', level: 1 },
    { generator: 'rhombus-mc', level: 1 },
    { generator: 'trapezoid-height', level: 1 },
    { generator: 'rhombus-height', level: 2 },
    { generator: 'trapezoid-area', level: 2 },
  ],
});
