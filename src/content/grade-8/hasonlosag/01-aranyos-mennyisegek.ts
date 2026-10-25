/**
 * 8. osztály › Háromszögek hasonlósága › 1. Arányos mennyiségek
 *
 * Ratio of two segments, proportion a : b = c : d (ad = bc), the fourth proportional,
 * map scale with unit conversion and the idea of commensurable / incommensurable segments.
 */
import {
  article,
  clean,
  defineSubtopic,
  frac,
  gcd,
  lcm,
  num,
  tex,
  texFrac,
  textChoice,
  type Figure,
  type Frac,
  type GeneratorDef,
  type Question,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** Plain-text fraction for figure labels: 3/4, 2, … */
const plainFrac = (f: Frac) => (f.den === 1 ? num(f.num) : `${num(f.num)}/${num(f.den)}`);

/** "A" or "Az" at the start of a sentence, chosen for the number that follows. */
const capArticle = (n: number) => {
  const a = article(n);
  return a[0].toUpperCase() + a.slice(1);
};

/** LaTeX for a fraction (integers stay integers). */
const mathFrac = (f: Frac) => (f.den === 1 ? num(f.num) : texFrac(f.num, f.den));

/** Two bars whose lengths show the ratio a : b. */
function ratioFigure(a: number, b: number, aLabel?: string, bLabel?: string): Figure {
  return {
    type: 'barModel',
    rows: [
      { label: 'a', segments: [{ value: a, label: aLabel ?? num(a), color: 'blue' }] },
      { label: 'b', segments: [{ value: b, label: bLabel ?? num(b), color: 'orange' }] },
    ],
  };
}

/** A square with one diagonal; the classic incommensurable pair. */
const squareDiagonal: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [1, 0], C: [1, 1], D: [0, 1] },
  items: [
    { kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: true, vertexLabels: false },
    { kind: 'segment', from: 'A', to: 'C', color: 'highlight', width: 'thick' },
    { kind: 'point', at: 'A', labelDir: 'sw' },
    { kind: 'point', at: 'B', labelDir: 'se' },
    { kind: 'point', at: 'C', labelDir: 'ne' },
    { kind: 'point', at: 'D', labelDir: 'nw' },
    { kind: 'label', at: [0.5, 0], text: '1', dir: 's' },
    { kind: 'label', at: [0.5, 0.5], text: '√2', dir: 'e' },
  ],
};

