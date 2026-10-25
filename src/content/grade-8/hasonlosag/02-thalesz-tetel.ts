/**
 * 8. osztály › Háromszögek hasonlósága › 2. Thalész párhuzamos szelők tétele
 *
 * This is the INTERCEPT theorem (Serbian Talesova teorema), not the Hungarian semicircle
 * "Thalész-tétel". Parallels cutting the arms of an angle cut proportional segments; the
 * converse decides parallelism; construction of equal parts and of the fourth proportional.
 */
import {
  article,
  clean,
  gcd,
  type Rng,
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Dir,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

const DEG = Math.PI / 180;

const capArticle = (n: number) => {
  const a = article(n);
  return a[0].toUpperCase() + a.slice(1);
};

const mid = (a: XY, b: XY): XY => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const lab = (at: XY, text: string, dir: Dir): GeoItem => ({ kind: 'label', at, text, dir });

const onRay = (r: number, deg: number): XY => [r * Math.cos(deg * DEG), r * Math.sin(deg * DEG)];

/** Triangle with sides a = BC, b = CA, c = AB, base AB horizontal. */
function triangleCoords(a: number, b: number, c: number): { A: XY; B: XY; C: XY } {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return { A: [0, 0], B: [c, 0], C: [x, y] };
}

/**
 * An angle at O with two parallel lines A1B1 and A2B2 cutting its arms.
 * OA1 = p, A1A2 = q, OB1 = r, B1B2 = x; the lines are parallel exactly when x = r·q/p.
 * `right` draws the angle as 90° (used for the ratio-of-parallels task, where a Pythagorean
 * triple keeps the parallel segments whole numbers).
 */
function angleParallel(opts: {
  p: number;
  q: number;
  r: number;
  x: number;
  deg?: number;
  labels?: { oa1?: string; a1a2?: string; ob1?: string; b1b2?: string; a1b1?: string; a2b2?: string };
  highlight?: 'b1b2' | 'a2b2';
  right?: boolean;
  noMarks?: boolean;
}): Figure {
  const deg = opts.right ? 90 : (opts.deg ?? 55);
  const O: XY = [0, 0];
  const A1: XY = [opts.p, 0];
  const A2: XY = [opts.p + opts.q, 0];
  const B1 = onRay(opts.r, deg);
  const B2 = onRay(opts.r + opts.x, deg);
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  const armDir: Dir = opts.right ? 'w' : c > 0 && s > 0 ? 'nw' : 'sw';
  const items: GeoItem[] = [
    { kind: 'ray', from: 'O', through: 'A2' },
    { kind: 'ray', from: 'O', through: 'B2' },
    { kind: 'segment', from: 'A1', to: 'B1' },
    { kind: 'segment', from: 'A2', to: 'B2', color: opts.highlight === 'a2b2' ? 'highlight' : undefined },
    { kind: 'point', at: 'O', labelDir: 'sw' },
    { kind: 'point', at: 'A1', labelDir: 's' },
    { kind: 'point', at: 'A2', labelDir: 'se' },
    { kind: 'point', at: 'B1', labelDir: armDir },
    { kind: 'point', at: 'B2', labelDir: 'n' },
  ];
  if (!opts.noMarks) {
    items.push({ kind: 'parallel', from: 'A1', to: 'B1', count: 1 });
    items.push({ kind: 'parallel', from: 'A2', to: 'B2', count: 1 });
  }
  if (opts.right) items.push({ kind: 'angle', vertex: 'O', from: 'A1', to: 'B1', right: true });
  const L = opts.labels ?? {};
  if (L.oa1) items.push(lab(mid(O, A1), L.oa1, 's'));
  if (L.a1a2) items.push(lab(mid(A1, A2), L.a1a2, 's'));
  if (L.ob1) items.push(lab(mid(O, B1), L.ob1, armDir));
  if (L.b1b2) items.push(lab(mid(B1, B2), L.b1b2, armDir));
  if (L.a1b1) items.push(lab(mid(A1, B1), L.a1b1, opts.right ? 'ne' : 'se'));
  if (L.a2b2) items.push(lab(mid(A2, B2), L.a2b2, opts.right ? 'ne' : 'se'));
  if (opts.highlight === 'b1b2') items.push({ kind: 'segment', from: 'B1', to: 'B2', color: 'highlight', width: 'thick' });
  return { type: 'geometry', points: { O, A1, A2, B1, B2 }, items };
}

/** A triangle ABC with DE ∥ AB, D on CA and E on CB. */
function triangleParallel(opts: {
  cd: number;
  da: number;
  ce: number;
  eb: number;
  ab?: number;
  labels?: { cd?: string; da?: string; ce?: string; eb?: string; de?: string; ab?: string };
  highlight?: 'eb' | 'de';
}): Figure {
  const ca = opts.cd + opts.da;
  const cb = opts.ce + opts.eb;
  const ab = opts.ab ?? 0.9 * cb;
  const { A, B, C } = triangleCoords(cb, ca, ab);
  const D: XY = [C[0] + (A[0] - C[0]) * (opts.cd / ca), C[1] + (A[1] - C[1]) * (opts.cd / ca)];
  const E: XY = [C[0] + (B[0] - C[0]) * (opts.ce / cb), C[1] + (B[1] - C[1]) * (opts.ce / cb)];
  const L = opts.labels ?? {};
  const items: GeoItem[] = [
    { kind: 'polygon', points: ['A', 'B', 'C'], fill: true, vertexLabels: false },
    { kind: 'segment', from: 'D', to: 'E', color: opts.highlight === 'de' ? 'highlight' : 'accent' },
    { kind: 'parallel', from: 'D', to: 'E', count: 1 },
    { kind: 'parallel', from: 'A', to: 'B', count: 1 },
    { kind: 'point', at: 'A', labelDir: 'sw' },
    { kind: 'point', at: 'B', labelDir: 'se' },
    { kind: 'point', at: 'C', labelDir: 'n' },
    { kind: 'point', at: 'D', labelDir: 'w' },
    { kind: 'point', at: 'E', labelDir: 'e' },
  ];
  if (opts.highlight === 'eb') items.push({ kind: 'segment', from: 'E', to: 'B', color: 'highlight', width: 'thick' });
  if (L.cd) items.push(lab(mid(C, D), L.cd, 'w'));
  if (L.da) items.push(lab(mid(D, A), L.da, 'sw'));
  if (L.ce) items.push(lab(mid(C, E), L.ce, 'e'));
  if (L.eb) items.push(lab(mid(E, B), L.eb, 'se'));
  if (L.de) items.push(lab(mid(D, E), L.de, 'n'));
  if (L.ab) items.push(lab(mid(A, B), L.ab, 's'));
  return { type: 'geometry', points: { A, B, C, D, E }, items };
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
    const v = rng.int(1, 10) * rng.pick([0.5, 1]);
    const [h1, s1, h2, s2] = [p * u, q * u, p * v, q * v].map((x) => clean(x));
    if (h1 >= small[0] && h1 <= small[1] && h2 >= big[0] && h2 <= big[1] && Number.isInteger(h2 * 10)) return [h1, s1, s2, h2];
  }
}

