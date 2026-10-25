/**
 * 5. osztály › Mértani alapfogalmak › 2. Az egyenesek kölcsönös helyzete a síkban. A sík részei
 *
 * Geometry lesson: intersecting and parallel lines, the unique parallel through a point
 * (two set squares), transitivity, half-planes, the regions cut out by 2–4 lines, and
 * triangles / parallelograms as plane regions. Every figure is built from the same line
 * configuration as the question; the intersection and region counts are computed from it.
 */
import {
  article,
  Article,
  defineSubtopic,
  num,
  suffix,
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
// 1. Helpers: lines, intersections, regions, figures
// ---------------------------------------------------------------------------------------------

/** An infinite line given by two points and its name (p, q, r, s). */
type LineDef = { a: XY; b: XY; label: string };

const at = (x: number, y: number): XY => [x, y];

/** Hungarian article before a line name: p = pé → a, q = kú → a, r = er → az, s = ess → az. */
const VOWEL_LINE = new Set(['a', 'e', 'f', 'l', 'm', 'n', 'r', 's']);
const lineArt = (name: string) => (VOWEL_LINE.has(name) ? 'az' : 'a');
const LineArt = (name: string) => (VOWEL_LINE.has(name) ? 'Az' : 'A');

/** Intersection of two infinite lines, or null when they are parallel. */
function lineIntersection(l1: LineDef, l2: LineDef): XY | null {
  const [x1, y1] = l1.a;
  const [x2, y2] = l1.b;
  const [x3, y3] = l2.a;
  const [x4, y4] = l2.b;
  const d1x = x2 - x1;
  const d1y = y2 - y1;
  const d2x = x4 - x3;
  const d2y = y4 - y3;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / den;
  return [x1 + t * d1x, y1 + t * d1y];
}

const pointKey = (p: XY) => `${Math.round(p[0] * 1000)}:${Math.round(p[1] * 1000)}`;

/** Every distinct intersection point of the lines (parallel pairs contribute none). */
function intersectionPoints(lines: LineDef[]): XY[] {
  const out: XY[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const p = lineIntersection(lines[i], lines[j]);
      if (!p) continue;
      const key = pointKey(p);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(p);
      }
    }
  }
  return out;
}

/** How many new regions the i-th line creates when added to the previous ones. */
function newRegions(lines: LineDef[], i: number): number {
  const keys = new Set<string>();
  for (let j = 0; j < i; j++) {
    const p = lineIntersection(lines[i], lines[j]);
    if (p) keys.add(pointKey(p));
  }
  return keys.size + 1;
}

/** Number of regions the lines cut the plane into. */
function regionCount(lines: LineDef[]): number {
  let regions = 1;
  for (let i = 0; i < lines.length; i++) regions += newRegions(lines, i);
  return regions;
}

/** The parallel pairs among the lines, as pairs of names. */
function parallelPairs(lines: LineDef[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (!lineIntersection(lines[i], lines[j])) out.push([lines[i].label, lines[j].label]);
    }
  }
  return out;
}

/** A figure drawn from a line configuration; optional marked intersection point. */
function linesFigure(lines: LineDef[], mark?: { at: XY; label?: string; dir?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' }): Figure {
  const points: Record<string, XY> = {
    C1: at(0, 0),
    C2: at(10, 7),
    C3: at(0, 7),
    C4: at(10, 0),
  };
  const items: GeoItem[] = [];
  lines.forEach((l, i) => {
    points[`L${i}a`] = l.a;
    points[`L${i}b`] = l.b;
    items.push({ kind: 'line', through: [`L${i}a`, `L${i}b`], label: l.label });
  });
  if (mark) {
    points.M = mark.at;
    items.push({ kind: 'point', at: 'M', label: mark.label ?? 'M', labelDir: mark.dir ?? 'ne' });
  }
  return { type: 'geometry', points, items };
}

// --- line configurations ---------------------------------------------------------------------

const horizontal = (y: number): [XY, XY] => [at(0, y), at(10, y)];
const vertical = (x: number): [XY, XY] => [at(x, 0), at(x, 7)];
const line = (label: string, a: XY, b: XY): LineDef => ({ a, b, label });

/** p ∥ q, r vertical through both. */
function tripleVertical(): { lines: LineDef[]; M: XY } {
  return { lines: [line('p', ...horizontal(2)), line('q', ...horizontal(5)), line('r', ...vertical(6))], M: at(6, 2) };
}

/** p ∥ q, slanted pieces; r horizontal. */
function tripleSlanted(): { lines: LineDef[]; M: XY } {
  return {
    lines: [line('p', at(0, 1), at(8, 5)), line('q', at(0, 3.5), at(7, 7)), line('r', at(0, 2.5), at(10, 2.5))],
    M: at(3, 2.5),
  };
}

/** p ∥ q vertical; r slanted. */
function tripleVerticals(): { lines: LineDef[]; M: XY } {
  return { lines: [line('p', ...vertical(3)), line('q', ...vertical(7)), line('r', at(0, 0.5), at(10, 5.5))], M: at(3, 2) };
}

/** Three lines in general position, all intersections inside the picture. */
function threeGeneral(): LineDef[] {
  return [
    line('p', at(0, 1), at(10, 4)),
    line('q', at(0, 6), at(10, 1.5)),
    line('r', at(2, 0), at(7, 8)),
  ];
}

/** Two parallels and a transversal. */
function threeOneParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(5.5)), line('r', ...vertical(5))];
}

/** Three lines through one point. */
function threeConcurrent(): LineDef[] {
  return [
    line('p', ...horizontal(3.5)),
    line('q', at(1.5, 0), at(8.5, 7)),
    line('r', at(1.5, 7), at(8.5, 0)),
  ];
}

/** Three parallel lines. */
function threeParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(3.5)), line('r', ...horizontal(5.5))];
}

/** Four lines in general position (no parallels, no three through one point). */
function fourGeneral(): LineDef[] {
  return [
    line('p', ...horizontal(2)),
    line('q', at(1, 0), at(8, 7)),
    line('r', at(0, 7), at(7, 0)),
    line('s', at(0, 0.2), at(10, 3.2)),
  ];
}

