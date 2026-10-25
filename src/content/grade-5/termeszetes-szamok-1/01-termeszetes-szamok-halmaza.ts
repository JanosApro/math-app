/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 1. A természetes számok halmaza
 *
 * Sets N and N₀, set notation, elements and subsets, equality of sets, finite / infinite / empty
 * sets, the number line, comparing and ordering, predecessor / successor.
 * All answers are computed by code; sets stay small (≤ 10 elements) at levels 1–2.
 */
import {
  article,
  choice,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers and static figures
// ---------------------------------------------------------------------------------------------

/** LaTeX for a listed set, without the surrounding $: \{2, 4, 6\}. The empty set is ∅. */
const setTex = (items: readonly number[]): string =>
  items.length === 0 ? '\\emptyset' : tex`\{${items.map((x) => num(x)).join(',\ ')}\}`;

/** The same in inline math: $\{2, 4, 6\}$. */
const setM = (items: readonly number[]): string => `$${setTex(items)}$`;

/** A sorted, duplicate-free set of `size` whole numbers from [min, max]. */
function randomSet(rng: Rng, size: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return rng.sample(pool, size).sort((a, b) => a - b);
}

/** Plain comma-separated list: 2, 4, 6. */
const listOf = (items: readonly number[]): string => items.map((x) => num(x)).join(', ');

/** A short hint that fits the property in the question. */
function propertyHint(text: string): string {
  if (text.includes('osztói')) return 'Keresd meg az összes számot, amellyel a megadott szám maradék nélkül osztható!';
  if (text.includes('osztható') || text.includes('többszörös')) return 'Sorold fel az adott szám többszöröseit, és állj meg a határnál!';
  return 'Sorold fel a páros vagy páratlan számokat! Figyelj a határra, és arra, hogy a 0 nem természetes szám.';
}

/** Binomial coefficient, used only to count subsets by size for 4–5 element sets. */
function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/** All index combinations of size k from 0…n−1, in lexicographic order. */
function combinations(n: number, k: number): number[][] {
  const out: number[][] = [];
  const pick: number[] = [];
  const walk = (start: number): void => {
    if (pick.length === k) {
      out.push([...pick]);
      return;
    }
    for (let i = start; i < n; i++) {
      pick.push(i);
      walk(i + 1);
      pick.pop();
    }
  };
  walk(0);
  return out;
}

/** The number line from the first part. */
const numberLineFig: Figure = {
  type: 'numberLine',
  min: 0,
  max: 10,
  step: 1,
  tickLabels: 'major',
  points: [
    { value: 4, label: 'A' },
    { value: 7, label: 'B' },
  ],
  caption: 'A számegyenesen jobbra nőnek a számok.',
};

/** A small circle inside a larger one: A ⊂ B. */
const subsetFig: Figure = {
  type: 'geometry',
  points: {},
  items: [
    { kind: 'circle', center: [0, 0], radius: 2.4, color: 'accent', centerDot: false },
    { kind: 'circle', center: [-0.55, 0.15], radius: 1.05, color: 'highlight', fill: 'highlight', centerDot: false },
    { kind: 'label', at: [-0.55, 1.55], text: 'A', color: 'highlight' },
    { kind: 'label', at: [2.35, 2.25], text: 'B', color: 'accent' },
  ],
  caption: 'A ⊂ B: az A minden eleme a B-ben is benne van.',
};

/** Finite, infinite and empty sets side by side. */
const setTypesTable: Figure = {
  type: 'table',
  header: ['Halmaz', 'Elemei', 'Fajtája'],
  rows: [
    ['{1, 2, 3}', '1, 2, 3', 'véges'],
    ['N', '1, 2, 3, …', 'végtelen'],
    ['∅', 'nincs eleme', 'üres'],
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** "páros természetes számok" / "hárommal osztható természetes számok". */
function multiplesText(k: number): string {
  return k === 2 ? 'páros természetes számok' : `${{ 3: 'hárommal', 4: 'néggyel', 5: 'öttel', 6: 'hattal' }[k]} osztható természetes számok`;
}

/** Is the number an element of the set? T/F, with ∈ / ∉ and N / N₀. */
const elementOf: GeneratorDef = {
  id: 'element-of',
  title: 'Eleme-e a szám a halmaznak? (∈, ∉)',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 2 && rng.chance(0.35)) {
      const kind = rng.pick(['zeroN', 'zeroN0', 'oneN', 'zeroNotN0'] as const);
      const yes = kind === 'zeroN0' || kind === 'oneN';
      const text =
        kind === 'zeroN'
          ? tex`$0 \in N$`
          : kind === 'zeroN0'
            ? tex`$0 \in N_0$`
            : kind === 'oneN'
              ? tex`$1 \in N$`
              : tex`$0 \notin N_0$`;
      return {
        prompt: tex`Igaz vagy hamis?\n\n${text}`,
        answer: { type: 'truefalse', value: yes },
        hint: 'N a pozitív természetes számok halmaza, N₀-ban a 0 is benne van.',
        solution: [
          tex`$N = \{1, 2, 3, \ldots\}$ és $N_0 = \{0, 1, 2, 3, \ldots\}$.`,
          kind === 'zeroN'
            ? 'A 0 nem pozitív, ezért **nem** eleme N-nek.'
            : kind === 'zeroN0'
              ? 'A 0 benne van N₀-ban.'
              : kind === 'oneN'
                ? 'Az 1 a legkisebb pozitív természetes szám, tehát eleme N-nek.'
                : 'A 0 eleme N₀-nak, ezért a „nem eleme” állítás hamis.',
          tex`Az állítás **${yes ? 'igaz' : 'hamis'}**.`,
        ],
      };
    }
    const size = rng.int(3, level === 1 ? 5 : 7);
    const max = level === 1 ? 10 : 20;
    const A = randomSet(rng, size, 1, max);
    const inside = rng.chance(0.5);
    let target: number;
    if (inside) {
      target = rng.pick(A);
    } else {
      const outside = Array.from({ length: max }, (_, i) => i + 1).filter((x) => !A.includes(x));
      target = rng.pick(outside);
    }
    const symbol = inside ? '\\in' : '\\notin';
    return {
      prompt: tex`Igaz vagy hamis?\n\n$${num(target)} ${symbol} ${setTex(A)}$`,
      answer: { type: 'truefalse', value: inside },
      hint: 'Nézd meg, szerepel-e a szám a kapcsos zárójelek között!',
      solution: [
        tex`A halmaz elemei: $${listOf(A)}$.`,
        inside
          ? tex`${Article(num(target))} $${num(target)}$ szerepel a felsorolásban, tehát **eleme** a halmaznak.`
          : tex`${Article(num(target))} $${num(target)}$ nem szerepel a felsorolásban, tehát **nem eleme** a halmaznak.`,
        tex`Az állítás **${inside ? 'igaz' : 'hamis'}**.`,
      ],
    };
  },
};

/** Which writing is the correct set notation? L1: braces; L2: the right listed set for a property. */
const notation: GeneratorDef = {
  id: 'notation',
  title: 'A halmaz helyes jelölése',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const A = randomSet(rng, 3, 1, 9);
      const inner = listOf(A);
      return {
        prompt: tex`Melyik a helyes jelölése ${article(inner)} $${inner}$ számok halmazának?`,
        answer: textChoice(setM(A), [`$(${inner})$`, `$[${inner}]$`, `$${inner}$`]),
        hint: 'A halmaz elemeit kapcsos zárójel közé írjuk.',
        solution: [
          'A halmazt kapcsos zárójelek közé írjuk, az elemeket pedig felsoroljuk.',
          tex`Helyesen: **${setM(A)}**.`,
        ],
      };
    }
    // level 2, the other way round: which property gives the listed set?
    const k = rng.pick([2, 3, 4, 5]);
    const m = rng.int(4, 6);
    const limit = m * k;
    const list = Array.from({ length: m - 1 }, (_, i) => (i + 1) * k);
    const correct = `${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} kisebb ${multiplesText(k)}`;
    const wrongs = [
      `${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} nem nagyobb ${multiplesText(k)}`,
      `${article(num(limit - k))} $${num(limit - k)}$-${suffix(limit - k, 'nál', 'nél')} kisebb ${multiplesText(k)}`,
      `${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} kisebb természetes számok`,
    ];
    return {
      prompt: tex`Melyik tulajdonság adja meg ezt a halmazt?\n\n$${setTex(list)}$`,
      answer: textChoice(correct, wrongs),
      hint: 'Nézd meg, milyen számok vannak a halmazban, és hol áll meg a felsorolás!',
      solution: [
        tex`A halmaz elemei ${multiplesText(k)}: $${listOf(list)}$.`,
        tex`A következő ilyen szám ${article(num(limit))} $${num(limit)}$ lenne, de az már nincs benne: tehát ${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} **kisebb** számokról van szó.`,
        tex`A helyes tulajdonság: **${correct}**.`,
      ],
    };
  },
};

