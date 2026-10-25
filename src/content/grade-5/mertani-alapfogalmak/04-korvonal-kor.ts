/**
 * 5. osztály › Mértani alapfogalmak › 4. Körvonal és kör
 *
 * Geometry lesson: circle line vs. disc, centre O, radius r, diameter d = 2r, chord, arc,
 * tangent, secant; the position of a point, a line and two circles relative to a circle.
 * Figures and answers follow the generated numbers.
 */
import {
  defineSubtopic,
  num,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type Rng,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: circles, points, figures
// ---------------------------------------------------------------------------------------------

const at = (x: number, y: number): XY => [x, y];
/** "6 cm" → "$6$ cm": the number in math, the unit as text. */
const ml = (len: string): string => len.replace(/^(.*) (\S+)$/, '$$$1$$ $2');
const deg = (d: number): XY => [3 * Math.cos((d * Math.PI) / 180), 3 * Math.sin((d * Math.PI) / 180)];

/** A circle of radius r around O with one point P and the dashed OP distance. */
function pointFigure(r: number, d: number, distLabel: string): Figure {
  return {
    type: 'geometry',
    points: { O: at(0, 0), P: at(d, 0) },
    items: [
      { kind: 'circle', center: 'O', radius: r, color: 'accent' },
      { kind: 'segment', from: 'O', to: 'P', dashed: true, color: 'muted' },
      { kind: 'point', at: 'O', labelDir: 'sw' },
      { kind: 'point', at: 'P', labelDir: 'e' },
      { kind: 'label', at: at(d / 2, -0.45), text: distLabel, size: 'small' },
    ],
  };
}

/** A circle of radius r around O and a horizontal line at distance h from O. */
function lineFigure(r: number, h: number, distLabel: string): Figure {
  const half = Math.max(r, h) + 1.6;
  return {
    type: 'geometry',
    points: { O: at(0, 0), E1: at(-half, h), E2: at(half, h), T: at(0, h) },
    items: [
      { kind: 'circle', center: 'O', radius: r, color: 'accent' },
      { kind: 'line', through: ['E1', 'E2'], label: 'e' },
      { kind: 'segment', from: 'O', to: 'T', dashed: true, color: 'muted' },
      { kind: 'point', at: 'O', labelDir: 'sw' },
      { kind: 'point', at: 'T', label: false },
      { kind: 'label', at: at(-0.5, h / 2), text: distLabel, size: 'small' },
    ],
  };
}

// --- static figures --------------------------------------------------------------------------

const discFigure: Figure = {
  type: 'geometry',
  points: { O: at(0, 0), A: at(3, 0) },
  items: [
    { kind: 'circle', center: 'O', radius: 3, fill: 'accent' },
    { kind: 'segment', from: 'O', to: 'A', label: 'r', color: 'ink' },
    { kind: 'point', at: 'O', labelDir: 'sw' },
    { kind: 'point', at: 'A', labelDir: 'e' },
    { kind: 'label', at: at(-1.4, 1.4), text: 'kör', size: 'large', color: 'muted' },
  ],
};

const pointPositionsFigure: Figure = {
  type: 'geometry',
  points: { O: at(0, 0), A: at(-1.5, 0), B: at(0, 3), C: at(4.5, 0) },
  items: [
    { kind: 'circle', center: 'O', radius: 3, color: 'accent' },
    { kind: 'point', at: 'O', labelDir: 's' },
    { kind: 'point', at: 'A', labelDir: 'n' },
    { kind: 'point', at: 'B', labelDir: 'n' },
    { kind: 'point', at: 'C', labelDir: 'n' },
    { kind: 'segment', from: 'O', to: 'A', dashed: true, color: 'muted' },
    { kind: 'segment', from: 'O', to: 'B', dashed: true, color: 'muted' },
    { kind: 'segment', from: 'O', to: 'C', dashed: true, color: 'muted' },
  ],
  caption: 'A belül, B a körvonalon, C kívül van.',
};

const twoCirclesFigure: Figure = {
  type: 'geometry',
  points: {},
  items: [
    { kind: 'circle', center: at(-7, 0), radius: 1.5, color: 'blue' },
    { kind: 'circle', center: at(-3.5, 0), radius: 1.5, color: 'orange' },
    { kind: 'label', at: at(-5.25, -2.2), text: '0', size: 'large' },
    { kind: 'circle', center: at(1, 0), radius: 1.5, color: 'blue' },
    { kind: 'circle', center: at(4, 0), radius: 1.5, color: 'orange' },
    { kind: 'label', at: at(2.5, -2.2), text: '1', size: 'large' },
    { kind: 'circle', center: at(7.5, 0), radius: 1.5, color: 'blue' },
    { kind: 'circle', center: at(9.5, 0), radius: 1.5, color: 'orange' },
    { kind: 'label', at: at(8.5, -2.2), text: '2', size: 'large' },
  ],
  caption: 'Két kör közös pontjainak száma.',
};

const chordArcFigure: Figure = {
  type: 'geometry',
  points: { O: at(0, 0), A: deg(30), B: deg(150) },
  items: [
    { kind: 'circle', center: 'O', radius: 3 },
    { kind: 'segment', from: 'A', to: 'B', label: 'húr', color: 'blue' },
    { kind: 'arc', center: 'O', radius: 3.08, from: 200, to: 260, color: 'orange', label: 'ív' },
    { kind: 'point', at: 'A', labelDir: 'e' },
    { kind: 'point', at: 'B', labelDir: 'w' },
    { kind: 'point', at: 'O', labelDir: 's' },
  ],
};

const tangentSecantFigure: Figure = {
  type: 'geometry',
  points: { O: at(0, 0), E1: at(-4.6, 3), E2: at(4.6, 3), F1: at(-4.6, 1.2), F2: at(4.6, 1.2) },
  items: [
    { kind: 'circle', center: 'O', radius: 3, color: 'accent' },
    { kind: 'line', through: ['E1', 'E2'], label: 'érintő', color: 'blue' },
    { kind: 'line', through: ['F1', 'F2'], label: 'szelő', color: 'orange' },
    { kind: 'point', at: 'O', labelDir: 'sw' },
  ],
};

const radiusDiameterFigure: Figure = {
  type: 'circle',
  r: 3,
  radius: 'r = 3 cm',
  diameter: 'd = 6 cm',
};

/** The highlighted element for the naming exercise. */
/** The element figure turned around O by `rot` degrees (point labels are re-placed automatically). */
function rotatedElementFigure(kind: Parameters<typeof elementFigure>[0], rot: number): ReturnType<typeof elementFigure> {
  const base = elementFigure(kind);
  if (base.figure.type !== 'geometry' || rot === 0) return base;
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const turn = ([x, y]: XY): XY => [x * c - y * sn, x * sn + y * c];
  const points = Object.fromEntries(Object.entries(base.figure.points ?? {}).map(([k, v]) => [k, turn(v as XY)]));
  const items = base.figure.items.map((it) => {
    if (it.kind === 'arc') return { ...it, from: (it.from as number) + rot, to: (it.to as number) + rot };
    if (it.kind === 'point' && it.at !== 'O') {
      const { labelDir: _drop, ...rest } = it;
      return rest;
    }
    return it;
  });
  return { ...base, figure: { ...base.figure, points, items } as Figure };
}

function elementFigure(kind: 'radius' | 'diameter' | 'chord' | 'tangent' | 'secant' | 'arc' | 'centre'): {
  figure: Figure;
  correct: string;
  wrongs: string[];
} {
  const circle: GeoItem = { kind: 'circle', center: 'O', radius: 3, color: 'ink' };
  if (kind === 'radius') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: at(3, 0) },
        items: [circle, { kind: 'segment', from: 'O', to: 'A', color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 'sw' }, { kind: 'point', at: 'A', labelDir: 'e' }],
      },
      correct: 'sugár',
      wrongs: ['átmérő', 'húr', 'szelő'],
    };
  }
  if (kind === 'diameter') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: at(-3, 0), B: at(3, 0) },
        items: [circle, { kind: 'segment', from: 'A', to: 'B', color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 'n' }, { kind: 'point', at: 'A', labelDir: 'w' }, { kind: 'point', at: 'B', labelDir: 'e' }],
      },
      correct: 'átmérő',
      wrongs: ['sugár', 'szelő', 'érintő'],
    };
  }
  if (kind === 'chord') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: deg(20), B: deg(140) },
        items: [circle, { kind: 'segment', from: 'A', to: 'B', color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 's' }, { kind: 'point', at: 'A', labelDir: 'e' }, { kind: 'point', at: 'B', labelDir: 'w' }],
      },
      correct: 'húr',
      wrongs: ['átmérő', 'sugár', 'szelő'],
    };
  }
  if (kind === 'tangent') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: at(-4.6, 3), B: at(4.6, 3), T: at(0, 3) },
        items: [circle, { kind: 'line', through: ['A', 'B'], color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 's' }, { kind: 'point', at: 'T', labelDir: 'n' }],
      },
      correct: 'érintő',
      wrongs: ['szelő', 'húr', 'sugár'],
    };
  }
  if (kind === 'secant') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: at(-4.6, 1.2), B: at(4.6, 1.2) },
        items: [circle, { kind: 'line', through: ['A', 'B'], color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 's' }],
      },
      correct: 'szelő',
      wrongs: ['érintő', 'húr', 'sugár'],
    };
  }
  if (kind === 'arc') {
    return {
      figure: {
        type: 'geometry',
        points: { O: at(0, 0), A: deg(20), B: deg(120) },
        items: [circle, { kind: 'arc', center: 'O', radius: 3.08, from: 20, to: 120, color: 'highlight' }, { kind: 'point', at: 'O', labelDir: 's' }, { kind: 'point', at: 'A', labelDir: 'e' }, { kind: 'point', at: 'B', labelDir: 'n' }],
      },
      correct: 'ív',
      wrongs: ['húr', 'körvonal', 'sugár'],
    };
  }
  return {
    figure: {
      type: 'geometry',
      points: { O: at(0, 0) },
      items: [circle, { kind: 'point', at: 'O', color: 'highlight', labelDir: 's' }],
    },
    correct: 'középpont',
    wrongs: ['körvonal', 'sugár', 'átmérő'],
  };
}

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** d = 2r or r = d : 2, including multi-unit lengths. */
const diameterRadius: GeneratorDef = {
  id: 'diameter-radius',
  title: 'Sugár és átmérő',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level <= 2) {
      const unit = level === 1 ? 'cm' : rng.pick(['cm', 'dm', 'mm']);
      // level 1: 2–9 cm; level 2: two-digit radii or other units
      const r = level === 1 ? rng.int(2, 9) : unit === 'dm' ? rng.int(2, 9) : unit === 'mm' ? rng.int(10, 45) : rng.int(10, 25);
      const askDiameter = rng.chance(0.5);
      if (askDiameter) {
        const d = 2 * r;
        return {
          prompt: tex`Egy kör sugara $${num(r)}$ ${unit}. Milyen hosszú az átmérője?`,
          figure: { type: 'circle', r, radius: `r = ${num(r)} ${unit}` },
          answer: { type: 'number', value: d, unit },
          inputLabel: '$d =$',
          hint: 'Az átmérő a sugár kétszerese: $d = 2r$.',
          solution: [
            tex`A sugár $r = ${num(r)}$ ${unit}.`,
            tex`$d = 2 \cdot r = 2 \cdot ${num(r)} = ${num(d)}$ ${unit}.`,
            tex`Az átmérő **${num(d)} ${unit}**.`,
          ],
        };
      }
      const d = 2 * r;
      return {
        prompt: tex`Egy kör átmérője $${num(d)}$ ${unit}. Milyen hosszú a sugara?`,
        figure: { type: 'circle', r, diameter: `d = ${num(d)} ${unit}` },
        answer: { type: 'number', value: r, unit },
        inputLabel: '$r =$',
        hint: 'A sugár az átmérő fele: $r = d : 2$.',
        solution: [
          tex`Az átmérő $d = ${num(d)}$ ${unit}.`,
          tex`$r = d : 2 = ${num(d)} : 2 = ${num(r)}$ ${unit}.`,
          tex`A sugár **${num(r)} ${unit}**.`,
        ],
      };
    }
    // level 3: multi-unit length
    const askDiameter = rng.chance(0.5);
    if (askDiameter) {
      const dm = rng.int(1, 2);
      const cm = rng.int(1, 9);
      const rCm = dm * 10 + cm;
      const dCm = 2 * rCm;
      return {
        prompt: tex`Egy kör sugara $${num(dm)}$ dm $${num(cm)}$ cm. Milyen hosszú az átmérője centiméterben?`,
        figure: { type: 'circle', r: rCm, radius: `r = ${num(dm)} dm ${num(cm)} cm` },
        answer: { type: 'number', value: dCm, unit: 'cm' },
        inputLabel: '$d =$',
        hint: 'Először váltsd át a sugarat centiméterbe, aztán duplázd meg!',
        solution: [
          tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $${num(cm)}$ cm $= ${num(rCm)}$ cm.`,
          tex`$d = 2 \cdot ${num(rCm)} = ${num(dCm)}$ cm.`,
          tex`Az átmérő **${num(dCm)} cm**.`,
        ],
      };
    }
    const dm = rng.int(1, 2);
    const cm = rng.int(1, 4) * 2;
    const dCm = dm * 10 + cm;
    const rCm = dCm / 2;
    return {
      prompt: tex`Egy kör átmérője $${num(dm)}$ dm $${num(cm)}$ cm. Milyen hosszú a sugara centiméterben?`,
      figure: { type: 'circle', r: rCm, diameter: `d = ${num(dm)} dm ${num(cm)} cm` },
      answer: { type: 'number', value: rCm, unit: 'cm' },
      inputLabel: '$r =$',
      hint: 'Először váltsd át az átmérőt centiméterbe, aztán felezd meg!',
      solution: [
        tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $${num(cm)}$ cm $= ${num(dCm)}$ cm.`,
        tex`$r = ${num(dCm)} : 2 = ${num(rCm)}$ cm.`,
        tex`A sugár **${num(rCm)} cm**.`,
      ],
    };
  },
};

