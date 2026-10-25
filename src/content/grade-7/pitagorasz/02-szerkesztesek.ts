/**
 * 7. osztály › Pitagorasz tétele › 2. A Pitagorasz-tétel alkalmazása szerkesztéseknél
 *
 * Irrational lengths (√2, √3, √5, …) built with right triangles and the square-root spiral,
 * √n marked on the number line with a compass, and choosing legs whose squares add up to n.
 */
import {
  choice,
  defineSubtopic,
  num,
  rootText,
  simplifyRoot,
  tex,
  texRoot,
  textChoice,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type XY,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------------------------

/** A right triangle with legs a (vertical) and b (horizontal), hypotenuse c. */
function rightTriangle(opts: { a: number; b: number; labels?: { a?: string; b?: string; c?: string }; highlight?: ('a' | 'b' | 'c')[] }): Figure {
  return {
    type: 'triangle',
    legs: [opts.a, opts.b],
    sideLabels: opts.labels,
    highlight: opts.highlight,
    fill: true,
  };
}

/** The square-root spiral: each new side is 1 unit, perpendicular to the previous radius. */
function spiralFigure(): Figure {
  const pts: XY[] = [
    [0, 0],
    [1, 0],
  ];
  for (let i = 1; i <= 4; i++) {
    const [x, y] = pts[i];
    const len = Math.hypot(x, y);
    pts.push([x - y / len, y + x / len]);
  }
  const items: GeoItem[] = [];
  for (let i = 0; i < 4; i++) {
    items.push({ kind: 'segment', from: pts[i], to: pts[i + 1], label: '1', color: 'muted' });
    items.push({ kind: 'angle', vertex: pts[i + 1], from: pts[i], to: i === 0 ? pts[2] : pts[i + 2], right: true, color: 'muted' });
  }
  const labels = ['√2', '√3', '2', '√5'];
  for (let i = 1; i <= 4; i++) {
    items.push({ kind: 'segment', from: pts[0], to: pts[i + 1], label: labels[i - 1], color: 'accent' });
  }
  items.push({ kind: 'point', at: pts[0], label: 'O', labelDir: 'sw' });
  return { type: 'geometry', items, size: 'small' };
}

/**
 * √(k² + 1) on the number line: a perpendicular of height k is erected at 1, the hypotenuse is
 * carried over with a compass. `reveal` labels the final point with the value (theory); otherwise
 * it is just P (question).
 */
function sqrtOnNumberLine(k: number, reveal: boolean): Figure {
  const n = k * k + 1;
  const root = Math.sqrt(n);
  const label = reveal ? rootText(1, n) : 'P';
  // Keep the tick labels away from the final point (a tick right under the compass tip collides).
  let step = 1;
  for (const s of [1, 2, 3, 4]) {
    const nearest = Math.round(root / s) * s;
    if (Math.abs(root - nearest) > 0.35) {
      step = s;
      break;
    }
  }
  const firstItems: GeoItem[] = [
    { kind: 'segment' as const, from: 'E', to: 'K', label: `${num(k)}`, color: 'accent' as const },
    { kind: 'angle' as const, vertex: 'E', from: 'K', to: 'O', right: true },
    { kind: 'point' as const, at: 'K', label: false as const },
  ];
  if (step !== 1) firstItems.push({ kind: 'label' as const, at: 'E', text: '1', dir: 's' as const });
  return {
    type: 'construction',
    numberLine: { min: 0, max: Math.ceil(root + 0.5), step },
    points: { O: [0, 0], E: [1, 0], K: [1, k] },
    intersections: { S: { circle: ['O', 'K'], line: ['O', 'E'], near: 'E' } },
    given: [],
    steps: [
      {
        caption: 'A számegyenes $1$ pontjában merőlegest állítunk.',
        items: firstItems,
      },
      {
        caption: reveal
          ? tex`Az átfogó hossza $\sqrt{${num(n)}}$ egység.`
          : 'Az átfogó hosszát Pitagorasz-tétellel számoljuk ki.',
        items: [{ kind: 'segment', from: 'O', to: 'K', label: reveal ? rootText(1, n) : '?', color: 'accent' }],
      },
      {
        caption: 'Körzővel az origó körül az átfogó sugarával ívet húzunk.',
        items: [{ kind: 'compass', center: 'O', through: ['K', 'S'], extend: 8 }],
      },
      {
        caption: reveal ? tex`Az ív a $\sqrt{${num(n)}}$ pontot metszi ki.` : 'Az ív kimetszi a $P$ pontot a számegyenesen.',
        items: [{ kind: 'point', at: 'S', label, labelDir: 'n', color: 'highlight', dot: false }],
      },
    ],
  };
}

/** A static version of the same construction (for questions and examples). */
function sqrtOnLineStatic(k: number, reveal: boolean): Figure {
  const n = k * k + 1;
  const root = Math.sqrt(n);
  const max = Math.ceil(root + 0.5);
  const items: GeoItem[] = [
    { kind: 'segment', from: [-0.4, 0], to: [max + 0.6, 0], arrow: 'end' },
  ];
  for (let t = 0; t <= max; t++) {
    items.push({ kind: 'segment', from: [t, -0.09], to: [t, 0.09] });
    items.push({ kind: 'label', at: [t, 0], text: `${t}`, dir: 's' });
  }
  items.push(
    { kind: 'segment', from: [0, 0], to: [1, 0] },
    { kind: 'segment', from: [1, 0], to: [1, k], label: `${num(k)}`, color: 'accent' },
    { kind: 'segment', from: [0, 0], to: [1, k], label: reveal ? rootText(1, n) : '?', color: 'accent' },
    { kind: 'angle', vertex: [1, 0], from: [1, k], to: [0, 0], right: true },
    { kind: 'arc', center: [0, 0], radius: root, from: 0, to: (Math.atan2(k, 1) * 180) / Math.PI + 2, color: 'highlight' },
    { kind: 'point', at: [root, 0], label: reveal ? rootText(1, n) : 'P', labelDir: 'n', color: 'highlight' },
  );
  return { type: 'geometry', items, size: 'small' };
}

/** "√50 = 5√2" or "√34" — for solution lines. */
function rootSteps(n: number): string {
  const { coef, radicand } = simplifyRoot(n);
  if (radicand === 1) return tex`\sqrt{${num(n)}} = ${num(coef)}`;
  if (coef === 1) return tex`\sqrt{${num(n)}}`;
  return tex`\sqrt{${num(n)}} = ${texRoot(coef, radicand)}`;
}

/** A word list of leg pairs for the multiple-choice question. */
const SMALL_LEG_PAIRS: [number, number][] = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 2],
  [2, 3],
  [3, 3],
];
const LARGE_LEG_PAIRS: [number, number][] = [...SMALL_LEG_PAIRS, [1, 4], [2, 4], [4, 4], [2, 5], [3, 5], [4, 5], [5, 5]];