/** Two poles with their shadows; `unknown` marks the height that is asked for. */
function shadowFigure(h1: number, s1: number, h2: number, s2: number, unknown: 'h2'): Figure {
  // Draw the small pole larger (and its shadow by the same factor, so the rays stay parallel);
  // the figure is marked "not to scale".
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
    lab([x2, h2 / 2], unknown === 'h2' ? '?' : `${num(h2)} m`, 'w'),
    lab([x2 + s2 / 2, 0], `${num(s2)} m`, 's'),
  ];
  return { type: 'geometry', points: {}, items, notToScale: f !== 1 };
}

// ---------------------------------------------------------------------------------------------
// 2. Construction figures
// ---------------------------------------------------------------------------------------------

/** Dividing AB into five equal parts with parallel lines. */
function equalPartsFigure(): Figure {
  const A: XY = [0, 0];
  const B: XY = [10.5, 0];
  const deg = 32;
  const step = 2.15;
  const P: XY[] = [1, 2, 3, 4, 5].map((k) => onRay(step * k, deg));
  const d: XY = [B[0] - P[4][0], B[1] - P[4][1]];
  const points: Record<string, XY> = { A, B };
  P.forEach((p, i) => (points[`P${i + 1}`] = p));
  const intersections: Record<string, { lines: [[string, XY], [string, string]] }> = {};
  P.slice(0, 4).forEach((p, i) => {
    intersections[`Q${i + 1}`] = { lines: [[`P${i + 1}`, [p[0] + d[0], p[1] + d[1]]], ['A', 'B']] };
  });
  const items1: GeoItem[] = [{ kind: 'ray', from: 'A', through: 'P5', label: 'f' }];
  const items2: GeoItem[] = [];
  P.forEach((_, i) => {
    items2.push({ kind: 'point', at: `P${i + 1}`, label: `P${'₁₂₃₄₅'[i]}` });
    if (i === 0) items2.push({ kind: 'segment', from: 'A', to: 'P1', ticks: 1 });
    else items2.push({ kind: 'segment', from: `P${i}`, to: `P${i + 1}`, ticks: 1 });
  });
  const items3: GeoItem[] = [
    { kind: 'segment', from: 'P5', to: 'B', ticks: 2 },
    { kind: 'parallel', from: 'P5', to: 'B', count: 1 },
  ];
  const items4: GeoItem[] = [];
  for (let i = 1; i <= 4; i++) {
    items4.push({ kind: 'segment', from: `P${i}`, to: `Q${i}`, color: 'accent' });
    items4.push({ kind: 'parallel', from: `P${i}`, to: `Q${i}`, count: 1 });
    items4.push({ kind: 'point', at: `Q${i}`, label: `Q${'₁₂₃₄'[i - 1]}`, labelDir: 's' });
  }
  items4.push({ kind: 'segment', from: 'A', to: 'Q1', ticks: 3 });
  items4.push({ kind: 'segment', from: 'Q1', to: 'Q2', ticks: 3 });
  items4.push({ kind: 'segment', from: 'Q2', to: 'Q3', ticks: 3 });
  items4.push({ kind: 'segment', from: 'Q3', to: 'Q4', ticks: 3 });
  items4.push({ kind: 'segment', from: 'Q4', to: 'B', ticks: 3 });
  return {
    type: 'construction',
    size: 'small',
    points,
    intersections,
    given: [
      { kind: 'segment', from: 'A', to: 'B' },
      { kind: 'point', at: 'A' },
      { kind: 'point', at: 'B' },
    ],
    steps: [
      { caption: 'Felveszünk egy félegyenest $A$-ból.', items: items1 },
      { caption: 'Öt egyenlő szakaszt mérünk fel.', items: items2 },
      { caption: '$P_5$-öt összekötjük $B$-vel.', items: items3 },
      { caption: 'Párhuzamosokat húzunk a többi ponton át.', items: items4 },
    ],
  };
}