/**
 * Radius and distance for the position questions, in the unit they are compared in.
 * Level 1: both in cm. Level 2: one in mm, the other in cm. Level 3: "4 cm 5 mm" against mm.
 */
function radiusAndDistance(
  rng: Rng,
  level: number,
  places: readonly ['in' | 'out', 'on', 'in' | 'out'] | readonly string[],
  distanceInMm: boolean,
): { r: number; d: number; unit: 'cm' | 'mm'; rLabel: string; dLabel: string; convert?: string; rCm: number; dCm: number } {
  const place = rng.pick(places as readonly string[]);
  if (level === 3) {
    let r = 0;
    do r = rng.int(21, 69);
    while (r % 10 === 0);
    const d = place === 'on' ? r : place === 'in' ? r - rng.int(1, 9) : r + rng.int(1, 9);
    const rLabel = `${num(Math.floor(r / 10))} cm ${num(r % 10)} mm`;
    return {
      r,
      d,
      unit: 'mm',
      rLabel,
      dLabel: `${num(d)} mm`,
      convert: tex`$${num(Math.floor(r / 10))}$ cm $${num(r % 10)}$ mm $= ${num(r)}$ mm.`,
      rCm: r / 10,
      dCm: d / 10,
    };
  }
  const r = level === 1 ? rng.int(3, 8) : rng.int(3, 9);
  const d = place === 'on' ? r : place === 'in' ? rng.int(1, r - 1) : r + rng.int(1, 4);
  if (level === 1) return { r, d, unit: 'cm', rLabel: `${num(r)} cm`, dLabel: `${num(d)} cm`, rCm: r, dCm: d };
  return distanceInMm
    ? { r, d, unit: 'cm', rLabel: `${num(r)} cm`, dLabel: `${num(d * 10)} mm`, convert: tex`$${num(d * 10)}$ mm $= ${num(d)}$ cm.`, rCm: r, dCm: d }
    : { r, d, unit: 'cm', rLabel: `${num(r * 10)} mm`, dLabel: `${num(d)} cm`, convert: tex`$${num(r * 10)}$ mm $= ${num(r)}$ cm.`, rCm: r, dCm: d };
}

