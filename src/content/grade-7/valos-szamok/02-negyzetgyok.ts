/**
 * 7. osztály › Valós számok › 2. Négyzetgyök
 *
 * √a as the non-negative number whose square is a, roots of perfect squares (integers,
 * fractions, decimals), the equation x² = a (2 / 1 / 0 solutions), the difference between √4
 * and the solutions of x² = 4, and √(a²) = |a|.
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
  texFrac,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A square whose side is the unknown, with the area written in the middle. */
function areaSquareFigure(side: number, sideLabel: string): Figure {
  return { type: 'quadrilateral', shape: 'square', a: side, sideLabels: { a: sideLabel }, fill: true };
}

/** Square root of a perfect square, written in LaTeX. */
const root = (n: number) => tex`\sqrt{${num(n)}}`;

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** √n for a perfect square n. L1 small, L2 larger. */
const sqrtInt: GeneratorDef = {
  id: 'sqrt-int',
  title: 'Egész szám négyzetgyöke',
  levels: [1, 2],
  generate(rng, level): Question {
    const k = level === 1 ? rng.int(2, 12) : rng.int(13, 30);
    const n = k * k;
    return {
      prompt: tex`Számítsd ki! $${root(n)}$`,
      answer: { type: 'number', value: k },
      inputLabel: '$= $',
      hint: 'Keresd azt a nemnegatív számot, amelynek a négyzete a gyökjel alatti szám.',
      solution: [
        tex`${article(k) === 'az' ? 'Az' : 'A'} $${num(k)}$ négyzete $${num(n)}$.`,
        tex`Ezért $${root(n)} = ${num(k)}$.`,
        tex`A $${num(n)}$-${suffix(n, 'nak', 'nek')} a négyzetgyöke **${num(k)}**.`,
      ],
    };
  },
};

/** √(p²/q²) = p/q. L1 proper fractions, L2 improper fractions. */
const sqrtFrac: GeneratorDef = {
  id: 'sqrt-frac',
  title: 'Tört négyzetgyöke',
  levels: [1, 2],
  generate(rng, level): Question {
    let q: number;
    let p: number;
    if (level === 1) {
      q = rng.int(2, 10);
      p = rng.int(1, q - 1);
    } else {
      q = rng.int(2, 5);
      p = rng.int(q + 1, q + 7);
    }
    while (gcd(p, q) !== 1) {
      if (level === 1) p = rng.int(1, q - 1);
      else p = rng.int(q + 1, q + 7);
    }
    return {
      prompt: tex`Számítsd ki! $\sqrt{\frac{${num(p * p)}}{${num(q * q)}}}$`,
      answer: { type: 'fraction', num: p, den: q, requireSimplified: true, form: 'any' },
      hint: 'A tört négyzetgyökét úgy kapod, hogy a számláló és a nevező négyzetgyökét veszed.',
      solution: [
        tex`$\sqrt{${num(p * p)}} = ${num(p)}$ és $\sqrt{${num(q * q)}} = ${num(q)}$`,
        tex`$\sqrt{\frac{${num(p * p)}}{${num(q * q)}}} = \frac{${num(p)}}{${num(q)}}$`,
        tex`Az eredmény **$${texFrac(p, q)}$**.`,
      ],
    };
  },
};

/** √0,49 and √0,0025. L1 one-decimal bases, L2 two-decimal bases and larger values. */
const sqrtDecimal: GeneratorDef = {
  id: 'sqrt-decimal',
  title: 'Tizedes tört négyzetgyöke',
  levels: [1, 2],
  generate(rng, level): Question {
    let k: number;
    let places: number;
    if (level === 1) {
      k = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]);
      places = 1;
    } else if (rng.chance(0.5)) {
      k = rng.int(2, 9);
      places = 2;
    } else {
      k = rng.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]);
      places = 1;
    }
    const x = k / 10 ** places;
    const square = (k * k) / 10 ** (2 * places);
    return {
      prompt: tex`Számítsd ki! $\sqrt{${num(square, 2 * places, true)}}$`,
      answer: { type: 'number', value: clean(x) },
      inputLabel: '$= $',
      hint: 'Keresd azt a számot, amelynek a négyzete a gyökjel alatti tizedes tört.',
      solution: [
        tex`$${num(clean(x), places)}^{2} = ${num(square, 2 * places, true)}$`,
        tex`Ezért $\sqrt{${num(square, 2 * places, true)}} = ${num(clean(x), places)}$.`,
        tex`Az eredmény **${num(clean(x))}**.`,
      ],
    };
  },
};