/** Constructing the fourth proportional x of a : b = c : x. */
function fourthProportionalFigure(): Figure {
  const O: XY = [0, 0];
  const a = 2;
  const b = 5;
  const c = 3;
  const deg = 55;
  const A: XY = [a, 0];
  const B: XY = [b, 0];
  const C = onRay(c, deg);
  const B2: XY = [B[0] + C[0] - A[0], B[1] + C[1] - A[1]];
  return {
    type: 'construction',
    size: 'small',
    points: { O, A, B, C },
    intersections: { D: { lines: [['B', B2], ['O', 'C']] } },
    given: [],
    steps: [
      {
        caption: 'Két félegyenest húzunk $O$-ból.',
        items: [
          { kind: 'ray', from: 'O', through: 'B' },
          { kind: 'ray', from: 'O', through: 'C' },
          { kind: 'point', at: 'O', labelDir: 'sw' },
        ],
      },
      {
        caption: 'Felmérjük $a$-t, $b$-t és $c$-t.',
        items: [
          { kind: 'point', at: 'A', labelDir: 's' },
          { kind: 'point', at: 'B', labelDir: 's' },
          { kind: 'point', at: 'C', labelDir: 'e' },
          { kind: 'segment', from: 'O', to: 'A', color: 'blue' },
          { kind: 'segment', from: 'O', to: 'B', color: 'blue' },
          { kind: 'segment', from: 'O', to: 'C', color: 'orange' },
          lab(mid(O, A), 'a', 's'),
          lab([b * 0.9, 0], 'b', 'n'),
          lab(mid(O, C), 'c', 'e'),
        ],
      },
      {
        caption: 'Összekötjük $A$-t és $C$-t.',
        items: [{ kind: 'segment', from: 'A', to: 'C', color: 'accent' }],
      },
      {
        caption: 'A $B$-n át húzott párhuzamos $D$-ben metszi a szárat.',
        items: [
          { kind: 'segment', from: 'B', to: 'D', color: 'highlight' },
          { kind: 'parallel', from: 'A', to: 'C', count: 1 },
          { kind: 'parallel', from: 'B', to: 'D', count: 1 },
          { kind: 'point', at: 'D', labelDir: 'e' },
          lab(onRay(0.7 * ((b * c) / a), deg), 'x = ?', 'w'),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// 3. Generators
// ---------------------------------------------------------------------------------------------

/** Missing segment on the arms of an angle. L1 adjacent parts, L2 whole arm. */
const interceptMissing: GeneratorDef = {
  id: 'intercept-missing',
  title: 'Hiányzó szakasz a szög szárain',
  levels: [1, 2],
  generate(rng, level): Question {
    const p = rng.pick([3, 4, 5, 6, 8]);
    let q = rng.pick([2, 3, 4, 5, 6, 7]);
    if (q === p) q += 1;
    const k = 1 + Math.ceil(q / p);
    const r = p * k;
    const x = q * k;
    const deg = rng.pick([45, 55, 65]);
    if (level === 1) {
      return {
        prompt: tex`Az ábrán $OA_1 = ${num(p)}$ cm, $A_1A_2 = ${num(q)}$ cm, $OB_1 = ${num(r)}$ cm. Milyen hosszú a $B_1B_2$?`,
        figure: angleParallel({ p, q, r, x, deg, highlight: 'b1b2' }),
        answer: { type: 'number', value: x, unit: 'cm' },
        inputLabel: '$B_1B_2 =$',
        hint: 'A párhuzamosok arányosan vágják a szárakat: $OA_1 : A_1A_2 = OB_1 : B_1B_2$.',
        solution: [
          tex`A párhuzamos szelők tétele miatt $${num(p)} : ${num(q)} = ${num(r)} : x$.`,
          tex`$${num(p)} \cdot x = ${num(q)} \cdot ${num(r)} = ${num(q * r)}$`,
          tex`$x = ${num(q * r)} : ${num(p)} = ${num(x)}$`,
          tex`A $B_1B_2$ szakasz **${num(x)} cm** hosszú.`,
        ],
      };
    }
    const whole = p + q;
    const ob2 = r + x;
    return {
      prompt: tex`Az ábrán $OA_1 = ${num(p)}$ cm, $OA_2 = ${num(whole)}$ cm, $OB_1 = ${num(r)}$ cm. Milyen hosszú az $OB_2$?`,
      figure: angleParallel({ p, q, r, x, deg }),
      answer: { type: 'number', value: ob2, unit: 'cm' },
      inputLabel: '$OB_2 =$',
      hint: 'Most az egész szár a másik oldalon hiányzik: $OA_1 : OA_2 = OB_1 : OB_2$.',
      solution: [
        tex`A párhuzamos szelők tétele miatt $${num(p)} : ${num(whole)} = ${num(r)} : x$.`,
        tex`$${num(p)} \cdot x = ${num(whole)} \cdot ${num(r)} = ${num(whole * r)}$`,
        tex`$x = ${num(whole * r)} : ${num(p)} = ${num(ob2)}$`,
        tex`Az $OB_2$ szakasz **${num(ob2)} cm** hosszú.`,
      ],
    };
  },
};

/** The same theorem inside a triangle. L2 a side part, L3 the parallel segment. */
const triangleParallelGen: GeneratorDef = {
  id: 'triangle-parallel',
  title: 'Párhuzamos a háromszögben',
  levels: [2, 3],
  generate(rng, level): Question {
    const p = rng.pick([4, 6, 8, 9]);
    let q = rng.pick([2, 3, 4, 5, 6]);
    if (q === p) q += 1;
    if (level === 2) {
      const k = rng.pick([2, 3]);
      const r = p * k;
      const eb = q * k;
      return {
        prompt: tex`Az $ABC$ háromszögben $DE \parallel AB$. $CD = ${num(p)}$ cm, $DA = ${num(q)}$ cm, $CE = ${num(r)}$ cm. Milyen hosszú az $EB$?`,
        figure: triangleParallel({ cd: p, da: q, ce: r, eb, highlight: 'eb' }),
        answer: { type: 'number', value: eb, unit: 'cm' },
        inputLabel: '$EB =$',
        hint: 'A párhuzamos a háromszög két oldalát arányosan osztja: $CD : DA = CE : EB$.',
        solution: [
          tex`A párhuzamos szelők tétele miatt $${num(p)} : ${num(q)} = ${num(r)} : x$.`,
          tex`$${num(p)} \cdot x = ${num(q)} \cdot ${num(r)} = ${num(q * r)}$`,
          tex`$x = ${num(q * r)} : ${num(p)} = ${num(eb)}$`,
          tex`Az $EB$ szakasz **${num(eb)} cm** hosszú.`,
        ],
      };
    }
    // L3: the length of DE from the whole side AB
    if (q % 2 !== 0) q += 1;
    const ca = p + q;
    const cb = 1.5 * ca;
    const eb = cb - (p * cb) / ca;
    const ab = 2 * ca;
    const de = (ab * p) / ca;
    return {
      prompt: tex`Az $ABC$ háromszögben $DE \parallel AB$. $CD = ${num(p)}$ cm, $DA = ${num(q)}$ cm, $AB = ${num(ab)}$ cm. Milyen hosszú a $DE$?`,
      figure: triangleParallel({
        cd: p,
        da: q,
        ce: p * 1.5,
        eb,
        ab,
        highlight: 'de',
        labels: { cd: `${num(p)} cm`, da: `${num(q)} cm`, ab: `${num(ab)} cm`, de: '?' },
      }),
      answer: { type: 'number', value: de, unit: 'cm' },
      inputLabel: '$DE =$',
      hint: 'Az egész oldalhoz hasonlítsd: $CD : CA = DE : AB$.',
      solution: [
        tex`A $CA$ oldal hossza: $${num(p)} + ${num(q)} = ${num(ca)}$ cm.`,
        tex`A párhuzamosság miatt $${num(p)} : ${num(ca)} = DE : ${num(ab)}$.`,
        tex`$DE = ${num(ab)} \cdot ${num(p)} : ${num(ca)} = ${num(de)}$`,
        tex`A $DE$ szakasz **${num(de)} cm** hosszú.`,
      ],
    };
  },
};

/** Are the two connecting lines parallel? True/false with a ratio check. */
const parallelCheck: GeneratorDef = {
  id: 'parallel-check',
  title: 'Párhuzamosak-e az egyenesek?',
  levels: [1, 2],
  generate(rng, level): Question {
    const p = rng.pick([3, 4, 5, 6, 8]);
    let q = rng.pick([2, 3, 4, 5, 6, 7]);
    if (q === p) q += 1;
    const k = 1 + Math.ceil(q / p);
    const r = p * k;
    const good = q * k;
    const isTrue = rng.chance(0.5);
    const x = isTrue ? good : good + rng.pick([-2, -1, 1, 2]);
    const deg = rng.pick([45, 55, 65]);
    const wholeA = p + q;
    const wholeB = r + x;
    if (level === 1) {
      return {
        prompt: tex`Az ábrán $OA_1 = ${num(p)}$, $A_1A_2 = ${num(q)}$, $OB_1 = ${num(r)}$, $B_1B_2 = ${num(x)}$.\n\n**Az $A_1B_1$ és $A_2B_2$ egyenesek párhuzamosak.**`,
        figure: angleParallel({ p, q, r, x, deg, noMarks: true }),
        answer: { type: 'truefalse', value: isTrue },
        hint: 'Hasonlítsd össze a két száron keletkező szakaszok arányát!',
        solution: [
          tex`Az egyik száron: $${num(p)} : ${num(q)}$.`,
          tex`A másik száron: $${num(r)} : ${num(x)}$.`,
          tex`Keresztszorzással: $${num(p)} \cdot ${num(x)} = ${num(p * x)}$, illetve $${num(q)} \cdot ${num(r)} = ${num(q * r)}$.`,
          isTrue
            ? tex`A két szorzat egyenlő, ezért az egyenesek **párhuzamosak** — az állítás **igaz**.`
            : tex`A két szorzat nem egyenlő, ezért az egyenesek **nem párhuzamosak** — az állítás **hamis**.`,
        ],
      };
    }
    return {
      prompt: tex`Az ábrán $OA_1 = ${num(p)}$, $OA_2 = ${num(wholeA)}$, $OB_1 = ${num(r)}$, $OB_2 = ${num(wholeB)}$.\n\n**Az $A_1B_1$ és $A_2B_2$ egyenesek párhuzamosak.**`,
      figure: angleParallel({ p, q, r, x, deg, noMarks: true }),
      answer: { type: 'truefalse', value: isTrue },
      hint: 'Az egész szárakat hasonlítsd össze: $OA_1 : OA_2$ és $OB_1 : OB_2$.',
      solution: [
        tex`Az egyik száron: $${num(p)} : ${num(wholeA)}$.`,
        tex`A másik száron: $${num(r)} : ${num(wholeB)}$.`,
        tex`Keresztszorzással: $${num(p)} \cdot ${num(wholeB)} = ${num(p * wholeB)}$, illetve $${num(wholeA)} \cdot ${num(r)} = ${num(wholeA * r)}$.`,
        isTrue
          ? tex`A két szorzat egyenlő, ezért az egyenesek **párhuzamosak** — az állítás **igaz**.`
          : tex`A két szorzat nem egyenlő, ezért az egyenesek **nem párhuzamosak** — az állítás **hamis**.`,
      ],
    };
  },
};

/** Thales' shadow method: height from two shadows. */
const shadowHeight: GeneratorDef = {
  id: 'shadow-height',
  title: 'Magasság árnyékból',
  levels: [2, 3],
  generate(rng, level): Question {
    // level 2: a stick and a tree; level 3: a person and a building (and one more step)
    const [h1, s1, s2, h2] = shadowData(rng, level === 2 ? [0.8, 2] : [1.5, 1.9], level === 2 ? [4, 15] : [12, 40]);
    if (level === 2) {
      return {
        prompt: tex`${capArticle(h1)} $${num(h1)}$ m magas bot árnyéka $${num(s1)}$ m. Ugyanekkor egy fa árnyéka $${num(s2)}$ m. Milyen magas a fa?`,
        figure: shadowFigure(h1, s1, h2, s2, 'h2'),
        answer: { type: 'number', value: h2, unit: 'm' },
        inputLabel: '$h =$',
        hint: 'A nap sugarai párhuzamosak, ezért a magasság és az árnyék aránya ugyanaz.',
        solution: [
          tex`A bot: $${num(h1)}$ m magas, $${num(s1)}$ m az árnyéka.`,
          tex`A fa: $x$ m magas, $${num(s2)}$ m az árnyéka.`,
          tex`$${num(h1)} : ${num(s1)} = x : ${num(s2)}$, ezért $x = ${num(h1)} \cdot ${num(s2)} : ${num(s1)} = ${num(h2)}$.`,
          tex`A fa **${num(h2)} m** magas.`,
        ],
      };
    }
    const diff = clean(h2 - h1);
    return {
      prompt: tex`${capArticle(h1)} $${num(h1)}$ m magas ember árnyéka $${num(s1)}$ m. Ugyanekkor egy épület árnyéka $${num(s2)}$ m. Hány méterrel magasabb az épület az embernél?`,
      figure: shadowFigure(h1, s1, h2, s2, 'h2'),
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

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-hasonlosag-02',
  goals: [
    'kimondani a párhuzamos szelők tételét,',
    'kiszámítani hiányzó szakaszokat a szög szárain és a háromszögben,',
    'eldönteni, hogy két egyenes párhuzamos-e,',
    'szerkesztéssel egyenlő részekre osztani egy szakaszt.',
  ],
  parts: [
    {
      title: 'A párhuzamos szelők tétele',
      steps: [
        {
          type: 'theory',
          title: 'A párhuzamos szelők tétele',
          body: 'Egy szög két szárát párhuzamos egyenesekkel metsszük. A szárakon keletkező szakaszok aránya egyenlő: $OA_1 : A_1A_2 = OB_1 : B_1B_2$.',
          figure: angleParallel({
            p: 4,
            q: 6,
            r: 6,
            x: 9,
            labels: { oa1: '4', a1a2: '6', ob1: '6', b1b2: '9' },
          }),
          remember: 'A párhuzamosok arányosan vágják a szög szárait.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A párhuzamos szelők tétele csak derékszögű háromszögekre igaz.**',
            answer: { type: 'truefalse', value: false },
            hint: 'Milyen alakzat szárait metszik a párhuzamosok a tételben?',
            solution: [
              'A tétel egy szög két száráról szól, nem csak derékszögű háromszögekről.',
              'Bármilyen szög esetén igaz, tehát az állítás **hamis**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Hiányzó szakasz',
          problem: 'Az ábrán $OA_1 = 4$ cm, $A_1A_2 = 6$ cm, $OB_1 = 8$ cm. Milyen hosszú a $B_1B_2$?',
          figure: angleParallel({
            p: 4,
            q: 6,
            r: 8,
            x: 12,
            labels: { oa1: '4 cm', a1a2: '6 cm', ob1: '8 cm' },
            highlight: 'b1b2',
          }),
          steps: [
            { text: 'A párhuzamosok miatt $4 : 6 = 8 : x$.' },
            { text: '$4x = 6 \\cdot 8 = 48$' },
            { text: '$x = 48 : 4 = 12$' },
          ],
          answer: '$B_1B_2 = 12$ cm.',
        },
        { type: 'practice', generator: 'intercept-missing', level: 1, count: 2 },
      ],
    },
    {
      title: 'Egész szár és rész',
      steps: [
        {
          type: 'theory',
          title: 'Egész szár és rész',
          body: 'Az egész szár és a része is arányos a másik száron: $OA_1 : OA_2 = OB_1 : OB_2$. Vigyázz, melyik szakasz melyiknek felel meg!',
          remember: 'Ugyanazon a száron mért szakaszok aránya a másikon is ugyanaz.',
        },
        {
          type: 'example',
          title: 'Az egész szár',
          problem: 'Az ábrán $OA_1 = 3$ cm, $OA_2 = 8$ cm, $OB_1 = 4{,}5$ cm. Milyen hosszú az $OB_2$?',
          figure: angleParallel({
            p: 3,
            q: 5,
            r: 4.5,
            x: 7.5,
            labels: { oa1: '3 cm', a1a2: '5 cm', ob1: '4,5 cm' },
          }),
          steps: [
            { text: '$3 : 8 = 4,5 : x$' },
            { text: '$3x = 8 \\cdot 4,5 = 36$' },
            { text: '$x = 36 : 3 = 12$' },
          ],
          answer: '$OB_2 = 12$ cm.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nHa $OA_1 = 2$, $OA_2 = 5$ és $OB_1 = 3$, akkor $OB_2 = 7{,}5$.',
            answer: { type: 'truefalse', value: true },
            hint: 'Írd fel az aránypárt: $OA_1 : OA_2 = OB_1 : OB_2$.',
            solution: [
              '$2 : 5 = 3 : 7{,}5$',
              'Keresztszorzat: $2 \\cdot 7{,}5 = 15$ és $5 \\cdot 3 = 15$.',
              'A két szorzat egyenlő, tehát az állítás **igaz**.',
            ],
          },
        },
        { type: 'practice', generator: 'intercept-missing', level: 2, count: 2 },
        { type: 'practice', generator: 'triangle-parallel', level: 2 },
      ],
    },
    {
      title: 'Párhuzamosok felismerése',
      steps: [
        {
          type: 'theory',
          title: 'A tétel megfordítása',
          body: 'Ha a szárakon keletkező szakaszok aránya egyenlő, akkor az összekötő egyenesek párhuzamosak. Ezzel ellenőrizhetjük a párhuzamosságot.',
          remember: 'Egyenlő arány $\\Rightarrow$ párhuzamos egyenesek.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nHa $OA_1 : A_1A_2 = OB_1 : B_1B_2$, akkor $A_1B_1 \\parallel A_2B_2$.',
            answer: { type: 'truefalse', value: true },
            hint: 'Ez éppen a párhuzamos szelők tételének megfordítása.',
            solution: [
              'A megfordítás szerint az egyenlő arányból következik a párhuzamosság.',
              'Tehát az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Párhuzamosak-e?',
          problem: 'Az ábrán $OA_1 = 3$ cm, $A_1A_2 = 5$ cm, $OB_1 = 4$ cm, $B_1B_2 = 6$ cm. Párhuzamos-e $A_1B_1$ és $A_2B_2$?',
          figure: angleParallel({
            p: 3,
            q: 5,
            r: 4,
            x: 6,
            labels: { oa1: '3 cm', a1a2: '5 cm', ob1: '4 cm', b1b2: '6 cm' },
            noMarks: true,
          }),
          steps: [
            { text: 'Az egyik száron: $3 : 5 = 0,6$.' },
            { text: 'A másik száron: $4 : 6 \\approx 0,67$.' },
            { text: 'A két arány nem egyenlő.' },
          ],
          answer: 'Nem, a két egyenes **nem párhuzamos**.',
        },
        { type: 'practice', generator: 'parallel-check', level: 1, count: 2 },
        { type: 'practice', generator: 'parallel-check', level: 2 },
      ],
    },
    {
      title: 'Szerkesztések',
      steps: [
        {
          type: 'theory',
          title: 'Egyenlő részekre osztás',
          body: 'A szakasz végpontjából félegyenest húzunk, rámérünk öt egyenlő szakaszt, majd párhuzamosokat szerkesztünk.',
          figure: equalPartsFigure(),
        },
        {
          type: 'check',
          question: {
            prompt: 'Tedd sorba a szakasz öt egyenlő részre osztásának lépéseit!',
            answer: {
              type: 'order',
              items: [
                'Az $AB$ szakasz $A$ végpontjából félegyenest húzunk.',
                'A félegyenesre körzővel öt egyenlő szakaszt mérünk fel.',
                'Az ötödik pontot összekötjük $B$-vel.',
                'A többi ponton át párhuzamost húzunk; ezek $AB$-t öt egyenlő részre osztják.',
              ],
              direction: 'A szerkesztés sorrendjében',
            },
            hint: 'Először a segédegyenes és a felmérés, aztán a párhuzamosok következnek.',
            solution: [
              'Először a félegyenest húzzuk meg, majd rámérjük az öt egyenlő szakaszt.',
              'Ezután az ötödik pontot összekötjük $B$-vel.',
              'Végül a többi ponton át párhuzamosokat húzunk.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'A negyedik arányos',
          body: 'Az $a : b = c : x$ negyedik arányost párhuzamos segítségével szerkesztjük meg.',
          figure: fourthProportionalFigure(),
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik összefüggéssel számolható ki a negyedik arányos?',
            answer: textChoice('$x = b \\cdot c : a$', ['$x = a \\cdot b : c$', '$x = a \\cdot c : b$', '$x = a : (b \\cdot c)$']),
            hint: 'Az $a : b = c : x$ aránypárból indulj ki, és szorozz keresztbe!',
            solution: [
              'Az $a : b = c : x$ aránypárból $a \\cdot x = b \\cdot c$.',
              'Ebből $x = b \\cdot c : a$.',
            ],
          },
        },
        { type: 'practice', generator: 'triangle-parallel', level: 3 },
      ],
    },
    {
      title: 'Thalész és az árnyék',
      steps: [
        {
          type: 'theory',
          title: 'A piramis árnyéka',
          body: 'A hagyomány szerint Thalész a piramis magasságát az árnyékából mérte meg. A nap sugarai párhuzamosak, ezért a bot és a piramis árnyéka arányos a magasságukkal.',
          figure: shadowFigure(1.5, 2, 9, 12, 'h2'),
          remember: 'magasság : árnyék = magasság : árnyék',
        },
        {
          type: 'example',
          title: 'A fa magassága',
          problem: 'Egy $1,5$ m magas bot árnyéka $2$ m. Ugyanekkor egy fa árnyéka $12$ m. Milyen magas a fa?',
          figure: shadowFigure(1.5, 2, 9, 12, 'h2'),
          steps: [
            { text: '$1,5 : 2 = x : 12$' },
            { text: '$2x = 1,5 \\cdot 12 = 18$' },
            { text: '$x = 18 : 2 = 9$' },
          ],
          answer: 'A fa **9 m** magas.',
        },
        { type: 'practice', generator: 'shadow-height', level: 2, count: 2 },
        { type: 'practice', generator: 'shadow-height', level: 3 },
      ],
    },
  ],
  generators: [interceptMissing, triangleParallelGen, parallelCheck, shadowHeight],
  miniTest: {
    items: [
      { generator: 'intercept-missing', level: 1 },
      { generator: 'intercept-missing', level: 2 },
      { generator: 'parallel-check', level: 1 },
      { generator: 'parallel-check', level: 2 },
      { generator: 'triangle-parallel', level: 2 },
      { generator: 'shadow-height', level: 2 },
      { generator: 'shadow-height', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'intercept-missing', level: 1 },
    { generator: 'intercept-missing', level: 2 },
    { generator: 'parallel-check', level: 1 },
    { generator: 'triangle-parallel', level: 2 },
    { generator: 'triangle-parallel', level: 3 },
    { generator: 'shadow-height', level: 2 },
  ],
});