/** How many elements does the set have? Duplicates and ellipsis notation. */
const countElements: GeneratorDef = {
  id: 'count-elements',
  title: 'A halmaz elemszáma',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1 && rng.chance(0.15)) {
      return {
        prompt: tex`Hány eleme van az üres halmaznak?\n\n$\emptyset$`,
        answer: { type: 'number', value: 0 },
        inputLabel: 'elem =',
        hint: 'Az üres halmazban nincs egyetlen elem sem.',
        solution: ['Az üres halmaznak **0** eleme van.', 'A $\{0\}$ halmaznak viszont 1 eleme van: a 0.'],
      };
    }
    if (level === 1) {
      const distinct = randomSet(rng, rng.int(2, 5), 1, 12);
      const extra = rng.sample(distinct, rng.int(1, Math.min(2, distinct.length)));
      const shown = rng.shuffle([...distinct, ...extra]);
      return {
        prompt: tex`Hány eleme van a halmaznak?\n\n$${setTex(shown)}$`,
        answer: { type: 'number', value: distinct.length },
        inputLabel: 'elem =',
        hint: 'A halmazban egy elem többször is szerepelhet a felsorolásban, de csak egyszer számít.',
        solution: [
          tex`A felsorolásban szereplő különböző elemek: $${listOf(distinct)}$.`,
          tex`A halmaznak tehát **${num(distinct.length)}** eleme van.`,
        ],
      };
    }
    const seq = rng.pick([
      { first: 2, step: 2, last: 20 },
      { first: 1, step: 2, last: 15 },
      { first: 3, step: 3, last: 27 },
      { first: 5, step: 5, last: 50 },
      { first: 4, step: 4, last: 40 },
      { first: 2, step: 2, last: 18 },
      { first: 2, step: 2, last: 16 },
      { first: 1, step: 2, last: 11 },
      { first: 3, step: 3, last: 21 },
      { first: 4, step: 4, last: 24 },
      { first: 5, step: 5, last: 40 },
      { first: 6, step: 6, last: 36 },
      { first: 10, step: 10, last: 80 },
      { first: 2, step: 4, last: 18 },
    ] as const);
    const n = (seq.last - seq.first) / seq.step + 1;
    const all = Array.from({ length: n }, (_, i) => seq.first + i * seq.step);
    return {
      prompt: tex`Hány eleme van a halmaznak?\n\n$\{${num(seq.first)}, ${num(seq.first + seq.step)}, ${num(seq.first + 2 * seq.step)}, \ldots, ${num(seq.last)}\}$`,
      answer: { type: 'number', value: n },
      inputLabel: 'elem =',
      hint: 'Sorold fel az összes elemet, és számold meg őket!',
      solution: [
        tex`A felsorolás: $${listOf(all)}$.`,
        tex`Összesen **${num(n)}** eleme van a halmaznak.`,
      ],
    };
  },
};

