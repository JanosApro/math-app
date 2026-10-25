/**
 * 8. osztály › Pont, egyenes és sík › 3. Poliéderek
 *
 * Polyhedra and curved solids, faces / edges / vertices, surface area as the area of the net,
 * volume and volume units (mm³–cm³–dm³–m³, litre, millilitre, hectolitre), and the volume of the
 * cube and the cuboid. Heavy lesson in five short parts, with capacity problems and the space
 * diagonal of a cuboid at level 3.
 */
import {
  clean,
  defineSubtopic,
  num,
  simplifyRoot,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Shapes and static figures
// ---------------------------------------------------------------------------------------------

type Kind = 'prism' | 'pyramid';

interface ShapeInfo {
  key: string;
  name: string;
  kind: Kind;
  n: number;
  figure: Figure;
}

const SHAPES: ShapeInfo[] = [
  {
    key: 'cube',
    name: 'kocka',
    kind: 'prism',
    n: 4,
    figure: { type: 'solid', shape: 'cube', a: 3, vertexLabels: true },
  },
  {
    key: 'cuboid',
    name: 'téglatest',
    kind: 'prism',
    n: 4,
    figure: { type: 'solid', shape: 'cuboid', a: 4, b: 3, c: 2, vertexLabels: true },
  },
  {
    key: 'triangular-prism',
    name: 'háromszög alapú hasáb',
    kind: 'prism',
    n: 3,
    figure: { type: 'solid', shape: 'prism', base: 'triangle', a: 3, h: 5 },
  },
  {
    key: 'hexagonal-prism',
    name: 'hatszög alapú hasáb',
    kind: 'prism',
    n: 6,
    figure: { type: 'solid', shape: 'prism', base: 'hexagon', a: 2, h: 4 },
  },
  {
    key: 'square-pyramid',
    name: 'négyzet alapú gúla',
    kind: 'pyramid',
    n: 4,
    figure: { type: 'solid', shape: 'pyramid', base: 'square', a: 4, h: 5 },
  },
  {
    key: 'triangular-pyramid',
    name: 'háromszög alapú gúla',
    kind: 'pyramid',
    n: 3,
    figure: { type: 'solid', shape: 'pyramid', base: 'triangle', a: 4, h: 5 },
  },
  {
    key: 'hexagonal-pyramid',
    name: 'hatszög alapú gúla',
    kind: 'pyramid',
    n: 6,
    figure: { type: 'solid', shape: 'pyramid', base: 'hexagon', a: 3, h: 5 },
  },
];

const counts = (s: ShapeInfo) =>
  s.kind === 'prism'
    ? { faces: s.n + 2, edges: 3 * s.n, vertices: 2 * s.n }
    : { faces: s.n + 1, edges: 2 * s.n, vertices: s.n + 1 };

const theorySolid: Figure = {
  type: 'solid',
  shape: 'cube',
  a: 4,
  fill: false,
  caption: 'A kocka felülete 6 négyzet, a teste a belseje.',
};

const theoryVertices: Figure = {
  type: 'solid',
  shape: 'cube',
  a: 4,
  vertexLabels: true,
  caption: 'A kocka lapjai, élei és csúcsai.',
};

const theoryNet: Figure = {
  type: 'net',
  of: 'cube',
  a: 3,
  labels: { a: 'a' },
  caption: 'A kocka hálója 6 egybevágó négyzet.',
};

const theoryVolume: Figure = {
  type: 'solid',
  shape: 'cuboid',
  a: 5,
  b: 4,
  c: 3,
  labels: { a: 'a = 5 cm', b: 'b = 4 cm', c: 'c = 3 cm' },
  caption: 'V = a · b · c',
};

const theoryLiter: Figure = {
  type: 'solid',
  shape: 'cuboid',
  a: 5,
  b: 4,
  c: 3,
  labels: { a: '5 dm', b: '4 dm', c: '3 dm' },
  caption: '5 dm × 4 dm × 3 dm = 60 dm³ = 60 l',
};

const cuboidFigure = (a: number, b: number, c: number, unit: string): Figure => ({
  type: 'solid',
  shape: 'cuboid',
  a,
  b,
  c,
  labels: {
    a: `a = ${num(a)} ${unit}`,
    b: `b = ${num(b)} ${unit}`,
    c: `c = ${num(c)} ${unit}`,
  },
});

/** A cuboid with only the space diagonal highlighted (the dimensions are in the prompt). */
const diagonalFigure = (a: number, b: number, c: number): Figure => ({
  type: 'solid',
  shape: 'cuboid',
  a,
  b,
  c,
  labels: { spaceDiagonal: 'd' },
  highlight: ['spaceDiagonal'],
});

const cubeFigure = (a: number, unit: string, unknown = false): Figure => ({
  type: 'solid',
  shape: 'cube',
  a,
  labels: { a: unknown ? 'a = ?' : `a = ${num(a)} ${unit}` },
});

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Faces, edges and vertices of a prism, a pyramid, a cube or a cuboid. */
const countElements: GeneratorDef = {
  id: 'count-elements',
  title: 'Lapok, élek és csúcsok száma',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool =
      level === 1
        ? SHAPES.filter((s) => s.key === 'cube' || s.key === 'cuboid')
        : level === 2
          ? SHAPES.filter((s) => ['triangular-prism', 'hexagonal-prism', 'square-pyramid'].includes(s.key))
          : SHAPES.filter((s) => ['triangular-pyramid', 'hexagonal-prism', 'hexagonal-pyramid'].includes(s.key));
    const shape = rng.pick(pool);
    const c = counts(shape);
    if (level === 3) {
      return {
        prompt: tex`Hány lapja, éle és csúcsa van az ábrán látható testnek?`,
        figure: shape.figure,
        answer: {
          type: 'numbers',
          fields: [
            { label: 'lap', value: c.faces },
            { label: 'él', value: c.edges },
            { label: 'csúcs', value: c.vertices },
          ],
        },
        hint: 'A lapok sokszögek, az élek a lapok határai, a csúcsokban élek találkoznak. Számold meg mindhármat!',
        solution:
          shape.kind === 'prism'
            ? [
                tex`A hasáb alapja ${num(shape.n)} oldalú sokszög.`,
                tex`Lapok: 2 alaplap + ${num(shape.n)} oldallap = ${num(c.faces)}.`,
                tex`Élek: 2 · ${num(shape.n)} alaplapél + ${num(shape.n)} oldalél = ${num(c.edges)}.`,
                tex`Csúcsok: 2 · ${num(shape.n)} = ${num(c.vertices)}.`,
              ]
            : [
                tex`A gúla alapja ${num(shape.n)} oldalú sokszög.`,
                tex`Lapok: 1 alaplap + ${num(shape.n)} oldallap = ${num(c.faces)}.`,
                tex`Élek: ${num(shape.n)} alapél + ${num(shape.n)} oldalél = ${num(c.edges)}.`,
                tex`Csúcsok: ${num(shape.n)} alaplapcsúcs + 1 csúcs = ${num(c.vertices)}.`,
              ],
      };
    }
    const which = rng.pick(['faces', 'edges', 'vertices'] as const);
    const value = c[which];
    const what = which === 'faces' ? 'lapja' : which === 'edges' ? 'éle' : 'csúcsa';
    return {
      prompt: tex`Hány ${what} van az ábrán látható testnek?`,
      figure: shape.figure,
      answer: { type: 'number', value },
      inputLabel: `${which === 'faces' ? 'lap' : which === 'edges' ? 'él' : 'csúcs'} =`,
      hint: 'A lapok sokszögek, az élek a lapok határai, a csúcsokban élek találkoznak.',
      solution: [
        tex`A test egy ${shape.name}.`,
        tex`Lapok: ${num(c.faces)}, élek: ${num(c.edges)}, csúcsok: ${num(c.vertices)}.`,
        tex`Ezért a keresett érték: **${num(value)}**.`,
      ],
    };
  },
};