/** The two integer legs of √n (n has a unique such pair in our pools). */
function legsFor(n: number): [number, number] {
  for (let p = 1; p * p < n; p++) {
    const q2 = n - p * p;
    const q = Math.round(Math.sqrt(q2));
    if (q > p && q * q === q2) return [p, q];
  }
  throw new Error(`no leg pair for ${n}`);
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Which right triangle has hypotenuse √n? */
const whichTriangle: GeneratorDef = {
  id: 'which-triangle',
  title: 'Melyik háromszög átfogója √n?',
  levels: [1, 2],
  generate(rng, level): Question {
    const pool = level === 1 ? SMALL_LEG_PAIRS : LARGE_LEG_PAIRS;
    const [p, q] = rng.pick(pool);
    const n = p * p + q * q;
    const wrongs = rng.sample(
      pool.filter(([x, y]) => x * x + y * y !== n),
      3,
    );
    const fmt = ([x, y]: [number, number]) => `$${num(x)}$ és $${num(y)}$ egység`;
    return {
      prompt: tex`Melyik derékszögű háromszögnek lesz az átfogója $\sqrt{${num(n)}}$ egység?`,
      answer: choice(rng, [p, q] as [number, number], wrongs, { format: fmt }),
      hint: tex`A két befogó négyzetének összege $${num(n)}$ kell legyen.`,
      solution: [
        tex`A Pitagorasz-tétel szerint $c^2 = a^2 + b^2$.`,
        tex`${Article(num(p))} $${num(p)}$ és $${num(q)}$ befogóknál: $${num(p)}^2 + ${num(q)}^2 = ${num(p * p)} + ${num(q * q)} = ${num(n)}$.`,
        tex`Ezért az átfogó $\sqrt{${num(n)}}$ egység.`,
      ],
    };
  },
};

/** The hypotenuse produced by a step of the square-root spiral. */
const spiralLength: GeneratorDef = {
  id: 'spiral-length',
  title: 'A négyzetgyök-spirál hossza',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 3) {
      const target = rng.int(3, 6);
      const k = target * target - 1;
      return {
        prompt: tex`A spirál első szakasza $1$ egység. Hányadik átfogó lesz először $${num(target)}$ egység hosszú?`,
        answer: { type: 'number', value: k },
        inputLabel: '$k =$',
        hint: tex`A $k$. átfogó $\sqrt{k + 1}$, tehát oldd meg a $\sqrt{k + 1} = ${num(target)}$ egyenletet!`,
        solution: [
          tex`A $k$. átfogó hossza $\sqrt{k + 1}$.`,
          tex`$\sqrt{k + 1} = ${num(target)}$, ezért $k + 1 = ${num(target * target)}$.`,
          tex`$k = ${num(target * target)} - 1 = ${num(k)}$.`,
          tex`A **${num(k)}.** átfogó lesz először ${num(target)} egység hosszú.`,
        ],
      };
    }
    const k = level === 1 ? rng.pick([2, 3]) : rng.int(7, 15);
    const n = k + 1;
    const root = simplifyRoot(n);
    const isInt = root.radicand === 1;
    const approxLine =
      root.coef === 1
        ? `\\sqrt{${num(n)}} \\approx ${num(Math.sqrt(n), 2)}`
        : `\\sqrt{${num(n)}} = ${texRoot(root.coef, root.radicand)} \\approx ${num(Math.sqrt(n), 2)}`;
    return {
      prompt: tex`A spirál első szakasza $1$ egység. Milyen hosszú ${article(num(k))} $${num(k)}$. átfogó?${isInt ? '' : ' (Gyökös alakban add meg!)'}`,
      answer: isInt
        ? { type: 'number', value: root.coef, unit: 'egység' }
        : { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit: 'egység' },
      inputLabel: '$c =$',
      hint: tex`A $k$. átfogó hossza $\sqrt{k + 1}$. Helyettesítsd be: $k = ${num(k)}$!`,
      solution: [
        tex`Az első átfogó $\sqrt{2}$, a második $\sqrt{3}$, a $k$. pedig $\sqrt{k + 1}$.`,
        tex`${Article(num(k))} $${num(k)}$. átfogó: $\sqrt{${num(k)} + 1} = \sqrt{${num(n)}}$.`,
        isInt
          ? tex`$\sqrt{${num(n)}} = ${num(root.coef)}$, tehát **${num(root.coef)} egység**.`
          : tex`$${approxLine}$, tehát **$${texRoot(root.coef, root.radicand)}$ egység**.`,
      ],
    };
  },
};

