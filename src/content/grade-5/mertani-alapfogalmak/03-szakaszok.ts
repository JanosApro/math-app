/**
 * 5. osztály › Mértani alapfogalmak › 3. A szakaszok mérése. A szakaszok egyenlősége
 *
 * Geometry lesson: units of length and conversions, multi-unit lengths, the length |AB|,
 * equal and compared segments, adding and subtracting segments (also with a compass),
 * broken lines and the perimeter of a closed broken line.
 * All lengths, figures and answers are computed from the same generated numbers.
 */
import {
  article,
  defineSubtopic,
  num,
  suffix,
  tex,
  textChoice,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type XY,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: units, segments, figures
// ---------------------------------------------------------------------------------------------

type LengthUnit = 'mm' | 'cm' | 'dm' | 'm' | 'km';

interface Conversion {
  from: LengthUnit;
  to: LengthUnit;
  factor: number;
}

/** Metric conversions, all exact. */
const CONVERSIONS: Conversion[] = [
  { from: 'cm', to: 'mm', factor: 10 },
  { from: 'dm', to: 'cm', factor: 10 },
  { from: 'dm', to: 'mm', factor: 100 },
  { from: 'm', to: 'dm', factor: 10 },
  { from: 'm', to: 'cm', factor: 100 },
  { from: 'm', to: 'mm', factor: 1000 },
  { from: 'km', to: 'm', factor: 1000 },
];

const at = (x: number, y: number): XY => [x, y];

/** "A" or "Az" before a spoken number: 5 → Az, 3 → A. */
const Art = (n: number) => (article(n) === 'az' ? 'Az' : 'A');

/** Article before a segment name: AB = á-bé → az, CD = cé-dé → a, EF = e-ef → az. */
const SegArt = (name: string) => (name.startsWith('A') || name.startsWith('E') ? 'Az' : 'A');

/** A horizontal segment from x = 0 to x = length. */
function segmentFigure(segments: { length: number; label: string; y: number; dashed?: boolean }[], notToScale = false): Figure {
  const points: Record<string, XY> = {};
  const items: GeoItem[] = [];
  segments.forEach((s, i) => {
    points[`A${i}`] = at(0, s.y);
    points[`B${i}`] = at(s.length, s.y);
    items.push({ kind: 'segment', from: `A${i}`, to: `B${i}`, dashed: s.dashed, color: 'accent' });
    items.push({ kind: 'label', at: at(0.4, s.y + 0.3), text: s.label, dir: 'n', color: 'accent', size: 'small' });
  });
  return { type: 'geometry', points, items, notToScale: notToScale || undefined };
}

/** A triangle with three given sides and their labels (in cm). */
const triangleFigure = (a: number, b: number, c: number): Figure => ({
  type: 'triangle',
  sides: [a, b, c],
  sideLabels: { a: `${num(a)} cm`, b: `${num(b)} cm`, c: `${num(c)} cm` },
  fill: true,
});

/** A rectangle with labelled sides (in cm). */
const rectangleFigure = (a: number, b: number, bLabel?: string): Figure => ({
  type: 'quadrilateral',
  shape: 'rectangle',
  a,
  b,
  sideLabels: { a: `${num(a)} cm`, b: bLabel ?? `${num(b)} cm`, c: `${num(a)} cm`, d: bLabel ?? `${num(b)} cm` },
  fill: true,
});

const equalSegmentsFigure: Figure = {
  type: 'geometry',
  points: { A: at(0, 2), B: at(3.2, 2), C: at(0, 0.6), D: at(3.2, 0.6) },
  items: [
    { kind: 'segment', from: 'A', to: 'B', label: '3 cm', ticks: 1, color: 'accent' },
    { kind: 'segment', from: 'C', to: 'D', label: '3 cm', ticks: 1, color: 'accent' },
    { kind: 'point', at: 'A', labelDir: 's' },
    { kind: 'point', at: 'B', labelDir: 's' },
    { kind: 'point', at: 'C', labelDir: 's' },
    { kind: 'point', at: 'D', labelDir: 's' },
  ],
};

/** Transporting a segment with a compass: CD = AB. */
const compassTransferFigure: Figure = {
  type: 'construction',
  points: { A: at(0, 0), B: at(3.2, 0), C: at(0, 3), E: at(5, 3) },
  intersections: { D: { circle: ['C', 3.2], line: ['C', 'E'], near: 'E' } },
  given: [
    { kind: 'segment', from: 'A', to: 'B', label: 'AB', ticks: 1, color: 'accent' },
    { kind: 'ray', from: 'C', through: 'E', label: 'r' },
    { kind: 'point', at: 'C', labelDir: 'w' },
  ],
  steps: [
    {
      caption: 'A körző nyílásába vesszük az $AB$ szakasz hosszát.',
      items: [{ kind: 'compass', center: 'A', through: ['B'], extend: 20 }],
    },
    {
      caption: 'Ugyanezzel a nyílással a $C$ pont körül ívet rajzolunk.',
      items: [{ kind: 'compass', center: 'C', through: ['D'], extend: 20 }],
    },
    {
      caption: 'Az ív a félegyenest $D$-ben metszi. Így $CD = AB$.',
      items: [
        { kind: 'point', at: 'D', labelDir: 's' },
        { kind: 'segment', from: 'C', to: 'D', label: 'CD', ticks: 1, color: 'accent' },
      ],
    },
  ],
};

const multiUnitFigure: Figure = {
  type: 'geometry',
  points: { A: at(0, 1), B: at(7, 1) },
  items: [
    { kind: 'segment', from: 'A', to: 'B', label: '2 m 35 cm', color: 'accent' },
    { kind: 'point', at: 'A', labelDir: 's' },
    { kind: 'point', at: 'B', labelDir: 's' },
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Metric conversion, including multi-unit lengths. */
const unitConvert: GeneratorDef = {
  id: 'unit-convert',
  title: 'Hosszúságegységek átváltása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const c = rng.pick(CONVERSIONS.filter((x) => x.factor <= 100));
      const n = rng.int(2, 9);
      const value = n * c.factor;
      return {
        prompt: tex`Hány ${c.to} a $${num(n)}$ ${c.from}?`,
        answer: { type: 'number', value, unit: c.to },
        inputLabel: 'hossz =',
        hint: 'A nagyobb egységből kisebb egységbe váltunk: szorozni kell.',
        solution: [
          tex`$${num(1)}$ ${c.from} = $${num(c.factor)}$ ${c.to}.`,
          tex`$${num(n)} \cdot ${num(c.factor)} = ${num(value)}$.`,
          tex`${Art(n)} $${num(n)}$ ${c.from} = **${num(value)} ${c.to}**.`,
        ],
      };
    }
    if (level === 2) {
      const c = rng.pick(CONVERSIONS);
      const n = rng.int(2, c.factor >= 1000 ? 9 : 25);
      if (rng.chance(0.4)) {
        const given = n * c.factor;
        return {
          prompt: tex`Hány ${c.from} a $${num(given)}$ ${c.to}?`,
          answer: { type: 'number', value: n, unit: c.from },
          inputLabel: 'hossz =',
          hint: 'A kisebb egységből nagyobb egységbe váltunk: osztani kell.',
          solution: [
            tex`$${num(c.factor)}$ ${c.to} = $${num(1)}$ ${c.from}.`,
            tex`$${num(given)} : ${num(c.factor)} = ${num(n)}$.`,
            tex`${Art(given)} $${num(given)}$ ${c.to} = **${num(n)} ${c.from}**.`,
          ],
        };
      }
      const value = n * c.factor;
      return {
        prompt: tex`Hány ${c.to} a $${num(n)}$ ${c.from}?`,
        answer: { type: 'number', value, unit: c.to },
        inputLabel: 'hossz =',
        hint: 'A nagyobb egységből kisebb egységbe váltunk: szorozni kell.',
        solution: [
          tex`$${num(1)}$ ${c.from} = $${num(c.factor)}$ ${c.to}.`,
          tex`$${num(n)} \cdot ${num(c.factor)} = ${num(value)}$.`,
          tex`${Art(n)} $${num(n)}$ ${c.from} = **${num(value)} ${c.to}**.`,
        ],
      };
    }

    // level 3: multi-unit lengths
    const kind = rng.pick(['cm', 'mm', 'm'] as const);
    const metres = rng.int(1, 9);
    const cm = kind === 'm' ? rng.int(1, 9) * 10 : rng.int(1, 19) * 5;
    if (kind === 'cm') {
      const value = metres * 100 + cm;
      return {
        prompt: tex`Hány cm a $${num(metres)}$ m $${num(cm)}$ cm?`,
        answer: { type: 'number', value, unit: 'cm' },
        inputLabel: 'hossz =',
        hint: 'Váltsd át a métereket centiméterekbe, aztán add hozzá a centimétereket!',
        solution: [
          metres === 1
            ? tex`$1$ m $= 100$ cm.`
            : tex`$1$ m $= 100$ cm, ezért $${num(metres)}$ m $= ${num(metres * 100)}$ cm.`,
          tex`A $${num(metres * 100)}$-${suffix(metres * 100, 'hoz', 'hez')} add hozzá a $${num(cm)}$ cm-t: $${num(value)}$ cm.`,
          tex`A hossz **${num(value)} cm**.`,
        ],
      };
    }
    if (kind === 'mm') {
      const value = metres * 1000 + cm * 10;
      return {
        prompt: tex`Hány mm a $${num(metres)}$ m $${num(cm)}$ cm?`,
        answer: { type: 'number', value, unit: 'mm' },
        inputLabel: 'hossz =',
        hint: 'A métert és a centimétert is váltsd milliméterbe!',
        solution: [
          metres === 1
            ? tex`$1$ m $= 1000$ mm.`
            : tex`$1$ m $= 1000$ mm, ezért $${num(metres)}$ m $= ${num(metres * 1000)}$ mm.`,
          tex`$1$ cm $= 10$ mm, ezért $${num(cm)}$ cm $= ${num(cm * 10)}$ mm.`,
          tex`$${num(metres * 1000)} + ${num(cm * 10)} = ${num(value)}$ mm.`,
          tex`A hossz **${num(value)} mm**.`,
        ],
      };
    }
    const value = metres + cm / 100;
    return {
      prompt: tex`Hány m a $${num(metres)}$ m $${num(cm)}$ cm? (Tizedes törtben add meg!)`,
      answer: { type: 'number', value, unit: 'm' },
      inputLabel: 'hossz =',
      hint: 'A centimétereket váltsd méterbe, majd add hozzá a méterekhez!',
      solution: [
        tex`$100$ cm $= 1$ m, ezért $${num(cm)}$ cm $= ${num(cm)} : 100 = ${num(cm / 100)}$ m.`,
        tex`$${num(metres)} + ${num(cm / 100)} = ${num(value)}$ m.`,
        tex`A hossz **${num(value)} m**.`,
      ],
    };
  },
};

/** Sum or difference of labelled segments, with a possible unit change. */
const segmentSum: GeneratorDef = {
  id: 'segment-sum',
  title: 'Szakaszok összeadása és kivonása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(3, 9);
      const b = rng.int(2, 8);
      return {
        prompt: 'Milyen hosszú a két szakasz együtt?',
        figure: segmentFigure([
          { length: a, label: `${num(a)} cm`, y: 2.4 },
          { length: b, label: `${num(b)} cm`, y: 0.3 },
        ]),
        answer: { type: 'number', value: a + b, unit: 'cm' },
        inputLabel: 'együtt =',
        hint: 'Olvasd le mindkét szakasz hosszát, majd add össze őket!',
        solution: [
          tex`$|AB| = ${num(a)}$ cm és $|CD| = ${num(b)}$ cm.`,
          tex`$${num(a)} + ${num(b)} = ${num(a + b)}$ cm.`,
          tex`A két szakasz együtt **${num(a + b)} cm**.`,
        ],
      };
    }
    if (level === 2) {
      const dm = rng.int(1, 5);
      const cm = rng.int(10, 90);
      const aCm = dm * 10;
      const subtract = rng.chance(0.45) && aCm > cm;
      const value = subtract ? aCm - cm : aCm + cm;
      return {
        prompt: subtract ? 'Mennyivel hosszabb az egyik szakasz a másiknál?' : 'Milyen hosszú a két szakasz együtt?',
        figure: segmentFigure([
          { length: aCm, label: `${num(dm)} dm`, y: 2.4 },
          { length: cm, label: `${num(cm)} cm`, y: 0.3 },
        ]),
        answer: { type: 'number', value, unit: 'cm' },
        inputLabel: subtract ? 'különbség =' : 'együtt =',
        hint: 'Először váltsd át a decimétert centiméterbe, aztán számolj!',
        solution: [
          tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $= ${num(aCm)}$ cm.`,
          tex`$|AB| = ${num(aCm)}$ cm, $|CD| = ${num(cm)}$ cm.`,
          subtract
            ? tex`$${num(aCm)} - ${num(cm)} = ${num(value)}$ cm.`
            : tex`$${num(aCm)} + ${num(cm)} = ${num(value)}$ cm.`,
          subtract
            ? tex`Az $AB$ szakasz **${num(value)} cm-rel** hosszabb.`
            : tex`A két szakasz együtt **${num(value)} cm**.`,
        ],
      };
    }

    // level 3: three segments with mixed units
    const dm = rng.int(1, 3);
    const cmPart = rng.int(1, 4) * 5;
    const cd = rng.int(2, 6) * 5;
    const mm = rng.int(5, 20) * 10;
    const abCm = dm * 10 + cmPart;
    const efCm = mm / 10;
    const total = abCm + cd + efCm;
    const askMissing = rng.chance(0.45);
    if (askMissing) {
      return {
        prompt: tex`A három szakasz együtt $${num(total)}$ cm. Milyen hosszú az $EF$ szakasz?`,
        figure: segmentFigure(
          [
            { length: abCm, label: `${num(dm)} dm ${num(cmPart)} cm`, y: 2.6 },
            { length: cd, label: `${num(cd)} cm`, y: 1.3 },
            { length: efCm, label: '? cm', y: 0 },
          ],
          true,
        ),
        answer: { type: 'number', value: efCm, unit: 'cm' },
        inputLabel: '$|EF| =$',
        hint: 'Váltsd át az összes hosszúságot centiméterbe, majd vond ki a többit az összegből!',
        solution: [
          tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $${num(cmPart)}$ cm $= ${num(abCm)}$ cm.`,
          tex`A három szakasz együtt $${num(total)}$ cm; ebből $AB = ${num(abCm)}$ cm és $CD = ${num(cd)}$ cm.`,
          tex`$${num(total)} - ${num(abCm)} - ${num(cd)} = ${num(efCm)}$ cm.`,
          tex`Az $EF$ szakasz **${num(efCm)} cm**.`,
        ],
      };
    }
    return {
      prompt: 'Milyen hosszú a három szakasz együtt?',
      figure: segmentFigure([
        { length: abCm, label: `${num(dm)} dm ${num(cmPart)} cm`, y: 2.6 },
        { length: cd, label: `${num(cd)} cm`, y: 1.3 },
        { length: efCm, label: `${num(mm)} mm`, y: 0 },
      ]),
      answer: { type: 'number', value: total, unit: 'cm' },
      inputLabel: 'együtt =',
      hint: 'Váltsd át mindhárom hosszúságot centiméterbe!',
      solution: [
        tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $${num(cmPart)}$ cm $= ${num(abCm)}$ cm.`,
        tex`$1$ cm $= 10$ mm, ezért $${num(mm)}$ mm $= ${num(efCm)}$ cm.`,
        tex`$${num(abCm)} + ${num(cd)} + ${num(efCm)} = ${num(total)}$ cm.`,
        tex`A három szakasz együtt **${num(total)} cm**.`,
      ],
    };
  },
};

/** Which segment is longer / the longest? Mixed units force a conversion. */
const segmentCompare: GeneratorDef = {
  id: 'segment-compare',
  title: 'Szakaszok összehasonlítása',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const a = rng.int(4, 9);
      const b = rng.int(2, 8);
      if (a === b) return segmentCompareL1Fixed(rng);
      const longer = a > b ? 'AB' : 'CD';
      return {
        prompt: 'Melyik szakasz a hosszabb?',
        figure: segmentFigure([
          { length: a, label: `${num(a)} cm`, y: 2.4 },
          { length: b, label: `${num(b)} cm`, y: 0.3 },
        ]),
        answer: textChoice(`$${longer}$`, [longer === 'AB' ? '$CD$' : '$AB$', 'egyenlők']),
        hint: 'Hasonlítsd össze a két leolvasott hosszt!',
        solution: [
          tex`$|AB| = ${num(a)}$ cm, $|CD| = ${num(b)}$ cm.`,
          tex`$${num(Math.max(a, b))} > ${num(Math.min(a, b))}$, ezért ${SegArt(longer)} **$${longer}$** szakasz a hosszabb.`,
        ],
      };
    }
    if (level === 2) {
      const equal = rng.chance(0.25);
      const dm = rng.int(1, 4);
      const cm = equal ? dm * 10 : rng.int(2, 8) * 5;
      const aCm = dm * 10;
      const longer = aCm === cm ? 'egyenlők' : aCm > cm ? 'AB' : 'CD';
      return {
        prompt: 'Melyik szakasz a hosszabb?',
        figure: segmentFigure([
          { length: aCm, label: `${num(dm)} dm`, y: 2.4 },
          { length: cm, label: `${num(cm)} cm`, y: 0.3 },
        ]),
        answer: textChoice(longer === 'egyenlők' ? 'egyenlők' : `$${longer}$`, longer === 'AB' ? ['$CD$', 'egyenlők'] : longer === 'CD' ? ['$AB$', 'egyenlők'] : ['$AB$', '$CD$']),
        hint: 'Váltsd át mindkét hosszúságot ugyanabba az egységbe!',
        solution: [
          dm === 1 ? tex`$1$ dm $= 10$ cm.` : tex`$1$ dm $= 10$ cm, ezért $${num(dm)}$ dm $= ${num(aCm)}$ cm.`,
          tex`A két hossz: $${num(aCm)}$ cm és $${num(cm)}$ cm.`,
          longer === 'egyenlők'
            ? tex`A két szakasz **egyenlő hosszú**.`
            : tex`${SegArt(longer)} **$${longer}$** szakasz a hosszabb.`,
        ],
      };
    }
    // level 3: three segments in three different units
    const aDm = rng.int(1, 5);
    const bCm = rng.int(15, 75);
    const cMm = rng.int(6, 14) * 10;
    const lengths = [aDm * 10, bCm, cMm / 10];
    const max = Math.max(...lengths);
    const winners = ['AB', 'CD', 'EF'].filter((_, i) => lengths[i] === max);
    if (winners.length > 1) return segmentCompareL3Fixed(rng);
    const longest = winners[0];
    return {
      prompt: 'Melyik szakasz a leghosszabb?',
      figure: segmentFigure([
        { length: lengths[0], label: `${num(aDm)} dm`, y: 2.6 },
        { length: lengths[1], label: `${num(bCm)} cm`, y: 1.3 },
        { length: lengths[2], label: `${num(cMm)} mm`, y: 0 },
      ]),
      answer: textChoice(`$${longest}$`, ['$AB$', '$CD$', '$EF$'].filter((s) => s !== `$${longest}$`)),
      hint: 'Váltsd át mindhárom hosszúságot centiméterbe!',
      solution: [
        aDm === 1 ? tex`$1$ dm $= 10$ cm.` : tex`$1$ dm $= 10$ cm, ezért $${num(aDm)}$ dm $= ${num(lengths[0])}$ cm.`,
        tex`A $CD$ szakasz $${num(bCm)}$ cm, az $EF$ szakasz $${num(cMm)}$ mm $= ${num(lengths[2])}$ cm.`,
        tex`A három hossz: $${num(lengths[0])}$, $${num(lengths[1])}$ és $${num(lengths[2])}$ cm.`,
        tex`${SegArt(longest)} **$${longest}$** szakasz a leghosszabb.`,
      ],
    };
  },
};

/** Fallback when the random L1 lengths are equal: a fixed unequal pair. */
function segmentCompareL1Fixed(_rng: unknown): Question {
  return {
    prompt: 'Melyik szakasz a hosszabb?',
    figure: segmentFigure([
      { length: 8, label: '8 cm', y: 2.4 },
      { length: 5, label: '5 cm', y: 0.3 },
    ]),
    answer: textChoice('$AB$', ['$CD$', 'egyenlők']),
    hint: 'Hasonlítsd össze a két leolvasott hosszt!',
    solution: ['$|AB| = 8$ cm, $|CD| = 5$ cm.', '$8 > 5$, ezért az **$AB$** szakasz a hosszabb.'],
  };
}

/** Fallback when two L3 segments tie: a fixed clear winner. */
function segmentCompareL3Fixed(_rng: unknown): Question {
  return {
    prompt: 'Melyik szakasz a leghosszabb?',
    figure: segmentFigure([
      { length: 20, label: '2 dm', y: 2.6 },
      { length: 35, label: '35 cm', y: 1.3 },
      { length: 90, label: '900 mm', y: 0 },
    ]),
    answer: textChoice('$EF$', ['$AB$', '$CD$']),
    hint: 'Váltsd át mindhárom hosszúságot centiméterbe!',
    solution: ['2 dm = 20 cm, 35 cm = 35 cm, 900 mm = 90 cm.', 'A három hossz: 20, 35 és 90 cm.', 'Az **$EF$** szakasz a leghosszabb.'],
  };
}

/** Perimeter of a triangle, a rectangle, or a reverse problem. */
const perimeter: GeneratorDef = {
  id: 'perimeter',
  title: 'Zárt törtvonal kerülete',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    if (level === 1) {
      const [a, b, c] = rng.pick([
        [3, 4, 5],
        [4, 5, 6],
        [5, 6, 7],
        [4, 6, 7],
        [5, 5, 6],
        [6, 7, 8],
      ]);
      return {
        prompt: 'Mekkora a háromszög kerülete?',
        figure: triangleFigure(a, b, c),
        answer: { type: 'number', value: a + b + c, unit: 'cm' },
        inputLabel: '$K =$',
        hint: 'A kerület a három oldal hosszának összege.',
        solution: [
          tex`A három oldal: $${num(a)}$ cm, $${num(b)}$ cm és $${num(c)}$ cm.`,
          tex`$${num(a)} + ${num(b)} + ${num(c)} = ${num(a + b + c)}$ cm.`,
          tex`A háromszög kerülete **${num(a + b + c)} cm**.`,
        ],
      };
    }
    if (level === 2) {
      const a = rng.int(5, 12);
      const b = rng.int(3, 9);
      return {
        prompt: 'Mekkora a téglalap kerülete?',
        figure: rectangleFigure(a, b),
        answer: { type: 'number', value: 2 * (a + b), unit: 'cm' },
        inputLabel: '$K =$',
        hint: 'A téglalap négy oldala: két-két szemközti oldal egyenlő.',
        solution: [
          tex`A téglalap oldalai: $${num(a)}$ cm, $${num(b)}$ cm, $${num(a)}$ cm és $${num(b)}$ cm.`,
          tex`$${num(a)} + ${num(b)} + ${num(a)} + ${num(b)} = ${num(2 * (a + b))}$ cm.`,
          tex`A téglalap kerülete **${num(2 * (a + b))} cm**.`,
        ],
      };
    }
    if (rng.chance(0.6)) {
      const a = rng.int(4, 12);
      const b = rng.int(3, 9);
      const p = 2 * (a + b);
      return {
        prompt: tex`A téglalap kerülete $${num(p)}$ cm, az egyik oldala $${num(a)}$ cm. Milyen hosszú a másik oldala?`,
        figure: rectangleFigure(a, b, '? cm'),
        answer: { type: 'number', value: b, unit: 'cm' },
        inputLabel: 'másik oldal =',
        hint: 'A kerület fele egy hosszú és egy rövid oldal összege.',
        solution: [
          tex`A kerület fele: $${num(p)} : 2 = ${num(a + b)}$ cm — ez egy hosszú és egy rövid oldal összege.`,
          tex`$${num(a + b)} - ${num(a)} = ${num(b)}$ cm.`,
          tex`A másik oldal **${num(b)} cm**.`,
        ],
      };
    }
    const a = rng.int(3, 9);
    const p = 5 * a;
    return {
      prompt: tex`A szabályos ötszög kerülete $${num(p)}$ cm. Milyen hosszú egy oldala?`,
      figure: { type: 'regularPolygon', n: 5, side: a, sideLabel: 'a = ?', fill: true },
      answer: { type: 'number', value: a, unit: 'cm' },
      inputLabel: '$a =$',
      hint: 'A szabályos ötszög öt egyenlő oldalból áll.',
      solution: [
        tex`A szabályos ötszögnek öt egyenlő oldala van.`,
        tex`$${num(p)} : 5 = ${num(a)}$ cm.`,
        tex`Egy oldal **${num(a)} cm**.`,
      ],
    };
  },
};

/** True/false statements about units, equal segments, broken lines and perimeter. */
type Statement = { text: string; value: boolean; why: string };

const segmentTf: GeneratorDef = {
  id: 'segment-tf',
  title: 'Igaz-hamis állítások a hosszúságról',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: '1 m = 100 cm.', value: true, why: 'Egy méter száz centiméter.' },
            { text: '1 dm = 10 mm.', value: false, why: '1 dm = 100 mm, mert 1 dm = 10 cm és 1 cm = 10 mm.' },
            { text: '1 km = 1000 m.', value: true, why: 'Egy kilométer ezer méter.' },
            { text: '1 cm = 10 mm.', value: true, why: 'Egy centiméter tíz milliméter.' },
            { text: '1 m = 10 cm.', value: false, why: '1 m = 100 cm, nem 10 cm.' },
            { text: '1 dm = 10 cm.', value: true, why: 'Egy deciméter tíz centiméter.' },
            { text: '1 km = 100 m.', value: false, why: '1 km = 1000 m.' },
            { text: '1 mm = 10 cm.', value: false, why: '1 mm sokkal rövidebb: 10 mm = 1 cm.' },
            { text: 'A hosszúság alapegysége a méter.', value: true, why: 'A nemzetközi mértékrendszerben a hosszúság alapegysége a méter.' },
            { text: '1 m = 1000 mm.', value: true, why: '1 m = 100 cm = 1000 mm.' },
          ]
        : level === 2
          ? [
              { text: 'Ha $|AB| = |CD|$, akkor az $AB$ és a $CD$ szakasz egyenlő.', value: true, why: 'Az egyenlő hosszúság éppen az egyenlő szakaszokat jelenti.' },
              { text: 'Két szakasz egyenlő, ha ugyanolyan hosszú.', value: true, why: 'A szakaszok egyenlőségét a hosszuk dönti el.' },
              { text: 'Ha két szakasz egyenlő, akkor a hosszuk is egyenlő.', value: true, why: 'Az egyenlő szakaszok hossza egyenlő.' },
              { text: 'A $|AB|$ jelölés az $AB$ szakasz hosszát jelenti.', value: true, why: 'A függőleges vonalak a hossz jelei.' },
              { text: 'Két szakasz hosszát körzővel is összehasonlíthatjuk.', value: true, why: 'A körző nyílásába vesszük az egyik hosszát, majd a másikkal összevetjük.' },
              { text: 'Ha $|AB| > |CD|$, akkor az $AB$ rövidebb.', value: false, why: 'A nagyobb hossz a hosszabb szakaszt jelenti.' },
              { text: 'Minden szakasz hosszát csak centiméterben lehet megadni.', value: false, why: 'Milliméterben, deciméterben, méterben is megadható.' },
              { text: 'Az egyenlő szakaszok hossza egyenlő.', value: true, why: 'Ez az egyenlőség jelentése.' },
              { text: 'A szakasz hossza attól függ, hogyan forgatjuk a papírt.', value: false, why: 'A hossz a szakasz saját tulajdonsága, nem változik forgatással.' },
              { text: 'A $|AB|$ jelölés az $A$ és $B$ pont távolságát is jelenti.', value: true, why: 'A szakasz hossza egyben a két végpont távolsága.' },
            ]
          : [
              { text: 'A nyílt törtvonal hossza a kerület.', value: false, why: 'Kerülete csak a zárt törtvonalnak van.' },
              { text: 'A zárt törtvonal hossza a kerület.', value: true, why: 'A zárt alakzat határvonalának hossza a kerület.' },
              { text: 'A törtvonal szakaszokból áll.', value: true, why: 'A törtvonal egymáshoz kapcsolódó szakaszokból áll.' },
              { text: 'A kerület a zárt alakzat határvonalának hossza.', value: true, why: 'Így definiáljuk a kerületet.' },
              { text: 'A törtvonal mindig zárt.', value: false, why: 'Lehet nyílt is; a két vége nem feltétlenül találkozik.' },
              { text: 'Egy zárt törtvonal kezdő- és végpontja ugyanaz.', value: true, why: 'A zárt vonal visszatér a kiinduló pontba.' },
              { text: 'A kerületet úgy számítjuk, hogy összeadjuk az oldalak hosszát.', value: true, why: 'A kerület az oldalak hosszának összege.' },
              { text: 'A nyílt törtvonalnak nincs kerülete.', value: true, why: 'Kerület csak zárt vonalnál értelmezhető.' },
              { text: 'A háromszög kerülete a három oldal összege.', value: true, why: 'A háromszög zárt törtvonal, három oldala van.' },
              { text: 'A téglalap kerülete a két oldal összege.', value: false, why: 'A téglalapnak négy oldala van; mind a négyet összeadjuk.' },
              { text: 'A zárt törtvonal minden oldala egyenlő.', value: false, why: 'Csak a szabályos sokszögeknél egyenlők az oldalak.' },
              { text: 'A négyzet kerülete az oldal hosszának a négyszerese.', value: true, why: 'A négyzet négy egyenlő oldalából áll.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át a hosszúságegységeket, a szakaszok egyenlőségét és a törtvonalakat!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-03',
  goals: [
    'átváltani a hosszúság egységei között,',
    'egy hosszúságot egyetlen egységben megadni,',
    'összeadni, kivonni és összehasonlítani szakaszokat,',
    'kiszámítani egy zárt törtvonal kerületét.',
  ],
  parts: [
    {
      title: 'Hosszúságegységek',
      steps: [
        {
          type: 'theory',
          title: 'A hosszúság egységei',
          body: 'A hosszúság egységei: 1 cm = 10 mm, 1 dm = 10 cm, 1 m = 10 dm = 100 cm, 1 km = 1000 m.',
          remember: '1 m = 100 cm = 1000 mm',
        },
        {
          type: 'check',
          question: {
            prompt: '1 m = 100 cm.',
            answer: { type: 'truefalse', value: true },
            hint: 'Gondolj a méter és a centiméter kapcsolatára!',
            solution: ['Egy méter száz centiméter.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Méterből centiméterbe',
          problem: 'Hány centiméter a $3$ m?',
          steps: [
            { text: '1 m = 100 cm.' },
            { text: '$3 \\cdot 100 = 300$.' },
          ],
          answer: 'A $3$ m = **300 cm**.',
        },
        { type: 'practice', generator: 'unit-convert', level: 1, count: 2 },
        { type: 'practice', generator: 'segment-tf', level: 1 },
      ],
    },
    {
      title: 'Több egység, egy hossz',
      steps: [
        {
          type: 'theory',
          title: 'Két egységgel megadott hossz',
          body: 'A 2 m 35 cm-t két lépésben váltjuk át: 2 m = 200 cm, majd 200 + 35 = 235 cm.',
          remember: 'Először a nagyobb egységet váltjuk át!',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $2$ m $35$ cm ugyanannyi, mint a $235$ cm.',
            answer: { type: 'truefalse', value: true },
            hint: 'Váltsd át a 2 métert centiméterbe, és add hozzá a 35 cm-t!',
            solution: ['2 m = 200 cm.', '200 + 35 = 235 cm, tehát az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Méter és centiméter',
          problem: 'Írd át a $2$ m $35$ cm-t centiméterbe!',
          figure: multiUnitFigure,
          steps: [
            { text: '2 m = 200 cm.' },
            { text: '200 + 35 = 235.' },
          ],
          answer: 'A $2$ m $35$ cm = **235 cm**.',
        },
        { type: 'practice', generator: 'unit-convert', level: 2 },
        { type: 'practice', generator: 'unit-convert', level: 3 },
        { type: 'practice', generator: 'segment-tf', level: 2 },
      ],
    },
    {
      title: 'Szakaszok összeadása',
      steps: [
        {
          type: 'theory',
          title: 'A szakasz hossza',
          body: 'A szakasz hosszát $|AB|$ jelöli. Két szakasz egyenlő, ha a hosszuk egyenlő.',
          figure: equalSegmentsFigure,
          remember: '$|AB|$ = az $AB$ szakasz hossza',
        },
        {
          type: 'theory',
          title: 'Átvitel körzővel',
          body: 'A körző nyílásába vesszük az $AB$ hosszát, majd a $C$ pontból ugyanekkora ívet rajzolunk. Így $CD = AB$.',
          figure: compassTransferFigure,
        },
        {
          type: 'check',
          question: {
            prompt: 'Ha $|AB| = |CD|$, akkor a két szakasz egyenlő.',
            answer: { type: 'truefalse', value: true },
            hint: 'Mit jelent a szakaszok egyenlősége?',
            solution: ['Az egyenlő hosszúság éppen az egyenlő szakaszokat jelenti.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Két szakasz együtt',
          problem: 'Milyen hosszú a két szakasz együtt?',
          figure: segmentFigure([
            { length: 3, label: '3 cm', y: 2.4 },
            { length: 5, label: '5 cm', y: 0.3 },
          ]),
          steps: [
            { text: '$|AB| = 3$ cm, $|CD| = 5$ cm.' },
            { text: '$3 + 5 = 8$.' },
          ],
          answer: 'A két szakasz együtt **8 cm**.',
        },
        { type: 'practice', generator: 'segment-sum', level: 1, count: 2 },
        { type: 'practice', generator: 'segment-sum', level: 2 },
        { type: 'practice', generator: 'segment-sum', level: 3 },
        { type: 'practice', generator: 'segment-compare', level: 1 },
        { type: 'practice', generator: 'segment-compare', level: 2 },
      ],
    },
    {
      title: 'Törtvonal és kerület',
      steps: [
        {
          type: 'theory',
          title: 'Törtvonal, kerület',
          body: 'A törtvonal egymáshoz kapcsolódó szakaszokból áll. Ha a két vége találkozik, zárt; a hossza a kerület.',
          figure: triangleFigure(3, 4, 5),
          remember: 'Kerület = a zárt törtvonal hossza',
        },
        {
          type: 'check',
          question: {
            prompt: 'A zárt törtvonal hossza a kerület.',
            figure: triangleFigure(3, 4, 5),
            answer: { type: 'truefalse', value: true },
            hint: 'Mi a kapcsolat a zárt vonal hossza és a kerület között?',
            solution: ['A zárt alakzat határvonalának hossza a kerület.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'A téglalap kerülete',
          problem: 'Mekkora a téglalap kerülete?',
          figure: rectangleFigure(6, 4),
          steps: [
            { text: 'A négy oldal: 6 cm, 4 cm, 6 cm és 4 cm.' },
            { text: '$6 + 4 + 6 + 4 = 20$.' },
          ],
          answer: 'A téglalap kerülete **20 cm**.',
        },
        { type: 'practice', generator: 'perimeter', level: 1 },
        { type: 'practice', generator: 'perimeter', level: 2 },
        { type: 'practice', generator: 'perimeter', level: 3 },
        { type: 'practice', generator: 'segment-compare', level: 3 },
        { type: 'practice', generator: 'segment-tf', level: 3 },
      ],
    },
  ],
  generators: [unitConvert, segmentSum, segmentCompare, perimeter, segmentTf],
  miniTest: {
    items: [
      { generator: 'unit-convert', level: 1 },
      { generator: 'segment-sum', level: 1 },
      { generator: 'perimeter', level: 1 },
      { generator: 'segment-tf', level: 2 },
      { generator: 'unit-convert', level: 3 },
      { generator: 'segment-sum', level: 2 },
      { generator: 'perimeter', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'unit-convert', level: 1 },
    { generator: 'segment-tf', level: 1 },
    { generator: 'segment-sum', level: 1 },
    { generator: 'segment-compare', level: 1 },
    { generator: 'perimeter', level: 1 },
    { generator: 'unit-convert', level: 2 },
    { generator: 'segment-sum', level: 2 },
  ],
});