/** Surface area of the cube (L1), the cuboid (L2) and an open-top aquarium (L3). */
const surfaceArea: GeneratorDef = {
  id: 'surface-area',
  title: 'A kocka és a téglatest felszíne',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (level === 1) {
      const a = rng.int(2, 9);
      const area = 6 * a * a;
      return {
        prompt: tex`Egy kocka éle $${num(a)}$ ${unit}. Mekkora a felszíne?`,
        figure: cubeFigure(a, unit),
        answer: { type: 'number', value: area, unit: `${unit}²` },
        inputLabel: '$P =$',
        hint: 'A kocka 6 egybevágó négyzetből áll.',
        solution: [
          tex`Egy lap területe: $a^2 = ${num(a)}^2 = ${num(a * a)}$ ${unit}².`,
          tex`A felszín: $6 \cdot ${num(a * a)} = ${num(area)}$ ${unit}².`,
          tex`A kocka felszíne **${num(area)} ${unit}²**.`,
        ],
      };
    }
    if (level === 2) {
      let a = rng.int(2, 8);
      let b = rng.int(2, 8);
      let c = rng.int(2, 8);
      if (b === a) b = b === 8 ? 7 : b + 1;
      if (c === a || c === b) c = [2, 3, 4, 5, 6, 7, 8].find((v) => v !== a && v !== b) ?? 2;
      const area = 2 * (a * b + b * c + c * a);
      return {
        prompt: tex`Egy téglatest élei $${num(a)}$ ${unit}, $${num(b)}$ ${unit} és $${num(c)}$ ${unit}. Mekkora a felszíne?`,
        figure: cuboidFigure(a, b, c, unit),
        answer: { type: 'number', value: area, unit: `${unit}²` },
        inputLabel: '$P =$',
        hint: 'A téglatest 6 lapja 3 pár egybevágó téglalap: $P = 2(ab + bc + ca)$.',
        solution: [
          tex`A háromféle lap területe: $${num(a)} \cdot ${num(b)} = ${num(a * b)}$, $${num(b)} \cdot ${num(c)} = ${num(b * c)}$, $${num(c)} \cdot ${num(a)} = ${num(c * a)}$.`,
          tex`$P = 2(${num(a * b)} + ${num(b * c)} + ${num(c * a)}) = 2 \cdot ${num(a * b + b * c + c * a)} = ${num(area)}$ ${unit}².`,
          tex`A téglatest felszíne **${num(area)} ${unit}²**.`,
        ],
      };
    }
    // L3: open-top aquarium: base + four side walls.
    const a = rng.int(4, 9);
    let b = rng.int(4, 9);
    if (b === a) b = b === 9 ? 8 : b + 1;
    const c = rng.int(2, 6);
    const area = a * b + 2 * a * c + 2 * b * c;
    return {
      prompt: tex`Egy felül nyitott akvárium alapja $${num(a)}$ dm × $${num(b)}$ dm, magassága $${num(c)}$ dm. Hány dm² üveg kell hozzá?`,
      figure: { ...cuboidFigure(a, b, c, 'dm'), caption: 'A teteje nyitott.' },
      answer: { type: 'number', value: area, unit: 'dm²' },
      inputLabel: '$P =$',
      hint: 'Az alj és a négy oldalfal kell, a teteje hiányzik.',
      solution: [
        tex`Az alj területe: $${num(a)} \cdot ${num(b)} = ${num(a * b)}$ dm².`,
        tex`A négy oldalfal: $2 \cdot ${num(a)} \cdot ${num(c)} + 2 \cdot ${num(b)} \cdot ${num(c)} = ${num(2 * a * c)} + ${num(2 * b * c)} = ${num(2 * a * c + 2 * b * c)}$ dm².`,
        tex`Összesen $${num(a * b)} + ${num(2 * a * c + 2 * b * c)} = ${num(area)}$ dm² üveg kell.`,
        tex`Az akváriumhoz **${num(area)} dm²** üveg kell.`,
      ],
    };
  },
};