/** Position of a point relative to a circle: inside, on the circle line, outside. */
const pointPosition: GeneratorDef = {
  id: 'point-position',
  title: 'Pont helyzete a körhöz képest',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const v = radiusAndDistance(rng, level, ['in', 'on', 'out'], true);
    const relation = v.d < v.r ? 'in' : v.d > v.r ? 'out' : 'on';
    const correct = relation === 'in' ? 'A körön belül van' : relation === 'out' ? 'A körön kívül van' : 'A körvonalon van';
    const wrongs = ['A körön belül van', 'A körvonalon van', 'A körön kívül van'].filter((x) => x !== correct);
    return {
      prompt: tex`A kör sugara ${ml(v.rLabel)}. A $P$ pont ${ml(v.dLabel)}-re van a középponttól. Hol van a $P$ pont?`,
      figure: pointFigure(v.rCm, v.dCm, v.dLabel),
      answer: textChoice(correct, wrongs),
      hint: 'Hasonlítsd össze a pont középponttól mért távolságát a sugárral! Előbb hozd őket azonos mértékegységre.',
      solution: [
        tex`A sugár ${ml(`r = ${v.rLabel}`)}, a $P$ pont távolsága ${ml(v.dLabel)}.`,
        ...(v.convert ? [v.convert] : []),
        relation === 'in'
          ? tex`$${num(v.d)} < ${num(v.r)}$, ezért a pont közelebb van, mint a körvonal: **a körön belül van**.`
          : relation === 'out'
            ? tex`$${num(v.d)} > ${num(v.r)}$, ezért a pont messzebb van, mint a körvonal: **a körön kívül van**.`
            : tex`$${num(v.d)} = ${num(v.r)}$, ezért a pont **a körvonalon van**.`,
      ],
    };
  },
};

