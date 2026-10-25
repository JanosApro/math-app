/**
 * 7. osztály › Valós számok › 6. Az egyenes arányosság függvénye
 *
 * y = kx (k ≠ 0) from real contexts, value tables, dotted points growing into a line through the
 * origin, finding k from a point or a table, increasing/decreasing according to the sign of k,
 * and checking whether a point lies on the graph. Answers are computed by code.
 */
import {
  clean,
  defineSubtopic,
  gcd,
  num,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A coordinate system with one point P and its projections to the axes. */
function pointFigure(p: [number, number]): Figure {
  return {
    type: 'coordinate',
    x: [0, Math.max(6, Math.ceil(p[0]) + 2)],
    y: [0, Math.max(6, Math.ceil(p[1]) + 2)],
    points: [{ at: p, label: 'P', showCoords: true, projections: true }],
  };
}

/** A line y = kx in the window [-5, 5] × [-5, 5]. */
function lineFigure(k: number, opts: { label?: string; points?: [number, number][] } = {}): Figure {
  return {
    type: 'coordinate',
    x: [-5, 5],
    y: [-5, 5],
    functions: [{ kind: 'linear', k, label: opts.label }],
    points: opts.points?.map((at) => ({ at, color: 'accent' })),
  };
}

/** A table of x and y values with exactly one empty cell. */
function valueTable(xs: number[], ys: number[], missing: number, missingRow: 'x' | 'y'): Figure {
  const header: (string | number)[] = ['x', ...xs.map((x, i) => (missingRow === 'x' && i === missing ? '' : x))];
  const row: (string | number)[] = ['y', ...ys.map((y, i) => (missingRow === 'y' && i === missing ? '' : y))];
  return {
    type: 'table',
    header,
    rows: [row],
    rowHeaders: true,
    highlight: missingRow === 'y' ? [[0, missing + 1]] : undefined,
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Fill the missing value in a table of a direct proportionality. */
const valueTableGen: GeneratorDef = {
  id: 'value-table',
  title: 'Hiányzó érték az egyenes arányosság táblázatában',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const k = -rng.int(2, 5);
      const xs = [1, 2, 3, 4];
      const ys = xs.map((x) => k * x);
      const missing = rng.int(1, 3);
      return {
        prompt: 'A táblázat egy egyenes arányosságot mutat. Mennyi a hiányzó $x$ érték és a $k$ állandó?',
        figure: valueTable(xs, ys, missing, 'x'),
        answer: {
          type: 'numbers',
          fields: [
            { label: '$k =$', value: k },
            { label: '$x =$', value: xs[missing] },
          ],
        },
        hint: 'Előbb keresd meg a $k$ állandót egy ismert $x$–$y$ párból, aztán oszd el a megadott $y$-t $k$-val!',
        solution: [
          tex`A hányados állandó: $k = ${num(ys[0])} : ${num(xs[0])} = ${num(k)}$.`,
          tex`A hiányzó érték: $x = y : k = ${num(ys[missing])} : (${num(k)}) = ${num(xs[missing])}$.`,
          tex`Tehát **$k = ${num(k)}$** és a hiányzó **$x = ${num(xs[missing])}$**.`,
        ],
      };
    }
    const tenths = level === 1 ? rng.pick([2, 3, 4, 5, 6, 7, 8]) * 10 : rng.pick([4, 5, 8, 12, 15, 25]);
    const k = tenths / 10;
    const xs = [1, 2, 3, 4];
    const ys = xs.map((x) => clean(k * x));
    const missing = rng.int(1, 3);
    return {
      prompt: 'A táblázat egy egyenes arányosságot mutat. Mennyi a hiányzó $y$ érték?',
      figure: valueTable(xs, ys, missing, 'y'),
      answer: { type: 'number', value: ys[missing] },
      hint: tex`Az egyenes arányosságnál $y : x = k$ állandó. Számítsd ki $k$-t egy kész oszlopból!`,
      solution: [
        tex`Egy ismert pár: $x = ${num(xs[0])}$, $y = ${num(ys[0])}$, ezért $k = ${num(ys[0])} : ${num(xs[0])} = ${num(k)}$.`,
        tex`A hiányzó érték: $y = k \cdot x = ${num(k)} \cdot ${num(xs[missing])} = ${num(ys[missing])}$.`,
        tex`A hiányzó $y$ érték **${num(ys[missing])}**.`,
      ],
    };
  },
};

/** Find k from a point, from a fraction-valued point, or from a real context. */
const findK: GeneratorDef = {
  id: 'find-k',
  title: 'A k állandó meghatározása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const k = rng.int(2, 5);
      const x = rng.int(1, 4);
      const y = k * x;
      return {
        prompt: tex`Az $y = kx$ függvény grafikonja átmegy a $P(${x}; ${y})$ ponton. Mennyi $k$?`,
        figure: pointFigure([x, y]),
        answer: { type: 'number', value: k },
        inputLabel: '$k =$',
        hint: 'A pont koordinátáit írd be az $y = kx$ egyenletbe, és rendezd $k$-ra!',
        solution: [
          tex`A pont rajta van a grafikonon, ezért $y = kx$: $${num(y)} = k \cdot ${num(x)}$.`,
          tex`$k = ${num(y)} : ${num(x)} = ${num(k)}$.`,
          tex`Az állandó **$k = ${num(k)}$**.`,
        ],
      };
    }
    if (level === 2) {
      let p = rng.int(1, 5);
      let q = rng.int(2, 6);
      while (gcd(p, q) !== 1) p = rng.int(1, 5);
      while (gcd(p, q) !== 1) q = rng.int(2, 6);
      const m = rng.int(1, 3);
      const x = q * m;
      const y = p * m;
      return {
        prompt: tex`Az $y = kx$ függvény grafikonja átmegy a $P(${x}; ${y})$ ponton. Mennyi $k$?`,
        figure: pointFigure([x, y]),
        answer: { type: 'fraction', num: p, den: q, acceptDecimal: true },
        inputLabel: '$k =$',
        hint: 'A $k$ a pont $y$ koordinátájának és $x$ koordinátájának hányadosa.',
        solution: [
          tex`$k = y : x = ${num(y)} : ${num(x)}$`,
          tex`$= \frac{${num(p)}}{${num(q)}}$`,
          tex`Az állandó **$k = \frac{${num(p)}}{${num(q)}}$**.`,
        ],
      };
    }
    const kind = rng.pick(['speed', 'price'] as const);
    if (kind === 'speed') {
      const k = rng.int(4, 9) * 10;
      const t = rng.int(2, 5);
      const d = k * t;
      return {
        prompt: tex`Egy autó egyenletes sebességgel halad: $${num(t)}$ óra alatt $${num(d)}$ km-t tesz meg. Mennyi az egyenes arányosság állandója?`,
        answer: { type: 'number', value: k, unit: 'km/h' },
        inputLabel: '$k =$',
        hint: 'Az út az idő egyenes arányos függvénye. Az állandó az egységnyi idő alatt megtett út.',
        solution: [
          tex`Az összefüggés $y = kx$, ahol $y$ a megtett út, $x$ az idő.`,
          tex`$k = ${num(d)} : ${num(t)} = ${num(k)}$`,
          tex`Az állandó **${num(k)} km/h**, ez az autó sebessége.`,
        ],
      };
    }
    const k = rng.int(2, 9) * 50;
    const q = rng.int(1, 5);
    const price = k * q;
    return {
      prompt: tex`Egy boltban $${num(q)}$ kg alma $${num(price)}$ dinárba kerül. Mennyi az egyenes arányosság állandója?`,
      answer: { type: 'number', value: k, unit: 'dinár/kg' },
      inputLabel: '$k =$',
      hint: 'Az ár a mennyiség egyenes arányos függvénye. Az állandó az 1 kg árát adja.',
      solution: [
        tex`Az összefüggés $y = kx$, ahol $y$ az ár, $x$ a mennyiség.`,
        tex`$k = ${num(price)} : ${num(q)} = ${num(k)}$`,
        tex`Az állandó **${num(k)} dinár/kg**, tehát 1 kg alma ${num(k)} dinár.`,
      ],
    };
  },
};