/** Nice coprime pairs for ratio exercises. */
const RATIO_PAIRS: [number, number][] = [
  [2, 3],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 6],
  [3, 7],
  [5, 8],
  [4, 7],
  [2, 7],
  [5, 9],
  [4, 9],
];

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Simplify a ratio. L1 integers, L2 fractions and decimals. */
const simplifyRatio: GeneratorDef = {
  id: 'simplify-ratio',
  title: 'Arány egyszerűsítése',
  levels: [1, 2],
  generate(rng, level): Question {
    let a: Frac;
    let b: Frac;
    let decimal = false;
    if (level === 1) {
      const [p, q] = rng.pick(RATIO_PAIRS);
      const k = rng.int(2, 7);
      a = frac(p * k, 1);
      b = frac(q * k, 1);
    } else if (rng.chance(0.5)) {
      // decimals: 0,6 : 0,9 = 2 : 3
      decimal = true;
      const pool: [number, number, number, number][] = [
        [6, 10, 9, 10],
        [12, 10, 8, 10],
        [25, 100, 75, 100],
        [15, 10, 25, 10],
        [4, 10, 12, 10],
        [15, 100, 3, 10],
        [6, 10, 3, 10],
        [125, 100, 75, 100],
      ];
      const [n1, d1, n2, d2] = rng.pick(pool);
      a = frac(n1, d1);
      b = frac(n2, d2);
    } else {
      // fractions: 3/4 : 1/2 = 3 : 2
      const pool: [number, number, number, number][] = [
        [3, 4, 1, 2],
        [2, 3, 4, 9],
        [5, 6, 5, 12],
        [1, 2, 1, 3],
        [3, 5, 9, 10],
        [4, 9, 2, 3],
        [5, 8, 5, 4],
        [2, 5, 4, 15],
      ];
      const [n1, d1, n2, d2] = rng.pick(pool);
      a = frac(n1, d1);
      b = frac(n2, d2);
    }
    // Scale both terms to integers with the common denominator, then simplify.
    const D = lcm(a.den, b.den);
    const ia = a.num * (D / a.den);
    const ib = b.num * (D / b.den);
    const g = gcd(ia, ib) || 1;
    const x = ia / g;
    const y = ib / g;
    const aText = decimal ? num(a.num / a.den) : mathFrac(a);
    const bText = decimal ? num(b.num / b.den) : mathFrac(b);

    return {
      prompt: tex`Egyszerűsítsd az arányt! Az eredményt $x : y$ alakban add meg.\n\n$${aText} : ${bText}$`,
      figure: ratioFigure(a.num / a.den, b.num / b.den, decimal ? num(a.num / a.den) : plainFrac(a), decimal ? num(b.num / b.den) : plainFrac(b)),
      answer: { type: 'numbers', fields: [{ label: '$x =$', value: x }, { label: '$y =$', value: y }] },
      hint: 'Az arány értéke nem változik, ha mindkét tagját ugyanazzal a nullától különböző számmal osztod.',
      solution: [
        tex`Az arány: $${aText} : ${bText}$.`,
        decimal
          ? tex`Mindkét tagot ugyanazzal a számmal szorozva: $${num(ia)} : ${num(ib)}$.`
          : tex`Az arány értéke: $${aText} : ${bText} = ${mathFrac(frac(ia, ib))}$.`,
        g === 1
          ? tex`Az arány már a legegyszerűbb alakban: $${num(ia)} : ${num(ib)}$.`
          : tex`Egyszerűsítve: $${num(ia)} : ${num(ib)} = ${num(x)} : ${num(y)}$.`,
        tex`A legegyszerűbb alak: **$${num(x)} : ${num(y)}$**.`,
      ],
    };
  },
};

