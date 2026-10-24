/**
 * The 'net' figure ("testháló"): a solid unfolded into the plane, in true proportions.
 *
 * Layouts (world units, y up):
 * - cube / cuboid: a strip of the four lateral faces (left b×c, front a×c, right b×c, back a×c)
 *   with the bottom and the top (a×b) attached below and above the front face — a cross.
 * - triangularPrism: three a×h rectangles side by side, the two equilateral bases on the
 *   middle one (below and above).
 * - squarePyramid: the a×a base in the middle, one isosceles triangle (height s) on every side.
 * - cylinder: a 2rπ × h rectangle with the two base circles touching its top and bottom edges
 *   in the middle.
 * - cone: a sector with radius s and central angle 360°·r/s (arc length 2rπ, pointing down),
 *   the base circle touching the middle of the arc.
 *
 * Outer edges are solid, fold lines (edges shared by two faces) thin and dashed. Base faces get
 * a stronger tint than the lateral ones when `colorFaces` is true (default).
 *
 * Labels by key — which keys exist depends on the net:
 *   cube a · cuboid a, b, c · triangularPrism a, h · squarePyramid a, s (s = height of a side
 *   face, drawn dashed with a right-angle marker) · cylinder r, h, a (a = the long side of the
 *   rectangle, e.g. '2rπ') · cone r, s.
 *
 * Engine file — content authors never need to touch this.
 */
import type { NetFigure } from './types';
import type { LayoutResult } from './index';
import { add, mid, mul, norm, perp, polar, sub, v, type Prim, type Vec } from './scene';
import { ALPHA, WIDTH, checkLabelObject, fail, pos } from './solids-common';

const T = 'net';
type Key = 'a' | 'b' | 'c' | 'h' | 'r' | 's';

const KEYS: Record<NetFigure['of'], readonly Key[]> = {
  cube: ['a'],
  cuboid: ['a', 'b', 'c'],
  triangularPrism: ['a', 'h'],
  squarePyramid: ['a', 's'],
  cylinder: ['r', 'h', 'a'],
  cone: ['r', 's'],
};
const NAME: Record<NetFigure['of'], string> = {
  cube: 'a cube net',
  cuboid: 'a cuboid net',
  triangularPrism: 'a triangular prism net',
  squarePyramid: 'a square pyramid net',
  cylinder: 'a cylinder net',
  cone: 'a cone net',
};

interface Face {
  pts: Vec[];
  base: boolean;
}

/** A label on a segment: `side` is a point on the side where the label should NOT go (the face). */
interface EdgeLabel {
  a: Vec;
  b: Vec;
  text: string;
  /** Put the label on the far side of this point (outside the face). */
  away?: Vec;
  /** Or an explicit direction. */
  dir?: Vec;
}

const keyOf = (p: Vec) => `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)}`;
const edgeKey = (a: Vec, b: Vec) => [keyOf(a), keyOf(b)].sort().join('|');

/** Outlines of polygon faces: edges used once are the boundary (solid), twice are folds (dashed). */
function polygonEdges(faces: Face[]): Prim[] {
  const count = new Map<string, { a: Vec; b: Vec; n: number }>();
  for (const f of faces) {
    for (let i = 0; i < f.pts.length; i++) {
      const a = f.pts[i];
      const b = f.pts[(i + 1) % f.pts.length];
      const k = edgeKey(a, b);
      const e = count.get(k);
      if (e) e.n++;
      else count.set(k, { a, b, n: 1 });
    }
  }
  const folds: Prim[] = [];
  const outer: Prim[] = [];
  for (const e of count.values()) {
    if (e.n > 1) folds.push({ t: 'seg', a: e.a, b: e.b, color: 'ink', w: WIDTH.fold, dash: 'dashed' });
    else outer.push({ t: 'seg', a: e.a, b: e.b, color: 'ink', w: WIDTH.edge });
  }
  return [...folds, ...outer];
}

function faceFills(faces: Face[], colorFaces: boolean): Prim[] {
  return faces.map((f) => ({
    t: 'poly' as const,
    pts: f.pts,
    closed: true,
    color: 'none' as const,
    fill: 'accent' as const,
    fillOpacity: f.base && colorFaces ? ALPHA.netBase : ALPHA.netSide,
  }));
}

function labelPrims(list: EdgeLabel[]): Prim[] {
  return list.map((l) => {
    const m = mid(l.a, l.b);
    let dir = l.dir;
    if (!dir) {
      let n = norm(perp(sub(l.b, l.a)));
      if (l.away) {
        const toFace = sub(l.away, m);
        if (n.x * toFace.x + n.y * toFace.y > 0) n = mul(n, -1);
      }
      dir = n;
    }
    return { t: 'label' as const, at: m, text: l.text, dir };
  });
}