/** Is a point on the graph of y = kx? */
const pointOnGraph: GeneratorDef = {
  id: 'point-on-graph',
  title: 'Rajta van-e a pont a grafikonon?',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const k = rng.int(2, 5);
      const x = rng.int(1, 5);
      const on = rng.chance(0.5);
      const y = k * x + (on ? 0 : rng.sign() * rng.int(1, 3));
      return {
        prompt: tex`Igaz vagy hamis?\n\nA $P(${x}; ${y})$ pont rajta van az $y = ${num(k)}x$ grafikonján.`,
        answer: { type: 'truefalse', value: on },
        hint: 'Helyettesítsd be a pont $x$ koordinátáját a függvénybe, és hasonlítsd össze az eredményt a pont $y$ koordinátájával!',
        solution: [
          tex`$${num(k)} \cdot ${num(x)} = ${num(k * x)}$`,
          on
            ? tex`Ez éppen a pont $y$ koordinátája (${num(y)}), tehát az állítás **igaz**.`
            : tex`A pont $y$ koordinátája ${num(y)}, a helyettesítés eredménye ${num(k * x)} — nem egyeznek, tehát az állítás **hamis**.`,
        ],
      };
    }
    const k = rng.pick([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]);
    const x = rng.int(1, 4) * 2;
    const on = rng.chance(0.5);
    const y = clean(k * x + (on ? 0 : rng.sign() * rng.int(1, 2)));
    return {
      prompt: tex`Igaz vagy hamis?\n\nA $P(${num(x)}; ${num(y)})$ pont rajta van az $y = ${num(k)}x$ grafikonján.`,
      answer: { type: 'truefalse', value: on },
      hint: 'A $k$ most negatív vagy tört érték is lehet. Helyettesíts be óvatosan!',
      solution: [
        tex`$${num(k)} \cdot ${num(x)} = ${num(clean(k * x))}$`,
        on
          ? tex`Ez éppen a pont $y$ koordinátája (${num(y)}), tehát az állítás **igaz**.`
          : tex`A pont $y$ koordinátája ${num(y)}, a helyettesítés eredménye ${num(clean(k * x))} — nem egyeznek, tehát az állítás **hamis**.`,
      ],
    };
  },
};

