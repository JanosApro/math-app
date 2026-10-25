/**
 * 8. osztály › Háromszögek hasonlósága › 3. Háromszögek hasonlósága
 *
 * Similar figures in everyday life, the definition of similar triangles, the similarity ratio k,
 * corresponding sides and angles, the notation △ABC ~ △A₁B₁C₁, and the perimeter ratio (= k).
 */
import {
  choice,
  defineSubtopic,
  num,
  tex,
  texFrac,
  textChoice,
  type Figure,
  type GeoItem,
  type GeneratorDef,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

type TriSides = [number, number, number];

const mid = (a: XY, b: XY): XY => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const labelAt = (at: XY, text: string, dir: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'): GeoItem => ({ kind: 'label', at, text, dir });

/** "a" or "az" for a side/angle name: az AB, a BC, az α, a β. */
const art = (name: string) => (/^[AÁEÉIÍOÓÖŐUÚÜŰ]|^α/.test(name) ? 'az' : 'a');
const capArt = (name: string) => (art(name) === 'az' ? 'Az' : 'A');

/** Coordinates of a triangle with sides a = BC, b = CA, c = AB, base AB horizontal. */
function coordsOf([a, b, c]: TriSides): { A: XY; B: XY; C: XY } {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return { A: [0, 0], B: [c, 0], C: [x, y] };
}

/** Two similar triangles side by side. `k` is the ratio of the second to the first. */
function twoTriangles(opts: {
  base: TriSides;
  k: number;
  labels1?: Partial<Record<'a' | 'b' | 'c', string>>;
  labels2?: Partial<Record<'a' | 'b' | 'c', string>>;
  highlight2?: ('a' | 'b' | 'c')[];
  angles?: boolean | 'second';
  markAngle?: 'α' | 'β' | 'γ';
  baseLabelsInside?: boolean;
}): Figure {
  const p1 = coordsOf(opts.base);
  const p2 = coordsOf([opts.base[0] * opts.k, opts.base[1] * opts.k, opts.base[2] * opts.k]);
  const dx = Math.max(p1.B[0], p1.C[0]) + 5;
  const shift = (p: XY): XY => [p[0] + dx, p[1]];
  const A2 = shift(p2.A);
  const B2 = shift(p2.B);
  const C2 = shift(p2.C);
  const L1 = opts.labels1 ?? {};
  const L2 = opts.labels2 ?? {};
  const inside = opts.baseLabelsInside;
  const items: GeoItem[] = [
    { kind: 'polygon', points: ['A', 'B', 'C'], sideLabels: [inside ? null : L1.c ?? null, L1.a ?? null, L1.b ?? null], fill: true },
    { kind: 'polygon', points: ['A₁', 'B₁', 'C₁'], sideLabels: [inside ? null : L2.c ?? null, L2.a ?? null, L2.b ?? null], fill: true },
  ];
  if (inside && L1.c) items.push(labelAt(mid(p1.A, p1.B), L1.c, 'n'));
  if (inside && L2.c) items.push(labelAt(mid(A2, B2), L2.c, 'n'));
  if (opts.highlight2?.includes('c')) items.push({ kind: 'segment', from: 'A₁', to: 'B₁', color: 'highlight', width: 'thick' });
  if (opts.highlight2?.includes('a')) items.push({ kind: 'segment', from: 'B₁', to: 'C₁', color: 'highlight', width: 'thick' });
  if (opts.highlight2?.includes('b')) items.push({ kind: 'segment', from: 'C₁', to: 'A₁', color: 'highlight', width: 'thick' });
  if (opts.markAngle) {
    const v = opts.markAngle === 'α' ? 'A' : opts.markAngle === 'β' ? 'B' : 'C';
    const from = opts.markAngle === 'γ' ? 'A' : opts.markAngle === 'α' ? 'B' : 'A';
    const to = opts.markAngle === 'γ' ? 'B' : 'C';
    items.push({ kind: 'angle', vertex: v, from, to, label: opts.markAngle });
  }
  if (opts.angles) {
    if (opts.angles !== 'second') {
      items.push(
        { kind: 'angle', vertex: 'A', from: 'B', to: 'C', label: 'α' },
        { kind: 'angle', vertex: 'B', from: 'A', to: 'C', label: 'β' },
        { kind: 'angle', vertex: 'C', from: 'A', to: 'B', label: 'γ' },
      );
    }
    items.push(
      { kind: 'angle', vertex: 'A₁', from: 'B₁', to: 'C₁', label: 'α₁' },
      { kind: 'angle', vertex: 'B₁', from: 'A₁', to: 'C₁', label: 'β₁' },
      { kind: 'angle', vertex: 'C₁', from: 'A₁', to: 'B₁', label: 'γ₁' },
    );
  }
  return {
    type: 'geometry',
    points: { ...p1, 'A₁': A2, 'B₁': B2, 'C₁': C2 },
    items,
  };
}

/** Two similar rectangles, like a photo and its enlargement. */
const photoFigure: Figure = {
  type: 'geometry',
  points: { P1: [0, 0], P2: [6, 0], P3: [6, 4], P4: [0, 4], Q1: [8, 0], Q2: [20, 0], Q3: [20, 8], Q4: [8, 8] },
  items: [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], sideLabels: ['6 cm', '4 cm', null, null], fill: true, vertexLabels: false },
    { kind: 'polygon', points: ['Q1', 'Q2', 'Q3', 'Q4'], sideLabels: ['12 cm', '8 cm', null, null], fill: true, vertexLabels: false },
    { kind: 'label', at: [3, 5], text: 'fénykép' },
    { kind: 'label', at: [14, 9], text: 'nagyítás' },
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** The similarity ratio k = A₁B₁ : AB. */
const ratioK: GeneratorDef = {
  id: 'ratio-k',
  title: 'A hasonlósági arány',
  levels: [1, 2],
  generate(rng, level): Question {
    const base: TriSides = level === 1 ? rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]] as TriSides[]) : rng.pick([[4, 5, 6], [4, 6, 8], [5, 12, 13], [6, 8, 10]] as TriSides[]);
    const k = level === 1 ? rng.pick([2, 3]) : rng.pick([0.5, 1.5, 2.5]);
    const ab = base[2];
    const a1b1 = ab * k;
    return {
      prompt: tex`A két háromszög hasonló. $AB = ${num(ab)}$ cm, $A_1B_1 = ${num(a1b1)}$ cm. Mennyi a hasonlósági arány ($k = A_1B_1 : AB$)?`,
      figure: twoTriangles({ base, k, labels1: { c: `${num(ab)} cm` }, labels2: { c: `${num(a1b1)} cm` }, baseLabelsInside: true }),
      answer: { type: 'number', value: k },
      inputLabel: '$k =$',
      hint: 'A hasonlósági arány a két megfelelő oldal hosszának hányadosa: $k = A_1B_1 : AB$.',
      solution: [
        tex`A megfelelő oldalak: $AB = ${num(ab)}$ cm és $A_1B_1 = ${num(a1b1)}$ cm.`,
        tex`$k = ${num(a1b1)} : ${num(ab)} = ${num(k)}$`,
        tex`A hasonlósági arány **$${num(k)}$**.`,
      ],
    };
  },
};