/** Number of subsets of a small set, counted by listing / grouping, not by the formula. */
const subsets: GeneratorDef = {
  id: 'subsets',
  title: 'Hány részhalmaza van?',
  levels: [2, 3],
  generate(rng, level): Question {
    const n = level === 2 ? rng.int(2, 3) : rng.int(4, 5);
    const A = randomSet(rng, n, 1, 12);
    const count = 2 ** n;
    const steps: string[] = [];
    if (n <= 3) {
      const all: string[] = ['\\emptyset'];
      for (let k = 1; k <= n; k++) {
        for (const idx of combinations(n, k)) {
          const part = idx.map((i) => A[i]);
          all.push(tex`\{${part.map((x) => num(x)).join(',\ ')}\}`);
        }
      }
      steps.push(tex`Soroljuk fel az elemek száma szerint: $${all.join(';\\ ')}$.`);
      steps.push(tex`Megszámolva **${num(count)}** részhalmaz van.`);
    } else {
      const bySize = Array.from({ length: n + 1 }, (_, k) => binom(n, k));
      const labels = ['üres', 'egyelemű', 'kételemű', 'háromelemű', 'négyelemű', 'ötelemű'];
      steps.push('Csoportosítsuk a részhalmazokat aszerint, hány elemük van:');
      steps.push(bySize.map((c, k) => `$${num(c)}$ ${labels[k]}`).join(' + '));
      steps.push(tex`Összesen: $${bySize.map((x) => num(x)).join(' + ')} = ${num(count)}$.`);
      steps.push(tex`Tehát **${num(count)}** részhalmaz van.`);
    }
    return {
      prompt: tex`Hány részhalmaza van ${article(setTex(A))} $${setTex(A)}$ halmaznak?`,
      answer: { type: 'number', value: count },
      inputLabel: 'részhalmazok száma =',
      hint: 'Rendszerezd a részhalmazokat az elemek száma szerint: üres, egyelemű, kételemű, …',
      solution: steps,
    };
  },
};

