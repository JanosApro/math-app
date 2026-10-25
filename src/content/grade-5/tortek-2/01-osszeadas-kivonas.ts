/**
 * 5. osztály › Törtek – második rész › 1. Törtek összeadása és kivonása
 *
 * GOLD-STANDARD EXAMPLE (non-geometry): fraction and decimal answers, typical-mistake
 * distractors, mixed numbers, word problems. Same structure as the grade 7 Pythagoras lesson:
 *   1. helpers  2. generators  3. lesson steps  4. mini test + daily pool
 */
import {
  choice,
  clean,
  defineSubtopic,
  gcd,
  lcm,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** LaTeX fraction without simplifying: f(6, 8) → \frac{6}{8}. Whole numbers stay whole if `den` is 1. */
const f = (n: number, d: number) => (d === 1 ? num(n) : tex`\frac{${num(n)}}{${num(d)}}`);

/** Mixed-number LaTeX for an improper fraction: 7/4 → 1\frac{3}{4}. Proper fractions unchanged. */
function mixed(n: number, d: number): string {
  if (n % d === 0) return num(n / d);
  if (n < d) return f(n, d);
  return tex`${num(Math.floor(n / d))}\frac{${num(n % d)}}{${num(d)}}`;
}

/**
 * The tail of a solution line after the raw result n/d: simplification and mixed form.
 *   tail(6, 9) → " = \frac{2}{3}"   tail(9, 6) → " = \frac{3}{2} = 1\frac{1}{2}"   tail(5, 7) → ""
 */
function tail(n: number, d: number): string {
  let out = '';
  const g = gcd(n, d);
  const [sn, sd] = [n / g, d / g];
  if (g > 1) out += ` = ${f(sn, sd)}`;
  if (sd !== 1 && sn > sd) out += ` = ${mixed(sn, sd)}`;
  return out;
}

/** Simplified result as [num, den]. */
const reduce = (n: number, d: number): [number, number] => {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};

/** Plain-text fraction for figure labels: '3/8'. */
const ft = (n: number, d: number) => `${n}/${d}`;

/** Expansion step: \frac{1}{2} = \frac{1·3}{2·3} = \frac{3}{6}  (or just the fraction if k = 1). */
function expand(n: number, d: number, to: number): string {
  const k = to / d;
  if (k === 1) return f(n, d);
  return tex`${f(n, d)} = \frac{${num(n)} \cdot ${num(k)}}{${num(d)} \cdot ${num(k)}} = ${f(n * k, to)}`;
}

/** A proper fraction n/d with 1 ≤ n < d. */
function proper(rng: Rng, d: number): number {
  return rng.int(1, d - 1);
}

/** Fraction answer; the student must simplify unless `allowUnsimplified`. */
function fracAnswer(n: number, d: number, allowUnsimplified = false, unit?: string) {
  return { type: 'fraction' as const, num: n, den: d, requireSimplified: !allowUnsimplified, unit };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Same denominator: add/subtract the numerators. L1 small, may skip simplifying; L2 must simplify. */
const sameDen: GeneratorDef = {
  id: 'same-den',
  title: 'Azonos nevezőjű törtek összeadása, kivonása',
  levels: [1, 2],
  generate(rng, level): Question {
    const d = level === 1 ? rng.int(3, 10) : rng.pick([4, 6, 8, 9, 10, 12]);
    const add = rng.chance(level === 1 ? 0.65 : 0.5);
    let a: number;
    let b: number;
    for (;;) {
      a = proper(rng, d);
      b = proper(rng, d);
      if (add && level === 1 && a + b > d) continue; // L1: result at most 1 whole
      if (!add && a <= b) continue; // positive result
      if (level === 2 && gcd(add ? a + b : a - b, d) === 1) continue; // L2: needs simplifying
      break;
    }
    const n = add ? a + b : a - b;
    const [rn, rd] = reduce(n, d);
    const op = add ? '+' : '-';
    const figure: Figure | undefined =
      add && n <= d
        ? {
            type: 'barModel',
            rows: [
              {
                segments: [
                  { value: a, label: ft(a, d), color: 'blue' },
                  { value: b, label: ft(b, d), color: 'red' },
                  ...(n < d ? [{ value: d - n, color: 'muted' as const }] : []),
                ],
              },
            ],
            total: { label: '1 egész' },
          }
        : undefined;
    return {
      prompt: tex`Számítsd ki! $${f(a, d)} ${op} ${f(b, d)}$`,
      figure,
      answer: fracAnswer(n, d, level === 1),
      hint: add
        ? 'Azonos a nevező: csak a számlálókat adod össze, a nevező marad.'
        : 'Azonos a nevező: a számlálókat vonod ki egymásból, a nevező marad.',
      solution: [
        tex`A nevezők egyenlők ($${num(d)}$), ezért a számlálókat ${add ? 'adjuk össze' : 'vonjuk ki'}, a nevező marad.`,
        tex`$${f(a, d)} ${op} ${f(b, d)} = \frac{${num(a)} ${op} ${num(b)}}{${num(d)}} = ${f(n, d)}${tail(n, d)}$`,
        ...(gcd(n, d) > 1 ? [tex`Egyszerűsítettünk $${num(gcd(n, d))}$-vel.`] : []),
        tex`Az eredmény: **$${f(rn, rd)}$**.`,
      ],
    };
  },
};

/** Which common denominator? (multiple choice with typical wrong ideas) */
const commonDen: GeneratorDef = {
  id: 'common-den',
  title: 'A legkisebb közös nevező megtalálása',
  levels: [1, 2],
  generate(rng, level): Question {
    let b: number;
    let d: number;
    if (level === 1) {
      b = rng.pick([2, 3, 4, 5, 6]);
      d = b * rng.int(2, 3);
    } else {
      const pairs: [number, number][] = [
        [4, 6],
        [6, 8],
        [6, 9],
        [4, 10],
        [8, 12],
        [9, 12],
        [10, 15],
        [6, 10],
        [3, 4],
        [5, 6],
        [3, 8],
      ];
      [b, d] = rng.shuffle(rng.pick(pairs));
    }
    const a = proper(rng, b);
    const c = proper(rng, d);
    const L = lcm(b, d);
    return {
      prompt: tex`Mi a(z) $${f(a, b)}$ és a(z) $${f(c, d)}$ **legkisebb** közös nevezője?`,
      answer: choice(rng, L, [b * d, b + d, Math.max(b, d), 2 * L], { fallback: (r) => L * r.int(3, 4) }),
      hint: 'A közös nevező mindkét nevezőnek többszöröse. A legkisebb ilyen szám a nevezők legkisebb közös többszöröse.',
      solution: [
        tex`A közös nevezőnek a(z) $${num(b)}$-${suffix(b, 'nak', 'nek')} és a(z) $${num(d)}$-${suffix(d, 'nak', 'nek')} is többszörösének kell lennie.`,
        tex`$${num(b)}$ többszörösei: ${[1, 2, 3, 4, 5, 6].map((k) => `$${num(b * k)}$`).join(', ')}, …`,
        tex`$${num(d)}$ többszörösei: ${[1, 2, 3, 4].map((k) => `$${num(d * k)}$`).join(', ')}, …`,
        tex`A legkisebb közös többszörös: **$${num(L)}$**.${b * d !== L ? tex` (${Article(num(b * d))} $${num(b * d)}$ is közös nevező, de nem a legkisebb.)` : ''}`,
      ],
    };
  },
};

/** Different denominators. L1: one is a multiple of the other; L2: LKKT needed; L3: three fractions. */
const diffDen: GeneratorDef = {
  id: 'diff-den',
  title: 'Különböző nevezőjű törtek összeadása, kivonása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) return threeFractions(rng);
    let b: number;
    let d: number;
    if (level === 1) {
      b = rng.pick([2, 3, 4, 5]);
      d = b * rng.int(2, 3);
      if (rng.chance(0.5)) [b, d] = [d, b];
    } else {
      [b, d] = rng.shuffle(
        rng.pick([
          [2, 3],
          [3, 4],
          [2, 5],
          [4, 6],
          [6, 8],
          [3, 5],
          [4, 10],
          [6, 9],
          [5, 6],
          [3, 8],
          [8, 12],
          [4, 5],
        ] as [number, number][]),
      );
    }
    const L = lcm(b, d);
    const add = rng.chance(0.55);
    let a: number;
    let c: number;
    for (;;) {
      a = proper(rng, b);
      c = proper(rng, d);
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue; // start from simplified fractions
      if (!add && a * (L / b) <= c * (L / d)) continue;
      break;
    }
    const A = a * (L / b);
    const C = c * (L / d);
    const n = add ? A + C : A - C;
    const op = add ? '+' : '-';
    const [rn, rd] = reduce(n, L);
    return {
      prompt: tex`Számítsd ki, és add meg a legegyszerűbb alakban! $${f(a, b)} ${op} ${f(c, d)}$`,
      answer: fracAnswer(n, L),
      hint: tex`Először hozd közös nevezőre a két törtet! A legkisebb közös nevező: a(z) $${num(b)}$ és $${num(d)}$ legkisebb közös többszöröse.`,
      solution: [
        tex`A legkisebb közös nevező: $[${num(b)};\ ${num(d)}] = ${num(L)}$.`,
        tex`Bővítjük a törteket: $${expand(a, b, L)}$ és $${expand(c, d, L)}$.`,
        tex`$${f(A, L)} ${op} ${f(C, L)} = ${f(n, L)}${tail(n, L)}$`,
        tex`Az eredmény: **$${f(rn, rd)}$**${rn > rd && rd !== 1 ? tex` $\left(= ${mixed(rn, rd)}\right)$` : ''}.`,
      ],
    };
  },
};

function threeFractions(rng: Rng): Question {
  const den = rng.pick([
    [2, 3, 6],
    [2, 4, 8],
    [3, 4, 12],
    [2, 5, 10],
    [3, 6, 4],
    [2, 3, 4],
    [4, 6, 12],
  ] as [number, number, number][]);
  const [b, d, h] = rng.shuffle(den);
  const L = lcm(lcm(b, d), h);
  for (;;) {
    const a = proper(rng, b);
    const c = proper(rng, d);
    const e = proper(rng, h);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || gcd(e, h) !== 1) continue;
    const A = a * (L / b);
    const C = c * (L / d);
    const E = e * (L / h);
    const n = A + C - E;
    if (n <= 0) continue;
    const [rn, rd] = reduce(n, L);
    return {
      prompt: tex`Számítsd ki, és add meg a legegyszerűbb alakban! $${f(a, b)} + ${f(c, d)} - ${f(e, h)}$`,
      answer: fracAnswer(n, L),
      hint: 'Mindhárom törtet ugyanarra a nevezőre kell hozni: keresd meg a három nevező legkisebb közös többszörösét!',
      solution: [
        tex`A legkisebb közös nevező: $[${num(b)};\ ${num(d)};\ ${num(h)}] = ${num(L)}$.`,
        tex`$${f(a, b)} + ${f(c, d)} - ${f(e, h)} = ${f(A, L)} + ${f(C, L)} - ${f(E, L)}$`,
        tex`$= \frac{${num(A)} + ${num(C)} - ${num(E)}}{${num(L)}} = ${f(n, L)}${tail(n, L)}$`,
        tex`Az eredmény: **$${f(rn, rd)}$**.`,
      ],
    };
  }
}