/** A missing side from two similar triangles. */
const missingSide: GeneratorDef = {
  id: 'missing-side',
  title: 'Hiányzó oldal hasonló háromszögekben',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const base: TriSides = [6, 8, 10];
      const k = rng.pick([1.5, 2, 2.5]);
      const longest = 10 * k;
      const answer = (6 + 8) * k;
      return {
        prompt: tex`Az egyik háromszög oldalai $6$, $8$ és $10$ cm. A hasonló másik háromszög leghosszabb oldala $${num(longest)}$ cm. Mennyi a másik két oldal összege?`,
        answer: { type: 'number', value: answer, unit: 'cm' },
        hint: 'Előbb keresd meg a hasonlósági arányt a leghosszabb oldalakból, aztán számold ki a másik két oldalt!',
        solution: [
          tex`A leghosszabb oldalak: $10$ cm és $${num(longest)}$ cm, ezért $k = ${num(longest)} : 10 = ${num(k)}$.`,
          tex`A másik két oldal: $6 \cdot ${num(k)} = ${num(6 * k)}$ cm és $8 \cdot ${num(k)} = ${num(8 * k)}$ cm.`,
          tex`Az összegük: $${num(6 * k)} + ${num(8 * k)} = ${num(answer)}$ cm.`,
          tex`A másik két oldal összege **${num(answer)} cm**.`,
        ],
      };
    }
    const base: TriSides = level === 1 ? rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]] as TriSides[]) : rng.pick([[4, 5, 6], [4, 6, 8], [5, 12, 13], [6, 8, 10]] as TriSides[]);
    const k = level === 1 ? rng.pick([2, 3]) : rng.pick([1.25, 1.5]);
    const a = base[0];
    const c = base[2];
    const a1 = a * k;
    const c1 = c * k;
    return {
      prompt: tex`A két háromszög hasonló. $AB = ${num(c)}$ cm, $BC = ${num(a)}$ cm, $A_1B_1 = ${num(c1)}$ cm. Milyen hosszú a $B_1C_1$?`,
      figure: twoTriangles({
        base,
        k,
        labels1: { c: `${num(c)} cm`, a: `${num(a)} cm` },
        labels2: { c: `${num(c1)} cm`, a: '?' },
        highlight2: ['a'],
        baseLabelsInside: true,
      }),
      answer: { type: 'number', value: a1, unit: 'cm' },
      inputLabel: '$B_1C_1 =$',
      hint: 'Előbb számold ki a hasonlósági arányt: $k = A_1B_1 : AB$.',
      solution: [
        tex`A hasonlósági arány: $k = ${num(c1)} : ${num(c)} = ${num(k)}$.`,
        tex`A megfelelő oldal: $B_1C_1 = k \cdot BC = ${num(k)} \cdot ${num(a)} = ${num(a1)}$ cm.`,
        tex`A $B_1C_1$ **${num(a1)} cm** hosszú.`,
      ],
    };
  },
};

