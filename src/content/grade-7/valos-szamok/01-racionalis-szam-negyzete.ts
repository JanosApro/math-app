/**
 * 7. osztály › Valós számok › 1. A racionális szám négyzete
 *
 * Integers, fractions p/q and decimals get equal weight. The square is introduced as the area
 * of a square, then the sign traps (−a)² vs −a² and a² vs 2a, and finally short expressions and
 * area word problems.
 */
import {
  choice,
  clean,
  defineSubtopic,
  gcd,
  lcm,
  num,
  paren,
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

/** A square with one labelled side, following the generated side length. */
function squareFigure(side: number, label: string): Figure {
  return { type: 'quadrilateral', shape: 'square', a: side, sideLabels: { a: label }, fill: true };
}

/** LaTeX fraction with parentheses, ready to be squared. */
const fracParen = (p: number, q: number) => tex`\left(${texFrac(p, q)}\right)`;

/** Simplified fraction from n/d, for fraction answers. */
function reduced(n: number, d: number): [number, number] {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Square of an integer. L1 positive, L2 negative. */
const squareInt: GeneratorDef = {
  id: 'square-int',
  title: 'Egész szám négyzete',
  levels: [1, 2],
  generate(rng, level): Question {
    const a = level === 1 ? rng.int(2, 13) : -rng.int(2, 13);
    const q = a * a;
    return {
      prompt: tex`Számítsd ki! $${paren(a)}^2$`,
      answer: { type: 'number', value: q },
      inputLabel: '$= $',
      hint: 'A négyzetre emelés azt jelenti, hogy a számot önmagával szorozzuk.',
      solution: [
        tex`$${paren(a)}^2 = ${paren(a)} \cdot ${paren(a)}$`,
        tex`$= ${num(q)}$`,
        tex`Az eredmény **${num(q)}**.`,
      ],
    };
  },
};

/** Square of a fraction p/q. L1 positive, L2 negative. */
const squareFrac: GeneratorDef = {
  id: 'square-frac',
  title: 'Tört négyzete',
  levels: [1, 2],
  generate(rng, level): Question {
    const q = rng.int(2, level === 1 ? 8 : 12);
    let p = rng.int(1, q - 1);
    while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
    const signedP = level === 1 ? p : -p;
    const n = p * p;
    const d = q * q;
    const shown = level === 1 ? fracParen(p, q) : tex`\left(${texFrac(signedP, q)}\right)`;
    return {
      prompt: tex`Számítsd ki! $${shown}^2$`,
      answer: { type: 'fraction', num: n, den: d, requireSimplified: true },
      hint: 'A törtet úgy emeled négyzetre, hogy a számlálót és a nevezőt is négyzetre emeled.',
      solution: [
        level === 1
          ? tex`$${shown}^2 = \frac{${num(p)}^2}{${num(q)}^2}$`
          : tex`A mínusz a zárójelen belül van, ezért a négyzet pozitív: $${shown}^2 = \frac{${num(p)}^2}{${num(q)}^2}$`,
        tex`$= ${texFrac(n, d)}$`,
        tex`Az eredmény **$${texFrac(n, d)}$**.`,
      ],
    };
  },
};

/** Square of a decimal. L1 positive one-decimal numbers, L2 negative ones. */
const squareDecimal: GeneratorDef = {
  id: 'square-decimal',
  title: 'Tizedes tört négyzete',
  levels: [1, 2],
  generate(rng, level): Question {
    const k = level === 1 ? rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]) : -rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]);
    const x = clean(k / 10);
    const q = clean((k * k) / 100);
    return {
      prompt: tex`Számítsd ki! $${paren(x)}^2$`,
      answer: { type: 'number', value: q },
      inputLabel: '$= $',
      hint: 'A tizedes törtet is önmagával szorzod. A négyzet két tizedesjegyű lesz.',
      solution: [
        tex`$${paren(x)}^2 = ${paren(x)} \cdot ${paren(x)}$`,
        tex`$= ${num(q)}$`,
        tex`Az eredmény **${num(q)}**.`,
      ],
    };
  },
};

