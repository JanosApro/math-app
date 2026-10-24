/**
 * Developer demo lesson (id `dev-demo`) — NOT student content. Opened at `#/dev/preview/dev-demo`.
 *
 * It exercises every step type (theory, check, explore, example, practice) and every answer type
 * of the engine, so the lesson player, the keypad and the inputs can be tried in one place:
 *
 *   number (unit, precision) · numbers (35° 48′, coordinates) · expression (3x² − 2x) ·
 *   expression with π (36π) · fraction (requireSimplified, mixed form) · root (5√2) ·
 *   choice · truefalse · order · match
 *
 * Like a real lesson it imports only from src/kit.ts, and `npm run check` validates it.
 */
import {
  choice,
  defineSubtopic,
  frac,
  fracAdd,
  num,
  simplify,
  tex,
  texFrac,
  texMixed,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
} from '../kit';

// ---------------------------------------------------------------------------------------------
// Generators — one (or more) per answer type
// ---------------------------------------------------------------------------------------------

/** number with unit: L1 whole-number area, L2 an average rounded to 2 decimals, L3 decimal sides. */
const numberUnit: GeneratorDef = {
  id: 'number-unit',
  title: 'Szám mértékegységgel (L2: kerekítés 2 tizedesre)',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 2) {
      const ws = [rng.int(18, 35) / 10, rng.int(18, 35) / 10, rng.int(18, 35) / 10];
      const sum = ws[0] + ws[1] + ws[2];
      const avg = sum / 3;
      return {
        prompt: tex`Három dinnye tömege $${num(ws[0])}$ kg, $${num(ws[1])}$ kg és $${num(ws[2])}$ kg. Mennyi az átlaguk? **Két tizedesjegyre kerekíts!**`,
        answer: { type: 'number', value: avg, precision: 2, unit: 'kg' },
        inputLabel: 'átlag $=$',
        hint: 'Add össze a három tömeget, és oszd el $3$-mal!',
        solution: [
          tex`Összeg: $${num(ws[0])} + ${num(ws[1])} + ${num(ws[2])} = ${num(sum)}$`,
          tex`Átlag: $${num(sum)} : 3 \approx ${num(avg, 4)}$`,
          tex`Két tizedesjegyre kerekítve: **${num(avg, 2)} kg**.`,
        ],
      };
    }
    const a = level === 1 ? rng.int(2, 12) : rng.int(11, 49) / 10;
    const b = level === 1 ? rng.intExcept(2, 12, [a]) : rng.int(11, 49) / 10;
    const unit = level === 1 ? 'cm' : 'm';
    const area = Math.round(a * b * 100) / 100;
    return {
      prompt: tex`Egy téglalap oldalai $${num(a)}$ ${unit} és $${num(b)}$ ${unit}. Mekkora a területe?`,
      figure: { type: 'quadrilateral', shape: 'rectangle', a: Math.max(a, b), b: Math.min(a, b), sideLabels: { a: `${num(Math.max(a, b))} ${unit}`, b: `${num(Math.min(a, b))} ${unit}` }, fill: true },
      answer: { type: 'number', value: area, unit: `${unit}²` },
      inputLabel: '$T =$',
      hint: 'A téglalap területe a két oldal szorzata: $T = a \\cdot b$.',
      solution: [tex`$T = a \cdot b = ${num(a)} \cdot ${num(b)} = ${num(area)}$`, tex`A terület **${num(area)} ${unit}²**.`],
    };
  },
};