/** Position of a line relative to a circle: 0, 1 or 2 common points. */
const linePosition: GeneratorDef = {
  id: 'line-position',
  title: 'Egyenes és kör közös pontjai',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const v = radiusAndDistance(rng, level, ['in', 'on', 'out'], false);
    const common = v.d < v.r ? 2 : v.d === v.r ? 1 : 0;
    return {
      prompt: tex`A kör sugara ${ml(v.rLabel)}. Egy egyenes ${ml(v.dLabel)}-re van a középponttól. Hány közös pontja van a körvonallal?`,
      figure: lineFigure(v.rCm, v.dCm, v.dLabel),
      answer: { type: 'number', value: common },
      inputLabel: 'közös pont =',
      hint: 'Hasonlítsd össze az egyenes távolságát a sugárral! Előbb hozd őket azonos mértékegységre.',
      solution: [
        tex`A sugár ${ml(`r = ${v.rLabel}`)}, az egyenes távolsága ${ml(v.dLabel)}.`,
        ...(v.convert ? [v.convert] : []),
        common === 0
          ? tex`$${num(v.d)} > ${num(v.r)}$, ezért az egyenes nem éri el a körvonalat: **0 közös pont**.`
          : common === 1
            ? tex`$${num(v.d)} = ${num(v.r)}$, ezért az egyenes **1 pontban érinti** a körvonalat.`
            : tex`$${num(v.d)} < ${num(v.r)}$, ezért az egyenes **2 pontban metszi** a körvonalat.`,
      ],
    };
  },
};

