/**
 * 8. osztály › Háromszögek hasonlósága › 4. A háromszögek hasonlóságának tételei
 *
 * The four similarity criteria, choosing the right one, and applications: Thales' shadow,
 * the width of a river, and similarity in a right triangle (altitude to the hypotenuse).
 */
import {
  article,
  clean,
  gcd,
  type Rng,
  defineSubtopic,
  num,
  simplifyRoot,
  suffix,
  tex,
  texRoot,
  textChoice,
  type Dir,
  type Figure,
  type GeoItem,
  type GeneratorDef,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

const capArticle = (n: number) => {
  const a = article(n);
  return a[0].toUpperCase() + a.slice(1);
};

const mid = (a: XY, b: XY): XY => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const lab = (at: XY, text: string, dir: Dir): GeoItem => ({ kind: 'label', at, text, dir });

/** Two poles with their shadows; the second height is the unknown. */
function shadowFigure(h1: number, s1: number, h2: number, s2: number): Figure {
  // A 90 m pyramid next to a 1.5 m pole is unreadable at true scale: enlarge the pole (and its
  // shadow by the same factor, so the rays stay parallel) and mark the figure "not to scale".
  const f = h2 / h1 > 2.5 ? h2 / (2 * h1) : 1;
  const h1d = h1 * f;
  const s1d = s1 * f;
  const x2 = s1d + 2.5;
  const end = x2 + s2 + 1;
  const items: GeoItem[] = [
    { kind: 'segment', from: [-1, 0], to: [end, 0], width: 'thin', color: 'muted' },
    { kind: 'segment', from: [0, 0], to: [0, h1d], width: 'normal' },
    { kind: 'segment', from: [0, 0], to: [s1d, 0], color: 'blue', width: 'thick' },
    { kind: 'segment', from: [0, h1d], to: [s1d, 0], color: 'orange', dashed: true },
    { kind: 'segment', from: [x2, 0], to: [x2, h2], width: 'normal' },
    { kind: 'segment', from: [x2, 0], to: [x2 + s2, 0], color: 'blue', width: 'thick' },
    { kind: 'segment', from: [x2, h2], to: [x2 + s2, 0], color: 'orange', dashed: true },
    { kind: 'angle', vertex: [0, 0], from: [0, h1d], to: [s1d, 0], right: true },
    { kind: 'angle', vertex: [x2, 0], from: [x2, h2], to: [x2 + s2, 0], right: true },
    lab([0, h1d / 2], `${num(h1)} m`, 'w'),
    lab([s1d / 2, 0], `${num(s1)} m`, 's'),
    lab([x2, h2 / 2], '?', 'w'),
    lab([x2 + s2 / 2, 0], `${num(s2)} m`, 's'),
  ];
  return { type: 'geometry', points: {}, items, notToScale: f !== 1 };
}

/**
 * Random shadow data [h1, s1, s2, h2] with h1 : s1 = h2 : s2 = p : q (p, q small and coprime).
 * h1 is in `small` metres, h2 in `big` metres; every value has at most one decimal.
 */
function shadowData(rng: Rng, small: [number, number], big: [number, number]): [number, number, number, number] {
  for (;;) {
    const p = rng.int(2, 6);
    const q = rng.intExcept(2, 6, [p]);
    if (gcd(p, q) !== 1) continue;
    const u = rng.pick([0.1, 0.2, 0.3, 0.4, 0.5]);
    const v = rng.int(1, 30) * rng.pick([0.5, 1]);
    const [h1, s1, h2, s2] = [p * u, q * u, p * v, q * v].map((x) => clean(x));
    if (h1 >= small[0] && h1 <= small[1] && h2 >= big[0] && h2 <= big[1]) return [h1, s1, s2, h2];
  }
}

/** A random triangle with whole sides 3–12 (not too flat). */
function randomSides(rng: Rng): [number, number, number] {
  for (;;) {
    const t = [rng.int(3, 12), rng.int(3, 12), rng.int(3, 12)].sort((u, v) => u - v) as [number, number, number];
    if (t[0] !== t[1] && t[1] !== t[2] && t[2] <= t[0] + t[1] - 2) return t;
  }
}

/** A river between two parallel banks, with the similar right triangles used to measure it. */
function riverFigure(d: number, e: number, h: number, w: number): Figure {
  const A: XY = [0, w];
  const B: XY = [0, 0];
  const C: XY = [d, 0];
  const D: XY = [d, -h];
  const E: XY = [e, 0];
  const items: GeoItem[] = [
    { kind: 'region', points: [[-2, 0], [d + 2, 0], [d + 2, w], [-2, w]], fill: 'blue' },
    { kind: 'segment', from: [-2, w], to: [d + 2, w], width: 'thin', color: 'muted' },
    { kind: 'segment', from: [-2, 0], to: [d + 2, 0], width: 'thin', color: 'muted' },
    { kind: 'segment', from: 'A', to: 'D', color: 'orange', dashed: true },
    { kind: 'segment', from: 'A', to: 'B', color: 'highlight', width: 'thick' },
    { kind: 'segment', from: 'C', to: 'D', color: 'accent', width: 'normal' },
    { kind: 'angle', vertex: 'B', from: 'A', to: 'C', right: true },
    { kind: 'angle', vertex: 'C', from: 'B', to: 'D', right: true },
    { kind: 'point', at: 'A', labelDir: 'n' },
    { kind: 'point', at: 'B', labelDir: 'sw' },
    { kind: 'point', at: 'C', labelDir: 'n' },
    { kind: 'point', at: 'D', labelDir: 's' },
    { kind: 'point', at: 'E', labelDir: 'ne' },
    lab(mid(A, B), '?', 'w'),
    lab(mid(B, E), `${num(e)} m`, 's'),
    lab(mid(E, C), `${num(d - e)} m`, 's'),
    lab(mid(C, D), 'rúd', 'e'),
    lab([d * 0.75, w * 0.75], 'folyó', 'e'),
  ];
  return { type: 'geometry', points: { A, B, C, D, E }, items };
}

/** A right triangle with the altitude to the hypotenuse. */
function altitudeFigure(opts: {
  p: number;
  q: number;
  mLabel?: string;
  pLabel?: string;
  qLabel?: string;
  aLabel?: string;
  bLabel?: string;
  highlight?: 'm' | 'q' | 'b' | 'a';
}): Figure {
  const p = opts.p;
  const q = opts.q;
  const c = p + q;
  const h = Math.sqrt(p * q);
  const A: XY = [0, 0];
  const B: XY = [c, 0];
  const T: XY = [p, 0];
  const C: XY = [p, h];
  const items: GeoItem[] = [
    { kind: 'polygon', points: ['A', 'B', 'C'], fill: true },
    {
      kind: 'height',
      from: 'C',
      base: ['A', 'B'],
      label: opts.mLabel ?? 'm',
      footLabel: 'T',
      color: opts.highlight === 'm' ? 'highlight' : undefined,
    },
    { kind: 'angle', vertex: 'C', from: 'A', to: 'B', right: true },
    lab(mid(A, T), opts.pLabel ?? num(p), 's'),
    lab(mid(T, B), opts.qLabel ?? num(q), 's'),
    lab(mid(A, C), opts.bLabel ?? 'b', 'w'),
    lab(mid(B, C), opts.aLabel ?? 'a', 'e'),
  ];
  if (opts.highlight === 'q') items.push({ kind: 'segment', from: 'T', to: 'B', color: 'highlight', width: 'thick' });
  if (opts.highlight === 'b') items.push({ kind: 'segment', from: 'A', to: 'C', color: 'highlight', width: 'thick' });
  if (opts.highlight === 'a') items.push({ kind: 'segment', from: 'B', to: 'C', color: 'highlight', width: 'thick' });
  return { type: 'geometry', points: { A, B, C, T }, items };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

const CRITERIA = {
  sss: 'három oldal aránya',
  sas: 'két oldal és a közbezárt szög',
  aa: 'két szög',
  ssa: 'két oldal és a nagyobbikkal szemközti szög',
} as const;

type Criterion = keyof typeof CRITERIA;

/** Which similarity criterion can be applied to the given data? */
const criterionMc: GeneratorDef = {
  id: 'criterion-mc',
  title: 'Melyik hasonlósági feltétel teljesül?',
  levels: [1, 2],
  generate(rng, level): Question {
    const kinds: Criterion[] = level === 1 ? ['sss', 'sas', 'aa'] : ['sss', 'sas', 'aa', 'ssa'];
    const kind = rng.pick(kinds);
    const correct = CRITERIA[kind];
    const wrongs = (Object.keys(CRITERIA) as Criterion[]).filter((k) => k !== kind).map((k) => CRITERIA[k]);
    // level 1: the data stand in the same order and k is a whole number; level 2: the order is
    // mixed, k is a fraction, or the third angle has to be computed
    let prompt: string;
    let figure: Figure | undefined;
    const k = level === 1 ? rng.int(2, 3) : rng.pick([1.5, 2.5, 0.5]);
    if (kind === 'sss') {
      const base = randomSides(rng);
      const other = base.map((x) => x * k);
      const shown = level === 1 ? other : rng.shuffle(other);
      prompt = tex`Az egyik háromszög oldalai $${num(base[0])}$, $${num(base[1])}$ és $${num(base[2])}$ cm; a másiké $${num(shown[0])}$, $${num(shown[1])}$ és $${num(shown[2])}$ cm. Melyik feltételt lehet alkalmazni?`;
    } else if (kind === 'sas') {
      const [x, y] = randomSides(rng);
      const angle = rng.int(4, 14) * 10;
      const [x1, y1] = level === 1 ? [x * k, y * k] : [y * k, x * k];
      prompt = tex`Két oldal $${num(x)}$ és $${num(y)}$ cm, a bezárt szög $${num(angle)}°$; a másikban $${num(x1)}$ és $${num(y1)}$ cm, a bezárt szög $${num(angle)}°$. Melyik feltételt lehet alkalmazni?`;
    } else if (kind === 'aa') {
      const a = rng.int(3, 8) * 5;
      const b = rng.int(8, 20) * 5;
      const c = 180 - a - b;
      prompt =
        level === 1
          ? tex`Az egyik háromszögben két szög $${num(a)}°$ és $${num(b)}°$, a másikban $${num(b)}°$ és $${num(a)}°$. Melyik feltételt lehet alkalmazni?`
          : tex`Az egyik háromszögben két szög $${num(a)}°$ és $${num(b)}°$, a másikban $${num(b)}°$ és $${num(c)}°$. Melyik feltételt lehet alkalmazni?`;
    } else {
      const [x, y] = randomSides(rng);
      const angle = rng.int(5, 12) * 5;
      prompt = tex`A táblázatban a szög a nagyobbik oldallal szemközt van. Melyik feltételt lehet alkalmazni?`;
      figure = {
        type: 'table',
        header: ['', '1. háromszög', '2. háromszög'],
        rows: [
          ['oldalak (cm)', `${num(x)} és ${num(y)}`, `${num(x * k)} és ${num(y * k)}`],
          ['szög', `${num(angle)}°`, `${num(angle)}°`],
        ],
        rowHeaders: true,
      };
    }
    return {
      prompt,
      figure,
      answer: textChoice(correct, wrongs),
      hint: 'Nézd meg, mi van megadva: három oldal, két oldal és egy szög, vagy két szög?',
      solution: [
        `A megadott adatok: ${kind === 'sss' ? 'három oldalpár' : kind === 'sas' ? 'két oldalpár és a közbezárt szög' : kind === 'aa' ? 'két-két szög' : 'két oldalpár és a nagyobbikkal szemközti szög'}.`,
        `Az adatok alapján a hasonlóság feltétele: **${correct}**.`,
      ],
    };
  },
};

/** Heights from shadows, with Thales' pyramid story. */
const shadowHeight: GeneratorDef = {
  id: 'shadow-height',
  title: 'Magasság árnyékból',
  levels: [2, 3],
  generate(rng, level): Question {
    // level 2: a stick and a pyramid; level 3: a person and a building, one more step
    const [h1, s1, s2, h2] = level === 2 ? shadowData(rng, [0.8, 2], [30, 150]) : shadowData(rng, [1.5, 1.9], [12, 40]);
    if (level === 2) {
      return {
        prompt: tex`${capArticle(h1)} $${num(h1)}$ m magas bot árnyéka $${num(s1)}$ m. Ugyanekkor a piramis árnyéka $${num(s2)}$ m. Milyen magas a piramis?`,
        figure: shadowFigure(h1, s1, h2, s2),
        answer: { type: 'number', value: h2, unit: 'm' },
        inputLabel: '$h =$',
        hint: 'A nap sugarai párhuzamosak, ezért a magasság és az árnyék aránya ugyanaz.',
        solution: [
          tex`A bot: $${num(h1)}$ m magas, $${num(s1)}$ m az árnyéka.`,
          tex`A piramis: $x$ m magas, $${num(s2)}$ m az árnyéka.`,
          tex`$${num(h1)} : ${num(s1)} = x : ${num(s2)}$, ezért $x = ${num(h1)} \cdot ${num(s2)} : ${num(s1)} = ${num(h2)}$.`,
          ...(Number.isInteger(h2 / h1)
            ? [tex`A piramis magassága a bot magasságának $${num(h2 / h1)}$-${suffix(h2 / h1, 'szorosa', 'szerese', 'szöröse')}.`]
            : []),
          tex`A piramis **${num(h2)} m** magas.`,
        ],
      };
    }
    const diff = clean(h2 - h1);
    return {
      prompt: tex`${capArticle(h1)} $${num(h1)}$ m magas ember árnyéka $${num(s1)}$ m. Ugyanekkor egy épület árnyéka $${num(s2)}$ m. Hány méterrel magasabb az épület az embernél?`,
      figure: shadowFigure(h1, s1, h2, s2),
      answer: { type: 'number', value: diff, unit: 'm' },
      inputLabel: '$h - h_1 =$',
      hint: 'Előbb számold ki az épület magasságát, aztán vond ki belőle az ember magasságát!',
      solution: [
        tex`Az épület magassága: $x = ${num(h1)} \cdot ${num(s2)} : ${num(s1)} = ${num(h2)}$ m.`,
        tex`A különbség: $${num(h2)} - ${num(h1)} = ${num(diff)}$ m.`,
        tex`Az épület **${num(diff)} m-rel** magasabb.`,
      ],
    };
  },
};

/** The width of a river from two similar right triangles. */
const riverWidth: GeneratorDef = {
  id: 'river-width',
  title: 'A folyó szélessége',
  levels: [3],
  generate(rng): Question {
    // BE = m · EC, so the river is m times as wide as the pole is long
    const ec = rng.int(3, 12);
    const m = rng.pick([1.5, 2, 2.5, 3, 4]);
    const e = clean(ec * m);
    const d = e + ec;
    const h = rng.int(2, 10) / 2;
    const w = clean((h * e) / (d - e));
    return {
      prompt: tex`A folyó szélességét hasonló háromszögekkel mérik. Az ábrán $BE = ${num(e)}$ m, $EC = ${num(d - e)}$ m, $CD = ${num(h)}$ m. Milyen széles a folyó?`,
      figure: riverFigure(d, e, h, w),
      answer: { type: 'number', value: w, unit: 'm' },
      inputLabel: '$AB =$',
      hint: 'Az $ABE$ és $DCE$ derékszögű háromszögek hasonlók: az $E$-nél csúcsszögek vannak.',
      solution: [
        'Az $ABE$ és $DCE$ háromszögek derékszögűek, és az $E$-nél csúcsszög van, ezért hasonlók.',
        tex`A megfelelő oldalak aránya: $AB : CD = BE : EC$.`,
        tex`$AB : ${num(h)} = ${num(e)} : ${num(d - e)}$`,
        tex`$AB = ${num(h)} \cdot ${num(e)} : ${num(d - e)} = ${num(w)}$`,
        tex`A folyó **${num(w)} m** széles.`,
      ],
    };
  },
};

/** The altitude to the hypotenuse and the hypotenuse segments. */
const altitude: GeneratorDef = {
  id: 'altitude',
  title: 'Magasság az átfogón',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: [number, number, number][] = [
      [4, 9, 6],
      [9, 4, 6],
      [2, 8, 4],
      [8, 2, 4],
      [1, 9, 3],
      [9, 1, 3],
      [9, 16, 12],
      [16, 9, 12],
      [4, 16, 8],
      [16, 4, 8],
      [5, 20, 10],
      [20, 5, 10],
      [8, 18, 12],
      [18, 8, 12],
    ];
    const [p, q, h] = rng.pick(pool);
    if (level === 1) {
      return {
        prompt: tex`A derékszögű háromszög átfogóját a magasság $${num(p)}$ cm és $${num(q)}$ cm-es részekre osztja. Milyen hosszú a magasság?`,
        figure: altitudeFigure({ p, q, mLabel: '?', highlight: 'm' }),
        answer: { type: 'number', value: h, unit: 'cm' },
        inputLabel: '$m =$',
        hint: 'A magasság négyzete a két átfogó rész szorzata: $m^2 = p \\cdot q$.',
        solution: [
          tex`$m^2 = p \cdot q = ${num(p)} \cdot ${num(q)} = ${num(p * q)}$`,
          tex`$m = \sqrt{${num(p * q)}} = ${num(h)}$`,
          tex`A magasság **${num(h)} cm**.`,
        ],
      };
    }
    if (level === 2) {
      if (rng.chance(0.5)) {
        return {
          prompt: tex`A derékszögű háromszög magassága $${num(h)}$ cm, az átfogó egyik része $${num(p)}$ cm. Milyen hosszú a másik rész?`,
          figure: altitudeFigure({ p, q, mLabel: `${num(h)} cm`, qLabel: '?', highlight: 'q' }),
          answer: { type: 'number', value: q, unit: 'cm' },
          inputLabel: '$q =$',
          hint: 'Ugyanaz az összefüggés: $m^2 = p \\cdot q$. Most $q$ hiányzik.',
          solution: [
            tex`$m^2 = p \cdot q$, ezért $q = m^2 : p$.`,
            tex`$q = ${num(h)}^2 : ${num(p)} = ${num(h * h)} : ${num(p)} = ${num(q)}$.`,
            tex`A másik rész **${num(q)} cm**.`,
          ],
        };
      }
      // Only the (9, 16) family gives whole-number legs here.
      const pair: [number, number] = rng.pick([[9, 16], [16, 9]] as [number, number][]);
      const p2 = pair[0];
      const q2 = pair[1];
      const c = p2 + q2;
      const legA = Math.sqrt(c * q2);
      const legB = Math.sqrt(c * p2);
      const askLong = rng.chance(0.5);
      const useA = askLong ? q2 > p2 : q2 < p2;
      const leg = useA ? legA : legB;
      const legLetter = useA ? 'a' : 'b';
      const which = askLong ? 'hosszabbik' : 'rövidebbik';
      return {
        prompt: tex`A derékszögű háromszög átfogóját a magasság $${num(p2)}$ cm és $${num(q2)}$ cm-es részekre osztja. Milyen hosszú a ${which} befogó?`,
        figure: altitudeFigure({
          p: p2,
          q: q2,
          aLabel: useA ? '?' : 'a',
          bLabel: useA ? 'b' : '?',
          highlight: useA ? 'a' : 'b',
        }),
        answer: { type: 'number', value: leg, unit: 'cm' },
        inputLabel: `$${legLetter} =$`,
        hint: 'A befogó négyzete az egész átfogó és a hozzá tartozó rész szorzata: $a^2 = c \\cdot q$.',
        solution: [
          tex`Az átfogó: $c = ${num(p2)} + ${num(q2)} = ${num(c)}$ cm.`,
          tex`A ${which} befogóra $${legLetter}^2 = c \cdot ${num(useA ? q2 : p2)} = ${num(c)} \cdot ${num(useA ? q2 : p2)} = ${num(leg * leg)}$.`,
          tex`$${legLetter} = \sqrt{${num(leg * leg)}} = ${num(leg)}$`,
          tex`A ${which} befogó **${num(leg)} cm**.`,
        ],
      };
    }
    // L3: a leg in root form
    let p3: number;
    let q3: number;
    do {
      p3 = rng.int(2, 8);
      q3 = rng.intExcept(2, 10, [p3]);
    } while (Number.isInteger(Math.sqrt((p3 + q3) * p3)));
    const c = p3 + q3;
    const root = simplifyRoot(c * p3);
    const leg = Math.sqrt(c * p3);
    return {
      prompt: tex`A magasság az átfogót $${num(p3)}$ cm és $${num(q3)}$ cm-es részekre osztja. Milyen hosszú a $b$ befogó? (Gyökös alakban add meg!)`,
      figure: altitudeFigure({ p: p3, q: q3, bLabel: 'b = ?', highlight: 'b' }),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: true, acceptDecimal: 2, unit: 'cm' },
      inputLabel: '$b =$',
      hint: 'A $b$ befogó a $p$ részből számolható: $b^2 = c \\cdot p$.',
      solution: [
        tex`Az átfogó: $c = ${num(p3)} + ${num(q3)} = ${num(c)}$ cm.`,
        tex`$b^2 = c \cdot p = ${num(c)} \cdot ${num(p3)} = ${num(c * p3)}$`,
        tex`$b = \sqrt{${num(c * p3)}}${root.coef === 1 ? '' : ` = ${texRoot(root.coef, root.radicand)}`} \approx ${num(leg, 2)}$`,
        tex`A $b$ befogó **$${texRoot(root.coef, root.radicand)}$ cm**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-hasonlosag-04',
  goals: [
    'kiválasztani a megfelelő hasonlósági feltételt,',
    'kiszámítani magasságokat árnyékból,',
    'meghatározni egy folyó szélességét hasonló háromszögekkel,',
    'alkalmazni a hasonlóságot a derékszögű háromszögben.',
  ],
  parts: [
    {
      title: 'Három oldal, két oldal és a szög',
      steps: [
        {
          type: 'theory',
          title: 'Három arányos oldal',
          body: 'Ha két háromszög három oldala páronként ugyanabban az arányban áll, a háromszögek hasonlók. Ez a három oldal feltétele.',
          remember: 'Mindhárom oldalpár aránya ugyanaz.',
        },
        {
          type: 'theory',
          title: 'Két oldal és a közbezárt szög',
          body: 'Ha két-két oldal aránya egyenlő, és az általuk bezárt szög is egyenlő, akkor a háromszögek hasonlók.',
          remember: 'Két oldal + a közbezárt szög.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Két háromszög oldalai $3$, $4$, $5$ cm és $6$, $8$, $10$ cm. Melyik feltételt lehet alkalmazni a megadott adatokkal?',
            answer: textChoice('három oldal aránya', ['két oldal és a közbezárt szög', 'két szög', 'két oldal és a nagyobbikkal szemközti szög']),
            hint: 'Csak oldalak vannak megadva. Melyik feltételhez kell szög is?',
            solution: [
              'A megadott oldalak aránya: $6 : 3 = 8 : 4 = 10 : 5 = 2$.',
              'Csak oldalak szerepelnek, ezért a hasonlóság feltétele a **három oldal aránya**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Két oldal és a bezárt szög',
          problem: 'Két oldal $4$ és $6$ cm, a bezárt szög $50°$; a másikban $6$ és $9$ cm, a bezárt szög $50°$. Hasonlók-e?',
          steps: [
            { text: '$4 : 6 = 2 : 3$' },
            { text: '$6 : 9 = 2 : 3$' },
            { text: 'A két arány egyenlő, és a bezárt szög is $50°$.' },
          ],
          answer: 'Igen, mert két oldal aránya és a közbezárt szög egyenlő.',
        },
        { type: 'practice', generator: 'criterion-mc', level: 1, count: 2 },
      ],
    },
    {
      title: 'Két szög és a nagyobb oldal',
      steps: [
        {
          type: 'theory',
          title: 'Két egyenlő szög',
          body: 'Ha két-két szög egyenlő, a harmadik szög is egyenlő, tehát a háromszögek hasonlók.',
          remember: 'Két szög már elég a hasonlósághoz.',
        },
        {
          type: 'theory',
          title: 'A nagyobbikkal szemközti szög',
          body: 'Ha két oldal aránya egyenlő, és a nagyobbikkal szemközti szög is egyenlő, akkor a háromszögek hasonlók.',
          remember: 'Két oldal + a nagyobbikkal szemközti szög.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Ha két háromszögnek két-két szöge egyenlő, akkor a háromszögek hasonlók.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Mennyi a háromszög szögeinek összege?',
            solution: [
              'A harmadik szög $180°$ mínusz a két ismert szög, ezért az is egyenlő a másik háromszög megfelelő szögével.',
              'Így mindhárom szög páronként egyenlő, tehát az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Hiányzó oldal két szögből',
          problem: 'Az $ABC$ és $A_1B_1C_1$ háromszögekben $\\alpha = \\alpha_1$ és $\\beta = \\beta_1$. $AB = 6$ cm, $BC = 9$ cm, $A_1B_1 = 8$ cm. Mennyi $B_1C_1$?',
          steps: [
            { text: 'Két szög egyenlő, ezért a háromszögek hasonlók.' },
            { text: '$k = A_1B_1 : AB = 8 : 6 = \\frac{4}{3}$' },
            { text: '$B_1C_1 = k \\cdot BC = \\frac{4}{3} \\cdot 9 = 12$' },
          ],
          answer: '$B_1C_1 = 12$ cm.',
        },
        { type: 'practice', generator: 'criterion-mc', level: 2, count: 2 },
        { type: 'practice', generator: 'shadow-height', level: 2 },
      ],
    },
    {
      title: 'Thalész és az árnyék',
      steps: [
        {
          type: 'theory',
          title: 'A piramis árnyéka',
          body: 'Thalész a piramis magasságát a bot árnyékával mérte meg. A nap sugarai párhuzamosak, ezért a bot és a piramis derékszögű háromszöge hasonló.',
          figure: shadowFigure(1.5, 2, 90, 120),
          remember: 'magasság : árnyék = magasság : árnyék',
        },
        {
          type: 'example',
          title: 'A piramis magassága',
          problem: 'Egy $1,5$ m magas bot árnyéka $2$ m. Ugyanekkor a piramis árnyéka $120$ m. Milyen magas a piramis?',
          figure: shadowFigure(1.5, 2, 90, 120),
          steps: [
            { text: '$1,5 : 2 = x : 120$' },
            { text: '$2x = 1,5 \\cdot 120 = 180$' },
            { text: '$x = 180 : 2 = 90$' },
          ],
          answer: 'A piramis **90 m** magas.',
        },
        { type: 'practice', generator: 'shadow-height', level: 2, count: 2 },
        { type: 'practice', generator: 'shadow-height', level: 3 },
      ],
    },
    {
      title: 'A folyó szélessége',
      steps: [
        {
          type: 'theory',
          title: 'Mérés a partról',
          body: 'A folyó szélességét a parton felvett hasonló derékszögű háromszögekkel mérjük meg, anélkül, hogy átkelnénk.',
          figure: riverFigure(20, 15, 3, 9),
          remember: 'Két derékszög és egy csúcsszög: a háromszögek hasonlók.',
        },
        {
          type: 'example',
          title: 'A folyó szélessége',
          problem: 'A parton $BE = 15$ m, $EC = 5$ m, a $C$ pontnál álló rúd $3$ m. Milyen széles a folyó?',
          figure: riverFigure(20, 15, 3, 9),
          steps: [
            { text: 'Az $ABE$ és $DCE$ derékszögű háromszögek hasonlók (csúcsszög az $E$-nél).' },
            { text: '$AB : CD = BE : EC$, azaz $AB : 3 = 15 : 5$.' },
            { text: '$AB = 3 \\cdot 15 : 5 = 9$' },
          ],
          answer: 'A folyó **9 m** széles.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A folyó szélességénél a két derékszögű háromszög hasonló, mert két szögük egyenlő.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Az egyik szög derékszög, a másik az $E$-nél lévő csúcsszög.',
            solution: [
              'Mindkét háromszögben van egy derékszög.',
              'Az $E$ csúcsnál csúcsszögek vannak, tehát két szög egyenlő.',
              'Ezért a háromszögek hasonlók — az állítás **igaz**.',
            ],
          },
        },
        { type: 'practice', generator: 'river-width', level: 3, count: 2 },
      ],
    },
    {
      title: 'Hasonlóság a derékszögű háromszögben',
      steps: [
        {
          type: 'theory',
          title: 'A magasság és az átfogó részei',
          body: 'Az átfogóhoz tartozó magasság két, egymáshoz is hasonló derékszögű háromszögre bontja a nagy háromszöget. Ebből $m^2 = p \\cdot q$.',
          figure: altitudeFigure({ p: 4, q: 9, mLabel: 'm', pLabel: 'p', qLabel: 'q' }),
          remember: '$m^2 = p \\cdot q$',
        },
        {
          type: 'example',
          title: 'A magasság kiszámítása',
          problem: 'A derékszögű háromszög magassága az átfogót $4$ és $9$ cm-es részekre osztja. Milyen hosszú a magasság?',
          figure: altitudeFigure({ p: 4, q: 9, mLabel: '?', pLabel: '4 cm', qLabel: '9 cm', highlight: 'm' }),
          steps: [
            { text: '$m^2 = p \\cdot q$' },
            { text: '$m^2 = 4 \\cdot 9 = 36$' },
            { text: '$m = 6$' },
          ],
          answer: 'A magasság **6 cm**.',
        },
        { type: 'practice', generator: 'altitude', level: 1, count: 2 },
        { type: 'practice', generator: 'altitude', level: 2 },
        {
          type: 'theory',
          title: 'Pitagorasz tétele hasonlósággal',
          body: 'A befogó a saját vetületének és az egész átfogónak a mértani közepe: $a^2 = c \\cdot q$, $b^2 = c \\cdot p$. Összeadva $a^2 + b^2 = c^2$.',
          figure: altitudeFigure({ p: 4, q: 9, mLabel: 'm', pLabel: 'p', qLabel: 'q', aLabel: 'a', bLabel: 'b' }),
          remember: '$a^2 = c \\cdot q$, $b^2 = c \\cdot p$',
        },
        { type: 'practice', generator: 'altitude', level: 3, count: 2 },
      ],
    },
  ],
  generators: [criterionMc, shadowHeight, riverWidth, altitude],
  miniTest: {
    items: [
      { generator: 'criterion-mc', level: 1 },
      { generator: 'criterion-mc', level: 2 },
      { generator: 'shadow-height', level: 2 },
      { generator: 'altitude', level: 1 },
      { generator: 'altitude', level: 2 },
      { generator: 'river-width', level: 3 },
      { generator: 'altitude', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'criterion-mc', level: 1 },
    { generator: 'shadow-height', level: 2 },
    { generator: 'altitude', level: 1 },
    { generator: 'altitude', level: 2 },
    { generator: 'river-width', level: 3 },
    { generator: 'altitude', level: 3 },
  ],
});