/** numbers: an angle in degrees and minutes (35° 48′). */
const angleSum: GeneratorDef = {
  id: 'angle-sum',
  title: 'Szögek összeadása fokban és percben (numbers)',
  levels: [1, 2],
  generate(rng, level): Question {
    const d1 = rng.int(10, 70);
    const d2 = rng.int(10, 70);
    const m1 = rng.int(5, 55);
    // level 2: the minutes add up to 60 or more → carry one degree
    const m2 = level === 2 ? rng.int(Math.max(5, 61 - m1), 59) : rng.int(1, Math.max(1, 59 - m1));
    const total = (d1 + d2) * 60 + m1 + m2;
    const deg = Math.floor(total / 60);
    const min = total % 60;
    const carry = m1 + m2 >= 60;
    return {
      prompt: tex`Add össze a két szöget!\n\n$\alpha = ${d1}^\circ\, ${m1}'$, $\beta = ${d2}^\circ\, ${m2}'$`,
      answer: {
        type: 'numbers',
        fields: [
          { label: '$\\alpha + \\beta =$', value: deg, unit: '°' },
          { value: min, unit: '′' },
        ],
      },
      hint: carry ? 'Add össze külön a fokokat és a perceket! $60$ perc $= 1$ fok.' : 'Add össze külön a fokokat és külön a perceket!',
      solution: [
        tex`Fokok: $${d1}^\circ + ${d2}^\circ = ${d1 + d2}^\circ$, percek: $${m1}' + ${m2}' = ${m1 + m2}'$.`,
        ...(carry ? [tex`$${m1 + m2}' = 1^\circ\, ${m1 + m2 - 60}'$, ezért $1$ fokot átviszünk.`] : []),
        tex`$\alpha + \beta = ${deg}^\circ\, ${min}'$`,
      ],
    };
  },
};

/** expression: expand a product (L1 x(ax − b), L2 (x + p)(x + q)). */
const expand: GeneratorDef = {
  id: 'expand',
  title: 'Szorzat kifejtése (expression)',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(2, 5);
      const b = rng.int(1, 9);
      return {
        prompt: tex`Bontsd fel a zárójelet, és írd fel a legegyszerűbb alakban!\n\n$x(${a}x - ${b})$`,
        answer: { type: 'expression', value: `${a}x^2-${b}x` },
        hint: 'A zárójel előtti $x$-szel a zárójelben lévő minden tagot meg kell szorozni.',
        solution: [tex`$x \cdot ${a}x - x \cdot ${b}$`, tex`$= ${a}x^2 - ${b}x$`],
      };
    }
    const p = rng.int(1, 6);
    const q = rng.int(1, 6);
    return {
      prompt: tex`Bontsd fel a zárójeleket, és vond össze az egynemű tagokat!\n\n$(x + ${p})(x + ${q})$`,
      answer: { type: 'expression', value: `x^2+${p + q}x+${p * q}` },
      hint: 'Mindegyik tagot szorozd meg mindegyikkel: $x \\cdot x$, $x \\cdot ' + q + '$, $' + p + ' \\cdot x$, $' + p + ' \\cdot ' + q + '$.',
      solution: [tex`$x \cdot x + x \cdot ${q} + ${p} \cdot x + ${p} \cdot ${q}$`, tex`$= x^2 + ${q}x + ${p}x + ${p * q}$`, tex`$= x^2 + ${p + q}x + ${p * q}$`],
    };
  },
};

/** The demo cylinder, used by the generator and the explore card. */
function cylinder(r: number, h: number, labelled = true): Figure {
  return { type: 'solid', shape: 'cylinder', r, h, labels: labelled ? { r: `r = ${num(r)} cm`, h: `H = ${num(h)} cm` } : { r: 'r', h: 'H' } };
}

/** expression with π: the volume of a cylinder left in terms of π. */
const cylVolume: GeneratorDef = {
  id: 'cyl-volume',
  title: 'Henger térfogata π-vel kifejezve (expression + π)',
  levels: [1],
  generate(rng): Question {
    const r = rng.int(1, 5);
    const h = rng.int(2, 9);
    const v = r * r * h;
    return {
      prompt: tex`Egy henger alapkörének sugara $${r}$ cm, magassága $${h}$ cm. Mekkora a térfogata? Az eredményt $\pi$-vel kifejezve add meg (cm³-ben)!`,
      figure: cylinder(r, h),
      answer: { type: 'expression', value: `${v}π` },
      inputLabel: '$V =$',
      hint: 'A henger térfogata: $V = r^2 \\pi \\cdot H$. A $\\pi$-t ne szorozd ki, csak írd a szám után!',
      solution: [tex`$V = r^2 \pi \cdot H = ${r}^2 \pi \cdot ${h}$`, tex`$= ${r * r} \cdot ${h} \pi = ${v}\pi$`, tex`A térfogat **$${v}\pi$ cm³**.`],
    };
  },
};