/** Multiple choice with the two classic mistakes: wrong sign and doubling instead of squaring. */
const signTrap: GeneratorDef = {
  id: 'sign-trap',
  title: 'Előjel- és megduplázási csapda',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(3, 9);
      const q = a * a;
      return {
        prompt: tex`Mennyi $${paren(-a)}^2$?`,
        answer: choice(rng, `$${num(q)}$`, [`$${num(-q)}$`, `$${num(2 * a)}$`, `$${num(-2 * a)}$`]),
        hint: 'A zárójelben lévő negatív számot önmagával szorozd meg!',
        solution: [
          tex`$${paren(-a)}^2 = ${paren(-a)} \cdot ${paren(-a)} = ${num(q)}$`,
          tex`A megduplázás $${num(2 * a)}$ lenne, az nem négyzetre emelés.`,
          tex`A helyes eredmény **${num(q)}**.`,
        ],
      };
    }
    if (rng.chance(0.5)) {
      const q = rng.int(2, 9);
      let p = rng.int(1, q - 1);
      while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
      const [n, d] = reduced(p * p, q * q);
      const [tn, td] = reduced(2 * p, q);
      const twice = td === 1 ? num(tn) : texFrac(tn, td);
      return {
        prompt: tex`Mennyi $${fracParen(-p, q)}^2$?`,
        answer: choice(rng, `$${texFrac(n, d)}$`, [
          `$${texFrac(-n, d)}$`,
          `$${twice}$`,
          `$−${twice}$`,
        ]),
        hint: 'A negatív tört négyzete pozitív. A számlálót és a nevezőt is négyzetre emeld!',
        solution: [
          tex`$${fracParen(-p, q)}^2 = \frac{${num(p)}^2}{${num(q)}^2} = ${texFrac(n, d)}$`,
          tex`A megduplázás $${twice}$ lenne, az nem négyzetre emelés.`,
          tex`A helyes eredmény **$${texFrac(n, d)}$**.`,
        ],
      };
    }
    const k = rng.pick([3, 4, 5, 6, 7, 8, 9, 11, 12]);
    const x = clean(-k / 10);
    const q = clean((k * k) / 100);
    return {
      prompt: tex`Mennyi $${paren(x)}^2$?`,
      answer: choice(rng, `$${num(q)}$`, [`$${num(-q)}$`, `$${num(clean((2 * k) / 10))}$`, `$${num(clean((-2 * k) / 10))}$`]),
      hint: 'Két negatív szám szorzata pozitív. Figyelj, ne duplázz!',
      solution: [
        tex`$${paren(x)}^2 = ${paren(x)} \cdot ${paren(x)} = ${num(q)}$`,
        tex`A megduplázás $${num(clean((2 * k) / 10))}$ lenne, az nem négyzetre emelés.`,
        tex`A helyes eredmény **${num(q)}**.`,
      ],
    };
  },
};