interface ConversionCase {
  value: number;
  from: string;
  to: string;
  factor: number;
}

/** Unit conversions between mm³, cm³, dm³, m³, ml, l and hl. */
const unitConversion: GeneratorDef = {
  id: 'unit-conversion',
  title: 'Térfogat- és űrtartalom-mértékegységek',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    let c: ConversionCase;
    if (level === 1) {
      const cases: ConversionCase[] = [
        { value: rng.int(2, 9), from: 'cm³', to: 'mm³', factor: 1000 },
        { value: rng.int(2, 9), from: 'dm³', to: 'cm³', factor: 1000 },
        { value: rng.int(2, 9), from: 'm³', to: 'dm³', factor: 1000 },
        { value: rng.int(2, 9), from: 'l', to: 'dm³', factor: 1 },
        { value: rng.int(2, 9), from: 'ml', to: 'cm³', factor: 1 },
      ];
      c = rng.pick(cases);
    } else if (level === 2) {
      const cases: ConversionCase[] = [
        { value: rng.int(15, 95) / 10, from: 'dm³', to: 'cm³', factor: 1000 },
        { value: rng.int(2, 9) / 10, from: 'm³', to: 'dm³', factor: 1000 },
        { value: rng.int(2, 9) * 500, from: 'cm³', to: 'dm³', factor: 1 / 1000 },
        { value: rng.int(2, 9) / 10, from: 'l', to: 'ml', factor: 1000 },
        { value: rng.int(2, 9) * 100, from: 'ml', to: 'l', factor: 1 / 1000 },
      ];
      c = rng.pick(cases);
    } else {
      const cases: ConversionCase[] = [
        { value: rng.int(2, 9) / 10, from: 'm³', to: 'l', factor: 1000 },
        { value: rng.int(2, 9), from: 'hl', to: 'l', factor: 100 },
        { value: rng.int(2, 9) / 10, from: 'l', to: 'cm³', factor: 1000 },
        { value: rng.int(2, 9), from: 'm³', to: 'hl', factor: 10 },
        { value: rng.int(2, 9), from: 'hl', to: 'dm³', factor: 100 },
      ];
      c = rng.pick(cases);
    }
    const result = clean(c.value * c.factor);
    const hint =
      c.factor === 1
        ? `$1$ ${c.from} $= 1$ ${c.to}.`
        : c.factor > 1
          ? `$1$ ${c.from} $= ${num(c.factor)}$ ${c.to}.`
          : `$${num(1 / c.factor)}$ ${c.from} $= 1$ ${c.to}.`;
    return {
      prompt: tex`${num(c.value)} ${c.from} hány ${c.to}?`,
      answer: { type: 'number', value: result, unit: c.to },
      inputLabel: `${c.to} =`,
      hint,
      solution: [
        hint,
        c.factor === 1
          ? tex`A két mértékegység ugyanakkora, ezért az eredmény ${num(result)} ${c.to}.`
          : c.factor > 1
            ? tex`$${num(c.value)} \cdot ${num(c.factor)} = ${num(result)}$.`
            : tex`$${num(c.value)} : ${num(1 / c.factor)} = ${num(result)}$.`,
        tex`Tehát **${num(result)} ${c.to}**.`,
      ],
    };
  },
};