/** Four lines: one parallel pair plus two transversals. */
function fourOneParallel(): LineDef[] {
  return [
    line('p', ...horizontal(1.5)),
    line('q', ...horizontal(5.5)),
    line('r', ...vertical(5)),
    line('s', at(0, 0), at(10, 7)),
  ];
}

/** Four lines: two parallel pairs (a grid). */
function fourTwoParallel(): LineDef[] {
  return [line('p', ...horizontal(1.5)), line('q', ...horizontal(5.5)), line('r', ...vertical(3.5)), line('s', ...vertical(7))];
}

/** Four parallel lines. */
function fourParallel(): LineDef[] {
  return [line('p', ...horizontal(0.9)), line('q', ...horizontal(2.7)), line('r', ...horizontal(4.5)), line('s', ...horizontal(6.3))];
}

/** Four lines through one point. */
function fourConcurrent(): LineDef[] {
  return [
    line('p', ...horizontal(3.5)),
    line('q', at(1.5, 0), at(8.5, 7)),
    line('r', at(1.5, 7), at(8.5, 0)),
    line('s', ...vertical(5)),
  ];
}

/** Three concurrent lines and a transversal that avoids their common point. */
function fourThreeConcurrent(): LineDef[] {
  return [...threeConcurrent(), line('s', ...vertical(8))];
}

// --- random configurations (for the generators) ----------------------------------------------

/**
 * Kinds of line configurations, by the relative position of the lines:
 * par = parallel lines, gen = no parallels and no three through a point, conc = through one point.
 */
type ConfigKind =
  | 'cross2' // 2 crossing lines
  | 'par2' // 2 parallel lines
  | 'par3' // 3 parallel lines
  | 'par2+1' // 2 parallel lines and a transversal
  | 'gen3' // 3 lines in general position
  | 'conc3' // 3 lines through one point
  | 'gen4' // 4 lines in general position
  | 'par2+2' // 2 parallel lines and 2 more crossing lines
  | 'grid' // 2 pairs of parallel lines
  | 'par3+1' // 3 parallel lines and a transversal
  | 'conc3+1' // 3 lines through a point and a fourth line
  | 'conc4' // 4 lines through one point
  | 'par4'; // 4 parallel lines

const FRAME = { w: 10, h: 7 };
const LABEL_SETS = [
  ['p', 'q', 'r', 's'],
  ['a', 'b', 'c', 'd'],
  ['e', 'f', 'g', 'h'],
  ['k', 'l', 'm', 'n'],
];

/** The two points where a line (point + angle in degrees) leaves the frame, or null. */
function clipToFrame(p: XY, deg: number): [XY, XY] | null {
  const dx = Math.cos((deg * Math.PI) / 180);
  const dy = Math.sin((deg * Math.PI) / 180);
  const ts: number[] = [];
  if (Math.abs(dx) > 1e-9) for (const x of [0, FRAME.w]) ts.push((x - p[0]) / dx);
  if (Math.abs(dy) > 1e-9) for (const y of [0, FRAME.h]) ts.push((y - p[1]) / dy);
  const inside = ts
    .map((t) => [p[0] + t * dx, p[1] + t * dy] as XY)
    .filter(([x, y]) => x >= -1e-6 && x <= FRAME.w + 1e-6 && y >= -1e-6 && y <= FRAME.h + 1e-6);
  if (inside.length < 2) return null;
  inside.sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const a = inside[0];
  const b = inside[inside.length - 1];
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 5) return null;
  return [a, b];
}

/** Distance of point q from the line through a and b. */
function distToLine(q: XY, l: LineDef): number {
  const [x1, y1] = l.a;
  const [x2, y2] = l.b;
  return Math.abs((x2 - x1) * (y1 - q[1]) - (x1 - q[0]) * (y2 - y1)) / Math.hypot(x2 - x1, y2 - y1);
}

/**
 * A random configuration of the given kind, with all intersections well inside the picture and
 * far enough apart to count them by eye. Labels are shuffled, so any letter can be the odd one out.
 */
function randomConfig(rng: Rng, kind: ConfigKind): LineDef[] {
  const plan: Record<ConfigKind, { groups: number[]; conc: number }> = {
    cross2: { groups: [1, 1], conc: 0 },
    par2: { groups: [2], conc: 0 },
    par3: { groups: [3], conc: 0 },
    'par2+1': { groups: [2, 1], conc: 0 },
    gen3: { groups: [1, 1, 1], conc: 0 },
    conc3: { groups: [1, 1, 1], conc: 3 },
    gen4: { groups: [1, 1, 1, 1], conc: 0 },
    'par2+2': { groups: [2, 1, 1], conc: 0 },
    grid: { groups: [2, 2], conc: 0 },
    'par3+1': { groups: [3, 1], conc: 0 },
    'conc3+1': { groups: [1, 1, 1, 1], conc: 3 },
    conc4: { groups: [1, 1, 1, 1], conc: 4 },
    par4: { groups: [4], conc: 0 },
  };
  const { groups, conc } = plan[kind];
  const ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165];
  const angleGap = (a: number, b: number) => {
    const d = Math.abs(a - b) % 180;
    return Math.min(d, 180 - d);
  };
  for (let attempt = 0; attempt < 6000; attempt++) {
    // one direction per group, at least 30° apart
    const dirs: number[] = [];
    for (const _ of groups) {
      const options = ANGLES.filter((a) => dirs.every((d) => angleGap(a, d) >= 30));
      if (options.length === 0) break;
      dirs.push(rng.pick(options));
    }
    if (dirs.length < groups.length) continue;
    const centre: XY = [rng.int(35, 65) / 10, rng.int(25, 45) / 10];
    const lines: LineDef[] = [];
    let index = 0;
    let ok = true;
    groups.forEach((size, g) => {
      for (let k = 0; k < size; k++) {
        const through: XY = index < conc ? centre : [rng.int(25, 75) / 10, rng.int(15, 55) / 10];
        const seg = clipToFrame(through, dirs[g]);
        if (!seg) ok = false;
        else lines.push({ a: seg[0], b: seg[1], label: '' });
        index++;
      }
    });
    if (!ok) continue;
    // parallel lines far enough apart
    for (let i = 0; i < lines.length && ok; i++)
      for (let j = i + 1; j < lines.length && ok; j++)
        if (!lineIntersection(lines[i], lines[j]) && distToLine(lines[i].a, lines[j]) < 1.3) ok = false;
    if (!ok) continue;
    // intersections inside, distinct ones far apart, and no line passing close to a foreign crossing
    const pts = intersectionPoints(lines);
    if (pts.some(([x, y]) => x < 0.8 || x > FRAME.w - 0.8 || y < 0.7 || y > FRAME.h - 0.7)) continue;
    for (let i = 0; i < pts.length && ok; i++)
      for (let j = i + 1; j < pts.length && ok; j++) if (Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) < 1.4) ok = false;
    for (const q of pts) for (const l of lines) if (distToLine(q, l) > 1e-6 && distToLine(q, l) < 0.8) ok = false;
    if (!ok) continue;
    const labels = rng.pick(LABEL_SETS);
    const order = rng.shuffle(lines.map((_, i) => i));
    return order.map((i, k) => ({ ...lines[i], label: labels[k] }));
  }
  throw new Error(`no ${kind} configuration found`);
}