/** True/false statements about squares, including the sign and the "never negative" traps. */
const trueFalse: GeneratorDef = {
  id: 'truefalse',
  title: 'Igaz vagy hamis?',
  levels: [1, 2],
  generate(rng, level): Question {
    type Pair = { statement: string; value: boolean; why: string };
    let item: Pair;
    if (level === 1) {
      const k = rng.int(3, 12);
      const kind = rng.pick(['square', 'double', 'negative', 'positive'] as const);
      if (kind === 'square') item = { statement: `$${num(k)}^2 = ${num(k * k)}$`, value: true, why: `$${num(k)} \\cdot ${num(k)} = ${num(k * k)}$` };
      else if (kind === 'double') item = { statement: `$${num(k)}^2 = ${num(2 * k)}$`, value: false, why: `$${num(k)}^2 = ${num(k)} \\cdot ${num(k)} = ${num(k * k)}$, nem $${num(2 * k)}$.` };
      else if (kind === 'negative') item = { statement: `$(-${num(k)})^2 = -${num(k * k)}$`, value: false, why: `Két negatív szám szorzata pozitív: $${num(k * k)}$.` };
      else item = { statement: `$(-${num(k)})^2 = ${num(k * k)}$`, value: true, why: `$${paren(-k)} \\cdot ${paren(-k)} = ${num(k * k)}$.` };
    } else {
      rng.next(); // one spare draw: small seeds otherwise all pick the same statement type
      const kind = rng.pick(['decimal-true', 'decimal-false', 'fraction-true', 'fraction-false', 'never', 'difference', 'equal-squares', 'negative-positive'] as const);
      if (kind === 'decimal-true' || kind === 'decimal-false') {
        const k = rng.int(2, 9);
        const sq = num(clean((k * k) / 100));
        item =
          kind === 'decimal-true'
            ? { statement: `$(-0,${num(k)})^2 = ${sq}$`, value: true, why: `$0,${num(k)}^2 = ${sq}$, a mínusz eltűnik.` }
            : { statement: `$(-0,${num(k)})^2 = -${sq}$`, value: false, why: `Két negatív szám szorzata pozitív: $0,${num(k)}^2 = ${sq}$.` };
      } else if (kind === 'fraction-true' || kind === 'fraction-false') {
        const q = rng.int(3, 9);
        let p = rng.int(1, q - 1);
        while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
        item =
          kind === 'fraction-true'
            ? { statement: `$\\left(\\frac{${num(p)}}{${num(q)}}\\right)^2 = ${texFrac(p * p, q * q)}$`, value: true, why: `A számlálót és a nevezőt is négyzetre emeljük.` }
            : { statement: `$\\left(\\frac{${num(p)}}{${num(q)}}\\right)^2 = ${texFrac(p * p, q)}$`, value: false, why: `A nevezőt is négyzetre kell emelni: $${texFrac(p * p, q * q)}$.` };
      } else if (kind === 'never') {
        item = { statement: 'Minden racionális szám négyzete nemnegatív.', value: true, why: 'A négyzet terület, ezért nem lehet negatív.' };
      } else if (kind === 'difference') {
        item = { statement: '$(-3)^2 = -3^2$', value: false, why: '$(-3)^2 = 9$, viszont $-3^2 = -9$.' };
      } else if (kind === 'equal-squares') {
        item = { statement: 'Két különböző szám négyzete nem lehet egyenlő.', value: false, why: '$2^2 = 4$ és $(-2)^2 = 4$, pedig $2 \\ne -2$.' };
      } else {
        item = { statement: 'Egy negatív szám négyzete mindig pozitív.', value: true, why: 'Két negatív szám szorzata pozitív, ezért a négyzet pozitív.' };
      }
    }
    return {
      prompt: `Igaz vagy hamis?\n\n**${item.statement}**`,
      answer: { type: 'truefalse', value: item.value },
      hint: 'Számolj utána: a négyzetre emelésnél a számot önmagával szorzod.',
      solution: [item.why, item.value ? 'Az állítás **igaz**.' : 'Az állítás **hamis**.'],
    };
  },
};

