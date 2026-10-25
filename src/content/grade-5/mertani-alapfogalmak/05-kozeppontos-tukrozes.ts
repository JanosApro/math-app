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
  type Rng,
  type XY,
  article,
  Article,
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

type Dir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
/** The compass direction of the step (dx, dy), to put a label away from a neighbouring point. */
function dirOf(dx: number, dy: number): Dir {
  const v = dy > 0 ? 'n' : dy < 0 ? 's' : '';
  const h = dx > 0 ? 'e' : dx < 0 ? 'w' : '';
  return ((v + h) || 'n') as Dir;
}

/** A coordinate grid with O and P, showing their coordinates; each label points away from the other. */
function pointCoordsFigure(o: XY, p: XY): Figure {
  return {
    type: 'coordinate',
    x: [0, 10],
    y: [0, 8],
    grid: true,
    points: [
      { at: o, label: 'O', color: 'highlight', showCoords: true, labelDir: dirOf(o[0] - p[0], o[1] - p[1]) },
      { at: p, label: 'P', showCoords: true, labelDir: dirOf(p[0] - o[0], p[1] - o[1]) },
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
      { at: p, label: 'P', showCoords: true, labelDir: dirOf(p[0] - pp[0], p[1] - pp[1]) },
      { at: pp, label: 'P′', showCoords: true, labelDir: dirOf(pp[0] - p[0], pp[1] - p[1]) },
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

const GRID = { w: 10, h: 8 };
/** Inside the grid, one unit away from the axes and the border (labels stay readable). */
const inGrid = ([x, y]: XY) => x >= 1 && x <= GRID.w - 1 && y >= 1 && y <= GRID.h - 1;
const same = (u: XY, v: XY) => u[0] === v[0] && u[1] === v[1];

/** A centre O and a step d (not zero), so that O − d and O + d are both on the grid. */
function centreAndStep(rng: Rng, maxStep: number): { o: XY; d: XY } {
  for (;;) {
    const o: XY = [rng.int(3, 7), rng.int(2, 6)];
    const d: XY = [rng.int(-maxStep, maxStep), rng.int(-maxStep, maxStep)];
    if (d[0] === 0 && d[1] === 0) continue;
    if (Math.abs(d[0]) + Math.abs(d[1]) < 2) continue;
    if (inGrid([o[0] - d[0], o[1] - d[1]]) && inGrid([o[0] + d[0], o[1] + d[1]])) return { o, d };
  }
}

/** Four labelled candidate points: the correct one and three typical mistakes, all on the grid. */
function candidatesFor(rng: Rng, correct: XY, mistakes: XY[], avoid: XY[]): { list: { at: XY; label: string }[]; label: string } {
  const unique: XY[] = [correct];
  for (const q of [...mistakes, [correct[0] + 1, correct[1]] as XY, [correct[0], correct[1] - 1] as XY, [correct[0] - 1, correct[1] + 1] as XY]) {
    if (unique.length === 4) break;
    if (inGrid(q) && !unique.some((u) => same(u, q)) && !avoid.some((u) => same(u, q))) unique.push(q);
  }
  const shuffled = rng.shuffle(unique);
  const labels = ['A', 'B', 'C', 'D'];
  const list = shuffled.map((q, i) => ({ at: q, label: labels[i] }));
  return { list, label: labels[shuffled.findIndex((q) => same(q, correct))] };
}

const coords = (q: XY) => `(${num(q[0])}; ${num(q[1])})`;

/** The image of a point on the grid: P′ = 2O − P. Level 3 goes backwards: P from P′. */
const pointImage: GeneratorDef = {
  id: 'point-image',
  title: 'Pont képe a középpontos tükrözésnél',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const { o, d } = centreAndStep(rng, level === 1 ? 3 : 4);
    const p: XY = [o[0] - d[0], o[1] - d[1]];
    const pp: XY = [o[0] + d[0], o[1] + d[1]];
    if (level === 1) {
      // typical mistakes: only one coordinate reflected, or the step not repeated
      const { list, label } = candidatesFor(rng, pp, [[pp[0], p[1]], [p[0], pp[1]], [o[0] + d[0] - Math.sign(d[0] || 1), o[1] + d[1]]], [o, p]);
      return {
        prompt: 'A rácson $O$ a tükrözés középpontja. Melyik pont a $P$ pont képe?',
        figure: pointChoiceFigure(o, p, list),
        answer: textChoice(`$${label}$`, ['A', 'B', 'C', 'D'].filter((l) => l !== label).map((l) => `$${l}$`)),
        hint: '$O$ a $PP′$ szakasz felezőpontja: a $P$-ből $O$-ig lépj, majd ugyanennyit tovább!',
        solution: [
          tex`A $P$ pontból az $O$ pontba ${stepText(d[0], d[1])} kell lépni.`,
          tex`Ugyanennyit lépünk tovább ugyanabba az irányba: az $O$-ból ${stepText(d[0], d[1])}.`,
          tex`Így a $P′$ pont ${article(label)} **$${label}$** jelű pont.`,
        ],
      };
    }
    if (level === 2) {
      return {
        prompt: tex`A rácson a tükrözés középpontja $O${coords(o)}$, a tükrözendő pont $P${coords(p)}$. Add meg a $P′$ koordinátáit!`,
        figure: pointCoordsFigure(o, p),
        answer: { type: 'numbers', fields: [{ label: '$x =$', value: pp[0] }, { label: '$y =$', value: pp[1] }] },
        hint: '$O$ a $PP′$ szakasz felezőpontja. A $P$-ből $O$-ig mutató lépést ismételd meg $O$-tól tovább!',
        solution: [
          tex`A $P$-ből az $O$-ba ${stepText(d[0], d[1])} kell lépni.`,
          tex`Ugyanennyit lépünk tovább: $P′${coords(pp)}$.`,
          tex`A kép koordinátái: **$x = ${num(pp[0])}$, $y = ${num(pp[1])}$**.`,
        ],
      };
    }
    // level 3: backwards — the image is known, where was the point?
    return {
      prompt: tex`A középpontos tükrözés középpontja $O${coords(o)}$. A $P$ pont képe $P′${coords(pp)}$. Add meg a $P$ pont koordinátáit!`,
      figure: {
        type: 'coordinate',
        x: [0, GRID.w],
        y: [0, GRID.h],
        grid: true,
        points: [
          { at: o, label: 'O', color: 'highlight', showCoords: true, labelDir: dirOf(-d[0], -d[1]) },
          { at: pp, label: 'P′', showCoords: true, labelDir: dirOf(d[0], d[1]) },
        ],
      },
      answer: { type: 'numbers', fields: [{ label: '$x =$', value: p[0] }, { label: '$y =$', value: p[1] }] },
      hint: 'A $P$ és a $P′$ egymás képei: a $P′$-ből $O$-ig lépj, majd ugyanennyit tovább!',
      solution: [
        tex`A $P′$-ből az $O$-ba ${stepText(-d[0], -d[1])} kell lépni.`,
        tex`Ugyanennyit tovább lépve: $P${coords(p)}$.`,
        tex`A $P$ koordinátái: **$x = ${num(p[0])}$, $y = ${num(p[1])}$**.`,
      ],
    };
  },
};

/** Find the centre O from a point and its image: O is the midpoint of PP′. Level 3 then uses it. */
const centre: GeneratorDef = {
  id: 'centre',
  title: 'A tükrözés középpontjának megtalálása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const { o, d } = centreAndStep(rng, 3);
    const p: XY = [o[0] - d[0], o[1] - d[1]];
    const pp: XY = [o[0] + d[0], o[1] + d[1]];
    const full: XY = [2 * d[0], 2 * d[1]];
    if (level === 1) {
      // typical mistakes: the full step instead of half, or half of only one coordinate
      const { list, label } = candidatesFor(rng, o, [[p[0] + d[0], p[1]], [p[0], p[1] + d[1]], [o[0] + Math.sign(d[0] || 1), o[1]]], [p, pp]);
      return {
        prompt: 'A rácson $P′$ a $P$ pont képe. Melyik pont a tükrözés középpontja?',
        figure: {
          type: 'coordinate',
          x: [0, GRID.w],
          y: [0, GRID.h],
          grid: true,
          points: [{ at: p, label: 'P' }, { at: pp, label: 'P′' }, ...list.map((c) => ({ at: c.at, label: c.label }))],
          segments: [{ from: p, to: pp, dashed: true, color: 'muted' }],
        },
        answer: textChoice(`$${label}$`, ['A', 'B', 'C', 'D'].filter((l) => l !== label).map((l) => `$${l}$`)),
        hint: 'A tükrözés középpontja a $PP′$ szakasz felezőpontja.',
        solution: [
          'A $P$ és a $P′$ között a felezőpontot keressük.',
          tex`A $P$-ből a $P′$-be ${stepText(full[0], full[1])} kell lépni; ennek a fele ${stepText(d[0], d[1])}.`,
          tex`A középpont ${article(label)} **$${label}$** jelű pont.`,
        ],
      };
    }
    if (level === 2) {
      return {
        prompt: tex`A rácson a $P${coords(p)}$ pont képe $P′${coords(pp)}$. Add meg a tükrözés középpontjának koordinátáit!`,
        figure: centreCoordsFigure(p, pp),
        answer: { type: 'numbers', fields: [{ label: '$x =$', value: o[0] }, { label: '$y =$', value: o[1] }] },
        hint: 'A tükrözés középpontja a $PP′$ szakasz felezőpontja. Keresd meg a két pont „közepét”!',
        solution: [
          tex`A $P$-ből a $P′$-be ${stepText(full[0], full[1])} kell lépni.`,
          tex`A felezőpont ennek a felénél van: $O${coords(o)}$.`,
          tex`A középpont koordinátái: **$x = ${num(o[0])}$, $y = ${num(o[1])}$**.`,
        ],
      };
    }
    // level 3: two steps — find O, then reflect another point Q with the same centre
    let q: XY;
    let qq: XY;
    do {
      q = [rng.int(1, GRID.w - 1), rng.int(1, GRID.h - 1)];
      qq = [2 * o[0] - q[0], 2 * o[1] - q[1]];
    } while (!inGrid(qq) || same(q, o) || same(q, p) || same(q, pp) || Math.abs(q[0] - o[0]) + Math.abs(q[1] - o[1]) < 2);
    return {
      prompt: tex`Egy középpontos tükrözésnél a $P${coords(p)}$ pont képe $P′${coords(pp)}$. Ugyanennél a tükrözésnél mi a $Q${coords(q)}$ pont képe?`,
      figure: {
        type: 'coordinate',
        x: [0, GRID.w],
        y: [0, GRID.h],
        grid: true,
        points: [
          { at: p, label: 'P', showCoords: true },
          { at: pp, label: 'P′', showCoords: true },
          { at: q, label: 'Q', showCoords: true, color: 'orange' },
        ],
        segments: [{ from: p, to: pp, dashed: true, color: 'muted' }],
      },
      answer: { type: 'numbers', fields: [{ label: '$x =$', value: qq[0] }, { label: '$y =$', value: qq[1] }] },
      hint: 'Először keresd meg a középpontot: a $PP′$ szakasz felezőpontját. Utána tükrözd rá $Q$-t!',
      solution: [
        tex`A középpont a $PP′$ felezőpontja: $O${coords(o)}$.`,
        tex`A $Q$-ból az $O$-ba ${stepText(o[0] - q[0], o[1] - q[1])} kell lépni; ugyanennyit tovább: $Q′${coords(qq)}$.`,
        tex`A kép koordinátái: **$x = ${num(qq[0])}$, $y = ${num(qq[1])}$**.`,
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
              { text: 'A középpontos tükrözésnél a szakasz és a képe mindig egy egyenesre esik.', value: false, why: 'Csak akkor, ha a szakasz egyenese átmegy a középponton; különben a kép párhuzamos az eredetivel.' },
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
              { text: 'Két pont egymás képe, ha az őket összekötő szakasz felezőpontja a tükrözés középpontja.', value: true, why: 'Ez a középpontos tükrözés definíciója.' },
              { text: 'A téglalap középpontosan tükrös az átlói metszéspontjára.', value: true, why: 'A téglalap is paralelogramma: az átlói felezik egymást.' },
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

/** A random shape with integer vertices inside the box [1, 4] × [1, 3]. */
function randomShape(rng: Rng, shape: 'triangle' | 'square' | 'rectangle' | 'quad'): XY[] {
  for (;;) {
    if (shape === 'square') {
      const a = rng.int(1, 2);
      const [x, y] = [rng.int(1, 4 - a), rng.int(1, 3 - a)];
      return [at(x, y), at(x + a, y), at(x + a, y + a), at(x, y + a)];
    }
    if (shape === 'rectangle') {
      const [a, b] = rng.pick([
        [3, 1],
        [3, 2],
        [2, 1],
        [1, 2],
      ]);
      const [x, y] = [rng.int(1, 4 - a), rng.int(1, 3 - b)];
      return [at(x, y), at(x + a, y), at(x + a, y + b), at(x, y + b)];
    }
    const n = shape === 'triangle' ? 3 : 4;
    const pts: XY[] = [];
    for (let i = 0; i < n; i++) pts.push(at(rng.int(1, 4), rng.int(1, 3)));
    // twice the signed area: the shape must not be flat, and a quadrilateral must be convex
    const area2 = pts.reduce((sum, q, i) => sum + q[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * q[1], 0);
    if (Math.abs(area2) < 4) continue;
    if (n === 4) {
      const crosses = pts.map((q, i) => {
        const r = pts[(i + 1) % n];
        const t = pts[(i + 2) % n];
        return (r[0] - q[0]) * (t[1] - r[1]) - (r[1] - q[1]) * (t[0] - r[0]);
      });
      if (!crosses.every((c) => c > 0) && !crosses.every((c) => c < 0)) continue;
    }
    // not mirror-symmetric about a vertical or horizontal line, so the wrong copies really differ
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const mirrorX = pts.map((q): XY => [Math.min(...xs) + Math.max(...xs) - q[0], q[1]]);
    const mirrorY = pts.map((q): XY => [q[0], Math.min(...ys) + Math.max(...ys) - q[1]]);
    const sameSet = (u: XY[]) => u.every((q) => pts.some((r) => same(q, r)));
    if (sameSet(mirrorX) || sameSet(mirrorY)) continue;
    return pts;
  }
}

/** Which coloured copy is the image of the shape? (triangle → square or rectangle → quadrilateral) */
const imageMc: GeneratorDef = {
  id: 'image-mc',
  title: 'Melyik alakzat a képe?',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const shape = level === 1 ? 'triangle' : level === 2 ? rng.pick(['square', 'rectangle'] as const) : 'quad';
    const o: XY = at(5, 4);
    // the original sits in one quarter of the grid; turning the whole picture moves it
    const base = randomShape(rng, shape);
    const flipX = rng.chance(0.5);
    const flipY = rng.chance(0.5);
    const place = (q: XY): XY => [flipX ? 10 - q[0] : q[0], flipY ? 8 - q[1] : q[1]];
    const original = base.map(place);
    const image = original.map((q): XY => [2 * o[0] - q[0], 2 * o[1] - q[1]]);
    const translated = original.map((q): XY => [q[0], flipY ? q[1] - 4 : q[1] + 4]);
    const axial = original.map((q): XY => [10 - q[0], q[1]]);
    const vertexLabels = shape === 'triangle' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    const name = shape === 'triangle' ? 'háromszög' : shape === 'square' ? 'négyzet' : shape === 'rectangle' ? 'téglalap' : 'négyszög';
    const label = shape === 'triangle' ? 'ABC' : 'ABCD';
    const [correctColor, wrong1Color, wrong2Color] = rng.shuffle(['narancssárga', 'zöld', 'lila']);
    return {
      prompt: tex`Melyik színű ${name} ${article(label)} $${label}$ ${name} képe az $O$ pontra tükrözve?`,
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
      hint: 'A képet úgy kapod, hogy minden csúcsot tükrözöl az $O$ pontra: a csúcs az $O$ túloldalára kerül, ugyanolyan messzire.',
      solution: [
        tex`A középpontos tükrözésnél minden csúcs az $O$-val ellentétes oldalra kerül, ugyanolyan messzire.`,
        `A ${wrong1Color} alakzat csak el van tolva, a ${wrong2Color} tengelyesen tükrözött; egyik sem a középpontos kép.`,
        `A helyes kép a **${correctColor}** alakzat.`,
      ],
    };
  },
};

/** The link to the parallelogram: a vertex, a side, and finally the fourth vertex by coordinates. */
const parallelogramCentre: GeneratorDef = {
  id: 'parallelogram-centre',
  title: 'Paralelogramma és középpontos tükrözés',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const v = rng.pick([
      ['A', 'B', 'C', 'D'],
      ['K', 'L', 'M', 'N'],
      ['P', 'Q', 'R', 'S'],
      ['E', 'F', 'G', 'H'],
    ]);
    if (level <= 2) {
      const w = rng.int(50, 65) / 10;
      const sh = rng.pick([-1.2, 0.8, 1.6]);
      const h = rng.int(26, 34) / 10;
      const ox = sh < 0 ? -sh : 0;
      const pts: XY[] = [at(ox, 0), at(ox + w, 0), at(ox + w + sh, h), at(ox + sh, h)];
      const O: XY = [(pts[0][0] + pts[2][0]) / 2, h / 2];
      const figure: Figure = {
        type: 'geometry',
        points: { [v[0]]: pts[0], [v[1]]: pts[1], [v[2]]: pts[2], [v[3]]: pts[3], O },
        items: [
          { kind: 'polygon', points: v, fill: 'accent' },
          { kind: 'segment', from: v[0], to: v[2], dashed: true, color: 'muted' },
          { kind: 'segment', from: v[1], to: v[3], dashed: true, color: 'muted' },
          { kind: 'point', at: 'O', color: 'highlight', labelDir: 'e' },
        ],
      };
      if (level === 1) {
        const i = rng.int(0, 3);
        const from = v[i];
        const to = v[(i + 2) % 4];
        return {
          prompt: tex`A paralelogramma átlói az $O$ pontban metszik egymást. Melyik pont ${article(from)} $${from}$ csúcs képe az $O$-ra tükrözésnél?`,
          figure,
          answer: textChoice(`$${to}$`, [...v.filter((x) => x !== from && x !== to), 'O'].map((x) => `$${x}$`)),
          hint: 'A paralelogramma átlói felezik egymást.',
          solution: [tex`${Article(from + to)} $${from}${to}$ átló felezőpontja $O$.`, tex`Ezért ${article(from)} $${from}$ csúcs képe ${article(to)} **$${to}$** csúcs.`],
        };
      }
      // level 2: the image of a side
      const i = rng.int(0, 3);
      const side = v[i] + v[(i + 1) % 4];
      const image = v[(i + 2) % 4] + v[(i + 3) % 4];
      const others = [v[(i + 1) % 4] + v[(i + 2) % 4], v[(i + 3) % 4] + v[i], side];
      return {
        prompt: tex`A paralelogrammát az átlói $O$ metszéspontjára tükrözzük. Melyik szakasz ${article(side)} $${side}$ oldal képe?`,
        figure,
        answer: textChoice(`$${image}$`, others.map((x) => `$${x}$`)),
        hint: 'Tükrözd külön a két végpontot: mindegyik a vele szemközti csúcsba kerül.',
        solution: [
          tex`${Article(v[i])} $${v[i]}$ képe $${v[(i + 2) % 4]}$, ${article(v[(i + 1) % 4])} $${v[(i + 1) % 4]}$ képe $${v[(i + 3) % 4]}$.`,
          tex`Ezért ${article(side)} $${side}$ oldal képe ${article(image)} **$${image}$** oldal — a szemközti oldal.`,
        ],
      };
    }
    // level 3: three vertices on the grid, find the fourth with the centre
    let A: XY;
    let B: XY;
    let C: XY;
    let D: XY;
    do {
      A = [rng.int(1, 4), rng.int(1, 3)];
      B = [A[0] + rng.int(3, 5), A[1] + rng.int(-1, 1)];
      C = [B[0] + rng.int(-1, 2), B[1] + rng.int(2, 4)];
      D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
    } while (![A, B, C, D].every(inGrid) || (A[0] + C[0]) % 2 !== 0 || (A[1] + C[1]) % 2 !== 0);
    const O: XY = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
    return {
      prompt: tex`${Article(v.join(''))} $${v.join('')}$ paralelogramma három csúcsa $${v[0]}${coords(A)}$, $${v[1]}${coords(B)}$ és $${v[2]}${coords(C)}$. Add meg ${article(v[3])} $${v[3]}$ csúcs koordinátáit!`,
      figure: {
        type: 'coordinate',
        x: [0, GRID.w],
        y: [0, GRID.h],
        grid: true,
        points: [
          { at: A, label: v[0], showCoords: true },
          { at: B, label: v[1], showCoords: true },
          { at: C, label: v[2], showCoords: true },
        ],
        segments: [
          { from: A, to: B },
          { from: B, to: C },
          { from: A, to: C, dashed: true, color: 'muted' },
        ],
      },
      answer: { type: 'numbers', fields: [{ label: '$x =$', value: D[0] }, { label: '$y =$', value: D[1] }] },
      hint: tex`A paralelogramma középpontosan tükrös az átlói metszéspontjára. Előbb keresd meg ${article(v[0] + v[2])} $${v[0]}${v[2]}$ átló felezőpontját!`,
      solution: [
        tex`${Article(v[0] + v[2])} $${v[0]}${v[2]}$ átló felezőpontja $O${coords(O)}$.`,
        tex`${Article(v[3])} $${v[3]}$ csúcs ${article(v[1])} $${v[1]}$ képe $O$-ra: ${article(v[1])} $${v[1]}$-ből $O$-ba ${stepText(O[0] - B[0], O[1] - B[1])}, és ugyanennyit tovább.`,
        tex`${Article(v[3])} $${v[3]}$ koordinátái: **$x = ${num(D[0])}$, $y = ${num(D[1])}$**.`,
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
          body: 'A $P$ pont képe $P′$ úgy, hogy a tükrözés középpontja, $O$ a $PP′$ szakasz felezőpontja. A $P$ és $P′$ az $O$ két oldalán van.',
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
            solution: ['A $P$ és $P′$ az $O$-tól ugyanolyan távolságra van, ezért $O$ a felezőpont.', 'Az állítás **igaz**.'],
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