/** Volume of the cube (L1), the cuboid (L2) and the edge from a cube's volume (L3). */
const volume: GeneratorDef = {
  id: 'volume',
  title: 'A kocka és a téglatest térfogata',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (level === 1) {
      const a = rng.int(2, 9);
      return {
        prompt: tex`Egy kocka éle $${num(a)}$ ${unit}. Mekkora a térfogata?`,
        figure: cubeFigure(a, unit),
        answer: { type: 'number', value: a * a * a, unit: `${unit}³` },
        inputLabel: '$V =$',
        hint: 'A kocka térfogata $V = a^3$.',
        solution: [
          tex`$V = a^3 = ${num(a)}^3 = ${num(a)} \cdot ${num(a)} \cdot ${num(a)} = ${num(a * a * a)}$ ${unit}³.`,
          tex`A kocka térfogata **${num(a * a * a)} ${unit}³**.`,
        ],
      };
    }
    if (level === 2) {
      let a = rng.int(2, 8);
      let b = rng.int(2, 8);
      let c = rng.int(2, 8);
      if (b === a) b = b === 8 ? 7 : b + 1;
      if (c === a || c === b) c = [2, 3, 4, 5, 6, 7, 8].find((v) => v !== a && v !== b) ?? 2;
      return {
        prompt: tex`Egy téglatest élei $${num(a)}$ ${unit}, $${num(b)}$ ${unit} és $${num(c)}$ ${unit}. Mekkora a térfogata?`,
        figure: cuboidFigure(a, b, c, unit),
        answer: { type: 'number', value: a * b * c, unit: `${unit}³` },
        inputLabel: '$V =$',
        hint: 'A téglatest térfogata $V = a \\cdot b \\cdot c$.',
        solution: [
          tex`$V = ${num(a)} \cdot ${num(b)} \cdot ${num(c)} = ${num(a * b * c)}$ ${unit}³.`,
          tex`A téglatest térfogata **${num(a * b * c)} ${unit}³**.`,
        ],
      };
    }
    const a = rng.int(2, 6);
    return {
      prompt: tex`Egy kocka térfogata $${num(a * a * a)}$ ${unit}³. Milyen hosszú az éle?`,
      figure: cubeFigure(a, unit, true),
      answer: { type: 'number', value: a, unit },
      inputLabel: '$a =$',
      hint: 'Melyik szám köbe adja a térfogatot? $V = a^3$.',
      solution: [
        tex`$a^3 = ${num(a * a * a)}$.`,
        tex`Próbáljuk: $${num(a)}^3 = ${num(a * a * a)}$, tehát $a = ${num(a)}$.`,
        tex`A kocka éle **${num(a)} ${unit}**.`,
      ],
    };
  },
};