/** √n marked on the number line with a compass. */
const numberLine: GeneratorDef = {
  id: 'number-line',
  title: '√n megjelölése a számegyenesen',
  levels: [1, 2],
  generate(rng, level): Question {
    const k = level === 1 ? rng.int(1, 2) : rng.int(3, 5);
    const n = k * k + 1;
    const root = simplifyRoot(n);
    return {
      prompt: tex`A számegyenes $1$ pontjában $${num(k)}$ egység magas merőlegest állítunk. Melyik számot jelöli a $P$ pont?`,
      figure: sqrtOnLineStatic(k, false),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, acceptDecimal: 2, unit: 'egység' },
      inputLabel: '$P =$',
      hint: tex`A derékszögű háromszög befogói $1$ és $${num(k)}$. Számítsd ki az átfogót!`,
      solution: [
        tex`A befogók $1$ és $${num(k)}$ egység.`,
        tex`$c^2 = 1^2 + ${num(k)}^2 = 1 + ${num(k * k)} = ${num(n)}$`,
        tex`$c = ${rootSteps(n)} \approx ${num(Math.sqrt(n), 2)}$`,
        tex`A körzőív ezt a hosszt viszi fel az origóból, tehát $P = ${texRoot(root.coef, root.radicand)}$.`,
      ],
    };
  },
};