/** Whole numbers and mixed numbers. L1: whole ± fraction; L2: mixed numbers, same denominator; L3: different denominators / borrowing. */
const mixedNumbers: GeneratorDef = {
  id: 'mixed',
  title: 'Vegyes számok, egész ± tört',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const d = rng.int(3, 10);
      let a = proper(rng, d);
      while (gcd(a, d) !== 1) a = proper(rng, d);
      const w = rng.int(1, 4);
      const add = rng.chance(0.4);
      const n = add ? w * d + a : w * d - a;
      return {
        prompt: tex`Számítsd ki! $${num(w)} ${add ? '+' : '-'} ${f(a, d)}$`,
        answer: { type: 'fraction', num: n, den: d, requireSimplified: true },
        hint: add
          ? 'Egy egész szám és egy tört összege vegyes szám: az egészek mellé odaírjuk a törtet.'
          : tex`Írd fel az egészeket törtként: $1 = ${f(d, d)}$.`,
        solution: add
          ? [tex`$${num(w)} + ${f(a, d)} = ${mixed(n, d)}$`, tex`Törtként: $${f(n, d)}$. Mindkét alak helyes: **$${mixed(n, d)}$**.`]
          : [
              tex`Írjuk fel az egészeket $${num(d)}$ nevezővel: $${num(w)} = ${f(w * d, d)}$.`,
              tex`$${f(w * d, d)} - ${f(a, d)} = ${f(n, d)}${tail(n, d)}$`,
              tex`Az eredmény: **$${mixed(...reduce(n, d))}$**.`,
            ],
      };
    }
    // L2: same denominator; L3: different denominators
    const d1 = level === 2 ? rng.int(3, 9) : rng.pick([2, 3, 4, 6]);
    const d2 = level === 2 ? d1 : rng.pick([3, 4, 5, 6, 8].filter((x) => x !== d1));
    const L = lcm(d1, d2);
    for (;;) {
      const w1 = rng.int(1, 5);
      const w2 = rng.int(1, 4);
      const a = proper(rng, d1);
      const c = proper(rng, d2);
      if (gcd(a, d1) !== 1 || gcd(c, d2) !== 1) continue;
      const add = rng.chance(0.5);
      const N1 = (w1 * d1 + a) * (L / d1); // first as improper with denominator L
      const N2 = (w2 * d2 + c) * (L / d2);
      const n = add ? N1 + N2 : N1 - N2;
      if (n <= 0) continue;
      if (level === 3 && !add && a * (L / d1) >= c * (L / d2) && rng.chance(0.7)) continue; // prefer "borrowing" cases
      const op = add ? '+' : '-';
      const [rn, rd] = reduce(n, L);
      return {
        prompt: tex`Számítsd ki! $${mixed(w1 * d1 + a, d1)} ${op} ${mixed(w2 * d2 + c, d2)}$\n\nVegyes számként vagy törtként is megadhatod (pl. 2 1/3 vagy 7/3).`,
        answer: { type: 'fraction', num: n, den: L, requireSimplified: true },
        hint: 'Írd át a vegyes számokat törtekké (egész · nevező + számláló), hozd őket közös nevezőre, aztán számolj!',
        solution: [
          tex`Törtté alakítjuk: $${mixed(w1 * d1 + a, d1)} = ${f(w1 * d1 + a, d1)}$ és $${mixed(w2 * d2 + c, d2)} = ${f(w2 * d2 + c, d2)}$.`,
          ...(L !== d1 || L !== d2 ? [tex`Közös nevező: $${num(L)}$. $\;${f(w1 * d1 + a, d1)} = ${f(N1, L)}$, $\;${f(w2 * d2 + c, d2)} = ${f(N2, L)}$.`] : []),
          tex`$${f(N1, L)} ${op} ${f(N2, L)} = ${f(n, L)}${tail(n, L)}$`,
          tex`Az eredmény: **$${mixed(rn, rd)}$**.`,
        ],
      };
    }
  },
};