/** Solve x² = a: two solutions, written smaller first. L1 integers, L2 decimals. */
const solveX2: GeneratorDef = {
  id: 'solve-x2',
  title: 'Az x² = a egyenlet megoldása',
  levels: [1, 2],
  generate(rng, level): Question {
    let k: number;
    let a: number;
    let display: string;
    if (level === 1) {
      k = rng.int(2, 12);
      a = k * k;
      display = num(a);
    } else if (rng.chance(0.5)) {
      k = rng.pick([1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5]);
      a = clean(k * k);
      display = num(a);
    } else {
      k = rng.int(13, 20);
      a = k * k;
      display = num(a);
    }
    return {
      prompt: tex`Oldd meg! $x^2 = ${display}$\n\n(A kisebbik gyököt írd előre.)`,
      answer: {
        type: 'numbers',
        fields: [
          { label: '$x_1 =$', value: -k },
          { label: '$x_2 =$', value: k },
        ],
      },
      hint: 'Négyzetgyököt vonva két megoldás lesz: a pozitív és a negatív szám is jó.',
      solution: [
        tex`$x = \pm\sqrt{${display}}$`,
        tex`$\sqrt{${display}} = ${num(k)}$`,
        tex`A megoldások: $x_1 = ${num(-k)}$, $x_2 = ${num(k)}$.`,
      ],
    };
  },
};

/** How many solutions does x² = a have? MC with 0, 1, 2 and "infinitely many". */
const howMany: GeneratorDef = {
  id: 'how-many',
  title: 'Hány megoldása van?',
  levels: [1, 2],
  generate(rng, level): Question {
    let a: number;
    let display: string;
    if (level === 1) {
      a = rng.int(-9, 9);
      display = num(a);
    } else {
      const kind = rng.pick(['decimal', 'fraction', 'integer'] as const);
      if (kind === 'decimal') {
        const k = rng.int(2, 9);
        a = clean((k * k) / 100) * (rng.chance(0.5) ? 1 : -1);
        display = num(a);
      } else if (kind === 'fraction') {
        const q = rng.int(3, 9);
        let p = rng.int(1, q - 1);
        while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
        a = (p * p) / (q * q) * (rng.chance(0.4) ? -1 : 1);
        display = texFrac(p * p, q * q);
        if (a < 0) display = `-${display}`;
      } else {
        const k = rng.int(2, 10);
        a = k * k * (rng.chance(0.4) ? -1 : 1);
        display = num(a);
      }
    }
    const correct = a > 0 ? '2' : a === 0 ? '1' : '0';
    const all = ['0', '1', '2', 'végtelen sok'];
    return {
      prompt: tex`Hány megoldása van az $x^2 = ${display}$ egyenletnek?`,
      answer: choice(rng, correct, all.filter((x) => x !== correct)),
      hint: 'Egy szám négyzete nem lehet negatív. Ha a jobb oldal pozitív, két megoldás van.',
      solution: [
        a > 0
          ? tex`Mivel $${display} > 0$, két megoldás van: $x = \sqrt{${display}}$ és $x = -\sqrt{${display}}$.`
          : a === 0
            ? 'Mivel a jobb oldal $0$, csak az $x = 0$ megoldás van.'
            : tex`Mivel $${display} < 0$, egyetlen szám négyzete sem lehet ennyi: nincs megoldás.`,
        tex`A megoldások száma: **${correct}**.`,
      ],
    };
  },
};

