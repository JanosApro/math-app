/**
 * 5. osztály › Természetes számok és az oszthatóság – első rész › 5. Hozzárendelés és függő mennyiségek
 *
 * Assignment (input → output), value tables, simple number machines, rules as formulas and in
 * words, and geometric dependencies such as the side of a square → perimeter / area.
 * No coordinate graphs: grade 5 works with tables and arrow chains only.
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
  type Question,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A two-row value table: row headers x/y (or other labels) and one row of values each. */
function valueTable(xs: (number | string)[], ys: (number | string)[], highlight?: [number, number], labels: [string, string] = ['x', 'y']): Figure {
  return {
    type: 'table',
    rows: [
      [labels[0], ...xs],
      [labels[1], ...ys],
    ],
    rowHeaders: true,
    highlight: highlight ? [highlight] : undefined,
  };
}

/** "y = 3x + 2" (or "y = 3x" when b = 0) as LaTeX inside $…$. */
function formula(k: number, b: number): string {
  if (b === 0) return tex`$y = ${num(k)}x$`;
  return b > 0 ? tex`$y = ${num(k)}x + ${num(b)}$` : tex`$y = ${num(k)}x - ${num(-b)}$`;
}

/**
 * "szorosa / szerese / szöröse" after a number. The kit's suffix() follows the spoken form,
 * which is "kettő" (rounded), but the multiplicative suffix after 2 is "szerese" — so 2 is
 * special-cased here.
 */
function multiplicative(k: number, back: string, front: string, rounded: string): string {
  return k === 2 ? front : suffix(k, back, front, rounded);
}

/** Plain "3-szorosa / 2-szerese / 5-szöröse" after a number. */
const multiple = (k: number) => `${num(k)}-${multiplicative(k, 'szorosa', 'szerese', 'szöröse')}`;

/**
 * Accusative suffix after a numeral, written with a hyphen: 2-t, 3-at, 4-et, 5-öt …
 * (Only the numbers used in this lesson, 1–20.)
 */
function accusative(n: number): string {
  const forms: Record<number, string> = {
    1: 'et', 2: 't', 3: 'at', 4: 'et', 5: 'öt', 6: 'ot', 7: 'et', 8: 'at', 9: 'et', 10: 'et',
    11: 'et', 12: 't', 13: 'at', 14: 'et', 15: 'öt', 16: 'ot', 17: 'et', 18: 'at', 19: 'et', 20: 'at',
    100: 'at', 200: 'at', 300: 'at', 400: 'at', 500: 'at', 600: 'at',
  };
  return forms[n] ?? 'et';
}

/** Instrumental suffix after a numeral, with assimilation: 2-vel, 3-mal, 5-tel, 8-cal … */
function instrumental(n: number): string {
  const forms: Record<number, string> = {
    1: 'gyel', 2: 'vel', 3: 'mal', 4: 'gyel', 5: 'tel', 6: 'tal', 7: 'tel', 8: 'cal', 9: 'cel', 10: 'zel',
    11: 'gyel', 12: 'vel', 13: 'mal', 14: 'gyel', 15: 'tel', 16: 'tal', 17: 'tel', 18: 'cal', 19: 'cel',
    20: 'szal', 30: 'cal', 40: 'nel', 50: 'nel', 60: 'nal', 70: 'nel', 80: 'cal', 90: 'nel', 100: 'zal',
  };
  return forms[n] ?? 'val';
}