/** Adding/subtracting decimals (computed in whole hundredths/thousandths to avoid float noise). */
const decimals: GeneratorDef = {
  id: 'decimal',
  title: 'Tizedes törtek összeadása, kivonása',
  levels: [1, 2],
  generate(rng, level): Question {
    // values in hundredths (L1) or thousandths (L2)
    const scale = level === 1 ? 100 : 1000;
    const pick = () => {
      const places = level === 1 ? rng.pick([1, 2]) : rng.pick([1, 2, 3]);
      const step = scale / 10 ** places; // makes the value have exactly `places` decimals (or fewer)
      return rng.int(level === 1 ? 1 : 5, level === 1 ? 900 / step : 9000 / step) * step;
    };
    let x = pick();
    let y = pick();
    const add = rng.chance(0.5);
    if (level === 2 && !add && rng.chance(0.4)) x = rng.int(2, 9) * scale; // whole number minus decimal
    if (!add && x < y) [x, y] = [y, x];
    if (!add && x === y) x += scale;
    const r = add ? x + y : x - y;
    const X = clean(x / scale);
    const Y = clean(y / scale);
    const R = clean(r / scale);
    const op = add ? '+' : '-';
    const places = Math.max(...[X, Y].map((v) => (num(v).split(',')[1] ?? '').length));
    const pad = (v: number) => num(v, places, true);
    return {
      prompt: tex`Számítsd ki! $${num(X)} ${op} ${num(Y)}$`,
      answer: { type: 'number', value: R },
      hint: 'Írd a számokat egymás alá úgy, hogy a tizedesvesszők egymás alá kerüljenek! A hiányzó helyekre írhatsz 0-t.',
      solution: [
        tex`Tizedesvessző a tizedesvessző alá (a hiányzó helyiértékekre 0-t írunk):`,
        tex`$\begin{array}{r} ${pad(X)} \\ ${op}\,${pad(Y)} \\ \hline ${pad(R)} \end{array}$`,
        tex`Az eredmény: **$${num(R)}$**.`,
      ],
    };
  },
};