/** Capacity problems in litres and hectolitres. */
const capacity: GeneratorDef = {
  id: 'capacity',
  title: 'Űrtartalom literben és hektoliterben',
  levels: [2, 3],
  generate(rng, level): Question {
    if (level === 2) {
      const a = rng.int(3, 8) * 10;
      let b = rng.int(3, 8) * 10;
      if (b === a) b = b === 80 ? 70 : b + 10;
      const c = rng.int(2, 6) * 10;
      const liters = (a * b * c) / 1000;
      return {
        prompt: tex`Egy akvárium $${num(a)}$ cm × $${num(b)}$ cm × $${num(c)}$ cm. Hány liter víz fér bele?`,
        figure: cuboidFigure(a, b, c, 'cm'),
        answer: { type: 'number', value: liters, unit: 'l' },
        inputLabel: '$V =$',
        hint: '1 dm³ = 1 l. A cm³-t oszd 1000-rel, vagy váltsd a méreteket dm-be.',
        solution: [
          tex`$V = ${num(a)} \cdot ${num(b)} \cdot ${num(c)} = ${num(a * b * c)}$ cm³.`,
          tex`$1$ dm³ $= 1000$ cm³, ezért $${num(a * b * c)} : 1000 = ${num(liters)}$ dm³.`,
          tex`$1$ dm³ $= 1$ l, tehát **${num(liters)} liter** víz fér bele.`,
        ],
      };
    }
    const a = rng.pick([2, 3]);
    const b = rng.pick([1, 2]);
    const c = rng.pick([1, 1.5]);
    const m3 = clean(a * b * c);
    const hl = clean(m3 * 10);
    return {
      prompt: tex`Egy téglatest alakú tartály $${num(a)}$ m × $${num(b)}$ m × $${num(c)}$ m. Hány hl víz fér bele?`,
      figure: cuboidFigure(a, b, c, 'm'),
      answer: { type: 'number', value: hl, unit: 'hl' },
      inputLabel: '$V =$',
      hint: '1 m³ = 1000 l = 10 hl.',
      solution: [
        tex`$V = ${num(a)} \cdot ${num(b)} \cdot ${num(c)} = ${num(m3)}$ m³.`,
        tex`$1$ m³ $= 10$ hl, ezért $${num(m3)} \cdot 10 = ${num(hl)}$ hl.`,
        tex`A tartályba **${num(hl)} hl** víz fér.`,
      ],
    };
  },
};