/** Table with one input/output pair, used by the number-machine tasks. */
function machineTable(input: number | string, output: number | string): Figure {
  return {
    type: 'table',
    rows: [
      ['bemenet', input],
      ['kimenet', output],
    ],
    rowHeaders: true,
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Complete the missing output in a value table generated from y = kx + b. */
const valueTableGen: GeneratorDef = {
  id: 'table-value',
  title: 'Értéktáblázat kiegészítése',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    // L1: y = kx; L2: y = kx + b; L3: bigger k and b, further along the table
    const k = level === 1 ? rng.int(2, 5) : level === 2 ? rng.int(2, 5) : rng.int(6, 9);
    const b = level === 1 ? 0 : level === 2 ? rng.int(1, 6) : rng.int(7, 20);
    const start = level === 3 ? rng.int(4, 9) : rng.int(1, 4);
    const xs = [start, start + 1, start + 2, start + 3];
    const ys = xs.map((x) => k * x + b);
    const j = rng.int(1, 3); // the first pair is always visible
    const answer = ys[j];
    const shownYs = ys.map((y, i) => (i === j ? '?' : y));
    const prompt =
      b === 0
        ? tex`A hozzárendelés: $y = ${num(k)}x$. Mennyi a táblázat hiányzó értéke?`
        : tex`A hozzárendelés: $y = ${num(k)}x + ${num(b)}$. Mennyi a táblázat hiányzó értéke?`;
    return {
      prompt,
      figure: valueTable(xs, shownYs, [1, j + 1]),
      answer: { type: 'number', value: answer },
      inputLabel: '$y =$',
      hint: tex`Keresd meg a táblázatban a hiányzó értékhez tartozó $x$-et, és helyettesítsd be a képletbe!`,
      solution: [
        tex`A hiányzó érték az $x = ${num(xs[j])}$ bemenethez tartozik.`,
        b === 0
          ? tex`$y = ${num(k)} \cdot ${num(xs[j])} = ${num(answer)}$`
          : tex`$y = ${num(k)} \cdot ${num(xs[j])} + ${num(b)} = ${num(answer)}$`,
        tex`A hiányzó érték **${num(answer)}**.`,
      ],
    };
  },
};

/** A simple number machine: one step at L1, two steps at L2. */
const machine: GeneratorDef = {
  id: 'machine',
  title: 'Számgép: bemenetből kimenet',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const op = rng.pick(['add', 'sub', 'mul'] as const);
      const a = op === 'mul' ? rng.int(2, 5) : rng.int(2, 15);
      const x = op === 'sub' ? rng.int(a + 1, a + 20) : rng.int(2, 15);
      const y = op === 'add' ? x + a : op === 'sub' ? x - a : x * a;
      const rule = op === 'add' ? tex`$x \mapsto x + ${num(a)}$` : op === 'sub' ? tex`$x \mapsto x - ${num(a)}$` : tex`$x \mapsto ${num(a)}x$`;
      return {
        prompt: tex`A számgép szabálya: ${rule}. Mennyi a kimenet, ha a bemenet $${num(x)}$?`,
        figure: machineTable(x, '?'),
        answer: { type: 'number', value: y },
        inputLabel: '$y =$',
        hint: 'Helyettesítsd be a bemenetet a gép szabályába!',
        solution: [
          op === 'add'
            ? tex`A gép a bemenethez hozzáad ${num(a)}-${accusative(a)}.`
            : op === 'sub'
              ? tex`A gép a bemenetből kivon ${num(a)}-${accusative(a)}.`
              : tex`A gép a bemenetet a ${num(a)}-${multiplicative(a, 'szorosára', 'szeresére', 'szörösére')} növeli.`,
          op === 'add'
            ? tex`$y = ${num(x)} + ${num(a)} = ${num(y)}$`
            : op === 'sub'
              ? tex`$y = ${num(x)} - ${num(a)} = ${num(y)}$`
              : tex`$y = ${num(a)} \cdot ${num(x)} = ${num(y)}$`,
          tex`A kimenet **${num(y)}**.`,
        ],
      };
    }
    // L2: two steps, always forward (solving a reverse machine belongs to the equations lesson)
    const k = rng.int(2, 4);
    const plus = rng.chance(0.5);
    const x = rng.int(2, 12);
    const b = plus ? rng.int(1, 12) : rng.int(1, Math.max(1, k * x - 1));
    const y = plus ? k * x + b : k * x - b;
    const rule = plus ? tex`$x \mapsto ${num(k)}x + ${num(b)}$` : tex`$x \mapsto ${num(k)}x - ${num(b)}$`;
    return {
      prompt: tex`A számgép két lépésben dolgozik: ${rule}. Mennyi a kimenet, ha a bemenet $${num(x)}$?`,
      figure: machineTable(x, '?'),
      answer: { type: 'number', value: y },
      inputLabel: '$y =$',
      hint: 'Előbb a szorzás következik, aztán a hozzáadás vagy a kivonás.',
      solution: [
        tex`Először a szorzás: $${num(k)} \cdot ${num(x)} = ${num(k * x)}$.`,
        plus
          ? tex`Aztán hozzáadjuk: $${num(k * x)} + ${num(b)} = ${num(y)}$.`
          : tex`Aztán kivonjuk: $${num(k * x)} - ${num(b)} = ${num(y)}$.`,
        tex`A kimenet **${num(y)}**.`,
      ],
    };
  },
};

