/**
 * 5. osztály › Mértani alapfogalmak › 5. A középpontos tükrözés
 *
 * Geometry lesson: point reflection about O. O is the midpoint of PP′; images of points,
 * segments, triangles, squares, rectangles and circles; the image segment is equal and
 * parallel; orientation is kept; link to the parallelogram whose diagonals bisect each other.
 * The grid figures and every coordinate answer are computed from the same data.
 */
import {
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Figure,
  type FigColor,
  type GeneratorDef,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: grid figures
// ---------------------------------------------------------------------------------------------

const at = (x: number, y: number): XY => [x, y];

/** Hungarian colour name → figure colour. */
const colorKey = (name: string): FigColor => (name === 'narancssárga' ? 'orange' : name === 'zöld' ? 'green' : 'purple');

/** "jobbra 3, fel 2" / "balra 1, le 2" for a grid step. */
function stepText(dx: number, dy: number): string {
  const parts: string[] = [];
  if (dx > 0) parts.push(`jobbra ${num(dx)}`);
  else if (dx < 0) parts.push(`balra ${num(-dx)}`);
  else parts.push('vízszintesen nem lép');
  if (dy > 0) parts.push(`fel ${num(dy)}`);
  else if (dy < 0) parts.push(`le ${num(-dy)}`);
  else parts.push('függőlegesen nem lép');
  return parts.join(', ');
}

/** A coordinate grid with O, P and four labelled candidate points. */
function pointChoiceFigure(o: XY, p: XY, candidates: { at: XY; label: string }[]): Figure {
  return {
    type: 'coordinate',
    x: [0, 10],
    y: [0, 8],
    grid: true,
    points: [
      { at: o, label: 'O', color: 'highlight', showCoords: false },
      { at: p, label: 'P' },
      ...candidates.map((c) => ({ at: c.at, label: c.label })),
    ],
  };
}

/** A coordinate grid with O and P, showing their coordinates. */
function pointCoordsFigure(o: XY, p: XY): Figure {
  return {
    type: 'coordinate',
    x: [0, 10],
    y: [0, 8],
    grid: true,
    points: [
      { at: o, label: 'O', color: 'highlight', showCoords: true, labelDir: 'ne' },
      { at: p, label: 'P', showCoords: true, labelDir: 'sw' },
    ],
  };
}

/** A coordinate grid with P and P′, showing their coordinates. */
function centreCoordsFigure(p: XY, pp: XY): Figure {
  return {
    type: 'coordinate',
    x: [0, 10],
    y: [0, 8],
    grid: true,
    points: [
      { at: p, label: 'P', showCoords: true, labelDir: 'sw' },
      { at: pp, label: 'P′', showCoords: true, labelDir: 'ne' },
    ],
    segments: [{ from: p, to: pp, dashed: true, color: 'muted' }],
  };
}

/** A grid figure showing the reflection of a point. */
const pointReflectionFigure: Figure = {
  type: 'geometry',
  grid: true,
  points: { P: at(-3, 1), O: at(0, 0), Pp: at(3, -1) },
  items: [
    { kind: 'segment', from: 'P', to: 'O', ticks: 1, color: 'blue' },
    { kind: 'segment', from: 'O', to: 'Pp', ticks: 1, color: 'orange' },
    { kind: 'point', at: 'P', color: 'blue', labelDir: 'nw' },
    { kind: 'point', at: 'O', color: 'highlight', labelDir: 's' },
    { kind: 'point', at: 'Pp', label: 'P′', color: 'orange', labelDir: 'se' },
  ],
  caption: 'O a PP′ szakasz felezőpontja.',
};

/** A segment and its image, equal and parallel. */
const segmentImageFigure: Figure = {
  type: 'geometry',
  grid: true,
  points: { A: at(-3, -1), B: at(-1, 1), O: at(0, 0), A2: at(3, 1), B2: at(1, -1) },
  items: [
    { kind: 'segment', from: 'A', to: 'B', label: 'AB', color: 'blue' },
    { kind: 'segment', from: 'A2', to: 'B2', label: 'A′B′', color: 'orange' },
    { kind: 'parallel', from: 'A', to: 'B' },
    { kind: 'parallel', from: 'A2', to: 'B2' },
    { kind: 'point', at: 'O', color: 'highlight', labelDir: 's' },
  ],
  caption: 'A kép ugyanolyan hosszú, mint az eredeti.',
};

/** A triangle and its central image on the grid. */
const triangleImageFigure: Figure = {
  type: 'coordinate',
  x: [0, 10],
  y: [0, 8],
  grid: true,
  polygons: [
    { points: [at(1, 1), at(3, 1), at(2, 3)], fill: 'blue', color: 'blue', vertexLabels: ['A', 'B', 'C'] },
    { points: [at(9, 7), at(7, 7), at(8, 5)], fill: 'orange', color: 'orange' },
  ],
  points: [{ at: at(5, 4), label: 'O', color: 'highlight' }],
};

/** The triangle, the correct image and two typical wrong copies. */
const imageChoiceFigure: Figure = {
  type: 'coordinate',
  x: [0, 10],
  y: [0, 8],
  grid: true,
  polygons: [
    { points: [at(1, 1), at(3, 1), at(2, 3)], fill: 'blue', color: 'blue', vertexLabels: ['A', 'B', 'C'] },
    { points: [at(1, 5), at(3, 5), at(2, 7)], fill: 'green', color: 'green' },
    { points: [at(9, 1), at(7, 1), at(8, 3)], fill: 'purple', color: 'purple' },
    { points: [at(9, 7), at(7, 7), at(8, 5)], fill: 'orange', color: 'orange' },
  ],
  points: [{ at: at(5, 4), label: 'O', color: 'highlight' }],
};

/** A parallelogram with its diagonals and their intersection O. */
const parallelogramFigure: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(6, 0), C: at(7.6, 3), D: at(1.6, 3), O: at(3.8, 1.5) },
  items: [
    { kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent' },
    { kind: 'segment', from: 'A', to: 'C', dashed: true, color: 'muted' },
    { kind: 'segment', from: 'B', to: 'D', dashed: true, color: 'muted' },
    { kind: 'point', at: 'O', color: 'highlight', labelDir: 'e' },
  ],
};