/** Subset (⊂, ⊄) and equality of sets as true/false statements. */
const subsetEq: GeneratorDef = {
  id: 'subset-eq',
  title: 'Részhalmaz és egyenlő halmaz (igaz / hamis)',
  levels: [1, 2],
  generate(rng, level): Question {
    const kind =
      level === 1
        ? rng.pick(['sub', 'sub'] as const)
        : rng.pick(['eq', 'eq', 'empty', 'self'] as const);
    let A: number[];
    let B: number[];
    let symbol: string;
    let truth: boolean;
    let subsetTrue = false;
    if (kind === 'empty') {
      A = [];
      B = randomSet(rng, rng.int(3, 5), 1, 10);
      symbol = '\\subset';
      truth = true;
      subsetTrue = true;
    } else if (kind === 'self') {
      A = randomSet(rng, rng.int(3, 5), 1, 10);
      B = [...A];
      symbol = rng.chance(0.5) ? '\\subset' : '=';
      truth = true;
      subsetTrue = true;
    } else if (kind === 'eq') {
      B = randomSet(rng, rng.int(3, 5), 1, 10);
      if (rng.chance(0.5)) {
        A = rng.shuffle(B);
        symbol = '=';
        truth = true;
      } else {
        A = [...B];
        const i = rng.int(0, A.length - 1);
        const outside = Array.from({ length: 12 }, (_, k) => k + 1).filter((x) => !B.includes(x));
        A[i] = rng.pick(outside);
        A = rng.shuffle(A);
        const ne = rng.chance(0.5);
        symbol = ne ? '\\ne' : '=';
        truth = ne;
      }
    } else {
      B = randomSet(rng, rng.int(4, 6), 1, 12);
      const isSubset = rng.chance(0.5);
      subsetTrue = isSubset;
      if (isSubset) {
        A = rng.sample(B, rng.int(2, B.length - 1)).sort((a, b) => a - b);
      } else {
        const outside = Array.from({ length: 15 }, (_, k) => k + 1).filter((x) => !B.includes(x));
        A = [...rng.sample(B, rng.int(1, 2)), rng.pick(outside)].sort((a, b) => a - b);
      }
      symbol = rng.chance(0.5) ? '\\subset' : '\\not\\subset';
      truth = isSubset === (symbol === '\\subset');
    }
    const isEquality = symbol === '=' || symbol === '\\ne';
    return {
      prompt: tex`Igaz vagy hamis?\n\n$${setTex(A)} ${symbol} ${setTex(B)}$`,
      answer: { type: 'truefalse', value: truth },
      hint: isEquality
        ? 'Két halmaz akkor egyenlő, ha ugyanazok az elemei — a sorrend nem számít.'
        : 'A részhalmaznál az első halmaz minden elemét keresd meg a másodikban!',
      solution: [
        tex`$A = ${setTex(A)}$ és $B = ${setTex(B)}$.`,
        kind === 'empty'
          ? 'Az üres halmaznak nincs eleme, ezért minden halmaznak részhalmaza.'
          : isEquality
            ? truth
              ? 'Mindkét halmazban ugyanazok az elemek szerepelnek, csak a sorrend más.'
              : 'Az egyik halmazban van olyan elem, amelyik a másikban nincs benne.'
            : symbol === '\\subset'
              ? subsetTrue
                ? 'Az A minden eleme megtalálható B-ben, tehát az állítás igaz.'
                : 'Az A-ban van olyan elem, amelyik B-ben nincs benne, tehát az állítás hamis.'
              : subsetTrue
                ? 'Az A minden eleme megtalálható B-ben, ezért a „nem részhalmaz” állítás hamis.'
                : 'Az A-ban van olyan elem, amelyik B-ben nincs benne, ezért a „nem részhalmaz” állítás igaz.',
        tex`Az állítás **${truth ? 'igaz' : 'hamis'}**.`,
      ],
    };
  },
};

/** Compare two natural numbers with <, > or =. */
const compare: GeneratorDef = {
  id: 'compare',
  title: 'Két szám összehasonlítása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const range: [number, number] = level === 1 ? [1, 100] : level === 2 ? [1000, 9999] : [100000, 999999];
    let a = rng.int(range[0], range[1]);
    let b = rng.int(range[0], range[1]);
    if (rng.chance(0.12)) b = a;
    else if (b === a) b = a === range[1] ? a - 1 : a + 1;
    const rel = a < b ? '<' : a > b ? '>' : '=';
    const wrongs = ['<', '>', '='].filter((x) => x !== rel).map((x) => `$${x}$`);
    return {
      prompt: tex`Melyik jel kerüljön a négyzet helyére?\n\n$${num(a)} \; \square \; ${num(b)}$`,
      answer: choice(rng, `$${rel}$`, wrongs, { count: 3 }),
      hint: 'Előbb a számjegyek számát hasonlítsd össze, aztán az első eltérő számjegyet!',
      solution: [
        a === b
          ? tex`A két szám ugyanaz: $${num(a)} = ${num(b)}$.`
          : String(a).length !== String(b).length
            ? tex`$${num(Math.max(a, b))}$ nagyobb, mert több számjegye van.`
            : 'A két szám ugyanannyi számjegyű; az első eltérő számjegy dönt.',
        tex`Helyesen: $${num(a)} ${rel} ${num(b)}$.`,
      ],
    };
  },
};