/** Which drawn line is y = kx? (L1) or which formula belongs to the drawn line? (L2) */
const chooseGraph: GeneratorDef = {
  id: 'choose-graph',
  title: 'Grafikon kiválasztása',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const config = rng.pick([
        { correct: 2, wrong: [-2, 0.5, -0.5] },
        { correct: 3, wrong: [-3, 1 / 3, -1 / 3] },
        { correct: -2, wrong: [2, -0.5, 0.5] },
        { correct: -3, wrong: [3, -1 / 3, 1 / 3] },
        { correct: 0.5, wrong: [-0.5, 2, -2] },
        { correct: -0.5, wrong: [0.5, -2, 2] },
        { correct: 4, wrong: [-4, 0.25, -0.25] },
        { correct: -4, wrong: [4, -0.25, 0.25] },
      ]);
      const slopes = rng.shuffle([config.correct, ...config.wrong]);
      const labels = ['a', 'b', 'c', 'd'];
      const correctLabel = labels[slopes.indexOf(config.correct)];
      return {
        prompt: tex`Melyik egyenes grafikonja az $y = ${num(config.correct)}x$ függvény?`,
        figure: {
          type: 'coordinate',
          x: [-5, 5],
          y: [-5, 5],
          functions: slopes.map((k, i) => ({ kind: 'linear', k, label: labels[i] })),
        },
        answer: textChoice(`$${correctLabel}$`, labels.filter((l) => l !== correctLabel).map((l) => `$${l}$`)),
        hint: 'Az $y = kx$ egyenes átmegy az origón. A $k$ azt mutatja, hogy 1-et jobbra haladva mennyit lépünk felfelé vagy lefelé.',
        solution: [
          tex`A keresett egyenes átmegy az origón, és meredeksége $k = ${num(config.correct)}$.`,
          tex`Az $x = 1$ helyen $y = ${num(config.correct)}$, tehát a $(${num(1)}; ${num(config.correct)})$ pont rajta van.`,
          tex`Ez ${article(correctLabel)} **$${correctLabel}$** jelű egyenes.`,
        ],
      };
    }
    const k = rng.pick([2, 3, 4, 5, -2, -3, -4, -5, 0.5, -0.5, 1.5, -1.5]);
    const correct = tex`$y = ${num(k)}x$`;
    const wrongs = [
      tex`$y = ${num(-k)}x$`,
      tex`$y = ${num(k)}x + 1$`,
      tex`$y = ${num(k)} : x$`,
    ];
    return {
      prompt: 'Melyik képlet tartozik az ábrán látható egyeneshez?',
      figure: lineFigure(k),
      answer: textChoice(correct, wrongs),
      hint: 'Olvasd le az egyenes egy pontját, és oszd el az $y$ koordinátát az $x$ koordinátával!',
      solution: [
        'Az egyenes átmegy az origón, tehát az összefüggés $y = kx$ alakú.',
        tex`Az $x = 1$ helyen az egyenes $y = ${num(k)}$ értéket vesz fel, ezért $k = ${num(k)}$.`,
        tex`A helyes képlet: **$y = ${num(k)}x$**.`,
      ],
    };
  },
};

