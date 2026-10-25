/**
 * 8. osztály › Pont, egyenes és sík › 2. Merőleges vetítés a síkra
 *
 * Orthogonal projection of a point, a segment and a line onto a plane; the three cases
 * (slanted → shorter, parallel → equal, perpendicular → a point); the angle between a line
 * and a plane; Pythagoras with projections. Figures show the plane α as a rounded
 * parallelogram and label projections with subscript 1 (A₁, B₁).
 */
import {
  defineSubtopic,
  num,
  simplifyRoot,
  tex,
  textChoice,
  type Figure,
  type GeoItem,
  type GeneratorDef,
  type Question,
  type XY,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: point / segment projection on plane α
// ---------------------------------------------------------------------------------------------

const PLANE: Record<string, XY> = { P1: [0, 0], P2: [12, 0], P3: [14, 3], P4: [2, 3] };
const Y0 = 1.2;

interface ProjectionOptions {
  /** Length of the projection A₁B₁ (true length; the drawing is scaled uniformly). */
  projection: number;
  /** Distance of A from the plane (0 = A lies in the plane). */
  heightA: number;
  /** Distance of B from the plane. */
  heightB: number;
  /** Labels of the known lengths; omit what is not shown. */
  abLabel?: string;
  aHeightLabel?: string;
  bHeightLabel?: string;
  projLabel?: string;
  /** Draw the angle at A between AB and the projection (only when A lies in the plane). */
  angleLabel?: string;
  caption?: string;
  alt?: string;
}

/**
 * A segment AB above plane α, its feet A₁ and B₁, and the right triangle used for Pythagoras.
 * Distances are multiplied by one common factor so the drawing fits, keeping true proportions.
 */
function projectionFigure(opts: ProjectionOptions): Figure {
  const max = Math.max(opts.projection, opts.heightA, opts.heightB, 1);
  const s = 8 / max;
  const p = opts.projection * s;
  const ha = opts.heightA * s;
  const hb = opts.heightB * s;
  const ax = 2;
  const bx = 2 + Math.max(p, 0.001);
  const points: Record<string, XY> = { ...PLANE };
  points.A = [ax, Y0 + ha];
  points.B = [bx, Y0 + hb];
  if (opts.heightA > 0) points.A1 = [ax, Y0];
  if (opts.heightB > 0) points.B1 = [bx, Y0];
  const aFoot = opts.heightA > 0 ? 'A1' : 'A';
  const bFoot = opts.heightB > 0 ? 'B1' : 'B';
  const aFootPt = points[aFoot];
  const bFootPt = points[bFoot];

  const items: GeoItem[] = [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'muted', vertexLabels: false },
    { kind: 'label', at: [12.6, 2.2], text: 'α', size: 'large' },
  ];

  if (opts.heightA > 0) items.push({ kind: 'segment', from: 'A', to: 'A1', dashed: true, color: 'muted' });
  if (opts.heightB > 0) items.push({ kind: 'segment', from: 'B', to: 'B1', dashed: true, color: 'muted' });
  items.push({ kind: 'segment', from: 'A', to: 'B', color: 'accent', width: 'thick' });
  items.push({ kind: 'segment', from: aFoot, to: bFoot, color: 'blue', width: 'thick' });
  if (opts.heightB > 0) items.push({ kind: 'angle', vertex: bFoot, from: 'B', to: aFoot, right: true });
  if (opts.heightA > 0) items.push({ kind: 'angle', vertex: aFoot, from: 'A', to: bFoot, right: true });
  if (opts.angleLabel && opts.heightA === 0) {
    items.push({ kind: 'angle', vertex: 'A', from: 'B', to: bFoot, label: opts.angleLabel, fill: true });
  }

  const abMid: XY = [(points.A[0] + points.B[0]) / 2, (points.A[1] + points.B[1]) / 2];
  if (opts.abLabel) items.push({ kind: 'label', at: abMid, text: opts.abLabel, dir: 'nw' });
  if (opts.aHeightLabel && opts.heightA > 0) {
    items.push({ kind: 'label', at: [ax, (points.A[1] + Y0) / 2], text: opts.aHeightLabel, dir: 'w' });
  }
  if (opts.bHeightLabel && opts.heightB > 0) {
    items.push({ kind: 'label', at: [bx, (points.B[1] + Y0) / 2], text: opts.bHeightLabel, dir: 'e' });
  }
  if (opts.projLabel) {
    items.push({ kind: 'label', at: [(aFootPt[0] + bFootPt[0]) / 2, Y0 - 0.55], text: opts.projLabel, dir: 's' });
  }

  const labelDirs: Record<string, 'sw' | 'se' | 'nw' | 'ne'> = { A: 'sw', B: 'ne', A1: 'nw', B1: 'se' };
  for (const name of ['A', 'B', 'A1', 'B1']) {
    if (!points[name]) continue;
    items.push({
      kind: 'point',
      at: name,
      label: name === 'A1' ? 'A₁' : name === 'B1' ? 'B₁' : undefined,
      labelDir: labelDirs[name],
    });
  }

  return {
    type: 'geometry',
    points,
    items,
    caption: opts.caption,
    alt: opts.alt,
  };
}