/** Order 3–4 numbers increasingly or decreasingly. */
const order: GeneratorDef = {
  id: 'order',
  title: 'Számok rendezése',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const range: [number, number] = level === 1 ? [1, 100] : level === 2 ? [100, 999] : [10000, 99999];
    const count = level === 1 ? 3 : 4;
    const numbers = randomSet(rng, count, range[0], range[1]);
    const asc = rng.chance(0.5);
    const sortedNums = asc ? numbers : [...numbers].reverse();
    return {
      prompt: tex`Rendezd ${asc ? 'növekvő' : 'csökkenő'} sorrendbe a számokat!`,
      answer: {
        type: 'order',
        items: sortedNums.map((x) => `$${num(x)}$`),
        direction: asc ? 'A legkisebbtől a legnagyobbig' : 'A legnagyobbtól a legkisebbig',
      },
      hint: 'Hasonlítsd össze a számjegyek számát, majd az első eltérő számjegyet!',
      solution: [
        tex`A számok nagyság szerint: $${numbers.map((x) => num(x)).join(' < ')}$.`,
        tex`A helyes sorrend: **${sortedNums.map((x) => num(x)).join(asc ? ' < ' : ' > ')}**.`,
      ],
    };
  },
};

/** Predecessor and successor of a natural number. */
const neighbour: GeneratorDef = {
  id: 'neighbour',
  title: 'Előd és rákövetkező',
  levels: [1, 2],
  generate(rng, level): Question {
    const askSuccessor = rng.chance(0.5);
    // level 1: up to 100; level 2: the neighbour crosses a hundred or a thousand (399 → 400, 3000 → 2999)
    const round = rng.int(1, 9) * rng.pick([100, 1000]) + rng.pick([0, 0, 1000]);
    const n = level === 1 ? rng.int(2, 99) : askSuccessor ? round - 1 : round;
    const value = askSuccessor ? n + 1 : n - 1;
    return {
      prompt: askSuccessor
        ? tex`Mi ${article(n)} $${num(n)}$ rákövetkezője?`
        : tex`Mi ${article(n)} $${num(n)}$ elődje?`,
      answer: { type: 'number', value },
      inputLabel: askSuccessor ? 'rákövetkező =' : 'előd =',
      hint: askSuccessor
        ? 'A rákövetkező 1-gyel nagyobb a számnál.'
        : 'Az előd 1-gyel kisebb a számnál.',
      solution: [
        askSuccessor
          ? tex`$${num(n)} + 1 = ${num(value)}$`
          : tex`$${num(n)} - 1 = ${num(value)}$`,
        askSuccessor
          ? tex`${Article(num(n))} $${num(n)}$ rákövetkezője **${num(value)}**.`
          : tex`${Article(num(n))} $${num(n)}$ elődje **${num(value)}**.`,
      ],
    };
  },
};

/** Read a marked point on the number line (L1), or find the point of a value (L2). */
const numberLinePoint: GeneratorDef = {
  id: 'numberline-point',
  title: 'Pont a számegyenesen',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const value = rng.int(1, 10);
      return {
        prompt: tex`Melyik szám van az $A$ pontnál?`,
        figure: {
          type: 'numberLine',
          min: 0,
          max: 10,
          step: 1,
          tickLabels: 'major',
          points: [{ value, label: 'A' }],
        },
        answer: { type: 'number', value },
        inputLabel: 'A =',
        hint: 'A pont alatt látható a szám a számegyenesen.',
        solution: [
          tex`Az $A$ pont ${article(num(value))} $${num(value)}$-${suffix(value, 'nál', 'nél')} található.`,
          tex`Tehát $A = ${num(value)}$.`,
        ],
      };
    }
    const step = rng.pick([10, 100]);
    const max = step * 10;
    const values = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => k * step)).slice(0, 3);
    const letters = ['A', 'B', 'C'];
    const target = rng.pick(values);
    const targetLetter = letters[values.indexOf(target)];
    return {
      prompt: tex`Melyik pont felel meg ${article(num(target))} $${num(target)}$-${suffix(target, 'nak', 'nek')}?`,
      figure: {
        type: 'numberLine',
        min: 0,
        max,
        step,
        tickLabels: 'ends',
        points: values.map((value, i) => ({ value, label: letters[i] })),
      },
      answer: textChoice(`$${targetLetter}$`, letters.filter((l) => l !== targetLetter).map((l) => `$${l}$`)),
      hint: 'A 0-tól indulva számold meg az osztásokat!',
      solution: [
        tex`${Article(num(target))} $${num(target)}$ a 0-tól $${num(target / step)}$ osztásra van.`,
        tex`A keresett pont: **$${targetLetter}$**.`,
      ],
    };
  },
};