/** A parallelogram image figure for the generator (same shape, no vertices highlighted). */
const parallelogramAskFigure: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(6, 0), C: at(7.6, 3), D: at(1.6, 3), O: at(3.8, 1.5) },
  items: [
    { kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent' },
    { kind: 'segment', from: 'A', to: 'C', dashed: true, color: 'muted' },
    { kind: 'segment', from: 'B', to: 'D', dashed: true, color: 'muted' },
    { kind: 'point', at: 'O', color: 'highlight', labelDir: 'e' },
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** The image of a point on the grid: P′ = 2O − P. */
const pointImage: GeneratorDef = {
  id: 'point-image',
  title: 'Pont képe a középpontos tükrözésnél',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const o: XY = level === 1 || level === 2 ? at(5, 4) : at(6, 4);
    const p: XY = level === 1 ? at(rng.int(1, 3), rng.int(1, 3)) : level === 2 ? at(rng.int(2, 3), rng.int(2, 3)) : at(rng.int(1, 2), rng.int(1, 2));
    const pp: XY = [2 * o[0] - p[0], 2 * o[1] - p[1]];
    if (level === 1) {
      const wrong1: XY = [pp[0], p[1]];
      const wrong2: XY = [p[0], pp[1]];
      const wrong3: XY = [pp[0] - 1, pp[1] + 1];
      const unique: XY[] = [];
      for (const q of [pp, wrong1, wrong2, wrong3]) {
        if (!unique.some((u) => u[0] === q[0] && u[1] === q[1])) unique.push(q);
      }
      while (unique.length < 4) unique.push([pp[0] + unique.length, pp[1]]);
      const shuffled = rng.shuffle(unique);
      const labels = ['A', 'B', 'C', 'D'];
      const candidates = shuffled.map((q, i) => ({ at: q, label: labels[i] }));
      const correct = candidates[shuffled.findIndex((q) => q[0] === pp[0] && q[1] === pp[1])].label;
      const dx = o[0] - p[0];
      const dy = o[1] - p[1];
      return {
        prompt: 'A rácson $O$ a tükrözés középpontja. Melyik pont a $P$ pont képe?',
        figure: pointChoiceFigure(o, p, candidates),
        answer: textChoice(`$${correct}$`, labels.filter((l) => l !== correct).map((l) => `$${l}$`)),
        hint: '$O$ a $PP′$ szakasz felezőpontja: a $P$-ből $O$-ig lépj, majd ugyanennyit tovább!',
        solution: [
          tex`A $P$ pontból az $O$ pontba ${stepText(dx, dy)} kell lépni.`,
          tex`Ugyanennyit lépünk tovább ugyanabba az irányba: az $O$-ból ${stepText(dx, dy)}.`,
          tex`Így a $P′$ pont a **$${correct}$** jelű pont.`,
        ],
      };
    }
    const xRange = pp[0] > 10 ? 12 : 10;
    const yRange = pp[1] > 8 ? 10 : 8;
    return {
      prompt: tex`A rácson a tükrözés középpontja $O(${num(o[0])}; ${num(o[1])})$, a tükrözendő pont $P(${num(p[0])}; ${num(p[1])})$. Add meg a $P′$ koordinátáit!`,
      figure: {
        type: 'coordinate',
        x: [0, xRange],
        y: [0, yRange],
        grid: true,
        points: [
          { at: o, label: 'O', color: 'highlight', showCoords: true, labelDir: 'ne' },
          { at: p, label: 'P', showCoords: true, labelDir: 'sw' },
        ],
      },
      answer: {
        type: 'numbers',
        fields: [
          { label: '$x =$', value: pp[0] },
          { label: '$y =$', value: pp[1] },
        ],
      },
      hint: '$O$ a $PP′$ szakasz felezőpontja. A $P$-ből $O$-ig mutató lépést ismételd meg $O$-tól tovább!',
      solution: [
        tex`$P(${num(p[0])}; ${num(p[1])})$, $O(${num(o[0])}; ${num(o[1])})$.`,
        tex`A $P$-ből az $O$-ba ${stepText(o[0] - p[0], o[1] - p[1])} kell lépni.`,
        tex`Ugyanennyit lépünk tovább: $P′(${num(pp[0])}; ${num(pp[1])})$.`,
        tex`A kép koordinátái: **$x = ${num(pp[0])}$, $y = ${num(pp[1])}$**.`,
      ],
    };
  },
};

/** Find the centre O from a point and its image: O is the midpoint of PP′. */
const centre: GeneratorDef = {
  id: 'centre',
  title: 'A tükrözés középpontjának megtalálása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const p: XY = level === 3 ? at(rng.int(1, 2), rng.int(1, 2)) : at(rng.int(2, 4), rng.int(1, 3));
    const dx = level === 3 ? rng.int(2, 3) : rng.int(1, 2);
    const dy = level === 3 ? 2 : rng.int(1, 2);
    const pp: XY = [p[0] + 2 * dx, p[1] + 2 * dy];
    const o: XY = [p[0] + dx, p[1] + dy];
    if (level === 1) {
      const wrongs: XY[] = [
        [o[0] + 1, o[1]],
        [o[0], o[1] + 1],
        [p[0] + dx, p[1]],
      ];
      const unique: XY[] = [];
      for (const q of [o, ...wrongs]) {
        if (!unique.some((u) => u[0] === q[0] && u[1] === q[1])) unique.push(q);
      }
      while (unique.length < 4) unique.push([o[0] + unique.length, o[1] + unique.length]);
      const shuffled = rng.shuffle(unique);
      const labels = ['A', 'B', 'C', 'D'];
      const candidates = shuffled.map((q, i) => ({ at: q, label: labels[i] }));
      const correct = candidates[shuffled.findIndex((q) => q[0] === o[0] && q[1] === o[1])].label;
      return {
        prompt: 'A rácson $P′$ a $P$ pont képe. Melyik pont a tükrözés középpontja?',
        figure: {
          type: 'coordinate',
          x: [0, 10],
          y: [0, 8],
          grid: true,
          points: [
            { at: p, label: 'P' },
            { at: pp, label: 'P′' },
            ...candidates.map((c) => ({ at: c.at, label: c.label })),
          ],
          segments: [{ from: p, to: pp, dashed: true, color: 'muted' }],
        },
        answer: textChoice(`$${correct}$`, labels.filter((l) => l !== correct).map((l) => `$${l}$`)),
        hint: 'A tükrözés középpontja a $PP′$ szakasz felezőpontja.',
        solution: [
          tex`A $P$ és a $P′$ között a felezőpontot keressük.`,
          tex`A $P$-ből a $P′$-be ${stepText(pp[0] - p[0], pp[1] - p[1])} kell lépni; ennek a fele ${stepText(dx, dy)}.`,
          tex`A középpont a **$${correct}$** jelű pont.`,
        ],
      };
    }
    return {
      prompt: tex`A rácson a $P(${num(p[0])}; ${num(p[1])})$ pont képe $P′(${num(pp[0])}; ${num(pp[1])})$. Add meg a tükrözés középpontjának koordinátáit!`,
      figure: centreCoordsFigure(p, pp),
      answer: {
        type: 'numbers',
        fields: [
          { label: '$x =$', value: o[0] },
          { label: '$y =$', value: o[1] },
        ],
      },
      hint: 'A tükrözés középpontja a $PP′$ szakasz felezőpontja. Keresd meg a két pont „közepét”!',
      solution: [
        tex`$P(${num(p[0])}; ${num(p[1])})$, $P′(${num(pp[0])}; ${num(pp[1])})$.`,
        tex`A $P$-ből a $P′$-be ${stepText(pp[0] - p[0], pp[1] - p[1])} kell lépni.`,
        tex`A felezőpont ennek a felénél van: $O(${num(o[0])}; ${num(o[1])})$.`,
        tex`A középpont koordinátái: **$x = ${num(o[0])}$, $y = ${num(o[1])}$**.`,
      ],
    };
  },
};