/** Area of a square from its side (fraction or decimal). L3 word problems. */
const areaSquare: GeneratorDef = {
  id: 'area-square',
  title: 'Négyzet területe',
  levels: [3],
  generate(rng): Question {
    const [unit, what] = rng.pick([
      ['m', 'kert'],
      ['dm', 'szőnyeg'],
      ['cm', 'kártya'],
    ] as const);
    if (rng.chance(0.5)) {
      const q = rng.int(2, 8);
      let p = rng.int(1, q + 3);
      while (gcd(p, q) !== 1) p = rng.int(1, q + 3);
      const side = p / q;
      const [n, d] = reduced(p * p, q * q);
      return {
        prompt: tex`Egy négyzet alakú ${what} oldala $${texFrac(p, q)}$ ${unit}. Mekkora a területe?`,
        figure: squareFigure(side, `${num(p)}/${num(q)} ${unit}`),
        answer: { type: 'fraction', num: n, den: d, requireSimplified: true, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'A négyzet területe az oldal négyzete: $T = a^2$.',
        solution: [
          tex`$T = a^2 = ${fracParen(p, q)}^2$`,
          tex`$T = \frac{${num(p)}^2}{${num(q)}^2} = ${texFrac(p * p, q * q)}$`,
          tex`A terület **$${texFrac(n, d)}$ ${unit}²**.`,
        ],
      };
    }
    const k = rng.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]);
    const side = clean(k / 10);
    const area = clean((k * k) / 100);
    return {
      prompt: tex`Egy négyzet alakú ${what} oldala $${num(side)}$ ${unit}. Mekkora a területe?`,
      figure: squareFigure(side, `${num(side)} ${unit}`),
      answer: { type: 'number', value: area, unit: `${unit}²` },
      inputLabel: '$T =$',
      hint: 'A négyzet területe az oldal négyzete: $T = a^2$.',
      solution: [
        tex`$T = a^2 = ${num(side)}^2$`,
        tex`$T = ${num(side)} \cdot ${num(side)} = ${num(area)}$`,
        tex`A terület **${num(area)} ${unit}²**.`,
      ],
    };
  },
};