/** A perpendicular segment: both endpoints project to the same point A₁ ≡ B₁. */
const perpendicularFigure: Figure = {
  type: 'geometry',
  points: { ...PLANE, A: [5.5, 5.2], B: [5.5, 3.4], T: [5.5, Y0] },
  items: [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'muted', vertexLabels: false },
    { kind: 'label', at: [12.6, 2.2], text: 'α', size: 'large' },
    { kind: 'segment', from: 'A', to: 'B', color: 'accent', width: 'thick' },
    { kind: 'segment', from: 'B', to: 'T', dashed: true, color: 'muted' },
    { kind: 'point', at: 'A', labelDir: 'nw' },
    { kind: 'point', at: 'B', labelDir: 'ne' },
    { kind: 'point', at: 'T', label: 'A₁ ≡ B₁', labelDir: 's' },
  ],
  caption: 'A merőleges szakasz vetülete egyetlen pont.',
};

const theoryFigure = projectionFigure({
  projection: 5,
  heightA: 0,
  heightB: 4,
  abLabel: 'AB',
  bHeightLabel: 'BB₁',
  projLabel: 'A₁B₁',
  alt: 'Az AB szakasz és A₁B₁ merőleges vetülete az α síkon.',
});

const bothFigure = projectionFigure({
  projection: 12,
  heightA: 7,
  heightB: 2,
  aHeightLabel: '7 cm',
  bHeightLabel: '2 cm',
  projLabel: '12 cm',
  abLabel: '?',
  alt: 'Két pont különböző magasságban az α sík felett.',
});

// ---------------------------------------------------------------------------------------------
// 2. A small labelled cube, for projection questions on the base plane
// ---------------------------------------------------------------------------------------------

type V3 = [number, number, number];

const CUBE_V: Record<string, V3> = {
  A: [0, 0, 0],
  B: [1, 0, 0],
  C: [1, 1, 0],
  D: [0, 1, 0],
  E: [0, 0, 1],
  F: [1, 0, 1],
  G: [1, 1, 1],
  H: [0, 1, 1],
};
const CUBE_EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
const HIDDEN = new Set(['AD', 'DC', 'DH']);

/** A cube with the base plane tinted and one segment highlighted. */
function cubeFigure(segment: string): Figure {
  const a = 4;
  const project = ([x, y, z]: V3): XY => [4 * a * x + 1.6 * a * y, 4 * a * z + 1.6 * a * y];
  const points: Record<string, XY> = Object.fromEntries(Object.entries(CUBE_V).map(([k, v]) => [k, project(v)]));
  const items: GeoItem[] = [
    { kind: 'region', points: ['A', 'B', 'C', 'D'], fill: 'blue' },
    ...CUBE_EDGES.map((edge) => ({
      kind: 'segment' as const,
      from: edge[0],
      to: edge[1],
      dashed: HIDDEN.has(edge),
      color: 'ink' as const,
    })),
    { kind: 'segment', from: segment[0], to: segment[1], color: 'highlight', width: 'thick' },
    ...(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const).map((name) => ({
      kind: 'point' as const,
      at: name,
      labelDir: ({ A: 'sw', B: 'se', C: 'e', D: 'w', E: 'nw', F: 'ne', G: 'e', H: 'w' } as const)[name],
    })),
  ];
  return {
    type: 'geometry',
    points,
    items,
    alt: `Kocka a kiemelt ${segment} szakasszal és az ABCD alaplappal.`,
  };
}

// ---------------------------------------------------------------------------------------------
// 3. Generators
// ---------------------------------------------------------------------------------------------

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [12, 16, 20],
];