/** The fourth proportional. L1 integers, L2 decimals/fractions, L3 real-life proportion. */
const missingTerm: GeneratorDef = {
  id: 'missing-term',
  title: 'Az aránypár hiányzó tagja',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const kind = rng.pick(['apple', 'car', 'egg', 'paint'] as const);
      if (kind === 'apple') {
        const x1 = rng.pick([2, 3, 4, 5]);
        const price = rng.pick([300, 320, 400, 450]);
        const y1 = x1 * price;
        const x2 = rng.pick([6, 7, 8, 10]);
        const answer = price * x2;
        return {
          prompt: tex`$${num(x1)}$ kg alma $${num(y1)}$ dinárba kerül. Mennyibe kerül $${num(x2)}$ kg?`,
          answer: { type: 'number', value: answer, unit: 'dinár' },
          hint: 'Írd fel az aránypárt: ahány kg, annyiszor annyi dinár. Előbb számold ki 1 kg árát!',
          solution: [
            tex`$${num(x1)}$ kg $${num(y1)}$ dinár, $${num(x2)}$ kg $x$ dinár.`,
            tex`Az aránypár: $${num(x1)} : ${num(y1)} = ${num(x2)} : x$.`,
            tex`$x = ${num(y1)} \cdot ${num(x2)} : ${num(x1)} = ${num(answer)}$`,
            tex`${Article(num(x2))} $${num(x2)}$ kg alma **${num(answer)} dinár**.`,
          ],
        };
      }
      if (kind === 'car') {
        const x1 = rng.pick([4, 5, 6, 8]);
        const km1 = x1 * 16;
        const x2 = rng.pick([10, 12, 15]);
        const answer = 16 * x2;
        return {
          prompt: tex`Egy autó $${num(x1)}$ liter benzinnel $${num(km1)}$ km-t tesz meg. Hány km-t tesz meg $${num(x2)}$ literrel?`,
          answer: { type: 'number', value: answer, unit: 'km' },
          hint: 'Előbb számold ki, hány km-t tesz meg 1 liter benzinből!',
          solution: [
            tex`$${num(x1)}$ liter $\rightarrow$ $${num(km1)}$ km, $${num(x2)}$ liter $\rightarrow$ $x$ km.`,
            tex`Az aránypár: $${num(x1)} : ${num(km1)} = ${num(x2)} : x$.`,
            tex`$x = ${num(km1)} \cdot ${num(x2)} : ${num(x1)} = ${num(answer)}$`,
            tex`${Article(num(x2))} $${num(x2)}$ literrel **${num(answer)} km**-t tesz meg.`,
          ],
        };
      }
      if (kind === 'egg') {
        const x1 = rng.pick([4, 6, 8]);
        const y1 = (x1 / 4) * 6;
        const x2 = rng.pick([10, 12, 14]);
        const answer = (x2 / 4) * 6;
        return {
          prompt: tex`$${num(x1)}$ adaghoz $${num(y1)}$ tojás kell. Hány tojás kell $${num(x2)}$ adaghoz?`,
          answer: { type: 'number', value: answer, unit: 'db' },
          hint: 'Írd fel az aránypárt: adag : tojás = adag : tojás.',
          solution: [
            tex`$${num(x1)}$ adag $\rightarrow$ $${num(y1)}$ tojás, $${num(x2)}$ adag $\rightarrow$ $x$ tojás.`,
            tex`$${num(x1)} : ${num(y1)} = ${num(x2)} : x$`,
            tex`$x = ${num(y1)} \cdot ${num(x2)} : ${num(x1)} = ${num(answer)}$`,
            tex`${Article(num(x2))} $${num(x2)}$ adaghoz **${num(answer)} tojás** kell.`,
          ],
        };
      }
      const x1 = rng.pick([2, 3, 4]);
      const y1 = x1 * 8;
      const x2 = rng.pick([5, 6, 7, 9]);
      const answer = x2 * 8;
      return {
        prompt: tex`$${num(x1)}$ liter festék $${num(y1)}$ m²-re elég. Hány m²-re elég $${num(x2)}$ liter?`,
        answer: { type: 'number', value: answer, unit: 'm²' },
        hint: 'Előbb számold ki, hány m²-re elég 1 liter festék!',
        solution: [
          tex`$${num(x1)}$ liter $\rightarrow$ $${num(y1)}$ m², $${num(x2)}$ liter $\rightarrow$ $x$ m².`,
          tex`$${num(x1)} : ${num(y1)} = ${num(x2)} : x$`,
          tex`$x = ${num(y1)} \cdot ${num(x2)} : ${num(x1)} = ${num(answer)}$`,
          tex`${Article(num(x2))} $${num(x2)}$ liter festék **${num(answer)} m²**-re elég.`,
        ],
      };
    }

    if (level === 1) {
      const [p, q] = rng.pick(RATIO_PAIRS);
      const n = rng.int(2, 9);
      const a = p;
      const b = q;
      const c = p * n;
      const x = q * n;
      return {
        prompt: tex`Oldd meg az aránypárt! $${num(a)} : ${num(b)} = ${num(c)} : x$`,
        answer: { type: 'number', value: x },
        inputLabel: '$x =$',
        hint: tex`A külső tagok szorzata egyenlő a belső tagok szorzatával: $a \cdot d = b \cdot c$.`,
        solution: [
          tex`A külső tagok $${num(a)}$ és $x$, a belső tagok $${num(b)}$ és $${num(c)}$.`,
          tex`$${num(a)} \cdot x = ${num(b)} \cdot ${num(c)} = ${num(b * c)}$`,
          tex`$x = ${num(b * c)} : ${num(a)} = ${num(x)}$`,
          tex`A hiányzó tag **${num(x)}**.`,
        ],
      };
    }

    if (rng.chance(0.5)) {
      // decimal proportion, whole answer
      const [p, q] = rng.pick(RATIO_PAIRS);
      const k = rng.pick([0.5, 1.5, 2.5]);
      const s = rng.int(2, 8);
      const a = clean(p * k);
      const b = clean(q * k);
      const c = p * s;
      const x = q * s;
      return {
        prompt: tex`Oldd meg az aránypárt! $${num(a)} : ${num(b)} = ${num(c)} : x$`,
        answer: { type: 'number', value: x },
        inputLabel: '$x =$',
        hint: 'A tizedes tagokkal is ugyanaz a szabály: a külső tagok szorzata egyenlő a belső tagokéval.',
        solution: [
          tex`$${num(a)} \cdot x = ${num(b)} \cdot ${num(c)}$`,
          tex`$${num(a)} \cdot x = ${num(clean(b * c))}$`,
          tex`$x = ${num(clean(b * c))} : ${num(a)} = ${num(x)}$`,
          tex`A hiányzó tag **${num(x)}**.`,
        ],
      };
    }

    // fraction proportion, fraction answer
    const a = rng.pick([frac(1, 2), frac(3, 4), frac(2, 3), frac(3, 5), frac(5, 6), frac(4, 5)]);
    const b = rng.pick([frac(1, 3), frac(2, 3), frac(3, 4), frac(2, 5), frac(5, 6), frac(3, 8)]);
    const n = rng.pick([frac(2, 1), frac(3, 1), frac(1, 2), frac(3, 2)]);
    const c = simplifyFrac(frac(a.num * n.num, a.den * n.den));
    const x = simplifyFrac(frac(b.num * n.num, b.den * n.den));
    return {
      prompt: tex`Oldd meg az aránypárt! $${mathFrac(a)} : ${mathFrac(b)} = ${mathFrac(c)} : x$`,
      answer: { type: 'fraction', num: x.num, den: x.den, requireSimplified: true, form: 'any' },
      inputLabel: '$x =$',
      hint: 'Szorozd össze a külső és a belső tagokat, aztán rendezd az egyenletet!',
      solution: [
        tex`A külső tagok: $${mathFrac(a)}$ és $x$; a belső tagok: $${mathFrac(b)}$ és $${mathFrac(c)}$.`,
        tex`$${mathFrac(a)} \cdot x = ${mathFrac(b)} \cdot ${mathFrac(c)} = ${mathFrac(simplifyFrac(frac(b.num * c.num, b.den * c.den)))}$`,
        tex`$x = ${mathFrac(simplifyFrac(frac(b.num * c.num, b.den * c.den)))} : ${mathFrac(a)} = ${mathFrac(x)}$`,
        tex`A hiányzó tag **$${mathFrac(x)}$**.`,
      ],
    };
  },
};

