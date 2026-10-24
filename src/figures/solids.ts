/**
 * 3D solids — the 'solid' figure: cube, cuboid, prism, pyramid, cylinder, cone, sphere.
 * (The 'net' figure lives in solids-net.ts and is re-exported from here.)
 *
 * Projection
 * - Polyhedra (cube, cuboid, prism, pyramid): oblique cabinet projection. Width (x) to the
 *   right and height (z) up keep their true length; depth (y) is drawn up-right at 45°,
 *   shortened to 1/2. Faces are classified by a back-face test against the projection
 *   direction (exact for every convex polyhedron, any n); an edge is hidden (dashed) when both
 *   of its faces are hidden.
 * - Round solids (cylinder, cone, sphere): seen from slightly above — a horizontal circle of
 *   radius r is a flat ellipse with semi-axes r and 0.3·r; heights stay true. The back half of
 *   a hidden base ellipse is dashed; the cone's sides are the exact tangents from the apex.
 *
 * Every special segment (radius, height, slant height, diagonals, apothem, …) is built from
 * 3D points of the solid and then projected, so highlighted right triangles are exact.
 *
 * Engine file — content authors never need to touch this.
 */
import type { SolidFigure, SolidSegment, SolidTriangle } from './types';
import type { LayoutResult } from './index';
import { dist, dot, lerp, mid, mul, norm, perp, sub, v, type Prim, type Vec } from './scene';
import {
  ALPHA,
  LETTERS,
  WIDTH,
  checkLabelObject,
  ellipsePts,
  fail,
  mid3,
  newell,
  p3,
  pos,
  dot3,
  wholeIn,
  type P3,
} from './solids-common';

export { layoutNet } from './solids-net';

// ---------------------------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------------------------

/** Cabinet projection: depth drawn at 45°, shortened to 1/2. */
const DEPTH_X = 0.5 * Math.SQRT1_2;
const DEPTH_Y = 0.5 * Math.SQRT1_2;
const projOblique = (p: P3): Vec => v(p.x + DEPTH_X * p.y, p.z + DEPTH_Y * p.y);
/** Direction from the solid toward the viewer: projOblique maps -VIEW to (0, 0). */
const VIEW_OBLIQUE = p3(DEPTH_X, -1, DEPTH_Y);

/** Round solids: a horizontal circle of radius r → ellipse with semi-axes r and 0.3·r. */
const ROUND_SQUASH = 0.3;
const projRound = (q: number) => (p: P3): Vec => v(p.x, p.z + q * p.y);

// ---------------------------------------------------------------------------------------------
// Model types
// ---------------------------------------------------------------------------------------------

const SHAPES = ['cube', 'cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere'] as const;
type Shape = (typeof SHAPES)[number];
const SEGMENTS: readonly SolidSegment[] = ['a', 'b', 'c', 'h', 'r', 'd', 's', 'edge', 'spaceDiagonal', 'faceDiagonal', 'baseDiagonal', 'apothem'];
const TRIANGLES: readonly SolidTriangle[] = ['axial', 'edge', 'diagonal', 'face'];
const SHAPE_NAME: Record<Shape, string> = {
  cube: 'a cube',
  cuboid: 'a cuboid',
  prism: 'a prism',
  pyramid: 'a pyramid',
  cylinder: 'a cylinder',
  cone: 'a cone',
  sphere: 'a sphere',
};

/** A segment the figure can draw / label. Points are 3D; `dir` is the preferred label side (2D, y up). */
interface SegDef {
  a: P3;
  b: P3;
  /** Inside the solid or behind a face → dashed. */
  hidden: boolean;
  /** Already drawn as an edge/silhouette of the body (only re-drawn when highlighted). */
  edge?: boolean;
  dir: Vec;
  /** Label anchor along a→b (default 0.5). */
  t?: number;
  /** Right-angle marker that belongs to this segment (e.g. the height's foot). */
  marker?: { at: P3; p1: P3; p2: P3 };
  /** Points that get a small dot (e.g. the base center). */
  dots?: P3[];
}

/** A right triangle: side i is pts[i] → pts[i+1]; the right angle is at pts[right]. */
interface TriDef {
  pts: [P3, P3, P3];
  right: 0 | 1 | 2;
  hidden: [boolean, boolean, boolean];
}

interface VertexDef {
  at: P3;
  name: string;
  /** Preferred label direction; default: away from the solid's center. */
  dir?: Vec;
  /** Draw a dot (centers of round solids). */
  dot?: boolean;
}