const rect = (x0: number, y0: number, w: number, h: number): Vec[] => [v(x0, y0), v(x0 + w, y0), v(x0 + w, y0 + h), v(x0, y0 + h)];

// ---------------------------------------------------------------------------------------------

function boxNet(a: number, b: number, c: number, labels: Partial<Record<Key, string>>): { faces: Face[]; marks: EdgeLabel[] } {
  // strip: left (b), front (a), right (b), back (a); height c; bottom/top a×b on the front face
  const faces: Face[] = [
    { pts: rect(0, b, b, c), base: false },
    { pts: rect(b, b, a, c), base: false },
    { pts: rect(a + b, b, b, c), base: false },
    { pts: rect(a + 2 * b, b, a, c), base: false },
    { pts: rect(b, 0, a, b), base: true },
    { pts: rect(b, b + c, a, b), base: true },
  ];
  const marks: EdgeLabel[] = [];
  if (labels.a) marks.push({ a: v(b, 0), b: v(a + b, 0), text: labels.a, dir: v(0, -1) });
  if (labels.b) marks.push({ a: v(b, 0), b: v(b, b), text: labels.b, dir: v(-1, 0) });
  if (labels.c) marks.push({ a: v(0, b), b: v(0, b + c), text: labels.c, dir: v(-1, 0) });
  return { faces, marks };
}

function prismNet(a: number, h: number, labels: Partial<Record<Key, string>>): { faces: Face[]; marks: EdgeLabel[] } {
  const th = (a * Math.sqrt(3)) / 2;
  const faces: Face[] = [
    { pts: rect(0, 0, a, h), base: false },
    { pts: rect(a, 0, a, h), base: false },
    { pts: rect(2 * a, 0, a, h), base: false },
    { pts: [v(a, 0), v(1.5 * a, -th), v(2 * a, 0)], base: true },
    { pts: [v(a, h), v(2 * a, h), v(1.5 * a, h + th)], base: true },
  ];
  const marks: EdgeLabel[] = [];
  if (labels.a) marks.push({ a: v(0, 0), b: v(a, 0), text: labels.a, dir: v(0, -1) });
  if (labels.h) marks.push({ a: v(0, 0), b: v(0, h), text: labels.h, dir: v(-1, 0) });
  return { faces, marks };
}

function pyramidNet(a: number, s: number, labels: Partial<Record<Key, string>>): { faces: Face[]; marks: EdgeLabel[]; extra: Prim[] } {
  const k = a / 2;
  const sq = [v(-k, -k), v(k, -k), v(k, k), v(-k, k)];
  const faces: Face[] = [
    { pts: sq, base: true },
    { pts: [v(-k, -k), v(0, -k - s), v(k, -k)], base: false },
    { pts: [v(k, -k), v(k + s, 0), v(k, k)], base: false },
    { pts: [v(k, k), v(0, k + s), v(-k, k)], base: false },
    { pts: [v(-k, k), v(-k - s, 0), v(-k, -k)], base: false },
  ];
  const marks: EdgeLabel[] = [];
  const extra: Prim[] = [];
  // 'a' sits on the bottom base edge, inside the square (every base edge is a fold line)
  if (labels.a) marks.push({ a: v(-k, -k), b: v(k, -k), text: labels.a, dir: v(0, 1) });
  if (labels.s) {
    // the height of the right-hand side face, dashed, with its right-angle marker
    const f = v(k, 0);
    const apex = v(k + s, 0);
    extra.push({ t: 'seg', a: f, b: apex, color: 'ink', w: WIDTH.aux, dash: 'dashed' });
    extra.push({ t: 'rightAngle', at: f, p1: apex, p2: v(k, k) });
    marks.push({ a: f, b: apex, text: labels.s, dir: v(0, -1) });
  }
  return { faces, marks, extra };
}

// ---------------------------------------------------------------------------------------------