/** Name the highlighted circle element. */
const elementName: GeneratorDef = {
  id: 'element-name',
  title: 'A kör elemeinek neve',
  levels: [1, 2],
  generate(rng, level): Question {
    // level 1: the parts through the centre; level 2: chord, arc, tangent and secant
    const kinds = level === 1 ? (['radius', 'diameter', 'centre'] as const) : (['chord', 'tangent', 'secant', 'arc'] as const);
    const kind = rng.pick(kinds);
    const { figure, correct, wrongs } = rotatedElementFigure(kind, rng.pick([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]));
    return {
      prompt: 'Mi a kiemelt elem neve?',
      figure,
      answer: textChoice(correct, wrongs),
      hint: 'Nézd meg, hogyan helyezkedik el a kiemelt elem a körvonalhoz képest!',
      solution: [
        kind === 'radius'
          ? 'A sugár a középpontot köti össze a körvonal egy pontjával.'
          : kind === 'diameter'
            ? 'Az átmérő a középponton átmenő húr.'
            : kind === 'chord'
              ? 'A húr a körvonal két pontját köti össze.'
              : kind === 'tangent'
                ? 'Az érintő egy pontban érinti a körvonalat.'
                : kind === 'secant'
                  ? 'A szelő két pontban metszi a körvonalat.'
                  : kind === 'arc'
                    ? 'Az ív a körvonal egy darabja.'
                    : 'A középpont a kör minden pontjától ugyanolyan távolságra van.',
        `A kiemelt elem neve: **${correct}**.`,
      ],
    };
  },
};