/** Local exact fraction helper (simplify without importing a name clash). */
function simplifyFrac(f: Frac): Frac {
  const g = gcd(f.num, f.den) || 1;
  return frac(f.num / g, f.den / g);
}

/** Map scale: map distance → real distance. L2 simple, L3 two-step. */
const mapScale: GeneratorDef = {
  id: 'map-scale',
  title: 'Távolság a térképen és a valóságban',
  levels: [2, 3],
  generate(rng, level): Question {
    const scales = [10000, 20000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000];
    const n = rng.pick(scales);
    if (level === 2) {
      const d = rng.pick([2, 3, 4, 5, 6, 7, 8, 10, 12, 15]);
      const km = clean((n * d) / 100000);
      return {
        prompt: tex`Egy térkép méretaránya $1 : ${num(n)}$. Két pont távolsága a térképen $${num(d)}$ cm. Mekkora a valós távolság?`,
        answer: { type: 'number', value: km, unit: 'km' },
        hint: 'A méretarány szerint 1 cm a térképen ' + num(n) + ' cm a valóságban. Váltsd át km-be!',
        solution: [
          tex`$1$ cm a térképen $${num(n)}$ cm a valóságban.`,
          tex`$${num(n)}$ cm $= ${num(clean(n / 100000))}$ km.`,
          tex`$${num(d)}$ cm a térképen $${num(d)} \cdot ${num(clean(n / 100000))} = ${num(km)}$ km.`,
          tex`A valós távolság **${num(km)} km**.`,
        ],
      };
    }

    if (rng.chance(0.5)) {
      // two sections of a route
      const d1 = rng.pick([2, 3, 4, 5, 6]);
      const d2 = rng.pick([4, 5, 7, 8, 10]);
      const km = clean((n * (d1 + d2)) / 100000);
      return {
        prompt: tex`A térképen egy út két szakasza $${num(d1)}$ cm és $${num(d2)}$ cm. A méretarány $1 : ${num(n)}$. Milyen hosszú az út a valóságban?`,
        answer: { type: 'number', value: km, unit: 'km' },
        hint: 'Előbb add össze a két térképi szakaszt, aztán váltsd át a méretarány segítségével!',
        solution: [
          tex`A térképen az út hossza: $${num(d1)} + ${num(d2)} = ${num(d1 + d2)}$ cm.`,
          tex`$${num(n)}$ cm $= ${num(clean(n / 100000))}$ km.`,
          tex`$${num(d1 + d2)} \cdot ${num(clean(n / 100000))} = ${num(km)}$ km.`,
          tex`Az út a valóságban **${num(km)} km** hosszú.`,
        ],
      };
    }

    // a map length that corresponds to a given real distance
    const m = rng.pick([2, 4, 5, 8]);
    const r = m * rng.pick([2.5, 5, 10, 15]);
    const d = rng.pick([3, 6, 7, 9, 11]);
    const km = clean((r * d) / m);
    return {
      prompt: tex`A térképen $${num(m)}$ cm felel meg $${num(r)}$ km-nek. Hány km-nek felel meg $${num(d)}$ cm?`,
      answer: { type: 'number', value: km, unit: 'km' },
      hint: 'Előbb számold ki, hány km felel meg 1 cm-nek a térképen!',
      solution: [
        tex`$${num(m)}$ cm $\rightarrow$ $${num(r)}$ km, tehát $1$ cm $\rightarrow$ $${num(clean(r / m))}$ km.`,
        tex`$${num(d)}$ cm $\rightarrow$ $${num(d)} \cdot ${num(clean(r / m))} = ${num(km)}$ km.`,
        tex`A valós távolság **${num(km)} km**.`,
      ],
    };
  },
};

