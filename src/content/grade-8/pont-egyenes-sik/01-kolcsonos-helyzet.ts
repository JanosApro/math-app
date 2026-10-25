/**
 * 8. osztály › Pont, egyenes és sík › 1. A pont, az egyenes és a sík kölcsönös helyzete
 *
 * Spatial relations on a labelled cube/cuboid: incidence (∈, ∉, ⊂), parallel / intersecting /
 * skew lines, line–plane and plane–plane relations, planes determined by points, and the
 * distance of a point from a plane. Every figure is built from the same coordinates as the
 * question; the cube is drawn in the usual oblique projection with the hidden edges dashed.
 */
import {
  defineSubtopic,
  num,
  tex,
  texRoot,
  textChoice,
  type FigColor,
  type Figure,
  type GeneratorDef,
  type GeoItem,
  type Question,
  type XY,
  article,
  Article,
} from '../../../kit';

// ---------------------------------------------------------------------------------------------
// 1. Helpers: a labelled cube/cuboid
// ---------------------------------------------------------------------------------------------

type V3 = [number, number, number];

/** Vertices of the unit cube in the usual A–D bottom, E–H top order. */
const UNIT: Record<string, V3> = {
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
const CUBE_HIDDEN = new Set(['AD', 'DC', 'DH']);

/** The 12 face diagonals and 4 space diagonals of the cube. */
const FACE_DIAGONALS = ['AC', 'BD', 'EG', 'FH', 'AF', 'BE', 'BG', 'CF', 'CH', 'DG', 'AH', 'DE'];
const SPACE_DIAGONALS = ['AG', 'BH', 'CE', 'DF'];
const DIAGONALS = [...FACE_DIAGONALS, ...SPACE_DIAGONALS];
const ALL_SEGMENTS = [...CUBE_EDGES, ...DIAGONALS];

/** A segment is named by its two endpoints, e.g. 'AG'. */
const ends = (s: string): [string, string] => [s[0], s[1]];

/** Planes of the cube given by four coplanar vertices in boundary order. */
const PLANES: Record<string, string[]> = {
  ABCD: ['A', 'B', 'C', 'D'],
  EFGH: ['E', 'F', 'G', 'H'],
  ABFE: ['A', 'B', 'F', 'E'],
  BCGF: ['B', 'C', 'G', 'F'],
  DCGH: ['D', 'C', 'G', 'H'],
  ADHE: ['A', 'D', 'H', 'E'],
  ACGE: ['A', 'C', 'G', 'E'],
  BDFH: ['B', 'D', 'H', 'F'],
  ABGH: ['A', 'B', 'G', 'H'],
  CDEF: ['C', 'D', 'E', 'F'],
};

/** Hungarian article for a letter name (A = á → az, B = bé → a, …). */
const VOWEL_LETTERS = new Set(['A', 'E', 'F', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'U', 'X', 'Y']);
const art = (name: string) => (VOWEL_LETTERS.has(name[0].toUpperCase()) ? 'az' : 'a');

interface CubeOptions {
  /** Edge lengths along x, y and z. Default 1. */
  a?: number;
  b?: number;
  c?: number;
  /** Extra segments to draw over the cube, e.g. a diagonal or a highlighted edge. */
  segments?: { from: string; to: string; color?: FigColor; dashed?: boolean; width?: 'thin' | 'normal' | 'thick' }[];
  /** Shaded planes, given by vertex names in boundary order. */
  planes?: { points: string[]; fill: FigColor }[];
  /** Points not at a cube vertex (e.g. the centre O of the base). */
  extraPoints?: Record<string, V3>;
  /** Right-angle markers: at `vertex`, between the rays to `from` and `to`. */
  rightAngles?: { vertex: string; from: string; to: string; color?: FigColor }[];
  caption?: string;
  alt?: string;
}

/**
 * An oblique drawing of a labelled cuboid. x runs right, z runs up, y goes back up-right;
 * edges adjacent to the hidden back-bottom-left vertex D are dashed.
 */
function cubeFigure(opts: CubeOptions = {}): Figure {
  const a = opts.a ?? 1;
  const b = opts.b ?? a;
  const c = opts.c ?? a;
  const geom: Record<string, V3> = {
    A: [0, 0, 0],
    B: [a, 0, 0],
    C: [a, b, 0],
    D: [0, b, 0],
    E: [0, 0, c],
    F: [a, 0, c],
    G: [a, b, c],
    H: [0, b, c],
    ...opts.extraPoints,
  };
  const project = ([x, y, z]: V3): XY => [4 * x + 1.6 * y, 4 * z + 1.6 * y];
  const points: Record<string, XY> = Object.fromEntries(Object.entries(geom).map(([k, v]) => [k, project(v)]));

  const labelDir: Record<string, 'sw' | 'se' | 'e' | 'w' | 'nw' | 'ne' | 's' | 'n'> = {
    A: 'sw',
    B: 'se',
    C: 'e',
    D: 'w',
    E: 'nw',
    F: 'ne',
    G: 'e',
    H: 'w',
  };

  const items: GeoItem[] = [];

  for (const plane of opts.planes ?? []) {
    items.push({ kind: 'region', points: plane.points, fill: plane.fill });
    // A thin outline makes diagonal planes readable even where the region is pale.
    for (let i = 0; i < plane.points.length; i++) {
      items.push({
        kind: 'segment',
        from: plane.points[i],
        to: plane.points[(i + 1) % plane.points.length],
        color: plane.fill,
        width: 'thin',
      });
    }
  }

  for (const edge of CUBE_EDGES) {
    const [from, to] = ends(edge);
    items.push({ kind: 'segment', from, to, dashed: CUBE_HIDDEN.has(edge), color: 'ink', width: 'normal' });
  }

  for (const s of opts.segments ?? []) {
    items.push({
      kind: 'segment',
      from: s.from,
      to: s.to,
      dashed: s.dashed,
      color: s.color ?? 'highlight',
      width: s.width ?? 'thick',
    });
  }

  for (const angle of opts.rightAngles ?? []) {
    items.push({ kind: 'angle', vertex: angle.vertex, from: angle.from, to: angle.to, right: true, color: angle.color });
  }

  for (const name of Object.keys(points)) {
    items.push({ kind: 'point', at: name, labelDir: labelDir[name] ?? 's' });
  }

  return {
    type: 'geometry',
    points,
    items,
    caption: opts.caption,
    alt: opts.alt,
  };
}

// ---------------------------------------------------------------------------------------------
// 2. 3D line geometry
// ---------------------------------------------------------------------------------------------

const sub = (p: V3, q: V3): V3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const norm2 = (p: V3) => dot(p, p);
const EPS = 1e-9;

/** A point of the unit cube. */
const u = (name: string): V3 => UNIT[name];

/** A segment of the unit cube. */
const seg = (name: string): [V3, V3] => {
  const [from, to] = ends(name);
  return [u(from), u(to)];
};

type LineRelation = 'parallel' | 'intersect' | 'skew';

/** Relation of two distinct lines through the cube vertices. */
function lineRelation(p1: V3, p2: V3, q1: V3, q2: V3): LineRelation {
  const d1 = sub(p2, p1);
  const d2 = sub(q2, q1);
  const n = cross(d1, d2);
  if (norm2(n) < EPS) return 'parallel';
  if (Math.abs(dot(sub(q1, p1), n)) > EPS) return 'skew';
  return 'intersect';
}

/** True if the two intersecting lines are perpendicular. */
function linesPerpendicular(p1: V3, p2: V3, q1: V3, q2: V3): boolean {
  return Math.abs(dot(sub(p2, p1), sub(q2, q1))) < EPS;
}

type LinePlaneRelation = 'lies' | 'parallel' | 'intersect' | 'perp';

/** Relation of a line and a plane given by three non-collinear points. */
function linePlaneRelation(line: string, plane: string[]): LinePlaneRelation {
  const [p1, p2] = seg(line);
  const q1 = u(plane[0]);
  const q2 = u(plane[1]);
  const q3 = u(plane[2]);
  const n = cross(sub(q2, q1), sub(q3, q1));
  const d = sub(p2, p1);
  const in1 = Math.abs(dot(n, sub(p1, q1))) < EPS;
  const in2 = Math.abs(dot(n, sub(p2, q1))) < EPS;
  if (in1 && in2) return 'lies';
  if (Math.abs(dot(n, d)) < EPS) return 'parallel';
  return norm2(cross(n, d)) < EPS ? 'perp' : 'intersect';
}

type PlanePlaneRelation = 'parallel' | 'intersect' | 'perp';

/** Relation of two distinct planes of the cube. */
function planePlaneRelation(p1: string[], p2: string[]): PlanePlaneRelation {
  const n1 = cross(sub(u(p1[1]), u(p1[0])), sub(u(p1[2]), u(p1[0])));
  const n2 = cross(sub(u(p2[1]), u(p2[0])), sub(u(p2[2]), u(p2[0])));
  if (norm2(cross(n1, n2)) < EPS) return 'parallel';
  return Math.abs(dot(n1, n2)) < EPS ? 'perp' : 'intersect';
}

const REL_TEXT: Record<LineRelation, string> = {
  parallel: 'párhuzamos',
  intersect: 'metsző',
  skew: 'kitérő',
};

const LP_TEXT: Record<LinePlaneRelation, string> = {
  lies: 'illeszkedik a síkra',
  parallel: 'párhuzamos a síkkal',
  intersect: 'metszi a síkot, de nem merőlegesen',
  perp: 'merőleges a síkra',
};

const PP_TEXT: Record<PlanePlaneRelation, string> = {
  parallel: 'párhuzamos',
  intersect: 'metsző, de nem merőleges',
  perp: 'merőleges',
};

// ---------------------------------------------------------------------------------------------
// 3. Static figures
// ---------------------------------------------------------------------------------------------

const incidenceFigure: Figure = {
  type: 'geometry',
  points: { A: [1, 1], B: [5, 1], C: [6.5, 2.2], D: [4, 4.7], P1: [0, 0], P2: [8, 0], P3: [9.5, 3], P4: [1.5, 3] },
  items: [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'muted', vertexLabels: false },
    { kind: 'label', at: [7.8, 2.2], text: 'α', size: 'large' },
    { kind: 'line', through: ['A', 'B'], label: 'p' },
    { kind: 'point', at: 'A', labelDir: 's' },
    { kind: 'point', at: 'B', labelDir: 's' },
    { kind: 'point', at: 'C', labelDir: 'e' },
    { kind: 'point', at: 'D', labelDir: 'n' },
  ],
  caption: 'A és B a p egyenesen, C a síkban, D a síkon kívül van.',
};