/** True/false statements about the circle line, the disc and its parts. */
type Statement = { text: string; value: boolean; why: string };

const circleTf: GeneratorDef = {
  id: 'circle-tf',
  title: 'Igaz-hamis állítások a körről',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: 'A körvonal pontjai egyenlő távolságra vannak a középponttól.', value: true, why: 'Ez a körvonal definíciója.' },
            { text: 'A kör belseje is a körvonalhoz tartozik.', value: false, why: 'A körvonal csak a határvonal; a belsejével együtt a kör (korong).' },
            { text: 'A sugár a középpontot és a körvonal egy pontját köti össze.', value: true, why: 'Ez a sugár.' },
            { text: 'Az átmérő kétszer olyan hosszú, mint a sugár.', value: true, why: '$d = 2r$.' },
            { text: 'A körvonal egyenes.', value: false, why: 'A körvonal görbe vonal.' },
            { text: 'A körnek van középpontja.', value: true, why: 'A kör középpontját O-val jelöljük.' },
            { text: 'A körvonalnak van végpontja.', value: false, why: 'A körvonal zárt görbe, nincs végpontja.' },
            { text: 'A körvonal zárt görbe.', value: true, why: 'Körbe járja a középpontot.' },
            { text: 'A kör középpontja a körvonalon van.', value: false, why: 'A középpont a kör belsejében van.' },
            { text: 'A körvonal és a kör ugyanaz.', value: false, why: 'A kör a körvonalból és a belsejéből áll.' },
          ]
        : level === 2
          ? [
              { text: 'Minden sugár ugyanolyan hosszú.', value: true, why: 'A körvonal minden pontja ugyanolyan távolságra van a középponttól.' },
              { text: 'Az átmérő a leghosszabb húr.', value: true, why: 'A középponton átmenő húr a leghosszabb.' },
              { text: 'A húr két végpontja a körvonalon van.', value: true, why: 'A húr végpontjai a körvonalon vannak.' },
              { text: 'Az érintőnek egy közös pontja van a körvonallal.', value: true, why: 'Az érintő egy pontban érint.' },
              { text: 'A szelőnek két közös pontja van a körvonallal.', value: true, why: 'A szelő két pontban metszi a körvonalat.' },
              { text: 'Egy körnek végtelen sok sugara van.', value: true, why: 'A körvonal minden pontjához húzható egy sugár.' },
              { text: 'Két húr mindig egyenlő hosszú.', value: false, why: 'A húrok hossza különböző lehet; a leghosszabb az átmérő.' },
              { text: 'A sugár az átmérő kétszerese.', value: false, why: 'Fordítva: az átmérő a sugár kétszerese.' },
              { text: 'Minden húr átmérő.', value: false, why: 'Csak a középponton átmenő húr átmérő.' },
              { text: 'Az átmérő nem húr.', value: false, why: 'Az átmérő is húr, csak éppen a középponton megy át.' },
            ]
          : [
              { text: 'Ha egy pont távolsága a középponttól kisebb, mint a sugár, akkor a pont a körön belül van.', value: true, why: 'A körvonalnál közelebb van, tehát a belsejében.' },
              { text: 'Ha egy pont távolsága a középponttól nagyobb, mint a sugár, akkor a pont a körvonalon van.', value: false, why: 'Akkor a pont a körön kívül van.' },
              { text: 'Ha egy egyenes távolsága a középponttól nagyobb, mint a sugár, akkor nincs közös pontjuk.', value: true, why: 'Az egyenes nem éri el a körvonalat.' },
              { text: 'Két körnek lehet 0, 1 vagy 2 közös pontja.', value: true, why: 'Lehetnek külön, érinthetik egymást, vagy metszhetik egymást.' },
              { text: 'Két körnek lehet 3 közös pontja.', value: false, why: 'Két körnek legfeljebb 2 közös pontja lehet.' },
              { text: 'Ha egy pont távolsága a középponttól egyenlő a sugárral, akkor a pont a körvonalon van.', value: true, why: 'A körvonal pontjai éppen sugárnyi távolságra vannak a középponttól.' },
              { text: 'Ha egy egyenesnek egy közös pontja van a körvonallal, akkor az az egyenes érintő.', value: true, why: 'Az egy közös pontú egyenes az érintő.' },
              { text: 'Ha egy egyenesnek két közös pontja van a körvonallal, akkor az az egyenes szelő.', value: true, why: 'A két közös pontú egyenes a szelő.' },
              { text: 'A körvonal minden pontja ugyanolyan távolságra van a középponttól.', value: true, why: 'Ez a körvonal alaptulajdonsága.' },
              { text: 'Egy körnek és egy egyenesnek lehet 3 közös pontja.', value: false, why: 'Legfeljebb 2 közös pont lehetséges.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át a körvonal, a sugár, az átmérő és a húr kapcsolatát!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-04',
  goals: [
    'megkülönböztetni a körvonalat és a kört,',
    'használni a sugarat, az átmérőt, a húrt, az ívet, az érintőt és a szelőt,',
    'eldönteni, hol van egy pont vagy egy egyenes a körhöz képest,',
    'kiszámítani az átmérőt a sugárból és a sugarat az átmérőből.',
  ],
  parts: [
    {
      title: 'Körvonal és kör',
      steps: [
        {
          type: 'theory',
          title: 'A körvonal és a kör',
          body: 'A **körvonal** a kör határa; a **kör** a körvonal és a belseje. A középponttól a körvonalig minden szakasz ugyanolyan hosszú: ez a **sugár**.',
          figure: discFigure,
          remember: 'A körvonal pontjai $r$ távolságra vannak $O$-tól.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A körvonal pontjai egyenlő távolságra vannak a középponttól.',
            figure: discFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Ez a körvonal legfontosabb tulajdonsága.',
            solution: ['A körvonal minden pontja ugyanolyan távolságra van a középponttól.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Hol van a pont?',
          problem: 'A kör sugara $4$ cm. A $P$ pont $3$ cm-re van a középponttól. Hol van a $P$ pont?',
          figure: pointFigure(4, 3, '3 cm'),
          steps: [
            { text: 'A sugár $r = 4$ cm, a pont távolsága $3$ cm.' },
            { text: '$3 < 4$, tehát a pont közelebb van, mint a körvonal.' },
          ],
          answer: 'A $P$ pont **a körön belül** van.',
        },
        { type: 'practice', generator: 'point-position', level: 1 },
        { type: 'practice', generator: 'circle-tf', level: 1 },
      ],
    },
    {
      title: 'Sugár és átmérő',
      steps: [
        {
          type: 'theory',
          title: 'Az átmérő',
          body: 'Az **átmérő** a középponton átmenő húr. Hossza kétszerese a sugárnak: $d = 2r$.',
          figure: radiusDiameterFigure,
          remember: '$d = 2r$ és $r = d : 2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Az átmérő kétszer olyan hosszú, mint a sugár.',
            answer: { type: 'truefalse', value: true },
            hint: 'Az átmérő két sugárból áll.',
            solution: ['Az átmérő két sugárból áll, ezért $d = 2r$.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Sugárból átmérő',
          problem: 'Egy kör sugara $4$ cm. Milyen hosszú az átmérője?',
          figure: { type: 'circle', r: 4, radius: 'r = 4 cm' },
          steps: [
            { text: 'Az átmérő a sugár kétszerese.' },
            { text: '$d = 2 \\cdot 4 = 8$.' },
          ],
          answer: 'Az átmérő **8 cm**.',
        },
        { type: 'practice', generator: 'diameter-radius', level: 1, count: 2 },
        { type: 'practice', generator: 'diameter-radius', level: 2 },
        { type: 'practice', generator: 'circle-tf', level: 2 },
      ],
    },
    {
      title: 'Húr, ív, érintő, szelő',
      steps: [
        {
          type: 'theory',
          title: 'Húr és ív',
          body: 'A **húr** a körvonal két pontját köti össze. Az **ív** a körvonal egy darabja.',
          figure: chordArcFigure,
        },
        {
          type: 'theory',
          title: 'Érintő és szelő',
          body: 'Az **érintő** egy pontban érinti a körvonalat. A **szelő** két pontban metszi a körvonalat.',
          figure: tangentSecantFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'Mi a kiemelt elem neve?',
            figure: elementFigure('chord').figure,
            answer: textChoice('húr', ['átmérő', 'sugár', 'szelő']),
            hint: 'A húr két pontját köti össze a körvonalnak.',
            solution: ['A kiemelt szakasz a körvonal két pontját köti össze, ezért **húr**.'],
          },
        },
        {
          type: 'example',
          title: 'Egyenes és kör',
          problem: 'A kör sugara $5$ cm. Egy egyenes $3$ cm-re van a középponttól. Hány közös pontja van a körvonallal?',
          figure: lineFigure(5, 3, '3 cm'),
          steps: [
            { text: 'A sugár $5$ cm, az egyenes távolsága $3$ cm.' },
            { text: '$3 < 5$, tehát az egyenes belemetsz a körbe.' },
          ],
          answer: 'Az egyenesnek **2 közös pontja** van a körvonallal.',
        },
        { type: 'practice', generator: 'element-name', level: 1 },
        { type: 'practice', generator: 'element-name', level: 2 },
        { type: 'practice', generator: 'line-position', level: 1 },
        { type: 'practice', generator: 'line-position', level: 2 },
      ],
    },
    {
      title: 'Pont és kör, két kör',
      steps: [
        {
          type: 'theory',
          title: 'A pont helyzete',
          body: 'Egy pont a körön belül, a körvonalon vagy kívül lehet. A helyet a középponttól mért távolság dönti el.',
          figure: pointPositionsFigure,
          remember: 'kisebb → belül · egyenlő → körvonalon · nagyobb → kívül',
        },
        {
          type: 'theory',
          title: 'Két kör',
          body: 'Két körnek 0, 1 vagy 2 közös pontja lehet: külön állnak, érintik egymást, vagy metszik egymást.',
          figure: twoCirclesFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'Két körnek lehet 3 közös pontja.',
            figure: twoCirclesFigure,
            answer: { type: 'truefalse', value: false },
            hint: 'Nézd meg az ábrán a lehetséges eseteket!',
            solution: ['Két körnek legfeljebb 2 közös pontja lehet.', 'Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'point-position', level: 2 },
        { type: 'practice', generator: 'point-position', level: 3 },
        { type: 'practice', generator: 'line-position', level: 3 },
        { type: 'practice', generator: 'circle-tf', level: 3 },
      ],
    },
  ],
  generators: [diameterRadius, pointPosition, linePosition, elementName, circleTf],
  miniTest: {
    items: [
      { generator: 'diameter-radius', level: 1 },
      { generator: 'point-position', level: 1 },
      { generator: 'element-name', level: 2 },
      { generator: 'line-position', level: 2 },
      { generator: 'circle-tf', level: 1 },
      { generator: 'diameter-radius', level: 3 },
      { generator: 'point-position', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'diameter-radius', level: 1 },
    { generator: 'point-position', level: 1 },
    { generator: 'element-name', level: 1 },
    { generator: 'line-position', level: 1 },
    { generator: 'circle-tf', level: 1 },
    { generator: 'diameter-radius', level: 2 },
    { generator: 'point-position', level: 2 },
  ],
});