/** True/false traps around the square root, including √(a²) = |a|. */
const truth: GeneratorDef = {
  id: 'truth',
  title: 'Igaz vagy hamis? (gyökök)',
  levels: [1, 2],
  generate(rng, level): Question {
    type Pair = { statement: string; value: boolean; why: string };
    const l1: Pair[] = [
      { statement: '$\\sqrt{9} = 3$', value: true, why: '$3^2 = 9$, és a gyök nemnegatív.' },
      { statement: '$\\sqrt{9} = -3$', value: false, why: 'A négyzetgyök értéke nemnegatív: $\\sqrt{9} = 3$.' },
      { statement: '$\\sqrt{16} = 8$', value: false, why: '$4^2 = 16$, ezért $\\sqrt{16} = 4$, nem $8$.' },
      { statement: '$\\sqrt{25} = 5$', value: true, why: '$5^2 = 25$.' },
      { statement: '$\\sqrt{0} = 0$', value: true, why: '$0^2 = 0$.' },
      { statement: '$\\sqrt{4} = \\pm 2$', value: false, why: '$\\sqrt{4}$ csak a nemnegatív $2$; a $\\pm 2$ az $x^2 = 4$ megoldása.' },
      { statement: '$\\sqrt{1} = 1$', value: true, why: '$1^2 = 1$.' },
      { statement: '$\\sqrt{36} = 6$', value: true, why: '$6^2 = 36$.' },
      { statement: '$\\sqrt{64} = 8$', value: true, why: '$8^2 = 64$.' },
      { statement: '$\\sqrt{64} = 4$', value: false, why: '$4^2 = 16$, nem $64$. A $\\sqrt{64} = 8$.' },
      { statement: '$\\sqrt{81} = 9$', value: true, why: '$9^2 = 81$.' },
      { statement: '$\\sqrt{121} = 11$', value: true, why: '$11^2 = 121$.' },
      { statement: '$\\sqrt{49} = \\pm 7$', value: false, why: '$\\sqrt{49}$ csak a nemnegatív $7$.' },
    ];
    const l2: Pair[] = [
      { statement: '$\\sqrt{(-5)^2} = -5$', value: false, why: '$\\sqrt{25} = 5$, nem $-5$.' },
      { statement: '$\\sqrt{(-5)^2} = 5$', value: true, why: '$(-5)^2 = 25$, és $\\sqrt{25} = 5$.' },
      { statement: '$\\sqrt{a^2} = a$ minden valós $a$-ra', value: false, why: 'Negatív $a$-ra $\\sqrt{a^2} = -a$, például $\\sqrt{(-3)^2} = 3$.' },
      { statement: '$\\sqrt{a^2} = |a|$ minden valós $a$-ra', value: true, why: 'A gyök nemnegatív, ezért az abszolút érték kell.' },
      { statement: 'Az $x^2 = 9$ egyenlet megoldásai $x = 3$ és $x = -3$.', value: true, why: '$3^2 = 9$ és $(-3)^2 = 9$.' },
      { statement: 'A $\\sqrt{4}$ ugyanaz, mint az $x^2 = 4$ egyenlet megoldásai.', value: false, why: '$\\sqrt{4} = 2$, az egyenlet megoldásai viszont $2$ és $-2$.' },
      { statement: '$\\sqrt{0,25} = 0,5$', value: true, why: '$0,5^2 = 0,25$.' },
      { statement: '$\\sqrt{0,25} = -0,5$', value: false, why: 'A gyök nemnegatív: $\\sqrt{0,25} = 0,5$.' },
      { statement: '$\\sqrt{(-2)^2} = 2$', value: true, why: '$(-2)^2 = 4$, és $\\sqrt{4} = 2$.' },
      { statement: '$\\sqrt{(-2)^2} = -2$', value: false, why: 'A gyök nemnegatív, ezért $\\sqrt{4} = 2$.' },
      { statement: 'Az $x^2 = 0$ egyenletnek két megoldása van.', value: false, why: 'Csak az $x = 0$ megoldás van.' },
      { statement: '$\\sqrt{1,44} = 1,2$', value: true, why: '$1,2^2 = 1,44$.' },
      { statement: '$\\sqrt{1,44} = -1,2$', value: false, why: 'A gyök nemnegatív: $\\sqrt{1,44} = 1,2$.' },
    ];
    rng.next(); // spread the first picks of small seeds over the statements
    const item = rng.pick(level === 1 ? l1 : l2);
    return {
      prompt: `Igaz vagy hamis?\n\n**${item.statement}**`,
      answer: { type: 'truefalse', value: item.value },
      hint: 'Számolj utána: keresd azt a nemnegatív számot, amelynek a négyzete a gyökjel alatti szám.',
      solution: [item.why, item.value ? 'Az állítás **igaz**.' : 'Az állítás **hamis**.'],
    };
  },
};