const planeDeterminationFigure: Figure = {
  type: 'geometry',
  points: { A: [1, 0.8], B: [6, 0.8], C: [4, 3.2], P1: [0, 0], P2: [8, 0], P3: [9, 4], P4: [1, 4] },
  items: [
    { kind: 'polygon', points: ['P1', 'P2', 'P3', 'P4'], fill: 'muted', vertexLabels: false },
    { kind: 'label', at: [7.5, 3.2], text: 'α', size: 'large' },
    { kind: 'point', at: 'A', labelDir: 'sw' },
    { kind: 'point', at: 'B', labelDir: 'se' },
    { kind: 'point', at: 'C', labelDir: 'n' },
  ],
  caption: 'A három pont nincs egy egyenesen, ezért egy síkot határoz meg.',
};

const twoLinesFigure = cubeFigure({
  a: 4,
  segments: [
    { from: 'A', to: 'B', color: 'blue' },
    { from: 'C', to: 'G', color: 'highlight' },
  ],
  alt: 'Kocka az AB és a CG éllel kiemelve.',
});

const linePlaneFigure = cubeFigure({
  a: 4,
  planes: [{ points: PLANES.ABCD, fill: 'blue' }],
  segments: [{ from: 'A', to: 'E', color: 'highlight' }],
  rightAngles: [{ vertex: 'A', from: 'E', to: 'B' }],
  alt: 'Kocka az ABCD alaplappal és az AE éllel.',
});

const twoPlanesFigure = cubeFigure({
  a: 4,
  planes: [
    { points: PLANES.ABCD, fill: 'blue' },
    { points: PLANES.ABFE, fill: 'orange' },
  ],
  segments: [{ from: 'A', to: 'B', color: 'highlight' }],
  alt: 'Kocka az ABCD és az ABFE lap síkjával.',
});

const distanceFigure = cubeFigure({
  a: 4,
  planes: [{ points: PLANES.ABCD, fill: 'blue' }],
  segments: [{ from: 'G', to: 'C', color: 'highlight' }],
  alt: 'Kocka a G csúccsal és a GC merőleges szakasszal.',
});

// ---------------------------------------------------------------------------------------------
// 4. Generators
// ---------------------------------------------------------------------------------------------