/** True/false: is the written proportion true? */
const proportionCheck: GeneratorDef = {
  id: 'proportion-tf',
  title: 'Igaz-e az aránypár?',
  levels: [1, 2],
  generate(rng, level): Question {
    const [p, q] = rng.pick(RATIO_PAIRS);
    const k = rng.int(2, 8);
    const m = rng.int(2, 9);
    let a: number;
    let b: number;
    let c: number;
    let d: number;
    if (level === 1) {
      a = p * k;
      b = q * k;
      c = p * m;
      d = q * m;
    } else {
      const dec = rng.pick([0.5, 1.5, 2.5]);
      a = clean(p * dec);
      b = clean(q * dec);
      c = p * m;
      d = q * m;
    }
    const isTrue = rng.chance(0.5);
    if (!isTrue) {
      // change one term so that the proportion is false
      const delta = level === 1 ? rng.int(1, 3) : rng.pick([0.5, 1]);
      d = clean(d + delta);
      if (Math.abs(a * d - b * c) < 1e-9) d = clean(d + delta);
    }
    return {
      prompt: tex`Igaz vagy hamis?\n\n$${num(a)} : ${num(b)} = ${num(c)} : ${num(d)}$`,
      answer: { type: 'truefalse', value: isTrue },
      hint: 'Szorozd össze a külső tagokat és a belső tagokat is! Ha egyenlők, az aránypár igaz.',
      solution: [
        tex`A külső tagok szorzata: $${num(a)} \cdot ${num(d)} = ${num(clean(a * d))}$.`,
        tex`A belső tagok szorzata: $${num(b)} \cdot ${num(c)} = ${num(clean(b * c))}$.`,
        isTrue
          ? tex`A két szorzat egyenlő, tehát az állítás **igaz**.`
          : tex`A két szorzat nem egyenlő, tehát az állítás **hamis**.`,
      ],
    };
  },
};