/** fraction: L1 same denominators, must simplify; L2 different denominators, mixed number. */
const fracSum: GeneratorDef = {
  id: 'frac-add',
  title: 'Törtek összeadása (fraction: egyszerűsítés, vegyes szám)',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      // same denominator, the sum can be simplified: 1/6 + 3/6 = 4/6 = 2/3
      for (;;) {
        const den = rng.pick([4, 6, 8, 9, 10, 12]);
        const a = rng.int(1, den - 2);
        const b = rng.int(1, den - 1 - a);
        const sum = simplify(frac(a + b, den));
        if (sum.den === den) continue;
        return {
          prompt: tex`Add össze, és egyszerűsítsd az eredményt!\n\n$${texFrac(a, den)} + ${texFrac(b, den)}$`,
          figure: { type: 'fractionModel', shape: 'bar', parts: den, shaded: a + b, label: `${a + b}/${den}` },
          answer: { type: 'fraction', num: sum.num, den: sum.den, requireSimplified: true },
          hint: 'Azonos nevezőjű törteknél a számlálókat adjuk össze, a nevező marad. Utána egyszerűsíts!',
          solution: [tex`$${texFrac(a, den)} + ${texFrac(b, den)} = ${texFrac(a + b, den)}$`, tex`Egyszerűsítve: $${texFrac(a + b, den)} = ${texFrac(sum)}$`],
        };
      }
    }
    for (;;) {
      const d1 = rng.pick([2, 3, 4, 5, 6]);
      const d2 = rng.pick([2, 3, 4, 5, 6].filter((d) => d !== d1));
      const n1 = rng.int(1, d1 - 1);
      const n2 = rng.int(1, d2 - 1);
      const sum = fracAdd(frac(n1, d1), frac(n2, d2));
      if (sum.num <= sum.den) continue;
      return {
        prompt: tex`Add össze, és az eredményt **vegyes számként** add meg!\n\n$${texFrac(n1, d1)} + ${texFrac(n2, d2)}$`,
        answer: { type: 'fraction', num: sum.num, den: sum.den, form: 'mixed' },
        hint: 'Hozd közös nevezőre a törteket! Ha az eredmény 1-nél nagyobb, írd át vegyes számmá (pl. 1 1/4 → szóköz a gombsorban).',
        solution: [tex`Közös nevezőre hozzuk, majd összeadjuk: $${texFrac(n1, d1)} + ${texFrac(n2, d2)} = ${texFrac(sum)}$`, tex`Vegyes számként: $${texMixed(sum)}$`],
      };
    }
  },
};

/** root: partial root extraction, √50 must be written as 5√2. */
const rootSimplify: GeneratorDef = {
  id: 'simplify-root',
  title: 'Kivonás a gyökjel alól (root, requireSimplified)',
  levels: [1],
  generate(rng): Question {
    const k = rng.int(2, 6);
    const m = rng.pick([2, 3, 5, 6, 7]);
    const n = k * k * m;
    return {
      prompt: tex`Hozd egyszerűbb alakra: $\sqrt{${n}}$`,
      answer: { type: 'root', coef: k, radicand: m, requireSimplified: true },
      hint: tex`Keress a $${n}$-ban egy négyzetszám tényezőt!`,
      solution: [tex`$${n} = ${k * k} \cdot ${m}$, és $${k * k} = ${k}^2$.`, tex`$\sqrt{${n}} = \sqrt{${k * k}} \cdot \sqrt{${m}} = ${texRoot(k, m)}$`],
    };
  },
};