/** Roots of products and quotients of perfect squares. L3. */
const sqrtProduct: GeneratorDef = {
  id: 'sqrt-product',
  title: 'Szorzat és hányados négyzetgyöke',
  levels: [3],
  generate(rng): Question {
    if (rng.chance(0.5)) {
      const p = rng.int(2, 9);
      const q = rng.int(2, 9);
      return {
        prompt: tex`Számítsd ki! $\sqrt{${num(p * p)} \cdot ${num(q * q)}}$`,
        answer: { type: 'number', value: p * q },
        inputLabel: '$= $',
        hint: 'A szorzat négyzetgyöke a tényezők négyzetgyökeinek szorzata.',
        solution: [
          tex`$\sqrt{${num(p * p)} \cdot ${num(q * q)}} = \sqrt{${num(p * p)}} \cdot \sqrt{${num(q * q)}}$`,
          tex`$= ${num(p)} \cdot ${num(q)} = ${num(p * q)}$`,
          tex`Az eredmény **${num(p * q)}**.`,
        ],
      };
    }
    const q = rng.int(2, 5);
    let p = rng.int(q + 1, q + 7);
    while (gcd(p, q) !== 1) p = rng.int(q + 1, q + 7);
    return {
      prompt: tex`Számítsd ki! $\sqrt{${num(p * p)} : ${num(q * q)}}$`,
      answer: { type: 'fraction', num: p, den: q, requireSimplified: true, form: 'any' },
      hint: 'A hányados négyzetgyöke a két négyzetgyök hányadosa.',
      solution: [
        tex`$\sqrt{${num(p * p)} : ${num(q * q)}} = \sqrt{${num(p * p)}} : \sqrt{${num(q * q)}}$`,
        tex`$= ${num(p)} : ${num(q)} = ${texFrac(p, q)}$`,
        tex`Az eredmény **$${texFrac(p, q)}$**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-02',
  goals: [
    'megérteni, mit jelent a négyzetgyök,',
    'gyököt vonni négyzetszámokból, törtekből és tizedes törtekből,',
    'megoldani az $x^2 = a$ egyenletet,',
    'megkülönböztetni a $\\sqrt{a^2}$ és az $|a|$ kapcsolatát.',
  ],
  parts: [
    {
      title: 'A négyzetgyök fogalma',
      steps: [
        {
          type: 'theory',
          title: 'Mi a négyzetgyök?',
          body: 'A $\\sqrt{a}$ az a nemnegatív szám, amelynek a négyzete $a$. Például $\\sqrt{25} = 5$, mert $5^2 = 25$.',
          figure: areaSquareFigure(5, '5 cm'),
          remember: '$(\\sqrt{a})^2 = a$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mennyi $\\sqrt{49}$?',
            answer: textChoice('$7$', ['$-7$', '$14$', '$49$']),
            hint: 'Melyik nemnegatív szám négyzete $49$?',
            solution: ['$7^2 = 49$, ezért $\\sqrt{49} = 7$.', 'A $-7$ nem lehet, mert a négyzetgyök értéke nemnegatív.'],
          },
        },
        {
          type: 'theory',
          title: 'Nemnegatív eredmény',
          body: 'A négyzetgyök értéke mindig nemnegatív: $\\sqrt{9} = 3$, nem $-3$. A $-\\sqrt{9} = -3$ viszont megengedett.',
          remember: '$\\sqrt{a} \\ge 0$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**$\\sqrt{16} = -4$**',
            answer: { type: 'truefalse', value: false },
            hint: 'A négyzetgyök eredménye soha nem negatív.',
            solution: ['$4^2 = 16$, ezért $\\sqrt{16} = 4$.', 'A $-4$ csak a $-\\sqrt{16}$ értéke. Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'sqrt-int', level: 1, count: 2 },
      ],
    },
    {
      title: 'Törtek és tizedes törtek gyöke',
      steps: [
        {
          type: 'theory',
          title: 'Törtek négyzetgyöke',
          body: 'A tört négyzetgyökét a számláló és a nevező négyzetgyökével kapod: $\\sqrt{\\frac{9}{25}} = \\frac{3}{5}$.',
          figure: { type: 'fractionModel', shape: 'rect', parts: 25, rows: 5, shaded: 9, label: '9/25' },
          remember: '$\\sqrt{\\frac{p^2}{q^2}} = \\frac{p}{q}$',
        },
        {
          type: 'example',
          title: 'Tört gyöke',
          problem: 'Számítsd ki! $\\sqrt{\\frac{49}{16}}$',
          steps: [
            { text: '$\\sqrt{49} = 7$ és $\\sqrt{16} = 4$' },
            { text: '$\\sqrt{\\frac{49}{16}} = \\frac{7}{4}$' },
          ],
          answer: 'Az eredmény $\\frac{7}{4}$.',
        },
        { type: 'practice', generator: 'sqrt-frac', level: 1, count: 2 },
        {
          type: 'theory',
          title: 'Tizedes törtek gyöke',
          body: 'A négyzetes tizedes törtből könnyű gyököt vonni: $0,49 = 0,7^2$, ezért $\\sqrt{0,49} = 0,7$.',
          remember: '$\\sqrt{0,49} = 0,7$',
        },
        { type: 'practice', generator: 'sqrt-decimal', level: 1, count: 2 },
      ],
    },
    {
      title: 'Az x² = a egyenlet',
      steps: [
        {
          type: 'theory',
          title: 'Két megoldás',
          body: 'Az $x^2 = 49$ egyenletnek két megoldása van: $x = 7$ és $x = -7$. A $\\sqrt{49}$ viszont csak a nemnegatív $7$.',
          remember: '$x^2 = a$: $x = \\pm\\sqrt{a}$, ha $a > 0$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Hány megoldása van az $x^2 = -9$ egyenletnek?',
            answer: textChoice('$0$', ['$1$', '$2$', '$9$']),
            hint: 'Egy szám négyzete lehet negatív?',
            solution: ['Egyetlen valós szám négyzete sem negatív.', 'Ezért az $x^2 = -9$ egyenletnek **nincs megoldása**.'],
          },
        },
        {
          type: 'example',
          title: 'Oldd meg!',
          problem: 'Oldd meg! $x^2 = 64$',
          steps: [
            { text: 'Négyzetgyököt vonunk: $x = \\pm\\sqrt{64}$' },
            { text: '$x = 8$ vagy $x = -8$' },
          ],
          answer: 'A megoldások: $x_1 = -8$, $x_2 = 8$.',
        },
        { type: 'practice', generator: 'solve-x2', level: 1, count: 2 },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A $\\sqrt{4}$ ugyanaz, mint az $x^2 = 4$ egyenlet megoldásai.**',
            answer: { type: 'truefalse', value: false },
            hint: 'A gyök egyetlen szám; az egyenletnek hány megoldása van?',
            solution: ['$\\sqrt{4} = 2$ (egy szám).', 'Az $x^2 = 4$ megoldásai $2$ és $-2$. Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'how-many', level: 1 },
      ],
    },
    {
      title: '√(a²) és a gyökök szorzata',
      steps: [
        {
          type: 'theory',
          title: 'A négyzet gyöke',
          body: '$\\sqrt{(-5)^2} = \\sqrt{25} = 5$. Általában $\\sqrt{a^2} = |a|$, mert a gyök nem lehet negatív.',
          remember: '$\\sqrt{a^2} = |a|$',
        },
        {
          type: 'example',
          title: 'Abszolút érték',
          problem: 'Számítsd ki! $\\sqrt{(-7)^2}$',
          steps: [
            { text: '$(-7)^2 = 49$' },
            { text: '$\\sqrt{49} = 7 = |-7|$' },
          ],
          answer: 'Az eredmény $7$.',
        },
        { type: 'practice', generator: 'truth', level: 1, count: 2 },
        {
          type: 'theory',
          title: 'Szorzat és hányados',
          body: '$\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ és $\\sqrt{a : b} = \\sqrt{a} : \\sqrt{b}$, ha $a, b \\ge 0$.',
          remember: '$\\sqrt{36 \\cdot 25} = 6 \\cdot 5 = 30$',
        },
        { type: 'practice', generator: 'sqrt-product', level: 3, count: 2 },
        { type: 'practice', generator: 'truth', level: 2 },
        { type: 'practice', generator: 'sqrt-frac', level: 2 },
        { type: 'practice', generator: 'sqrt-decimal', level: 2 },
      ],
    },
  ],
  generators: [sqrtInt, sqrtFrac, sqrtDecimal, solveX2, howMany, truth, sqrtProduct],
  miniTest: {
    items: [
      { generator: 'sqrt-int', level: 1 },
      { generator: 'sqrt-frac', level: 1 },
      { generator: 'sqrt-decimal', level: 2 },
      { generator: 'solve-x2', level: 1 },
      { generator: 'how-many', level: 2 },
      { generator: 'truth', level: 2 },
      { generator: 'sqrt-product', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'sqrt-int', level: 1 },
    { generator: 'sqrt-int', level: 2 },
    { generator: 'sqrt-frac', level: 1 },
    { generator: 'sqrt-decimal', level: 1 },
    { generator: 'solve-x2', level: 1 },
    { generator: 'how-many', level: 1 },
    { generator: 'truth', level: 1 },
  ],
});
