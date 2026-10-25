/**
 * 5. osztály › Mértani alapfogalmak › 1. A pont, az egyenes és a sík
 *
 * Geometry lesson: point, line and plane, incidence, collinear points and betweenness,
 * segment and ray, and counting the lines / segments determined by n points.
 * All figures are built from the same data as the question.
 */
import {
  choice,
  defineSubtopic,
  joinHu,
  num,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type Question,
  type Rng,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers and static figures
// ---------------------------------------------------------------------------------------------

const LETTERS = ['A', 'B', 'C', 'D', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S'];
const LINES = ['p', 'q', 'r', 'e', 'f', 'g'];
/** Hungarian article before a letter name: F = eff → az, B = bé → a. */
const VOWEL_LETTERS = new Set(['A', 'E', 'F', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'U', 'X', 'Y']);
const art = (letter: string) => (VOWEL_LETTERS.has(letter[0].toUpperCase()) ? 'az' : 'a');
const Art = (letter: string) => (art(letter) === 'az' ? 'Az' : 'A');

const POINT_SETS = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['K', 'L', 'M', 'N', 'P', 'Q'],
  ['P', 'Q', 'R', 'S', 'T', 'U'],
  ['D', 'E', 'F', 'G', 'H', 'I'],
];

/** Six points, no three of them collinear. */
const POINT_COORDS: [number, number][] = [
  [0, 0],
  [4, 0],
  [4, 3],
  [1, 4],
  [0, 3],
  [2, 1],
];

/** A line p, with A and B on it and C off it. */
const pointLineFigure: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [4, 0], C: [2, 1.5] },
  items: [
    { kind: 'line', through: ['A', 'B'], label: 'p' },
    { kind: 'point', at: 'A' },
    { kind: 'point', at: 'B' },
    { kind: 'point', at: 'C' },
  ],
  caption: 'A és B a p egyenesen van, C nincs rajta.',
};

/** A parallelogram representing a part of a plane. */
const planeFigure: Figure = {
  type: 'geometry',
  points: { P1: [0, 0], P2: [7, 0], P3: [9, 4], P4: [2, 4] },
  items: [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'muted', vertexLabels: false },
    { kind: 'label', at: [4.5, 2], text: 'α', size: 'large' },
  ],
  caption: 'A sík egy részlete.',
};

/** Three collinear points: B is between A and C. */
const betweenFigure: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [3, 0], C: [7, 0] },
  items: [
    { kind: 'line', through: ['A', 'C'], label: 'p' },
    { kind: 'point', at: 'A' },
    { kind: 'point', at: 'B' },
    { kind: 'point', at: 'C' },
  ],
  caption: 'A, B és C egy egyenesen van; B az A és C között.',
};

/** A segment and a ray, one above the other. */
const segmentRayFigure: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [4, 0], C: [0, 2], D: [4, 2] },
  items: [
    { kind: 'segment', from: 'A', to: 'B', color: 'blue' },
    { kind: 'point', at: 'A' },
    { kind: 'point', at: 'B' },
    { kind: 'label', at: [2, 0.7], text: 'szakasz', color: 'blue' },
    { kind: 'ray', from: 'C', through: 'D', color: 'orange' },
    { kind: 'point', at: 'C' },
    { kind: 'point', at: 'D' },
    { kind: 'label', at: [2.6, 2.6], text: 'félegyenes', color: 'orange' },
  ],
};

/** Four points in general position, for the counting example. */
const countExampleFigure: Figure = {
  type: 'geometry',
  points: { A: [0, 0], B: [4, 0], C: [4, 3], D: [1, 4] },
  items: [
    { kind: 'point', at: 'A' },
    { kind: 'point', at: 'B' },
    { kind: 'point', at: 'C' },
    { kind: 'point', at: 'D' },
  ],
  caption: 'Négy pont, nincs köztük három egy egyenesen.',
};

/** Figure with the first `n` points of a named set (for the counting generator). */
function pointsFigure(names: string[], n: number): Figure {
  const points: Record<string, [number, number]> = {};
  for (let i = 0; i < n; i++) points[names[i]] = POINT_COORDS[i];
  return {
    type: 'geometry',
    points,
    items: names.slice(0, n).map((name) => ({ kind: 'point' as const, at: name })),
    caption: 'Nincs három egy egyenesen.',
  };
}