/** choice: the largest of four unit-like fractions (typical mistake: the largest denominator). */
const largest: GeneratorDef = {
  id: 'largest-fraction',
  title: 'Melyik a legnagyobb? (choice)',
  levels: [1],
  generate(rng): Question {
    const n = rng.int(1, 3);
    const dens = rng.sample([4, 5, 6, 7, 8, 9, 10, 11], 4).sort((x, y) => x - y);
    const [smallest, ...rest] = dens;
    return {
      prompt: 'Melyik tört a **legnagyobb**?',
      answer: choice(rng, smallest, rest.reverse(), { format: (d) => `$${texFrac(n, d)}$` }),
      hint: 'Ha a számlálók egyenlők, akkor annál nagyobb a tört, minél kevesebb részre osztjuk az egészet.',
      solution: [tex`Mindegyik tört számlálója $${n}$.`, 'Annál nagyobb a tört, minél **kisebb** a nevező.', tex`A legnagyobb: $${texFrac(n, smallest)}$.`],
    };
  },
};

/** truefalse: is the product right? (wrong versions are typical mistakes) */
const productTf: GeneratorDef = {
  id: 'product-tf',
  title: 'Igaz vagy hamis szorzás (truefalse)',
  levels: [1],
  generate(rng): Question {
    const a = rng.int(3, 9);
    const b = rng.int(3, 9);
    const right = rng.chance(0.5);
    const shown = right ? a * b : rng.pick([a + b, a * b + a, a * b - b, a * (b + 1)]);
    const really = shown === a * b;
    return {
      prompt: tex`Igaz vagy hamis?\n\n$${a} \cdot ${b} = ${shown}$`,
      answer: { type: 'truefalse', value: really },
      hint: 'Számold ki a szorzatot, és hasonlítsd össze!',
      solution: [tex`$${a} \cdot ${b} = ${a * b}$`, really ? 'Az állítás **igaz**.' : tex`$${a * b} \ne ${shown}$, ezért az állítás **hamis**.`],
    };
  },
};

/** order: decimals from smallest to largest (trap: more digits is not bigger). */
const orderDecimals: GeneratorDef = {
  id: 'order-decimals',
  title: 'Tizedes törtek sorba rendezése (order)',
  levels: [1],
  generate(rng): Question {
    const d = rng.int(2, 8);
    const e = rng.intExcept(1, 9, [d]);
    const values = [...new Set([d / 10, (10 * d + e) / 100, (100 * d + e) / 1000, (10 * e + d) / 100])].sort((x, y) => x - y);
    return {
      prompt: 'Állítsd sorba a számokat!',
      figure: { type: 'numberLine', min: 0, max: 1, step: 0.5, subdivisions: 10, tickLabels: 'major' },
      answer: { type: 'order', items: values.map((v) => `$${num(v)}$`), direction: 'A legkisebbtől a legnagyobbig' },
      hint: 'Írd a számokat egymás alá úgy, hogy a tizedesvesszők egy oszlopba kerüljenek, és hasonlítsd össze őket helyiértékenként!',
      solution: [`Helyiértékenként összehasonlítva: ${values.map((v) => `$${num(v)}$`).join(' < ')}`],
    };
  },
};

/** match: fractions to decimals. */
const matchFractions: GeneratorDef = {
  id: 'match-decimals',
  title: 'Tört és tizedes tört párosítása (match)',
  levels: [1],
  generate(rng): Question {
    const pool: [number, number][] = [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [1, 10],
      [3, 10],
      [7, 10],
    ];
    const chosen = rng.sample(pool, 4);
    return {
      prompt: 'Párosítsd a törteket a tizedes tört alakjukkal!',
      answer: { type: 'match', pairs: chosen.map(([n, d]) => [`$${texFrac(n, d)}$`, `$${num(n / d)}$`] as [string, string]) },
      hint: 'Bővítsd a törtet úgy, hogy a nevezője $10$ vagy $100$ legyen!',
      solution: chosen.map(([n, d]) => tex`$${texFrac(n, d)} = ${num(n / d)}$`),
    };
  },
};