export function layoutNet(fig: NetFigure): LayoutResult {
  const of = fig.of;
  if (!of || !(of in KEYS)) fail(T, `"of" must be one of ${Object.keys(KEYS).map((k) => `'${k}'`).join(', ')} (got ${JSON.stringify(of)})`);
  const labels = checkLabelObject(T, fig.labels, KEYS[of], NAME[of]);
  const colorFaces = fig.colorFaces ?? true;

  if (of === 'cube' || of === 'cuboid' || of === 'triangularPrism' || of === 'squarePyramid') {
    let faces: Face[];
    let marks: EdgeLabel[];
    let extra: Prim[] = [];
    if (of === 'cube') {
      const a = pos(T, 'a', fig.a);
      ({ faces, marks } = boxNet(a, a, a, labels));
    } else if (of === 'cuboid') {
      ({ faces, marks } = boxNet(pos(T, 'a', fig.a), pos(T, 'b', fig.b), pos(T, 'c', fig.c), labels));
    } else if (of === 'triangularPrism') {
      ({ faces, marks } = prismNet(pos(T, 'a', fig.a), pos(T, 'h', fig.h), labels));
    } else {
      const a = pos(T, 'a', fig.a);
      const s = pos(T, 's', fig.s);
      if (s <= a / 2) fail(T, `"s" (height of a side face) must be greater than a / 2 = ${a / 2}, otherwise the faces cannot meet at the apex (got ${s})`);
      ({ faces, marks, extra } = pyramidNet(a, s, labels));
    }
    return [...faceFills(faces, colorFaces), ...polygonEdges(faces), ...extra, ...labelPrims(marks)];
  }

  if (of === 'cylinder') {
    const r = pos(T, 'r', fig.r);
    const h = pos(T, 'h', fig.h);
    const w = 2 * Math.PI * r;
    const ct = v(w / 2, h + r);
    const cb = v(w / 2, -r);
    const baseFill = colorFaces ? ALPHA.netBase : ALPHA.netSide;
    const prims: Prim[] = [
      { t: 'poly', pts: rect(0, 0, w, h), closed: true, color: 'none', fill: 'accent', fillOpacity: ALPHA.netSide },
      { t: 'circle', c: ct, r, color: 'none', fill: 'accent', fillOpacity: baseFill, obstacle: false },
      { t: 'circle', c: cb, r, color: 'none', fill: 'accent', fillOpacity: baseFill, obstacle: false },
      { t: 'poly', pts: rect(0, 0, w, h), closed: true, color: 'ink', w: WIDTH.edge },
      { t: 'circle', c: ct, r, color: 'ink', w: WIDTH.edge },
      { t: 'circle', c: cb, r, color: 'ink', w: WIDTH.edge },
    ];
    const marks: EdgeLabel[] = [];
    if (labels.r) {
      // radius of the top circle, to the upper right
      const end = polar(ct, r, 35);
      prims.push({ t: 'seg', a: ct, b: end, color: 'ink', w: WIDTH.aux }, { t: 'dot', at: ct, r: 2.4 });
      marks.push({ a: ct, b: end, text: labels.r, away: add(ct, v(r * 0.2, -r)) });
    }
    if (labels.h) marks.push({ a: v(0, 0), b: v(0, h), text: labels.h, dir: v(-1, 0) });
    // the long side: under the left half of the bottom edge (the bottom circle touches its middle)
    if (labels.a) marks.push({ a: v(0, 0), b: v(w / 2, 0), text: labels.a, dir: v(0, -1) });
    return [...prims, ...labelPrims(marks)];
  }

  // cone
  const r = pos(T, 'r', fig.r);
  const s = pos(T, 's', fig.s);
  if (r >= s) fail(T, `"r" must be smaller than "s" (the slant height is the longest segment of a cone; got r = ${r}, s = ${s})`);
  const angle = (360 * r) / s;
  const from = 270 - angle / 2;
  const to = 270 + angle / 2;
  const apex = v(0, 0);
  const cb = v(0, -s - r);
  const baseFill = colorFaces ? ALPHA.netBase : ALPHA.netSide;
  const prims: Prim[] = [
    { t: 'arc', c: apex, r: s, from, to, sector: true, color: 'none', fill: 'accent', fillOpacity: ALPHA.netSide },
    { t: 'circle', c: cb, r, color: 'none', fill: 'accent', fillOpacity: baseFill, obstacle: false },
    { t: 'arc', c: apex, r: s, from, to, sector: true, color: 'ink', w: WIDTH.edge },
    { t: 'circle', c: cb, r, color: 'ink', w: WIDTH.edge },
    { t: 'dot', at: apex, r: 2.4 },
  ];
  const marks: EdgeLabel[] = [];
  if (labels.s) {
    const end = polar(apex, s, from);
    marks.push({ a: apex, b: end, text: labels.s, away: polar(apex, s * 0.5, 270) });
  }
  if (labels.r) {
    const end = add(cb, v(r, 0));
    prims.push({ t: 'seg', a: cb, b: end, color: 'ink', w: WIDTH.aux }, { t: 'dot', at: cb, r: 2.4 });
    marks.push({ a: cb, b: end, text: labels.r, dir: v(0, -1) });
  }
  return [...prims, ...labelPrims(marks)];
}