/** Divide a quantity in a given ratio. L3 word problems. */
const shareRatio: GeneratorDef = {
  id: 'share-ratio',
  title: 'Arányos osztás',
  levels: [3],
  generate(rng): Question {
    const [p, q] = rng.pick([[2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [5, 7]]);
    const small = Math.min(p, q);
    const large = Math.max(p, q);
    const kind = rng.pick(['prize', 'garden', 'marbles', 'juice'] as const);
    const unitValue =
      kind === 'prize'
        ? rng.pick([1000, 2000, 2500, 5000])
        : kind === 'garden'
          ? rng.pick([5, 6, 10, 12])
          : kind === 'marbles'
            ? rng.pick([3, 4, 5, 6])
            : rng.pick([1, 2, 3]);
    const total = (p + q) * unitValue;
    const askDifference = rng.chance(0.5);
    const larger = large * unitValue;
    const difference = (large - small) * unitValue;
    const answer = askDifference ? difference : larger;
    const unit =
      kind === 'prize' ? 'dinár' : kind === 'garden' ? 'm²' : kind === 'marbles' ? 'db' : 'dl';
    const what =
      kind === 'prize'
        ? `${capArticle(total)} $${num(total)}$ dináros jutalmat $${num(p)} : ${num(q)}$ arányban osztanak szét.`
        : kind === 'garden'
          ? `${capArticle(total)} $${num(total)}$ m²-es kertet $${num(p)} : ${num(q)}$ arányban osztanak két részre.`
          : kind === 'marbles'
            ? `${capArticle(total)} $${num(total)}$ üveggolyót $${num(p)} : ${num(q)}$ arányban osztanak szét.`
            : `${capArticle(total)} $${num(total)}$ dl gyümölcslevet $${num(p)} : ${num(q)}$ arányban töltenek két kancsóba.`;
    const ask =
      kind === 'prize'
        ? askDifference
          ? 'Mennyivel kap többet a nagyobbik rész?'
          : 'Mennyit kap a nagyobbik rész?'
        : kind === 'garden'
          ? askDifference
            ? 'Mennyivel nagyobb a nagyobbik rész?'
            : 'Hány m² a nagyobbik rész?'
          : kind === 'marbles'
            ? askDifference
              ? 'Mennyivel kap több golyót a nagyobbik rész?'
              : 'Hány golyót kap a nagyobbik rész?'
            : askDifference
              ? 'Mennyivel több jut a nagyobbik kancsóba?'
              : 'Mennyi jut a nagyobbik kancsóba?';
    return {
      prompt: tex`${what} ${ask}`,
      figure: {
        type: 'barModel',
        rows: [{ segments: [{ value: small, label: `${num(small)} rész`, color: 'blue' }, { value: large, label: `${num(large)} rész`, color: 'orange' }] }],
        total: { label: `${num(total)} ${unit}` },
      },
      answer: { type: 'number', value: answer, unit },
      hint: 'Először add össze az arány tagjait, és oszd el velük az egészet!',
      solution: [
        tex`Az arány tagjainak összege: $${num(p)} + ${num(q)} = ${num(p + q)}$, ezzel a számmal osztunk.`,
        tex`Egy rész: $${num(total)} : ${num(p + q)} = ${num(unitValue)}$ ${unit}.`,
        askDifference
          ? tex`A két rész különbsége: $(${num(large)} - ${num(small)}) \cdot ${num(unitValue)} = ${num(answer)}$ ${unit}.`
          : tex`A nagyobbik rész: $${num(large)} \cdot ${num(unitValue)} = ${num(answer)}$ ${unit}.`,
        tex`A keresett érték **${num(answer)} ${unit}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-hasonlosag-01',
  goals: [
    'egyszerűsíteni egy arányt,',
    'kiszámítani egy aránypár hiányzó tagját,',
    'térkép és valóság között váltani a méretarány segítségével,',
    'felismerni az összemérhető és összemérhetetlen szakaszokat.',
  ],
  parts: [
    {
      title: 'Az arány',
      steps: [
        {
          type: 'theory',
          title: 'Az arány',
          body: 'Két szakasz hosszának aránya megmutatja, hányszor nagyobb az egyik. A $6$ cm és $4$ cm hosszú szakaszok aránya $6 : 4 = 3 : 2$.',
          figure: ratioFigure(6, 4, '6 cm', '4 cm'),
          remember: 'Az arány mindkét tagját ugyanazzal a számmal oszthatjuk.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik a $12 : 18$ arány legegyszerűbb alakja?',
            answer: textChoice('$2 : 3$', ['$6 : 9$', '$3 : 2$', '$1 : 2$']),
            hint: 'Oszd mindkét tagot a legnagyobb közös osztóval!',
            solution: [
              'A $12$ és a $18$ legnagyobb közös osztója $6$.',
              '$12 : 6 = 2$ és $18 : 6 = 3$.',
              'Az arány legegyszerűbb alakja **$2 : 3$**.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'Összemérhető szakaszok',
          body: 'Két szakasz **összemérhető**, ha van közös mértékegység, amely mindkettőben egész számú alkalommal megvan. A négyzet oldala és átlója nem az: arányuk $\\sqrt{2}$.',
          figure: squareDiagonal,
          remember: 'Az oldal és az átló aránya $\\sqrt{2} : 1$ — nem két egész szám aránya.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik pár összemérhetetlen?',
            answer: textChoice('a négyzet oldala és átlója', [
              'a háromszög alapja és középvonala',
              'a kör sugara és átmérője',
              'a téglalap egyik oldala és a kétszerese',
            ]),
            hint: 'Az összemérhetetlen arány nem írható fel két egész szám hányadosaként.',
            solution: [
              'A négyzet oldalának és átlójának aránya $\\sqrt{2} : 1$, ami irracionális szám.',
              'A többi pár aránya racionális, tehát azok összemérhetők.',
              'A helyes válasz: **a négyzet oldala és átlója**.',
            ],
          },
        },
        { type: 'practice', generator: 'simplify-ratio', level: 1, count: 2 },
        { type: 'practice', generator: 'simplify-ratio', level: 2 },
      ],
    },
    {
      title: 'Az aránypár',
      steps: [
        {
          type: 'theory',
          title: 'Az aránypár',
          body: 'Két arány egyenlősége **aránypár**: $a : b = c : d$. A **külső tagok** szorzata egyenlő a **belső tagok** szorzatával: $a \\cdot d = b \\cdot c$.',
          remember: '$a : b = c : d \\iff a \\cdot d = b \\cdot c$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik aránypár igaz?',
            answer: textChoice('$3 : 4 = 9 : 12$', ['$3 : 4 = 6 : 9$', '$5 : 2 = 2 : 5$', '$2 : 3 = 4 : 9$']),
            hint: 'Szorozd össze a külső tagokat és a belső tagokat is!',
            solution: [
              '$3 \\cdot 12 = 36$ és $4 \\cdot 9 = 36$.',
              'A két szorzat egyenlő, ezért a $3 : 4 = 9 : 12$ aránypár igaz.',
              'A többi párnál a két szorzat különbözik.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A hiányzó tag',
          problem: 'Oldd meg: $5 : 8 = 15 : x$!',
          steps: [
            { text: 'A külső tagok: $5$ és $x$; a belső tagok: $8$ és $15$.' },
            { text: '$5 \\cdot x = 8 \\cdot 15 = 120$' },
            { text: '$x = 120 : 5 = 24$' },
          ],
          answer: 'A hiányzó tag **24**.',
        },
        { type: 'practice', generator: 'missing-term', level: 1, count: 2 },
        { type: 'practice', generator: 'proportion-tf', level: 1 },
        { type: 'practice', generator: 'proportion-tf', level: 2 },
      ],
    },
    {
      title: 'Méretarány a térképen',
      steps: [
        {
          type: 'theory',
          title: 'A méretarány',
          body: 'Az $1 : 200\\,000$ méretarány azt jelenti, hogy a térképen $1$ cm a valóságban $200\\,000$ cm, azaz $2$ km.',
          remember: '$100\\,000$ cm $= 1$ km',
        },
        {
          type: 'example',
          title: 'Távolság a térképen',
          problem: 'A méretarány $1 : 400\\,000$. Két város $6$ cm-re van a térképen. Milyen messze vannak a valóságban?',
          steps: [
            { text: '$1$ cm a térképen $400\\,000$ cm $= 4$ km.' },
            { text: '$6$ cm: $6 \\cdot 4 = 24$ km.' },
          ],
          answer: 'A két város **24 km**-re van egymástól.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n$1 : 50\\,000$ méretarányban $2$ cm a térképen $1$ km a valóságban.',
            answer: { type: 'truefalse', value: true },
            hint: 'Számold ki, hány cm a valóságban 2 cm, aztán váltsd át km-be!',
            solution: [
              '$2$ cm a térképen $2 \\cdot 50\\,000 = 100\\,000$ cm a valóságban.',
              '$100\\,000$ cm $= 1$ km, tehát az állítás **igaz**.',
            ],
          },
        },
        { type: 'practice', generator: 'map-scale', level: 2, count: 2 },
        { type: 'practice', generator: 'missing-term', level: 2 },
      ],
    },
    {
      title: 'Arányos osztás',
      steps: [
        {
          type: 'theory',
          title: 'Arányos osztás',
          body: 'Ha egy mennyiséget $3 : 5$ arányban osztunk két részre, az egészet $3 + 5 = 8$ egyenlő részre gondoljuk. A részek az egész $\\frac{3}{8}$ és $\\frac{5}{8}$ részei.',
          remember: 'Először összeadjuk az arány tagjait.',
        },
        {
          type: 'example',
          title: 'Jutalom felosztása',
          problem: 'Egy $40\\,000$ dináros jutalmat $3 : 5$ arányban osztanak szét. Mennyit kap a nagyobbik rész?',
          steps: [
            { text: '$3 + 5 = 8$ rész.' },
            { text: 'Egy rész: $40\\,000 : 8 = 5\\,000$ dinár.' },
            { text: 'A nagyobbik rész: $5 \\cdot 5\\,000 = 25\\,000$ dinár.' },
          ],
          answer: 'A nagyobbik rész **25 000 dinár**.',
        },
        { type: 'practice', generator: 'share-ratio', level: 3, count: 2 },
        { type: 'practice', generator: 'map-scale', level: 3 },
        { type: 'practice', generator: 'missing-term', level: 3 },
      ],
    },
  ],
  generators: [simplifyRatio, missingTerm, mapScale, proportionCheck, shareRatio],
  miniTest: {
    items: [
      { generator: 'simplify-ratio', level: 1 },
      { generator: 'missing-term', level: 1 },
      { generator: 'proportion-tf', level: 1 },
      { generator: 'missing-term', level: 2 },
      { generator: 'map-scale', level: 2 },
      { generator: 'share-ratio', level: 3 },
      { generator: 'missing-term', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'simplify-ratio', level: 1 },
    { generator: 'missing-term', level: 1 },
    { generator: 'proportion-tf', level: 1 },
    { generator: 'map-scale', level: 2 },
    { generator: 'share-ratio', level: 3 },
    { generator: 'missing-term', level: 3 },
  ],
});