interface Model {
  proj: (p: P3) => Vec;
  fills: Prim[];
  hidden: Prim[];
  visible: Prim[];
  segs: Partial<Record<SolidSegment, SegDef>>;
  tris: Partial<Record<SolidTriangle, TriDef>>;
  verts: VertexDef[];
  center: P3;
}

/** What else is drawn — some segments pick their label side / marker leg from it. */
interface Ctx {
  drawn: Set<SolidSegment>;
  tri?: SolidTriangle;
  fill: boolean;
}

// ---------------------------------------------------------------------------------------------
// Small 2D helpers
// ---------------------------------------------------------------------------------------------

/** Unit normal of segment AB (2D) on the side where `pick(n)` is positive. */
function sideOf(A: Vec, B: Vec, pick: (n: Vec) => number): Vec {
  let n = norm(perp(sub(B, A)));
  if (pick(n) < 0 || (pick(n) === 0 && n.x < 0)) n = mul(n, -1);
  return n;
}
const below = (A: Vec, B: Vec) => sideOf(A, B, (n) => -n.y);
const leftOf = (A: Vec, B: Vec) => sideOf(A, B, (n) => -n.x);
const rightOf = (A: Vec, B: Vec) => sideOf(A, B, (n) => n.x);

// ---------------------------------------------------------------------------------------------
// Polyhedra
// ---------------------------------------------------------------------------------------------

interface Face {
  idx: number[];
  role: 'top' | 'bottom' | 'side';
}

interface PolyBody {
  fills: Prim[];
  hidden: Prim[];
  visible: Prim[];
  faceVisible: boolean[];
  edgeHidden: (i: number, j: number) => boolean;
}

/** Back-face test, fills (painter's order) and edges of a convex polyhedron. */
function polyBody(V: P3[], faces: Face[], fill: boolean): PolyBody {
  const P = projOblique;
  const faceVisible = faces.map((f) => {
    const n = newell(f.idx.map((i) => V[i]));
    const l = Math.hypot(n.x, n.y, n.z);
    return dot3(n, VIEW_OBLIQUE) > 1e-9 * l;
  });
  const edges = new Map<string, { i: number; j: number; faces: number[] }>();
  const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);
  faces.forEach((f, fi) =>
    f.idx.forEach((i, k) => {
      const j = f.idx[(k + 1) % f.idx.length];
      const e = edges.get(key(i, j)) ?? { i, j, faces: [] };
      e.faces.push(fi);
      edges.set(key(i, j), e);
    }),
  );
  const edgeHidden = (i: number, j: number) => {
    const e = edges.get(key(i, j));
    if (!e) throw new Error(`solid: internal error, no edge ${i}-${j}`);
    return !e.faces.some((fi) => faceVisible[fi]);
  };

  const fills: Prim[] = [];
  if (fill) {
    // Painter's order: hidden bottom base, visible lateral faces back to front, top base.
    const depth = (f: Face) => f.idx.reduce((s, i) => s + V[i].y, 0) / f.idx.length;
    const order = faces
      .map((f, i) => ({ f, i }))
      .filter(({ f, i }) => f.role === 'bottom' || faceVisible[i])
      .sort((x, y) => {
        const rank = (f: Face) => (f.role === 'bottom' ? 0 : f.role === 'side' ? 1 : 2);
        return rank(x.f) - rank(y.f) || depth(y.f) - depth(x.f);
      });
    for (const { f } of order) {
      fills.push({ t: 'poly', pts: f.idx.map((i) => P(V[i])), closed: true, color: 'none', fill: 'accent', fillOpacity: ALPHA[f.role] });
    }
  }
  const hidden: Prim[] = [];
  const visible: Prim[] = [];
  for (const e of edges.values()) {
    const h = !e.faces.some((fi) => faceVisible[fi]);
    const seg: Prim = { t: 'seg', a: P(V[e.i]), b: P(V[e.j]), color: 'ink', w: h ? WIDTH.hidden : WIDTH.edge, dash: h ? 'dashed' : 'solid' };
    (h ? hidden : visible).push(seg);
  }
  return { fills, hidden, visible, faceVisible, edgeHidden };
}

/** A base polygon in the horizontal plane (x right, y depth), centered at the origin. */
interface Base2D {
  pts: { x: number; y: number }[];
  /** Rectangle (or square): vertices A front-left, B front-right, C back-right, D back-left. */
  rect: boolean;
  n: number;
}