/** Increasing or decreasing: the sign of k. */
const monotonic: GeneratorDef = {
  id: 'monotonic',
  title: 'Növekedés és fogyás',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 2) {
      const negative = rng.chance(0.6);
      const k = (negative ? -1 : 1) * rng.pick([1.5, 2, 2.5, 3, 4, 5]);
      const decreases = negative;
      return {
        prompt: tex`Igaz vagy hamis?\n\nAz ábrán látható $y = ${num(k)}x$ függvény csökken.`,
        figure: lineFigure(k),
        answer: { type: 'truefalse', value: decreases },
        hint: 'Ha az egyenes balról jobbra haladva emelkedik, akkor $k > 0$; ha süllyed, akkor $k < 0$.',
        solution: [
          negative
            ? 'Az egyenes balról jobbra haladva **süllyed**, tehát a függvény csökken.'
            : 'Az egyenes balról jobbra haladva **emelkedik**, tehát a függvény növekszik.',
          decreases ? 'Az állítás **igaz**.' : 'Az állítás **hamis**.',
        ],
      };
    }
    const k = rng.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    const increasing = k > 0;
    return {
      prompt: tex`Hogyan viselkedik az $y = ${num(k)}x$ függvény?`,
      answer: textChoice(
        increasing ? 'növekszik' : 'csökken',
        increasing ? ['csökken', 'állandó', 'előbb nő, aztán csökken'] : ['növekszik', 'állandó', 'előbb csökken, aztán nő'],
      ),
      hint: 'Csak a $k$ előjele számít: $k > 0$ esetén nő, $k < 0$ esetén fogy.',
      solution: [
        tex`Itt $k = ${num(k)}$, tehát $k ${increasing ? '>' : '<'} 0$.`,
        increasing ? 'A függvény **növekszik**.' : 'A függvény **csökken**.',
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. Static checks
// ---------------------------------------------------------------------------------------------

const formulaCheck: Question = {
  prompt: 'Melyik összefüggés egyenes arányosság?',
  answer: textChoice('$y = 2x$', ['$y = 2x + 1$', '$y = x^2$', '$y = 2 : x$']),
  hint: 'Az egyenes arányosságnál a két mennyiség hányadosa állandó, és a grafikon origón átmenő egyenes.',
  solution: [
    'Az $y = 2x$ alakban $y : x = 2$ minden $x \\ne 0$ esetén ugyanaz.',
    'A $2x + 1$ grafikonja nem megy át az origón, az $x^2$ nem egyenes, a $2 : x$ pedig fordított arányosság.',
  ],
};

const pointCheck: Question = {
  prompt: 'Igaz vagy hamis?\n\nA $P(2; 6)$ pont rajta van az $y = 3x$ grafikonján.',
  answer: { type: 'truefalse', value: true },
  hint: 'Helyettesítsd be az $x = 2$ értéket, és nézd meg, $6$-ot kapsz-e!',
  solution: ['$3 \\cdot 2 = 6$, tehát a pont valóban rajta van a grafikonon.'],
};

const kCheck: Question = {
  prompt: 'Az $y = kx$ grafikonja átmegy a $P(3; 12)$ ponton. Mennyi $k$?',
  answer: textChoice('$4$', ['$36$', '$9$', '$\\frac{1}{4}$']),
  hint: 'A $k$ a pont $y$ és $x$ koordinátájának hányadosa.',
  solution: ['$k = 12 : 3 = 4$.'],
};

const decreasingCheck: Question = {
  prompt: 'Igaz vagy hamis?\n\n**Ha $k < 0$, akkor az $y = kx$ függvény csökken.**',
  answer: { type: 'truefalse', value: true },
  hint: 'Gondolj arra, mit jelent a negatív meredekség a grafikonon!',
  solution: ['Negatív $k$ esetén az egyenes balról jobbra haladva lefelé megy, tehát a függvény csökken.'],
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-valos-szamok-06',
  goals: [
    'felismerni az $y = kx$ alakú egyenes arányosságot,',
    'értéktáblázatból és grafikonról leolvasni az összefüggést,',
    'meghatározni a $k$ állandót pontból vagy szöveges adatból,',
    'eldönteni, hogy egy pont rajta van-e a grafikonon.',
  ],
  parts: [
    {
      title: 'Az egyenes arányosság',
      steps: [
        {
          type: 'theory',
          title: 'Az egyenes arányosság',
          body: 'Az $y = kx$ függvényben a két mennyiség hányadosa állandó: $y : x = k$. A $k$ az egyenes arányosság állandója, és nem lehet $0$.',
          remember: '$y = kx$, ahol $k \\ne 0$',
        },
        { type: 'check', question: formulaCheck },
        {
          type: 'example',
          title: 'Út és idő',
          problem: 'Egy autó egyenletes sebességgel $3$ óra alatt $180$ km-t tesz meg. Írd fel az utat az idő függvényében!',
          steps: [
            { text: tex`$k = 180 : 3 = 60$` },
            { text: 'Az összefüggés: $y = 60x$, ahol $x$ az idő (óra), $y$ az út (km).' },
            { text: '5 óra alatt: $y = 60 \\cdot 5 = 300$ km.' },
          ],
          answer: 'Az út–idő összefüggés $y = 60x$; 5 óra alatt 300 km az út.',
        },
        { type: 'practice', generator: 'value-table', level: 1, count: 2 },
        { type: 'practice', generator: 'find-k', level: 1 },
      ],
    },
    {
      title: 'A grafikon',
      steps: [
        {
          type: 'theory',
          title: 'Pontokból egyenes',
          body: 'A táblázat értékpárjait pontként rajzoljuk fel. A pontok egy **origón átmenő egyenesre** illeszkednek: ez a függvény grafikonja.',
          remember: 'Az $y = kx$ grafikonja origón átmenő egyenes.',
        },
        {
          type: 'explore',
          title: 'Változtasd a meredekséget!',
          body: 'Húzd a csúszkát, és figyeld a pontokat!',
          sliders: [{ name: 'k', label: '$k$', min: 1, max: 4, step: 1, value: 2 }],
          render: ({ k }) => {
            const xs = [1, 2, 3, 4];
            const figure: Figure = {
              type: 'coordinate',
              x: [0, 5],
              y: [0, 17],
              points: xs.map((x) => ({ at: [x, k * x] as [number, number], color: 'accent' })),
              functions: [{ kind: 'linear', k, label: `y = ${num(k)}x` }],
            };
            return {
              figure,
              text: tex`Az $y = ${num(k)}x$ értékei: ${xs.map((x) => `$${num(k * x)}$`).join(', ')}. A pontok egy egyenesre illeszkednek.`,
            };
          },
        },
        {
          type: 'example',
          title: 'Az $y = 2x$ grafikonja',
          problem: 'Rajzold fel az $y = 2x$ függvény grafikonját!',
          figure: {
            type: 'coordinate',
            x: [0, 4],
            y: [0, 7],
            points: [1, 2, 3].map((x) => ({ at: [x, 2 * x] as [number, number], showCoords: true })),
            functions: [{ kind: 'linear', k: 2 }],
          },
          steps: [
            { text: 'Készíts táblázatot: $x = 0, 1, 2, 3$ esetén $y = 0, 2, 4, 6$.' },
            { text: 'Rajzold fel a pontokat, majd kösd össze őket az origón át!' },
          ],
          answer: 'Az egyenes átmegy az origón és a $(3; 6)$ ponton.',
        },
        { type: 'check', question: pointCheck },
        { type: 'practice', generator: 'point-on-graph', level: 1 },
        { type: 'practice', generator: 'choose-graph', level: 1 },
      ],
    },
    {
      title: 'A k meghatározása',
      steps: [
        {
          type: 'theory',
          title: 'A k értéke',
          body: 'Ha ismersz egy pontot vagy egy értékpárt, a $k$-t osztással kapod: $k = y : x$. A $k$ mutatja, hogy 1 egységnyi $x$-változáshoz mennyi $y$-változás tartozik.',
          remember: '$k = y : x$',
        },
        {
          type: 'example',
          title: 'k egy pontból',
          problem: 'Az $y = kx$ grafikonja átmegy a $P(4; 10)$ ponton. Mennyi $k$?',
          figure: pointFigure([4, 10]),
          steps: [
            { text: '$10 = k \\cdot 4$' },
            { text: '$k = 10 : 4 = 2,5$' },
          ],
          answer: '$k = 2,5$, tehát az összefüggés $y = 2,5x$.',
        },
        { type: 'check', question: kCheck },
        { type: 'practice', generator: 'find-k', level: 1, count: 2 },
        { type: 'practice', generator: 'find-k', level: 2 },
        { type: 'practice', generator: 'value-table', level: 2 },
      ],
    },
    {
      title: 'Növekedés és fogyás',
      steps: [
        {
          type: 'theory',
          title: 'A k előjele',
          body: 'Ha $k > 0$, akkor $x$ növelésével $y$ is nő: a függvény **növekszik**. Ha $k < 0$, akkor $x$ növelésével $y$ csökken: a függvény **fogy**.',
          remember: '$k > 0$: nő · $k < 0$: fogy',
        },
        { type: 'check', question: decreasingCheck },
        {
          type: 'example',
          title: 'Negatív meredekség',
          problem: 'Ábrázold az $y = -2x$ függvényt!',
          figure: {
            type: 'coordinate',
            x: [-3, 3],
            y: [-5, 5],
            points: [-2, -1, 0, 1, 2].map((x) => ({ at: [x, -2 * x] as [number, number] })),
            functions: [{ kind: 'linear', k: -2 }],
          },
          steps: [
            { text: 'Táblázat: $x = -2, -1, 0, 1, 2$ esetén $y = 4, 2, 0, -2, -4$.' },
            { text: 'A pontok egy origón átmenő egyenesen vannak, amely balról jobbra lefelé halad.' },
          ],
          answer: 'Az egyenes csökken, mert $k = -2 < 0$.',
        },
        { type: 'practice', generator: 'monotonic', level: 1, count: 2 },
        { type: 'practice', generator: 'monotonic', level: 2 },
        { type: 'practice', generator: 'point-on-graph', level: 2 },
      ],
    },
    {
      title: 'Szöveges feladatok',
      steps: [
        {
          type: 'example',
          title: 'Ár és mennyiség',
          problem: 'Egy boltban 1 kg alma 350 dinár. Írd fel az ár összefüggését, és számítsd ki 4 kg árát!',
          steps: [
            { text: '1 kg ára 350 dinár, ezért $k = 350$.' },
            { text: 'Az összefüggés: $y = 350x$, ahol $x$ a kg-ban mért mennyiség.' },
            { text: '$x = 4$ esetén $y = 350 \\cdot 4 = 1400$ dinár.' },
          ],
          answer: 'Az ár $y = 350x$; 4 kg alma 1400 dinár.',
        },
        { type: 'practice', generator: 'find-k', level: 3 },
        { type: 'practice', generator: 'value-table', level: 3 },
        { type: 'practice', generator: 'choose-graph', level: 2 },
      ],
    },
  ],
  generators: [valueTableGen, findK, pointOnGraph, chooseGraph, monotonic],
  miniTest: {
    items: [
      { generator: 'value-table', level: 1 },
      { generator: 'find-k', level: 1 },
      { generator: 'point-on-graph', level: 1 },
      { generator: 'choose-graph', level: 1 },
      { generator: 'find-k', level: 2 },
      { generator: 'monotonic', level: 2 },
      { generator: 'value-table', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'value-table', level: 1 },
    { generator: 'find-k', level: 1 },
    { generator: 'point-on-graph', level: 1 },
    { generator: 'choose-graph', level: 1 },
    { generator: 'monotonic', level: 1 },
    { generator: 'find-k', level: 2 },
    { generator: 'value-table', level: 2 },
  ],
});