/** Choose two integer legs whose squares sum to n. */
const chooseLegs: GeneratorDef = {
  id: 'choose-legs',
  title: 'Befogók választása adott gyökhöz',
  levels: [1, 2],
  generate(rng, level): Question {
    const easy = [5, 10, 13, 17, 20];
    const hard = [26, 29, 34, 37, 41, 52, 53, 58, 61];
    const n = rng.pick(level === 1 ? easy : hard);
    const [p, q] = legsFor(n);
    return {
      prompt: tex`Melyik az a két egész befogó, amelynek átfogója $\sqrt{${num(n)}}$ egység? Add meg növekvő sorrendben!`,
      answer: {
        type: 'numbers',
        fields: [
          { label: '$p =$', value: p },
          { label: '$q =$', value: q },
        ],
      },
      hint: tex`Keresd meg, melyik két négyzetszám összege $${num(n)}$!`,
      solution: [
        tex`A két befogó négyzetének összege $${num(n)}$ kell legyen.`,
        tex`$${num(p)}^2 + ${num(q)}^2 = ${num(p * p)} + ${num(q * q)} = ${num(n)}$.`,
        tex`Az átfogó tehát $\sqrt{${num(n)}}$ egység, a befogók **${num(p)}** és **${num(q)}**.`,
      ],
    };
  },
};