// --- static figures --------------------------------------------------------------------------

const twoLinesFigure: Figure = linesFigure([line('p', ...horizontal(2.5)), line('q', at(0, 1), at(10, 5))], {
  at: at(3.75, 2.5),
  label: 'M',
  dir: 'ne',
});

const parallelFigure: Figure = linesFigure([line('p', ...horizontal(2)), line('q', ...horizontal(4.8))]);

const halfPlaneFigure: Figure = {
  type: 'geometry',
  points: { E1: at(0, 3), E2: at(10, 3), A: at(4, 5), B: at(4, 1) },
  items: [
    { kind: 'region', points: ['E1', 'E2', at(10, 7), at(0, 7)], fill: 'accent' },
    { kind: 'line', through: ['E1', 'E2'], label: 'p' },
    { kind: 'point', at: 'A', labelDir: 'n' },
    { kind: 'point', at: 'B', labelDir: 's' },
  ],
};

const triangleRegion: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(5.5, 0), C: at(2, 3.6) },
  items: [{ kind: 'polygon', points: ['A', 'B', 'C'], fill: 'accent', sideLabels: ['AB', 'BC', 'CA'] }],
};

const parallelogramRegion: Figure = {
  type: 'geometry',
  points: { A: at(0, 0), B: at(6, 0), C: at(7.6, 3.2), D: at(1.6, 3.2) },
  items: [{ kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent', sideLabels: ['AB', 'BC', 'CD', 'DA'] }],
};

/** A triangle and a parallelogram side by side: the two plane regions of the lesson. */
const shapePairFigure: Figure = {
  type: 'geometry',
  points: {
    K: at(0, 0),
    L: at(4.2, 0),
    M: at(1.6, 3.1),
    A: at(6.9, 0),
    B: at(11.9, 0),
    C: at(13.2, 2.9),
    D: at(8.2, 2.9),
  },
  items: [
    { kind: 'polygon', points: ['K', 'L', 'M'], fill: 'accent' },
    { kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: 'accent' },
  ],
};

/** The parallel through P with two set squares, shown step by step. */
const parallelConstruction: Figure = {
  type: 'construction',
  points: {
    E1: at(0, 1),
    E2: at(9, 1),
    P: at(4.5, 4.2),
    S1: at(2, 1),
    S2: at(5, 1),
    S3: at(2, 3.4),
    S1b: at(2, 4.2),
    S2b: at(5, 4.2),
    S3b: at(2, 6.6),
  },
  given: [
    { kind: 'line', through: ['E1', 'E2'], label: 'p' },
    { kind: 'point', at: 'P' },
  ],
  steps: [
    {
      caption: 'A derékszögű vonalzó egyik szárát a $p$ egyenesre illeszted.',
      items: [
        { kind: 'polygon', points: ['S1', 'S2', 'S3'], fill: 'muted', vertexLabels: false },
        { kind: 'angle', vertex: 'S1', from: 'S2', to: 'S3', right: true },
      ],
    },
    {
      caption: 'A másik vonalzót a derékszögű vonalzó másik szárához tolod.',
      items: [{ kind: 'line', through: ['S1', 'S3'], label: 'vonalzó', color: 'blue' }],
    },
    {
      caption: 'A derékszögű vonalzót a másik mentén a $P$ pontig tolod.',
      items: [
        { kind: 'polygon', points: ['S1b', 'S2b', 'S3b'], fill: 'muted', vertexLabels: false },
        { kind: 'angle', vertex: 'S1b', from: 'S2b', to: 'S3b', right: true },
        { kind: 'segment', from: 'S1', to: 'S1b', arrow: 'end', dashed: true, color: 'orange' },
        { kind: 'point', at: 'S1b', label: false },
      ],
    },
    {
      caption: 'A vonalzó éle mentén meghúzod a $P$-n átmenő $q$ egyenest.',
      items: [
        { kind: 'line', through: ['P', 'S2b'], label: 'q', color: 'accent' },
        { kind: 'parallel', from: 'E1', to: 'E2' },
        { kind: 'parallel', from: 'P', to: 'S2b' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------------------------------------------

/** Which line is parallel? / which statement is true? / which two lines meet at M? */
const linePosition: GeneratorDef = {
  id: 'line-position',
  title: 'Két egyenes helyzete az ábrán',
  levels: [1, 2],
  generate(rng, level): Question {
    const pairText = (x: string, y: string) => tex`$${x}$ és $${y}$`;
    if (level === 1) {
      // three lines: one parallel pair and a transversal
      const lines = randomConfig(rng, 'par2+1');
      const [[x, y]] = parallelPairs(lines);
      const t = lines.find((l) => l.label !== x && l.label !== y)!.label;
      const figure = linesFigure(lines);
      const mode = rng.pick(['ask', 'not', 'pair'] as const);
      const [asked, other] = rng.shuffle([x, y]);
      if (mode === 'ask') {
        return {
          prompt: tex`Melyik egyenes párhuzamos ${lineArt(asked)} $${asked}$ egyenessel?`,
          figure,
          answer: textChoice(`$${other}$`, [`$${t}$`, 'egyik sem']),
          hint: 'Két egyenes párhuzamos, ha soha nem találkozik.',
          solution: [
            tex`${LineArt(asked)} $${asked}$ és ${lineArt(other)} $${other}$ egyenes soha nem metszi egymást: párhuzamosak.`,
            tex`${LineArt(t)} $${t}$ egyenes metszi ${lineArt(asked)} $${asked}$ egyenest, ezért nem párhuzamos vele.`,
            tex`A válasz: **$${other}$**.`,
          ],
        };
      }
      if (mode === 'not') {
        return {
          prompt: tex`Melyik egyenes nem párhuzamos ${lineArt(asked)} $${asked}$ egyenessel?`,
          figure,
          answer: textChoice(`$${t}$`, [`$${other}$`, 'nincs ilyen']),
          hint: tex`Keresd meg azt az egyenest, amelyik metszi ${lineArt(asked)} $${asked}$ egyenest!`,
          solution: [
            tex`${LineArt(other)} $${other}$ párhuzamos ${lineArt(asked)} $${asked}$ egyenessel, ezért nem lehet a válasz.`,
            tex`${LineArt(t)} $${t}$ egyenes metszi ${lineArt(asked)} $${asked}$ egyenest, tehát nem párhuzamos vele.`,
            tex`A válasz: **$${t}$**.`,
          ],
        };
      }
      return {
        prompt: 'Melyik két egyenes párhuzamos az ábrán?',
        figure,
        answer: textChoice(pairText(x, y), [pairText(x, t), pairText(y, t)]),
        hint: 'A párhuzamos egyenesek soha nem találkoznak.',
        solution: [
          tex`${LineArt(x)} $${x}$ és ${lineArt(y)} $${y}$ egyenes soha nem metszi egymást: párhuzamosak.`,
          tex`${LineArt(t)} $${t}$ mindkettőt metszi, ezért egyikkel sem párhuzamos.`,
          tex`A válasz: **$${x}$ és $${y}$**.`,
        ],
      };
    }
    // level 2: four lines, one or two parallel pairs
    const lines = randomConfig(rng, rng.pick(['grid', 'par2+2'] as const));
    const names = lines.map((l) => l.label);
    const parallel = parallelPairs(lines);
    const isParallel = (u: string, v: string) => parallel.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
    const allPairs: [string, string][] = [];
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) allPairs.push([names[i], names[j]]);
    const crossing = allPairs.filter(([u, v]) => !isParallel(u, v));
    const mode = rng.pick(['statement', 'intersection', 'count'] as const);
    if (mode === 'statement') {
      const [u, v] = rng.pick(parallel);
      const wrongs = rng.sample(crossing, 3).map(([a, b]) => tex`$${a} \parallel ${b}$`);
      return {
        prompt: 'Melyik állítás igaz az ábrán látható egyenesekre?',
        figure: linesFigure(lines),
        answer: textChoice(tex`$${u} \parallel ${v}$`, wrongs),
        hint: 'Keresd meg azt a két egyenest, amelyek soha nem találkoznak!',
        solution: [
          tex`${LineArt(u)} $${u}$ és ${lineArt(v)} $${v}$ egyenes soha nem metszi egymást: $${u} \parallel ${v}$.`,
          'A többi felsorolt egyenespár az ábrán metszi egymást, ezért azok nem párhuzamosak.',
          tex`Az igaz állítás: **$${u} \parallel ${v}$**.`,
        ],
      };
    }
    if (mode === 'intersection') {
      const [u, v] = rng.pick(crossing);
      const M = lineIntersection(lines.find((l) => l.label === u)!, lines.find((l) => l.label === v)!)!;
      const wrongs = rng.sample(allPairs.filter(([a, b]) => !(a === u && b === v)), 3).map(([a, b]) => pairText(a, b));
      return {
        prompt: 'Melyik két egyenes metszi egymást az $M$ pontban?',
        figure: linesFigure(lines, { at: M, dir: 'ne' }),
        answer: textChoice(pairText(u, v), wrongs),
        hint: 'Keresd meg az $M$ pontot, és nézd meg, melyik két egyenes megy át rajta!',
        solution: [
          tex`Az $M$ pont ${lineArt(u)} $${u}$ és ${lineArt(v)} $${v}$ egyenesen van.`,
          'A másik két egyenes nem megy át az $M$ ponton.',
          tex`Az $M$ pontban **${lineArt(u)} $${u}$ és ${lineArt(v)} $${v}$** egyenes metszi egymást.`,
        ],
      };
    }
    const asked = rng.pick(names);
    const partners = names.filter((n) => n !== asked && isParallel(asked, n));
    return {
      prompt: tex`Hány egyenes párhuzamos az ábrán ${lineArt(asked)} $${asked}$ egyenessel?`,
      figure: linesFigure(lines),
      answer: { type: 'number', value: partners.length },
      inputLabel: 'egyenes =',
      hint: tex`Nézd végig a többi egyenest: melyik nem találkozik ${lineArt(asked)} $${asked}$ egyenessel?`,
      solution: [
        partners.length === 0
          ? tex`Mindegyik másik egyenes metszi ${lineArt(asked)} $${asked}$ egyenest.`
          : tex`Csak ${lineArt(partners[0])} $${partners[0]}$ egyenes nem találkozik ${lineArt(asked)} $${asked}$ egyenessel.`,
        tex`Tehát **${num(partners.length)}** egyenes párhuzamos vele.`,
      ],
    };
  },
};

/** True/false statements about relative position, the unique parallel and transitivity. */
type Statement = { text: string; value: boolean; why: string };

const positionTf: GeneratorDef = {
  id: 'position-tf',
  title: 'Igaz-hamis állítások az egyenesek helyzetéről',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const pool: Statement[] =
      level === 1
        ? [
            { text: 'Két egyenesnek legfeljebb egy metszéspontja lehet.', value: true, why: 'Két egyenes vagy nem találkozik, vagy pontosan egy pontban metszi egymást.' },
            { text: 'Két párhuzamos egyenesnek van metszéspontja.', value: false, why: 'A párhuzamos egyenesek soha nem találkoznak, ezért nincs metszéspontjuk.' },
            { text: 'Ha két egyenes metszi egymást, akkor pontosan egy közös pontjuk van.', value: true, why: 'A metsző egyeneseknek egyetlen közös pontja van.' },
            { text: 'Két egyenes mindig metszi egymást.', value: false, why: 'Lehetnek párhuzamosak is; akkor nincs metszéspontjuk.' },
            { text: 'A párhuzamos egyenesek nem metszik egymást.', value: true, why: 'Ez a párhuzamosság jelentése a síkban.' },
            { text: 'A $p \\parallel q$ jelölés azt jelenti, hogy a $p$ és a $q$ egyenes párhuzamos.', value: true, why: 'A $\\parallel$ jel a párhuzamosság jele.' },
            { text: 'Két egyenesnek pontosan két metszéspontja lehet.', value: false, why: 'Két egyenesnek legfeljebb egy közös pontja lehet.' },
            { text: 'A párhuzamos egyenesek ugyanabba az irányba állnak.', value: true, why: 'A párhuzamos egyenesek iránya ugyanaz.' },
            { text: 'A metsző egyeneseknek nincs közös pontjuk.', value: false, why: 'A metsző egyenesek éppen egy közös pontban találkoznak.' },
            { text: 'A $p \\parallel q$ jelölésben a $\\parallel$ jel a párhuzamosságot jelenti.', value: true, why: 'A $\\parallel$ a párhuzamosság jele.' },
          ]
        : level === 2
          ? [
              { text: 'Egy ponton át az adott egyenessel pontosan egy párhuzamos egyenes húzható.', value: true, why: 'A párhuzamos egyetlen: a pont és az irány egyértelműen meghatározza.' },
              { text: 'Egy ponton át az adott egyenessel két párhuzamos egyenes húzható.', value: false, why: 'Csak egyetlen párhuzamos húzható át a ponton.' },
              { text: 'Ha $p \\parallel q$ és $q \\parallel r$, akkor $p \\parallel r$.', value: true, why: 'A párhuzamosság továbbadódik: mindhárom egyenes ugyanabba az irányba áll.' },
              { text: 'Ha $p \\parallel q$ és $p \\parallel r$, akkor $q$ és $r$ metszi egymást.', value: false, why: 'Ekkor $q \\parallel r$ is igaz, tehát nem metszik egymást.' },
              { text: 'Két párhuzamos egyenesnek nincs közös pontja.', value: true, why: 'A párhuzamosok soha nem találkoznak.' },
              { text: 'Ha két egyenes párhuzamos, akkor van olyan pont, amely mindkettőn rajta van.', value: false, why: 'A párhuzamos egyeneseknek éppen nincs közös pontjuk.' },
              { text: 'Ha $p \\parallel q$, akkor $q \\parallel p$.', value: true, why: 'A párhuzamosság kölcsönös.' },
              { text: 'Egy adott egyenessel egy ponton át csak egy párhuzamos húzható.', value: true, why: 'A párhuzamos egyetlen.' },
              { text: 'Ha két egyenes ugyanarra a harmadikra párhuzamos, akkor egymással is párhuzamosak.', value: true, why: 'Ez a párhuzamosság továbbadása (tranzitivitás).' },
              { text: 'Két párhuzamos egyenesnek pontosan egy közös pontja van.', value: false, why: 'A párhuzamosoknak nincs közös pontjuk.' },
            ]
          : [
              { text: 'Ha $p \\parallel q$, és az $r$ egyenes metszi $p$-t, akkor $r$ metszi $q$-t is.', value: true, why: 'A $q$ ugyanabba az irányba áll, mint a $p$, ezért az $r$ mindkettőt elmetszi.' },
              { text: 'Két egyenes a síkban vagy metszi egymást, vagy párhuzamos.', value: true, why: 'A síkban két egyenesnek ez a két lehetséges helyzete van.' },
              { text: 'Ha két egyenes nem párhuzamos, akkor van metszéspontjuk.', value: true, why: 'A nem párhuzamos egyenesek összetartók, ezért metszik egymást.' },
              { text: 'A síkon két egyenesnek lehet két metszéspontja.', value: false, why: 'Két egyenesnek legfeljebb egy közös pontja lehet.' },
              { text: 'Egy egyenes a síkot két félsíkra osztja.', value: true, why: 'Az egyenes két oldalán levő pontok két félsíkot alkotnak.' },
              { text: 'Két metsző egyenes a síkot négy részre osztja.', value: true, why: 'A négy rész a két egyenes négy szögletében van.' },
              { text: 'Három egyenes a síkot mindig hét részre osztja.', value: false, why: 'Csak általános helyzetben hét rész; párhuzamosoknál vagy egy ponton átmenő egyeneseknél kevesebb.' },
              { text: 'A háromszög a síknak egy része, amelyet három szakasz határol.', value: true, why: 'A háromszög három oldala három szakasz.' },
              { text: 'A paralelogramma a síknak egy része, amelyet négy szakasz határol.', value: true, why: 'A paralelogrammát négy oldalszakasz határolja.' },
              { text: 'Ha $p \\parallel q$ és $r \\parallel s$, akkor $p$ és $r$ biztosan metszi egymást.', value: false, why: 'Lehet, hogy $p$ és $r$ is párhuzamos; akkor nem metszik egymást.' },
              { text: 'Négy párhuzamos egyenes a síkot öt részre osztja.', value: true, why: 'Négy párhuzamos egyenes öt sávot hoz létre.' },
              { text: 'Négy egyenes a síkot legfeljebb 11 részre oszthatja.', value: true, why: 'Általános helyzetben négy egyenes 11 részt ad; ennél több nem lehet.' },
              { text: 'Három párhuzamos egyenes a síkot négy részre osztja.', value: true, why: 'Három párhuzamos egyenes négy sávot hoz létre.' },
              { text: 'Három egy ponton átmenő egyenes a síkot hat részre osztja.', value: true, why: 'A három egyenes hat „cikkre” osztja a síkot.' },
            ];
    const s = rng.pick(pool);
    return {
      prompt: tex`Igaz vagy hamis?\n\n${s.text}`,
      answer: { type: 'truefalse', value: s.value },
      hint: 'Gondold át, mit tudsz a metsző és a párhuzamos egyenesekről, illetve a sík részeiről!',
      solution: [s.why, `Az állítás **${s.value ? 'igaz' : 'hamis'}**.`],
    };
  },
};

/** The solution steps for counting intersection points. */
function intersectionSteps(lines: LineDef[], n: number): string[] {
  const k = lines.length;
  const pairsTotal = (k * (k - 1)) / 2;
  const par = parallelPairs(lines);
  if (n === 0) return ['Az egyenesek párhuzamosak, ezért soha nem találkoznak.', 'Nincs közös pontjuk, tehát **0 metszéspont** van.'];
  const steps: string[] = [tex`${Article(k)} ${num(k)} egyenesből ${num(pairsTotal)} egyenespár alkotható.`];
  if (par.length > 0)
    steps.push(tex`Ebből ${num(par.length)} pár párhuzamos (${par.map(([a, b]) => `$${a}$–$${b}$`).join(', ')}): ezeknek nincs metszéspontjuk.`);
  const crossings = pairsTotal - par.length;
  if (crossings > n) steps.push('Több egyenes megy át ugyanazon a ponton: ezt a pontot csak egyszer számoljuk.');
  steps.push(tex`Összesen **${num(n)} metszéspont** van az ábrán.`);
  return steps;
}

/** Number of intersection points of 2–4 lines, from the figure. */
const intersections: GeneratorDef = {
  id: 'intersections',
  title: 'Metszéspontok száma',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kinds: ConfigKind[] =
      level === 1 ? ['cross2', 'par2', 'par3', 'par2+1'] : level === 2 ? ['gen3', 'conc3', 'grid', 'par3+1'] : ['gen4', 'par2+2', 'conc3+1', 'conc4'];
    const lines = randomConfig(rng, rng.pick(kinds));
    const n = intersectionPoints(lines).length;
    return {
      prompt: tex`Hány metszéspontja van az ábrán látható ${num(lines.length)} egyenesnek?`,
      figure: linesFigure(lines),
      answer: { type: 'number', value: n },
      inputLabel: 'metszéspont =',
      hint: 'Keresd meg az összes pontot, ahol két egyenes találkozik. A párhuzamosoknak nincs metszéspontjuk.',
      solution: intersectionSteps(lines, n),
    };
  },
};

/** Number of regions the plane is cut into by 2–4 lines, from the figure. */
const regions: GeneratorDef = {
  id: 'regions',
  title: 'A sík részei egyenesekkel',
  levels: [1, 2, 3],
  generate(rng, level): Question {
    const kinds: ConfigKind[] =
      level === 1 ? ['cross2', 'par2', 'par3'] : level === 2 ? ['gen3', 'conc3', 'par2+1'] : ['gen4', 'par2+2', 'grid', 'conc3+1', 'par3+1'];
    const lines = randomConfig(rng, rng.pick(kinds));
    const regionsN = regionCount(lines);
    const steps: string[] = ['Az első egyenes 2 részre osztja a síkot.'];
    let running = 2;
    for (let i = 1; i < lines.length; i++) {
      const add = newRegions(lines, i);
      running += add;
      steps.push(tex`${Article(lines[i].label)} $${lines[i].label}$ egyenes ${num(add)} új részt hoz létre, így ${num(running)} rész lesz.`);
    }
    steps.push(tex`A síkot összesen **${num(regionsN)} részre** osztják az egyenesek.`);
    return {
      prompt: tex`Hány részre osztja a síkot az ábrán látható ${num(lines.length)} egyenes?`,
      figure: linesFigure(lines),
      answer: { type: 'number', value: regionsN },
      inputLabel: 'rész =',
      hint: 'Számold meg az ábrán a sík részeit! Figyeld, hány új rész keletkezik minden új egyenessel.',
      solution: steps,
    };
  },
};

/** Naming triangles and parallelograms, and their sides. */
const shapeName: GeneratorDef = {
  id: 'shape-name',
  title: 'Háromszögek és paralelogrammák jelölése',
  levels: [1, 2],
  generate(rng, level): Question {
    if (level === 1) {
      const [A, B, C] = rng.pick([
        ['A', 'B', 'C'],
        ['K', 'L', 'M'],
        ['P', 'Q', 'R'],
        ['D', 'E', 'F'],
      ]);
      const apex: XY = [rng.int(5, 45) / 10, rng.int(28, 42) / 10];
      const sides = [A + B, B + C, C + A];
      const figure: Figure = {
        type: 'geometry',
        points: { [A]: at(0, 0), [B]: at(5.5, 0), [C]: apex },
        items: [{ kind: 'polygon', points: [A, B, C], fill: 'accent', sideLabels: sides }],
      };
      const mode = rng.pick(['opposite', 'both'] as const);
      if (mode === 'both') {
        const side = rng.pick(sides);
        const [u, v] = [side[0], side[1]];
        return {
          prompt: tex`Melyik oldalnak végpontja ${article(u)} $${u}$ és ${article(v)} $${v}$ csúcs is?`,
          figure,
          answer: textChoice(`$${side}$`, sides.filter((x) => x !== side).map((x) => `$${x}$`)),
          hint: 'Az oldal neve a két végpontjának betűjéből áll.',
          solution: [tex`${Article(side)} $${side}$ oldal két végpontja $${u}$ és $${v}$.`, tex`A válasz: **$${side}$**.`],
        };
      }
      const missing = rng.pick([A, B, C]);
      const correct = sides.find((x) => !x.includes(missing))!;
      return {
        prompt: tex`Melyik oldalnak nem végpontja ${article(missing)} $${missing}$ csúcs?`,
        figure,
        answer: textChoice(`$${correct}$`, sides.filter((x) => x !== correct).map((x) => `$${x}$`)),
        hint: tex`Keresd meg azt az oldalt, amelynek a nevében nem szerepel ${article(missing)} $${missing}$ betű!`,
        solution: [
          tex`${Article(missing)} $${missing}$ csúcs a két szomszédos oldalnak végpontja.`,
          tex`${Article(correct)} $${correct}$ oldalnak egyik végpontja sem $${missing}$: ez a csúccsal szemközti oldal.`,
        ],
      };
    }
    const v = rng.pick([
      ['A', 'B', 'C', 'D'],
      ['K', 'L', 'M', 'N'],
      ['P', 'Q', 'R', 'S'],
      ['E', 'F', 'G', 'H'],
    ]);
    const w = rng.int(50, 65) / 10;
    const shift = rng.pick([-1.4, -0.8, 0.8, 1.6]);
    const h = rng.int(25, 34) / 10;
    const ox = shift < 0 ? -shift : 0;
    const figure: Figure = {
      type: 'geometry',
      points: { [v[0]]: at(ox, 0), [v[1]]: at(ox + w, 0), [v[2]]: at(ox + w + shift, h), [v[3]]: at(ox + shift, h) },
      items: [{ kind: 'polygon', points: v, fill: 'accent', sideLabels: [v[0] + v[1], v[1] + v[2], v[2] + v[3], v[3] + v[0]] }],
    };
    const sides = [v[0] + v[1], v[1] + v[2], v[2] + v[3], v[3] + v[0]];
    const mode = rng.pick(['name', 'pair', 'parallel'] as const);
    if (mode === 'name') {
      const nm = (idx: number[]) => `$${idx.map((i) => v[i]).join('')}$`;
      return {
        prompt: 'Melyik név jelöli helyesen az ábrán látható paralelogrammát?',
        figure,
        answer: textChoice(nm([0, 1, 2, 3]), [nm([0, 1, 3, 2]), nm([0, 2, 1, 3]), nm([0, 2, 3, 1])]),
        hint: 'A csúcsokat a kerület mentén, egymás után kell felsorolni.',
        solution: [
          tex`A paralelogramma csúcsai a kerület mentén: $${v[0]}$, $${v[1]}$, $${v[2]}$, $${v[3]}$.`,
          tex`Ezért a helyes név ${nm([0, 1, 2, 3])}; a többi felsorolás átlón át ugrik.`,
        ],
      };
    }
    if (mode === 'pair') {
      const first = rng.int(0, 1);
      const [s1, s2] = [sides[first], sides[first + 2]];
      const wrongs = [`$${sides[0]}$ és $${sides[1]}$`, `$${sides[1]}$ és $${sides[2]}$`, `$${sides[2]}$ és $${sides[3]}$`];
      return {
        prompt: 'Melyik oldalpár párhuzamos az ábrán látható paralelogrammán?',
        figure,
        answer: textChoice(`$${s1}$ és $${s2}$`, rng.sample(wrongs, 2)),
        hint: 'A paralelogrammának két párhuzamos oldalpárja van: a szemközti oldalak.',
        solution: [
          'A paralelogramma szemközti oldalai párhuzamosak.',
          tex`${Article(s1)} $${s1}$ és ${article(s2)} $${s2}$ szemközti oldalak, ezért **párhuzamosak**; a szomszédos oldalak nem azok.`,
        ],
      };
    }
    const i = rng.int(0, 3);
    const opposite = sides[(i + 2) % 4];
    return {
      prompt: tex`Melyik oldal párhuzamos ${article(sides[i])} $${sides[i]}$ oldallal?`,
      figure,
      answer: textChoice(`$${opposite}$`, [`$${sides[(i + 1) % 4]}$`, `$${sides[(i + 3) % 4]}$`, 'egyik sem']),
      hint: 'A paralelogramma szemközti oldalai párhuzamosak.',
      solution: [
        'A paralelogrammában a szemközti oldalak párhuzamosak.',
        tex`${Article(sides[i])} $${sides[i]}$ oldallal szemközt ${article(opposite)} $${opposite}$ oldal van, ezért $${sides[i]} \parallel ${opposite}$.`,
      ],
    };
  },
};

// ---------------------------------------------------------------------------------------------
// 3. The lesson
// ---------------------------------------------------------------------------------------------

export default defineSubtopic({
  id: 'g5-mertani-alapfogalmak-02',
  goals: [
    'felismerni a metsző és a párhuzamos egyeneseket,',
    'megszerkeszteni egy ponton át a párhuzamost,',
    'megszámolni a metszéspontokat és a sík részeit,',
    'felismerni a háromszögeket és a paralelogrammákat a sík részeiként.',
  ],
  parts: [
    {
      title: 'Két egyenes helyzete',
      steps: [
        {
          type: 'theory',
          title: 'Metsző és párhuzamos egyenesek',
          body: 'Két egyenes vagy **metszi** egymást, vagy **párhuzamos**. A metsző egyeneseknek egy közös pontjuk van; a párhuzamosoknak nincs. Jelölés: $p \\parallel q$.',
          figure: twoLinesFigure,
          remember: 'A metszéspont mindkét egyenesen rajta van.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $p$ és a $q$ egyenesek metszik egymást.',
            figure: parallelFigure,
            answer: { type: 'truefalse', value: false },
            hint: 'Nézd meg, találkozik-e a két egyenes az ábrán!',
            solution: ['Az ábrán a $p$ és a $q$ egyenes párhuzamos: soha nem találkozik.', 'Az állítás **hamis**.'],
          },
        },
        { type: 'practice', generator: 'line-position', level: 1, count: 2 },
        { type: 'practice', generator: 'position-tf', level: 1 },
      ],
    },
    {
      title: 'Párhuzamos szerkesztése',
      steps: [
        {
          type: 'theory',
          title: 'Egyetlen párhuzamos',
          body: 'Egy ponton át az adott egyenessel **pontosan egy** párhuzamos húzható. Két vonalzóval szerkesztjük meg: az egyiket a p egyeneshez illesztjük, a másikat ehhez toljuk.',
          remember: 'Egy ponton át egy párhuzamos van.',
        },
        {
          type: 'theory',
          title: 'Két vonalzóval',
          body: 'A derékszögű vonalzót a $p$ egyenesre illeszted, a másikat mellé. A derékszögűt a $P$ pontig tolod, majd a vonalzó éle mentén meghúzod a párhuzamost.',
          figure: parallelConstruction,
        },
        {
          type: 'check',
          question: {
            prompt: 'Egy ponton át az adott egyenessel pontosan egy párhuzamos egyenes húzható.',
            answer: { type: 'truefalse', value: true },
            hint: 'Gondolj a két vonalzós szerkesztésre: hány helyen lehet a $P$ ponton át párhuzamost húzni?',
            solution: ['A pont és az egyenes iránya egyetlen párhuzamost határoz meg.', 'Az állítás **igaz**.'],
          },
        },
        { type: 'practice', generator: 'line-position', level: 2 },
        { type: 'practice', generator: 'position-tf', level: 2 },
      ],
    },
    {
      title: 'A sík részei',
      steps: [
        {
          type: 'theory',
          title: 'Félsíkok',
          body: 'Egy egyenes a síkot két **félsíkra** osztja. A vonal két oldalán levő pontok különböző félsíkban vannak.',
          figure: halfPlaneFigure,
          remember: 'Egy egyenes → két félsík.',
        },
        {
          type: 'check',
          question: {
            prompt: 'A $p$ egyenes a síkot két félsíkra osztja.',
            figure: halfPlaneFigure,
            answer: { type: 'truefalse', value: true },
            hint: 'Nézd meg, hány oldala van a $p$ egyenesnek!',
            solution: ['A $p$ egyenes két oldalán levő pontok két különböző félsíkot alkotnak.', 'Az állítás **igaz**.'],
          },
        },
        {
          type: 'example',
          title: 'Három egyenes a síkon',
          problem: 'Hány részre osztja a síkot az ábrán látható három egyenes?',
          figure: linesFigure(threeGeneral()),
          steps: [
            { text: 'Az első egyenes 2 részre osztja a síkot.' },
            { text: 'A második egyenes 2 új részt hoz létre: így 4 rész lesz.' },
            { text: 'A harmadik egyenes 3 új részt hoz létre: így 7 rész lesz.' },
          ],
          answer: 'Három egyenes **7 részre** osztja a síkot.',
        },
        { type: 'practice', generator: 'regions', level: 1, count: 2 },
        { type: 'practice', generator: 'regions', level: 2 },
      ],
    },
    {
      title: 'Sok egyenes, sok rész',
      steps: [
        {
          type: 'theory',
          title: 'Háromszögek és paralelogrammák',
          body: 'A háromszöget három szakasz határolja; csúcsai $K$, $L$, $M$. A paralelogrammát négy szakasz határolja; szemközti oldalai párhuzamosak.',
          figure: shapePairFigure,
          remember: 'Háromszög: $KLM$ · paralelogramma: $ABCD$',
        },
        {
          type: 'check',
          question: {
            prompt: 'Melyik oldal párhuzamos az $AB$ oldallal?',
            figure: parallelogramRegion,
            answer: textChoice('$CD$', ['$BC$', '$DA$', 'egyik sem']),
            hint: 'A paralelogramma szemközti oldalai párhuzamosak.',
            solution: ['A paralelogramma szemközti oldalai párhuzamosak.', 'Az $AB$ oldallal szemközt a $CD$ oldal van: $AB \\parallel CD$.'],
          },
        },
        {
          type: 'example',
          title: 'Négy egyenes metszéspontjai',
          problem: 'Hány metszéspontja van az ábrán látható négy egyenesnek?',
          figure: linesFigure(fourGeneral()),
          steps: [
            { text: 'Négy egyenesből $4 \\cdot 3 : 2 = 6$ egyenespár van.' },
            { text: 'Nincs párhuzamos, és nincs három egy ponton: mind a 6 pár külön pontban metszi egymást.' },
            { text: 'Az ábrán valóban 6 metszéspont látható.' },
          ],
          answer: 'Négy egyenesnek **6 metszéspontja** van.',
        },
        { type: 'practice', generator: 'intersections', level: 1 },
        { type: 'practice', generator: 'intersections', level: 2 },
        { type: 'practice', generator: 'intersections', level: 3 },
        { type: 'practice', generator: 'regions', level: 3 },
        { type: 'practice', generator: 'shape-name', level: 2 },
        { type: 'practice', generator: 'position-tf', level: 3 },
      ],
    },
  ],
  generators: [linePosition, positionTf, intersections, regions, shapeName],
  miniTest: {
    items: [
      { generator: 'line-position', level: 2 },
      { generator: 'position-tf', level: 1 },
      { generator: 'intersections', level: 1 },
      { generator: 'regions', level: 2 },
      { generator: 'intersections', level: 3 },
      { generator: 'shape-name', level: 2 },
      { generator: 'regions', level: 3 },
    ],
    passPercent: 80,
  },
  daily: [
    { generator: 'line-position', level: 1 },
    { generator: 'position-tf', level: 1 },
    { generator: 'intersections', level: 1 },
    { generator: 'regions', level: 1 },
    { generator: 'shape-name', level: 1 },
    { generator: 'line-position', level: 2 },
    { generator: 'position-tf', level: 2 },
  ],
});