/** True/false statements about the properties of central symmetry. */
type Statement = { text: string; value: boolean; why: string };

const propertiesTf: GeneratorDef = {
  id: 'properties-tf',
  title: 'Igaz-hamis állítások a középpontos tükrözésről',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: 'A középpontos tükrözésnél a tükrözés középpontja a $PP′$ szakasz felezőpontja.', value: true, why: 'Ez a középpontos tükrözés alaptulajdonsága.' },
            { text: 'A $P$ pont és a $P′$ kép ugyanolyan távolságra van a középponttól.', value: true, why: 'A középpont a $PP′$ szakasz felezőpontja.' },
            { text: 'A középpontos tükrözés után az alakzat ugyanakkora marad.', value: true, why: 'A tükrözés nem változtatja meg a méreteket.' },
            { text: 'A szakasz képe ugyanolyan hosszú, mint az eredeti.', value: true, why: 'A tükrözés megtartja a hosszúságokat.' },
            { text: 'A kör képe kör.', value: true, why: 'A középpontos tükrözés a kört körbe viszi.' },
            { text: 'A négyzet képe négyzet.', value: true, why: 'A tükrözés megtartja az alakzat fajtáját.' },
            { text: 'A háromszög képe háromszög.', value: true, why: 'A csúcsok képei háromszöget alkotnak.' },
            { text: 'A középpontos tükrözésnél minden pont a helyén marad.', value: false, why: 'Csak a középpont marad a helyén.' },
            { text: 'A tükrözés középpontja a tükrözés után is a helyén marad.', value: true, why: 'A középpont képe önmaga.' },
            { text: 'A középpontos tükrözésnél a $P$ pont képe mindig a $P$-vel azonos oldalon van.', value: false, why: 'A kép a középpont túlsó oldalán van.' },
          ]
        : level === 2
          ? [
              { text: 'Ha a szakasz nem megy át a középponton, akkor a képe párhuzamos az eredetivel.', value: true, why: 'A középpontos tükrözés a szakaszt vele párhuzamos szakaszba viszi.' },
              { text: 'A középpontos tükrözés megtartja az irányítást.', value: true, why: 'A középpontos tükrözés 180°-os forgatás, ezért nem fordítja meg az irányítást.' },
              { text: 'A középpontos tükrözés megfordítja a sík irányítását.', value: false, why: 'Az irányítás megmarad; a tengelyes tükrözés fordítja meg.' },
              { text: 'A paralelogramma átlói felezik egymást.', value: true, why: 'Ez a paralelogramma egyik alaptulajdonsága.' },
              { text: 'Ha egy négyszög átlói felezik egymást, akkor a négyszög paralelogramma.', value: true, why: 'Ez a paralelogramma felismerésének egyik módja.' },
              { text: 'A középpontos tükrözésnél a képpont és az eredeti pont a középponttól egyenlő távolságra van.', value: true, why: 'A középpont a felezőpont.' },
              { text: 'A középpontos tükrözésnél a szakasz képe mindig rövidebb.', value: false, why: 'A kép ugyanolyan hosszú.' },
              { text: 'A középpontos tükrözésnél a szög nagysága változatlan marad.', value: true, why: 'A tükrözés megtartja a szögeket.' },
              { text: 'A középpontos tükrözésnél a képpont az eredeti pont és a középpont között van.', value: false, why: 'A középpont van a két pont között, a felezőpontjukon.' },
              { text: 'A téglalap képe téglalap.', value: true, why: 'A tükrözés megtartja az alakzatot.' },
            ]
          : [
              { text: 'A kör középpontosan tükrös a középpontjára.', value: true, why: 'A kör középpontja a szimmetriaközéppont.' },
              { text: 'A négyzet középpontosan tükrös az átlói metszéspontjára.', value: true, why: 'A négyzet átlói felezik egymást.' },
              { text: 'A paralelogramma középpontosan tükrös az átlói metszéspontjára.', value: true, why: 'Az átlók felezik egymást, ezért a csúcsok egymás képei.' },
              { text: 'Minden háromszög középpontosan tükrös.', value: false, why: 'Általában egy háromszögnek nincs szimmetriaközéppontja.' },
              { text: 'A középpontos tükrözés megtartja az alakot és a méretet.', value: true, why: 'A tükrözés egybevágósági transzformáció.' },
              { text: 'A középpontos tükrözésnél a csúcsok sorrendje megfordul.', value: false, why: 'Az irányítás megmarad, ezért a sorrend nem fordul meg.' },
              { text: 'Két pont középpontosan tükrös egymásra, ha a felezőpontjuk a tükrözés középpontja.', value: true, why: 'Ez a középpontos tükrözés definíciója.' },
              { text: 'Egy alakzatnak legfeljebb egy szimmetriaközéppontja lehet.', value: true, why: 'Ha két középpont lenne, az alakzat végtelen nagy lenne.' },
              { text: 'A paralelogramma átlóinak metszéspontja a paralelogramma szimmetriaközéppontja.', value: true, why: 'Az átlók felezik egymást.' },
              { text: 'A szabályos háromszög középpontosan tükrös.', value: false, why: 'A szabályos háromszögnek nincs szimmetriaközéppontja.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át, mi történik a pontokkal, szakaszokkal és alakzatokkal a középpontos tükrözésnél!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** Which coloured copy is the image of the triangle / square / rectangle? */
const imageMc: GeneratorDef = {
  id: 'image-mc',
  title: 'Melyik alakzat a képe?',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const shape = level === 1 ? 'triangle' : level === 2 ? 'square' : 'rectangle';
    const o: XY = at(5, 4);
    const original: XY[] =
      shape === 'triangle'
        ? [at(1, 1), at(3, 1), at(2, 3)]
        : shape === 'square'
          ? [at(1, 1), at(3, 1), at(3, 3), at(1, 3)]
          : [at(1, 1), at(4, 1), at(4, 3), at(1, 3)];
    const image = original.map((q): XY => [2 * o[0] - q[0], 2 * o[1] - q[1]]);
    const translated = original.map((q): XY => [q[0], q[1] + 4]);
    const axial = original.map((q): XY => [2 * 5 - q[0], q[1]]);
    const vertexLabels = shape === 'triangle' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    const [correctColor, wrong1Color, wrong2Color] = rng.shuffle(['narancssárga', 'zöld', 'lila']);
    return {
      prompt: tex`Melyik színű ${shape === 'triangle' ? 'háromszög' : shape === 'square' ? 'négyzet' : 'téglalap'} az $${shape === 'triangle' ? 'ABC' : 'ABCD'}$ ${shape === 'triangle' ? 'háromszög' : shape === 'square' ? 'négyzet' : 'téglalap'} képe?`,
      figure: {
        type: 'coordinate',
        x: [0, 10],
        y: [0, 8],
        grid: true,
        polygons: [
          { points: original, fill: 'blue', color: 'blue', vertexLabels },
          { points: translated, fill: colorKey(wrong1Color), color: colorKey(wrong1Color) },
          { points: axial, fill: colorKey(wrong2Color), color: colorKey(wrong2Color) },
          { points: image, fill: colorKey(correctColor), color: colorKey(correctColor) },
        ],
        points: [{ at: o, label: 'O', color: 'highlight' }],
      },
      answer: textChoice(`a ${correctColor}`, [`a ${wrong1Color}`, `a ${wrong2Color}`]),
      hint: 'A képet úgy kapod, hogy minden csúcsot tükrözöl az $O$ pontra.',
      solution: [
        tex`A középpontos tükrözésnél minden csúcs a $O$-val ellentétes oldalra kerül, ugyanolyan messzire.`,
        `A ${wrong1Color} alakzat el van tolva, a ${wrong2Color} tengelyesen tükrözött; egyik sem a középpontos kép.`,
        `A helyes kép a **${correctColor}** alakzat.`,
      ],
    };
  },
};

/** The link to the parallelogram: opposite vertices are images of each other. */
const parallelogramCentre: GeneratorDef = {
  id: 'parallelogram-centre',
  title: 'Paralelogramma és középpontos tükrözés',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const askA = rng.chance(0.5);
      const from = askA ? 'A' : 'C';
      const to = askA ? 'C' : 'A';
      const wrongs = ['A', 'B', 'C', 'D', 'O'].filter((v) => v !== from && v !== to).map((v) => `$${v}$`);
      return {
        prompt: tex`A paralelogramma átlói az $O$ pontban metszik egymást. Melyik pont ${from === 'A' ? 'az' : 'a'} $${from}$ csúcs képe az $O$-ra tükrözésnél?`,
        figure: parallelogramAskFigure,
        answer: textChoice(`$${to}$`, wrongs),
        hint: 'A paralelogramma átlói felezik egymást, ezért $A$ és $C$ egymás képei.',
        solution: ['Az $AC$ átló felezőpontja $O$.', `Ezért ${from === 'A' ? 'az' : 'a'} $${from}$ csúcs képe ${to === 'A' ? 'az' : 'a'} **$${to}$** csúcs.`],
      };
    }
    if (level === 2) {
      const askB = rng.chance(0.5);
      const from = askB ? 'B' : 'D';
      const to = askB ? 'D' : 'B';
      const wrongs = ['A', 'B', 'C', 'D', 'O'].filter((v) => v !== from && v !== to).map((v) => `$${v}$`);
      return {
        prompt: tex`A paralelogramma átlói az $O$ pontban metszik egymást. Melyik pont a $${from}$ csúcs képe az $O$-ra tükrözésnél?`,
        figure: parallelogramAskFigure,
        answer: textChoice(`$${to}$`, wrongs),
        hint: 'A $BD$ átló felezőpontja $O$.',
        solution: ['A $BD$ átló felezőpontja $O$.', `Ezért a $${from}$ csúcs képe a **$${to}$** csúcs.`],
      };
    }
    return {
      prompt: 'Miért középpontosan tükrös a paralelogramma az átlói metszéspontjára?',
      figure: parallelogramAskFigure,
      answer: textChoice('Mert az átlói felezik egymást.', [
        'Mert minden oldala egyenlő.',
        'Mert minden szöge derékszög.',
        'Mert az átlói merőlegesek egymásra.',
      ]),
      hint: 'A középpontos tükrözésnél a középpont a megfelelő csúcsokat összekötő szakasz felezőpontja.',
      solution: [
        'A paralelogramma átlói felezik egymást, tehát $O$ az $AC$ és a $BD$ átló felezőpontja is.',
        'Ezért $A$ képe $C$, $B$ képe $D$.',
        'A paralelogramma **az átlói metszéspontjára középpontosan tükrös**.',
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-05',
  goals: [
    'megszerkeszteni egy pont képét a középpontos tükrözésnél,',
    'megtalálni a tükrözés középpontját egy pont és a képe alapján,',
    'felismerni a szakaszok és alakzatok képeit,',
    'összekapcsolni a középpontos tükrözést a paralelogrammával.',
  ],
  parts: [
    {
      title: 'Tükrözés egy pontra',
      steps: [
        {
          type: 'theory',
          title: 'A középpontos tükrözés',
          body: 'A $P$ pont képe $P′$ úgy, hogy a tükrözés középpontja, $O$ a $PP′$ szakasz felezőpontja. A $P$ és $P′$ a $O$ két oldalán van.',
          figure: pointReflectionFigure,
          remember: '$O$ a $PP′$ felezőpontja',
        },
        {
          type: 'check',
          question: {
            prompt: 'A középpontos tükrözésnél $O$ a $PP′$ szakasz felezőpontja.',
            figure: pointReflectionFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg az ábrán a két egyenlő szakaszt!',
            solution: ['A $P$ és $P′$ a $O$-tól ugyanolyan távolságra van, ezért $O$ a felezőpont.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Pont képe a rácson',
          problem: 'A $P$ pont koordinátái $(2; 2)$, a tükrözés középpontja $O(5; 4)$. Add meg a $P′$ koordinátáit!',
          figure: pointCoordsFigure(at(5, 4), at(2, 2)),
          steps: [
            { text: '$P$-ből $O$-ba: jobbra 3, fel 2.' },
            { text: 'Ugyanennyit tovább: jobbra 3, fel 2.' },
            { text: '$P′ = (8; 6)$.' },
          ],
          answer: 'A kép koordinátái: **$x = 8$, $y = 6$**.',
        },
        { type: 'practice', generator: 'point-image', level: 1 },
        { type: 'practice', generator: 'point-image', level: 2 },
      ],
    },
    {
      title: 'A középpont megtalálása',
      steps: [
        {
          type: 'theory',
          title: 'Hol a középpont?',
          body: 'A tükrözés középpontja a $P$ és a $P′$ közötti szakasz felezőpontja. A rácson a két pont közötti lépések felénél találod.',
          figure: pointReflectionFigure,
          remember: '$O$ = a $PP′$ felezőpontja',
        },
        {
          type: 'check',
          question: {
            prompt: 'Ha $P′$ a $P$ képe, akkor $O$ a $PP′$ szakasz felezőpontja.',
            answer: { type: 'truefalse', value: true },
            hint: 'A tükrözés középpontja mindig a két pont között, félúton van.',
            solution: ['A képpont és az eredeti pont a középponttól egyenlő távolságra van.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'A középpont megkeresése',
          problem: 'A $P(2; 2)$ pont képe $P′(8; 6)$. Hol van a tükrözés középpontja?',
          figure: centreCoordsFigure(at(2, 2), at(8, 6)),
          steps: [
            { text: '$P$-ből $P′$-be: jobbra 6, fel 4.' },
            { text: 'Ennek a fele: jobbra 3, fel 2.' },
            { text: '$P$-ből indulva: $O(5; 4)$.' },
          ],
          answer: 'A tükrözés középpontja **$O(5; 4)$**.',
        },
        { type: 'practice', generator: 'centre', level: 1 },
        { type: 'practice', generator: 'centre', level: 2 },
        { type: 'practice', generator: 'centre', level: 3 },
        { type: 'practice', generator: 'properties-tf', level: 1 },
      ],
    },
    {
      title: 'Szakaszok és alakzatok képe',
      steps: [
        {
          type: 'theory',
          title: 'A szakasz képe',
          body: 'A szakasz képe ugyanolyan hosszú, mint az eredeti, és párhuzamos vele. A tükrözés megtartja az irányítást.',
          figure: segmentImageFigure,
          remember: 'A kép egyenlő és párhuzamos.',
        },
        {
          type: 'theory',
          title: 'Alakzatok képei',
          body: 'A háromszög, a négyzet, a téglalap és a kör képe ugyanolyan alakú és méretű. A kör képe kör, a négyzet képe négyzet.',
          figure: triangleImageFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'A szakasz képe ugyanolyan hosszú, mint az eredeti.',
            figure: segmentImageFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'A tükrözés nem változtatja meg a hosszúságokat.',
            solution: ['A középpontos tükrözés megtartja a hosszúságokat.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Melyik a kép?',
          problem: 'Az $ABC$ háromszöget tükrözzük az $O$ pontra. Melyik színű háromszög a képe?',
          figure: imageChoiceFigure,
          steps: [
            { text: 'Minden csúcsot az $O$-ra tükrözünk.' },
            { text: 'A kép az $O$-val ellentétes oldalon, ugyanolyan messze van.' },
            { text: 'A narancssárga háromszög csúcsai éppen a tükrözött csúcsok.' },
          ],
          answer: 'A kép a **narancssárga** háromszög.',
        },
        { type: 'practice', generator: 'image-mc', level: 1 },
        { type: 'practice', generator: 'image-mc', level: 2 },
        { type: 'practice', generator: 'properties-tf', level: 2 },
        { type: 'practice', generator: 'point-image', level: 3 },
      ],
    },
    {
      title: 'Paralelogramma és tükrözés',
      steps: [
        {
          type: 'theory',
          title: 'A paralelogramma',
          body: 'A paralelogramma átlói felezik egymást, ezért a paralelogramma középpontosan tükrös az átlók metszéspontjára. Az $A$ képe $C$, a $B$ képe $D$.',
          figure: parallelogramFigure,
          remember: 'A paralelogramma középpontosan tükrös.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A paralelogramma átlói felezik egymást.',
            figure: parallelogramFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg az átlók metszéspontját az ábrán!',
            solution: ['A paralelogramma átlói a metszéspontban felezik egymást.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'A csúcsok képei',
          problem: 'A paralelogramma átlói az $O$ pontban metszik egymást. Melyik pont az $A$ csúcs képe?',
          figure: parallelogramFigure,
          steps: [
            { text: 'Az $AC$ átló felezőpontja $O$.' },
            { text: 'Ezért az $A$ tükrözött képe a $C$ csúcs.' },
          ],
          answer: 'Az $A$ csúcs képe a **$C$** csúcs.',
        },
        { type: 'practice', generator: 'parallelogram-centre', level: 1 },
        { type: 'practice', generator: 'parallelogram-centre', level: 2 },
        { type: 'practice', generator: 'parallelogram-centre', level: 3 },
        { type: 'practice', generator: 'image-mc', level: 3 },
        { type: 'practice', generator: 'properties-tf', level: 3 },
      ],
    },
  ],
  generators: [pointImage, centre, propertiesTf, imageMc, parallelogramCentre],
  miniTest: {
    items: [
      { generator: 'point-image', level: 1 },
      { generator: 'centre', level: 1 },
      { generator: 'properties-tf', level: 1 },
      { generator: 'parallelogram-centre', level: 2 },
      { generator: 'point-image', level: 2 },
      { generator: 'centre', level: 2 },
      { generator: 'properties-tf', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'point-image', level: 1 },
    { generator: 'centre', level: 1 },
    { generator: 'properties-tf', level: 1 },
    { generator: 'parallelogram-centre', level: 1 },
    { generator: 'image-mc', level: 1 },
    { generator: 'point-image', level: 2 },
    { generator: 'centre', level: 2 },
  ],
});