/** The classic mistake a/b + c/d = (a + c)/(b + d). L1: true/false, L2: pick the correct calculation. */
const mistake: GeneratorDef = {
  id: 'mistake',
  title: 'Tipikus hiba felismerése',
  levels: [1, 2],
  generate(rng, level): Question {
    const [b, d] = rng.shuffle(
      rng.pick([
        [2, 3],
        [3, 4],
        [2, 5],
        [4, 6],
        [3, 5],
        [2, 4],
        [5, 10],
      ] as [number, number][]),
    );
    const a = 1;
    const c = rng.pick([1, ...(d > 3 ? [d - 1] : [])]);
    const L = lcm(b, d);
    const n = a * (L / b) + c * (L / d);
    const [rn, rd] = reduce(n, L);
    const correct = tex`$${f(a, b)} + ${f(c, d)} = ${f(rn, rd)}$`;
    const wrongNumDen = tex`$${f(a, b)} + ${f(c, d)} = ${f(a + c, b + d)}$`;
    const wrongOnlyDen = tex`$${f(a, b)} + ${f(c, d)} = ${f(a + c, L)}$`;
    const wrongProduct = tex`$${f(a, b)} + ${f(c, d)} = ${f(a + c, b * d)}$`;
    if (level === 1) {
      const isRight = rng.chance(0.4);
      return {
        prompt: tex`Bence így számolt:\n\n${isRight ? correct : wrongNumDen}\n\nIgaz vagy hamis?`,
        answer: { type: 'truefalse', value: isRight },
        hint: 'A nevezőket nem adjuk össze! Előbb közös nevezőre hozunk.',
        solution: [
          tex`Közös nevező: $${num(L)}$. $\;${f(a, b)} = ${f(a * (L / b), L)}$, $\;${f(c, d)} = ${f(c * (L / d), L)}$.`,
          tex`$${f(a * (L / b), L)} + ${f(c * (L / d), L)} = ${f(n, L)}${tail(n, L)}$`,
          isRight ? 'Bence jól számolt: az állítás **igaz**.' : tex`Bence a számlálókat és a nevezőket is összeadta — ez hiba. Az állítás **hamis**, a helyes eredmény $${f(rn, rd)}$.`,
        ],
      };
    }
    return {
      prompt: 'Melyik számolás **helyes**?',
      answer: textChoice(correct, [wrongNumDen, wrongOnlyDen, wrongProduct]),
      hint: 'Hozd közös nevezőre a törteket, és csak a számlálókat add össze!',
      solution: [
        tex`Közös nevező: $${num(L)}$.`,
        tex`$${f(a, b)} + ${f(c, d)} = ${f(a * (L / b), L)} + ${f(c * (L / d), L)} = ${f(n, L)}${tail(n, L)}$`,
        'A rossz válaszokban a számlálókat a bővítés nélkül adták össze, vagy a nevezőket is összeadták.',
        tex`A helyes: **${correct}**.`,
      ],
    };
  },
};