/** Angle (degrees) of a vertical face normal for which that face is seen edge-on. */
const EDGE_ON = (Math.atan(DEPTH_X) * 180) / Math.PI;

/**
 * Rotation of a regular prism base (degrees). 0 puts the front edge AB parallel to the picture
 * plane; for n = 5, 7, 10, 11 a lateral face would then be seen almost edge-on (a sliver with a
 * dashed line right next to a solid one), so the base is turned a few degrees.
 */
function prismBaseRotation(n: number): number {
  const minDist = (phi: number) => {
    let m = Infinity;
    for (let k = 0; k < n; k++) {
      const d = ((((-90 + phi + (360 * k) / n - EDGE_ON) % 180) + 180) % 180);
      m = Math.min(m, d, 180 - d);
    }
    return m;
  };
  let best = 0;
  let bestScore = -Infinity;
  for (let step = 0; step <= 60; step++) {
    for (const sgn of [1, -1]) {
      const phi = sgn * step * 0.5;
      const score = Math.min(minDist(phi), 9) - 0.01 * Math.abs(phi);
      if (score > bestScore + 1e-9) {
        bestScore = score;
        best = phi;
      }
    }
  }
  return best;
}

function regularBase(n: number, a: number, rotation: number): Base2D {
  const R = a / (2 * Math.sin(Math.PI / n));
  const pts: { x: number; y: number }[] = [];
  for (let k = 0; k < n; k++) {
    const t = ((-90 - 180 / n + rotation + (360 * k) / n) * Math.PI) / 180;
    pts.push({ x: R * Math.cos(t), y: R * Math.sin(t) });
  }
  return { pts, rect: false, n };
}

function rectBase(a: number, b: number): Base2D {
  return {
    pts: [
      { x: -a / 2, y: -b / 2 },
      { x: a / 2, y: -b / 2 },
      { x: a / 2, y: b / 2 },
      { x: -a / 2, y: b / 2 },
    ],
    rect: true,
    n: 4,
  };
}

type PolyFig = Extract<SolidFigure, { shape: 'prism' | 'pyramid' }>;

function parseBase(T: string, fig: PolyFig, rotate: boolean): Base2D {
  const a = pos(T, 'a', fig.a);
  const base = fig.base as string;
  const fixedN: Record<string, number> = { triangle: 3, square: 4, hexagon: 6 };
  if (base === undefined) fail(T, '"base" is required (\'triangle\', \'square\', \'rectangle\', \'hexagon\' or \'regular\' with "n")');
  if (base !== 'rectangle' && fig.b !== undefined) fail(T, `"b" is only used with base: 'rectangle' (got base '${base}')`);
  if (base in fixedN && fig.n !== undefined && fig.n !== fixedN[base])
    fail(T, `"n" must be ${fixedN[base]} for base '${base}' (or leave it out; use base: 'regular' for other n)`);
  let n: number;
  switch (base) {
    case 'rectangle':
      if (fig.n !== undefined && fig.n !== 4) fail(T, `"n" must be 4 for base 'rectangle' (or leave it out)`);
      return rectBase(a, pos(T, 'b', fig.b));
    case 'square':
      return rectBase(a, a);
    case 'triangle':
    case 'hexagon':
      n = fixedN[base];
      break;
    case 'regular':
      n = wholeIn(T, 'n', fig.n, 3, 12);
      if (n === 4) return rectBase(a, a);
      break;
    default:
      fail(T, `unknown "base" ${JSON.stringify(base)} (use 'triangle', 'square', 'rectangle', 'hexagon' or 'regular' with "n")`);
  }
  return regularBase(n, a, rotate ? prismBaseRotation(n) : 0);
}

/** Index of the base vertex drawn furthest to the right (its side edge is on the silhouette). */
function rightmost(P: (p: P3) => Vec, V: P3[], n: number): number {
  let r = 0;
  for (let k = 1; k < n; k++) if (P(V[k]).x > P(V[r]).x + 1e-9) r = k;
  return r;
}