/** Three or four collinear points, the middle one between the others. */
function betweenFigureFor(names: string[], count: number, layout: number): Figure {
  const bases: [number, number][][] = [
    count === 3
      ? [
          [0, 0],
          [3, 0],
          [7, 0],
        ]
      : [
          [0, 0],
          [2, 0],
          [5, 0],
          [9, 0],
        ],
    count === 3
      ? [
          [0, 0],
          [2, 2],
          [6, 6],
        ]
      : [
          [0, 0],
          [2, 2],
          [5, 5],
          [9, 9],
        ],
    count === 3
      ? [
          [0, 6],
          [3, 3],
          [7, -1],
        ]
      : [
          [0, 6],
          [2, 4],
          [5, 1],
          [9, -3],
        ],
    count === 3
      ? [
          [0, 0],
          [0, 3],
          [0, 7],
        ]
      : [
          [0, 0],
          [0, 2],
          [0, 5],
          [0, 9],
        ],
  ];
  const coords = bases[layout % bases.length];
  const points: Record<string, [number, number]> = {};
  for (let i = 0; i < count; i++) points[names[i]] = coords[i];
  return {
    type: 'geometry',
    points,
    items: [
      { kind: 'line', through: [names[0], names[count - 1]], label: 'p' },
      ...names.slice(0, count).map((name) => ({ kind: 'point' as const, at: name })),
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** True/false statements about a labelled figure with a line and four points. */
const incidenceTf: GeneratorDef = {
  id: 'incidence-tf',
  title: 'Illeszkedés és kollinearitás az ábrán',
  levels: [1, 2],
  generate(rng, level): Question {
    const layouts: { on: [number, number][]; off: [number, number] }[] = [
      { on: [[0, 0], [4, 1], [8, 2]], off: [2, 3] },
      { on: [[0, 1], [3, 2], [6, 3]], off: [2, -1] },
      { on: [[0, 2], [4, 0], [8, -2]], off: [3, 3] },
    ];
    const layout = rng.pick(layouts);
    const names = rng.sample(rng.pick(POINT_SETS), 4);
    const lineName = rng.pick(LINES);
    const points: Record<string, [number, number]> = {};
    for (let i = 0; i < 3; i++) points[names[i]] = layout.on[i];
    points[names[3]] = layout.off;
    const figure: Figure = {
      type: 'geometry',
      points,
      items: [
        { kind: 'line', through: [names[0], names[2]], label: lineName },
        ...names.map((name) => ({ kind: 'point' as const, at: name })),
      ],
    };

    const onList = names.slice(0, 3);
    const off = names[3];
    const kind = level === 1 ? rng.pick(['on', 'not', 'through'] as const) : rng.pick(['on', 'not', 'through', 'collinear', 'notCollinear'] as const);
    let text: string;
    let value: boolean;
    if (kind === 'on' || kind === 'through') {
      const p = rng.pick(names);
      const isOn = onList.includes(p);
      text =
        kind === 'on'
          ? tex`${Art(p)} $${p}$ pont illeszkedik ${art(lineName)} $${lineName}$ egyenesre.`
          : tex`${Art(lineName)} $${lineName}$ egyenes átmegy ${art(p)} $${p}$ ponton.`;
      value = isOn;
    } else if (kind === 'not') {
      const p = rng.pick(names);
      text = tex`${Art(p)} $${p}$ pont nem illeszkedik ${art(lineName)} $${lineName}$ egyenesre.`;
      value = p === off;
    } else {
      const three = rng.sample(names, 3);
      const allOn = three.every((p) => onList.includes(p));
      text =
        kind === 'collinear'
          ? tex`${Art(three[0])} $${three[0]}$, $${three[1]}$ és $${three[2]}$ pontok egy egyenesen vannak.`
          : tex`${Art(three[0])} $${three[0]}$, $${three[1]}$ és $${three[2]}$ pontok nincsenek egy egyenesen.`;
      value = kind === 'collinear' ? allOn : !allOn;
    }
    return {
      prompt: tex`Igaz vagy hamis?\n\n${text}`,
      figure,
      answer: { type: 'truefalse', value },
      hint: tex`Nézd meg, mely pontok vannak ${art(lineName)} $${lineName}$ egyenesen!`,
      solution: [
        tex`Az ábrán $${onList[0]}$, $${onList[1]}$ és $${onList[2]}$ ${art(lineName)} $${lineName}$ egyenesen van; $${off}$ nincs rajta.`,
        `Az állítás **${value ? 'igaz' : 'hamis'}**.`,
      ],
    };
  },
};

/** True/false statements about the basic objects, without a figure. */
type Statement = { text: string; value: boolean; why: string };

const conceptTf: GeneratorDef = {
  id: 'concept-tf',
  title: 'Igaz-hamis állítások a pontról, egyenesről, szakaszról',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const two = rng.sample(LETTERS, 2);
    const three = rng.sample(LETTERS, 3);
    const [A, B] = two;
    const line = rng.pick(LINES);
    const pool: Statement[] =
      level === 1
        ? [
            { text: tex`${Art(A)} $${A}$ és $${B}$ pontokon át pontosan egy egyenes húzható.`, value: true, why: 'Két különböző pont egyértelműen meghatároz egy egyenest.' },
            { text: tex`${Art(A)} $${A}$ ponton át pontosan egy egyenes húzható.`, value: false, why: 'Egy ponton át végtelen sok egyenes húzható.' },
            { text: tex`${Art(A)} $${A}$ ponton át végtelen sok egyenes húzható.`, value: true, why: 'Egy pont körül minden irányban húzhatunk egyenest.' },
            { text: tex`${Art(line)} $${line}$ egyenesnek van végpontja.`, value: false, why: 'Az egyenes mindkét irányban végtelen, nincs végpontja.' },
            { text: tex`${Art(line)} $${line}$ egyenes két irányban végtelen.`, value: true, why: 'Az egyenes mindkét irányban a végtelenbe tart.' },
            { text: tex`${Art(line)} $${line}$ egyenesen végtelen sok pont van.`, value: true, why: 'Egy egyenesen végtelen sok pont helyezkedik el.' },
            { text: 'A pontnak van hossza.', value: false, why: 'A pont helyet jelöl, nincs hossza.' },
            { text: 'A sík végtelen.', value: true, why: 'A sík minden irányban végtelen, lapos felület.' },
            { text: 'A síknak van határa.', value: false, why: 'A sík határtalan.' },
            { text: tex`${Art(line)} $${line}$ egyenes része a síknak.`, value: true, why: 'Az egyenes a síkban fekszik.' },
          ]
        : level === 2
          ? [
              { text: tex`${Art(A)} $${A}${B}$ szakasznak két végpontja van.`, value: true, why: 'A szakaszt két végpont határolja.' },
              { text: tex`${Art(A)} $${A}${B}$ félegyenesnek két végpontja van.`, value: false, why: 'A félegyenesnek egy kezdőpontja van, a másik irányban végtelen.' },
              { text: tex`${Art(A)} $${A}${B}$ szakasz két irányban végtelen.`, value: false, why: 'A szakasz mindkét irányban véges.' },
              { text: tex`${Art(A)} $${A}${B}$ félegyenes egyik irányban végtelen.`, value: true, why: 'A félegyenes a kezdőponttól ellenkező irányban végtelen.' },
              { text: tex`${Art(A)} $${A}${B}$ szakasz része ${art(A)} $${A}${B}$ egyenesnek.`, value: true, why: 'A szakasz az egyenes két pontja közötti rész.' },
              { text: tex`${Art(A)} $${A}${B}$ félegyenes része ${art(A)} $${A}${B}$ egyenesnek.`, value: true, why: 'A félegyenes az egyenes egyik oldali része.' },
              { text: tex`${Art(A)} $${A}${B}$ szakasz hossza mérhető.`, value: true, why: 'A szakasznak véges hossza van.' },
              { text: tex`${Art(A)} $${A}${B}$ félegyenes hossza mérhető.`, value: false, why: 'A félegyenes végtelen, ezért nincs véges hossza.' },
              { text: tex`${Art(A)} $${A}${B}$ szakasz és ${art(B)} $${B}${A}$ szakasz ugyanaz.`, value: true, why: 'A szakasz végpontjainak sorrendje nem számít.' },
              { text: tex`${Art(A)} $${A}${B}$ félegyenes és ${art(B)} $${B}${A}$ félegyenes ugyanaz.`, value: false, why: 'A két félegyenes kezdőpontja más, ezért nem ugyanaz.' },
            ]
          : [
              { text: tex`${Art(three[0])} $${three[0]}$, $${three[1]}$ és $${three[2]}$ pontok mindig egy egyenesen vannak.`, value: false, why: 'Három pont nem feltétlenül kollineáris.' },
              { text: 'Három pont mindig meghatároz egy háromszöget.', value: false, why: 'Ha a három pont egy egyenesen van, nem alkot háromszöget.' },
              { text: 'Négy pont közül mindig kiválasztható három, amely egy egyenesen van.', value: false, why: 'Általános helyzetű négy pontnál ez nem igaz.' },
              { text: tex`Ha ${art(three[0])} $${three[0]}$, $${three[1]}$ és $${three[2]}$ pontok egy egyenesen vannak, akkor ${art(three[0])} $${three[0]}${three[1]}$ szakasz része ${art(three[0])} $${three[0]}${three[2]}$ egyenesnek.`, value: true, why: 'A szakasz két pontja ugyanazon az egyenesen van.' },
              { text: tex`${Art(A)} $${A}$ és $${B}$ pontok mindig meghatároznak egy szakaszt.`, value: true, why: 'Két különböző pont egy szakaszt határoz meg.' },
              { text: tex`${Art(A)} $${A}$ és $${B}$ pontokon át pontosan egy egyenes húzható.`, value: true, why: 'Két pont egyértelműen meghatároz egy egyenest.' },
              { text: tex`Ha ${art(A)} $${A}$ pont illeszkedik ${art(line)} $${line}$ egyenesre, akkor ${art(line)} $${line}$ egyenes átmegy ${art(A)} $${A}$ ponton.`, value: true, why: 'Az illeszkedés és az „átmegy” ugyanazt fejezi ki.' },
              { text: tex`${Art(line)} $${line}$ egyenes és egy másik egyenes ugyanaz, ha mindkettő átmegy ${art(A)} $${A}$ és $${B}$ pontokon.`, value: true, why: 'Két pont csak egy egyenest határoz meg.' },
              { text: tex`${Art(line)} $${line}$ egyenes és egy másik egyenes ugyanaz, ha csak ${art(A)} $${A}$ ponton mennek át.`, value: false, why: 'Egy ponton át végtelen sok egyenes húzható.' },
              { text: tex`${Art(A)} $${A}$ pont és ${art(line)} $${line}$ egyenes ugyanaz a fogalom.`, value: false, why: 'A pont és az egyenes különböző geometriai fogalmak.' },
              { text: 'A szakasz és a félegyenes ugyanaz a fogalom.', value: false, why: 'A szakasz véges, a félegyenes egy irányban végtelen.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át, mit tudsz a pontról, az egyenesről, a szakaszról és a félegyenesről!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** Which point lies between the other two? */
const between: GeneratorDef = {
  id: 'between',
  title: 'Közöttiség az egyenesen',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const count = level === 3 ? 4 : 3;
    const names = rng.sample(rng.pick(POINT_SETS), count);
    const layout = rng.int(0, 3);
    const figure = betweenFigureFor(names, count, layout);
    if (count === 3) {
      const correct = names[1];
      return {
        prompt: 'Melyik pont van a másik kettő között?',
        figure,
        answer: choice(rng, correct, [names[0], names[2]], { count: 3, format: (v) => `$${v}$` }),
        hint: 'Keresd meg az egyenesen a három pont sorrendjét!',
        solution: [
          tex`Az egyenesen a sorrend: $${names[0]}$, $${names[1]}$, $${names[2]}$.`,
          `Ezért **${names[1]}** van a másik kettő között.`,
        ],
      };
    }
    const askLeft = rng.chance(0.5);
    const [left, right, correct] = askLeft ? [names[0], names[2], names[1]] : [names[1], names[3], names[2]];
    const wrongs = names.filter((n) => n !== correct);
    return {
      prompt: tex`Melyik pont van ${art(left)} $${left}$ és $${right}$ pontok között?`,
      figure,
      answer: choice(rng, correct, wrongs, { count: 4, format: (v) => `$${v}$` }),
      hint: tex`Haladj az egyenesen ${art(left)} $${left}$ ponttól ${art(right)} $${right}$ pontig!`,
      solution: [
        tex`Az egyenesen a sorrend: $${names[0]}$, $${names[1]}$, $${names[2]}$, $${names[3]}$.`,
        `${Art(left)} $${left}$ és $${right}$ pontok között **${correct}** van.`,
      ],
    };
  },
};

/** Pick the correct notation for a segment, a ray, a line or an incidence. */
const notation: GeneratorDef = {
  id: 'notation',
  title: 'Szakasz, félegyenes, egyenes és illeszkedés jelölése',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const [A, B] = rng.sample(LETTERS, 2);
    const line = rng.pick(LINES);
    const kind =
      level === 1
        ? rng.pick(['segment', 'ray'] as const)
        : level === 2
          ? rng.pick(['line', 'in', 'notin'] as const)
          : rng.pick(['segment', 'ray', 'line', 'in', 'notin'] as const);
    if (kind === 'segment') {
      return {
        prompt: tex`Melyik jelölés jelöli ${art(A)} $${A}$ és $${B}$ végpontú **szakaszt**?`,
        answer: textChoice(tex`$\overline{${A}${B}}$`, [tex`$\overleftrightarrow{${A}${B}}$`, tex`$\overrightarrow{${A}${B}}$`, tex`$\overrightarrow{${B}${A}}$`]),
        hint: 'A szakasz neve fölé egyenes vonal kerül.',
        solution: [
          tex`A szakaszt a végpontjaival jelöljük, fölé vonal kerül: $\overline{${A}${B}}$.`,
          tex`A $\overleftrightarrow{${A}${B}}$ az egyenes, a $\overrightarrow{${A}${B}}$ a félegyenes jelölése.`,
        ],
      };
    }
    if (kind === 'ray') {
      return {
        prompt: tex`Melyik jelölés jelöli ${art(A)} $${A}$ kezdőpontú, $${B}$ ponton átmenő **félegyenest**?`,
        answer: textChoice(tex`$\overrightarrow{${A}${B}}$`, [tex`$\overrightarrow{${B}${A}}$`, tex`$\overline{${A}${B}}$`, tex`$\overleftrightarrow{${A}${B}}$`]),
        hint: 'A félegyenes neve fölé egy nyíl kerül, a kezdőponttól indulva.',
        solution: [
          tex`A félegyenes kezdőpontja $${A}$, ezért a nyíl $${A}$-tól $${B}$ felé mutat: $\overrightarrow{${A}${B}}$.`,
          tex`${Art(B)} $\overrightarrow{${B}${A}}$ kezdőpontja $${B}$, tehát másik félegyenes.`,
        ],
      };
    }
    if (kind === 'line') {
      return {
        prompt: tex`Melyik jelölés jelöli ${art(A)} $${A}$ és $${B}$ ponton átmenő **egyenest**?`,
        answer: textChoice(tex`$\overleftrightarrow{${A}${B}}$`, [tex`$\overline{${A}${B}}$`, tex`$\overrightarrow{${A}${B}}$`, tex`$\overrightarrow{${B}${A}}$`]),
        hint: 'Az egyenes neve fölé két nyíl kerül.',
        solution: [
          tex`Az egyenest két pontjával jelöljük, fölé két nyíl kerül: $\overleftrightarrow{${A}${B}}$.`,
          tex`${Art(A)} $\overline{${A}${B}}$ szakasz, ${art(A)} $\overrightarrow{${A}${B}}$ félegyenes.`,
        ],
      };
    }
    const isIn = kind === 'in';
    return {
      prompt: isIn
        ? tex`Melyik jelölés fejezi ki, hogy ${art(A)} $${A}$ pont **illeszkedik** ${art(line)} $${line}$ egyenesre?`
        : tex`Melyik jelölés fejezi ki, hogy ${art(A)} $${A}$ pont **nem illeszkedik** ${art(line)} $${line}$ egyenesre?`,
      answer: isIn
        ? textChoice(tex`$${A} \in ${line}$`, [tex`$${A} \notin ${line}$`, tex`$${line} \in ${A}$`, tex`$${A} \subset ${line}$`])
        : textChoice(tex`$${A} \notin ${line}$`, [tex`$${A} \in ${line}$`, tex`$${line} \notin ${A}$`, tex`$${A} \not\subset ${line}$`]),
      hint: 'Az illeszkedést a $\\in$, a nem illeszkedést a $\\notin$ jelöli.',
      solution: [
        isIn
          ? tex`Az illeszkedés jele $\in$: $${A} \in ${line}$.`
          : tex`A nem illeszkedés jele $\notin$: $${A} \notin ${line}$.`,
        'A részhalmaz jele a $\\subset$, az nem ugyanaz, mint az illeszkedés.',
      ],
    };
  },
};

/** Number of lines or segments determined by n points in general position. */
const count: GeneratorDef = {
  id: 'count',
  title: 'Pontok által meghatározott egyenesek és szakaszok',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const n = level === 1 ? rng.pick([3, 4]) : level === 2 ? rng.pick([4, 5]) : rng.pick([5, 6]);
    const names = rng.pick(POINT_SETS).slice(0, n);
    const askLines = rng.chance(0.5);
    const value = (n * (n - 1)) / 2;
    const nameList = joinHu(names.map((name) => `$${name}$`));
    const whatNom = askLines ? 'egyenes' : 'szakasz';
    const whatAcc = askLines ? 'egyenest' : 'szakaszt';
    return {
      prompt: askLines
        ? tex`Az ábrán ${nameList} jelölnek egy-egy pontot; nincs köztük három egy egyenesen. Hány egyenest határoznak meg?`
        : tex`Az ábrán ${nameList} jelölnek egy-egy pontot; nincs köztük három egy egyenesen. Hány szakaszt határoznak meg?`,
      figure: pointsFigure(names, n),
      answer: { type: 'number', value },
      inputLabel: askLines ? 'egyenes =' : 'szakasz =',
      hint: 'Számold össze a pontpárokat! Minden pár egy egyenest és egy szakaszt is meghatároz.',
      solution: [
        tex`Az egyik pontból a többi $${num(n - 1)}$ ponthoz ${whatNom} húzható.`,
        tex`$${num(n)} \cdot ${num(n - 1)} = ${num(n * (n - 1))}$, de így minden ${whatAcc} kétszer számoltunk.`,
        tex`$${num(n * (n - 1))} : 2 = ${num(value)}$.`,
        askLines ? `A pontok **${num(value)} egyenest** határoznak meg.` : `A pontok **${num(value)} szakaszt** határoznak meg.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-01',
  goals: [
    'felismerni a pontot, az egyenest és a síkot,',
    'leolvasni az illeszkedést és a közöttiséget egy ábráról,',
    'megkülönböztetni a szakaszt és a félegyenest,',
    'megszámolni a pontok által meghatározott egyeneseket és szakaszokat.',
  ],
  parts: [
    {
      title: 'Pont, egyenes és sík',
      steps: [
        {
          type: 'theory',
          title: 'A pont és az egyenes',
          body: 'A **pont** helyet jelöl, nevét nagybetűvel írjuk. Az **egyenes** két irányban végtelen, nevét kisbetűvel.',
          figure: pointLineFigure,
          remember: '$A \\in p$: az $A$ pont illeszkedik a $p$ egyenesre.',
        },
        {
          type: 'theory',
          title: 'A sík',
          body: 'A síkot a rajzon gyakran paralelogrammával jelöljük. A valódi sík azonban minden irányban végtelen.',
          figure: planeFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'Az $A$ pont illeszkedik a $p$ egyenesre.',
            figure: pointLineFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg, rajta van-e az $A$ pont a $p$ egyenesen!',
            solution: ['Az ábrán az $A$ pont rajta van a $p$ egyenesen.', 'Az állítás **igaz**.'],
          },
        },
        { type: 'practice', generator: 'incidence-tf', level: 1 },
      ],
    },
    {
      title: 'Egy egyenes két ponton át',
      steps: [
        {
          type: 'theory',
          title: 'Kollineáris pontok és közöttiség',
          body: 'Két különböző ponton át pontosan egy egyenes húzható. Az egy egyenesen lévő pontok **kollineárisak**. Három ilyen pont közül a középső a másik kettő között van.',
          figure: betweenFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'Két különböző ponton át pontosan egy egyenes húzható.',
            answer: { type: 'truefalse', value: true },
            hint: 'Próbálj két ponton át több egyenest húzni!',
            solution: ['Két pont csak egyetlen egyenest határoz meg.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Ki van között?',
          problem: 'Az ábrán $A$, $B$ és $C$ egy egyenesen van. Melyik pont van a másik kettő között?',
          figure: betweenFigure,
          steps: [
            { text: 'Az egyenesen a sorrend: $A$, $B$, $C$.' },
            { text: 'Ezért $B$ van $A$ és $C$ között.' },
          ],
          answer: '$B$ van **$A$ és $C$** között.',
        },
        { type: 'practice', generator: 'between', level: 1 },
        { type: 'practice', generator: 'concept-tf', level: 1 },
      ],
    },
    {
      title: 'Szakasz és félegyenes',
      steps: [
        {
          type: 'theory',
          title: 'Szakasz és félegyenes',
          body: 'A **szakasz** két pont között van, mindkét végén véges. A **félegyenes** egy pontból indul, és egy irányban végtelen.',
          figure: segmentRayFigure,
          remember: 'szakasz: $\\overline{AB}$ · félegyenes: $\\overrightarrow{AB}$ · egyenes: $\\overleftrightarrow{AB}$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik jelölés a $B$ kezdőpontú, $A$ felé haladó félegyenes?',
            answer: textChoice('$\\overrightarrow{BA}$', ['$\\overrightarrow{AB}$', '$\\overline{AB}$', '$\\overleftrightarrow{AB}$']),
            hint: 'A félegyenes kezdőpontja a nyíl farkánál van.',
            solution: ['A kezdőpont $B$, ezért a nyíl $B$-től $A$ felé mutat: $\\overrightarrow{BA}$.', 'A $\\overrightarrow{AB}$ kezdőpontja $A$, a $\\overline{AB}$ szakasz, a $\\overleftrightarrow{AB}$ egyenes.'],
          },
        },
        {
          type: 'example',
          title: 'Szakasz vagy félegyenes?',
          problem: 'Mi a különbség az $AB$ szakasz és az $AB$ félegyenes között?',
          figure: segmentRayFigure,
          steps: [
            { text: 'A szakasz két végpontja $A$ és $B$, hossza véges.' },
            { text: 'A félegyenes $A$-ból indul, átmegy $B$-n, és tovább tart a végtelenbe.' },
          ],
          answer: 'A szakasz véges, a félegyenes egy irányban végtelen.',
        },
        { type: 'practice', generator: 'notation', level: 1 },
        { type: 'practice', generator: 'notation', level: 2 },
      ],
    },
    {
      title: 'Pontok által meghatározott egyenesek',
      steps: [
        {
          type: 'theory',
          title: 'Hány egyenest határoznak meg?',
          body: 'Minden pontpár egy egyenest és egy szakaszt határoz meg. Hat pontnál $6 \\cdot 5 : 2 = 15$ pár van.',
          remember: '$n$ pont → $n(n-1):2$ egyenes',
        },
        {
          type: 'check',
          question: {
            prompt: 'Négy pont, amelyek közül nincs három egy egyenesen, $6$ egyenest határoz meg.',
            answer: { type: 'truefalse', value: true },
            hint: 'Számold össze a pontpárokat!',
            solution: ['Négy pontból $4 \\cdot 3 : 2 = 6$ pontpár van.', 'Ezért $6$ egyenest határoznak meg. Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Négy pont, hány egyenes?',
          problem: 'Hány egyenest határoz meg négy pont, ha nincs köztük három egy egyenesen?',
          figure: countExampleFigure,
          steps: [
            { text: 'Minden pontból $3$ egyenes indul a többi pont felé.' },
            { text: '$4 \\cdot 3 = 12$, de minden egyenest kétszer számoltunk.' },
            { text: '$12 : 2 = 6$.' },
          ],
          answer: 'Négy pont **6** egyenest határoz meg.',
        },
        { type: 'practice', generator: 'count', level: 1 },
        { type: 'practice', generator: 'count', level: 2 },
        { type: 'practice', generator: 'count', level: 3 },
        { type: 'practice', generator: 'between', level: 3 },
        { type: 'practice', generator: 'concept-tf', level: 3 },
      ],
    },
  ],
  generators: [incidenceTf, conceptTf, between, notation, count],
  miniTest: {
    items: [
      { generator: 'notation', level: 1 },
      { generator: 'incidence-tf', level: 1 },
      { generator: 'concept-tf', level: 2 },
      { generator: 'between', level: 2 },
      { generator: 'count', level: 2 },
      { generator: 'count', level: 3 },
      { generator: 'notation', level: 2 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'notation', level: 1 },
    { generator: 'incidence-tf', level: 1 },
    { generator: 'concept-tf', level: 1 },
    { generator: 'between', level: 1 },
    { generator: 'count', level: 1 },
    { generator: 'notation', level: 2 },
    { generator: 'count', level: 2 },
  ],
});