/** "How much is missing?" — the unknown addend. */
const missingAddend: GeneratorDef = {
  id: 'missing',
  title: 'Hiányzó tag (mennyit kell hozzáadni?)',
  levels: [2],
  generate(rng): Question {
    const [b, d] = rng.shuffle(
      rng.pick([
        [2, 6],
        [3, 4],
        [4, 8],
        [3, 6],
        [2, 5],
        [4, 6],
        [5, 10],
        [3, 12],
      ] as [number, number][]),
    );
    const L = lcm(b, d);
    for (;;) {
      const a = proper(rng, b);
      const c = proper(rng, d);
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue;
      const A = a * (L / b);
      const C = c * (L / d);
      if (C <= A) continue;
      const n = C - A;
      const [rn, rd] = reduce(n, L);
      return {
        prompt: tex`Melyik tört hiányzik?\n\n$${f(a, b)} + \square = ${f(c, d)}$`,
        answer: fracAnswer(n, L),
        hint: 'A hiányzó tagot kivonással kapod: az összegből vond ki az ismert tagot!',
        solution: [
          tex`$\square = ${f(c, d)} - ${f(a, b)}$`,
          tex`Közös nevezőre hozva: $${f(C, L)} - ${f(A, L)} = ${f(n, L)}${tail(n, L)}$`,
          tex`Ellenőrzés: $${f(a, b)} + ${f(rn, rd)} = ${f(c, d)}$. ✓`,
          tex`A hiányzó tag: **$${f(rn, rd)}$**.`,
        ],
      };
    }
  },
};