/** Cube, cuboid and prism (straight prism over `base`, height H). */
function buildPrism(shape: 'cube' | 'cuboid' | 'prism', base: Base2D, H: number, ctx: Ctx): Model {
  const P = projOblique;
  const n = base.n;
  const V: P3[] = [...base.pts.map((q) => p3(q.x, q.y, 0)), ...base.pts.map((q) => p3(q.x, q.y, H))];
  const ids = [...Array(n).keys()];
  const faces: Face[] = [
    { idx: [...ids].reverse(), role: 'bottom' },
    { idx: ids.map((k) => n + k), role: 'top' },
    ...ids.map((k): Face => ({ idx: [k, (k + 1) % n, n + ((k + 1) % n), n + k], role: 'side' })),
  ];
  const body = polyBody(V, faces, ctx.fill);
  const center = p3(0, 0, H / 2);
  const c2 = P(center);
  const outward = (i: number, j: number) => sideOf(P(V[i]), P(V[j]), (nn) => dot(nn, sub(mid(P(V[i]), P(V[j])), c2)));
  const edgeSeg = (i: number, j: number): SegDef => ({ a: V[i], b: V[j], hidden: body.edgeHidden(i, j), edge: true, dir: outward(i, j) });

  const segs: Model['segs'] = {};
  const tris: Model['tris'] = {};
  const r = rightmost(P, V, n);
  segs.a = edgeSeg(0, 1);
  if (base.rect) segs.b = edgeSeg(1, 2);
  const side = edgeSeg(r, n + r);
  segs.h = side;
  if (shape !== 'prism') segs.c = side;
  if (base.rect || n % 2 === 0) {
    const o = (r + n / 2) % n;
    const Bo = V[o];
    const Br = V[r];
    const Tr = V[n + r];
    const diag: SegDef = { a: Bo, b: Br, hidden: true, dir: below(P(Bo), P(Br)) };
    segs.baseDiagonal = diag;
    segs.faceDiagonal = diag;
    segs.spaceDiagonal = { a: Bo, b: Tr, hidden: true, dir: leftOf(P(Bo), P(Tr)) };
    tris.diagonal = { pts: [Bo, Br, Tr], right: 1, hidden: [true, side.hidden, true] };
  }
  if (base.rect) {
    tris.face = { pts: [V[0], V[1], V[2]], right: 1, hidden: [body.edgeHidden(0, 1), body.edgeHidden(1, 2), true] };
  }

  const verts: VertexDef[] =
    shape === 'prism'
      ? [...ids.map((k) => ({ at: V[k], name: LETTERS[k] })), ...ids.map((k) => ({ at: V[n + k], name: `${LETTERS[k]}₁` }))]
      : V.map((at, k) => ({ at, name: LETTERS[k] }));
  return { proj: P, fills: body.fills, hidden: body.hidden, visible: body.visible, segs, tris, verts, center };
}

/** Right pyramid over `base` with the apex above the base center at height H. */
function buildPyramid(base: Base2D, H: number, ctx: Ctx): Model {
  const P = projOblique;
  const n = base.n;
  const O = p3(0, 0, 0);
  const apex = p3(0, 0, H);
  const V: P3[] = [...base.pts.map((q) => p3(q.x, q.y, 0)), apex];
  const ids = [...Array(n).keys()];
  const faces: Face[] = [{ idx: [...ids].reverse(), role: 'bottom' }, ...ids.map((k): Face => ({ idx: [k, (k + 1) % n, n], role: 'side' }))];
  const body = polyBody(V, faces, ctx.fill);
  const center = p3(0, 0, H / 3);
  const c2 = P(center);
  const outward = (i: number, j: number) => sideOf(P(V[i]), P(V[j]), (nn) => dot(nn, sub(mid(P(V[i]), P(V[j])), c2)));
  const edgeSeg = (i: number, j: number): SegDef => ({ a: V[i], b: V[j], hidden: body.edgeHidden(i, j), edge: true, dir: outward(i, j) });

  const segs: Model['segs'] = {};
  const tris: Model['tris'] = {};
  const r = rightmost(P, V, n);
  const M = mid3(V[0], V[1]);
  const frontHidden = !body.faceVisible[1];
  const d = ctx.drawn;
  const usesM = d.has('s') || d.has('apothem') || ctx.tri === 'axial';
  const usesR = d.has('edge') || d.has('baseDiagonal') || d.has('faceDiagonal') || ctx.tri === 'edge';
  // M lies left of the axis, the rightmost vertex right of it: the height's label goes to the free side.
  const hDir = usesR && !usesM ? v(-1, 0) : v(1, 0);
  const leg = usesM ? M : usesR ? V[r] : p3(1, 0, 0);

  segs.a = edgeSeg(0, 1);
  if (base.rect) segs.b = edgeSeg(1, 2);
  segs.h = { a: O, b: apex, hidden: true, dir: hDir, marker: { at: O, p1: apex, p2: leg }, dots: [O] };
  segs.s = {
    a: apex,
    b: M,
    hidden: frontHidden,
    dir: P(M).x <= P(O).x ? leftOf(P(apex), P(M)) : rightOf(P(apex), P(M)),
    t: 0.45,
    marker: { at: M, p1: apex, p2: V[1] },
  };
  segs.apothem = { a: O, b: M, hidden: true, dir: below(P(O), P(M)), dots: [O] };
  segs.edge = { ...edgeSeg(r, n), dir: rightOf(P(V[r]), P(apex)) };
  if (base.rect || n % 2 === 0) {
    const o = (r + n / 2) % n;
    const diag: SegDef = { a: V[o], b: V[r], hidden: true, t: 0.25, dir: below(P(V[o]), P(V[r])), dots: [O] };
    segs.baseDiagonal = diag;
    segs.faceDiagonal = diag;
  }
  tris.axial = { pts: [apex, O, M], right: 1, hidden: [true, true, frontHidden] };
  tris.edge = { pts: [apex, O, V[r]], right: 1, hidden: [true, true, body.edgeHidden(r, n)] };

  const verts: VertexDef[] = [...ids.map((k) => ({ at: V[k], name: LETTERS[k] })), { at: apex, name: 'V', dir: v(0, 1) }];
  return { proj: P, fills: body.fills, hidden: body.hidden, visible: body.visible, segs, tris, verts, center };
}