/** Find the rule from a table of pairs (multiple choice). */
const ruleFromPairs: GeneratorDef = {
  id: 'rule-from-pairs',
  title: 'A szabály felismerése számpárokból',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const story = level === 3;
    // L1: y = kx from x = 1; L2: y = kx + b, the table does not start at 1; L3: a taxi fare
    const k = story ? rng.int(2, 6) * 10 : rng.int(2, 5);
    const b = story ? rng.int(1, 6) * 100 : level === 1 ? 0 : rng.int(1, 9);
    const start = level === 1 ? 1 : rng.int(2, 4);
    const xs = [start, start + 1, start + 2];
    const ys = xs.map((x) => k * x + b);
    const correct = formula(k, b);
    const wrongs: string[] = [];
    if (b === 0) {
      wrongs.push(formula(k + 1, 0), formula(k, 1), formula(k, 2), formula(k > 2 ? k - 1 : k + 2, 0));
    } else if (story) {
      // Typical money mistakes: a wrong per-km price, a wrong base fee (one zero too few), a wrong sign.
      wrongs.push(formula(k + 10, b), formula(k, b / 10), formula(k, b + 100), formula(k + 10, b + 100));
    } else {
      wrongs.push(formula(k + 1, b), formula(k, b + 1), formula(k, -b), tex`$y = ${num(k)}(x + ${num(b)})$`);
    }
    const labels: [string, string] = story ? ['km', 'dinár'] : ['x', 'y'];
    const prompt = story
      ? tex`A taxis az indulásért ${num(b)} dinárt, minden kilométerért ${num(k)} dinárt kér. Melyik szabály adja a táblázat értékeit?`
      : 'Melyik szabály adja a táblázat számpárjait?';
    return {
      prompt,
      figure: valueTable(xs, ys, undefined, labels),
      answer: choice(rng, correct, wrongs, { fallback: (r) => formula(k + r.int(2, 4), b) }),
      hint: 'Nézd meg, mennyivel nő a kimenet, ha a bemenet 1-gyel nő. Aztán keresd meg a kezdőértéket!',
      solution: [
        tex`A szomszédos kimenetek különbsége $${num(k)}$, tehát a bemenetet ${num(k)}-${instrumental(k)} szorozzuk.`,
        b === 0
          ? tex`Az $x = ${num(xs[0])}$ bemenethez $y = ${num(ys[0])}$ tartozik, és ez éppen $${num(k)} \cdot ${num(xs[0])}$.`
          : tex`Az $x = ${num(xs[0])}$ bemenethez $y = ${num(ys[0])}$ tartozik, tehát még hozzáadunk $${num(b)}$-${accusative(b)}.`,
        tex`A szabály: **${correct}**.`,
      ],
    };
  },
};