/** Word problems: pizza (fractions of a whole), juice (litres), walking (mixed numbers), shopping (decimals). */
const wordProblems: GeneratorDef = {
  id: 'word',
  title: 'Szöveges feladatok',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['pizza', 'juice', 'walk', 'shop', 'ribbon'] as const);
    if (kind === 'pizza') {
      const d = rng.pick([6, 8, 10, 12]);
      const divisors = [2, 3, 4, 5, 6].filter((x) => d % x === 0 && x < d);
      for (;;) {
        const b1 = rng.pick([d, ...divisors]);
        const b2 = rng.pick([d, ...divisors]);
        const a1 = proper(rng, b1);
        const a2 = proper(rng, b2);
        if (gcd(a1, b1) !== 1 || gcd(a2, b2) !== 1) continue;
        const eaten = a1 * (d / b1) + a2 * (d / b2);
        if (eaten >= d) continue;
        const left = d - eaten;
        const [rn, rd] = reduce(left, d);
        return {
          prompt: tex`Egy pizzát ${num(d)} egyenlő szeletre vágtak. Anna megette a pizza $${f(a1, b1)}$ részét, Bence ${article(f(a2, b2))} $${f(a2, b2)}$ részét. A pizza hányad része maradt meg?`,
          answer: fracAnswer(left, d),
          hint: tex`Az egész pizza $1 = ${f(d, d)}$. Add össze, mennyit ettek meg, és vond ki az egészből!`,
          solution: [
            tex`Közös nevező: $${num(d)}$. Anna: $${expand(a1, b1, d)}$, Bence: $${expand(a2, b2, d)}$.`,
            tex`Megették: $${f(a1 * (d / b1), d)} + ${f(a2 * (d / b2), d)} = ${f(eaten, d)}$.`,
            tex`Maradt: $1 - ${f(eaten, d)} = ${f(d, d)} - ${f(eaten, d)} = ${f(left, d)}${tail(left, d)}$`,
            tex`A pizza **$${f(rn, rd)}$** része maradt meg.`,
          ],
        };
      }
    }
    if (kind === 'juice') {
      const [b, d] = rng.pick([
        [4, 3],
        [2, 5],
        [4, 6],
        [3, 4],
        [5, 2],
        [6, 4],
      ] as [number, number][]);
      const L = lcm(b, d);
      for (;;) {
        const a = proper(rng, b);
        const c = proper(rng, d);
        if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * (L / b) <= c * (L / d)) continue;
        const n = a * (L / b) - c * (L / d);
        const [rn, rd] = reduce(n, L);
        return {
          prompt: tex`Egy üvegben $${f(a, b)}$ liter üdítő volt. Megittunk belőle $${f(c, d)}$ litert. Hány liter üdítő maradt az üvegben?`,
          answer: fracAnswer(n, L, false, 'liter'),
          hint: 'Ami maradt = ami volt − amit megittunk. Hozd közös nevezőre a törteket!',
          solution: [
            tex`$${f(a, b)} - ${f(c, d)}$, közös nevező: $${num(L)}$.`,
            tex`$${f(a * (L / b), L)} - ${f(c * (L / d), L)} = ${f(n, L)}${tail(n, L)}$`,
            tex`Az üvegben **$${f(rn, rd)}$ liter** üdítő maradt.`,
          ],
        };
      }
    }
    if (kind === 'walk') {
      const d1 = rng.pick([2, 4]);
      const d2 = rng.pick([2, 4, 8].filter((x) => x !== d1));
      const L = lcm(d1, d2);
      for (;;) {
        const w1 = rng.int(1, 3);
        const w2 = rng.int(1, 3);
        const a = proper(rng, d1);
        const c = proper(rng, d2);
        if (gcd(a, d1) !== 1 || gcd(c, d2) !== 1) continue;
        const N1 = (w1 * d1 + a) * (L / d1);
        const N2 = (w2 * d2 + c) * (L / d2);
        const n = N1 + N2;
        const [rn, rd] = reduce(n, L);
        return {
          prompt: tex`Peti délelőtt $${mixed(w1 * d1 + a, d1)}$ km-t, délután $${mixed(w2 * d2 + c, d2)}$ km-t gyalogolt. Hány kilométert gyalogolt összesen?`,
          figure: {
            type: 'barModel',
            rows: [{ segments: [{ value: N1, label: 'délelőtt', color: 'blue' }, { value: N2, label: 'délután', color: 'green' }] }],
            total: { label: 'összesen = ?' },
          },
          answer: { type: 'fraction', num: n, den: L, requireSimplified: true, unit: 'km' },
          hint: 'Add össze külön az egészeket és külön a törtrészeket (közös nevezőn)!',
          solution: [
            tex`Egészek: $${num(w1)} + ${num(w2)} = ${num(w1 + w2)}$.`,
            tex`Törtrészek: $${f(a, d1)} + ${f(c, d2)} = ${f(a * (L / d1), L)} + ${f(c * (L / d2), L)} = ${f(a * (L / d1) + c * (L / d2), L)}${tail(a * (L / d1) + c * (L / d2), L)}$`,
            tex`Összesen: $${mixed(rn, rd)}$ km.`,
            tex`Peti **$${mixed(rn, rd)}$ km-t** gyalogolt.`,
          ],
        };
      }
    }
    if (kind === 'shop') {
      const x = rng.int(3, 25) * 5; // hundredths of kg (0,15 … 1,25)
      const y = rng.int(3, 25) * 5;
      const X = clean(x / 100);
      const Y = clean(y / 100);
      const R = clean((x + y) / 100);
      return {
        prompt: tex`Anya a piacon $${num(X)}$ kg almát és $${num(Y)}$ kg körtét vett. Hány kilogramm gyümölcsöt vett összesen?`,
        answer: { type: 'number', value: R, unit: 'kg' },
        hint: 'Írd egymás alá a számokat úgy, hogy a tizedesvesszők egymás alá kerüljenek!',
        solution: [tex`$${num(X, 2, true)} + ${num(Y, 2, true)} = ${num(R, 2, true)}$`, tex`Összesen **${num(R)} kg** gyümölcsöt vett.`],
      };
    }
    // ribbon: a length minus two pieces (decimals)
    const total = rng.int(25, 60) * 10; // centimetres
    const p1 = rng.int(3, 12) * 5;
    const p2 = rng.int(3, 12) * 5;
    const T = clean(total / 100);
    const P1 = clean(p1 / 100);
    const P2 = clean(p2 / 100);
    const R = clean((total - p1 - p2) / 100);
    return {
      prompt: tex`Kati szalagja $${num(T)}$ m hosszú. Levágott belőle $${num(P1)}$ m-t, majd még $${num(P2)}$ m-t. Hány méter szalag maradt?`,
      figure: {
        type: 'barModel',
        rows: [
          {
            segments: [
              { value: p1, label: `${num(P1)} m`, color: 'red' },
              { value: p2, label: `${num(P2)} m`, color: 'orange' },
              { value: total - p1 - p2, unknown: true },
            ],
          },
        ],
        total: { label: `${num(T)} m` },
      },
      answer: { type: 'number', value: R, unit: 'm' },
      hint: 'Vond ki a teljes hosszból mindkét levágott darabot (vagy előbb add össze a két darabot)!',
      solution: [
        tex`Levágott összesen: $${num(P1)} + ${num(P2)} = ${num(clean((p1 + p2) / 100))}$ m.`,
        tex`Maradt: $${num(T)} - ${num(clean((p1 + p2) / 100))} = ${num(R)}$ m.`,
        tex`**${num(R)} m** szalag maradt.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-tortek-2-01',
  goals: [
    'azonos és különböző nevezőjű törteket összeadni és kivonni,',
    'közös nevezőt keresni (legkisebb közös többszörös),',
    'vegyes számokkal számolni,',
    'tizedes törteket összeadni és kivonni.',
  ],
  parts: [
    {
      title: 'Azonos nevezőjű törtek',
      steps: [
        {
          type: 'theory',
          title: 'Azonos nevezőjű törtek',
          body: 'Anna $2$, Bence $3$ szeletet evett a $8$ szeletes pizzából: $\\frac{2}{8} + \\frac{3}{8} = \\frac{5}{8}$.\n\nAzonos nevezőnél a számlálókat adjuk össze, a nevező **nem változik**.',
          figure: { type: 'fractionModel', shape: 'circle', parts: 8, shaded: 5, label: '5/8' },
          remember: 'Összeadás: $\\frac{a}{n} + \\frac{b}{n} = \\frac{a + b}{n}$\nKivonás: $\\frac{a}{n} - \\frac{b}{n} = \\frac{a - b}{n}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$\\frac{2}{7} + \\frac{3}{7} = \\frac{5}{14}$',
            answer: { type: 'truefalse', value: false },
            hint: 'Mi történik a nevezővel, ha egyenlő nevezőjű törteket adunk össze?',
            solution: ['A nevezőket **nem** adjuk össze: a nevező marad $7$.', '$\\frac{2}{7} + \\frac{3}{7} = \\frac{5}{7}$, tehát az állítás hamis.'],
          },
        },
        {
          type: 'example',
          title: 'Összeadás, utána egyszerűsítés',
          problem: 'Számítsd ki! $\\frac{2}{9} + \\frac{4}{9}$',
          steps: [
            { text: '$\\frac{2}{9} + \\frac{4}{9} = \\frac{6}{9}$' },
            { text: 'Egyszerűsítünk $3$-mal: $\\frac{6}{9} = \\frac{2}{3}$' },
          ],
          answer: 'Az eredmény $\\frac{2}{3}$ — mindig egyszerűsíts!',
        },
        { type: 'practice', generator: 'same-den', level: 1, count: 2 },
        { type: 'practice', generator: 'same-den', level: 2 },
      ],
    },
    {
      title: 'Közös nevezőre hozás',
      steps: [
        {
          type: 'theory',
          title: 'Különböző nevezőjű törtek',
          body: 'A $\\frac{1}{2}$ és az $\\frac{1}{3}$ szeletei különböző méretűek. Előbb **közös nevezőre hozzuk** őket bővítéssel — a legjobb a **legkisebb közös többszörös** (LKKT).',
          figure: {
            type: 'barModel',
            rows: [
              { label: '1/2', segments: [{ value: 3, label: '3/6', color: 'blue' }, { value: 3, color: 'muted' }] },
              { label: '1/3', segments: [{ value: 2, label: '2/6', color: 'red' }, { value: 4, color: 'muted' }] },
            ],
          },
          remember: 'LKKT → bővítés → számlálók összeadása → egyszerűsítés',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mi a $\\frac{1}{4}$ és az $\\frac{1}{6}$ **legkisebb** közös nevezője?',
            answer: textChoice('$12$', ['$24$', '$10$', '$6$']),
            hint: 'Melyik a legkisebb szám, amely a $4$-nek és a $6$-nak is többszöröse?',
            solution: ['$4$ többszörösei: $4, 8, 12, 16, …$', '$6$ többszörösei: $6, 12, 18, …$', 'A legkisebb közös: $12$. (A $24$ is közös nevező, de nem a legkisebb.)'],
          },
        },
        {
          type: 'example',
          title: 'Különböző nevezők összeadása',
          problem: 'Számítsd ki! $\\frac{1}{2} + \\frac{1}{3}$',
          steps: [
            { text: 'A legkisebb közös nevező: $[2;\\ 3] = 6$.' },
            { text: 'Bővítünk: $\\frac{1}{2} = \\frac{3}{6}$ és $\\frac{1}{3} = \\frac{2}{6}$.' },
            { text: '$\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$' },
          ],
          answer: 'Az eredmény $\\frac{5}{6}$.',
        },
        { type: 'practice', generator: 'common-den', level: 1 },
        { type: 'practice', generator: 'diff-den', level: 1, count: 2 },
        { type: 'practice', generator: 'mistake', level: 1 },
      ],
    },
    {
      title: 'Kivonás és vegyes számok',
      steps: [
        {
          type: 'example',
          title: 'Különböző nevezők kivonása',
          problem: 'Számítsd ki! $\\frac{5}{6} - \\frac{1}{4}$',
          steps: [
            { text: 'A legkisebb közös nevező: $[6;\\ 4] = 12$.' },
            { text: 'Bővítünk: $\\frac{5}{6} = \\frac{10}{12}$ és $\\frac{1}{4} = \\frac{3}{12}$.' },
            { text: '$\\frac{10}{12} - \\frac{3}{12} = \\frac{7}{12}$ — ez már nem egyszerűsíthető.' },
          ],
          answer: 'Az eredmény $\\frac{7}{12}$.',
        },
        { type: 'practice', generator: 'diff-den', level: 2, count: 2 },
        {
          type: 'theory',
          title: 'Egész számok és vegyes számok',
          body: '**Egész ± tört:** $1 = \\frac{8}{8}$, így $1 - \\frac{3}{8} = \\frac{5}{8}$.\n\n**Vegyes szám:** törtté írjuk: $2\\frac{1}{3} = \\frac{7}{3}$.',
        },
        {
          type: 'example',
          title: 'Vegyes számok kivonása',
          problem: 'Számítsd ki! $3\\frac{1}{4} - 1\\frac{3}{4}$',
          steps: [
            { text: 'Törtté alakítjuk: $3\\frac{1}{4} = \\frac{13}{4}$ és $1\\frac{3}{4} = \\frac{7}{4}$.' },
            { text: '$\\frac{13}{4} - \\frac{7}{4} = \\frac{6}{4}$' },
            { text: 'Egyszerűsítünk: $\\frac{6}{4} = \\frac{3}{2} = 1\\frac{1}{2}$.' },
          ],
          answer: 'Az eredmény $1\\frac{1}{2}$. Beírva: **1 1/2**.',
        },
        { type: 'practice', generator: 'mixed', level: 1 },
        { type: 'practice', generator: 'mixed', level: 2 },
      ],
    },
    {
      title: 'Tizedes törtek',
      steps: [
        {
          type: 'theory',
          title: 'Tizedes törtek',
          body: 'A **tizedesvesszőt a tizedesvessző alá** írjuk; a hiányzó helyekre $0$ kerül.',
          remember: '$\\begin{array}{r} 2,35 \\\\ +\\,1,40 \\\\ \\hline 3,75 \\end{array}$',
        },
        {
          type: 'example',
          title: 'Kivonás egész számból',
          problem: 'Számítsd ki! $5 - 1,25$',
          steps: [
            { text: '$5$ helyett $5,00$-t írunk.' },
            { text: '$\\begin{array}{r} 5,00 \\\\ -\\,1,25 \\\\ \\hline 3,75 \\end{array}$' },
          ],
          answer: 'Az eredmény $3,75$.',
        },
        { type: 'practice', generator: 'decimal', level: 1, count: 2 },
        { type: 'practice', generator: 'decimal', level: 2 },
        { type: 'practice', generator: 'missing', level: 2 },
      ],
    },
    {
      title: 'Vegyes gyakorlás, szöveges feladatok',
      steps: [
        { type: 'practice', generator: 'mistake', level: 2 },
        { type: 'practice', generator: 'diff-den', level: 3 },
        { type: 'practice', generator: 'mixed', level: 3 },
        { type: 'practice', generator: 'word', level: 3, count: 2 },
      ],
    },
  ],
  generators: [sameDen, commonDen, diffDen, mixedNumbers, decimals, mistake, missingAddend, wordProblems],
  miniTest: {
    items: [
      { generator: 'same-den', level: 2 },
      { generator: 'diff-den', level: 1 },
      { generator: 'diff-den', level: 2 },
      { generator: 'mixed', level: 2 },
      { generator: 'decimal', level: 2 },
      { generator: 'mistake', level: 2 },
      { generator: 'word', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'same-den', level: 1 },
    { generator: 'common-den', level: 1 },
    { generator: 'diff-den', level: 1 },
    { generator: 'diff-den', level: 2 },
    { generator: 'mixed', level: 1 },
    { generator: 'decimal', level: 1 },
    { generator: 'missing', level: 2 },
  ],
});
