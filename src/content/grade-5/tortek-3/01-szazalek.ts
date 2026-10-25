/**
 * 5. osztály › Törtek – harmadik rész › 1. Százalék
 *
 * Percent as hundredths, conversions between fraction / decimal / percent, percent of a
 * quantity, discounts and price rises, the 10×10 grid and pie charts, and finding the whole
 * from a part and a percent (level 3 only).
 */
import {
  article,
  choice,
  clean,
  defineSubtopic,
  gcd,
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

/** A percentage as LaTeX: percentTex(25) → "25\%". */
const percentTex = (p: number) => tex`${num(p)}\%`;

/** A fraction as LaTeX; integers stay whole. */
const f = (n: number, d: number) => (d === 1 ? num(n) : tex`\frac{${num(n)}}{${num(d)}}`);

/** p% of a quantity, exact (the result has at most two decimals for integer quantities). */
const percentOf = (q: number, p: number) => clean((q * p) / 100);

/** The percentage p is a special eighth (12,5%, 37,5%, …). */
const EIGHTHS: Record<number, [number, number]> = {
  12.5: [1, 8],
  37.5: [3, 8],
  62.5: [5, 8],
  87.5: [7, 8],
};

/** Accusative forms of the sport names used in the pie-chart questions. */
const SPORT_ACC: Record<string, string> = {
  labdarúgás: 'labdarúgást',
  kosárlabda: 'kosárlabdát',
  úszás: 'úszást',
  kézilabda: 'kézilabdát',
  röplabda: 'röplabdát',
  tenisz: 'teniszt',
  futás: 'futást',
  kerékpározás: 'kerékpározást',
};
const acc = (sport: string) => SPORT_ACC[sport] ?? sport;
const Art = (word: string) => {
  const a = article(word);
  return `${a[0].toUpperCase()}${a.slice(1)}`;
};

/** The 10 × 10 grid with 25 shaded squares. */
const gridFigure: Figure = {
  type: 'fractionModel',
  shape: 'rect',
  parts: 100,
  rows: 10,
  shaded: 25,
};

/** The four favourite sports of a class, as percentages. */
const pieTheoryFigure: Figure = {
  type: 'pieChart',
  slices: [
    { label: 'labdarúgás', value: 30 },
    { label: 'kosárlabda', value: 25 },
    { label: 'úszás', value: 20 },
    { label: 'kézilabda', value: 25 },
  ],
  show: 'percent',
};

/** The same data as a table, for the worked example. */
const dataTableFigure: Figure = {
  type: 'table',
  header: ['Sport', 'Tanulók'],
  rows: [
    ['labdarúgás', 10],
    ['kosárlabda', 5],
    ['úszás', 6],
    ['kézilabda', 4],
    ['Összesen', 25],
  ],
  highlight: [[0, 1]],
};

/** The same data as a pie chart of counts. */
const dataPieFigure: Figure = {
  type: 'pieChart',
  slices: [
    { label: 'labdarúgás', value: 10 },
    { label: 'kosárlabda', value: 5 },
    { label: 'úszás', value: 6 },
    { label: 'kézilabda', value: 4 },
  ],
  show: 'value',
};

/** A 12 000 Ft coat with a 25% discount: 9 000 Ft to pay and 3 000 Ft discount. */
const discountFigure: Figure = {
  type: 'barModel',
  rows: [
    {
      segments: [
        { value: 9000, label: 'fizetendő', color: 'blue' },
        { value: 3000, label: 'kedvezmény', color: 'red' },
      ],
    },
  ],
  total: { label: '12 000 Ft' },
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** p% of a quantity: L1 friendly percents, L2 contexts, L3 any percent with decimals. */
const percentOfGen: GeneratorDef = {
  id: 'percent-of',
  title: 'Százalékérték kiszámítása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const q = rng.int(2, 20) * 20;
      const p = rng.pick([10, 20, 25, 50, 75]);
      const value = percentOf(q, p);
      return {
        prompt: tex`Mennyi $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a?`,
        answer: { type: 'number', value },
        hint: 'A százalék századrész: a mennyiséget a $\\frac{p}{100}$ törttel szorozd meg.',
        solution: [
          tex`$${num(p)}\% = \frac{${num(p)}}{100}$.`,
          tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(value)}$.`,
          `${Article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a **${num(value)}**.`,
        ],
      };
    }
    if (level === 2) {
      const kind = rng.pick(['school', 'book', 'garden'] as const);
      const q = rng.pick([200, 240, 300, 400, 500, 600, 800]);
      const p = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
      const value = percentOf(q, p);
      if (kind === 'school') {
        return {
          prompt: tex`Egy iskolába ${num(q)} tanuló jár. A tanulók ${num(p)}%-a fiú. Hány fiú jár az iskolába?`,
          answer: { type: 'number', value, unit: 'fő' },
          hint: 'A tanulók számát szorozd meg $\\frac{p}{100}$-dal!',
          solution: [
            tex`A fiúk a tanulók $${num(p)}\%$-a.`,
            tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(value)}$.`,
            `Az iskolába **${num(value)} fiú** jár.`,
          ],
        };
      }
      if (kind === 'book') {
        return {
          prompt: tex`Egy könyv ${num(q)} oldalas. Anna elolvasta a könyv ${num(p)}%-át. Hány oldalt olvasott el?`,
          answer: { type: 'number', value, unit: 'oldal' },
          hint: 'Az oldalak számát szorozd meg $\\frac{p}{100}$-dal!',
          solution: [
            tex`Az elolvasott rész a könyv $${num(p)}\%$-a.`,
            tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(value)}$.`,
            `Anna **${num(value)} oldalt** olvasott el.`,
          ],
        };
      }
      return {
        prompt: tex`Egy kert területe ${num(q)} m². A kert ${num(p)}%-án virág van. Hány négyzetméteren van virág?`,
        answer: { type: 'number', value, unit: 'm²' },
        hint: 'A kert területét szorozd meg $\\frac{p}{100}$-dal!',
        solution: [
          tex`A virágok a kert $${num(p)}\%$-án vannak.`,
          tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(value)}$.`,
          `A kert **${num(value)} m²**-es részén van virág.`,
        ],
      };
    }
    const q = rng.pick([1250, 2400, 3600, 4800, 6000, 8000, 12500]);
    const p = rng.pick([7, 12, 23, 35, 45, 65, 85]);
    const value = percentOf(q, p);
    return {
      prompt: tex`Mennyi $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a?`,
      answer: { type: 'number', value },
      hint: 'A százalék századrész: a mennyiséget a $\\frac{p}{100}$ törttel szorozd meg.',
      solution: [
        tex`$${num(p)}\% = \frac{${num(p)}}{100}$.`,
        tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(value)}$.`,
        `${Article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a **${num(value)}**.`,
      ],
    };
  },
};

/** Convert between fraction, decimal and percent. */
const convert: GeneratorDef = {
  id: 'convert',
  title: 'Átváltás tört, tizedes tört és százalék között',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kinds: ('to-fraction' | 'to-percent-frac' | 'to-percent-dec' | 'to-decimal')[] =
      level === 1
        ? ['to-fraction', 'to-percent-frac', 'to-percent-dec']
        : level === 2
          ? ['to-fraction', 'to-percent-frac', 'to-percent-dec', 'to-decimal']
          : ['to-fraction', 'to-percent-frac', 'to-percent-dec', 'to-decimal'];
    const kind = rng.pick(kinds);
    if (kind === 'to-fraction') {
      const special = level === 3 && rng.chance(0.35);
      const p = special ? rng.pick([12.5, 37.5, 62.5, 87.5]) : rng.int(1, 19) * 5;
      const [n, d] = special ? EIGHTHS[p] : [p / gcd(p, 100), 100 / gcd(p, 100)];
      return {
        prompt: tex`Írd fel tört alakban, legegyszerűbben!\n\n$${percentTex(p)}$`,
        answer: { type: 'fraction', num: n, den: d, requireSimplified: true },
        hint: 'A százalék századrész: $p\\% = \\frac{p}{100}$. Utána egyszerűsíts!',
        solution: [
          special
            ? tex`$${percentTex(p)} = ${num(p)} : 100 = ${num(p / 100)} = ${f(n, d)}$.`
            : tex`$${percentTex(p)} = \frac{${num(p)}}{100} = ${f(n, d)}$.`,
          `A legegyszerűbb alak: **$${f(n, d)}$**.`,
        ],
      };
    }
    if (kind === 'to-percent-frac') {
      const easy: [number, number][] = [
        [1, 2],
        [1, 4],
        [3, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [1, 10],
        [3, 10],
        [7, 10],
        [9, 10],
      ];
      const hard: [number, number][] = [
        [1, 20],
        [3, 20],
        [7, 20],
        [9, 20],
        [1, 25],
        [3, 25],
        [6, 25],
        [1, 50],
        [3, 50],
        [7, 50],
      ];
      const eighth: [number, number][] = [
        [1, 8],
        [3, 8],
        [5, 8],
        [7, 8],
      ];
      const pool = level === 1 ? easy : level === 2 ? [...easy, ...hard] : [...easy, ...hard, ...eighth];
      const [n, d] = rng.pick(pool);
      const p = clean((n * 100) / d);
      return {
        prompt: tex`Hány százalék?\n\n$${f(n, d)}$`,
        answer: { type: 'number', value: p, unit: '%' },
        hint: 'A törtet szorozd meg $100$-zal, vagy előbb írd fel tizedes törtként!',
        solution: [
          tex`$${f(n, d)} = ${num(n)} : ${num(d)} = ${num(clean(n / d), 3)}$.`,
          tex`$${num(clean(n / d), 3)} \cdot 100 = ${num(p)}$.`,
          `Az érték **${num(p)}%**.`,
        ],
      };
    }
    if (kind === 'to-percent-dec') {
      const easy = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
      const hard = [0.08, 0.12, 0.24, 0.36, 0.48, 0.64, 0.72, 0.88, 0.125, 0.375, 0.625, 0.875];
      const x = rng.pick(level === 3 ? [...easy, ...hard] : easy);
      const p = clean(x * 100);
      return {
        prompt: tex`Írd fel százalékban!\n\n$${num(x)}$`,
        answer: { type: 'number', value: p, unit: '%' },
        hint: 'A tizedes törtet $100$-zal szorozva kapod a százalékot.',
        solution: [tex`$${num(x)} \cdot 100 = ${num(p)}$.`, `Az érték **${num(p)}%**.`],
      };
    }
    const easyP = rng.int(1, 19) * 5;
    const hardP = rng.pick([8, 12, 24, 36, 48, 64, 72, 88, 12.5, 37.5, 62.5, 87.5]);
    const p = level === 3 ? rng.pick([easyP, hardP]) : easyP;
    const value = clean(p / 100);
    return {
      prompt: tex`Írd fel tizedes tört alakban!\n\n$${percentTex(p)}$`,
      answer: { type: 'number', value },
      hint: 'A százalék századrész: oszd el a számot $100$-zal.',
      solution: [
        Number.isInteger(p)
          ? tex`$${percentTex(p)} = \frac{${num(p)}}{100} = ${num(value)}$.`
          : tex`$${percentTex(p)} = ${num(p)} : 100 = ${num(value)}$.`,
        `Tizedes törtként: **${num(value)}**.`,
      ],
    };
  },
};

/** What percentage of a grid is shaded? L1: 100 squares, L2: 20 parts. */
const grid: GeneratorDef = {
  id: 'grid',
  title: 'Százalék leolvasása rácson',
  levels: [1, 2],
  generate(rng, level): Question {
    const parts = level === 1 ? 100 : 20;
    const rows = level === 1 ? 10 : 4;
    const k = level === 1 ? rng.int(1, 19) * 5 : rng.int(1, 19);
    const p = level === 1 ? k : k * 5;
    return {
      prompt:
        level === 1
          ? 'A $10 \\times 10$-es rács hány százaléka van beszínezve?'
          : 'A $20$ egyenlő részre osztott téglalap hány százaléka van beszínezve?',
      figure: { type: 'fractionModel', shape: 'rect', parts, rows, shaded: k },
      answer: { type: 'number', value: p, unit: '%' },
      hint:
        level === 1
          ? 'A rács $100$ kis négyzetből áll, ez az egész. Egy négyzet $1\\%$.'
          : 'A téglalap $20$ egyenlő részből áll, ez $100\\%$. Egy rész $5\\%$.',
      solution:
        level === 1
          ? [
              tex`A rács $100$ kis négyzetből áll, ez $100\%$.`,
              tex`$${num(k)}$ négyzet van beszínezve, tehát $${num(p)}\%$.`,
              `A rács **${num(p)}%**-a van beszínezve.`,
            ]
          : [
              tex`A $20$ rész az egész, ez $100\%$.`,
              tex`Egy rész $100 : 20 = 5\%$.`,
              tex`$${num(k)}$ rész: $${num(k)} \cdot 5 = ${num(p)}\%$.`,
              `A téglalap **${num(p)}%**-a van beszínezve.`,
            ],
    };
  },
};

/** Read a pie chart: L1 percent, L2 count → percent, L3 percent → count / difference. */
const pie: GeneratorDef = {
  id: 'pie',
  title: 'Kördiagram olvasása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const categories = rng.sample(
      ['labdarúgás', 'kosárlabda', 'úszás', 'kézilabda', 'röplabda', 'tenisz', 'futás', 'kerékpározás'],
      4,
    );
    if (level === 2) {
      const total = rng.pick([20, 25]);
      const cuts = rng.sample(
        Array.from({ length: total - 1 }, (_, i) => i + 1),
        3,
      ).sort((a, b) => a - b);
      const counts = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], total - cuts[2]];
      const idx = rng.int(0, 3);
      const p = clean((counts[idx] / total) * 100);
      return {
        prompt: tex`A kördiagram egy ${num(total)} fős osztály kedvenc sportját mutatja. A tanulók hány százaléka választotta ${article(acc(categories[idx]))} **${acc(categories[idx])}**?`,
        figure: {
          type: 'pieChart',
          slices: categories.map((label, i) => ({ label, value: counts[i] })),
          show: 'value',
        },
        answer: { type: 'number', value: p, unit: '%' },
        hint: 'Az egész osztály $100\\%$. A választott tanulók számát oszd el az összes tanuló számával, majd szorozd $100$-zal!',
        solution: [
          tex`Az egész osztály $${num(total)}$ tanuló, ez $100\%$.`,
          tex`${Art(acc(categories[idx]))} **${acc(categories[idx])}** $${num(counts[idx])}$ tanuló választotta.`,
          tex`$${num(counts[idx])} : ${num(total)} = ${num(clean(counts[idx] / total), 3)}$.`,
          tex`$${num(clean(counts[idx] / total), 3)} \cdot 100 = ${num(p)}\%$.`,
          `Ez az osztály **${num(p)}%**-a.`,
        ],
      };
    }
    const total = level === 3 ? rng.pick([200, 400]) : 100;
    const cuts = rng.sample(
      Array.from({ length: 19 }, (_, i) => 5 * (i + 1)),
      3,
    ).sort((a, b) => a - b);
    const values = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], 100 - cuts[2]];
    const figure: Figure = {
      type: 'pieChart',
      slices: categories.map((label, i) => ({ label, value: values[i] })),
      show: 'percent',
    };
    if (level === 1) {
      const idx = rng.int(0, 3);
      return {
        prompt: tex`A kördiagram egy osztály kedvenc sportját mutatja. A tanulók hány százaléka választotta ${article(acc(categories[idx]))} **${acc(categories[idx])}**?`,
        figure,
        answer: { type: 'number', value: values[idx], unit: '%' },
        hint: 'Olvasd le a kérdéses szeletnél álló százalékot!',
        solution: [`A diagramon ${article(categories[idx])} **${categories[idx]}** szeleténél $${num(values[idx])}\\%$ áll.`, `Tehát a tanulók **${num(values[idx])}%**-a választotta.`],
      };
    }
    let i = rng.int(0, 3);
    let j = rng.int(0, 3);
    while (i === j || values[i] === values[j]) {
      i = rng.int(0, 3);
      j = rng.int(0, 3);
    }
    const hi = values[i] > values[j] ? i : j;
    const lo = hi === i ? j : i;
    if (rng.chance(0.5)) {
      const answer = clean((values[i] * total) / 100);
      return {
        prompt: tex`A kördiagram egy ${num(total)} tanulós iskola választását mutatja. Hány tanuló választotta ${article(acc(categories[i]))} **${acc(categories[i])}**?`,
        figure,
        answer: { type: 'number', value: answer, unit: 'fő' },
        hint: 'A százalék az egész századrésze. Előbb számold ki, hány tanuló jut $1\\%$-ra!',
        solution: [
          tex`Az egész iskola $${num(total)}$ tanuló, ez $100\%$.`,
          tex`$1\% = ${num(total)} : 100 = ${num(total / 100)}$ tanuló.`,
          tex`$${num(values[i])}\% = ${num(values[i])} \cdot ${num(total / 100)} = ${num(answer)}$ tanuló.`,
          `${Art(acc(categories[i]))} **${acc(categories[i])}** **${num(answer)} tanuló** választotta.`,
        ],
      };
    }
    const answer = clean(((values[hi] - values[lo]) * total) / 100);
    return {
      prompt: tex`A kördiagram egy ${num(total)} tanulós iskola választását mutatja. Hány tanulóval többen választották ${article(acc(categories[hi]))} **${acc(categories[hi])}**, mint ${article(acc(categories[lo]))} **${acc(categories[lo])}**?`,
      figure,
      answer: { type: 'number', value: answer, unit: 'fő' },
      hint: 'Számold ki külön-külön, hány tanuló tartozik a két szelethez, aztán vond ki őket!',
      solution: [
        tex`$1\% = ${num(total)} : 100 = ${num(total / 100)}$ tanuló.`,
        tex`**${categories[hi]}**: $${num(values[hi])} \cdot ${num(total / 100)} = ${num(clean((values[hi] * total) / 100))}$ tanuló.`,
        tex`**${categories[lo]}**: $${num(values[lo])} \cdot ${num(total / 100)} = ${num(clean((values[lo] * total) / 100))}$ tanuló.`,
        tex`A különbség: $${num(clean((values[hi] * total) / 100))} - ${num(clean((values[lo] * total) / 100))} = ${num(answer)}$.`,
        `**${num(answer)} tanulóval** többen választották ${article(acc(categories[hi]))} **${acc(categories[hi])}**.`,
      ],
    };
  },
};

/** Discounts and price rises. */
const discount: GeneratorDef = {
  id: 'discount',
  title: 'Kedvezmény és áremelés',
  levels: [2, 3],
  generate(rng, level): Question {
    const price = rng.pick([1200, 1500, 2000, 2400, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000]);
    const p = level === 2 ? rng.pick([10, 20, 25, 50]) : rng.pick([5, 15, 30, 35, 40, 45]);
    const change = clean((price * p) / 100);
    const rise = rng.chance(0.5);
    const askNew = rng.chance(0.6);
    const newPrice = rise ? clean(price + change) : clean(price - change);
    const prompt = rise
      ? askNew
        ? tex`A vonaljegy ára ${num(price)} Ft volt. ${num(p)}%-kal emelkedett. Mennyi most?`
        : tex`A vonaljegy ára ${num(price)} Ft volt. ${num(p)}%-kal emelkedett. Mennyivel nőtt az ár?`
      : askNew
        ? tex`Egy kabát ára ${num(price)} Ft. ${num(p)}% kedvezménnyel adják. Mennyit fizetünk érte?`
        : tex`Egy kabát ára ${num(price)} Ft. ${num(p)}% kedvezményt adnak. Mennyi a kedvezmény összege?`;
    const answer = askNew ? newPrice : change;
    return {
      prompt,
      answer: { type: 'number', value: answer, unit: 'Ft' },
      hint: askNew
        ? rise
          ? 'A változás az ár megadott százaléka. Számítsd ki, majd add hozzá az eredeti árhoz!'
          : 'A változás az ár megadott százaléka. Számítsd ki, majd vond ki az eredeti árból!'
        : 'A változás az ár megadott százaléka. Számítsd ki!',
      solution: [
        tex`A változás: $${num(price)} \cdot \frac{${num(p)}}{100} = ${num(change)}$ Ft.`,
        ...(askNew
          ? [
              rise
                ? tex`Az új ár: $${num(price)} + ${num(change)} = ${num(newPrice)}$ Ft.`
                : tex`A fizetendő ár: $${num(price)} - ${num(change)} = ${num(newPrice)}$ Ft.`,
            ]
          : []),
        askNew
          ? `Az új ár **${num(answer)} Ft**.`
          : rise
            ? `Az ár **${num(answer)} Ft**-tal nőtt.`
            : `A kedvezmény összege **${num(answer)} Ft**.`,
      ],
    };
  },
};

/** The classic mistake: dividing by the percent instead of taking hundredths. */
const mistake: GeneratorDef = {
  id: 'mistake',
  title: 'Tipikus hiba: osztás a százalékkal',
  levels: [1, 2],
  generate(rng, level): Question {
    const q = rng.pick([80, 120, 200, 240, 400, 600]);
    const p = rng.pick([5, 15, 20, 25, 30, 35, 40, 45, 50]);
    const correct = clean((q * p) / 100);
    const wrong = clean(q / p);
    if (level === 1) {
      const isRight = rng.chance(0.5);
      return {
        prompt: isRight
          ? tex`Bence így számolta:\n\n$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(correct)}$\n\nEz ${article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a. Igaz vagy hamis?`
          : tex`Bence így számolta:\n\n$${num(q)} : ${num(p)} = ${num(wrong)}$\n\nEz ${article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a. Igaz vagy hamis?`,
        answer: { type: 'truefalse', value: isRight },
        hint: 'A százalék századrész: a mennyiséget $\\frac{p}{100}$-dal kell megszorozni, nem osztani a százalékkal.',
        solution: isRight
          ? [tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(correct)}$, ez valóban ${article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-a.`, 'Az állítás **igaz**.']
          : [
              tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(correct)}$, nem $${num(wrong)}$.`,
              'Bence a százalékkal osztott a századrész helyett. Az állítás **hamis**.',
            ],
      };
    }
    const correctText = tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(correct)}$`;
    const wrong1 = tex`$${num(q)} : ${num(p)} = ${num(wrong)}$`;
    const wrong2 = tex`$${num(q)} \cdot ${num(p)} = ${num(q * p)}$`;
    const wrong3 = tex`$${num(q)} : 100 = ${num(clean(q / 100))}$`;
    return {
      prompt: tex`Melyik számítás adja meg helyesen ${article(num(q))} $${num(q)}$-${suffix(q, 'nak', 'nek')} ${article(p)} $${num(p)}\%$-át?`,
      answer: textChoice(correctText, [wrong1, wrong2, wrong3]),
      hint: 'A százalék századrész: a mennyiséget $\\frac{p}{100}$-dal kell megszorozni.',
      solution: [
        tex`$${num(p)}\% = \frac{${num(p)}}{100}$.`,
        tex`$${num(q)} \cdot \frac{${num(p)}}{100} = ${num(correct)}$.`,
        tex`${Article(num(q))} $${num(q)} : ${num(p)}$ a százalékkal oszt, ${article(num(q))} $${num(q)} \cdot ${num(p)}$ pedig nem oszt $100$-zal.`,
        `A helyes számítás: **${correctText}**.`,
      ],
    };
  },
};

/** Find the whole from a part and a percent (level 3). */
const whole: GeneratorDef = {
  id: 'whole',
  title: 'Az egész kiszámítása százalékból',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['part', 'discount', 'rise'] as const);
    if (kind === 'part') {
      const p = rng.pick([10, 20, 25, 50]);
      const total = rng.pick([40, 60, 80, 120, 200, 240, 400, 600]);
      const part = clean((total * p) / 100);
      return {
        prompt: tex`Valamennyi szám ${num(p)}%-a ${num(part)}. Melyik ez a szám?`,
        answer: { type: 'number', value: total },
        hint: 'A részt oszd el a százalékkal, majd szorozd $100$-zal!',
        solution: [
          tex`$1\% = ${num(part)} : ${num(p)} = ${num(clean(part / p), 3)}$.`,
          tex`$100\% = ${num(clean(part / p), 3)} \cdot 100 = ${num(total)}$.`,
          `A keresett szám **${num(total)}**.`,
        ],
      };
    }
    const p = rng.pick([10, 20, 25, 50]);
    const original = rng.pick([2000, 4000, 5000, 8000, 10000, 12000, 15000, 20000]);
    if (kind === 'discount') {
      const sale = clean((original * (100 - p)) / 100);
      return {
        prompt: tex`Egy kabátot ${num(p)}% kedvezménnyel ${num(sale)} Ft-ért adnak. Mennyi volt az eredeti ára?`,
        answer: { type: 'number', value: original, unit: 'Ft' },
        hint: 'A fizetett ár az eredeti ár $(100 - p)\\%$-a.',
        solution: [
          tex`A fizetett ár az eredeti ár $${num(100 - p)}\%$-a.`,
          tex`$1\% = ${num(sale)} : ${num(100 - p)} = ${num(clean(sale / (100 - p)), 3)}$ Ft.`,
          tex`$100\% = ${num(clean(sale / (100 - p)), 3)} \cdot 100 = ${num(original)}$ Ft.`,
          `Az eredeti ár **${num(original)} Ft** volt.`,
        ],
      };
    }
    const risen = clean((original * (100 + p)) / 100);
    return {
      prompt: tex`Egy termék ára ${num(p)}%-kal emelkedett, így ${num(risen)} Ft lett. Mennyi volt az eredeti ára?`,
      answer: { type: 'number', value: original, unit: 'Ft' },
      hint: 'Az új ár az eredeti ár $(100 + p)\\%$-a.',
      solution: [
        tex`Az új ár az eredeti ár $${num(100 + p)}\%$-a.`,
        tex`$1\% = ${num(risen)} : ${num(100 + p)} = ${num(clean(risen / (100 + p)), 3)}$ Ft.`,
        tex`$100\% = ${num(clean(risen / (100 + p)), 3)} \cdot 100 = ${num(original)}$ Ft.`,
        `Az eredeti ár **${num(original)} Ft** volt.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-tortek-3-01',
  goals: [
    'megérteni, hogy a százalék az egész századrésze,',
    'átváltani tört, tizedes tört és százalék között,',
    'kiszámítani egy mennyiség adott százalékát,',
    'kördiagramot olvasni és az egészet százalékból kiszámítani.',
  ],
  parts: [
    {
      title: 'A százalék fogalma',
      steps: [
        {
          type: 'theory',
          title: 'Mi a százalék?',
          body: 'A százalék az egész **századrésze**: $1\\% = \\frac{1}{100}$. A $10 \\times 10$-es rács $100$ kis négyzete az egész, ezért egy négyzet $1\\%$.',
          figure: gridFigure,
          remember: '$p\\% = \\frac{p}{100}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$25\\% = \\frac{1}{4}$',
            answer: { type: 'truefalse', value: true },
            hint: 'Írd fel a $25\\%$-ot $100$ nevezőjű törtként, és egyszerűsíts!',
            solution: ['$25\\% = \\frac{25}{100} = \\frac{1}{4}$.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Százalékérték',
          problem: 'Mennyi $80$-nak a $25\\%$-a?',
          steps: [
            { text: '$25\\% = \\frac{25}{100} = \\frac{1}{4}$' },
            { text: '$80 : 4 = 20$' },
          ],
          answer: 'A $80$-nak a $25\\%$-a **20**.',
        },
        { type: 'practice', generator: 'percent-of', level: 1, count: 2 },
        { type: 'practice', generator: 'grid', level: 1 },
      ],
    },
    {
      title: 'Átváltás tört, tizedes tört és százalék között',
      steps: [
        {
          type: 'theory',
          title: 'Három alak',
          body: 'A százalékot törtté úgy írjuk, hogy a számot $100$ nevezőjű törtnek tekintjük. Tizedes törtből $100$-zal szorozva lesz százalék.',
          remember: '$0,25 = \\frac{25}{100} = 25\\%$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik egyenlő a $0,4$-del?',
            answer: textChoice('$40\\%$', ['$4\\%$', '$\\frac{1}{4}$', '$0,04$']),
            hint: 'A tizedes törtet $100$-zal szorozva kapod a százalékot.',
            solution: ['$0,4 \\cdot 100 = 40$, tehát $0,4 = 40\\%$.', 'A $4\\%$ és a $0,04$ tízszer kisebb, a $\\frac{1}{4}$ pedig $0,25$.'],
          },
        },
        {
          type: 'example',
          title: 'Törtből százalék',
          problem: 'Írd fel százalékban: $\\frac{3}{4}$',
          steps: [
            { text: '$3 : 4 = 0,75$' },
            { text: '$0,75 \\cdot 100 = 75$' },
          ],
          answer: 'A $\\frac{3}{4}$ **$75\\%$**.',
        },
        { type: 'practice', generator: 'convert', level: 1, count: 2 },
        { type: 'practice', generator: 'convert', level: 2 },
        { type: 'practice', generator: 'mistake', level: 1 },
      ],
    },
    {
      title: 'Százalékérték és árváltozás',
      steps: [
        {
          type: 'theory',
          title: 'Rész és ár',
          body: 'Egy mennyiség $p\\%$-a a mennyiség $\\frac{p}{100}$ része. Kedvezménynél ezt kivonjuk az árból, áremelésnél hozzáadjuk.',
          remember: 'rész $= \\frac{p}{100} \\cdot$ mennyiség',
        },
        {
          type: 'example',
          title: 'Kedvezmény',
          problem: 'Egy kabát ára $12\\,000$ Ft. $25\\%$ kedvezményt adnak. Mennyit fizetünk?',
          figure: discountFigure,
          steps: [
            { text: 'A kedvezmény: $12\\,000 \\cdot \\frac{25}{100} = 3\\,000$ Ft.' },
            { text: 'Fizetendő: $12\\,000 - 3\\,000 = 9\\,000$ Ft.' },
          ],
          answer: '**9 000 Ft**-ot fizetünk.',
        },
        { type: 'practice', generator: 'percent-of', level: 2, count: 2 },
        { type: 'practice', generator: 'discount', level: 2 },
        { type: 'practice', generator: 'mistake', level: 2 },
      ],
    },
    {
      title: 'Adatok táblázatban és kördiagramon',
      steps: [
        {
          type: 'theory',
          title: 'A kördiagram',
          body: 'A kördiagram az egészet egy körként mutatja. A szeletek nagysága arányos az adatokkal; a százalékok összege $100\\%$.',
          figure: pieTheoryFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'A kördiagram szerint a tanulók hány százaléka választotta a labdarúgást?',
            figure: pieTheoryFigure,
            answer: { type: 'number', value: 30, unit: '%' },
            hint: 'Olvasd le a labdarúgás szeleténél álló százalékot!',
            solution: ['A labdarúgás szeleténél $30\\%$ áll.', 'Tehát a tanulók **30%**-a választotta.'],
          },
        },
        {
          type: 'example',
          title: 'Táblázatból százalék',
          problem: '25 tanuló választott így: labdarúgás 10, kosárlabda 5, úszás 6, kézilabda 4. Hány százalék a labdarúgás?',
          figure: dataTableFigure,
          steps: [
            { text: 'Az egész osztály $25$ tanuló, ez $100\\%$.' },
            { text: '$10 : 25 = 0,4$', figure: dataPieFigure },
            { text: '$0,4 \\cdot 100 = 40$' },
          ],
          answer: 'A labdarúgást a tanulók **40%**-a választotta.',
        },
        { type: 'practice', generator: 'pie', level: 1 },
        { type: 'practice', generator: 'pie', level: 2 },
        { type: 'practice', generator: 'grid', level: 2 },
      ],
    },
    {
      title: 'Visszafelé: az egész kiszámítása',
      steps: [
        {
          type: 'theory',
          title: 'A részből az egész',
          body: 'Ha a rész és a százalék ismert, az egészet megkapod: a részt elosztod a százalékkal, majd szorzod $100$-zal.',
          remember: 'egész $=$ rész $: p \\cdot 100$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Valamennyi szám $25\\%$-a $8$. Melyik ez a szám?',
            answer: { type: 'number', value: 32 },
            hint: 'A $8$ a szám negyede. Melyik számnak a negyede $8$?',
            solution: ['$8 : 25 = 0,32$, majd $0,32 \\cdot 100 = 32$.', 'A keresett szám **32**.'],
          },
        },
        {
          type: 'example',
          title: 'Egész kiszámítása',
          problem: 'Valamennyi szám $20\\%$-a $12$. Melyik ez a szám?',
          steps: [
            { text: '$1\\% = 12 : 20 = 0,6$' },
            { text: '$100\\% = 0,6 \\cdot 100 = 60$' },
          ],
          answer: 'A keresett szám **60**.',
        },
        { type: 'practice', generator: 'whole', level: 3 },
        { type: 'practice', generator: 'pie', level: 3 },
        { type: 'practice', generator: 'discount', level: 3 },
      ],
    },
  ],
  generators: [percentOfGen, convert, grid, pie, discount, mistake, whole],
  miniTest: {
    items: [
      { generator: 'percent-of', level: 1 },
      { generator: 'convert', level: 2 },
      { generator: 'percent-of', level: 2 },
      { generator: 'discount', level: 2 },
      { generator: 'pie', level: 2 },
      { generator: 'whole', level: 3 },
      { generator: 'mistake', level: 2 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'percent-of', level: 1 },
    { generator: 'grid', level: 1 },
    { generator: 'convert', level: 1 },
    { generator: 'pie', level: 1 },
    { generator: 'percent-of', level: 2 },
    { generator: 'discount', level: 2 },
    { generator: 'whole', level: 3 },
  ],
});