/** Relation of two highlighted lines of the cube. L2 asks for the number of common points. */
const cubeRelation: GeneratorDef = {
  id: 'cube-relation',
  title: 'Két kiemelt egyenes helyzete a kockán',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    let first: string;
    let second: string;
    if (level === 3) {
      first = rng.pick(DIAGONALS);
      second = rng.pick(ALL_SEGMENTS.filter((s) => s !== first));
    } else {
      // L1 and L2 use edges only: in the usual cube drawing skew edges never look intersecting.
      [first, second] = rng.sample(CUBE_EDGES, 2);
    }
    const [p1, p2] = seg(first);
    const [q1, q2] = seg(second);
    const rel = lineRelation(p1, p2, q1, q2);
    const perp = rel === 'intersect' && linesPerpendicular(p1, p2, q1, q2);
    const figure = cubeFigure({
      a: 4,
      segments: [
        { from: first[0], to: first[1], color: 'blue' },
        { from: second[0], to: second[1], color: 'highlight' },
      ],
      caption: level === 3 ? 'A rajz csak szemléltet.' : undefined,
      alt: `Kocka a kiemelt ${first} és ${second} egyenessel.`,
    });

    if (level === 2) {
      const correct =
        rel === 'parallel'
          ? `$${first} \\parallel ${second}$`
          : rel === 'intersect'
            ? `$${first} \\perp ${second}$`
            : `$${first}$ és $${second}$ kitérő`;
      const wrongs =
        rel === 'parallel'
          ? [`$${first} \\perp ${second}$`, `$${first} \\subset ${second}$`, `$${first}$ és $${second}$ kitérő`]
          : rel === 'intersect'
            ? [`$${first} \\parallel ${second}$`, `$${first} \\subset ${second}$`, `$${first}$ és $${second}$ kitérő`]
            : [`$${first} \\parallel ${second}$`, `$${first} \\perp ${second}$`, `$${first} \\subset ${second}$`];
      return {
        prompt: 'Melyik írja le helyesen a kiemelt két él helyzetét?',
        figure,
        answer: textChoice(correct, wrongs),
        hint: 'Használd a párhuzamosság, a merőlegesség vagy a kitérő jelölését!',
        solution: [
          rel === 'parallel'
            ? tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ él párhuzamos: $${first} \parallel ${second}$.`
            : rel === 'intersect'
              ? tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ él a közös csúcsban derékszögben találkozik: $${first} \perp ${second}$.`
              : tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ él kitérő: nincs közös pontjuk, és nem is párhuzamosak.`,
          'A többi jelölés nem írja le helyesen a két él viszonyát.',
        ],
      };
    }

    const wrongs = (Object.keys(REL_TEXT) as LineRelation[]).filter((r) => r !== rel).map((r) => REL_TEXT[r]);
    return {
      prompt: tex`Az ábrán kiemelt két egyenes: $${first}$ és $${second}$. Milyen a helyzetük?`,
      figure,
      answer: textChoice(REL_TEXT[rel], wrongs),
      hint: 'Nézd meg, van-e közös pontjuk, és hogy egy síkban vannak-e!',
      solution: [
        rel === 'parallel'
          ? tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ egyenes egy síkban van, és nincs közös pontjuk.`
          : rel === 'skew'
            ? tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ egyenes nincs egy síkban, és nincs közös pontjuk.`
            : tex`${Article(first)} $${first}$ és ${article(second)} $${second}$ egyenesnek pontosan egy közös pontja van.`,
        rel === 'parallel'
          ? 'Ezért a két egyenes **párhuzamos**.'
          : rel === 'skew'
            ? 'Ezért a két egyenes **kitérő**.'
            : perp
              ? 'Ezért a két egyenes **metsző**, ráadásul **merőleges**.'
              : 'Ezért a két egyenes **metsző**.',
      ],
    };
  },
};

/** "a" or "az" before a lower-case line name or a Greek plane name: az e, az f, a p, az α, a β. */
const artName = (x: string) => (/^([aefilmnorsxy]|\\alpha)/.test(x) ? 'az' : 'a');

/** The correct mathematical notation of an incidence / parallelism / perpendicularity. */
const symbols: GeneratorDef = {
  id: 'symbols',
  title: 'Illeszkedés, párhuzamosság és merőlegesség jelölése',
  levels: [1, 2],
  generate(rng, level): Question {
    // level 1: a point and a line or plane (∈, ∉); level 2: two lines, a line and a plane, two planes
    const P = rng.pick(['A', 'B', 'C', 'P', 'Q', 'R']);
    const [l, m] = rng.sample(['p', 'q', 'e', 'f', 'g'], 2);
    const [al, be] = rng.sample(['\\alpha', '\\beta', '\\gamma', '\\sigma'], 2);
    const basic = ['in-line', 'notin-line', 'in-plane', 'notin-plane'] as const;
    const more = ['line-in-plane', 'parallel-lines', 'perp-lines', 'parallel-line-plane', 'perp-line-plane', 'parallel-planes', 'perp-planes'] as const;
    const kind = level === 1 ? rng.pick(basic) : rng.pick(more);
    const A = `${article(P)} $${P}$ pont`;
    const L = `${artName(l)} $${l}$ egyenes`;
    const M = `${artName(m)} $${m}$ egyenes`;
    const S1 = (suffixed: string) => `${artName(al)} $${al}$ ${suffixed}`;
    const S2 = (suffixed: string) => `${artName(be)} $${be}$ ${suffixed}`;
    const data: Record<(typeof basic)[number] | (typeof more)[number], { what: string; correct: string; wrongs: string[]; why: string[] }> = {
      'in-line': {
        what: `${A} illeszkedik ${artName(l)} $${l}$ egyenesre`,
        correct: `$${P} \\in ${l}$`,
        wrongs: [`$${P} \\notin ${l}$`, `$${l} \\in ${P}$`, `$${P} \\subset ${l}$`],
        why: [`Az illeszkedés jele a $\\in$: $${P} \\in ${l}$.`, 'A $\\subset$ a részhalmaz jele, például egyenes és sík között.'],
      },
      'notin-line': {
        what: `${A} nem illeszkedik ${artName(l)} $${l}$ egyenesre`,
        correct: `$${P} \\notin ${l}$`,
        wrongs: [`$${P} \\in ${l}$`, `$${l} \\notin ${P}$`, `$${P} \\not\\subset ${l}$`],
        why: [`A nem illeszkedés jele a $\\notin$: $${P} \\notin ${l}$.`, `A $${P} \\in ${l}$ éppen az ellenkezőjét jelenti.`],
      },
      'in-plane': {
        what: `${A} illeszkedik ${S1('síkra')}`,
        correct: `$${P} \\in ${al}$`,
        wrongs: [`$${P} \\notin ${al}$`, `$${al} \\in ${P}$`, `$${P} \\subset ${al}$`],
        why: [`A pont és a sík illeszkedését is a $\\in$ jelöli: $${P} \\in ${al}$.`, 'A $\\subset$ jelet egyenes és sík viszonyára használjuk.'],
      },
      'notin-plane': {
        what: `${A} nincs rajta ${S1('síkon')}`,
        correct: `$${P} \\notin ${al}$`,
        wrongs: [`$${P} \\in ${al}$`, `$${al} \\notin ${P}$`, `$${P} \\not\\subset ${al}$`],
        why: [`A nem illeszkedés jele a $\\notin$: $${P} \\notin ${al}$.`, `A $${P} \\in ${al}$ azt jelentené, hogy a pont a síkon van.`],
      },
      'line-in-plane': {
        what: `${L} illeszkedik ${S1('síkra')}`,
        correct: `$${l} \\subset ${al}$`,
        wrongs: [`$${l} \\in ${al}$`, `$${l} \\parallel ${al}$`, `$${al} \\subset ${l}$`],
        why: [`Ha az egyenes minden pontja a síkon van, akkor $${l} \\subset ${al}$.`, `A $${l} \\parallel ${al}$ azt jelentené, hogy nincs közös pontjuk.`],
      },
      'parallel-lines': {
        what: `${L} párhuzamos ${artName(m)} $${m}$ egyenessel`,
        correct: `$${l} \\parallel ${m}$`,
        wrongs: [`$${l} \\perp ${m}$`, `$${l} \\subset ${m}$`, `$${l} \\in ${m}$`],
        why: [`A párhuzamosság jele a $\\parallel$: $${l} \\parallel ${m}$.`, 'A $\\perp$ a merőlegességet jelöli.'],
      },
      'perp-lines': {
        what: `${L} merőleges ${artName(m)} $${m}$ egyenesre`,
        correct: `$${l} \\perp ${m}$`,
        wrongs: [`$${l} \\parallel ${m}$`, `$${l} \\subset ${m}$`, `$${l} \\in ${m}$`],
        why: [`A merőlegesség jele a $\\perp$: $${l} \\perp ${m}$.`, 'A $\\parallel$ a párhuzamosságot jelöli.'],
      },
      'parallel-line-plane': {
        what: `${L} párhuzamos ${S1('síkkal')}`,
        correct: `$${l} \\parallel ${al}$`,
        wrongs: [`$${l} \\perp ${al}$`, `$${l} \\subset ${al}$`, `$${l} \\in ${al}$`],
        why: [`Egyenes és sík párhuzamossága: $${l} \\parallel ${al}$.`, `A $${l} \\subset ${al}$ azt jelenti, hogy az egyenes a síkon fekszik.`],
      },
      'perp-line-plane': {
        what: `${L} merőleges ${S1('síkra')}`,
        correct: `$${l} \\perp ${al}$`,
        wrongs: [`$${l} \\parallel ${al}$`, `$${l} \\subset ${al}$`, `$${l} \\notin ${al}$`],
        why: [`Egyenes és sík merőlegessége: $${l} \\perp ${al}$.`, `A $${l} \\parallel ${al}$ párhuzamosságot jelent.`],
      },
      'parallel-planes': {
        what: `${S1('sík')} párhuzamos ${S2('síkkal')}`,
        correct: `$${al} \\parallel ${be}$`,
        wrongs: [`$${al} \\perp ${be}$`, `$${al} \\subset ${be}$`, `$${al} \\in ${be}$`],
        why: [`Két sík párhuzamossága: $${al} \\parallel ${be}$.`, 'A $\\perp$ itt merőlegességet jelentene.'],
      },
      'perp-planes': {
        what: `${S1('sík')} merőleges ${S2('síkra')}`,
        correct: `$${al} \\perp ${be}$`,
        wrongs: [`$${al} \\parallel ${be}$`, `$${al} \\subset ${be}$`, `$${al} \\in ${be}$`],
        why: [`Két sík merőlegessége: $${al} \\perp ${be}$.`, 'A $\\parallel$ párhuzamosságot jelent.'],
      },
    };
    const d = data[kind];
    return {
      prompt: `Melyik jelölés fejezi ki, hogy ${d.what}?`,
      answer: textChoice(d.correct, d.wrongs),
      hint: 'Keresd meg a megfelelő jelet: illeszkedés, párhuzamosság vagy merőlegesség.',
      solution: d.why,
    };
  },
};

/** Line–plane and plane–plane relations, mostly on the cube. */
const linePlane: GeneratorDef = {
  id: 'line-plane',
  title: 'Egyenes és sík, illetve két sík helyzete',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const lineCasesL1: [string, string][] = [
      ['AB', 'ABCD'],
      ['AB', 'EFGH'],
      ['AB', 'BCGF'],
      ['AE', 'ABCD'],
      ['AE', 'BCGF'],
      ['AC', 'ABCD'],
      ['AC', 'EFGH'],
      ['AC', 'BCGF'],
      ['BD', 'ABCD'],
      ['BD', 'EFGH'],
      ['BD', 'ABFE'],
    ];
    // level 2 adds the space diagonal and the hidden faces; it does not repeat level 1
    const lineCasesL2: [string, string][] = [
      ['AG', 'ABCD'],
      ['AG', 'EFGH'],
      ['AG', 'ABFE'],
      ['AG', 'BCGF'],
      ['AB', 'DCGH'],
      ['AB', 'ADHE'],
      ['AE', 'EFGH'],
      ['AC', 'ABFE'],
      ['CD', 'ABFE'],
    ];
    const lineCasesL3: [string, string][] = [
      ['AG', 'BDFH'],
      ['AC', 'BDFH'],
      ['BD', 'ACGE'],
      ['AG', 'ACGE'],
      ['BH', 'BDFH'],
      ['CE', 'ACGE'],
      ['DF', 'BDFH'],
      ['AG', 'CDEF'],
      ['EH', 'ACGE'],
      ['FG', 'BDFH'],
      ['BC', 'ADHE'],
      ['CD', 'ABFE'],
    ];
    const planeCasesL2: [string, string][] = [
      ['ABCD', 'EFGH'],
      ['ABCD', 'ABFE'],
      ['ABFE', 'DCGH'],
      ['ABFE', 'BCGF'],
      ['ABCD', 'BDFH'],
      ['ABFE', 'BDFH'],
    ];
    const planeCasesL3: [string, string][] = [
      ['ACGE', 'BDFH'],
      ['ACGE', 'ABGH'],
      ['BDFH', 'ABGH'],
      ['ACGE', 'CDEF'],
      ['ABGH', 'CDEF'],
      ['ABCD', 'ACGE'],
      ['EFGH', 'BDFH'],
    ];

    const usePlane =
      level === 2 ? rng.chance(0.35) : level === 3 ? rng.chance(0.4) : false;
    if (usePlane) {
      const pool = level === 2 ? planeCasesL2 : planeCasesL3;
      const [p1, p2] = rng.pick(pool);
      const rel = planePlaneRelation(PLANES[p1], PLANES[p2]);
      const wrongs = (Object.keys(PP_TEXT) as PlanePlaneRelation[]).filter((r) => r !== rel).map((r) => PP_TEXT[r]);
      wrongs.push('egybeeső');
      return {
        prompt: tex`Az ábrán kiemelt $${p1}$ és $${p2}$ síkok. Milyen a helyzetük?`,
        figure: cubeFigure({
          a: 4,
          planes: [
            { points: PLANES[p1], fill: 'blue' },
            { points: PLANES[p2], fill: 'orange' },
          ],
          alt: `Kocka a kiemelt ${p1} és ${p2} síkkal.`,
        }),
        answer: textChoice(PP_TEXT[rel], wrongs),
        hint: 'Nézd meg, van-e közös egyenesük, és hogy a metszésvonalra merőlegesek-e a síkok!',
        solution: [
          rel === 'parallel'
            ? tex`${Article(p1)} $${p1}$ és ${article(p2)} $${p2}$ síknak nincs közös pontja.`
            : rel === 'perp'
              ? tex`${Article(p1)} $${p1}$ és ${article(p2)} $${p2}$ sík egy egyenesben metszi egymást, és a metszésvonalra merőlegesek.`
              : tex`${Article(p1)} $${p1}$ és ${article(p2)} $${p2}$ sík egy egyenesben metszi egymást, de nem merőlegesek.`,
          rel === 'parallel'
            ? 'Ezért a két sík **párhuzamos**.'
            : rel === 'perp'
              ? 'Ezért a két sík **merőleges**.'
              : 'Ezért a két sík **metsző, de nem merőleges**.',
        ],
      };
    }

    const pool = level === 1 ? lineCasesL1 : level === 2 ? lineCasesL2 : lineCasesL3;
    const [line, plane] = rng.pick(pool);
    const rel = linePlaneRelation(line, PLANES[plane]);
    const wrongs = (Object.keys(LP_TEXT) as LinePlaneRelation[]).filter((r) => r !== rel).map((r) => LP_TEXT[r]);
    return {
      prompt: tex`Az ábrán kiemelt $${line}$ egyenes és $${plane}$ sík. Milyen a helyzetük?`,
      figure: cubeFigure({
        a: 4,
        planes: [{ points: PLANES[plane], fill: 'blue' }],
        segments: [{ from: line[0], to: line[1], color: 'highlight' }],
        alt: `Kocka a kiemelt ${line} egyenessel és a ${plane} síkkal.`,
      }),
      answer: textChoice(LP_TEXT[rel], wrongs),
      hint: 'Nézd meg, van-e közös pontjuk, és hogy az egyenes merőleges-e a síkra!',
      solution: [
        rel === 'lies'
          ? tex`${Article(line)} $${line}$ egyenes két pontja is ${article(plane)} $${plane}$ síkon van, ezért a teljes egyenes illeszkedik a síkra.`
          : rel === 'parallel'
            ? tex`${Article(line)} $${line}$ egyenesnek nincs közös pontja ${article(plane)} $${plane}$ síkkal.`
            : rel === 'perp'
              ? tex`${Article(line)} $${line}$ egyenes merőleges ${article(plane)} $${plane}$ síkra.`
              : tex`${Article(line)} $${line}$ egyenes egy pontban döfi ${article(plane)} $${plane}$ síkot, de nem merőleges rá.`,
        rel === 'lies'
          ? tex`Tehát **$${line} \subset ${plane}$**.`
          : rel === 'parallel'
            ? tex`Tehát **$${line} \parallel ${plane}$**.`
            : rel === 'perp'
              ? tex`Tehát **$${line} \perp ${plane}$**.`
              : 'Tehát az egyenes **metszi** a síkot, de nem merőlegesen.',
      ],
    };
  },
};

/** Point positions for the plane-count figures. */
const SCATTER: XY[] = [[0, 0], [4, 0], [0.8, 3.4], [2.8, 2.2], [5.2, 1.2], [1.6, 5.2], [6.4, 3.6], [3.8, 4.8], [7.4, 0.6], [-1.2, 2.2]];
const IN_PLANE: XY[] = [[1.2, 0.6], [3.2, 1.8], [4.6, 0.6], [6.6, 1.7], [7.8, 0.6], [2.2, 1.4]];
const OFF_PLANE: XY[] = [[2, 4.4], [5, 5.2], [8, 4.2]];
const ON_LINE: XY[] = [0.3, 1.6, 2.9, 4.2, 5.5, 6.8, 8.1].map((x) => [x, 1 + 0.2 * (x + 0.5)] as XY);
const OFF_LINE: XY[] = [[1.4, 4], [4.6, 4.8], [7.6, 4.4], [3, -1.2], [6.6, -0.8]];
const LETTERS = 'ABCDEFGHIJ';
const choose3 = (n: number) => (n * (n - 1) * (n - 2)) / 6;
const choose2 = (n: number) => (n * (n - 1)) / 2;

/** Lines or planes determined by n points: in general position (L1, L2), k of them in a plane (L2), k on a line (L3). */
const planeCount: GeneratorDef = {
  id: 'plane-count',
  title: 'Pontok által meghatározott egyenesek és síkok',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kind = level === 1 ? rng.pick(['lines', 'planes'] as const) : level === 2 ? rng.pick(['planes', 'coplanar'] as const) : 'collinear';
    const n = kind === 'lines' ? rng.int(3, 8) : kind === 'planes' ? (level === 1 ? rng.int(3, 6) : rng.int(7, 10)) : kind === 'coplanar' ? rng.int(5, 7) : rng.int(5, 8);
    const k = kind === 'coplanar' ? rng.int(4, n - 1) : kind === 'collinear' ? rng.int(3, n - 1) : 0;
    const names = LETTERS.slice(0, n).split('');
    let at: XY[];
    const items: GeoItem[] = [];
    if (kind === 'coplanar') {
      at = [...IN_PLANE.slice(0, k), ...OFF_PLANE.slice(0, n - k)];
      items.push({ kind: 'region', points: [[0, 0], [8.6, 0], [9.6, 2.4], [1, 2.4]], fill: 'blue' });
    } else if (kind === 'collinear') {
      at = [...ON_LINE.slice(0, k), ...OFF_LINE.slice(0, n - k)];
      items.push({ kind: 'segment', from: [-0.8, 0.94], to: [9, 2.9], color: 'blue' });
    } else {
      at = SCATTER.slice(0, n);
    }
    items.push(...names.map((name): GeoItem => ({ kind: 'point', at: name })));
    const figure: Figure = { type: 'geometry', points: Object.fromEntries(names.map((name, i) => [name, at[i]])), items, alt: `${n} pont a térben.` };
    const N = num(n);
    if (kind === 'lines') {
      const value = choose2(n);
      return {
        prompt: tex`Térben $${N}$ pont közül semelyik három sincs egy egyenesen. Hány egyenest határoznak meg?`,
        figure,
        answer: { type: 'number', value },
        inputLabel: 'egyenes =',
        hint: 'Minden két pont egy egyenest határoz meg. Hányféleképpen választhatsz ki két pontot?',
        solution: [
          'Bármely két pont pontosan egy egyenest határoz meg.',
          tex`A pontpárok száma: $\frac{${N} \cdot ${num(n - 1)}}{2} = ${num(value)}$.`,
          `A pontok **${num(value)} egyenest** határoznak meg.`,
        ],
      };
    }
    if (kind === 'planes') {
      const value = choose3(n);
      return {
        prompt: tex`Térben $${N}$ pont közül semelyik négy sincs egy síkban. Hány síkot határoznak meg?`,
        figure,
        answer: { type: 'number', value },
        inputLabel: 'sík =',
        hint: 'Minden három pont egy síkot határoz meg. Számold össze, hányféleképpen választhatsz ki három pontot!',
        solution: [
          'Bármely három pont pontosan egy síkot határoz meg, és ezek mind különbözők.',
          tex`A ponthármasok száma: $\frac{${N} \cdot ${num(n - 1)} \cdot ${num(n - 2)}}{6} = ${num(value)}$.`,
          `A pontok **${num(value)} síkot** határoznak meg.`,
        ],
      };
    }
    const K = num(k);
    if (kind === 'coplanar') {
      const value = choose3(n) - choose3(k) + 1;
      return {
        prompt: tex`Térben $${N}$ pont közül pontosan $${K}$ esik egy síkba, más négy pont nincs egy síkban. Hány síkot határoznak meg?`,
        figure,
        answer: { type: 'number', value },
        inputLabel: 'sík =',
        hint: 'Számold össze az összes ponthármast, aztán gondold meg: az egy síkban lévő pontok hármasai hány síkot adnak?',
        solution: [
          tex`Az összes ponthármas: $\frac{${N} \cdot ${num(n - 1)} \cdot ${num(n - 2)}}{6} = ${num(choose3(n))}$.`,
          tex`Az egy síkba eső $${K}$ pont $${num(choose3(k))}$ hármasa mind ugyanazt az egy síkot adja.`,
          tex`$${num(choose3(n))} - ${num(choose3(k))} + 1 = ${num(value)}$`,
          `A pontok **${num(value)} síkot** határoznak meg.`,
        ],
      };
    }
    const value = choose3(n) - choose3(k) - (n - k) * (choose2(k) - 1);
    return {
      prompt: tex`Térben $${N}$ pont közül pontosan $${K}$ esik egy egyenesre, más négy pont nincs egy síkban. Hány síkot határoznak meg?`,
      figure,
      answer: { type: 'number', value },
      inputLabel: 'sík =',
      hint: 'Az egyenesen lévő három pont nem határoz meg síkot. Az egyenes és egy külső pont pedig mindig ugyanazt az egy síkot adja.',
      solution: [
        tex`Az összes ponthármas: $${num(choose3(n))}$. Az egyenesen lévő $${num(choose3(k))}$ hármas nem határoz meg síkot.`,
        tex`Az egyenes $2$ pontja és egy külső pont mindig az egyenes és a külső pont síkját adja: a $${num(n - k)}$ külső pont mindegyikéhez $${num(choose2(k))}$ hármas helyett $1$ sík tartozik.`,
        tex`$${num(choose3(n))} - ${num(choose3(k))} - ${num(n - k)} \cdot ${num(choose2(k) - 1)} = ${num(value)}$`,
        `A pontok **${num(value)} síkot** határoznak meg.`,
      ],
    };
  },
};

/** Distance of a point from a plane: a face at L2, the diagonal plane BDFH at L3. */
const distance: GeneratorDef = {
  id: 'distance',
  title: 'Pont távolsága a síktól',
  levels: [2, 3],
  generate(rng, level): Question {
    const unit = 'cm';
    if (level === 2) {
      const a = rng.int(3, 6);
      let b = rng.int(3, 6);
      let c = rng.int(3, 6);
      if (b === a) b = b === 6 ? 4 : b + 1;
      if (c === a || c === b) c = [3, 4, 5, 6].find((v) => v !== a && v !== b) ?? 3;
      const faces = [
        { plane: 'ABFE', point: 'G', foot: 'F', dim: 'b' as const, edge: 'FG' },
        { plane: 'ABFE', point: 'H', foot: 'E', dim: 'b' as const, edge: 'HE' },
        { plane: 'DCGH', point: 'A', foot: 'D', dim: 'b' as const, edge: 'AD' },
        { plane: 'DCGH', point: 'B', foot: 'C', dim: 'b' as const, edge: 'BC' },
        { plane: 'BCGF', point: 'D', foot: 'C', dim: 'a' as const, edge: 'DC' },
        { plane: 'BCGF', point: 'E', foot: 'F', dim: 'a' as const, edge: 'EF' },
        { plane: 'ADHE', point: 'C', foot: 'D', dim: 'a' as const, edge: 'CD' },
        { plane: 'ADHE', point: 'F', foot: 'E', dim: 'a' as const, edge: 'FE' },
        { plane: 'ABCD', point: 'G', foot: 'C', dim: 'c' as const, edge: 'GC' },
        { plane: 'ABCD', point: 'H', foot: 'D', dim: 'c' as const, edge: 'HD' },
        { plane: 'EFGH', point: 'A', foot: 'E', dim: 'c' as const, edge: 'AE' },
        { plane: 'EFGH', point: 'B', foot: 'F', dim: 'c' as const, edge: 'BF' },
      ];
      const case_ = rng.pick(faces);
      const answer = case_.dim === 'a' ? a : case_.dim === 'b' ? b : c;
      return {
        prompt: tex`A téglatest élei $a = ${num(a)}$ cm, $b = ${num(b)}$ cm, $c = ${num(c)}$ cm. Milyen messze van ${art(case_.point)} $${case_.point}$ csúcs ${art(case_.plane)} $${case_.plane}$ lap síkjától?`,
        figure: cubeFigure({
          a,
          b,
          c,
          planes: [{ points: PLANES[case_.plane], fill: 'blue' }],
          segments: [{ from: case_.point, to: case_.foot, color: 'highlight' }],
          alt: `Téglatest a ${case_.plane} lappal és a ${case_.point}${case_.foot} merőleges szakasszal.`,
        }),
        answer: { type: 'number', value: answer, unit },
        inputLabel: '$d =$',
        hint: 'A pont és a sík távolsága a pontból a síkra bocsátott merőleges szakasz hossza. Melyik él merőleges erre a lapra?',
        solution: [
          tex`${Article(case_.point)} $${case_.point}$ pontból ${article(case_.plane)} $${case_.plane}$ síkra bocsátott merőleges talppontja $${case_.foot}$.`,
          tex`A merőleges szakasz ${article(case_.edge)} $${case_.edge}$ él, amelynek hossza ${art(case_.dim)} $${case_.dim}$ éllel egyenlő.`,
          tex`A távolság: **${num(answer)} ${unit}**.`,
        ],
      };
    }

    // L3: a vertex and a diagonal plane of the cube. The plane is perpendicular to the face of
    // the vertex and contains the other diagonal of that face, so the foot is the face centre.
    const cases: { plane: string; point: string; face: string; diag: string }[] = [
      { plane: 'BDFH', point: 'A', face: 'ABCD', diag: 'AC' },
      { plane: 'BDFH', point: 'C', face: 'ABCD', diag: 'CA' },
      { plane: 'BDFH', point: 'E', face: 'EFGH', diag: 'EG' },
      { plane: 'BDFH', point: 'G', face: 'EFGH', diag: 'GE' },
      { plane: 'ACGE', point: 'B', face: 'ABCD', diag: 'BD' },
      { plane: 'ACGE', point: 'D', face: 'ABCD', diag: 'DB' },
      { plane: 'ACGE', point: 'F', face: 'EFGH', diag: 'FH' },
      { plane: 'ACGE', point: 'H', face: 'EFGH', diag: 'HF' },
      { plane: 'ABGH', point: 'C', face: 'BCGF', diag: 'CF' },
      { plane: 'ABGH', point: 'F', face: 'BCGF', diag: 'FC' },
      { plane: 'ABGH', point: 'D', face: 'ADHE', diag: 'DE' },
      { plane: 'ABGH', point: 'E', face: 'ADHE', diag: 'ED' },
      { plane: 'CDEF', point: 'A', face: 'ADHE', diag: 'AH' },
      { plane: 'CDEF', point: 'H', face: 'ADHE', diag: 'HA' },
      { plane: 'CDEF', point: 'B', face: 'BCGF', diag: 'BG' },
      { plane: 'CDEF', point: 'G', face: 'BCGF', diag: 'GB' },
    ];
    const c = rng.pick(cases);
    const a = 2 * rng.int(1, 6);
    const coef = a / 2;
    const [d0, d1] = ends(c.diag);
    const foot = UNIT[d0].map((x, i) => ((x + UNIT[d1][i]) / 2) * a) as V3;
    const other = PLANES[c.face].filter((v) => v !== d0 && v !== d1).join('');
    return {
      prompt: tex`A kocka éle $${num(a)}$ cm. Milyen messze van ${art(c.point)} $${c.point}$ csúcs ${art(c.plane)} $${c.plane}$ síktól? (Gyökös alakban add meg!)`,
      figure: cubeFigure({
        a,
        planes: [{ points: PLANES[c.plane], fill: 'accent' }],
        segments: [{ from: c.point, to: 'O', color: 'highlight' }],
        extraPoints: { O: foot },
        alt: `Kocka a ${c.plane} síkkal és a ${c.point} csúcsból rá merőleges ${c.point}O szakasszal.`,
      }),
      answer: { type: 'root', coef, radicand: 2, requireSimplified: false, unit },
      inputLabel: '$d =$',
      hint: tex`${Article(c.plane)} $${c.plane}$ sík merőleges ${art(c.face)} $${c.face}$ lapra. Hol metszi a lap átlóit?`,
      solution: [
        tex`${Article(c.plane)} $${c.plane}$ sík merőleges ${art(c.face)} $${c.face}$ lapra, és tartalmazza a lap $${other}$ átlóját.`,
        tex`Ezért ${art(c.point)} $${c.point}$-${/[AH]/.test(c.point) ? 'ból' : 'ből'} húzott merőleges talppontja a lap közepe, ${art(c.diag)} $${c.diag}$ átló $O$ felezőpontja.`,
        tex`A lapátló: $${c.diag} = ${num(a)}\sqrt{2}$ cm, így $${c.point}O = ${c.diag} : 2 = ${texRoot(coef, 2)}$ cm.`,
        tex`${Article(c.point)} $${c.point}$ csúcs távolsága **$${texRoot(coef, 2)}$ ${unit}**.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 5. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g8-pont-egyenes-sik-01',
  goals: [
    'felismerni a pont, az egyenes és a sík kölcsönös helyzetét a térben,',
    'helyesen használni az ∈, ⊂, ∥ és ⊥ jeleket,',
    'eldönteni két egyenes, egy egyenes és egy sík, valamint két sík helyzetét,',
    'kiszámítani egy pont és egy sík távolságát a kockában.',
  ],
  parts: [
    {
      title: 'Pont, egyenes és sík',
      steps: [
        {
          type: 'theory',
          title: 'Illeszkedés',
          body: 'A pontot nagybetűvel, az egyenest kisbetűvel, a síkot görög betűvel jelöljük. Az illeszkedést a $\\in$, a nem illeszkedést a $\\notin$ jelöli.',
          figure: incidenceFigure,
          remember: '$A \\in p$: az $A$ pont a $p$ egyenesen van.',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik jelölés fejezi ki, hogy az $A$ pont illeszkedik a $p$ egyenesre?',
            figure: incidenceFigure,
            answer: textChoice('$A \\in p$', ['$A \\notin p$', '$p \\in A$', '$A \\subset p$']),
            hint: 'Az illeszkedés jele a $\\in$.',
            solution: [
              'Az $A \\in p$ azt jelenti, hogy az $A$ pont a $p$ egyenesen van.',
              'A $\\subset$ a részhalmaz jele, például $p \\subset \\alpha$.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'Mi határoz meg egy síkot?',
          body: 'Egy síkot egyértelműen meghatároz három nem kollineáris pont, egy egyenes és egy rá nem illeszkedő pont, két metsző egyenes vagy két párhuzamos egyenes.',
          figure: planeDeterminationFigure,
          remember: '3 nem kollineáris pont → 1 sík',
        },
        {
          type: 'check',
          question: {
            prompt: 'Mi határoz meg egyértelműen egy síkot?',
            answer: textChoice('három nem kollineáris pont', ['két pont', 'egy egyenes és egy rajta lévő pont', 'három kollineáris pont']),
            hint: 'A pontok nem eshetnek egy egyenesre.',
            solution: [
              'Három nem kollineáris pont pontosan egy síkot határoz meg.',
              'Két ponton át végtelen sok sík fektethető.',
            ],
          },
        },
        { type: 'practice', generator: 'symbols', level: 1 },
      ],
    },
    {
      title: 'Két egyenes a térben',
      steps: [
        {
          type: 'theory',
          title: 'Metsző, párhuzamos, kitérő',
          body: 'Két egyenes lehet metsző (egy közös pontjuk van), párhuzamos (egy síkban vannak, nincs közös pontjuk) vagy kitérő (nincs közös síkjuk).',
          figure: twoLinesFigure,
          remember: 'metsző · párhuzamos · kitérő',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A kocka $AB$ és $CG$ éle párhuzamos.**',
            figure: twoLinesFigure,
            answer: { type: 'truefalse', value: false },
            hint: 'A két él nincs egy síkban. Nézd meg a kockát!',
            solution: [
              'Az $AB$ él az alaplap síkjában van, a $CG$ él egy másik síkban; nincs közös pontjuk, de nem párhuzamosak.',
              'Ezért a két él **kitérő**, az állítás **hamis**.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Három élhelyzet',
          problem: 'A kockán milyen helyzetű az $AB$–$EF$, az $AB$–$BC$ és az $AB$–$CG$ élpár?',
          figure: cubeFigure({ a: 4, segments: [{ from: 'A', to: 'B', color: 'blue' }] }),
          steps: [
            { text: '$AB$ és $EF$ ugyanabba az irányba mutat, nincs közös pontjuk: párhuzamos.' },
            { text: '$AB$ és $BC$ a $B$ csúcsban találkozik, derékszöget zár be: metsző (merőleges).' },
            { text: '$AB$ és $CG$ nincs egy síkban, és nem is párhuzamos: kitérő.' },
          ],
          answer: '$AB \\parallel EF$, $AB \\perp BC$, $AB$ és $CG$ **kitérő**.',
        },
        { type: 'practice', generator: 'cube-relation', level: 1, count: 2 },
        { type: 'practice', generator: 'cube-relation', level: 2 },
        { type: 'practice', generator: 'symbols', level: 2 },
      ],
    },
    {
      title: 'Egyenes és sík',
      steps: [
        {
          type: 'theory',
          title: 'Egyenes és sík helyzete',
          body: 'Az egyenes illeszkedhet a síkra, párhuzamos lehet vele, egy pontban döfheti, vagy merőleges lehet rá. A merőleges a döféspontban a sík minden egyenesére merőleges.',
          figure: linePlaneFigure,
          remember: '$p \\subset \\alpha$ · $p \\parallel \\alpha$ · $p \\perp \\alpha$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Az $AE$ él és az $ABCD$ lap síkja milyen helyzetű?',
            figure: linePlaneFigure,
            answer: textChoice('merőleges', ['párhuzamos', 'illeszkedik', 'metszi, de nem merőlegesen']),
            hint: 'Az $AE$ él merőleges az $AB$ és az $AD$ élre is.',
            solution: [
              'Az $AE$ él az $A$ pontban találkozik az $ABCD$ síkkal, és merőleges a sík két egyenesére, $AB$-re és $AD$-re.',
              'Ezért $AE \\perp ABCD$.',
            ],
          },
        },
        {
          type: 'example',
          title: 'Él és lap',
          problem: 'Hogyan helyezkedik el az $AB$, az $EF$ és az $AE$ él az $ABCD$ lap síkjához képest?',
          figure: cubeFigure({ a: 4, planes: [{ points: PLANES.ABCD, fill: 'blue' }] }),
          steps: [
            { text: '$AB$ az $ABCD$ lapon van: illeszkedik a síkra ($AB \\subset ABCD$).' },
            { text: '$EF$ párhuzamos $AB$-vel, de nincs a síkban: párhuzamos a síkkal.' },
            { text: '$AE$ merőleges $AB$-re és $AD$-re is: merőleges a síkra.' },
          ],
          answer: '$AB \\subset ABCD$, $EF \\parallel ABCD$, $AE \\perp ABCD$.',
        },
        { type: 'practice', generator: 'line-plane', level: 1 },
        { type: 'practice', generator: 'line-plane', level: 2 },
        { type: 'practice', generator: 'distance', level: 2 },
      ],
    },
    {
      title: 'Síkok és távolságok',
      steps: [
        {
          type: 'theory',
          title: 'Két sík',
          body: 'Két sík párhuzamos (nincs közös pont), metsző (egy egyenesben találkozik) vagy merőleges. A közös egyenes a metszésvonal.',
          figure: twoPlanesFigure,
          remember: '$\\alpha \\parallel \\beta$ · $\\alpha \\perp \\beta$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Igaz vagy hamis?\n\n**A kocka $ABCD$ és $EFGH$ lapjának síkja párhuzamos.**',
            figure: cubeFigure({ a: 4, planes: [{ points: PLANES.ABCD, fill: 'blue' }, { points: PLANES.EFGH, fill: 'orange' }] }),
            answer: { type: 'truefalse', value: true },
            hint: 'A két lap egymással szemben van, és nem metszi egymást.',
            solution: [
              'A két lap síkja nem metszi egymást, ezért párhuzamos.',
              'Az állítás **igaz**.',
            ],
          },
        },
        {
          type: 'theory',
          title: 'Pont távolsága a síktól',
          body: 'A pontból a síkra bocsátott merőleges szakasz hossza a pont és a sík távolsága. A merőleges talppontja a pont vetülete a síkon.',
          figure: distanceFigure,
          remember: 'távolság = merőleges szakasz hossza',
        },
        {
          type: 'example',
          title: 'Távolság a ferde síktól',
          problem: 'A kocka éle $4$ cm. Milyen messze van az $A$ csúcs a $BDFH$ síktól?',
          figure: cubeFigure({
            a: 4,
            planes: [{ points: PLANES.BDFH, fill: 'accent' }],
            segments: [{ from: 'A', to: 'O', color: 'highlight' }],
            extraPoints: { O: [2, 2, 0] },
          }),
          steps: [
            { text: 'A $BDFH$ sík merőleges az $ABCD$ alaplapra.' },
            { text: 'Az $A$-ból húzott merőleges talppontja az $AC$ és $BD$ metszéspontja, $O$.' },
            { text: '$AC = 4\\sqrt{2}$ cm, ezért $AO = AC : 2 = 2\\sqrt{2}$ cm.' },
          ],
          answer: 'Az $A$ csúcs távolsága **$2\\sqrt{2}$ cm**.',
        },
        { type: 'practice', generator: 'line-plane', level: 3 },
        { type: 'practice', generator: 'plane-count', level: 2 },
        { type: 'practice', generator: 'distance', level: 3 },
        { type: 'practice', generator: 'plane-count', level: 3 },
      ],
    },
  ],
  generators: [cubeRelation, symbols, linePlane, planeCount, distance],
  miniTest: {
    items: [
      { generator: 'cube-relation', level: 1 },
      { generator: 'symbols', level: 2 },
      { generator: 'line-plane', level: 2 },
      { generator: 'distance', level: 2 },
      { generator: 'plane-count', level: 2 },
      { generator: 'cube-relation', level: 3 },
      { generator: 'distance', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'cube-relation', level: 1 },
    { generator: 'symbols', level: 1 },
    { generator: 'line-plane', level: 1 },
    { generator: 'distance', level: 2 },
    { generator: 'cube-relation', level: 2 },
    { generator: 'plane-count', level: 3 },
  ],
});