/** Which side or angle corresponds to the given one? */
const matchingParts: GeneratorDef = {
  id: 'matching-parts',
  title: 'Megfelelő oldalak és szögek',
  levels: [1, 2],
  generate(rng, level): Question {
    const base: TriSides = [6, 8, 10];
    if (level === 1) {
      const side = rng.pick(['AB', 'BC', 'CA'] as const);
      const correctName = side === 'AB' ? 'A_1B_1' : side === 'BC' ? 'B_1C_1' : 'C_1A_1';
      const correct = `$${correctName}$`;
      const wrongs = side === 'AB' ? ['$B_1C_1$', '$C_1A_1$'] : side === 'BC' ? ['$A_1B_1$', '$C_1A_1$'] : ['$A_1B_1$', '$B_1C_1$'];
      return {
        prompt: tex`A $\triangle ABC \sim \triangle A_1B_1C_1$ hasonlóságban melyik oldal felel meg ${art(side)} $${side}$ oldalnak?`,
        figure: twoTriangles({ base, k: 2 }),
        answer: choice(rng, correct, wrongs, { count: 3 }),
        hint: tex`A jelölésben a csúcsok sorrendje mutatja a megfelelést: $A \leftrightarrow A_1$, $B \leftrightarrow B_1$, $C \leftrightarrow C_1$.`,
        solution: [
          tex`A csúcsok megfelelése: $A \leftrightarrow A_1$, $B \leftrightarrow B_1$, $C \leftrightarrow C_1$.`,
          tex`${capArt(side)} $${side}$ oldalnak ${art(correctName)} $${correctName}$ oldal felel meg.`,
        ],
      };
    }
    const angle = rng.pick(['α', 'β', 'γ'] as const);
    const correctName = angle === 'α' ? 'α_1' : angle === 'β' ? 'β_1' : 'γ_1';
    const correct = `$${correctName}$`;
    const wrongs = angle === 'α' ? ['$β_1$', '$γ_1$'] : angle === 'β' ? ['$α_1$', '$γ_1$'] : ['$α_1$', '$β_1$'];
    return {
      prompt: tex`A $\triangle ABC \sim \triangle A_1B_1C_1$ hasonlóságban melyik szög egyenlő ${art(angle)} $${angle}$ szöggel?`,
      figure: twoTriangles({ base, k: 2, angles: 'second', markAngle: angle }),
      answer: choice(rng, correct, wrongs, { count: 3 }),
      hint: 'A megfelelő csúcsoknál lévő szögek egyenlők.',
      solution: [
        tex`A megfelelő csúcsok: $A \leftrightarrow A_1$, $B \leftrightarrow B_1$, $C \leftrightarrow C_1$.`,
        tex`${capArt(angle)} $${angle}$ szögnek ${art(correctName)} $${correctName}$ szög felel meg.`,
      ],
    };
  },
};