/** Short expressions with squares. L3. */
const expressions: GeneratorDef = {
  id: 'expressions',
  title: 'Kifejezések négyzetekkel',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['sum', 'difference', 'fraction-sum', 'twice'] as const);
    if (kind === 'sum') {
      const a = rng.int(2, 7);
      const b = rng.int(2, 7);
      return {
        prompt: tex`Számítsd ki! $${paren(-a)}^2 + ${num(b)}^2$`,
        answer: { type: 'number', value: a * a + b * b },
        inputLabel: '$= $',
        hint: 'Előbb mindkét számot emeld négyzetre, aztán add össze őket!',
        solution: [
          tex`$${paren(-a)}^2 = ${num(a * a)}$ és $${num(b)}^2 = ${num(b * b)}$`,
          tex`$${num(a * a)} + ${num(b * b)} = ${num(a * a + b * b)}$`,
          tex`Az eredmény **${num(a * a + b * b)}**.`,
        ],
      };
    }
    if (kind === 'difference') {
      const b = rng.int(2, 5);
      const a = rng.int(b + 1, 9);
      return {
        prompt: tex`Számítsd ki! $${paren(-a)}^2 - ${num(b)}^2$`,
        answer: { type: 'number', value: a * a - b * b },
        inputLabel: '$= $',
        hint: 'Előbb emeld négyzetre a zárójeles számot és a másikat is, aztán vonj ki!',
        solution: [
          tex`$${paren(-a)}^2 = ${num(a * a)}$ és $${num(b)}^2 = ${num(b * b)}$`,
          tex`$${num(a * a)} - ${num(b * b)} = ${num(a * a - b * b)}$`,
          tex`Az eredmény **${num(a * a - b * b)}**.`,
        ],
      };
    }
    if (kind === 'fraction-sum') {
      const q = rng.int(2, 5);
      const s = rng.int(6, 9);
      let p = rng.int(1, q - 1);
      while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
      let r = rng.int(1, s - 1);
      while (gcd(r, s) !== 1) r = rng.int(1, s - 1);
      const L = lcm(q * q, s * s);
      const A = p * p * (L / (q * q));
      const B = r * r * (L / (s * s));
      const [n, d] = reduced(A + B, L);
      return {
        prompt: tex`Számítsd ki! $${fracParen(p, q)}^2 + ${fracParen(r, s)}^2$`,
        answer: { type: 'fraction', num: n, den: d, requireSimplified: true },
        hint: 'Két tört négyzetét adod össze: előbb négyzetre emelj, aztán hozz közös nevezőre!',
        solution: [
          tex`$${fracParen(p, q)}^2 = ${texFrac(p * p, q * q)}$ és $${fracParen(r, s)}^2 = ${texFrac(r * r, s * s)}$`,
          tex`Közös nevező: $${num(L)}$. Az összeg: $\frac{${num(A)} + ${num(B)}}{${num(L)}}$`,
          tex`Az eredmény **$${texFrac(n, d)}$**.`,
        ],
      };
    }
    const q = rng.int(2, 8);
    let p = rng.int(1, q - 1);
    while (gcd(p, q) !== 1) p = rng.int(1, q - 1);
    const [n, d] = reduced(2 * p * p, q * q);
    return {
      prompt: tex`Számítsd ki! $2 \cdot ${fracParen(p, q)}^2$`,
      answer: { type: 'fraction', num: n, den: d, requireSimplified: true },
      hint: 'Előbb emeld négyzetre a törtet, aztán szorozz $2$-vel!',
      solution: [
        tex`$${fracParen(p, q)}^2 = ${texFrac(p * p, q * q)}$`,
        tex`$2 \cdot ${texFrac(p * p, q * q)} = ${texFrac(2 * p * p, q * q)}$`,
        tex`Az eredmény **$${texFrac(n, d)}$**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-01',
  goals: [
    'négyzetre emelni egész számokat, törteket és tizedes törteket,',
    'tudni, hogy egy racionális szám négyzete soha nem negatív,',
    'megkülönböztetni a $(-a)^2$ és a $-a^2$ kifejezést,',
    'kiszámítani egy négyzet területét az oldalából.',
  ],
  parts: [
    {
      title: 'A négyzetre emelés',
      steps: [
        {
          type: 'theory',
          title: 'A négyzetre emelés',
          body: 'A számot önmagával szorozzuk. Egy 4 cm oldalú négyzet területe $4 \\cdot 4 = 16$ cm², azaz $4^2$.',
          figure: squareFigure(4, '4 cm'),
          remember: '$a^2 = a \\cdot a$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**$5^2 = 10$**',
            answer: { type: 'truefalse', value: false },
            hint: 'A négyzetre emelés nem a kétszeresét jelenti!',
            solution: ['$5^2 = 5 \\cdot 5 = 25$.', 'A $10$ a $2 \\cdot 5$, tehát az állítás **hamis**.'],
          },
        },
        {
          type: 'theory',
          title: 'Soha nem negatív',
          body: 'A négyzet terület, ezért nem lehet negatív. Bármely racionális szám négyzete $\\ge 0$; csak a $0$ négyzete $0$.',
          remember: '$a^2 \\ge 0$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik szám lehet egy racionális szám négyzete?',
            answer: textChoice('$0,25$', ['$-0,25$', '$-4$', '$-1,44$']),
            hint: 'Egy négyzet értéke nem lehet kisebb nullánál.',
            solution: ['A negatív számok négyzete is pozitív, ezért csak a $0,25$ lehet négyzet.'],
          },
        },
        { type: 'practice', generator: 'square-int', level: 1, count: 3 },
      ],
    },
    {
      title: 'Törtek és tizedes törtek',
      steps: [
        {
          type: 'theory',
          title: 'Törtek négyzete',
          body: 'A törtet úgy emeled négyzetre, hogy a számlálót és a nevezőt is négyzetre emeled: $\\left(\\frac{2}{3}\\right)^2 = \\frac{4}{9}$.',
          figure: { type: 'fractionModel', shape: 'rect', parts: 9, rows: 3, shaded: 4, label: '4/9' },
          remember: '$\\left(\\frac{p}{q}\\right)^2 = \\frac{p^2}{q^2}$',
        },
        {
          type: 'example',
          title: 'Tört négyzete',
          problem: 'Számítsd ki! $\\left(\\frac{3}{5}\\right)^2$',
          steps: [
            { text: '$\\left(\\frac{3}{5}\\right)^2 = \\frac{3^2}{5^2}$' },
            { text: '$= \\frac{9}{25}$' },
          ],
          answer: 'Az eredmény $\\frac{9}{25}$.',
        },
        { type: 'practice', generator: 'square-frac', level: 1, count: 2 },
        {
          type: 'theory',
          title: 'Tizedes törtek négyzete',
          body: 'A tizedes törtet is önmagával szorzod: $0,3^2 = 0,3 \\cdot 0,3 = 0,09$. Két tizedesjegy lesz az eredmény.',
          remember: '$0,3^2 = 0,09$',
        },
        { type: 'practice', generator: 'square-decimal', level: 1, count: 2 },
      ],
    },
    {
      title: 'Negatív számok négyzete',
      steps: [
        {
          type: 'theory',
          title: 'A zárójel számít',
          body: '$(-4)^2 = 16$, de $-4^2 = -16$. A zárójel nélkül csak a $4$-et emeljük négyzetre.',
          remember: '$(-a)^2 = a^2$, de $-a^2 = -(a^2)$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mennyi $(-6)^2$?',
            answer: textChoice('$36$', ['$-36$', '$12$', '$-12$']),
            hint: 'A zárójelben negatív szám van. Két negatív szám szorzata pozitív.',
            solution: ['$(-6)^2 = (-6) \\cdot (-6) = 36$.', 'A $12$ a megduplázott $6$, nem a négyzet.'],
          },
        },
        {
          type: 'example',
          title: 'Negatív tört négyzete',
          problem: 'Számítsd ki! $\\left(-\\frac{3}{4}\\right)^2$',
          steps: [
            { text: 'A mínusz a zárójelen belül van.' },
            { text: '$\\left(-\\frac{3}{4}\\right)^2 = \\frac{3^2}{4^2} = \\frac{9}{16}$' },
          ],
          answer: 'Az eredmény $\\frac{9}{16}$.',
        },
        { type: 'practice', generator: 'square-int', level: 2, count: 2 },
        { type: 'practice', generator: 'square-frac', level: 2, count: 2 },
        { type: 'practice', generator: 'truefalse', level: 1 },
      ],
    },
    {
      title: 'Kifejezések és területek',
      steps: [
        {
          type: 'theory',
          title: 'Műveletek sorrendje',
          body: 'A négyzetre emelés erősebb a műveleteknél: előbb a zárójelet, utána a négyzetet számítjuk. Például $(-2)^2 + 3^2 = 13$.',
          remember: 'Előbb zárójel, aztán négyzet.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**$-3^2 = 9$**',
            answer: { type: 'truefalse', value: false },
            hint: 'Hol van a zárójel? Csak a $3$-at emeljük négyzetre.',
            solution: ['A zárójel nélkül előbb a $3^2 = 9$ készül el, aztán jön a mínusz: $-3^2 = -9$.', 'Az állítás **hamis**.'],
          },
        },
        {
          type: 'example',
          title: 'Négyzet területe',
          problem: 'Egy négyzet oldala $\\frac{3}{4}$ m. Mekkora a területe?',
          figure: squareFigure(0.75, '3/4 m'),
          steps: [
            { text: 'A terület az oldal négyzete: $T = a^2$.' },
            { text: '$T = \\left(\\frac{3}{4}\\right)^2 = \\frac{9}{16}$ m²' },
          ],
          answer: 'A terület $\\frac{9}{16}$ m².',
        },
        { type: 'practice', generator: 'area-square', level: 3, count: 2 },
        { type: 'practice', generator: 'expressions', level: 3, count: 2 },
        { type: 'practice', generator: 'sign-trap', level: 2 },
        { type: 'practice', generator: 'square-decimal', level: 2 },
        { type: 'practice', generator: 'truefalse', level: 2 },
      ],
    },
  ],
  generators: [squareInt, squareFrac, squareDecimal, signTrap, trueFalse, areaSquare, expressions],
  miniTest: {
    items: [
      { generator: 'square-int', level: 1 },
      { generator: 'square-frac', level: 1 },
      { generator: 'square-decimal', level: 2 },
      { generator: 'sign-trap', level: 2 },
      { generator: 'truefalse', level: 2 },
      { generator: 'area-square', level: 3 },
      { generator: 'expressions', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'square-int', level: 1 },
    { generator: 'square-frac', level: 1 },
    { generator: 'square-decimal', level: 1 },
    { generator: 'sign-trap', level: 1 },
    { generator: 'truefalse', level: 1 },
    { generator: 'area-square', level: 3 },
  ],
});