/** Space diagonal of a cuboid: d² = a² + b² + c². */
const spaceDiagonal: GeneratorDef = {
  id: 'space-diagonal',
  title: 'A téglatest testátlója',
  levels: [3],
  generate(rng): Question {
    const exactCases: [number, number, number, number][] = [
      [1, 2, 2, 3],
      [2, 3, 6, 7],
      [3, 4, 12, 13],
      [4, 4, 7, 9],
    ];
    const rootCases: [number, number, number][] = [
      [2, 3, 4],
      [1, 2, 3],
      [2, 2, 3],
      [3, 4, 5],
      [2, 2, 5],
    ];
    const useRoot = rng.chance(0.35);
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (!useRoot) {
      const [a, b, c, d] = rng.pick(exactCases);
      return {
        prompt: tex`Egy téglatest élei $${num(a)}$ ${unit}, $${num(b)}$ ${unit} és $${num(c)}$ ${unit}. Milyen hosszú a testátlója?`,
        figure: diagonalFigure(a, b, c),
        answer: { type: 'number', value: d, unit },
        inputLabel: '$d =$',
        hint: 'Két lépésben: előbb az alaplap átlója Pitagorasszal, aztán a testátló a magassággal.',
        solution: [
          tex`Az alaplap átlója: $e^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(a * a + b * b)}$.`,
          tex`A testátló: $d^2 = e^2 + ${num(c)}^2 = ${num(a * a + b * b)} + ${num(c * c)} = ${num(d * d)}$.`,
          tex`$d = \sqrt{${num(d * d)}} = ${num(d)}$ ${unit}.`,
          tex`A testátló **${num(d)} ${unit}** hosszú.`,
        ],
      };
    }
    const [a, b, c] = rng.pick(rootCases);
    const sum = a * a + b * b + c * c;
    const root = simplifyRoot(sum);
    const rootTex = `${root.coef === 1 ? '' : num(root.coef)}\\sqrt{${num(root.radicand)}}`;
    return {
      prompt: tex`Egy téglatest élei $${num(a)}$ ${unit}, $${num(b)}$ ${unit} és $${num(c)}$ ${unit}. Milyen hosszú a testátlója? (Gyökös alakban add meg!)`,
      figure: diagonalFigure(a, b, c),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, unit },
      inputLabel: '$d =$',
      hint: 'Két lépésben: előbb az alaplap átlója Pitagorasszal, aztán a testátló a magassággal.',
      solution: [
        tex`Az alaplap átlója: $e^2 = ${num(a)}^2 + ${num(b)}^2 = ${num(a * a)} + ${num(b * b)} = ${num(a * a + b * b)}$.`,
        tex`A testátló: $d^2 = ${num(a * a + b * b)} + ${num(c)}^2 = ${num(sum)}$.`,
        tex`$d = \sqrt{${num(sum)}} = ${rootTex}$ ${unit}.`,
        tex`A testátló **$${rootTex}$ ${unit}** hosszú.`,
      ],
    };
  },
};

