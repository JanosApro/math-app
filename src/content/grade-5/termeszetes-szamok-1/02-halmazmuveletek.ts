/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 2. Halmazműveletek
 *
 * Union, intersection and difference of two small sets of natural numbers, Venn diagrams,
 * the logic words és / vagy / nem / minden, and word problems about overlapping groups.
 * Answers are computed by code; sets stay small (≤ 6 elements each).
 */
import {
  choice,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type Rng,
  type XY,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers, set operations and the Venn-diagram figure
// ---------------------------------------------------------------------------------------------

/** LaTeX for a listed set, without the surrounding $: \{2, 4, 6\}. The empty set is ∅. */
const setTex = (items: readonly number[]): string =>
  items.length === 0 ? '\\emptyset' : tex`\{${items.map((x) => num(x)).join(',\ ')}\}`;
const setM = (items: readonly number[]): string => `$${setTex(items)}$`;

/** Sorted, duplicate-free set from [min, max]. */
function randomSet(rng: Rng, size: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return rng.sample(pool, size).sort((a, b) => a - b);
}

const sorted = (items: readonly number[]): number[] => [...items].sort((a, b) => a - b);
const union = (A: readonly number[], B: readonly number[]): number[] => sorted([...new Set([...A, ...B])]);
const inter = (A: readonly number[], B: readonly number[]): number[] => sorted(A.filter((x) => B.includes(x)));
const diff = (A: readonly number[], B: readonly number[]): number[] => sorted(A.filter((x) => !B.includes(x)));

/** The two circles of the Venn diagram: equal radii, centres at ±D/2. */
const V_R = 1.9;
const V_D = 2.3;
const V_THETA = (Math.acos(V_D / (2 * V_R)) * 180) / Math.PI;

/** Points of a circular arc, angles in degrees (0° = right, counterclockwise). */
function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n = 30): XY[] {
  const out: XY[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180);
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

type VennRegion = 'union' | 'intersection' | 'AminusB' | 'BminusA';

/** Region label used in text: A ∪ B, A ∩ B, A ∖ B or B ∖ A. */
const REGION_TEX: Record<VennRegion, string> = {
  union: 'A \\cup B',
  intersection: 'A \\cap B',
  AminusB: 'A \\setminus B',
  BminusA: 'B \\setminus A',
};
const REGION_NAME: Record<VennRegion, string> = {
  union: 'Az unió',
  intersection: 'A metszet',
  AminusB: 'Az A ∖ B',
  BminusA: 'B ∖ A',
};
/** Elements of the shaded region. */
const regionItems = (A: number[], B: number[], region: VennRegion): number[] => {
  if (region === 'union') return union(A, B);
  if (region === 'intersection') return inter(A, B);
  return region === 'AminusB' ? diff(A, B) : diff(B, A);
};

/** Vertical positions for up to five short number labels inside one region. */
const YS: Record<number, number[]> = {
  1: [0],
  2: [0.55, -0.55],
  3: [0.9, 0, -0.9],
  4: [1.1, 0.37, -0.37, -1.1],
  5: [1.2, 0.6, 0, -0.6, -1.2],
};

/** Number labels in one column of the Venn diagram. */
function column(items: readonly number[], x: number): GeoItem[] {
  const ys = YS[items.length] ?? [];
  return items.map((v, i) => ({ kind: 'label' as const, at: [x, ys[i] ?? 0] as XY, text: num(v) }));
}

/**
 * A Venn diagram of A and B with exactly one region shaded. The circles are outlines; the
 * shaded region is a polygon built from arcs, so the figure follows the two circles exactly.
 * Every element is written into its region, which makes "read the region" tasks concrete.
 */
function vennFigure(A: number[], B: number[], region: VennRegion): Figure {
  const ax = -V_D / 2;
  const bx = V_D / 2;
  const t = V_THETA;
  let poly: XY[];
  if (region === 'union') {
    poly = [...arcPts(ax, 0, V_R, t, 360 - t), ...arcPts(bx, 0, V_R, t - 180, 180 - t)];
  } else if (region === 'intersection') {
    poly = [...arcPts(ax, 0, V_R, -t, t), ...arcPts(bx, 0, V_R, 180 - t, 180 + t)];
  } else if (region === 'AminusB') {
    poly = [...arcPts(ax, 0, V_R, t, 360 - t), ...arcPts(bx, 0, V_R, 180 + t, 180 - t)];
  } else {
    poly = [...arcPts(bx, 0, V_R, 180 - t, t - 180), ...arcPts(ax, 0, V_R, -t, t)];
  }
  return {
    type: 'geometry',
    points: {},
    items: [
      { kind: 'region', points: poly, fill: 'highlight' },
      { kind: 'circle', center: [ax, 0], radius: V_R, color: 'accent', centerDot: false },
      { kind: 'circle', center: [bx, 0], radius: V_R, color: 'blue', centerDot: false },
      { kind: 'label', at: [ax - 1.55, 2.05], text: 'A', color: 'accent' },
      { kind: 'label', at: [bx + 1.55, 2.05], text: 'B', color: 'blue' },
      ...column(diff(A, B), ax - 0.65),
      ...column(inter(A, B), 0),
      ...column(diff(B, A), bx + 0.65),
    ],
    caption: `${REGION_NAME[region]} színezve`,
  };
}

/** A pair of sets with known parts. Common elements are limited, so the diagram stays readable. */
interface SetPair {
  A: number[];
  B: number[];
  common: number[];
  onlyA: number[];
  onlyB: number[];
}

function twoSets(rng: Rng, level: number): SetPair {
  const max = level === 1 ? 12 : 20;
  const sizeA = rng.int(3, level === 1 ? 5 : 6);
  const sizeB = rng.int(3, level === 1 ? 5 : 6);
  const commonCount = level === 1 ? rng.int(1, Math.min(2, sizeA, sizeB)) : rng.int(0, Math.min(3, sizeA, sizeB));
  const common = randomSet(rng, commonCount, 1, max);
  const pool = Array.from({ length: max }, (_, i) => i + 1).filter((x) => !common.includes(x));
  const onlyA = rng.sample(pool, sizeA - commonCount).sort((a, b) => a - b);
  const rest = pool.filter((x) => !onlyA.includes(x));
  const onlyB = rng.sample(rest, sizeB - commonCount).sort((a, b) => a - b);
  return { A: sorted([...common, ...onlyA]), B: sorted([...common, ...onlyB]), common, onlyA, onlyB };
}

/** All positive divisors of n. */
function divisors(n: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Number of elements of A ∪ B. */
const unionCount: GeneratorDef = {
  id: 'union-count',
  title: 'Az unió elemszáma',
  levels: [1, 2],
  generate(rng, level): Question {
    const { A, B, common } = twoSets(rng, level);
    const U = union(A, B);
    return {
      prompt: tex`$A = ${setTex(A)}$ és $B = ${setTex(B)}$. Hány eleme van az $A \cup B$ halmaznak?`,
      answer: { type: 'number', value: U.length },
      inputLabel: 'elem =',
      hint: 'Az unióba minden elem bekerül, amelyik legalább az egyik halmazban szerepel. A közös elemeket csak egyszer számold!',
      solution: [
        tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
        common.length > 0 ? tex`A közös elemek: $${common.map((x) => num(x)).join(',\ ')}$.` : 'Nincs közös elem.',
        tex`$A \cup B = ${setTex(U)}$.`,
        tex`Az $A \cup B$ halmaznak **${num(U.length)}** eleme van.`,
      ],
    };
  },
};

/** Number of elements of A ∩ B (possibly zero). */
const intersectionCount: GeneratorDef = {
  id: 'intersection-count',
  title: 'A metszet elemszáma',
  levels: [1, 2],
  generate(rng, level): Question {
    const { A, B, common } = twoSets(rng, level);
    return {
      prompt: tex`$A = ${setTex(A)}$ és $B = ${setTex(B)}$. Hány eleme van az $A \cap B$ halmaznak?`,
      answer: { type: 'number', value: common.length },
      inputLabel: 'elem =',
      hint: 'A metszetbe csak azok az elemek kerülnek, amelyek mindkét halmazban benne vannak.',
      solution:
        common.length === 0
          ? [
              tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
              'Nincs olyan szám, amelyik mindkét halmazban benne lenne.',
              tex`Ezért $A \cap B = \emptyset$, azaz **0** eleme van.`,
            ]
          : [
              tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
              tex`A közös elemek: $${common.map((x) => num(x)).join(',\ ')}$.`,
              tex`$A \cap B = ${setTex(common)}$, tehát **${num(common.length)}** eleme van.`,
            ],
    };
  },
};

/** Number of elements of A ∖ B or B ∖ A (the direction is part of the question). */
const differenceCount: GeneratorDef = {
  id: 'difference-count',
  title: 'A különbség elemszáma',
  levels: [1, 2],
  generate(rng, level): Question {
    let pair = twoSets(rng, level);
    while (pair.onlyA.length === 0 || pair.onlyB.length === 0) pair = twoSets(rng, level);
    const askA = rng.chance(0.5);
    const X = askA ? pair.A : pair.B;
    const Y = askA ? pair.B : pair.A;
    const D = diff(X, Y);
    const name = askA ? 'A \\setminus B' : 'B \\setminus A';
    const art = askA ? 'az' : 'a';
    return {
      prompt: tex`$A = ${setTex(pair.A)}$ és $B = ${setTex(pair.B)}$. Hány eleme van ${art} $${name}$ halmaznak?`,
      answer: { type: 'number', value: D.length },
      inputLabel: 'elem =',
      hint: 'A különbségbe az első halmaz elemei közül csak azok kerülnek, amelyek a másodikban nincsenek benne.',
      solution: [
        tex`$A = ${setTex(pair.A)}$, $B = ${setTex(pair.B)}$.`,
        tex`$${name} = ${setTex(D)}$.`,
        tex`Ennek **${num(D.length)}** eleme van.`,
      ],
    };
  },
};

/** Pick the correct result set of a set operation. */
const resultSet: GeneratorDef = {
  id: 'result-set',
  title: 'Melyik a művelet eredménye?',
  levels: [1, 2],
  generate(rng, level): Question {
    let pair = twoSets(rng, level);
    while (pair.A.join() === pair.B.join()) pair = twoSets(rng, level);
    const op = rng.pick(['union', 'intersection', 'AminusB', 'BminusA'] as VennRegion[]);
    const A = pair.A;
    const B = pair.B;
    const correct = regionItems(A, B, op);
    const wrongs: number[][] = [];
    if (op === 'union') wrongs.push(inter(A, B), diff(A, B), diff(B, A));
    else if (op === 'intersection') wrongs.push(union(A, B), diff(A, B), diff(B, A));
    else if (op === 'AminusB') wrongs.push(diff(B, A), inter(A, B), union(A, B));
    else wrongs.push(diff(A, B), inter(A, B), union(A, B));
    return {
      prompt: tex`Melyik halmaz ${op === 'BminusA' ? 'a' : 'az'} $${REGION_TEX[op]}$ eredménye?\n\n$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
      answer: choice(rng, setM(correct), wrongs.map((w) => setM(w)), {
        fallback: (r) => setM(randomSet(r, r.int(3, 5), 1, 20)),
      }),
      hint:
        op === 'union'
          ? 'Az unióba minden elem bekerül, amelyik legalább az egyik halmazban szerepel.'
          : op === 'intersection'
            ? 'A metszetbe csak a közös elemek kerülnek.'
            : 'A különbségbe az első halmaz elemei közül csak azok kerülnek, amelyek a másodikban nincsenek benne.',
      solution: [
        tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
        tex`$${REGION_TEX[op]} = ${setTex(correct)}$.`,
        tex`A helyes válasz: **${setM(correct)}**.`,
      ],
    };
  },
};

/** Read the shaded region of a Venn diagram: name the operation (L1) or count its elements (L2). */
const vennRegion: GeneratorDef = {
  id: 'venn-region',
  title: 'A Venn-diagram színezett része',
  levels: [1, 2],
  generate(rng, level): Question {
    let pair = twoSets(rng, level);
    while (pair.onlyA.length === 0 || pair.onlyB.length === 0 || pair.common.length === 0) pair = twoSets(rng, level);
    const region = rng.pick(['union', 'intersection', 'AminusB', 'BminusA'] as VennRegion[]);
    const items = regionItems(pair.A, pair.B, region);
    const figure = vennFigure(pair.A, pair.B, region);
    if (level === 1) {
      return {
        prompt: rng.pick([
          'Melyik művelet eredménye a színezett rész?',
          'Melyik halmazt jelöli a színezett rész?',
          'A színezett rész melyik művelet eredménye?',
        ]),
        figure,
        answer: textChoice(`$${REGION_TEX[region]}$`, (['union', 'intersection', 'AminusB', 'BminusA'] as VennRegion[])
          .filter((r) => r !== region)
          .map((r) => `$${REGION_TEX[r]}$`)),
        hint: 'Nézd meg, melyik körhöz tartozik a színezett rész, és van-e benne közös terület!',
        solution: [
          region === 'union'
            ? 'A színezett rész a két kör együtt: minden elem, amelyik legalább az egyik halmazban benne van.'
            : region === 'intersection'
              ? 'A színezett rész a két kör közös része: csak a mindkét halmazban benne lévő elemek.'
              : region === 'AminusB'
                ? 'A színezett rész az A körnek az a része, amelyik nincs benne B-ben.'
                : 'A színezett rész a B körnek az a része, amelyik nincs benne A-ban.',
          tex`Tehát a színezett rész: **$${REGION_TEX[region]}$**.`,
        ],
      };
    }
    return {
      prompt: 'Hány elem van a színezett részen?',
      figure,
      answer: { type: 'number', value: items.length },
      inputLabel: 'elem =',
      hint: 'Számold meg a színezett részen látható számokat!',
      solution: [
        items.length === 0
          ? 'A színezett részen nincs szám.'
          : tex`A színezett részen ezek a számok vannak: $${items.map((x) => num(x)).join(',\ ')}$.`,
        tex`Összesen **${num(items.length)}** elem van a színezett részen.`,
      ],
    };
  },
};

/** True/false statements with és, vagy, nem, minden. */
const logic: GeneratorDef = {
  id: 'logic',
  title: 'Logikai szavak: és, vagy, nem, minden',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const n = rng.int(2, 24);
    const even = n % 2 === 0;
    const div3 = n % 3 === 0;
    const div4 = n % 4 === 0;
    type St = { text: string; value: boolean; why: string };
    const pool: St[] = [];
    if (level === 1) {
      pool.push(
        {
          text: tex`$${num(n)}$ páros **vagy** páratlan.`,
          value: true,
          why: 'Minden természetes szám vagy páros, vagy páratlan — a „vagy” itt is igaz, ha az egyik teljesül.',
        },
        {
          text: tex`$${num(n)}$ páros **és** páratlan.`,
          value: false,
          why: 'Egy szám nem lehet egyszerre páros és páratlan, ezért az „és” állítás hamis.',
        },
        {
          text: tex`**Nem** igaz, hogy $${num(n)}$ páros.`,
          value: !even,
          why: even ? 'A szám páros, ezért a tagadása hamis.' : 'A szám páratlan, ezért a tagadása igaz.',
        },
        {
          text: tex`$${num(n)}$ osztható $2$-vel **vagy** $3$-mal.`,
          value: even || div3,
          why: even
            ? 'A szám osztható 2-vel, ezért a „vagy” állítás igaz.'
            : div3
              ? 'A szám osztható 3-mal, ezért a „vagy” állítás igaz.'
              : 'A szám sem 2-vel, sem 3-mal nem osztható, ezért a „vagy” állítás hamis.',
        },
        {
          text: tex`$${num(n)}$ osztható $2$-vel **és** $3$-mal.`,
          value: even && div3,
          why: even && div3 ? 'A szám 6-nak is többszöröse, tehát mindkettő teljesül.' : 'Nem teljesül egyszerre a két feltétel.',
        },
      );
    } else if (level === 2) {
      pool.push(
        {
          text: '**Minden** természetes szám páros.',
          value: false,
          why: 'Nem: például az 1, a 3 és az 5 páratlan.',
        },
        {
          text: '**Minden** természetes szám osztható $1$-gyel.',
          value: true,
          why: 'Az 1 minden természetes számnak osztója.',
        },
        {
          text: '**Minden** páros szám osztható $2$-vel.',
          value: true,
          why: 'A páros szám éppen azt jelenti, hogy 2-vel osztva nincs maradék.',
        },
        {
          text: 'Van olyan természetes szám, amelyik páros **és** osztható $3$-mal.',
          value: true,
          why: 'Például a 6 páros és osztható 3-mal is.',
        },
        {
          text: '**Nem** igaz, hogy minden természetes szám páratlan.',
          value: true,
          why: 'A páros számok miatt a „minden szám páratlan” állítás hamis, ezért a tagadása igaz.',
        },
        {
          text: '**Minden** páratlan szám osztható $1$-gyel.',
          value: true,
          why: 'Az 1 minden természetes számnak osztója, így a páratlanoknak is.',
        },
        {
          text: '**Nem** igaz, hogy minden természetes szám páros.',
          value: true,
          why: 'Például az 1, a 3 és az 5 páratlan, ezért a „minden szám páros” állítás hamis.',
        },
        {
          text: 'Van olyan $5$-tel osztható szám, amelyik páratlan.',
          value: true,
          why: 'Például maga az 5 páratlan és osztható 5-tel.',
        },
        {
          text: '**Minden** $5$-tel osztható szám páratlan.',
          value: false,
          why: 'A 10 osztható 5-tel, de páros — ez ellenpélda.',
        },
        {
          text: 'Van olyan $2$-vel osztható szám, amelyik páratlan.',
          value: false,
          why: 'A 2-vel osztható számok éppen a páros számok, tehát egyik sem páratlan.',
        },
      );
    } else {
      const k = rng.pick([3, 4, 6, 9]);
      const d = rng.pick([2, 3]);
      const allDivisible = k % d === 0;
      const kSuffix: Record<number, string> = { 3: '3-mal', 4: '4-gyel', 6: '6-tal', 9: '9-cel' };
      const dSuffix = d === 2 ? '2-vel' : '3-mal';
      pool.push(
        {
          text: tex`${Article(num(k))} $${num(k)}$ minden többszöröse osztható $${num(d)}$${d === 2 ? '-vel' : '-mal'}.`,
          value: allDivisible,
          why: allDivisible
            ? `Ha egy szám a ${num(k)} többszöröse, és a ${num(k)} osztható ${dSuffix}, akkor a szám is osztható ${dSuffix}.`
            : `Ellenpélda: maga a ${num(k)} osztható ${kSuffix[k]}, de ${dSuffix} nem.`,
        },
        {
          text: tex`${Article(num(k))} $${num(k)}$-${suffix(k, 'nak', 'nek')} van páratlan többszöröse.`,
          value: k % 2 === 1,
          why: k % 2 === 1 ? `Például maga a ${num(k)} páratlan.` : `A ${num(k)} páros, és minden többszöröse is páros.`,
        },
        {
          text: 'Minden páratlan szám osztható $3$-mal.',
          value: false,
          why: 'Nem: az 5 páratlan, de nem osztható 3-mal.',
        },
        {
          text: tex`$${num(n)}$ osztható $2$-vel **és** $3$-mal, de nem osztható $6$-mal.`,
          value: false,
          why: 'Ha egy szám 2-vel és 3-mal is osztható, akkor 6-tal is osztható — ez az állítás tehát mindig hamis.',
        },
        {
          text: tex`$${num(n)}$ osztható $6$-mal **vagy** nem osztható $2$-vel.`,
          value: n % 6 === 0 || !even,
          why:
            n % 6 === 0
              ? 'A szám osztható 6-tal, ezért a „vagy” állítás igaz.'
              : even
                ? 'A szám páros, de nem osztható 6-tal, ezért egyik rész sem igaz.'
                : 'A szám nem osztható 2-vel, ezért a második rész igaz.',
        },
      );
    }
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Az **és** csak akkor igaz, ha mindkét rész igaz; a **vagy** akkor is, ha csak az egyik; a **nem** tagad; a **minden** állítást egy ellenpélda is megcáfolja.',
      solution: [s.why, tex`Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** Word problems about two overlapping groups. */
const wordOverlap: GeneratorDef = {
  id: 'word-overlap',
  title: 'Szöveges feladat két csoportról',
  levels: [2, 3],
  generate(rng, level): Question {
    const c = rng.int(2, 6);
    const a = rng.int(8, 18);
    const b = rng.int(8, 18);
    const u = a + b - c;
    const neither = rng.int(2, 8);
    const total = u + neither;
    const askNeither = level === 3;
    const sports = [
      {
        first: 'fociznak',
        second: 'úsznak',
        both: 'mindkettőt űzik',
        askPositive: 'sportolnak legalább az egyiken',
        askNegative: 'nem sportolnak egyiken sem',
        sayPositive: 'sportol legalább az egyiken',
        sayNegative: 'nem sportol egyiken sem',
      },
      {
        first: 'szeretik a krimit',
        second: 'szeretik a fantasyt',
        both: 'mindkettőt szeretik',
        askPositive: 'szeretik legalább az egyik műfajt',
        askNegative: 'nem szeretik egyik műfajt sem',
        sayPositive: 'szereti legalább az egyik műfajt',
        sayNegative: 'nem szereti egyik műfajt sem',
      },
      {
        first: 'járnak sakkra',
        second: 'járnak rajzra',
        both: 'mindkettőre járnak',
        askPositive: 'járnak legalább az egyik foglalkozásra',
        askNegative: 'nem járnak egyik foglalkozásra sem',
        sayPositive: 'jár legalább az egyik foglalkozásra',
        sayNegative: 'nem jár egyik foglalkozásra sem',
      },
    ] as const;
    const s = rng.pick(sports);
    return {
      prompt: askNeither
        ? tex`Egy csoportban ${num(total)} gyerek van. ${num(a)}-${suffix(a, 'an', 'en')} ${s.first}, ${num(b)}-${suffix(b, 'an', 'en')} ${s.second}, ${num(c)}-${suffix(c, 'an', 'en')} ${s.both}. Hányan ${s.askNegative}?`
        : tex`Egy csoportban ${num(total)} gyerek van. ${num(a)}-${suffix(a, 'an', 'en')} ${s.first}, ${num(b)}-${suffix(b, 'an', 'en')} ${s.second}, ${num(c)}-${suffix(c, 'an', 'en')} ${s.both}. Hányan ${s.askPositive}?`,
      answer: { type: 'number', value: askNeither ? neither : u },
      inputLabel: askNeither ? 'egyik sem =' : 'legalább az egyik =',
      hint: askNeither
        ? 'Előbb számold ki, hányan választják legalább az egyiket, aztán vond ki az összesből!'
        : 'Aki mindkettőt választja, azt kétszer számolnád — egyszer le kell vonni.',
      solution: askNeither
        ? [
            tex`Aki legalább az egyiket választja: $${num(a)} + ${num(b)} - ${num(c)} = ${num(u)}$.`,
            tex`Aki egyiket sem: $${num(total)} - ${num(u)} = ${num(neither)}$.`,
            tex`Tehát **${num(neither)}** gyerek ${s.sayNegative}.`,
          ]
        : [
            tex`Ha összeadjuk a két csoportot, a mindkettőt választókat kétszer számoljuk.`,
            tex`Legalább az egyiket választják: $${num(a)} + ${num(b)} - ${num(c)} = ${num(u)}$.`,
            tex`Tehát **${num(u)}** gyerek ${s.sayPositive}.`,
          ],
    };
  },
};

/** Sets of divisors / multiples: common divisors, GCD and LCM preview. */
const commonDivisors: GeneratorDef = {
  id: 'common-divisors',
  title: 'Közös osztók és többszörösök halmaza',
  levels: [2, 3],
  generate(rng, level): Question {
    if (level === 3 && rng.chance(0.5)) {
      const [m, n] = rng.pick([
        [4, 6],
        [3, 4],
        [6, 8],
        [4, 10],
        [6, 9],
      ] as [number, number][]);
      const maxA = m * 5;
      const maxB = n * 4;
      const A = Array.from({ length: Math.floor(maxA / m) }, (_, i) => (i + 1) * m);
      const B = Array.from({ length: Math.floor(maxB / n) }, (_, i) => (i + 1) * n);
      const both = inter(A, B);
      if (both.length === 0) return commonDivisors.generate(rng, level); // should not happen with these pairs
      return {
        prompt: tex`Az $A$ ${article(num(m))} $${num(m)}$ többszöröseinek halmaza $${num(maxA)}$-ig, a $B$ ${article(num(n))} $${num(n)}$ többszöröseinek halmaza $${num(maxB)}$-ig. Mi az $A \cap B$ halmaz legkisebb eleme?`,
        answer: { type: 'number', value: both[0] },
        inputLabel: 'legkisebb =',
        hint: 'Sorold fel mindkét szám többszöröseit, és keresd meg a közös elemeket!',
        solution: [
          tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
          tex`$A \cap B = ${setTex(both)}$.`,
          tex`A legkisebb közös többszörös: **${num(both[0])}**.`,
        ],
      };
    }
    const [m, n] = rng.pick([
      [12, 18],
      [16, 24],
      [18, 24],
      [20, 30],
      [24, 36],
      [15, 25],
      [10, 15],
      [14, 21],
      [18, 27],
      [12, 20],
      [30, 45],
      [16, 40],
    ] as [number, number][]);
    const A = divisors(m);
    const B = divisors(n);
    const both = inter(A, B);
    const askGreatest = level === 3;
    return {
      prompt: askGreatest
        ? tex`Az $A$ ${article(num(m))} $${num(m)}$ osztóinak halmaza, a $B$ ${article(num(n))} $${num(n)}$ osztóinak halmaza. Mi az $A \cap B$ halmaz legnagyobb eleme?`
        : tex`Az $A$ ${article(num(m))} $${num(m)}$ osztóinak halmaza, a $B$ ${article(num(n))} $${num(n)}$ osztóinak halmaza. Hány eleme van az $A \cap B$ halmaznak?`,
      answer: { type: 'number', value: askGreatest ? both[both.length - 1] : both.length },
      inputLabel: askGreatest ? 'legnagyobb =' : 'elem =',
      hint: 'Sorold fel mindkét szám osztóit, és keresd meg a közös elemeket!',
      solution: [
        tex`$A = ${setTex(A)}$, $B = ${setTex(B)}$.`,
        tex`$A \cap B = ${setTex(both)}$.`,
        askGreatest
          ? tex`A legnagyobb közös osztó: **${num(both[both.length - 1])}**.`
          : tex`A közös osztók száma: **${num(both.length)}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-02',
  goals: [
    'kiszámítani két halmaz unióját, metszetét és különbségét,',
    'leolvasni a Venn-diagram színezett részét,',
    'helyesen használni az és, vagy, nem, minden szavakat,',
    'megoldani szöveges feladatokat átfedő csoportokkal.',
  ],
  parts: [
    {
      title: 'Unió',
      steps: [
        {
          type: 'theory',
          title: 'A halmazok egyesítése',
          body: 'Az $A \\cup B$ **unió** minden elemet tartalmaz, amelyik legalább az egyik halmazban benne van. A közös elemeket csak egyszer írjuk le.',
          remember: '$A \\cup B$: A-ban **vagy** B-ben benne van',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nAz $A \\cup B$ halmazban benne van az $A$ minden eleme.',
            answer: { type: 'truefalse', value: true },
            hint: 'Az unió nem hagy ki elemet egyik halmazból sem.',
            solution: ['Az unióba minden elem bekerül, amelyik A-ban **vagy** B-ben benne van.', 'Ezért A minden eleme is benne van. Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Unió kiszámítása',
          problem: 'Az $A = \\{1, 2, 3, 4\\}$, a $B = \\{3, 4, 5, 6\\}$. Mi az $A \\cup B$?',
          steps: [
            { text: 'Az unióba mindkét halmaz elemei bekerülnek.' },
            { text: 'A $3$ és a $4$ mindkettőben benne van, ezért csak egyszer írjuk le.' },
            { text: '$A \\cup B = \\{1, 2, 3, 4, 5, 6\\}$.' },
          ],
          answer: 'Az uniónak **6** eleme van.',
        },
        { type: 'practice', generator: 'union-count', level: 1, count: 2 },
        { type: 'practice', generator: 'union-count', level: 2 },
      ],
    },
    {
      title: 'Metszet',
      steps: [
        {
          type: 'theory',
          title: 'A közös elemek',
          body: 'Az $A \\cap B$ **metszet** csak azokat az elemeket tartalmazza, amelyek mindkét halmazban benne vannak. Ha nincs közös elem, a metszet üres.',
          remember: '$A \\cap B$: A-ban **és** B-ben is benne van',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nHa két halmaznak nincs közös eleme, a metszetük üres.',
            answer: { type: 'truefalse', value: true },
            hint: 'Mi kerül a metszetbe?',
            solution: ['A metszetbe csak a közös elemek kerülnek.', 'Ha nincs ilyen, akkor $A \\cap B = \\emptyset$. Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Közös osztók',
          problem: 'Az $A$ a $12$ osztóinak, a $B$ a $18$ osztóinak halmaza. Mi az $A \\cap B$?',
          steps: [
            { text: '$A = \\{1, 2, 3, 4, 6, 12\\}$.' },
            { text: '$B = \\{1, 2, 3, 6, 9, 18\\}$.' },
            { text: 'A közös elemek: $1, 2, 3, 6$.' },
          ],
          answer: '$A \\cap B = \\{1, 2, 3, 6\\}$ — **4** közös osztó.',
        },
        { type: 'practice', generator: 'intersection-count', level: 1, count: 2 },
        { type: 'practice', generator: 'intersection-count', level: 2 },
        { type: 'practice', generator: 'common-divisors', level: 2 },
      ],
    },
    {
      title: 'Különbség',
      steps: [
        {
          type: 'theory',
          title: 'Az egyik halmazból a másik',
          body: 'Az $A \\setminus B$ **különbség** az $A$ azon elemeit tartalmazza, amelyek nincsenek benne $B$-ben. A sorrend számít: $A \\setminus B$ és $B \\setminus A$ általában különbözik.',
          figure: vennFigure([1, 2, 3, 4], [3, 4, 5, 6], 'AminusB'),
          remember: '$A \\setminus B$: A elemei, amelyek **nincsenek** B-ben',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nAz $A \\setminus B$ és a $B \\setminus A$ mindig ugyanaz a halmaz.',
            answer: { type: 'truefalse', value: false },
            hint: 'Próbáld ki az $A = \\{1, 2\\}$, $B = \\{2, 3\\}$ halmazokkal!',
            solution: ['$A \\setminus B = \\{1\\}$, de $B \\setminus A = \\{3\\}$ — nem ugyanaz.', 'Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Különbség kiszámítása',
          problem: 'Az $A = \\{1, 2, 3, 4, 5\\}$, a $B = \\{4, 5, 6, 7\\}$. Mi az $A \\setminus B$ és a $B \\setminus A$?',
          steps: [
            { text: 'Az $A$-ból kivesszük a $4$-et és az $5$-öt: $A \\setminus B = \\{1, 2, 3\\}$.' },
            { text: 'A $B$-ből kivesszük a $4$-et és az $5$-öt: $B \\setminus A = \\{6, 7\\}$.' },
          ],
          answer: '$A \\setminus B = \\{1, 2, 3\\}$, $B \\setminus A = \\{6, 7\\}$.',
        },
        { type: 'practice', generator: 'difference-count', level: 1, count: 2 },
        { type: 'practice', generator: 'difference-count', level: 2 },
        { type: 'practice', generator: 'result-set', level: 2 },
      ],
    },
    {
      title: 'Venn-diagram',
      steps: [
        {
          type: 'theory',
          title: 'A Venn-diagram részei',
          body: 'A Venn-diagramon két kör mutatja a két halmazt. A közös rész a **metszet**, a két kör együtt az **unió**, a körök nem közös részei a **különbségek**.',
          figure: vennFigure([2, 4, 6], [4, 6, 8], 'intersection'),
          remember: 'metszet = közös rész · unió = a két kör együtt',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik művelet eredménye a színezett rész?',
            figure: vennFigure([1, 2, 3, 4], [3, 4, 5, 6], 'BminusA'),
            answer: textChoice('$B \\setminus A$', ['$A \\setminus B$', '$A \\cap B$', '$A \\cup B$']),
            hint: 'A színezett rész a B körben van, de nincs benne A-ban.',
            solution: ['A színezett rész a $B$ körnek az a része, amelyik nincs benne $A$-ban.', 'Ez a $B \\setminus A$ halmaz.'],
          },
        },
        {
          type: 'example',
          title: 'Olvasd le a diagramot!',
          problem: 'Az $A = \\{1, 2, 3, 4\\}$, a $B = \\{3, 4, 5, 6\\}$. Mely elemek vannak a közös részben?',
          figure: vennFigure([1, 2, 3, 4], [3, 4, 5, 6], 'intersection'),
          steps: [
            { text: 'A közös részben azok az elemek vannak, amelyek mindkét körben benne vannak.' },
            { text: 'A $3$ és a $4$ szerepel mindkét halmazban.' },
            { text: 'A többi elem csak az egyik körben van.' },
          ],
          answer: 'A közös részben a **3** és a **4** van: $A \\cap B = \\{3, 4\\}$.',
        },
        { type: 'practice', generator: 'venn-region', level: 1 },
        { type: 'practice', generator: 'venn-region', level: 2 },
        { type: 'practice', generator: 'result-set', level: 1 },
      ],
    },
    {
      title: 'Logikai szavak és szöveges feladatok',
      steps: [
        {
          type: 'theory',
          title: 'És, vagy, nem, minden',
          body: 'Az **és** csak akkor igaz, ha mindkét rész igaz. A **vagy** akkor is, ha csak az egyik. A **nem** tagad, a **minden** egy egész halmazra vonatkozik: egy ellenpélda is megcáfolja.',
          remember: 'és = mindkettő · vagy = legalább az egyik · nem = tagadás',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nA $12$ osztható $2$-vel **és** $3$-mal.',
            answer: { type: 'truefalse', value: true },
            hint: 'Mindkét feltételnek teljesülnie kell.',
            solution: ['A $12 : 2 = 6$ és a $12 : 3 = 4$ is egész, tehát mindkettő igaz.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Átfedő csoportok',
          problem: '$26$ tanuló közül $15$ focizik, $12$ úszik, $5$ mindkettőt. Hányan sportolnak legalább az egyiken?',
          steps: [
            { text: 'Aki mindkettőt űzi, azt a $15 + 12$ összegben kétszer számoljuk.' },
            { text: 'Ezért egyszer le kell vonni: $15 + 12 - 5 = 22$.' },
          ],
          answer: '**22** tanuló sportol legalább az egyiket.',
        },
        { type: 'practice', generator: 'logic', level: 1 },
        { type: 'practice', generator: 'logic', level: 2 },
        { type: 'practice', generator: 'logic', level: 3 },
        { type: 'practice', generator: 'word-overlap', level: 2 },
        { type: 'practice', generator: 'word-overlap', level: 3 },
        { type: 'practice', generator: 'common-divisors', level: 3 },
      ],
    },
  ],
  generators: [unionCount, intersectionCount, differenceCount, resultSet, vennRegion, logic, wordOverlap, commonDivisors],
  miniTest: {
    items: [
      { generator: 'union-count', level: 1 },
      { generator: 'intersection-count', level: 2 },
      { generator: 'difference-count', level: 1 },
      { generator: 'result-set', level: 2 },
      { generator: 'venn-region', level: 1 },
      { generator: 'logic', level: 2 },
      { generator: 'word-overlap', level: 3 },
      { generator: 'common-divisors', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'union-count', level: 1 },
    { generator: 'intersection-count', level: 1 },
    { generator: 'difference-count', level: 1 },
    { generator: 'result-set', level: 1 },
    { generator: 'venn-region', level: 1 },
    { generator: 'logic', level: 1 },
    { generator: 'common-divisors', level: 2 },
  ],
});
