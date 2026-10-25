/**
 * 7. osztály › Valós számok › 4. A valós szám közelítő értéke
 *
 * Approximate values, absolute error, the rounding rule (choose the smaller error), estimating
 * roots with a calculator, and lower/upper bounds shown on a number line.
 */
import {
  article,
  choice,
  clean,
  defineSubtopic,
  num,
  round,
  suffix,
  tex,
  textChoice,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

const PLACE = ['első', 'második', 'harmadik', 'negyedik'];
const COUNT_WORD = ['', 'egy', 'két', 'három'];

/** "2,64" with exactly p decimals. */
const fixed = (x: number, p: number) => num(x, p, true);

/** An interval pair like "[2,64; 2,65]". */
const pairText = (a: number, b: number, p: number) => `$[${fixed(a, p)};\\ ${fixed(b, p)}]$`;

/** A number with p+1 decimals: the raw value used in the rounding exercises. */
function withExtraDecimal(rng: { int: (a: number, b: number) => number }, p: number): number {
  const scale = 10 ** (p + 1);
  for (;;) {
    const raw = rng.int(scale + 5, 10 * scale - 11);
    if (raw % 10 !== 0) return raw / scale;
  }
}

/** floor(√n · 10^p) computed with integers, so the bounds never drift because of floats. */
function lowerScaled(n: number, p: number): number {
  const target = n * 10 ** (2 * p);
  let k = Math.floor(Math.sqrt(target));
  while ((k + 1) * (k + 1) <= target) k++;
  while (k * k > target) k--;
  return k;
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Round a decimal to p decimals. L1: 1 decimal, L2: 2, L3: 3. */
const roundDecimal: GeneratorDef = {
  id: 'round-decimal',
  title: 'Tizedes tört kerekítése',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const p = level;
    const x = withExtraDecimal(rng, p);
    const rounded = round(x, p);
    const xInt = Math.round(x * 10 ** (p + 1));
    const dropped = xInt % 10;
    return {
      prompt: tex`Kerekítsd ${COUNT_WORD[p]} tizedesjegyre! $${num(x)}$`,
      answer: { type: 'number', value: rounded, precision: p },
      inputLabel: '$\\approx$',
      hint: 'A kerekítésnél a következő tizedesjegy dönt: ha 5 vagy nagyobb, felfelé kerekítünk.',
      solution: [
        tex`A ${PLACE[p]} tizedesjegy: $${num(dropped)}$.`,
        dropped >= 5
          ? tex`Mivel $${num(dropped)} \ge 5$, felfelé kerekítünk.`
          : tex`Mivel $${num(dropped)} < 5$, lefelé kerekítünk.`,
        tex`$${num(x)} \approx ${num(rounded, p, true)}$`,
        tex`Az eredmény **${fixed(rounded, p)}**.`,
      ],
    };
  },
};

/** Round √n to 2 (L2) or 3 (L3) decimals. */
const roundRoot: GeneratorDef = {
  id: 'round-root',
  title: 'Négyzetgyök közelítő értéke',
  levels: [2, 3],
  generate(rng, level): Question {
    const p = level === 2 ? 2 : 3;
    let n: number;
    do {
      n = level === 2 ? rng.int(2, 40) : rng.int(2, 100);
    } while (Math.round(Math.sqrt(n)) ** 2 === n);
    const root = Math.sqrt(n);
    const rounded = round(root, p);
    return {
      prompt: tex`Számítsd ki a $\sqrt{${num(n)}}$ közelítő értékét ${COUNT_WORD[p]} tizedesjegyre!`,
      answer: { type: 'number', value: rounded, precision: p },
      inputLabel: '$\\approx$',
      hint: 'A számológép megadja a gyököt; utána a kért tizedesjegyre kerekíts!',
      solution: [
        tex`$\sqrt{${num(n)}} = ${num(root, 5)}\ldots$`,
        tex`${COUNT_WORD[p].charAt(0).toUpperCase() + COUNT_WORD[p].slice(1)} tizedesjegyre: $${fixed(rounded, p)}$.`,
        tex`Az eredmény **${fixed(rounded, p)}**.`,
      ],
    };
  },
};

/** Absolute error between an exact value and an approximation. L1: 2 decimals, L2: 3 decimals. */
const absError: GeneratorDef = {
  id: 'abs-error',
  title: 'Abszolút hiba kiszámítása',
  levels: [1, 2],
  generate(rng, level): Question {
    const p = level; // exact value has p+1 decimals, approximation has p
    const x = withExtraDecimal(rng, p);
    const xInt = Math.round(x * 10 ** (p + 1));
    const approxInt = Math.round(xInt / 10) * 10;
    const error = Math.abs(xInt - approxInt) / 10 ** (p + 1);
    const diff = (xInt - approxInt) / 10 ** (p + 1);
    const approx = approxInt / 10 ** (p + 1);
    return {
      prompt: tex`A pontos érték $${num(x)}$, a közelítő érték $${num(approx)}$. Mennyi az abszolút hiba?`,
      answer: { type: 'number', value: error },
      inputLabel: '$|x - x\'| =$',
      hint: 'Az abszolút hiba a pontos és a közelítő érték különbségének abszolút értéke.',
      solution: [
        tex`$|x - x'| = |${num(x)} - ${num(approx)}|$`,
        tex`$= |${num(diff, p + 1, true)}| = ${num(error, p + 1, true)}$`,
        tex`Az abszolút hiba **${num(error, p + 1, true)}**.`,
      ],
    };
  },
};

/** Which of two approximations has the smaller absolute error? */
const betterApprox: GeneratorDef = {
  id: 'better-approx',
  title: 'Melyik a jobb közelítés?',
  levels: [1, 2],
  generate(rng, level): Question {
    const p = level; // x has p+1 decimals; approximations have p
    let x = withExtraDecimal(rng, p);
    let xInt = Math.round(x * 10 ** (p + 1));
    while (xInt % 10 === 5) {
      x = withExtraDecimal(rng, p);
      xInt = Math.round(x * 10 ** (p + 1));
    }
    const unit = 10 ** -(p + 1);
    const lowerInt = Math.floor(xInt / 10) * 10;
    const lower = lowerInt / 10 ** (p + 1);
    const upper = (lowerInt + 10) / 10 ** (p + 1);
    const errLower = (xInt - lowerInt) * unit;
    const errUpper = (lowerInt + 10 - xInt) * unit;
    const better = errLower < errUpper ? lower : upper;
    const worse = errLower < errUpper ? upper : lower;
    const betterErr = errLower < errUpper ? errLower : errUpper;
    const worseErr = errLower < errUpper ? errUpper : errLower;
    return {
      prompt: tex`Melyik jobb közelítése ${article(x)} $${num(x)}$-${suffix(x, 'nak', 'nek')}: $${fixed(lower, p)}$ vagy $${fixed(upper, p)}$?`,
      answer: textChoice(`$${fixed(better, p)}$`, [`$${fixed(worse, p)}$`, 'egyformák']),
      hint: 'Számítsd ki mindkét közelítés abszolút hibáját, és hasonlítsd össze!',
      solution: [
        tex`$|${num(x)} - ${fixed(lower, p)}| = ${num(errLower, p + 1, true)}$`,
        tex`$|${num(x)} - ${fixed(upper, p)}| = ${num(errUpper, p + 1, true)}$`,
        tex`A $${fixed(better, p)}$ közelítés hibája kisebb: **${num(betterErr, p + 1, true)}** < ${num(worseErr, p + 1, true)}.`,
        tex`A jobb közelítés: **${fixed(better, p)}**.`,
      ],
    };
  },
};

/** Lower and upper approximation to 2 (L2) or 3 (L3) decimals, as a multiple choice pair. */
const bounds: GeneratorDef = {
  id: 'bounds',
  title: 'Alsó és felső közelítés',
  levels: [2, 3],
  generate(rng, level): Question {
    const p = level === 2 ? 2 : 3;
    let n: number;
    do {
      n = level === 2 ? rng.int(2, 80) : rng.int(2, 120);
    } while (Math.round(Math.sqrt(n)) ** 2 === n);
    const root = Math.sqrt(n);
    const scale = 10 ** p;
    const lowerInt = lowerScaled(n, p);
    const lower = lowerInt / scale;
    const upper = (lowerInt + 1) / scale;
    const step = 1 / scale;
    const correct = pairText(lower, upper, p);
    return {
      prompt: tex`Melyik a $\sqrt{${num(n)}}$ alsó és felső közelítése ${COUNT_WORD[p]} tizedesjegyre?`,
      answer: choice(rng, correct, [
        pairText(clean(lower - step), clean(upper - step), p),
        pairText(clean(lower + step), clean(upper + step), p),
        pairText(lower, clean(upper + step), p),
      ]),
      hint: 'Az alsó közelítés kisebb, a felső nagyobb a pontos értéknél; a különbségük egy egység az utolsó tizedesjegyen.',
      solution: [
        tex`$${num(root, p + 3)}\ldots$ a gyök értéke.`,
        tex`Ezért $${fixed(lower, p)} < \sqrt{${num(n)}} < ${fixed(upper, p)}$.`,
        tex`A helyes pár: **${correct}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-04',
  goals: [
    'megérteni a közelítő érték és az abszolút hiba fogalmát,',
    'tizedes törteket és négyzetgyököket kerekíteni,',
    'kiszámítani az abszolút hibát,',
    'kiválasztani a jobb közelítést és felírni alsó-felső közelítést.',
  ],
  parts: [
    {
      title: 'Közelítő érték és hiba',
      steps: [
        {
          type: 'theory',
          title: 'Pontos és közelítő érték',
          body: 'A pontos érték helyett sokszor közelítő értéket használunk. Az abszolút hiba: $|x - x\'|$, ahol $x$ a pontos, $x\'$ a közelítő érték.',
          remember: "$|x - x'|$ = abszolút hiba",
        },
        {
          type: 'example',
          title: 'Abszolút hiba',
          problem: 'A pontos érték $3,47$, a közelítő érték $3,5$. Mennyi az abszolút hiba?',
          steps: [
            { text: "$|3,47 - 3,5| = |-0,03|$" },
            { text: '$= 0,03$' },
          ],
          answer: 'Az abszolút hiba $0,03$.',
        },
        { type: 'practice', generator: 'abs-error', level: 1, count: 2 },
        {
          type: 'theory',
          title: 'Alsó és felső közelítés',
          body: 'Az alsó közelítés kisebb, a felső nagyobb a pontos értéknél. A $3,47$ alsó közelítése egy tizedesjegyre $3,4$, a felső $3,5$.',
          figure: {
            type: 'numberLine',
            min: 3.3,
            max: 3.6,
            step: 0.1,
            subdivisions: 10,
            points: [{ value: 3.47, label: 'x', color: 'highlight' }],
            intervals: [{ from: 3.4, to: 3.5 }],
          },
          remember: '$3,4 < 3,47 < 3,5$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik a $\\sqrt{7}$ alsó közelítése két tizedesjegyre?',
            answer: textChoice('$2,64$', ['$2,65$', '$2,6$', '$2,7$']),
            hint: 'Az alsó közelítés kisebb a gyök értékénél, de a lehető legközelebb van hozzá.',
            solution: ['$\\sqrt{7} = 2,64575\\ldots$, ezért az alsó közelítés $2,64$, a felső $2,65$.'],
          },
        },
        { type: 'practice', generator: 'bounds', level: 2 },
      ],
    },
    {
      title: 'Kerekítés',
      steps: [
        {
          type: 'theory',
          title: 'A kerekítés szabálya',
          body: 'A kerekítésnél a következő tizedesjegy dönt: ha $5$ vagy nagyobb, felfelé, ha kisebb, lefelé kerekítünk. A kisebb hibájú közelítést választjuk.',
          remember: '0–4 lefelé, 5–9 felfelé',
        },
        {
          type: 'example',
          title: 'Kerekítés két tizedesjegyre',
          problem: 'Kerekítsd $2,836$-ot két tizedesjegyre!',
          steps: [
            { text: 'A harmadik tizedesjegy a $6$.' },
            { text: 'Mivel $6 \\ge 5$, felfelé kerekítünk.' },
          ],
          answer: '$2,836 \\approx 2,84$',
        },
        { type: 'practice', generator: 'round-decimal', level: 1, count: 2 },
        { type: 'practice', generator: 'round-decimal', level: 2, count: 2 },
        { type: 'practice', generator: 'round-decimal', level: 3 },
      ],
    },
    {
      title: 'Gyökök közelítése',
      steps: [
        {
          type: 'theory',
          title: 'Gyök közelítése számológéppel',
          body: 'A $\\sqrt{7}$ értéke $2,64575\\ldots$ A számológép segít; két tizedesjegyre $2,65$.',
          remember: '$\\sqrt{7} \\approx 2,65$',
        },
        {
          type: 'example',
          title: 'Gyök közelítése',
          problem: 'Számítsd ki a $\\sqrt{20}$ közelítő értékét két tizedesjegyre!',
          steps: [
            { text: '$\\sqrt{20} = 4,47213\\ldots$' },
            { text: 'A harmadik tizedesjegy $2$, ezért lefelé: $4,47$.' },
          ],
          answer: '$\\sqrt{20} \\approx 4,47$',
        },
        { type: 'practice', generator: 'round-root', level: 2, count: 2 },
        { type: 'practice', generator: 'round-root', level: 3 },
        { type: 'practice', generator: 'bounds', level: 3 },
      ],
    },
    {
      title: 'Melyik a jobb közelítés?',
      steps: [
        {
          type: 'theory',
          title: 'A kisebb hiba nyer',
          body: 'Két közelítés közül az a jobb, amelyiknek kisebb az abszolút hibája. A $2,836$ számnál a $2,84$ hibája $0,004$, a $2,83$ hibája $0,006$.',
          remember: 'Kisebb $|x - x\'|$ → jobb közelítés',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik jobb közelítése a $2,836$-nak: $2,84$ vagy $2,83$?',
            answer: textChoice('$2,84$', ['$2,83$', 'egyformák']),
            hint: 'Számítsd ki mindkét abszolút hibát!',
            solution: ['$|2,836 - 2,84| = 0,004$', '$|2,836 - 2,83| = 0,006$', 'A kisebb hiba miatt a $2,84$ a jobb közelítés.'],
          },
        },
        {
          type: 'example',
          title: 'Melyik jobb?',
          problem: 'Melyik jobb közelítése a $5,278$-nak: $5,28$ vagy $5,27$?',
          steps: [
            { text: '$|5,278 - 5,28| = 0,002$' },
            { text: '$|5,278 - 5,27| = 0,008$' },
          ],
          answer: 'Az $5,28$ a jobb közelítés.',
        },
        { type: 'practice', generator: 'better-approx', level: 1, count: 2 },
        { type: 'practice', generator: 'better-approx', level: 2 },
        { type: 'practice', generator: 'abs-error', level: 2 },
      ],
    },
  ],
  generators: [roundDecimal, roundRoot, absError, betterApprox, bounds],
  miniTest: {
    items: [
      { generator: 'round-decimal', level: 1 },
      { generator: 'round-decimal', level: 2 },
      { generator: 'round-root', level: 2 },
      { generator: 'abs-error', level: 1 },
      { generator: 'better-approx', level: 1 },
      { generator: 'bounds', level: 2 },
      { generator: 'round-decimal', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'round-decimal', level: 1 },
    { generator: 'round-decimal', level: 2 },
    { generator: 'round-root', level: 2 },
    { generator: 'abs-error', level: 1 },
    { generator: 'better-approx', level: 2 },
    { generator: 'bounds', level: 2 },
  ],
});