// ---------------------------------------------------------------------------------------------
// Round solids
// ---------------------------------------------------------------------------------------------

function buildCylinder(r: number, H: number, ctx: Ctx): Model {
  const q = ROUND_SQUASH;
  const ry = q * r;
  const P = projRound(q);
  const O = p3(0, 0, 0);
  const O1 = p3(0, 0, H);
  const c0 = v(0, 0);
  const c1 = v(0, H);
  const fills: Prim[] = [];
  if (ctx.fill) {
    fills.push({ t: 'ellipse', c: c0, rx: r, ry, color: 'none', fill: 'accent', fillOpacity: ALPHA.bottom, obstacle: false });
    const side = [v(-r, H), ...ellipsePts(c0, r, ry, 180, 360), ...ellipsePts(c1, r, ry, 360, 180)];
    fills.push({ t: 'poly', pts: side, closed: true, color: 'none', fill: 'accent', fillOpacity: ALPHA.side });
    fills.push({ t: 'ellipse', c: c1, rx: r, ry, color: 'none', fill: 'accent', fillOpacity: ALPHA.top, obstacle: false });
  }
  const hidden: Prim[] = [{ t: 'ellipse', c: c0, rx: r, ry, from: 0, to: 180, color: 'ink', w: WIDTH.hidden, dash: 'dashed' }];
  const visible: Prim[] = [
    { t: 'ellipse', c: c0, rx: r, ry, from: 180, to: 360, color: 'ink', w: WIDTH.edge },
    { t: 'seg', a: v(-r, 0), b: v(-r, H), color: 'ink', w: WIDTH.edge },
    { t: 'seg', a: v(r, 0), b: v(r, H), color: 'ink', w: WIDTH.edge },
    { t: 'ellipse', c: c1, rx: r, ry, color: 'ink', w: WIDTH.edge },
  ];
  const segs: Model['segs'] = {};
  // The radius goes on the top base; if the diameter is shown there too, the radius moves to the bottom base.
  segs.r = ctx.drawn.has('d')
    ? { a: O, b: p3(r, 0, 0), hidden: true, dir: v(0, -1), dots: [O] }
    : { a: O1, b: p3(r, 0, H), hidden: false, dir: v(0, 1), dots: [O1] };
  segs.d = { a: p3(-r, 0, H), b: p3(r, 0, H), hidden: false, dir: v(0, 1), dots: [O1] };
  segs.h = { a: p3(r, 0, 0), b: p3(r, 0, H), hidden: false, edge: true, dir: v(1, 0) };
  const verts: VertexDef[] = [
    { at: O, name: 'O', dir: v(-1, -0.5), dot: true },
    { at: O1, name: 'O₁', dir: v(-1, 0.5), dot: true },
  ];
  return { proj: P, fills, hidden, visible, segs, tris: {}, verts, center: p3(0, 0, H / 2) };
}