/** Put the steps of the number-line construction in order. */
const constructionSteps: GeneratorDef = {
  id: 'construction-steps',
  title: 'A szerkesztés lépéseinek sorrendje',
  levels: [1],
  generate(rng): Question {
    const k = rng.int(1, 3);
    const n = k * k + 1;
    return {
      prompt: tex`Tedd sorba a $\sqrt{${num(n)}}$ szerkesztésének lépéseit!`,
      answer: {
        type: 'order',
        items: [
          'Az $1$ pontban merőlegest állítunk.',
          `Felmérünk rá $${num(k)}$ egységet.`,
          tex`Összekötjük az origóval: az átfogó $\sqrt{${num(n)}}$.`,
          'Az átfogó sugarával ívet húzunk.',
          tex`Az ív kimetszi a $\sqrt{${num(n)}}$ pontot.`,
        ],
      },
      hint: 'Először a derékszögű háromszög készül el, csak utána kerül elő a körző.',
      solution: [
        'Az $1$ pontban merőlegest állítunk.',
        `A merőlegesre felmérünk $${num(k)}$ egységet.`,
        tex`Az átfogó $\sqrt{${num(n)}}$.`,
        'Az átfogó sugarával ívet húzunk az origó körül.',
        tex`Az ív kimetszi a $\sqrt{${num(n)}}$ pontot.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g7-pitagorasz-02',
  goals: [
    'szerkeszteni √2, √3, √5 … hosszúságú szakaszt derékszögű háromszöggel,',
    'megérteni a négyzetgyök-spirál felépítését,',
    'megjelölni √n-et a számegyenesen körzővel,',
    'kiválasztani a megfelelő befogókat egy adott gyökhöz.',
  ],
  parts: [
    {
      title: 'Gyökös hosszúságú szakaszok',
      steps: [
        {
          type: 'theory',
          title: 'A derékszögű háromszög átfogója',
          body: 'Ha a befogók $1$ és $1$ egység, az átfogó $\\sqrt{2}$. Ha $1$ és $2$, akkor $\\sqrt{5}$ — mindig a Pitagorasz-tétellel számolunk.',
          figure: rightTriangle({ a: 1, b: 1, labels: { a: '1', b: '1', c: '√2' }, highlight: ['c'] }),
          remember: '$1^2 + 1^2 = 2$, ezért az átfogó $\\sqrt{2}$ egység.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik derékszögű háromszög átfogója $\\sqrt{5}$ egység?',
            answer: textChoice('$1$ és $2$ egység', ['$1$ és $3$ egység', '$2$ és $2$ egység', '$2$ és $3$ egység']),
            hint: 'A két befogó négyzetének összege $5$ legyen.',
            solution: [
              '$1^2 + 2^2 = 1 + 4 = 5$, ezért az átfogó $\\sqrt{5}$.',
              'A többi párnál $1 + 9 = 10$, $4 + 4 = 8$, illetve $4 + 9 = 13$ adódik.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A √3 szerkesztése',
          problem: 'Az első háromszög átfogója $\\sqrt{2}$. Erre merőlegesen $1$ egységet mérünk. Milyen hosszú az új átfogó?',
          figure: rightTriangle({ a: 1, b: Math.sqrt(2), labels: { a: '1', b: '√2', c: '√3' }, highlight: ['c'] }),
          steps: [
            { text: 'Az új háromszög befogói $1$ és $\\sqrt{2}$.' },
            { text: '$1^2 + (\\sqrt{2})^2 = 1 + 2 = 3$' },
            { text: 'Az új átfogó $\\sqrt{3}$ egység.' },
          ],
          answer: 'Az új átfogó **$\\sqrt{3}$ egység**.',
        },
        { type: 'practice', generator: 'which-triangle', level: 1, count: 2 },
        { type: 'practice', generator: 'spiral-length', level: 1 },
      ],
    },
    {
      title: 'A négyzetgyök-spirál',
      steps: [
        {
          type: 'theory',
          title: 'A négyzetgyök-spirál',
          body: 'Mindig az előző átfogóra merőlegesen mérünk $1$ egységet. Így $\\sqrt{2}$, majd $\\sqrt{3}$, aztán $\\sqrt{4} = 2$ következik.',
          figure: spiralFigure(),
          remember: 'A $k$. átfogó hossza $\\sqrt{k + 1}$ egység.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A spirál ötödik átfogója $\\sqrt{6}$ egység hosszú.**',
            answer: { type: 'truefalse', value: true },
            hint: 'Az első átfogó $\\sqrt{2}$, a második $\\sqrt{3}$ — folytasd a mintát!',
            solution: [
              'A $k$. átfogó $\\sqrt{k + 1}$.',
              'Az ötödik átfogó $\\sqrt{5 + 1} = \\sqrt{6}$, tehát az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'A hetedik átfogó',
          problem: 'A spirál első szakasza $1$ egység. Milyen hosszú a $7$. átfogó?',
          steps: [
            { text: 'A $k$. átfogó hossza $\\sqrt{k + 1}$.' },
            { text: '$\\sqrt{7 + 1} = \\sqrt{8}$' },
            { text: '$\\sqrt{8} = 2\\sqrt{2} \\approx 2,83$' },
          ],
          answer: 'A $7$. átfogó **$2\\sqrt{2}$ egység** (kb. $2,83$ egység).',
        },
        { type: 'practice', generator: 'spiral-length', level: 2, count: 2 },
        { type: 'practice', generator: 'which-triangle', level: 2 },
      ],
    },
    {
      title: '√n a számegyenesen',
      steps: [
        {
          type: 'theory',
          title: 'Így kerül a gyök a számegyenesre',
          body: 'A számegyenes $1$ pontjában merőlegest állítunk, rámérünk $k$ egységet. Az átfogó $\\sqrt{1 + k^2}$, ezt körzővel visszük a számegyenesre.',
          figure: sqrtOnNumberLine(1, true),
          remember: 'Az átfogó hossza $\\sqrt{1 + k^2}$ egység.',
        },
        {
          type: 'example',
          title: 'A √5 megjelölése',
          problem: 'A számegyenes $1$ pontjában $2$ egység magas merőlegest állítunk. Melyik számhoz ér a körzőív?',
          figure: sqrtOnLineStatic(2, true),
          steps: [
            { text: 'A befogók $1$ és $2$, az átfogó $\\sqrt{1^2 + 2^2} = \\sqrt{5}$.' },
            { text: 'A körzőív ezt a hosszt méri fel az origóból.' },
            { text: '$\\sqrt{5} \\approx 2,24$' },
          ],
          answer: 'Az ív a **$\\sqrt{5}$** pontban metszi a számegyenest.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Tedd sorba a $\\sqrt{5}$ szerkesztésének lépéseit!',
            answer: {
              type: 'order',
              items: [
                'Az $1$ pontban merőlegest állítunk.',
                'Felmérünk rá $2$ egységet.',
                'Összekötjük az origóval: az átfogó $\\sqrt{5}$.',
                'Az átfogó sugarával ívet húzunk.',
                'Az ív kimetszi a $\\sqrt{5}$ pontot.',
              ],
            },
            hint: 'Először a derékszögű háromszög készül el, csak utána kerül elő a körző.',
            solution: [
              'Az $1$ pontban merőlegest állítunk.',
              'A merőlegesre felmérünk $2$ egységet.',
              'Az átfogó $\\sqrt{5}$.',
              'Az átfogó sugarával ívet húzunk az origó körül.',
              'Az ív kimetszi a $\\sqrt{5}$ pontot.',
            ],
          },
        },
        { type: 'practice', generator: 'number-line', level: 1, count: 2 },
        { type: 'practice', generator: 'choose-legs', level: 1 },
      ],
    },
    {
      title: 'Szerkesztések gyakorlása',
      steps: [
        {
          type: 'theory',
          title: 'A szerkesztés lépései',
          body: 'Válassz két befogót, amelyek négyzetösszege $n$. Az átfogó $\\sqrt{n}$. Ezt a hosszt körzővel viszed át a számegyenesre.',
          remember: 'Befogók: $p$ és $q$ → átfogó: $\\sqrt{p^2 + q^2}$.',
        },
        { type: 'practice', generator: 'construction-steps', level: 1 },
        { type: 'practice', generator: 'number-line', level: 2 },
        { type: 'practice', generator: 'choose-legs', level: 2 },
        { type: 'practice', generator: 'spiral-length', level: 3 },
      ],
    },
  ],
  generators: [whichTriangle, spiralLength, numberLine, chooseLegs, constructionSteps],
  miniTest: {
    items: [
      { generator: 'which-triangle', level: 1 },
      { generator: 'spiral-length', level: 1 },
      { generator: 'number-line', level: 1 },
      { generator: 'choose-legs', level: 1 },
      { generator: 'construction-steps', level: 1 },
      { generator: 'spiral-length', level: 2 },
      { generator: 'number-line', level: 2 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'which-triangle', level: 1 },
    { generator: 'spiral-length', level: 1 },
    { generator: 'number-line', level: 1 },
    { generator: 'choose-legs', level: 1 },
    { generator: 'spiral-length', level: 2 },
    { generator: 'number-line', level: 2 },
  ],
});