/** Turn a rule given in words into a formula (multiple choice). L1: no brackets; L2: with brackets. */
const wordsToFormula: GeneratorDef = {
  id: 'words-to-formula',
  title: 'Szabály szavakban és képletben',
  levels: [1, 2],
  generate(rng, level): Question {
    const k = rng.int(2, 5);
    const b = rng.intExcept(1, 9, [k]); // b ≠ k, so that no wrong option equals the right one
    const minus = rng.chance(0.5);
    const op = minus ? '-' : '+';
    const other = minus ? '+' : '-';
    if (level === 1) {
      const correct = tex`$y = ${num(k)}x ${op} ${num(b)}$`;
      return {
        prompt: tex`A kimenet a bemenet ${multiple(k)}, ${minus ? 'mínusz' : 'plusz'} ${num(b)}. Melyik képlet felel meg?`,
        answer: textChoice(correct, [tex`$y = ${num(k)}x ${other} ${num(b)}$`, tex`$y = ${num(k)}(x ${op} ${num(b)})$`, tex`$y = ${num(b)}x ${op} ${num(k)}$`]),
        hint: `A „${minus ? 'mínusz' : 'plusz'}” a szorzás után következik. A zárójel mást jelentene!`,
        solution: [
          tex`A bemenet ${num(k)}-${multiplicative(k, 'szorosát', 'szeresét', 'szörösét')} vesszük, majd ${minus ? 'kivonunk' : 'hozzáadunk'} ${num(b)}-${accusative(b)}.`,
          tex`Ez képlettel: **${correct}**.`,
          tex`${Article(num(k))} $${num(k)}(x ${op} ${num(b)})$ zárójeles alak nem ugyanaz: ott előbb ${minus ? 'vonunk ki' : 'adunk hozzá'}.`,
        ],
      };
    }
    const correct = tex`$y = ${num(k)}(x ${op} ${num(b)})$`;
    return {
      prompt: tex`A kimenet: a bemenetnél ${num(b)}-${instrumental(b)} ${minus ? 'kisebb' : 'nagyobb'} szám ${multiple(k)}. Melyik képlet felel meg?`,
      answer: textChoice(correct, [tex`$y = ${num(k)}x ${op} ${num(b)}$`, tex`$y = ${num(k)}(x ${other} ${num(b)})$`, tex`$y = ${num(b)}(x ${op} ${num(k)})$`]),
      hint: `Előbb a ${minus ? 'kisebb' : 'nagyobb'} számot kell kiszámolni, csak utána szorzunk: ehhez zárójel kell.`,
      solution: [
        tex`Előbb ${article(b)} ${num(b)}-${instrumental(b)} ${minus ? 'kisebb' : 'nagyobb'} szám: $x ${op} ${num(b)}$.`,
        tex`Ennek ${article(num(k))} ${num(k)}-${multiplicative(k, 'szorosa', 'szerese', 'szöröse')}: **${correct}**.`,
        tex`${Article(num(k))} $${num(k)}x ${op} ${num(b)}$ zárójel nélkül mást jelent: ott csak az $x$-et szorozzuk.`,
      ],
    };
  },
};

/** Side of a square → perimeter / area. L3 is the reverse (perimeter → side). */
const squareSize: GeneratorDef = {
  id: 'square-size',
  title: 'Négyzet: oldal, kerület, terület',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    const square = (size: number, label: string): Figure => ({
      type: 'quadrilateral',
      shape: 'square',
      a: size,
      sideLabels: { a: label },
    });
    if (level === 1) {
      const a = rng.int(2, 12);
      const K = 4 * a;
      return {
        prompt: tex`Egy négyzet oldala $${num(a)}$ ${unit}. Mennyi a kerülete?`,
        figure: square(a, `a = ${num(a)} ${unit}`),
        answer: { type: 'number', value: K, unit },
        inputLabel: '$K =$',
        hint: 'A négyzet négy egyenlő oldalból áll: $K = 4a$.',
        solution: [
          tex`A kerület a négy oldal összege: $K = 4a$.`,
          tex`$K = 4 \cdot ${num(a)} = ${num(K)}$ ${unit}`,
          tex`A négyzet kerülete **${num(K)} ${unit}**.`,
        ],
      };
    }
    if (level === 2) {
      const a = rng.int(2, 12);
      const T = a * a;
      return {
        prompt: tex`Egy négyzet oldala $${num(a)}$ ${unit}. Mennyi a területe?`,
        figure: square(a, `a = ${num(a)} ${unit}`),
        answer: { type: 'number', value: T, unit: `${unit}²` },
        inputLabel: '$T =$',
        hint: 'A négyzet területe $T = a \\cdot a = a^2$.',
        solution: [
          tex`A négyzet területe az oldal négyzete: $T = a^2$.`,
          tex`$T = ${num(a)} \cdot ${num(a)} = ${num(T)}$ ${unit}²`,
          tex`A négyzet területe **${num(T)} ${unit}²**.`,
        ],
      };
    }
    const a = rng.int(2, 15);
    const K = 4 * a;
    return {
      prompt: tex`Egy négyzet kerülete $${num(K)}$ ${unit}. Milyen hosszú az oldala?`,
      figure: square(10, 'a = ?'),
      answer: { type: 'number', value: a, unit },
      inputLabel: '$a =$',
      hint: 'A kerület négy egyenlő oldal összege, ezért $a = K : 4$.',
      solution: [
        tex`A négyzet kerülete $K = 4a$.`,
        tex`$a = ${num(K)} : 4 = ${num(a)}$ ${unit}`,
        tex`Az oldal hossza **${num(a)} ${unit}**.`,
      ],
    };
  },
};