/** A missing angle in a pair of similar triangles. */
const missingAngle: GeneratorDef = {
  id: 'missing-angle',
  title: 'Hiányzó szög hasonló háromszögekben',
  levels: [1, 2],
  generate(rng, level): Question {
    const triples: [number, number, number][] = [
      [40, 60, 80],
      [50, 60, 70],
      [30, 70, 80],
      [45, 55, 80],
      [35, 75, 70],
      [30, 60, 90],
      [40, 50, 90],
      [60, 60, 60],
    ];
    const [a, b, c] = rng.shuffle(rng.pick(triples));
    const rad = Math.PI / 180;
    const sides: TriSides = [Math.sin(a * rad) * 10, Math.sin(b * rad) * 10, Math.sin(c * rad) * 10];
    const figure = twoTriangles({ base: sides, k: 2, angles: true });
    if (level === 1) {
      return {
        prompt: tex`Az $ABC$ és $A_1B_1C_1$ háromszögek hasonlók. Az $ABC$ háromszögben $\alpha = ${num(a)}°$ és $\beta = ${num(b)}°$. Mennyi a $\gamma_1$ szög?`,
        figure,
        answer: { type: 'number', value: c, unit: '°' },
        inputLabel: tex`$\gamma_1 =$`,
        hint: 'A háromszög szögeinek összege $180°$, és a hasonló háromszögek megfelelő szögei egyenlők.',
        solution: [
          tex`Az $ABC$ háromszög harmadik szöge: $\gamma = 180° - ${num(a)}° - ${num(b)}° = ${num(c)}°$.`,
          tex`A hasonlóság miatt $\gamma_1 = \gamma = ${num(c)}°$.`,
          tex`A $\gamma_1$ szög **${num(c)}°**.`,
        ],
      };
    }
    return {
      prompt: tex`A két háromszög hasonló. A másodikban $\alpha_1 = ${num(a)}°$ és $\gamma_1 = ${num(c)}°$. Mennyi a $\beta$ szög?`,
      figure,
      answer: { type: 'number', value: b, unit: '°' },
      inputLabel: tex`$\beta =$`,
      hint: tex`A második háromszög harmadik szöge $180°$ mínusz a két ismert szög; ez egyenlő a megfelelő $\beta$ szöggel.`,
      solution: [
        tex`A második háromszög harmadik szöge: $\beta_1 = 180° - ${num(a)}° - ${num(c)}° = ${num(b)}°$.`,
        tex`A hasonlóság miatt $\beta = \beta_1 = ${num(b)}°$.`,
        tex`A $\beta$ szög **${num(b)}°**.`,
      ],
    };
  },
};