/** Length of the projection, given the segment and the distance from the plane. */
const projectionLength: GeneratorDef = {
  id: 'projection-length',
  title: 'A vetület hossza',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (level === 3) {
      const ab = 2 * rng.int(5, 10);
      const height = ab / 2;
      const coef = ab / 2;
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz $${num(ab)}$ ${unit}, a síkkal $30°$-os szöget zár be. Milyen hosszú a vetülete?`,
        figure: projectionFigure({
          projection: (ab * Math.sqrt(3)) / 2,
          heightA: 0,
          heightB: height,
          abLabel: `${num(ab)} ${unit}`,
          bHeightLabel: `${num(height)} ${unit}`,
          projLabel: '?',
          angleLabel: '30°',
          alt: '30°-os szögű szakasz és a vetülete az α síkon.',
        }),
        answer: { type: 'root', coef, radicand: 3, requireSimplified: false, unit },
        inputLabel: '$A_1B_1 =$',
        hint: 'A 30°-os szögű derékszögű háromszögben a rövidebb befogó az átfogó fele. A vetület a másik befogó.',
        solution: [
          tex`A $B$ pont távolsága a síktól: $BB_1 = AB : 2 = ${num(ab)} : 2 = ${num(height)}$ ${unit}.`,
          tex`$A_1B_1^2 = AB^2 - BB_1^2 = ${num(ab)}^2 - ${num(height)}^2 = ${num(ab * ab)} - ${num(height * height)} = ${num(ab * ab - height * height)}$.`,
          tex`$A_1B_1 = \sqrt{${num(ab * ab - height * height)}} = ${num(coef)}\sqrt{3}$ ${unit}.`,
          tex`A vetület **$${num(coef)}\sqrt{3}$ ${unit}** hosszú.`,
        ],
      };
    }

    if (level === 1) {
      const [x, y, c] = rng.pick(TRIPLES.filter(([, , z]) => z <= 17));
      const [projection, height] = rng.shuffle([x, y]);
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz $${num(c)}$ ${unit}, a $B$ pont $${num(height)}$ ${unit}-re van a síktól. Milyen hosszú a vetülete?`,
        figure: projectionFigure({
          projection,
          heightA: 0,
          heightB: height,
          abLabel: `${num(c)} ${unit}`,
          bHeightLabel: `${num(height)} ${unit}`,
          projLabel: '?',
          alt: 'Az AB szakasz és a vetülete az α síkon.',
        }),
        answer: { type: 'number', value: projection, unit },
        inputLabel: '$A_1B_1 =$',
        hint: 'A vetület, a B pont távolsága és az AB szakasz derékszögű háromszöget alkot. Pitagorasz: $AB^2 = A_1B_1^2 + BB_1^2$.',
        solution: [
          tex`Az $AB$ az átfogó, a vetület és $BB_1$ a két befogó.`,
          tex`$A_1B_1^2 = AB^2 - BB_1^2 = ${num(c)}^2 - ${num(height)}^2 = ${num(c * c)} - ${num(height * height)} = ${num(projection * projection)}$.`,
          tex`$A_1B_1 = \sqrt{${num(projection * projection)}} = ${num(projection)}$ ${unit}.`,
          tex`A vetület **${num(projection)} ${unit}** hosszú.`,
        ],
      };
    }

    // L2: the difference is not a perfect square → a√b answer.
    let c = 7;
    let height = 4;
    let diff = 0;
    for (;;) {
      c = rng.int(5, 12);
      height = rng.int(2, Math.max(2, Math.floor(c * 0.75)));
      diff = c * c - height * height;
      if (diff > 0 && Math.round(Math.sqrt(diff)) ** 2 !== diff) break;
    }
    const root = simplifyRoot(diff);
    return {
      prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz $${num(c)}$ ${unit}, a $B$ pont $${num(height)}$ ${unit}-re van a síktól. Milyen hosszú a vetülete? (Gyökös alakban add meg!)`,
      figure: projectionFigure({
        projection: Math.sqrt(diff),
        heightA: 0,
        heightB: height,
        abLabel: `${num(c)} ${unit}`,
        bHeightLabel: `${num(height)} ${unit}`,
        projLabel: '?',
        alt: 'Az AB szakasz és a vetülete az α síkon.',
      }),
      answer: { type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, unit },
      inputLabel: '$A_1B_1 =$',
      hint: 'A vetület, a B pont távolsága és az AB szakasz derékszögű háromszöget alkot. Pitagorasz: $AB^2 = A_1B_1^2 + BB_1^2$.',
      solution: [
        tex`Az $AB$ az átfogó, a vetület és $BB_1$ a két befogó.`,
        tex`$A_1B_1^2 = AB^2 - BB_1^2 = ${num(c)}^2 - ${num(height)}^2 = ${num(c * c)} - ${num(height * height)} = ${num(diff)}$.`,
        tex`$A_1B_1 = \sqrt{${num(diff)}} = ${root.coef === 1 ? '' : num(root.coef)}\sqrt{${num(root.radicand)}}$ ${unit}.`,
        tex`A vetület **$${root.coef === 1 ? '' : num(root.coef)}\sqrt{${num(root.radicand)}}$ ${unit}** hosszú.`,
      ],
    };
  },
};

/** Length of the segment, given its projection and the distances of the endpoints from the plane. */
const segmentLength: GeneratorDef = {
  id: 'segment-length',
  title: 'A szakasz hossza a vetületéből',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'cm', 'dm', 'm']);
    if (level === 1) {
      const [p, h, c] = rng.pick(TRIPLES.filter(([, , z]) => z <= 17));
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz vetülete $${num(p)}$ ${unit}, a $B$ pont $${num(h)}$ ${unit}-re van a síktól. Milyen hosszú $AB$?`,
        figure: projectionFigure({
          projection: p,
          heightA: 0,
          heightB: h,
          projLabel: `${num(p)} ${unit}`,
          bHeightLabel: `${num(h)} ${unit}`,
          abLabel: '?',
          alt: 'Az AB szakasz, a vetülete és a B pont távolsága.',
        }),
        answer: { type: 'number', value: c, unit },
        inputLabel: '$AB =$',
        hint: 'A vetület és a magasság a két befogó, az AB szakasz az átfogó: $AB^2 = A_1B_1^2 + BB_1^2$.',
        solution: [
          tex`A vetület $A_1B_1 = ${num(p)}$ ${unit}, a magasság $BB_1 = ${num(h)}$ ${unit}.`,
          tex`$AB^2 = ${num(p)}^2 + ${num(h)}^2 = ${num(p * p)} + ${num(h * h)} = ${num(c * c)}$.`,
          tex`$AB = \sqrt{${num(c * c)}} = ${num(c)}$ ${unit}.`,
          tex`Az $AB$ szakasz **${num(c)} ${unit}** hosszú.`,
        ],
      };
    }

    if (level === 3) {
      // the projection is m√r, the segment still comes out whole: m²·r + h² = AB²
      const cases: [number, number, number, number][] = [];
      for (const r of [2, 3, 5, 6, 7])
        for (let m = 1; m <= 8; m++)
          for (let h = 1; h <= 12; h++) {
            const ab = Math.sqrt(m * m * r + h * h);
            if (Number.isInteger(ab) && ab <= 20) cases.push([m, r, h, ab]);
          }
      const [m, r, height, ab] = rng.pick(cases);
      const p2 = m * m * r;
      const projTex = `${m === 1 ? '' : num(m)}\\sqrt{${num(r)}}`;
      const projText = `${m === 1 ? '' : num(m)}√${num(r)}`;
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz vetülete $${projTex}$ ${unit}, a $B$ pont $${num(height)}$ ${unit}-re van a síktól. Milyen hosszú $AB$?`,
        figure: projectionFigure({
          projection: Math.sqrt(p2),
          heightA: 0,
          heightB: height,
          projLabel: `${projText} ${unit}`,
          bHeightLabel: `${num(height)} ${unit}`,
          abLabel: '?',
          alt: `Az AB szakasz a ${projText} ${unit}-es vetületével.`,
        }),
        answer: { type: 'number', value: ab, unit },
        inputLabel: '$AB =$',
        hint: 'Emeld négyzetre a vetületet, majd használd Pitagorasz tételét!',
        solution: [
          tex`A vetület négyzete: $(${projTex})^2 = ${m === 1 ? '' : `${num(m * m)} \\cdot `}${num(r)}${m === 1 ? '' : ` = ${num(p2)}`}$.`,
          tex`$AB^2 = ${num(p2)} + ${num(height)}^2 = ${num(p2)} + ${num(height * height)} = ${num(ab * ab)}$.`,
          tex`$AB = \sqrt{${num(ab * ab)}} = ${num(ab)}$ ${unit}.`,
          tex`Az $AB$ szakasz **${num(ab)} ${unit}** hosszú.`,
        ],
      };
    }

    // L2: both endpoints above the plane, equal or different heights.
    const integerCase = rng.chance(0.5);
    let p = 8;
    let diff = 3;
    let c = 0;
    if (integerCase) {
      [p, diff] = rng.pick(TRIPLES.filter(([, , z]) => z <= 17)).slice(0, 2).sort((x, y) => y - x);
      c = Math.sqrt(p * p + diff * diff);
    } else {
      for (;;) {
        p = rng.int(6, 10);
        diff = rng.int(2, 5);
        const d2 = p * p + diff * diff;
        if (Math.round(Math.sqrt(d2)) ** 2 !== d2) break;
      }
      c = Math.sqrt(p * p + diff * diff);
    }
    const dA = diff + rng.int(3, 5);
    const dB = dA - diff;
    const root = simplifyRoot(p * p + diff * diff);
    const exact = Number.isInteger(Math.round(c * 1e9) / 1e9);
    const answer = exact
      ? ({ type: 'number', value: c, unit } as const)
      : ({ type: 'root', coef: root.coef, radicand: root.radicand, requireSimplified: false, unit } as const);
    return {
      prompt: tex`Az $A$ és $B$ pont ugyanazon oldalon $${num(dA)}$ ${unit}, illetve $${num(dB)}$ ${unit}-re van a síktól; a vetületük $${num(p)}$ ${unit}. Milyen hosszú $AB$?${exact ? '' : ' (Gyökös alakban add meg!)'}`,
      figure: projectionFigure({
        projection: p,
        heightA: dA,
        heightB: dB,
        aHeightLabel: `${num(dA)} ${unit}`,
        bHeightLabel: `${num(dB)} ${unit}`,
        projLabel: `${num(p)} ${unit}`,
        abLabel: '?',
        alt: 'Két pont különböző magasságban az α sík felett.',
      }),
      answer,
      inputLabel: '$AB =$',
      hint: tex`A két magasság különbsége a függőleges befogó: $${num(dA)} - ${num(dB)} = ${num(diff)}$ ${unit}. Pitagorasz: $AB^2 = A_1B_1^2 + ${num(diff)}^2$.`,
      solution: [
        tex`A magasságok különbsége: $${num(dA)} - ${num(dB)} = ${num(diff)}$ ${unit}.`,
        tex`$AB^2 = A_1B_1^2 + ${num(diff)}^2 = ${num(p)}^2 + ${num(diff)}^2 = ${num(p * p)} + ${num(diff * diff)} = ${num(p * p + diff * diff)}$.`,
        exact ? tex`$AB = \sqrt{${num(p * p + diff * diff)}} = ${num(c)}$ ${unit}.` : tex`$AB = \sqrt{${num(p * p + diff * diff)}} = ${root.coef === 1 ? '' : num(root.coef)}\sqrt{${num(root.radicand)}}$ ${unit}.`,
        exact ? tex`Az $AB$ szakasz **${num(c)} ${unit}** hosszú.` : tex`Az $AB$ szakasz **$${root.coef === 1 ? '' : num(root.coef)}\sqrt{${num(root.radicand)}}$ ${unit}** hosszú.`,
      ],
    };
  },
};

/** Angle between the segment and the plane, using 45° and 30°–60° special triangles. */
const angle: GeneratorDef = {
  id: 'angle',
  title: 'Az egyenes és a sík szöge',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = rng.pick(['cm', 'dm', 'm']);
    if (level === 2) {
      const leg = rng.int(2, 15);
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz vetülete $${num(leg)}$ ${unit}, a $B$ pont $${num(leg)}$ ${unit}-re van a síktól. Mekkora szöget zár be a szakasz a síkkal?`,
        figure: projectionFigure({
          projection: leg,
          heightA: 0,
          heightB: leg,
          projLabel: `${num(leg)} ${unit}`,
          bHeightLabel: `${num(leg)} ${unit}`,
          angleLabel: '?',
          alt: 'Az AB szakasz és a vetülete egyenlő befogókkal.',
        }),
        answer: textChoice('$45°$', ['$30°$', '$60°$', '$90°$']),
        hint: 'A derékszögű háromszög két befogója egyenlő. Melyik szög mellett egyenlők a befogók?',
        solution: [
          tex`A $BB_1$ és az $A_1B_1$ befogó egyenlő: $${num(leg)}$ ${unit}.`,
          'Az egyenlőszárú derékszögű háromszög hegyesszögei 45°-osak.',
          'Az $AB$ szakasz és a sík szöge **45°**.',
        ],
      };
    }

    const ab = 2 * rng.int(5, 9);
    const half = ab / 2;
    const other = (ab * Math.sqrt(3)) / 2;
    if (rng.chance(0.5)) {
      return {
        prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz $${num(ab)}$ ${unit}, a $B$ pont $${num(half)}$ ${unit}-re van a síktól. Mekkora szöget zár be a szakasz a síkkal?`,
        figure: projectionFigure({
          projection: other,
          heightA: 0,
          heightB: half,
          abLabel: `${num(ab)} ${unit}`,
          bHeightLabel: `${num(half)} ${unit}`,
          angleLabel: '?',
          alt: 'Az AB szakasz, amelynek a síktól mért távolsága az átfogó fele.',
        }),
        answer: textChoice('$30°$', ['$45°$', '$60°$', '$90°$']),
        hint: 'A $BB_1$ befogó az $AB$ átfogó fele. Melyik szög van a rövidebb befogóval szemben?',
        solution: [
          tex`$BB_1 = ${num(half)} = AB : 2$.`,
          'A 30°-os szögű derékszögű háromszögben a 30°-os szöggel szemközti befogó az átfogó fele.',
          'Ezért az $AB$ szakasz és a sík szöge **30°**.',
        ],
      };
    }
    return {
      prompt: tex`Az $A$ pont a síkon van, az $AB$ szakasz $${num(ab)}$ ${unit}, a vetülete $${num(half)}$ ${unit}. Mekkora szöget zár be a szakasz a síkkal?`,
      figure: projectionFigure({
        projection: half,
        heightA: 0,
        heightB: other,
        abLabel: `${num(ab)} ${unit}`,
        projLabel: `${num(half)} ${unit}`,
        angleLabel: '?',
        alt: 'Az AB szakasz, amelynek a vetülete az átfogó fele.',
      }),
      answer: textChoice('$60°$', ['$30°$', '$45°$', '$90°$']),
      hint: 'A vetület az $AB$ átfogó fele. Melyik szög van a rövidebb befogóval szemben?',
      solution: [
        tex`$A_1B_1 = ${num(half)} = AB : 2$.`,
        'A vetülettel szemközti szög 30°, ezért az $A$ csúcsnál lévő szög 60°.',
        'Az $AB$ szakasz és a sík szöge **60°**.',
      ],
    };
  },
};

/** True/false statements about the three cases and the angle. */
const casesTf: GeneratorDef = {
  id: 'cases-tf',
  title: 'Igaz-hamis állítások a vetületről',
  levels: [1, 2],
  generate(rng, level): Question {
    const statements: { text: string; value: boolean; why: string }[] = [
      { text: 'Ha egy szakasz merőleges a síkra, akkor a vetülete egy pont.', value: true, why: 'A merőleges szakasz minden pontja ugyanabba a pontba vetül.' },
      { text: 'Ha egy szakasz párhuzamos a síkkal, akkor a vetülete ugyanolyan hosszú.', value: true, why: 'A párhuzamos szakasz és a vetülete egy téglalap két oldala.' },
      { text: 'Egy ferde szakasz vetülete mindig hosszabb, mint a szakasz.', value: false, why: 'Ferde szakasznál a vetület rövidebb: ez a befogó, a szakasz az átfogó.' },
      { text: 'A síkra merőleges egyenes vetülete egy pont.', value: true, why: 'A merőleges egyenes minden pontja ugyanabba a pontba vetül.' },
      { text: 'A síkkal párhuzamos egyenes vetülete párhuzamos az egyenessel.', value: true, why: 'A vetület ugyanabba az irányba fut, mint az egyenes.' },
      { text: 'Két különböző pont vetülete lehet ugyanaz a pont.', value: true, why: 'Ha a két pont egy síkra merőleges egyenesen van, ugyanaz a vetületük.' },
      { text: 'A ferde szakasz vetülete rövidebb, mint a szakasz.', value: true, why: 'A vetület az átfogónál rövidebb befogó.' },
      { text: 'A síkkal párhuzamos szakasz vetülete egy pont.', value: false, why: 'A párhuzamos szakasz vetülete ugyanolyan hosszú szakasz.' },
      { text: 'Az egyenes és a sík szöge az egyenes és a vetülete közötti szög.', value: true, why: 'Ez a szög definíciója.' },
      { text: 'A síkra merőleges egyenes és a sík szöge 0°.', value: false, why: 'A merőleges egyenes 90°-os szöget zár be a síkkal.' },
      { text: 'A vetület hossza nem lehet nagyobb, mint a szakasz hossza.', value: true, why: 'A vetület a derékszögű háromszög befogója, a szakasz az átfogója.' },
      { text: 'Az egyenes és a sík szöge nagyobb lehet, mint 90°.', value: false, why: 'Az egyenes és a sík szöge 0° és 90° között van.' },
      { text: 'Egy szakasz vetülete mindig párhuzamos a szakasszal.', value: false, why: 'Csak akkor párhuzamos, ha a szakasz párhuzamos a síkkal.' },
      { text: 'A síkkal párhuzamos egyenes és a sík szöge 0°.', value: true, why: 'A párhuzamos egyenes nem emelkedik ki a síkból, a szög 0°.' },
      { text: 'Két pont vetülete csak akkor lehet ugyanaz, ha a két pont egy síkra merőleges egyenesen van.', value: true, why: 'Ugyanaz a vetület azt jelenti, hogy a két pontot összekötő egyenes merőleges a síkra.' },
      // more level-1 statements (index 15 on)
      { text: 'A síkon lévő pont vetülete önmaga.', value: true, why: 'A síkon lévő pontból nem kell merőlegest bocsátani: a pont a saját vetülete.' },
      { text: 'A síkon fekvő szakasz vetülete önmaga.', value: true, why: 'A szakasz minden pontja a síkon van, ezért mindegyik a saját vetülete.' },
      { text: 'A síkra merőleges szakasz vetülete ugyanolyan hosszú szakasz.', value: false, why: 'A merőleges szakasz vetülete egyetlen pont.' },
      { text: 'Egy pont vetülete mindig egyetlen pont.', value: true, why: 'Egy pontból a síkra pontosan egy merőleges bocsátható, ennek egy talppontja van.' },
    ];
    // level 1: the three cases of a segment; level 2: angles and points, or a statement with numbers
    if (level === 2 && rng.chance(0.5)) {
      const [p, h, c] = rng.pick(TRIPLES);
      const asks = rng.pick(['height', 'projection'] as const);
      const right = asks === 'height' ? h : p;
      const wrong = rng.pick([c - (asks === 'height' ? p : h), right + rng.pick([1, 2]), c]);
      const value = rng.chance(0.5);
      const shown = value ? right : wrong;
      const text =
        asks === 'height'
          ? tex`Az $A$ pont a síkon van, $AB = ${num(c)}$ cm, a vetülete $${num(p)}$ cm. Ekkor a $B$ pont $${num(shown)}$ cm-re van a síktól.`
          : tex`Az $A$ pont a síkon van, $AB = ${num(c)}$ cm, a $B$ pont $${num(h)}$ cm-re van a síktól. Ekkor a vetület $${num(shown)}$ cm.`;
      return {
        prompt: `Igaz vagy hamis?\n\n**${text}**`,
        answer: { type: 'truefalse', value },
        hint: 'A szakasz, a vetülete és a $B$ pont távolsága derékszögű háromszöget alkot; a szakasz az átfogó.',
        solution: [
          asks === 'height'
            ? tex`$BB_1^2 = ${num(c)}^2 - ${num(p)}^2 = ${num(c * c - p * p)}$, így $BB_1 = ${num(h)}$ cm.`
            : tex`$A_1B_1^2 = ${num(c)}^2 - ${num(h)}^2 = ${num(c * c - h * h)}$, így $A_1B_1 = ${num(p)}$ cm.`,
          `Az állítás **${value ? 'igaz' : 'hamis'}**.`,
        ],
      };
    }
    const pool = level === 1 ? statements.slice(0, 8).concat(statements.slice(15)) : statements.slice(8, 15);
    const s = rng.pick(pool);
    return {
      prompt: `Igaz vagy hamis?\n\n**${s.text}**`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át a három esetet: ferde, párhuzamos, merőleges.',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

const BASE_PROJECTION: Record<string, string> = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'A', F: 'B', G: 'C', H: 'D' };

/** Which segment or point is the projection of a highlighted cube segment onto the base? */
const projectionMc: GeneratorDef = {
  id: 'projection-mc',
  title: 'Melyik a vetület?',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      // the parts of the projection drawing: a projected point, the projection, a distance
      const heightA = rng.int(1, 5);
      const heightB = rng.intExcept(1, 6, [heightA]);
      const projection = rng.int(4, 9);
      const figure = projectionFigure({ projection, heightA, heightB, alt: 'Az AB szakasz és a vetülete az α síkon.' });
      const ask = rng.pick(['segment', 'distA', 'distB', 'pointA', 'pointB'] as const);
      const segs = ['$A_1B_1$', '$AB$', '$AA_1$', '$BB_1$'];
      const pts = ['$A_1$', '$B_1$', '$A$', '$B$'];
      const data = {
        segment: { q: 'Melyik szakasz az $AB$ szakasz merőleges vetülete az $\\alpha$ síkon?', correct: segs[0], options: segs, why: 'Az $A$ pont vetülete $A_1$, a $B$ ponté $B_1$, ezért az $AB$ vetülete az $A_1B_1$ szakasz.' },
        distA: { q: 'Melyik szakasz hossza az $A$ pont távolsága az $\\alpha$ síktól?', correct: segs[2], options: segs, why: 'A pont és a sík távolsága a merőleges szakasz hossza: az $A$ pontnál ez az $AA_1$.' },
        distB: { q: 'Melyik szakasz hossza a $B$ pont távolsága az $\\alpha$ síktól?', correct: segs[3], options: segs, why: 'A pont és a sík távolsága a merőleges szakasz hossza: a $B$ pontnál ez a $BB_1$.' },
        pointA: { q: 'Melyik pont az $A$ pont merőleges vetülete az $\\alpha$ síkon?', correct: pts[0], options: pts, why: 'Az $A$ pontból a síkra bocsátott merőleges talppontja $A_1$.' },
        pointB: { q: 'Melyik pont a $B$ pont merőleges vetülete az $\\alpha$ síkon?', correct: pts[1], options: pts, why: 'A $B$ pontból a síkra bocsátott merőleges talppontja $B_1$.' },
      }[ask];
      return {
        prompt: data.q,
        figure,
        answer: textChoice(data.correct, data.options.filter((o) => o !== data.correct)),
        hint: 'A vetületet a pontokból a síkra bocsátott merőlegesek talppontjai adják.',
        solution: [data.why],
      };
    }

    const segmentCases = [
      ['AG', 'AC'],
      ['BH', 'BD'],
      ['CE', 'AC'],
      ['DF', 'BD'],
      ['EF', 'AB'],
      ['FG', 'BC'],
      ['GH', 'CD'],
      ['HE', 'DA'],
      ['AF', 'AB'],
      ['BG', 'BC'],
      ['CH', 'CD'],
      ['DE', 'DA'],
      ['EG', 'AC'],
      ['FH', 'BD'],
      ['AC', 'AC'],
      ['BD', 'BD'],
    ];
    const pointCases = [
      ['AE', 'A'],
      ['BF', 'B'],
      ['CG', 'C'],
      ['DH', 'D'],
    ];
    const usePoint = rng.chance(0.25);
    if (usePoint) {
      const [seg, point] = rng.pick(pointCases);
      const phrase = (p: string) => `${p === 'A' ? 'az' : 'a'} $${p}$ pont`;
      const wrongs = ['A', 'B', 'C', 'D'].filter((p) => p !== point).map(phrase);
      return {
        prompt: tex`A kockában a kiemelt $${seg}$ szakasz merőleges vetülete az $ABCD$ alaplapon melyik pont?`,
        figure: cubeFigure(seg),
        answer: textChoice(phrase(point), wrongs),
        hint: 'A végpontok vetületét keresd! A kocka függőleges élei merőlegesek az alaplapra.',
        solution: [
          tex`${Article(seg[0])} $${seg[0]}$ pont az alaplapon van, a vetülete önmaga.`,
          tex`${Article(seg[1])} $${seg[1]}$ pont vetülete az alaplapon $${BASE_PROJECTION[seg[1]]}$.`,
          tex`Ezért ${article(seg)} $${seg}$ szakasz vetülete ${article(point)} $${point}$ pont.`,
        ],
      };
    }

    const [seg, proj] = rng.pick(segmentCases);
    // segments of the base, each once (AD and DA are the same segment)
    const same = (x: string, y: string) => [...x].sort().join('') === [...y].sort().join('');
    const wrongPool = ['AC', 'BD', 'AB', 'BC', 'CD', 'DA'];
    const wrongs = rng.sample(wrongPool.filter((s) => !same(s, proj)), 3).map((s) => `$${s}$`);
    return {
      prompt: tex`A kockában a kiemelt $${seg}$ szakasz merőleges vetülete az $ABCD$ alaplapon melyik szakasz?`,
      figure: cubeFigure(seg),
      answer: textChoice(`$${proj}$`, wrongs),
      hint: 'A végpontok vetületét keresd! A kocka függőleges élei merőlegesek az alaplapra.',
      solution: [
        tex`${Article(seg[0])} $${seg[0]}$ pont vetülete az alaplapon $${BASE_PROJECTION[seg[0]]}$, ${article(seg[1])} $${seg[1]}$ ponté $${BASE_PROJECTION[seg[1]]}$.`,
        tex`Ezért ${article(seg)} $${seg}$ szakasz vetülete ${article(proj)} $${proj}$ szakasz.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 4. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-pont-egyenes-sik-02',
  goals: [
    'megszerkeszteni egy pont és egy szakasz merőleges vetületét a síkon,',
    'felismerni a ferde, a párhuzamos és a merőleges szakasz vetületét,',
    'kiszámítani a vetület vagy a szakasz hosszát Pitagorasz tételével,',
    'meghatározni az egyenes és a sík szögét.',
  ],
  parts: [
    {
      title: 'Vetítés a síkra',
      steps: [
        {
          type: 'theory',
          title: 'A merőleges vetület',
          body: 'Egy pont vetülete a síkon a pontból a síkra bocsátott merőleges talppontja. A szakasz vetülete a két végpont vetületét összekötő szakasz.',
          figure: theoryFigure,
          remember: 'vetület = a merőleges talppontok összekötése',
        },
        {
          type: 'theory',
          title: 'Három eset',
          body: 'Ferde szakasznál a vetület rövidebb. Párhuzamosnál ugyanolyan hosszú. Ha a szakasz merőleges a síkra, a vetülete egyetlen pont.',
          remember: 'ferde → rövidebb · párhuzamos → egyenlő · merőleges → pont',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**Ha egy szakasz merőleges a síkra, akkor a vetülete egy pont.**',
            figure: perpendicularFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg az ábrát: hová vetülnek a szakasz pontjai?',
            solution: ['A merőleges szakasz minden pontja ugyanabba a pontba vetül.', 'Az állítás **igaz**.'],
          },
        },
        { type: 'practice', generator: 'cases-tf', level: 1, count: 2 },
        { type: 'practice', generator: 'projection-mc', level: 1 },
      ],
    },
    {
      title: 'A vetület hossza',
      steps: [
        {
          type: 'theory',
          title: 'Derékszögű háromszög',
          body: 'Ha az A pont a síkon van, akkor az AB szakasz, a BB₁ merőleges szakasz és az A₁B₁ vetület derékszögű háromszöget alkot.',
          figure: projectionFigure({
            projection: 5,
            heightA: 0,
            heightB: 4,
            abLabel: 'AB',
            bHeightLabel: 'BB₁',
            projLabel: 'A₁B₁',
            alt: 'Derékszögű háromszög az AB szakasszal és A₁B₁ vetületével.',
          }),
          remember: '$AB^2 = A_1B_1^2 + BB_1^2$',
        },
        {
          type: 'example',
          title: 'A vetület kiszámítása',
          problem: 'Az $AB$ szakasz $13$ cm, a $B$ pont $5$ cm-re van a síktól. Milyen hosszú a vetülete?',
          figure: projectionFigure({
            projection: 12,
            heightA: 0,
            heightB: 5,
            abLabel: '13 cm',
            bHeightLabel: '5 cm',
            projLabel: '?',
          }),
          steps: [
            { text: '$AB^2 = A_1B_1^2 + BB_1^2$' },
            { text: '$169 = A_1B_1^2 + 25$' },
            { text: '$A_1B_1^2 = 144$, ezért $A_1B_1 = 12$ cm.' },
          ],
          answer: 'A vetület **12 cm** hosszú.',
        },
        { type: 'practice', generator: 'projection-length', level: 1, count: 2 },
        { type: 'practice', generator: 'projection-length', level: 2 },
        { type: 'practice', generator: 'segment-length', level: 1 },
      ],
    },
    {
      title: 'Szög a síkkal',
      steps: [
        {
          type: 'theory',
          title: 'Az egyenes és a sík szöge',
          body: 'Az egyenes és a sík szöge az egyenes és a merőleges vetülete közötti szög. A derékszögű háromszögben ez az $A$ csúcsnál van.',
          figure: projectionFigure({
            projection: 6,
            heightA: 0,
            heightB: 4,
            abLabel: 'AB',
            bHeightLabel: 'BB₁',
            projLabel: 'A₁B₁',
            angleLabel: '?',
            alt: 'Az AB szakasz és a vetülete közötti szög az α síkon.',
          }),
          remember: 'szög = az egyenes és a vetülete között',
        },
        {
          type: 'example',
          title: '45°-os eset',
          problem: 'Az $AB$ szakasz vetülete $5$ cm, a $B$ pont $5$ cm-re van a síktól. Mekkora szöget zár be a szakasz a síkkal?',
          figure: projectionFigure({
            projection: 5,
            heightA: 0,
            heightB: 5,
            projLabel: '5 cm',
            bHeightLabel: '5 cm',
            angleLabel: '?',
          }),
          steps: [
            { text: 'A $BB_1$ és az $A_1B_1$ befogó egyenlő: $5$ cm.' },
            { text: 'A derékszögű háromszög egyenlőszárú.' },
            { text: 'A hegyesszögek 45°-osak.' },
          ],
          answer: 'A szög **45°**.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mekkora szöget zár be a síkkal egy a síkra merőleges egyenes?',
            figure: perpendicularFigure,
            answer: textChoice('$90°$', ['$0°$', '$45°$', '$180°$']),
            hint: 'A merőleges egyenes a síkra merőlegesen áll.',
            solution: ['A merőleges egyenes 90°-os szöget zár be a síkkal.', 'Ezért a válasz **90°**.'],
          },
        },
        { type: 'practice', generator: 'angle', level: 2 },
        { type: 'practice', generator: 'projection-length', level: 3 },
        { type: 'practice', generator: 'angle', level: 3 },
      ],
    },
    {
      title: 'Két pont a sík felett',
      steps: [
        {
          type: 'theory',
          title: 'Különböző magasságok',
          body: 'Ha a két végpont a sík ugyanazon oldalán van, a függőleges befogó a két távolság különbsége.',
          figure: bothFigure,
          remember: '$AB^2 = A_1B_1^2 + (d_A - d_B)^2$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Az $A$ és $B$ pont a sík ugyanazon oldalán van, távolságuk $d_A$ és $d_B$, a vetületük $p$. Melyik képlet adja meg az $AB$ hosszát?',
            answer: textChoice('$AB^2 = p^2 + (d_A - d_B)^2$', ['$AB^2 = p^2 + (d_A + d_B)^2$', '$AB^2 = p^2 + d_A^2 + d_B^2$', '$AB = p + |d_A - d_B|$']),
            hint: 'A két pont magasságkülönbsége a függőleges befogó.',
            solution: [
              'A vetület és a magasságkülönbség a két befogó.',
              'Ezért $AB^2 = p^2 + (d_A - d_B)^2$.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Két magasság',
          problem: 'Az $A$ és $B$ pont ugyanazon oldalon $7$ cm, illetve $2$ cm-re van a síktól; vetületük $12$ cm. Milyen hosszú $AB$?',
          figure: bothFigure,
          steps: [
            { text: 'A magasságok különbsége: $7 - 2 = 5$ cm.' },
            { text: '$AB^2 = 12^2 + 5^2 = 144 + 25 = 169$.' },
            { text: '$AB = 13$ cm.' },
          ],
          answer: 'Az $AB$ szakasz **13 cm** hosszú.',
        },
        { type: 'practice', generator: 'segment-length', level: 2, count: 2 },
        { type: 'practice', generator: 'segment-length', level: 3 },
        { type: 'practice', generator: 'projection-mc', level: 2 },
      ],
    },
  ],
  generators: [projectionLength, segmentLength, angle, casesTf, projectionMc],
  miniTest: {
    items: [
      { generator: 'projection-mc', level: 1 },
      { generator: 'projection-length', level: 1 },
      { generator: 'segment-length', level: 1 },
      { generator: 'cases-tf', level: 2 },
      { generator: 'angle', level: 2 },
      { generator: 'segment-length', level: 2 },
      { generator: 'projection-length', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'projection-mc', level: 1 },
    { generator: 'projection-length', level: 1 },
    { generator: 'segment-length', level: 1 },
    { generator: 'cases-tf', level: 1 },
    { generator: 'angle', level: 2 },
    { generator: 'segment-length', level: 3 },
  ],
});