/** Everyday dependent quantities: money saved, ticket price, pages read. */
const everyday: GeneratorDef = {
  id: 'everyday',
  title: 'Függő mennyiségek a mindennapokban',
  levels: [3],
  generate(rng): Question {
    const kind = rng.pick(['taxi', 'saving', 'tickets', 'pages'] as const);
    if (kind === 'taxi') {
      const base = rng.int(2, 6) * 50;
      const perKm = rng.int(8, 15) * 10;
      const km = rng.int(2, 8);
      const total = base + perKm * km;
      return {
        prompt: tex`A taxis az indulásért ${num(base)} dinárt, minden kilométerért ${num(perKm)} dinárt kér. Mennyibe kerül egy ${num(km)} km-es út?`,
        figure: valueTable([km], ['?'], [1, 1], ['km', 'dinár']),
        answer: { type: 'number', value: total, unit: 'dinár' },
        hint: 'Az út ára = indulási díj + a kilométerek ára.',
        solution: [
          tex`A kilométerek ára: $${num(perKm)} \cdot ${num(km)} = ${num(perKm * km)}$ dinár.`,
          tex`Az összes ár: $${num(base)} + ${num(perKm * km)} = ${num(total)}$ dinár.`,
          tex`Az út **${num(total)} dinárba** kerül.`,
        ],
      };
    }
    if (kind === 'saving') {
      const weekly = rng.int(3, 9) * 100;
      const weeks = rng.int(3, 8);
      const total = weekly * weeks;
      return {
        prompt: tex`Peti hetente ${num(weekly)} dinárt tesz félre. Mennyi pénze lesz ${num(weeks)} hét után?`,
        figure: valueTable([weeks], ['?'], [1, 1], ['hét', 'dinár']),
        answer: { type: 'number', value: total, unit: 'dinár' },
        hint: 'A megtakarítás = heti összeg · hetek száma.',
        solution: [
          tex`A szabály: $y = ${num(weekly)}x$, ahol $x$ a hetek száma.`,
          tex`$y = ${num(weekly)} \cdot ${num(weeks)} = ${num(total)}$ dinár.`,
          tex`Petinek **${num(total)} dinárja** lesz.`,
        ],
      };
    }
    if (kind === 'tickets') {
      const price = rng.int(8, 15) * 100;
      const fee = rng.int(1, 3) * 100;
      const count = rng.int(2, 6);
      const total = price * count + fee;
      return {
        prompt: tex`Egy jegy ${num(price)} dinár, a foglalási díj ${num(fee)} dinár. Mennyibe kerül ${num(count)} jegy?`,
        figure: valueTable([count], ['?'], [1, 1], ['jegy', 'dinár']),
        answer: { type: 'number', value: total, unit: 'dinár' },
        hint: 'Előbb számold ki a jegyek árát, aztán add hozzá a foglalási díjat!',
        solution: [
          tex`A jegyek ára: $${num(price)} \cdot ${num(count)} = ${num(price * count)}$ dinár.`,
          tex`A foglalási díjjal együtt: $${num(price * count)} + ${num(fee)} = ${num(total)}$ dinár.`,
          tex`${num(count)} jegy **${num(total)} dinárba** kerül.`,
        ],
      };
    }
    const perDay = rng.int(8, 20);
    const already = rng.int(0, 20);
    const days = rng.int(3, 7);
    const total = perDay * days + already;
    return {
      prompt:
        already === 0
          ? tex`Anna naponta ${num(perDay)} oldalt olvas. Hány oldalnál tart ${num(days)} nap után?`
          : tex`Anna már ${num(already)} oldalt elolvasott, és naponta ${num(perDay)} oldalt olvas. Hány oldalnál tart ${num(days)} nap után?`,
      figure: valueTable([days], ['?'], [1, 1], ['nap', 'oldal']),
      answer: { type: 'number', value: total, unit: 'oldal' },
      hint: 'Az olvasott oldalak száma = a már elolvasott oldalak + naponta olvasott oldalak · napok.',
      solution: [
        already === 0
          ? tex`A szabály: $y = ${num(perDay)}x$.`
          : tex`A szabály: $y = ${num(perDay)}x + ${num(already)}$.`,
        already === 0
          ? tex`$y = ${num(perDay)} \cdot ${num(days)} = ${num(total)}$`
          : tex`$y = ${num(perDay)} \cdot ${num(days)} + ${num(already)} = ${num(total)}$`,
        tex`Anna **${num(total)} oldalnál** tart.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

const exampleTable: Figure = valueTable([1, 2, 3, 4], [3, 5, 7, 9]);
const machineExamples: Figure = valueTable([2, 3, 4, 5], [6, 8, 10, 12], undefined, ['bemenet', 'kimenet']);
const ruleTable: Figure = valueTable([1, 2, 3], [5, 8, 11]);

export default defineSubtopic({
  id: 'g5-termeszetes-szamok-1-05',
  goals: [
    'megérteni, mit jelent a hozzárendelés és a függő mennyiség,',
    'szabályt leolvasni táblázatból és számgépből,',
    'szabályt képlettel és szavakkal megfogalmazni,',
    'kiszámítani egy mennyiséget a másikból (például négyzet kerülete).',
  ],
  parts: [
    {
      title: 'A hozzárendelés szabálya',
      steps: [
        {
          type: 'theory',
          title: 'Bemenet és kimenet',
          body: 'A hozzárendelés minden bemenethez egy kimenetet ad. A szabályt táblázat, nyíl vagy képlet mutathatja. Itt a szabály: $y = 2x + 1$.',
          figure: exampleTable,
          remember: 'bemenet $x$ → kimenet $y$',
        },
        {
          type: 'check',
          question: {
            prompt: tex`A szabály: $y = 2x + 1$. Mennyi a kimenet, ha a bemenet $4$?`,
            answer: { type: 'number', value: 9 },
            inputLabel: '$y =$',
            hint: 'Helyettesítsd be az $x$ helyére a $4$-et!',
            solution: [tex`$y = 2 \cdot 4 + 1$`, tex`$y = 8 + 1 = 9$`, 'A kimenet **9**.'],
          },
        },
        {
          type: 'example',
          title: 'Táblázat kiegészítése',
          problem: tex`A szabály: $y = 2x + 1$. Mennyi a kimenet $x = 5$ esetén?`,
          figure: valueTable([3, 4, 5], [7, 9, '?'], [1, 3]),
          steps: [
            { text: tex`Az $x$ helyére $5$-öt írunk: $y = 2 \cdot 5 + 1$.` },
            { text: tex`$2 \cdot 5 = 10$, majd $10 + 1 = 11$.` },
          ],
          answer: 'A hiányzó érték **11**.',
        },
        { type: 'practice', generator: 'table-value', level: 1, count: 2 },
      ],
    },
    {
      title: 'Számgépek',
      steps: [
        {
          type: 'theory',
          title: 'Így dolgozik a számgép',
          body: 'A számgép lépésekben számol. A bemenet balról lép be, a kimenet jobbról jön ki. A gép előbb a bemenet kétszeresét veszi, majd hozzáad 2-t.',
          figure: machineExamples,
          remember: '$x \\mapsto 2x + 2$',
        },
        {
          type: 'check',
          question: {
            prompt: tex`A gép szabálya: $x \mapsto 3x + 4$. Mennyi a kimenet, ha a bemenet $5$?`,
            answer: { type: 'number', value: 19 },
            inputLabel: '$y =$',
            hint: 'Előbb szorozz, aztán adj hozzá!',
            solution: [tex`$3 \cdot 5 = 15$`, tex`$15 + 4 = 19$`, 'A kimenet **19**.'],
          },
        },
        {
          type: 'example',
          title: 'Két lépés a gépben',
          problem: tex`A gép szabálya: $x \mapsto 4x - 3$. A bemenet $6$. Mennyi a kimenet?`,
          steps: [
            { text: tex`Először szorzunk: $4 \cdot 6 = 24$.` },
            { text: tex`Aztán kivonunk: $24 - 3 = 21$.` },
          ],
          answer: 'A kimenet **21**.',
        },
        { type: 'practice', generator: 'machine', level: 1, count: 2 },
        { type: 'practice', generator: 'machine', level: 2 },
      ],
    },
    {
      title: 'A szabály képlettel',
      steps: [
        {
          type: 'theory',
          title: 'A képlet nyelvet ad',
          body: 'A képlet betűkkel írja le a szabályt: $x$ a bemenet, $y$ a kimenet. A $3x$ jelentése $3 \\cdot x$, a $+ 2$ pedig azt, hogy utána még hozzáadunk $2$-t.',
          figure: ruleTable,
          remember: '$y = 3x + 2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'A kimenet a bemenet kétszerese, plusz $3$. Melyik képlet felel meg?',
            answer: textChoice('$y = 2x + 3$', ['$y = 3x + 2$', '$y = 2(x + 3)$', '$y = 2x - 3$']),
            hint: 'A „kétszeres” a szorzás, a „plusz 3” a hozzáadás. Melyik jön előbb?',
            solution: [
              'A bemenet kétszerese: $2x$.',
              'Ehhez adunk $3$-at: $2x + 3$.',
              'A helyes képlet: **$y = 2x + 3$**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Szabály felismerése',
          problem: 'Melyik szabály adja a táblázat számpárjait?',
          figure: ruleTable,
          steps: [
            { text: 'A kimenetek: $5, 8, 11$ — mindig $3$-mal nőnek.' },
            { text: 'Tehát a bemenetet $3$-mal szorozzuk: $3 \\cdot 1 = 3$.' },
            { text: 'Az első kimenet $5$, ehhez még $2$ kell: $y = 3x + 2$.' },
          ],
          answer: 'A szabály **$y = 3x + 2$**.',
        },
        { type: 'practice', generator: 'rule-from-pairs', level: 1 },
        { type: 'practice', generator: 'words-to-formula', level: 1 },
        { type: 'practice', generator: 'rule-from-pairs', level: 2 },
      ],
    },
    {
      title: 'Függő mennyiségek',
      steps: [
        {
          type: 'theory',
          title: 'A négyzet oldala és kerülete',
          body: 'A négyzet kerülete függ az oldal hosszától: $K = 4a$. Ha az oldal $2$ cm-rel hosszabb, a kerület $8$ cm-rel nagyobb. A terület is függ az oldaltól: $T = a^2$.',
          figure: { type: 'quadrilateral', shape: 'square', a: 7, sideLabels: { a: 'a = 7 cm' } },
          remember: '$K = 4a$ · $T = a^2$',
        },
        {
          type: 'check',
          question: {
            prompt: tex`Egy négyzet oldala $6$ cm. Mennyi a kerülete?`,
            answer: { type: 'number', value: 24, unit: 'cm' },
            inputLabel: '$K =$',
            hint: 'A négyzetnek négy egyenlő oldala van.',
            solution: [tex`$K = 4 \cdot 6$`, tex`$K = 24$ cm`, 'A kerület **24 cm**.'],
          },
        },
        {
          type: 'example',
          title: 'Kerület és terület',
          problem: tex`Egy négyzet oldala $9$ cm. Mennyi a kerülete és a területe?`,
          figure: { type: 'quadrilateral', shape: 'square', a: 9, sideLabels: { a: 'a = 9 cm' } },
          steps: [
            { text: tex`Kerület: $K = 4 \cdot 9 = 36$ cm.` },
            { text: tex`Terület: $T = 9 \cdot 9 = 81$ cm².` },
          ],
          answer: 'A kerület **36 cm**, a terület **81 cm²**.',
        },
        { type: 'practice', generator: 'square-size', level: 1 },
        { type: 'practice', generator: 'square-size', level: 2 },
        { type: 'practice', generator: 'everyday', level: 3, count: 2 },
        { type: 'practice', generator: 'table-value', level: 3 },
      ],
    },
  ],
  generators: [valueTableGen, machine, ruleFromPairs, wordsToFormula, squareSize, everyday],
  miniTest: {
    items: [
      { generator: 'table-value', level: 1 },
      { generator: 'machine', level: 2 },
      { generator: 'rule-from-pairs', level: 1 },
      { generator: 'words-to-formula', level: 2 },
      { generator: 'square-size', level: 1 },
      { generator: 'square-size', level: 3 },
      { generator: 'everyday', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'table-value', level: 1 },
    { generator: 'machine', level: 1 },
    { generator: 'rule-from-pairs', level: 1 },
    { generator: 'words-to-formula', level: 1 },
    { generator: 'square-size', level: 2 },
    { generator: 'table-value', level: 2 },
    { generator: 'everyday', level: 3 },
  ],
});