/** Perimeter (L2) and area (L3) of similar triangles. */
const perimeterSimilar: GeneratorDef = {
  id: 'perimeter-similar',
  title: 'Kerület és terület hasonló háromszögeknél',
  levels: [2, 3],
  generate(rng, level): Question {
    if (level === 2) {
      const k = rng.pick([2, 1.5, 0.5, 3]);
      const perimeter = rng.pick([12, 16, 20, 24, 30]);
      const answer = perimeter * k;
      const times =
        k === 2 ? 'kétszer' : k === 3 ? 'háromszor' : k === 1.5 ? 'másfélszer' : 'fele';
      return {
        prompt: tex`Egy háromszög kerülete $${num(perimeter)}$ cm. A hozzá hasonló háromszög oldalai ${times} olyan hosszúak. Mennyi a kerülete?`,
        answer: { type: 'number', value: answer, unit: 'cm' },
        hint: tex`A kerület ugyanannyiszorosára változik, mint az oldalak: $K_1 = k \cdot K$.`,
        solution: [
          tex`A hasonlósági arány: $k = ${num(k)}$.`,
          tex`$K_1 = k \cdot K = ${num(k)} \cdot ${num(perimeter)} = ${num(answer)}$ cm.`,
          tex`A másik háromszög kerülete **${num(answer)} cm**.`,
        ],
      };
    }
    const pool: { ratio: [number, number]; k: [number, number]; side: number }[] = [
      { ratio: [9, 25], k: [5, 3], side: 6 },
      { ratio: [4, 9], k: [3, 2], side: 8 },
      { ratio: [16, 25], k: [5, 4], side: 8 },
      { ratio: [1, 4], k: [2, 1], side: 5 },
      { ratio: [9, 16], k: [4, 3], side: 9 },
    ];
    const { ratio, k, side } = rng.pick(pool);
    const answer = (side * k[0]) / k[1];
    return {
      prompt: tex`Két hasonló háromszög területének aránya $${num(ratio[0])} : ${num(ratio[1])}$. A kisebbik egyik oldala $${num(side)}$ cm. Melyik a megfelelő oldal a nagyobbikban?`,
      answer: { type: 'number', value: answer, unit: 'cm' },
      hint: 'A területek aránya $k^2$. Előbb keresd meg $k$-t, aztán szorozd meg az oldalt!',
      solution: [
        tex`A területek aránya $${num(ratio[0])} : ${num(ratio[1])} = k^2$.`,
        tex`$k = \sqrt{${num(ratio[1])} : ${num(ratio[0])}} = ${texFrac(k[0], k[1])}$`,
        tex`A megfelelő oldal: $${num(side)} \cdot ${texFrac(k[0], k[1])} = ${num(answer)}$ cm.`,
        tex`A nagyobbik háromszög megfelelő oldala **${num(answer)} cm**.`,
      ],
    };
  },
};