/** Which listed set belongs to a defining property? */
const defineByProperty: GeneratorDef = {
  id: 'define-by-property',
  title: 'Halmaz megadása jellemző tulajdonsággal',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      // even / odd numbers below a limit (the limit itself may or may not belong)
      const even = rng.chance(0.5);
      const limit = rng.int(7, 16);
      const correct = Array.from({ length: limit - 1 }, (_, i) => i + 1).filter((x) => (x % 2 === 0) === even);
      const text = `${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} kisebb ${even ? 'páros' : 'páratlan'} természetes számok`;
      const nextOne = correct[correct.length - 1] + 2;
      const wrongs = [
        [...correct, nextOne],
        correct.slice(0, -1),
        even ? [0, ...correct] : correct.map((x) => x + 1),
      ];
      return {
        prompt: tex`Melyik halmazt kapod?\n\n**${text}**`,
        answer: choice(rng, setM(correct), wrongs.map((w) => setM(w))),
        hint: `Sorold fel a ${even ? 'páros' : 'páratlan'} számokat, és figyelj a határra: ${article(num(limit))} $${num(limit)}$-${suffix(limit, 'nál', 'nél')} kisebbek kellenek!${even ? ' A 0 nem természetes szám.' : ''}`,
        solution: [tex`A feltételnek megfelelő számok: $${listOf(correct)}$.`, tex`A helyes halmaz: **${setM(correct)}**.`],
      };
    }
    // level 2: two conditions — between two numbers and divisible by k
    const k = rng.pick([3, 4, 5]);
    const from = rng.int(k + 1, 12);
    const to = from + rng.int(3, 5) * k + rng.int(0, k - 1);
    const correct = Array.from({ length: to - from - 1 }, (_, i) => from + 1 + i).filter((x) => x % k === 0);
    const text = `${article(num(from))} $${num(from)}$-${suffix(from, 'nál', 'nél')} nagyobb, $${num(to)}$-${suffix(to, 'nál', 'nél')} kisebb, ${multiplesText(k)}`;
    const below = Array.from({ length: to - 1 }, (_, i) => i + 1).filter((x) => x % k === 0);
    const withEnds = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter((x) => x % k === 0);
    const wrongs = [below, withEnds.length !== correct.length ? withEnds : [...correct, correct[correct.length - 1] + k], correct.slice(1)];
    return {
      prompt: tex`Melyik halmazt kapod?\n\n**${text}**`,
      answer: choice(rng, setM(correct), wrongs.map((w) => setM(w))),
      hint: 'Mindkét feltételnek teljesülnie kell: a számnak a két határ között kell lennie, és oszthatónak kell lennie.',
      solution: [
        tex`${Article(num(from))} $${num(from)}$ és ${article(num(to))} $${num(to)}$ közötti számok közül ${multiplesText(k).replace(' természetes számok', '')}k: $${listOf(correct)}$.`,
        tex`A helyes halmaz: **${setM(correct)}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-01',
  goals: [
    'megkülönböztetni az N és az N₀ halmazt,',
    'helyesen jelölni a halmazokat, az elemeket és a részhalmazokat,',
    'felsorolással és jellemző tulajdonsággal megadni egy halmazt,',
    'összehasonlítani és rendezni a természetes számokat.',
  ],
  parts: [
    {
      title: 'A természetes számok és a számegyenes',
      steps: [
        {
          type: 'theory',
          title: 'Számok a számegyenesen',
          body: 'A természetes számokkal számolunk: $1, 2, 3, \\ldots$ A számegyenesen minden számnak megvan a helye. Jobbra haladva nőnek, balra csökkennek a számok.',
          figure: numberLineFig,
          remember: '$N = \\{1, 2, 3, \\ldots\\}$, $N_0 = \\{0, 1, 2, \\ldots\\}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$0 \\in N$',
            answer: { type: 'truefalse', value: false },
            hint: 'Melyik a legkisebb pozitív természetes szám?',
            solution: [
              '$N = \\{1, 2, 3, \\ldots\\}$, tehát a 0 **nem** eleme N-nek.',
              'A 0 az $N_0$ halmazban van benne. Az állítás **hamis**.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'N és N₀',
          body: 'Az $N$ halmaz a pozitív természetes számok halmaza. Ha a nullát is felvesszük, az $N_0$ halmazt kapjuk. A $0$-nak nincs elődje az $N_0$-ban.',
          remember: '$0 \\in N_0$, de $0 \\notin N$',
        },
        {
          type: 'example',
          title: 'Előd és rákövetkező',
          problem: 'Mi a $349$ elődje és rákövetkezője?',
          steps: [
            { text: 'Az előd 1-gyel kisebb: $349 - 1 = 348$.' },
            { text: 'A rákövetkező 1-gyel nagyobb: $349 + 1 = 350$.' },
          ],
          answer: 'Az előd **348**, a rákövetkező **350**.',
        },
        { type: 'practice', generator: 'neighbour', level: 1, count: 2 },
        { type: 'practice', generator: 'numberline-point', level: 1 },
        { type: 'practice', generator: 'compare', level: 1 },
      ],
    },
    {
      title: 'Halmazok megadása',
      steps: [
        {
          type: 'theory',
          title: 'Halmazok és jelölésük',
          body: 'A halmazt kapcsos zárójelbe írjuk, elemeit felsoroljuk. Egy elem csak egyszer szerepel; ha mégis többször látod, akkor is egyszer számít. Az üres halmaznak nincs eleme.',
          figure: setTypesTable,
          remember: '$A = \\{1, 3, 5\\}$ · $\\emptyset = \\{\\}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nAz üres halmaznak $0$ eleme van.',
            answer: { type: 'truefalse', value: true },
            hint: 'Az üres halmazban nincs egyetlen elem sem.',
            solution: [
              'Az üres halmaznak **0** eleme van.',
              'Ügyelj: a $\\{0\\}$ halmaznak 1 eleme van, a 0.',
            ],
          },
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\nAz $N$ halmaznak véges sok eleme van.',
            answer: { type: 'truefalse', value: false },
            hint: 'Van-e legnagyobb természetes szám?',
            solution: [
              '$N = \\{1, 2, 3, \\ldots\\}$, ezért minden természetes számnál van nagyobb.',
              'Az $N$ halmaz **végtelen** — az állítás hamis.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'Felsorolás vagy tulajdonság',
          body: 'Ugyanazt a halmazt kétféleképpen is megadhatjuk: felsoroljuk az elemeit, vagy megmondjuk, milyen tulajdonság jellemzi őket. A végtelen halmazt csak tulajdonsággal tudjuk megadni.',
          remember: 'felsorolás: $\\{2, 4, 6, 8\\}$ · tulajdonság: páros számok',
        },
        {
          type: 'example',
          title: 'Hány eleme van?',
          problem: 'Sorold fel a $20$-nál kisebb, hárommal osztható természetes számokat!',
          steps: [
            { text: 'A három többszörösei: $3, 6, 9, 12, 15, 18$.' },
            { text: 'A $21$ már nem kisebb $20$-nál, ezért itt megállunk.' },
            { text: 'A felsorolt számok száma $6$.' },
          ],
          answer: 'A halmaz elemei: **3, 6, 9, 12, 15, 18** — összesen 6 elem.',
        },
        { type: 'practice', generator: 'count-elements', level: 1, count: 2 },
        { type: 'practice', generator: 'define-by-property', level: 1 },
        { type: 'practice', generator: 'notation', level: 1 },
      ],
    },
    {
      title: 'Elem és halmaz',
      steps: [
        {
          type: 'theory',
          title: 'Eleme vagy nem eleme',
          body: 'Az $\\in$ jel azt jelenti: **eleme**. A $\\notin$ jel azt jelenti: **nem eleme**. Egy szám és egy halmaz kapcsolatát írjuk le vele.',
          remember: '$3 \\in A$: a 3 eleme A-nak · $5 \\notin A$: nem eleme',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$5 \\in \\{1, 3, 5, 7\\}$',
            answer: { type: 'truefalse', value: true },
            hint: 'Szerepel az 5 a kapcsos zárójelek között?',
            solution: ['Az 5 ott van a felsorolásban, tehát **eleme** a halmaznak.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Eleme-e a 12?',
          problem: 'Eleme-e a $12$ a $\\{2, 4, 6, 8, 10\\}$ halmaznak?',
          steps: [
            { text: 'A halmaz elemei: $2, 4, 6, 8, 10$.' },
            { text: 'A $12$ nem szerepel közöttük.' },
          ],
          answer: 'Nem, $12 \\notin \\{2, 4, 6, 8, 10\\}$.',
        },
        { type: 'practice', generator: 'element-of', level: 1, count: 2 },
        { type: 'practice', generator: 'element-of', level: 2 },
        { type: 'practice', generator: 'notation', level: 2 },
      ],
    },
    {
      title: 'Részhalmaz és egyenlőség',
      steps: [
        {
          type: 'theory',
          title: 'Részhalmaz',
          body: 'Az $A$ halmaz **részhalmaza** a $B$ halmaznak, ha $A$ minden eleme benne van $B$-ben. Jele: $A \\subset B$. Ha nem minden eleme van benne: $A \\not\\subset B$.',
          figure: subsetFig,
          remember: '$A \\subset B$: A minden eleme B-ben is benne van',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$\\{2, 4\\} \\subset \\{1, 2, 3, 4\\}$',
            answer: { type: 'truefalse', value: true },
            hint: 'A 2 és a 4 is benne van a nagyobb halmazban?',
            solution: ['A $2$ és a $4$ is szerepel a $\\{1, 2, 3, 4\\}$ halmazban.', 'Tehát $\\{2, 4\\}$ részhalmaza a nagyobb halmaznak — az állítás **igaz**.'],
          },
        },
        {
          type: 'theory',
          title: 'Halmazok egyenlősége',
          body: 'Két halmaz egyenlő, ha ugyanazok az elemei, akár más sorrendben írjuk őket. Minden halmaz részhalmaza önmagának, és az üres halmaz minden halmaznak részhalmaza.',
          remember: '$\\{1, 2, 3\\} = \\{3, 1, 2\\}$ · $\\emptyset \\subset A$',
        },
        {
          type: 'example',
          title: 'Hány részhalmaz?',
          problem: 'Hány részhalmaza van a $\\{2, 5, 9\\}$ halmaznak?',
          steps: [
            { text: 'Az üres halmaz: $\\emptyset$.' },
            { text: 'Egyeleműek: $\\{2\\}, \\{5\\}, \\{9\\}$.' },
            { text: 'Kételeműek: $\\{2, 5\\}, \\{2, 9\\}, \\{5, 9\\}$.' },
            { text: 'Háromelemű: $\\{2, 5, 9\\}$.' },
            { text: 'Összesen $1 + 3 + 3 + 1 = 8$.' },
          ],
          answer: 'A halmaznak **8** részhalmaza van.',
        },
        { type: 'practice', generator: 'subset-eq', level: 1, count: 2 },
        { type: 'practice', generator: 'subsets', level: 2 },
        { type: 'practice', generator: 'subset-eq', level: 2 },
      ],
    },
    {
      title: 'Rendezés és gyakorlás',
      steps: [
        {
          type: 'theory',
          title: 'A számok összehasonlítása',
          body: 'Két természetes szám közül az a nagyobb, amelyiknek több számjegye van. Ha ugyanannyi számjegyűek, az első eltérő számjegy dönt. A számegyenesen a nagyobb szám jobbra van.',
          remember: '$348 < 351$, mert a tízesek helyén $4 < 5$',
        },
        {
          type: 'example',
          title: 'Rendezés',
          problem: 'Rendezd növekvő sorrendbe: $706, 67, 760, 670$.',
          steps: [
            { text: 'A legkevesebb számjegyű a $67$ — ez a legkisebb.' },
            { text: 'A többi háromjegyű; a százasok: $6, 6, 7$.' },
            { text: 'A $670 < 706 < 760$.' },
          ],
          answer: 'A sorrend: **67, 670, 706, 760**.',
        },
        { type: 'practice', generator: 'order', level: 2 },
        { type: 'practice', generator: 'compare', level: 2 },
        { type: 'practice', generator: 'neighbour', level: 2 },
        { type: 'practice', generator: 'numberline-point', level: 2 },
        { type: 'practice', generator: 'subsets', level: 3 },
        { type: 'practice', generator: 'count-elements', level: 2 },
      ],
    },
  ],
  generators: [elementOf, notation, countElements, subsets, subsetEq, compare, order, neighbour, numberLinePoint, defineByProperty],
  miniTest: {
    items: [
      { generator: 'element-of', level: 1 },
      { generator: 'notation', level: 2 },
      { generator: 'count-elements', level: 2 },
      { generator: 'subset-eq', level: 1 },
      { generator: 'compare', level: 2 },
      { generator: 'order', level: 2 },
      { generator: 'subsets', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'element-of', level: 1 },
    { generator: 'notation', level: 1 },
    { generator: 'count-elements', level: 1 },
    { generator: 'subset-eq', level: 1 },
    { generator: 'neighbour', level: 1 },
    { generator: 'compare', level: 1 },
    { generator: 'numberline-point', level: 1 },
  ],
});