function buildCone(r: number, H: number, ctx: Ctx): Model {
  // Very flat cones get a flatter ellipse so the apex stays outside it (tangents exist).
  const q = Math.min(ROUND_SQUASH, (0.5 * H) / r);
  const ry = q * r;
  const P = projRound(q);
  const O = p3(0, 0, 0);
  const apex = p3(0, 0, H);
  const c0 = v(0, 0);
  // Tangent points of the silhouette lines: on the base circle at parameter t0 (slightly behind).
  const t0 = Math.asin(ry / H);
  const t0d = (t0 * 180) / Math.PI;
  const TR = p3(r * Math.cos(t0), r * Math.sin(t0), 0);
  const TL = p3(-r * Math.cos(t0), r * Math.sin(t0), 0);
  const fills: Prim[] = [];
  if (ctx.fill) {
    fills.push({ t: 'ellipse', c: c0, rx: r, ry, color: 'none', fill: 'accent', fillOpacity: ALPHA.bottom, obstacle: false });
    fills.push({ t: 'poly', pts: [P(apex), ...ellipsePts(c0, r, ry, 180 - t0d, 360 + t0d)], closed: true, color: 'none', fill: 'accent', fillOpacity: ALPHA.side });
  }
  const hidden: Prim[] = [{ t: 'ellipse', c: c0, rx: r, ry, from: t0d, to: 180 - t0d, color: 'ink', w: WIDTH.hidden, dash: 'dashed' }];
  const visible: Prim[] = [
    { t: 'ellipse', c: c0, rx: r, ry, from: 180 - t0d, to: 360 + t0d, color: 'ink', w: WIDTH.edge },
    { t: 'seg', a: P(apex), b: P(TL), color: 'ink', w: WIDTH.edge },
    { t: 'seg', a: P(apex), b: P(TR), color: 'ink', w: WIDTH.edge },
  ];
  const d = ctx.drawn;
  const usesR = d.has('r') || d.has('s') || ctx.tri === 'axial';
  const leg = usesR || !d.has('d') ? TR : p3(r, 0, 0);
  const segs: Model['segs'] = {
    r: { a: O, b: TR, hidden: true, dir: v(0, -1), dots: [O] },
    d: { a: p3(-r, 0, 0), b: p3(r, 0, 0), hidden: true, dir: v(0, -1), t: d.has('r') ? 0.25 : 0.5, dots: [O] },
    h: { a: O, b: apex, hidden: true, dir: v(-1, 0), t: 0.55, marker: { at: O, p1: apex, p2: leg }, dots: [O] },
    s: { a: apex, b: TR, hidden: false, edge: true, dir: rightOf(P(apex), P(TR)) },
  };
  const tris: Model['tris'] = { axial: { pts: [apex, O, TR], right: 1, hidden: [true, true, false] } };
  const verts: VertexDef[] = [
    { at: O, name: 'O', dir: v(-1, -0.6), dot: true },
    { at: apex, name: 'V', dir: v(0, 1) },
  ];
  return { proj: P, fills, hidden, visible, segs, tris, verts, center: p3(0, 0, H / 3) };
}

function buildSphere(r: number, ctx: Ctx): Model {
  const q = ROUND_SQUASH;
  const ry = q * r;
  const P = projRound(q);
  const O = p3(0, 0, 0);
  const c0 = v(0, 0);
  const fills: Prim[] = ctx.fill ? [{ t: 'circle', c: c0, r, color: 'none', fill: 'accent', fillOpacity: ALPHA.sphere, obstacle: false }] : [];
  const hidden: Prim[] = [{ t: 'ellipse', c: c0, rx: r, ry, from: 0, to: 180, color: 'ink', w: WIDTH.hidden, dash: 'dashed' }];
  const visible: Prim[] = [
    { t: 'circle', c: c0, r, color: 'ink', w: WIDTH.edge },
    { t: 'ellipse', c: c0, rx: r, ry, from: 180, to: 360, color: 'ink', w: WIDTH.edge },
  ];
  const both = ctx.drawn.has('r') && ctx.drawn.has('d');
  // With the diameter on the equator, the radius goes up-right in the picture plane (still exact).
  const R = both ? p3(r * Math.cos(Math.PI / 4), 0, r * Math.sin(Math.PI / 4)) : p3(r, 0, 0);
  const segs: Model['segs'] = {
    r: { a: O, b: R, hidden: true, dir: both ? leftOf(P(O), P(R)) : v(0, 1), dots: [O] },
    d: { a: p3(-r, 0, 0), b: p3(r, 0, 0), hidden: true, dir: both ? v(0, -1) : v(0, 1), t: both ? 0.3 : 0.5, dots: [O] },
  };
  const verts: VertexDef[] = [{ at: O, name: 'O', dir: both ? v(-0.5, -1) : v(-1, -0.6), dot: true }];
  return { proj: P, fills, hidden, visible, segs, tris: {}, verts, center: O };
}