/** True/false: are the two triangles similar? */
const similarTF: GeneratorDef = {
  id: 'similar-tf',
  title: 'Hasonlóak-e a háromszögek?',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const pool: TriSides[] = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
        [7, 24, 25],
        [9, 12, 15],
      ];
      const base = rng.pick(pool);
      const isTrue = rng.chance(0.5);
      const k = rng.pick([2, 3]);
      const second: TriSides = isTrue
        ? [base[0] * k, base[1] * k, base[2] * k]
        : [base[0] * k, base[1] * k, base[2] * k + rng.pick([1, 2, 3])];
      const fmt = (t: TriSides) => `$${num(t[0])}$, $${num(t[1])}$ és $${num(t[2])}$`;
      return {
        prompt: tex`Két háromszög oldalai ${fmt(base)} cm, illetve ${fmt(second)} cm.\n\n**A két háromszög hasonló.**`,
        answer: { type: 'truefalse', value: isTrue },
        hint: 'Hasonlítsd össze a megfelelő oldalak arányát! Mindhárom párnál ugyanazt kapod?',
        solution: [
          tex`A megfelelő oldalak arányai: $${num(second[0])} : ${num(base[0])}$, $${num(second[1])} : ${num(base[1])}$, $${num(second[2])} : ${num(base[2])}$.`,
          isTrue
            ? tex`Mindhárom arány $${num(k)}$, tehát a háromszögek **hasonlók** — az állítás **igaz**.`
            : tex`Nem mindhárom arány egyenlő, tehát a háromszögek **nem hasonlók** — az állítás **hamis**.`,
        ],
      };
    }
    const triples: TriSides[] = [
      [40, 60, 80],
      [50, 60, 70],
      [30, 70, 80],
      [45, 55, 80],
      [35, 75, 70],
      [30, 60, 90],
      [40, 50, 90],
      [60, 60, 60],
    ];
    const first = rng.pick(triples);
    const isTrue = rng.chance(0.5);
    const sameSet = (x: TriSides, y: TriSides) => [...x].sort().join() === [...y].sort().join();
    let second = rng.pick(triples);
    if (isTrue) {
      second = first;
    } else {
      while (sameSet(first, second)) second = rng.pick(triples);
    }
    const pair = (t: TriSides, pickPair: number) => {
      const pairs: [number, number][] = [
        [t[0], t[1]],
        [t[1], t[2]],
        [t[0], t[2]],
      ];
      return `$${num(pairs[pickPair][0])}°$ és $${num(pairs[pickPair][1])}°$`;
    };
    const firstPair = rng.int(0, 2);
    let secondPair = rng.int(0, 2);
    if (isTrue && secondPair === firstPair) secondPair = (secondPair + 1) % 3;
    return {
      prompt: tex`Az egyik háromszögben két szög ${pair(first, firstPair)}, a másikban ${pair(second, secondPair)}.\n\n**A két háromszög hasonló.**`,
      answer: { type: 'truefalse', value: isTrue },
      hint: 'Számold ki a harmadik szöget is ($180°$ mínusz a két ismert szög), aztán hasonlítsd össze a szögeket!',
      solution: [
        tex`Az első háromszög szögei: $${[...first].sort((x, y) => x - y).map((x) => `${num(x)}°`).join(',\\ ')}$.`,
        tex`A második háromszög szögei: $${[...second].sort((x, y) => x - y).map((x) => `${num(x)}°`).join(',\\ ')}$.`,
        isTrue
          ? tex`A szögek páronként egyenlők, tehát a háromszögek **hasonlók** — az állítás **igaz**.`
          : tex`A szögek nem egyeznek meg, tehát a háromszögek **nem hasonlók** — az állítás **hamis**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-hasonlosag-03',
  goals: [
    'felismerni a hasonló háromszögeket,',
    'megkeresni a megfelelő oldalakat és szögeket,',
    'kiszámítani a hasonlósági arányt és a hiányzó oldalakat,',
    'kiszámítani hasonló háromszögek kerületét és területét.',
  ],
  parts: [
    {
      title: 'Hasonló alakzatok',
      steps: [
        {
          type: 'theory',
          title: 'Ugyanaz a forma, más méret',
          body: 'A fénykép kicsinyített vagy nagyított mása, a térkép és a makett is hasonló az eredetihez: a forma ugyanaz, csak a méret változik.',
          figure: photoFigure,
          remember: 'Hasonló alakzatoknál a szögek egyenlők, az oldalak arányosak.',
        },
        {
          type: 'theory',
          title: 'Hasonló háromszögek',
          body: 'Két háromszög hasonló, ha a megfelelő szögeik egyenlők, és a megfelelő oldalaik aránya egyenlő. Jelölés: $\\triangle ABC \\sim \\triangle A_1B_1C_1$.',
          figure: twoTriangles({ base: [4, 5, 6], k: 2, labels1: { c: 'AB = 4 cm' }, labels2: { c: 'A₁B₁ = 8 cm' }, angles: true }),
          remember: '$\\triangle ABC \\sim \\triangle A_1B_1C_1$: a csúcsok sorrendje a megfelelést mutatja.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $\\triangle ABC \\sim \\triangle KLM$ jelölésben melyik szög egyenlő az $A$ csúcs szögével?',
            answer: textChoice('$K$ csúcs szöge', ['$L$ csúcs szöge', '$M$ csúcs szöge']),
            hint: 'A hasonlóság jelölésében a csúcsok sorrendje számít.',
            solution: ['A jelölés szerint $A \\leftrightarrow K$.', 'Tehát az $A$ csúcs szöge a $K$ csúcs szögével egyenlő.'],
          },
        },
        {
          type: 'check',
          question: {
            prompt: 'Két hasonló háromszögben az egyik szög $40°$. Mennyi a megfelelő szög a másikban?',
            answer: textChoice('$40°$', ['$50°$', '$140°$', '$80°$']),
            hint: 'A hasonlóság definíciója mit mond a megfelelő szögekről?',
            solution: ['A hasonló háromszögek megfelelő szögei egyenlők.', 'Tehát a megfelelő szög is **$40°$**.'],
          },
        },
        {
          type: 'example',
          title: 'A megfelelő oldal',
          problem: 'A $\\triangle ABC \\sim \\triangle A_1B_1C_1$ hasonlóságban $AB = 5$ cm. Melyik oldal felel meg az $AB$-nek?',
          figure: twoTriangles({ base: [7, 8, 5], k: 2, labels1: { c: '5 cm' } }),
          steps: [
            { text: 'A jelölésben a csúcsok sorrendje a megfelelést mutatja: $A \\leftrightarrow A_1$, $B \\leftrightarrow B_1$, $C \\leftrightarrow C_1$.' },
            { text: 'Az $AB$ oldal végpontjai $A$ és $B$.' },
            { text: 'A megfelelő végpontok $A_1$ és $B_1$, tehát a megfelelő oldal $A_1B_1$.' },
          ],
          answer: 'Az $AB$ oldalnak az **$A_1B_1$** oldal felel meg.',
        },
        { type: 'practice', generator: 'matching-parts', level: 1, count: 2 },
      ],
    },
    {
      title: 'A hasonlósági arány',
      steps: [
        {
          type: 'theory',
          title: 'A hasonlósági arány',
          body: 'A hasonlósági arány $k = \\frac{A_1B_1}{AB}$: megmutatja, hányszor olyan hosszú a második háromszög minden oldala.',
          remember: '$k = \\frac{A_1B_1}{AB} = \\frac{B_1C_1}{BC} = \\frac{C_1A_1}{CA}$',
        },
        {
          type: 'example',
          title: 'A hasonlósági arány kiszámítása',
          problem: 'Az $ABC$ és $A_1B_1C_1$ háromszögek hasonlók. $AB = 4$ cm, $A_1B_1 = 10$ cm. Mennyi a hasonlósági arány?',
          figure: twoTriangles({ base: [4, 5, 6], k: 2.5, labels1: { c: '4 cm' }, labels2: { c: '10 cm' } }),
          steps: [
            { text: '$k = A_1B_1 : AB$' },
            { text: '$k = 10 : 4 = 2,5$' },
          ],
          answer: 'A hasonlósági arány **2,5**.',
        },
        { type: 'practice', generator: 'ratio-k', level: 1, count: 2 },
        { type: 'practice', generator: 'ratio-k', level: 2 },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Ha a hasonlósági arány $k = 1$, a két háromszög egybevágó.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Mit jelent, ha minden oldal aránya 1?',
            solution: ['Ha $k = 1$, minden megfelelő oldal egyenlő hosszú.', 'Az egyenlő oldalú, megfelelő szögű háromszögek egybevágók, tehát az állítás **igaz**.'],
          },
        },
      ],
    },
    {
      title: 'Hiányzó oldalak és szögek',
      steps: [
        {
          type: 'theory',
          title: 'Megfelelő oldalak',
          body: 'A hasonló háromszögek megfelelő oldalai ugyanabban az arányban vannak. Ha $k = 2$, minden oldal kétszer olyan hosszú.',
          remember: 'A megfelelő szögek egyenlők, az oldalak aránya $k$.',
        },
        {
          type: 'example',
          title: 'Hiányzó oldal',
          problem: 'A két háromszög hasonló. $AB = 6$ cm, $BC = 8$ cm, $A_1B_1 = 9$ cm. Milyen hosszú a $B_1C_1$?',
          figure: twoTriangles({ base: [8, 10, 6], k: 1.5, labels1: { c: '6 cm', a: '8 cm' }, labels2: { c: '9 cm', a: '?' }, highlight2: ['a'] }),
          steps: [
            { text: '$k = A_1B_1 : AB = 9 : 6 = 1,5$' },
            { text: '$B_1C_1 = k \\cdot BC = 1,5 \\cdot 8 = 12$' },
          ],
          answer: '$B_1C_1 = 12$ cm.',
        },
        { type: 'practice', generator: 'missing-side', level: 1, count: 2 },
        { type: 'practice', generator: 'missing-angle', level: 1, count: 2 },
        { type: 'practice', generator: 'similar-tf', level: 1 },
        { type: 'practice', generator: 'similar-tf', level: 2 },
        { type: 'practice', generator: 'matching-parts', level: 2 },
      ],
    },
    {
      title: 'Kerület és terület',
      steps: [
        {
          type: 'theory',
          title: 'Kerület és terület',
          body: 'A kerület ugyanannyiszorosára változik, mint az oldalak: $K_1 = k \\cdot K$. A terület ennek négyzetével: $T_1 = k^2 \\cdot T$.',
          remember: 'Kerület: $k$. Terület: $k^2$.',
        },
        {
          type: 'example',
          title: 'A kerület',
          problem: 'Egy háromszög kerülete $20$ cm. Hasonló háromszögének oldalai $1,5$-ször olyan hosszúak. Mennyi a kerülete?',
          steps: [
            { text: '$k = 1,5$' },
            { text: '$K_1 = k \\cdot K = 1,5 \\cdot 20 = 30$' },
          ],
          answer: 'A kerület **30 cm**.',
        },
        { type: 'practice', generator: 'perimeter-similar', level: 2, count: 2 },
        { type: 'practice', generator: 'perimeter-similar', level: 3 },
        { type: 'practice', generator: 'missing-side', level: 3 },
        {
          type: 'check',
          question: {
            prompt: 'Ha a hasonlósági arány $k = 3$, hányszorosa a második háromszög területe az elsőének?',
            answer: textChoice('$9$-szerese', ['$3$-szorosa', '$6$-szorosa', '$12$-szerese']),
            hint: 'A terület a hossz négyzetével arányos.',
            solution: ['$T_1 : T = k^2 = 3^2 = 9$.', 'A terület **9-szeresére** változik.'],
          },
        },
      ],
    },
  ],
  generators: [ratioK, missingSide, matchingParts, perimeterSimilar, similarTF, missingAngle],
  miniTest: {
    items: [
      { generator: 'matching-parts', level: 1 },
      { generator: 'ratio-k', level: 1 },
      { generator: 'missing-side', level: 1 },
      { generator: 'similar-tf', level: 1 },
      { generator: 'missing-side', level: 2 },
      { generator: 'perimeter-similar', level: 2 },
      { generator: 'perimeter-similar', level: 3 },
      { generator: 'missing-angle', level: 2 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'matching-parts', level: 1 },
    { generator: 'ratio-k', level: 1 },
    { generator: 'missing-side', level: 1 },
    { generator: 'similar-tf', level: 1 },
    { generator: 'perimeter-similar', level: 2 },
    { generator: 'missing-side', level: 3 },
    { generator: 'missing-angle', level: 1 },
  ],
});