/** True/false statements about polyhedra, their elements and the volume units. */
const polyhedronTf: GeneratorDef = {
  id: 'polyhedron-tf',
  title: 'Igaz-hamis állítások a poliéderekről',
  levels: [1, 2],
  generate(rng, level): Question {
    const statements: { text: string; value: boolean; why: string }[] = [
      { text: 'A kocka poliéder.', value: true, why: 'A kockát 6 négyzet határolja, ezért poliéder.' },
      { text: 'A gömb poliéder.', value: false, why: 'A gömb felülete nem sokszögekből áll, ezért nem poliéder.' },
      { text: 'A henger poliéder.', value: false, why: 'A henger palástja görbe felület, ezért nem poliéder.' },
      { text: 'A téglatest poliéder.', value: true, why: 'A téglatestet téglalapok határolják.' },
      { text: 'A gúla poliéder.', value: true, why: 'A gúlát sokszögek határolják.' },
      { text: 'A kúp poliéder.', value: false, why: 'A kúp palástja görbe felület, ezért nem poliéder.' },
      { text: 'A poliéder lapjai sokszögek.', value: true, why: 'A poliédert sokszöglapok határolják.' },
      { text: 'A kockának 6 lapja van.', value: true, why: 'A kocka 6 négyzetből áll.' },
      { text: 'A téglatestnek 8 csúcsa van.', value: true, why: 'A téglatestnek 8 csúcsa van.' },
      { text: 'A kockának 8 éle van.', value: false, why: 'A kockának 12 éle van.' },
      { text: 'A gúlának minden lapja háromszög.', value: false, why: 'Az alaplap sokszög, csak az oldallapok háromszögek.' },
      { text: 'A hengernek nincs csúcsa.', value: true, why: 'A henger palástja és alapkörei nem találkoznak csúcsban.' },
      { text: 'A kúpnak egy csúcsa van.', value: true, why: 'A kúpnak egyetlen csúcsa van.' },
      { text: 'A gömbnek nincs éle és csúcsa.', value: true, why: 'A gömb felülete mindenhol sima.' },
      { text: 'A kocka felszíne $6a^2$.', value: true, why: 'Hat egybevágó $a^2$ területű négyzet.' },
      { text: 'A kocka térfogata $6a^2$.', value: false, why: 'A $6a^2$ a felszín; a térfogat $a^3$.' },
      { text: 'A téglatest térfogata $abc$.', value: true, why: 'Az alaplap területe $ab$, ezt szorozzuk $c$-vel.' },
      { text: '1 l = 1 cm³.', value: false, why: '1 l = 1 dm³ = 1000 cm³.' },
      { text: '1 ml = 1 cm³.', value: true, why: 'Ez a milliliter és a köbcentiméter kapcsolata.' },
      { text: '1 m³ = 1000 dm³.', value: true, why: 'A méter 10 dm, ezért a köbtérfogat 1000-szeres.' },
      { text: '1 hl = 100 l.', value: true, why: 'A hektoliter 100 liter.' },
      { text: 'A felszínt cm²-ben, a térfogatot cm³-ben mérjük.', value: true, why: 'A felszín terület, a térfogat köbtérfogat.' },
    ];
    const pool = level === 1 ? statements.slice(0, 14) : statements;
    const s = rng.pick(pool);
    return {
      prompt: `Igaz vagy hamis?\n\n**${s.text}**`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át, mit tudsz a poliéderekről, a lapokról és a mértékegységekről!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-pont-egyenes-sik-03',
  goals: [
    'felismerni a poliédereket és megkülönböztetni őket a görbe felületű testektől,',
    'megszámolni a lapokat, éleket és csúcsokat,',
    'kiszámítani a kocka és a téglatest felszínét és térfogatát,',
    'váltani a térfogat mértékegységei és a litermértékek között.',
  ],
  parts: [
    {
      title: 'Test és felület',
      steps: [
        {
          type: 'theory',
          title: 'Felület és test',
          body: 'A test a tér egy része, a felület a határa. A poliédert sokszögek határolják; a gömb, a henger és a kúp nem poliéder.',
          figure: theorySolid,
          remember: 'poliéder = sokszögekkel határolt test',
        },
        {
          type: 'theory',
          title: 'Lap, él, csúcs',
          body: 'A lapok sokszögek, az élek a lapok határai, a csúcsokban élek találkoznak. A kockának 6 lapja, 12 éle és 8 csúcsa van.',
          figure: theoryVertices,
          remember: 'lap · él · csúcs',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik test **nem** poliéder?',
            answer: textChoice('a gömb', ['a kocka', 'a téglatest', 'a négyszög alapú gúla']),
            hint: 'A poliédert sokszöglapok határolják.',
            solution: ['A gömb felülete görbe, nem sokszögekből áll.', 'Ezért a gömb **nem poliéder**.'],
          },
        },
        { type: 'practice', generator: 'count-elements', level: 1, count: 2 },
        { type: 'practice', generator: 'polyhedron-tf', level: 1 },
      ],
    },
    {
      title: 'Felszín és háló',
      steps: [
        {
          type: 'theory',
          title: 'A felszín',
          body: 'A test felszíne a hálójának területe. A kocka 6 egybevágó négyzetből áll: $P = 6a^2$. A téglatestnél $P = 2(ab + bc + ca)$.',
          figure: theoryNet,
          remember: 'felszín = a háló területe',
        },
        {
          type: 'example',
          title: 'A kocka felszíne',
          problem: 'Egy kocka éle $4$ cm. Mekkora a felszíne?',
          figure: cubeFigure(4, 'cm'),
          steps: [
            { text: 'Egy lap területe: $4^2 = 16$ cm².' },
            { text: 'A kockának 6 egyforma lapja van.' },
            { text: '$6 \\cdot 16 = 96$ cm².' },
          ],
          answer: 'A kocka felszíne **96 cm²**.',
        },
        { type: 'practice', generator: 'surface-area', level: 1, count: 2 },
        { type: 'practice', generator: 'surface-area', level: 2 },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A kocka felszíne $6a^2$.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Hány egybevágó négyzetből áll a kocka?',
            solution: ['A kocka 6 egybevágó $a^2$ területű négyzetből áll.', 'Ezért a felszíne $6a^2$, az állítás **igaz**.'],
          },
        },
      ],
    },
    {
      title: 'Térfogat és mértékegységek',
      steps: [
        {
          type: 'theory',
          title: 'A térfogat',
          body: 'A térfogat azt méri, mennyi helyet foglal el a test. Egységkockákkal mérjük: 1 cm³ egy 1 cm élű kocka térfogata.',
          figure: theoryVolume,
          remember: 'térfogat = elfoglalt hely',
        },
        {
          type: 'theory',
          title: 'Mértékegységek',
          body: 'A szomszédos térfogategységek között 1000 a váltószám: mm³ → cm³ → dm³ → m³. $1$ dm³ $= 1$ l, $1$ cm³ $= 1$ ml, $1$ hl $= 100$ l.',
          remember: '1 dm³ = 1 l · 1 cm³ = 1 ml · 1 m³ = 1000 l',
        },
        {
          type: 'check',
          question: {
            prompt: 'Hány cm³ egy dm³?',
            answer: textChoice('$1000$', ['$100$', '$10$', '$10\\,000$']),
            hint: 'A deciméter 10 cm, a köbtérfogatnál ez 10 · 10 · 10.',
            solution: ['1 dm = 10 cm, ezért 1 dm³ = 10 · 10 · 10 = 1000 cm³.', 'A válasz **1000**.'],
          },
        },
        { type: 'practice', generator: 'unit-conversion', level: 1, count: 2 },
        { type: 'practice', generator: 'unit-conversion', level: 2 },
        { type: 'practice', generator: 'polyhedron-tf', level: 2 },
      ],
    },
    {
      title: 'Kocka és téglatest térfogata',
      steps: [
        {
          type: 'theory',
          title: 'A térfogat képlete',
          body: 'A kocka térfogata $V = a^3$, a téglatesté $V = abc$. A téglatestnél az alaplap területét szorozzuk a magassággal.',
          figure: theoryVolume,
          remember: '$V = a^3$ · $V = abc$',
        },
        {
          type: 'example',
          title: 'A téglatest térfogata',
          problem: 'Egy téglatest élei $5$ cm, $4$ cm és $3$ cm. Mekkora a térfogata?',
          figure: cuboidFigure(5, 4, 3, 'cm'),
          steps: [
            { text: '$V = a \\cdot b \\cdot c$' },
            { text: '$V = 5 \\cdot 4 \\cdot 3 = 60$ cm³.' },
          ],
          answer: 'A téglatest térfogata **60 cm³**.',
        },
        { type: 'practice', generator: 'volume', level: 1, count: 2 },
        { type: 'practice', generator: 'volume', level: 2 },
        { type: 'practice', generator: 'capacity', level: 2 },
      ],
    },
    {
      title: 'Mindennapi térfogatok',
      steps: [
        {
          type: 'theory',
          title: 'Liter és hektoliter',
          body: 'A folyadékok térfogatát literben mérjük: $1$ dm³ $= 1$ l. Nagyobb mennyiségnél $1$ m³ $= 1000$ l $= 10$ hl.',
          figure: theoryLiter,
          remember: '1 m³ = 1000 l = 10 hl',
        },
        {
          type: 'example',
          title: 'Az akvárium',
          problem: 'Egy akvárium $5$ dm × $4$ dm × $3$ dm. Hány liter víz fér bele?',
          figure: cuboidFigure(5, 4, 3, 'dm'),
          steps: [
            { text: '$V = 5 \\cdot 4 \\cdot 3 = 60$ dm³.' },
            { text: '$1$ dm³ $= 1$ l.' },
          ],
          answer: 'Az akváriumba **60 liter** víz fér.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Hány liter $2$ m³?',
            answer: textChoice('$2000$', ['$200$', '$20$', '$20\\,000$']),
            hint: '1 m³ = 1000 dm³, és 1 dm³ = 1 l.',
            solution: ['1 m³ = 1000 dm³ = 1000 l.', 'Ezért 2 m³ = **2000 l**.'],
          },
        },
        { type: 'practice', generator: 'capacity', level: 3 },
        { type: 'practice', generator: 'volume', level: 3 },
        { type: 'practice', generator: 'space-diagonal', level: 3 },
      ],
    },
  ],
  generators: [countElements, surfaceArea, unitConversion, volume, capacity, spaceDiagonal, polyhedronTf],
  miniTest: {
    items: [
      { generator: 'polyhedron-tf', level: 1 },
      { generator: 'surface-area', level: 1 },
      { generator: 'unit-conversion', level: 2 },
      { generator: 'volume', level: 2 },
      { generator: 'capacity', level: 2 },
      { generator: 'surface-area', level: 2 },
      { generator: 'count-elements', level: 3 },
      { generator: 'space-diagonal', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'count-elements', level: 2 },
    { generator: 'surface-area', level: 1 },
    { generator: 'unit-conversion', level: 3 },
    { generator: 'volume', level: 1 },
    { generator: 'capacity', level: 2 },
    { generator: 'volume', level: 3 },
    { generator: 'space-diagonal', level: 3 },
  ],
});