// ---------------------------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------------------------

function checkKeyList(T: string, field: string, x: unknown): SolidSegment[] {
  if (x === undefined) return [];
  if (!Array.isArray(x)) fail(T, `"${field}" must be an array of segment keys, e.g. ['r', 'h']`);
  for (const k of x) if (!SEGMENTS.includes(k)) fail(T, `"${field}" has unknown segment ${JSON.stringify(k)} (use ${SEGMENTS.map((s) => `'${s}'`).join(', ')})`);
  return x as SolidSegment[];
}

export function layoutSolid(fig: SolidFigure): LayoutResult {
  const shape = fig.shape as Shape;
  if (!SHAPES.includes(shape)) fail('solid', `unknown "shape" ${JSON.stringify(fig.shape)} (use ${SHAPES.map((s) => `'${s}'`).join(', ')})`);
  const T = `solid (${shape})`;

  // --- options
  const labels = checkLabelObject(T, fig.labels, SEGMENTS, 'a solid');
  const show = checkKeyList(T, 'show', fig.show);
  const highlight = new Set(checkKeyList(T, 'highlight', fig.highlight));
  const tri = fig.triangle;
  if (tri !== undefined && !TRIANGLES.includes(tri)) fail(T, `unknown "triangle" ${JSON.stringify(tri)} (use ${TRIANGLES.map((s) => `'${s}'`).join(', ')})`);
  if (fig.fill !== undefined && typeof fig.fill !== 'boolean') fail(T, '"fill" must be true or false');
  const drawn = new Set<SolidSegment>([...(Object.keys(labels) as SolidSegment[]), ...show, ...highlight]);
  const ctx: Ctx = { drawn, tri, fill: fig.fill !== false };

  // --- the solid
  let m: Model;
  switch (shape) {
    case 'cube': {
      const a = pos(T, 'a', (fig as Extract<SolidFigure, { shape: 'cube' }>).a);
      m = buildPrism('cube', rectBase(a, a), a, ctx);
      break;
    }
    case 'cuboid': {
      const f = fig as Extract<SolidFigure, { shape: 'cuboid' }>;
      m = buildPrism('cuboid', rectBase(pos(T, 'a', f.a), pos(T, 'b', f.b)), pos(T, 'c', f.c), ctx);
      break;
    }
    case 'prism': {
      const f = fig as Extract<SolidFigure, { shape: 'prism' }>;
      m = buildPrism('prism', parseBase(T, f, true), pos(T, 'h', f.h), ctx);
      break;
    }
    case 'pyramid': {
      const f = fig as Extract<SolidFigure, { shape: 'pyramid' }>;
      m = buildPyramid(parseBase(T, f, false), pos(T, 'h', f.h), ctx);
      break;
    }
    case 'cylinder': {
      const f = fig as Extract<SolidFigure, { shape: 'cylinder' }>;
      m = buildCylinder(pos(T, 'r', f.r), pos(T, 'h', f.h), ctx);
      break;
    }
    case 'cone': {
      const f = fig as Extract<SolidFigure, { shape: 'cone' }>;
      m = buildCone(pos(T, 'r', f.r), pos(T, 'h', f.h), ctx);
      break;
    }
    case 'sphere': {
      const f = fig as Extract<SolidFigure, { shape: 'sphere' }>;
      m = buildSphere(pos(T, 'r', f.r), ctx);
      break;
    }
  }

  // --- availability of the requested segments and triangle
  const available = SEGMENTS.filter((k) => m.segs[k]);
  const check = (k: SolidSegment, field: string) => {
    if (!m.segs[k]) fail(T, `${field}: segment '${k}' is not available for ${SHAPE_NAME[shape]} (available: ${available.map((s) => `'${s}'`).join(', ')})`);
  };
  for (const k of Object.keys(labels) as SolidSegment[]) check(k, `"labels.${k}"`);
  for (const k of show) check(k, '"show"');
  for (const k of highlight) check(k, '"highlight"');
  if ((shape === 'cube' || shape === 'cuboid') && drawn.has('c') && drawn.has('h'))
    fail(T, `'c' and 'h' are the same edge of ${SHAPE_NAME[shape]} — use only one of them`);
  if (drawn.has('faceDiagonal') && drawn.has('baseDiagonal'))
    fail(T, `'faceDiagonal' and 'baseDiagonal' are the same segment of ${SHAPE_NAME[shape]} — use only one of them`);
  const triDef = tri ? m.tris[tri] : undefined;
  if (tri && !triDef) {
    const ok = TRIANGLES.filter((k) => m.tris[k]);
    fail(T, `"triangle": '${tri}' is not available for ${SHAPE_NAME[shape]}${shape === 'prism' || shape === 'pyramid' ? ' with this base' : ''} (${ok.length ? `available: ${ok.map((s) => `'${s}'`).join(', ')}` : 'it has no highlightable triangle'})`);
  }

  // --- vertex names
  let names: string[] | null = null;
  const vl = fig.vertexLabels;
  if (vl === true) names = m.verts.map((x) => x.name);
  else if (Array.isArray(vl)) {
    if (vl.length !== m.verts.length || !vl.every((s) => typeof s === 'string'))
      fail(T, `"vertexLabels" must be true or an array of ${m.verts.length} strings (${m.verts.map((x) => x.name).join(', ')}; use '' to hide one)`);
    names = vl;
  } else if (vl !== undefined && vl !== false) fail(T, '"vertexLabels" must be true, false or an array of names');

  // --- assemble
  const P = m.proj;
  const aux: Prim[] = [];
  const hiSegs: Prim[] = [];
  const triPrims: Prim[] = [];
  const triFill: Prim[] = [];
  const markers: Prim[] = [];
  const dotPts: Vec[] = [];
  const segLabels: Prim[] = [];
  const vertLabels: Prim[] = [];
  const addDot = (p: Vec) => {
    if (!dotPts.some((q) => dist(p, q) < 1e-9 * (1 + Math.abs(p.x) + Math.abs(p.y)))) dotPts.push(p);
  };

  const triRightAt = triDef ? P(triDef.pts[triDef.right]) : null;
  for (const k of SEGMENTS) {
    if (!drawn.has(k)) continue;
    const s = m.segs[k] as SegDef;
    const hi = highlight.has(k);
    const A = P(s.a);
    const B = P(s.b);
    if (hi || !s.edge) {
      (hi ? hiSegs : aux).push({
        t: 'seg',
        a: A,
        b: B,
        color: hi ? 'highlight' : 'ink',
        w: hi ? WIDTH.hi : WIDTH.aux,
        dash: s.hidden ? 'dashed' : 'solid',
      });
    }
    if (s.marker && !(triRightAt && dist(P(s.marker.at), triRightAt) < 1e-9 * (1 + dist(A, B)))) {
      markers.push({ t: 'rightAngle', at: P(s.marker.at), p1: P(s.marker.p1), p2: P(s.marker.p2), color: hi ? 'highlight' : 'ink' });
    }
    for (const d of s.dots ?? []) addDot(P(d));
    const text = labels[k];
    if (text) segLabels.push({ t: 'label', at: lerp(A, B, s.t ?? 0.5), text, dir: s.dir, color: hi ? 'highlight' : undefined });
  }

  if (triDef) {
    const pts = triDef.pts.map(P);
    triFill.push({ t: 'poly', pts, closed: true, color: 'none', fill: 'highlight', fillOpacity: ALPHA.triangle });
    for (let i = 0; i < 3; i++) {
      triPrims.push({ t: 'seg', a: pts[i], b: pts[(i + 1) % 3], color: 'highlight', w: WIDTH.hi - 0.4, dash: triDef.hidden[i] ? 'dashed' : 'solid' });
    }
    const ri = triDef.right;
    markers.push({ t: 'rightAngle', at: pts[ri], p1: pts[(ri + 2) % 3], p2: pts[(ri + 1) % 3], color: 'highlight' });
  }

  if (names) {
    const c2 = P(m.center);
    m.verts.forEach((vx, i) => {
      const name = names?.[i];
      if (!name) return;
      const at = P(vx.at);
      let dir = vx.dir ?? sub(at, c2);
      if (Math.hypot(dir.x, dir.y) < 1e-12) dir = v(-1, -0.6);
      if (vx.dot) addDot(at);
      vertLabels.push({ t: 'label', at, text: name, dir: norm(dir) });
    });
  }

  const dots: Prim[] = dotPts.map((at) => ({ t: 'dot', at, r: 2.4 }));
  return [...m.fills, ...triFill, ...m.hidden, ...m.visible, ...aux, ...triPrims, ...hiSegs, ...markers, ...dots, ...segLabels, ...vertLabels];
}