/** numbers: read off a point's coordinates. */
const pointCoords: GeneratorDef = {
  id: 'point-coords',
  title: 'Pont koordinátáinak leolvasása (numbers, két mező)',
  levels: [1, 2],
  generate(rng, level): Question {
    const x = level === 1 ? rng.int(1, 5) : rng.intExcept(-5, 5, [0]);
    const y = level === 1 ? rng.int(1, 5) : rng.intExcept(-4, 4, [0]);
    const range: [number, number] = level === 1 ? [0, 6] : [-6, 6];
    return {
      prompt: 'Olvasd le a $P$ pont koordinátáit!',
      figure: { type: 'coordinate', x: range, y: level === 1 ? [0, 6] : [-5, 5], points: [{ at: [x, y], label: 'P', color: 'highlight' }] },
      answer: {
        type: 'numbers',
        fields: [
          { label: '$x =$', value: x },
          { label: '$y =$', value: y },
        ],
      },
      hint: 'Először azt nézd meg, mennyit kell jobbra (vagy balra) menni, aztán azt, hogy mennyit felfelé (vagy lefelé).',
      solution: [tex`Az első koordináta (vízszintesen): $x = ${num(x)}$, a második (függőlegesen): $y = ${num(y)}$.`, tex`$P(${num(x)};\ ${num(y)})$`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// Static figures
// ---------------------------------------------------------------------------------------------

const bisector: Figure = {
  type: 'construction',
  points: { A: [0, 0], B: [5, 0] },
  intersections: { P: { circles: [['A', 3.5], ['B', 3.5]] }, Q: { circles: [['A', 3.5], ['B', 3.5]], pick: 'below' } },
  given: [
    { kind: 'segment', from: 'A', to: 'B' },
    { kind: 'point', at: 'A' },
    { kind: 'point', at: 'B' },
  ],
  steps: [
    { caption: 'Körzővel ívet rajzolunk az $A$ pont körül.', items: [{ kind: 'compass', center: 'A', through: ['P', 'Q'] }] },
    { caption: 'Ugyanakkora sugárral a $B$ pont körül is.', items: [{ kind: 'compass', center: 'B', through: ['P', 'Q'] }] },
    { caption: 'Az ívek metszéspontjai $P$ és $Q$.', items: [{ kind: 'point', at: 'P' }, { kind: 'point', at: 'Q' }] },
    { caption: 'A $PQ$ egyenes az $AB$ szakasz felezőmerőlegese.', items: [{ kind: 'line', through: ['P', 'Q'], label: 'f', color: 'accent' }] },
  ],
};

// ---------------------------------------------------------------------------------------------
// The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'dev-demo',
  goals: ['kipróbálni minden lépéstípust (elmélet, ellenőrző kérdés, csúszka, kidolgozott példa, gyakorlás),', 'kipróbálni minden választípust és a számbillentyűzetet,', 'végigcsinálni egy minidolgozatot.'],
  steps: [
    {
      type: 'theory',
      title: 'Elméleti kártya ábrával',
      body: 'Ez egy **elméleti kártya**. Rövid szöveg, képlet ($a^2 + b^2 = c^2$), és alatta egy ábra.\n\n- felsorolás első eleme\n- második elem, tizedesvesszővel: $0,5$',
      figure: { type: 'triangle', legs: [3, 4], sideLabels: { a: '3 cm', b: '4 cm', c: 'c = ?' }, angleLabels: { A: 'α', B: 'β' }, highlight: ['c'] },
      remember: 'A **Jegyezd meg!** dobozba kerül a legfontosabb képlet: $T = \\dfrac{a \\cdot m_a}{2}$',
    },
    {
      type: 'check',
      question: {
        prompt: 'Ellenőrző kérdés (feleletválasztós): melyik a háromszög leghosszabb oldala, ha derékszögű?',
        answer: textChoice('az átfogó', ['az egyik befogó', 'a magasság', 'mindhárom egyforma']),
        hint: 'A derékszöggel szemközti oldalra gondolj!',
        solution: ['A derékszöggel szemközti oldal az átfogó.', 'Ez mindig a leghosszabb oldal.'],
      },
    },
    {
      type: 'theory',
      title: 'Szerkesztés lépésenként',
      body: 'A szerkesztés ábráját lépésenként lehet végignézni a gombokkal.',
      figure: bisector,
    },
    {
      type: 'check',
      question: {
        prompt: 'Igaz vagy hamis?\n\n**A felezőmerőleges minden pontja ugyanolyan messze van $A$-tól, mint $B$-től.**',
        answer: { type: 'truefalse', value: true },
        hint: 'Gondolj a körzőnyílásra!',
        solution: ['A felezőmerőleges pontjai egyenlő távolságra vannak a szakasz két végpontjától.', 'Az állítás **igaz**.'],
      },
    },
    {
      type: 'explore',
      title: 'Csúszkás kártya',
      body: 'Húzd a csúszkákat: az ábra és a képlet azonnal változik.',
      sliders: [
        { name: 'r', label: '$r$ (sugár)', min: 1, max: 5, step: 0.5, value: 2 },
        { name: 'h', label: '$H$ (magasság)', min: 1, max: 8, step: 1, value: 5 },
      ],
      render: ({ r, h }) => ({
        figure: cylinder(r, h),
        text: tex`$V = r^2 \pi \cdot H = ${num(r)}^2 \pi \cdot ${num(h)} = ${num(r * r * h)}\pi \approx ${num(r * r * h * Math.PI, 2)}$ cm³`,
      }),
    },
    {
      type: 'example',
      title: 'Kidolgozott példa, lépésenként',
      problem: 'Egy téglalap oldalai $6$ cm és $4$ cm. Mekkora a kerülete és a területe?',
      figure: { type: 'quadrilateral', shape: 'rectangle', a: 6, b: 4, sideLabels: { a: '6 cm', b: '4 cm' }, fill: true },
      steps: [
        { text: 'Kerület: $K = 2 \\cdot (a + b) = 2 \\cdot (6 + 4) = 20$ cm.' },
        {
          text: 'Terület: $T = a \\cdot b = 6 \\cdot 4 = 24$ cm². (Ennél a lépésnél új ábra jelenik meg: a téglalap átlói.)',
          figure: { type: 'quadrilateral', shape: 'rectangle', a: 6, b: 4, sideLabels: { a: '6 cm', b: '4 cm' }, diagonals: { e: 'e', f: 'f' }, fill: true },
        },
        { text: 'Ellenőrzés: $24 = 6 \\cdot 4$ ✓' },
      ],
      answer: 'A kerület **20 cm**, a terület **24 cm²**.',
    },
    { type: 'practice', generator: 'number-unit', level: 1, count: 2 },
    { type: 'practice', generator: 'number-unit', level: 2 },
    { type: 'practice', generator: 'angle-sum', level: 2 },
    { type: 'practice', generator: 'expand', level: 1 },
    { type: 'practice', generator: 'cyl-volume', level: 1 },
    { type: 'practice', generator: 'frac-add', level: 1 },
    { type: 'practice', generator: 'frac-add', level: 2 },
    { type: 'practice', generator: 'simplify-root', level: 1 },
    { type: 'practice', generator: 'largest-fraction', level: 1 },
    { type: 'practice', generator: 'product-tf', level: 1 },
    { type: 'practice', generator: 'order-decimals', level: 1 },
    { type: 'practice', generator: 'match-decimals', level: 1 },
    { type: 'practice', generator: 'point-coords', level: 2 },
    {
      type: 'theory',
      title: 'Diagram és törtmodell',
      body: 'Egy oszlopdiagram a heti kész feladatokról, alatta egy törtmodell ($\\frac{5}{8}$).',
      figure: { type: 'barChart', categories: ['H', 'K', 'Sze', 'Cs', 'P'], series: [{ values: [3, 5, 2, 6, 4] }], yLabel: 'kész feladat', showValues: true },
      remember: 'Az elméleti kártyán egy ábra lehet; több ábrához több kártya kell.',
    },
    {
      type: 'theory',
      body: 'Cím nélküli kártya, csak ábrával.',
      figure: { type: 'fractionModel', shape: 'circle', parts: 8, shaded: 5, label: '5/8' },
    },
  ],
  generators: [numberUnit, angleSum, expand, cylVolume, fracSum, rootSimplify, largest, productTf, orderDecimals, matchFractions, pointCoords],
  miniTest: {
    items: [
      { generator: 'number-unit', level: 1 },
      { generator: 'frac-add', level: 1 },
      { generator: 'simplify-root', level: 1 },
      { generator: 'largest-fraction', level: 1 },
      { generator: 'point-coords', level: 2 },
      { generator: 'expand', level: 1 },
    ],
    passPercent: 80,
  },
});
