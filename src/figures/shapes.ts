/**
 * Ready-made 2D shapes: triangle, quadrilateral, regular polygon, circle.
 *
 * Each layout converts the shape's parameters to named points + `GeoItem`s (the general
 * 'geometry' figure), so every 2D figure shares one look. Labels that need a precise preferred
 * direction (vertex names along the outer bisector, side labels on the outer side) are emitted
 * as label primitives directly.
 *
 * Engine file — content authors never need to touch this.
 */
import type {
  CircleFigure,
  FigColor,
  GeoItem,
  QuadrilateralFigure,
  RegularPolygonFigure,
  TriangleFigure,
  TriSide,
  TriVertex,
  XY,
} from './types';
import type { LayoutResult } from './index';
import { geoItemsToPrims, makeContext } from './geometry';
import {
  add,
  centroid,
  cross,
  dist,
  dot,
  foot,
  len,
  lerp,
  mid,
  mul,
  norm,
  perp,
  polar,
  type Prim,
  signedArea,
  sub,
  v,
  type Vec,
} from './scene';

// ---------------------------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------------------------

function fail(type: string, msg: string): never {
  throw new Error(`${type}: ${msg}`);
}

function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

/** A required positive number. */
function pos(type: string, field: string, x: unknown): number {
  if (x === undefined) fail(type, `"${field}" is required`);
  if (!isNum(x) || x <= 0) fail(type, `"${field}" must be a positive number (got ${JSON.stringify(x)})`);
  return x;
}

/** An optional positive number. */
function optPos(type: string, field: string, x: unknown): number | undefined {
  return x === undefined ? undefined : pos(type, field, x);
}

const xy = (p: Vec): XY => [p.x, p.y];

/** Angle at P between rays P→Q and P→R, in degrees. */
function angleAt(P: Vec, Q: Vec, R: Vec): number {
  const a = norm(sub(Q, P));
  const b = norm(sub(R, P));
  return (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI;
}

/** Outer bisector direction at vertex i of a polygon (where the vertex name goes). */
function vertexDir(pts: Vec[], i: number): Vec {
  const n = pts.length;
  const P = pts[i];
  const prev = pts[(i - 1 + n) % n];
  const next = pts[(i + 1) % n];
  let d = mul(add(norm(sub(prev, P)), norm(sub(next, P))), -1);
  if (len(d) < 1e-6) d = sub(P, centroid(pts));
  // reflex vertex (concave polygon): the bisector points inward — flip it
  const turn = cross(sub(P, prev), sub(next, P));
  const ccw = signedArea(pts) >= 0;
  if ((ccw && turn < 0) || (!ccw && turn > 0)) d = mul(d, -1);
  return norm(d);
}

/** Unit normal of side pts[i] → pts[i+1] pointing out of the polygon. */
function outwardNormal(pts: Vec[], i: number): Vec {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const left = norm(perp(sub(b, a)));
  return signedArea(pts) >= 0 ? mul(left, -1) : left;
}

/** Vertex dots + names along the outer bisector. Empty names are skipped (no dot either). */
function vertexPrims(pts: Vec[], names: string[]): { dots: Prim[]; labels: Prim[] } {
  const dots: Prim[] = [];
  const labels: Prim[] = [];
  pts.forEach((P, i) => {
    const name = names[i];
    if (!name) return;
    dots.push({ t: 'dot', at: P, r: 2.2 });
    labels.push({ t: 'label', at: P, text: name, dir: vertexDir(pts, i) });
  });
  return { dots, labels };
}

/** A side label at the midpoint of side i, outside (or inside) the polygon. */
function sideLabel(pts: Vec[], i: number, text: string, inside = false, color?: FigColor): Prim {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const n = outwardNormal(pts, i);
  return { t: 'label', at: mid(a, b), text, dir: inside ? mul(n, -1) : n, color };
}

/** Splits geometry prims into (drawing prims, label prims) so our own labels can go first. */
function splitLabels(prims: Prim[]): { draw: Prim[]; labels: Prim[] } {
  const draw: Prim[] = [];
  const labels: Prim[] = [];
  for (const p of prims) (p.t === 'label' ? labels : draw).push(p);
  return { draw, labels };
}

/** Intersection of lines p1p2 and p3p4 (null if parallel). */
function lineIntersection(p1: Vec, p2: Vec, p3: Vec, p4: Vec): Vec | null {
  const d1 = sub(p2, p1);
  const d2 = sub(p4, p3);
  const den = cross(d1, d2);
  if (Math.abs(den) < 1e-12) return null;
  const t = cross(sub(p3, p1), d2) / den;
  return add(p1, mul(d1, t));
}

const fillOf = (f: boolean | FigColor | undefined, dflt: boolean | FigColor = true): boolean | FigColor => (f === undefined ? dflt : f);

/** Assembles the final primitive list: drawing, our dots, our labels, then the geometry labels. */
function assemble(geo: Prim[], dots: Prim[], ownLabels: Prim[]): Prim[] {
  const { draw, labels } = splitLabels(geo);
  return [...draw, ...dots, ...ownLabels, ...labels];
}

/** Checks that a names array has the right length. */
function checkNames(type: string, names: unknown, n: number): string[] | undefined {
  if (names === undefined) return undefined;
  if (!Array.isArray(names) || names.length !== n || !names.every((s) => typeof s === 'string'))
    fail(type, `"vertices" must be an array of ${n} strings (use '' to hide a name)`);
  return names as string[];
}

// ---------------------------------------------------------------------------------------------
// Triangle
// ---------------------------------------------------------------------------------------------

const TRI_SIDE_ENDS: Record<TriSide, [TriVertex, TriVertex]> = { a: ['B', 'C'], b: ['C', 'A'], c: ['A', 'B'] };
/** Index of side in the polygon [A, B, C]: 0 = AB (c), 1 = BC (a), 2 = CA (b). */
const TRI_SIDE_INDEX: Record<TriSide, number> = { c: 0, a: 1, b: 2 };
const TRI_OPPOSITE: Record<TriVertex, [TriVertex, TriVertex]> = { A: ['B', 'C'], B: ['C', 'A'], C: ['A', 'B'] };
const SQUARE_COLORS: Record<TriSide, FigColor> = { a: 'green', b: 'blue', c: 'orange' };

export function layoutTriangle(fig: TriangleFigure): LayoutResult {
  const T = 'triangle';
  const count = [fig.sides, fig.legs, fig.coords].filter((x) => x !== undefined).length;
  if (count !== 1) fail(T, 'give exactly one of "sides" ([a, b, c]), "legs" ([a, b]) or "coords" ([[x, y], [x, y], [x, y]])');

  let A: Vec;
  let B: Vec;
  let C: Vec;
  let rightAt: TriVertex | undefined = fig.rightAngleAt;
  if (fig.sides) {
    if (!Array.isArray(fig.sides) || fig.sides.length !== 3) fail(T, '"sides" must be [a, b, c]');
    const [a, b, c] = fig.sides.map((s, i) => pos(T, `sides[${i}]`, s));
    if (a + b <= c || b + c <= a || c + a <= b)
      fail(T, `"sides" [${a}, ${b}, ${c}] violate the triangle inequality (each side must be shorter than the sum of the other two)`);
    A = v(0, 0);
    B = v(c, 0);
    const x = (b * b + c * c - a * a) / (2 * c);
    C = v(x, Math.sqrt(Math.max(0, b * b - x * x)));
  } else if (fig.legs) {
    if (!Array.isArray(fig.legs) || fig.legs.length !== 2) fail(T, '"legs" must be [a, b]');
    const [a, b] = fig.legs.map((s, i) => pos(T, `legs[${i}]`, s));
    rightAt = rightAt ?? 'C';
    if (fig.pose === 'hypotenuse') {
      const c = Math.hypot(a, b);
      A = v(0, 0);
      B = v(c, 0);
      C = v((b * b) / c, (a * b) / c);
    } else {
      C = v(0, 0);
      A = v(b, 0);
      B = v(0, a);
    }
  } else {
    const cs = fig.coords;
    if (!Array.isArray(cs) || cs.length !== 3 || !cs.every((p) => Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1])))
      fail(T, '"coords" must be three [x, y] pairs of numbers');
    [A, B, C] = cs.map(([x, y]) => v(x, y));
    const size = Math.max(dist(A, B), dist(B, C), dist(C, A));
    if (size < 1e-12 || Math.abs(signedArea([A, B, C])) < 1e-9 * size * size) fail(T, '"coords" are collinear (no triangle)');
  }

  const names = checkNames(T, fig.vertices, 3) ?? ['A', 'B', 'C'];
  const P: Record<TriVertex, Vec> = { A, B, C };
  const pts = [A, B, C];
  const points: Record<string, XY> = { A: xy(A), B: xy(B), C: xy(C) };
  const ccw = signedArea(pts) >= 0;
  const highlight = new Set(fig.highlight ?? []);
  const items: GeoItem[] = [];

  // Squares on the sides (drawn first, below everything).
  const squares: Partial<Record<TriSide, string>> = fig.squares === true ? { a: '', b: '', c: '' } : fig.squares || {};
  for (const s of ['a', 'b', 'c'] as TriSide[]) {
    if (!(s in squares)) continue;
    const [from, to] = TRI_SIDE_ENDS[s];
    items.push({ kind: 'squareOnSide', from, to, side: ccw ? 'right' : 'left', fill: SQUARE_COLORS[s], label: squares[s] || undefined });
  }

  const ticks = fig.ticks ?? {};
  items.push({
    kind: 'polygon',
    points: ['A', 'B', 'C'],
    fill: fillOf(fig.fill),
    vertexLabels: false,
    ticks: [ticks.c ?? 0, ticks.a ?? 0, ticks.b ?? 0],
  });
  for (const s of highlight) {
    if (!(s in TRI_SIDE_ENDS)) fail(T, `"highlight" has unknown side "${s}" (use 'a', 'b', 'c')`);
    const [from, to] = TRI_SIDE_ENDS[s];
    items.push({ kind: 'segment', from, to, color: 'highlight', width: 'thick' });
  }

  // Heights and medians.
  for (const h of fig.heights ?? []) {
    if (!(h.from in P)) fail(T, `"heights[].from" must be 'A', 'B' or 'C' (got ${JSON.stringify(h.from)})`);
    items.push({ kind: 'height', from: h.from, base: TRI_OPPOSITE[h.from], label: h.label, footLabel: h.footLabel, color: 'accent' });
  }
  const ownLabels: Prim[] = [];
  const extraDots: Prim[] = [];
  for (const md of fig.medians ?? []) {
    if (!(md.from in P)) fail(T, `"medians[].from" must be 'A', 'B' or 'C' (got ${JSON.stringify(md.from)})`);
    const V = P[md.from];
    const [q1, q2] = TRI_OPPOSITE[md.from].map((k) => P[k]);
    const M = mid(q1, q2);
    items.push({ kind: 'segment', from: md.from, to: xy(M), dashed: true, color: 'purple' });
    extraDots.push({ t: 'dot', at: M, r: 2.2, color: 'purple' });
    if (md.label) {
      // label on the side of the median with the larger angle (more room)
      const d = norm(sub(M, V));
      const toward = angleAt(V, q1, M) > angleAt(V, q2, M) ? q1 : q2;
      let n = norm(perp(d));
      if (dot(n, sub(toward, V)) < 0) n = mul(n, -1);
      ownLabels.push({ t: 'label', at: lerp(V, M, 0.55), text: md.label, dir: n, color: 'purple' });
    }
  }

  // Angle markers.
  const angleLabels = fig.angleLabels ?? {};
  const markRight = (k: TriVertex) => k === rightAt || Math.abs(angleAt(P[k], ...(TRI_OPPOSITE[k].map((q) => P[q]) as [Vec, Vec])) - 90) < 0.25;
  for (const k of ['A', 'B', 'C'] as TriVertex[]) {
    const label = angleLabels[k];
    const [p1, p2] = TRI_OPPOSITE[k];
    if (label !== undefined) {
      items.push({ kind: 'angle', vertex: k, from: p1, to: p2, label: label || undefined, right: markRight(k) && k === rightAt ? true : undefined });
    } else if (k === rightAt) {
      items.push({ kind: 'angle', vertex: k, from: p1, to: p2, right: true });
    }
  }

  // Side labels: outside, or inside the triangle when that side carries a square.
  const sideLabels = fig.sideLabels ?? {};
  const sideLabelPrims: Prim[] = [];
  for (const s of ['a', 'b', 'c'] as TriSide[]) {
    const text = sideLabels[s];
    if (text) sideLabelPrims.push(sideLabel(pts, TRI_SIDE_INDEX[s], text, s in squares, highlight.has(s) ? 'highlight' : undefined));
  }

  const ctx = makeContext(points, items);
  const geo = geoItemsToPrims(ctx, items);
  const vp = vertexPrims(pts, names);
  return assemble(geo, [...extraDots, ...vp.dots], [...vp.labels, ...sideLabelPrims, ...ownLabels]);
}

// ---------------------------------------------------------------------------------------------
// Quadrilateral
// ---------------------------------------------------------------------------------------------

type QSide = 'a' | 'b' | 'c' | 'd';
type QVertex = 'A' | 'B' | 'C' | 'D';
const Q_SIDES: QSide[] = ['a', 'b', 'c', 'd'];
const Q_VERTS: QVertex[] = ['A', 'B', 'C', 'D'];

export function layoutQuadrilateral(fig: QuadrilateralFigure): LayoutResult {
  const T = 'quadrilateral';
  const shape = fig.shape;
  const angleOf = (dflt: number): number => {
    const ang = fig.angle ?? dflt;
    if (!isNum(ang) || ang <= 0 || ang >= 180) fail(T, `"angle" must be between 0 and 180 degrees (got ${JSON.stringify(fig.angle)})`);
    return (ang * Math.PI) / 180;
  };
  let A: Vec;
  let B: Vec;
  let C: Vec;
  let D: Vec;
  let defaultTicks: Partial<Record<QSide, 1 | 2 | 3>> = {};
  switch (shape) {
    case 'square': {
      const a = pos(T, 'a', fig.a);
      [A, B, C, D] = [v(0, 0), v(a, 0), v(a, a), v(0, a)];
      break;
    }
    case 'rectangle': {
      const a = pos(T, 'a', fig.a);
      const b = pos(T, 'b', fig.b);
      [A, B, C, D] = [v(0, 0), v(a, 0), v(a, b), v(0, b)];
      break;
    }
    case 'rhombus': {
      defaultTicks = { a: 1, b: 1, c: 1, d: 1 };
      let e = optPos(T, 'e', fig.e);
      let f = optPos(T, 'f', fig.f);
      const a = optPos(T, 'a', fig.a);
      if (a !== undefined && (e === undefined) !== (f === undefined)) {
        // side + one diagonal → the other diagonal
        const known = (e ?? f) as number;
        if (known >= 2 * a) fail(T, `rhombus diagonal ${known} must be shorter than 2·a = ${2 * a}`);
        const other = 2 * Math.sqrt(a * a - (known * known) / 4);
        if (e === undefined) e = other;
        else f = other;
      }
      if (e !== undefined && f !== undefined) {
        [A, B, C, D] = [v(-e / 2, 0), v(0, -f / 2), v(e / 2, 0), v(0, f / 2)];
      } else if (a !== undefined) {
        const t = angleOf(60);
        const d = v(a * Math.cos(t), a * Math.sin(t));
        [A, B, C, D] = [v(0, 0), v(a, 0), add(v(a, 0), d), d];
      } else {
        fail(T, 'rhombus needs "a" (with optional "angle"), or both diagonals "e" and "f", or "a" and one diagonal');
      }
      break;
    }
    case 'parallelogram': {
      const a = pos(T, 'a', fig.a);
      const t = angleOf(60);
      let b = optPos(T, 'b', fig.b);
      if (b === undefined) {
        if (fig.m === undefined) fail(T, 'parallelogram needs "a" and "b" (or "a" and the height "m")');
        b = pos(T, 'm', fig.m) / Math.sin(t);
      }
      const d = v(b * Math.cos(t), b * Math.sin(t));
      [A, B, C, D] = [v(0, 0), v(a, 0), add(v(a, 0), d), d];
      break;
    }
    case 'trapezoid': {
      const a = pos(T, 'a', fig.a);
      const c = pos(T, 'c', fig.c);
      const m = pos(T, 'm', fig.m);
      const shift = fig.shift ?? (a - c) / 2;
      if (!isNum(shift)) fail(T, '"shift" must be a number');
      [A, B, C, D] = [v(0, 0), v(a, 0), v(shift + c, m), v(shift, m)];
      break;
    }
    case 'deltoid': {
      defaultTicks = { a: 1, d: 1, b: 2, c: 2 };
      const e = pos(T, 'e', fig.e);
      const f = pos(T, 'f', fig.f);
      const split = fig.split ?? e / 3;
      if (!isNum(split) || split <= 0 || split >= e) fail(T, `"split" must be between 0 and e = ${e} (got ${JSON.stringify(fig.split)})`);
      [A, B, C, D] = [v(0, 0), v(split, -f / 2), v(e, 0), v(split, f / 2)];
      break;
    }
    default:
      fail(T, `unknown "shape" ${JSON.stringify(shape)} (use 'square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid' or 'deltoid')`);
  }

  const names = checkNames(T, fig.vertices, 4) ?? ['A', 'B', 'C', 'D'];
  const P: Record<QVertex, Vec> = { A, B, C, D };
  const pts = [A, B, C, D];
  const points: Record<string, XY> = { A: xy(A), B: xy(B), C: xy(C), D: xy(D) };
  const highlight = new Set(fig.highlight ?? []);
  for (const h of highlight) if (!['a', 'b', 'c', 'd', 'e', 'f'].includes(h)) fail(T, `"highlight" has unknown key "${h}" (use 'a'–'d' or 'e', 'f')`);
  const items: GeoItem[] = [];
  const ownLabels: Prim[] = [];
  const extraDots: Prim[] = [];

  // Diagonal intersection O and the height's foot T (for highlightTriangle).
  const O = lineIntersection(A, C, B, D) ?? centroid(pts);
  let heightFrom: 'C' | 'D' = fig.height?.from ?? 'D';
  if (!fig.height?.from) {
    const inside = (Q: Vec) => Q.x >= Math.min(A.x, B.x) - 1e-9 && Q.x <= Math.max(A.x, B.x) + 1e-9;
    const fD = foot(D, A, B);
    const fC = foot(C, A, B);
    // a height from D that is just the side DA (right trapezoid) or falls outside AB → use C
    if ((dist(fD, A) < 1e-9 || !inside(fD)) && inside(fC) && dist(fC, B) > 1e-9) heightFrom = 'C';
  }
  const Tfoot = foot(P[heightFrom], A, B);

  // Highlighted sub-triangle (below the outline).
  if (fig.highlightTriangle) {
    const ht = fig.highlightTriangle;
    if (!Array.isArray(ht) || ht.length !== 3) fail(T, '"highlightTriangle" must be three vertex names, e.g. [\'A\', \'O\', \'D\']');
    const lookup = (nm: string): Vec => {
      const i = names.indexOf(nm);
      if (i >= 0) return pts[i];
      if (nm in P) return P[nm as QVertex];
      if (nm === 'O') return O;
      if (nm === 'T') return Tfoot;
      return fail(T, `"highlightTriangle" has unknown point "${nm}" (use vertex names, 'O' or 'T')`);
    };
    const tri = ht.map(lookup);
    items.push({ kind: 'region', points: tri.map(xy), fill: 'highlight' });
    tri.forEach((Q, i) => {
      const Q1 = tri[(i + 1) % 3];
      const Q2 = tri[(i + 2) % 3];
      if (Math.abs(angleAt(Q, Q1, Q2) - 90) < 0.25) items.push({ kind: 'angle', vertex: xy(Q), from: xy(Q1), to: xy(Q2), right: true, color: 'highlight' });
    });
    const tc = centroid(tri);
    if (ht.includes('O') && !names.includes('O')) {
      extraDots.push({ t: 'dot', at: O, r: 2.2 });
      ownLabels.push({ t: 'label', at: O, text: 'O', dir: norm(sub(O, tc)) });
    }
    if (ht.includes('T') && !names.includes('T')) {
      extraDots.push({ t: 'dot', at: Tfoot, r: 2.2 });
      ownLabels.push({ t: 'label', at: Tfoot, text: 'T', dir: outwardNormal(pts, 0) });
    }
  }

  const ticks = fig.ticks ?? defaultTicks;
  items.push({ kind: 'polygon', points: ['A', 'B', 'C', 'D'], fill: fillOf(fig.fill), vertexLabels: false, ticks: Q_SIDES.map((s) => ticks[s] ?? 0) });

  // Diagonals.
  const diag = fig.diagonals;
  const diagLabels: { e?: string; f?: string } = typeof diag === 'object' ? diag : {};
  for (const [key, from, to, t] of [
    ['e', 'A', 'C', 0.3],
    ['f', 'B', 'D', 0.7],
  ] as const) {
    const hi = highlight.has(key);
    if (!diag && !hi) continue;
    items.push({ kind: 'segment', from, to, dashed: !hi, color: hi ? 'highlight' : undefined, width: hi ? 'thick' : 'normal' });
    const text = diagLabels[key];
    if (text) {
      const a = P[from];
      const b = P[to];
      let n = norm(perp(sub(b, a)));
      const side = key === 'e' ? D : C;
      if (dot(n, sub(side, a)) < 0) n = mul(n, -1);
      ownLabels.push({ t: 'label', at: lerp(a, b, t), text, dir: n, color: hi ? 'highlight' : undefined });
    }
  }
  if (diag && Math.abs(dot(norm(sub(C, A)), norm(sub(D, B)))) < 1e-6 && !fig.highlightTriangle) {
    items.push({ kind: 'angle', vertex: xy(O), from: 'C', to: 'D', right: true });
  }

  // Highlighted sides.
  Q_SIDES.forEach((s, i) => {
    if (highlight.has(s)) items.push({ kind: 'segment', from: Q_VERTS[i], to: Q_VERTS[(i + 1) % 4], color: 'highlight', width: 'thick' });
  });

  // Height.
  if (fig.height) {
    items.push({ kind: 'height', from: heightFrom, base: ['A', 'B'], label: fig.height.label, color: 'accent' });
  }

  // Angle markers (right-angle marker where the angle is 90°); automatic for right trapezoids.
  const angleLabels = fig.angleLabels ?? {};
  Q_VERTS.forEach((k, i) => {
    const prev = Q_VERTS[(i + 3) % 4];
    const next = Q_VERTS[(i + 1) % 4];
    const label = angleLabels[k];
    const isRight = Math.abs(angleAt(P[k], P[prev], P[next]) - 90) < 0.25;
    if (label !== undefined) items.push({ kind: 'angle', vertex: k, from: next, to: prev, label: label || undefined, right: isRight || undefined });
    else if (shape === 'trapezoid' && isRight) items.push({ kind: 'angle', vertex: k, from: next, to: prev, right: true });
  });

  // Side labels (outside).
  const sideLabels = fig.sideLabels ?? {};
  const sideLabelPrims: Prim[] = [];
  Q_SIDES.forEach((s, i) => {
    const text = sideLabels[s];
    if (text) sideLabelPrims.push(sideLabel(pts, i, text, false, highlight.has(s) ? 'highlight' : undefined));
  });

  const ctx = makeContext(points, items);
  const geo = geoItemsToPrims(ctx, items);
  const vp = vertexPrims(pts, names);
  return assemble(geo, [...extraDots, ...vp.dots], [...vp.labels, ...sideLabelPrims, ...ownLabels]);
}

// ---------------------------------------------------------------------------------------------
// Regular polygon
// ---------------------------------------------------------------------------------------------

const LETTERS = 'ABCDEFGHIJKL';

export function layoutRegularPolygon(fig: RegularPolygonFigure): LayoutResult {
  const T = 'regularPolygon';
  const n = fig.n;
  if (!Number.isInteger(n) || n < 3 || n > 12) fail(T, `"n" must be a whole number from 3 to 12 (got ${JSON.stringify(n)})`);
  const s = fig.side === undefined ? 1 : pos(T, 'side', fig.side);
  const R = s / (2 * Math.sin(Math.PI / n));
  const O = v(0, 0);
  const pts: Vec[] = [];
  for (let k = 0; k < n; k++) pts.push(polar(O, R, -90 - 180 / n + (360 * k) / n));
  let names: string[];
  if (fig.vertices === false) names = pts.map(() => '');
  else names = checkNames(T, fig.vertices, n) ?? [...LETTERS.slice(0, n)];

  const points: Record<string, XY> = { O: [0, 0] };
  pts.forEach((p, i) => (points[`P${i}`] = xy(p)));
  const ref = (i: number) => `P${((i % n) + n) % n}`;
  const items: GeoItem[] = [];
  const ownLabels: Prim[] = [];
  const extraDots: Prim[] = [];

  items.push({ kind: 'polygon', points: pts.map((_, i) => ref(i)), fill: fillOf(fig.fill), vertexLabels: false });

  if (fig.diagonals === 'all' || fig.diagonals === 'fromOne') {
    for (let i = 0; i < n; i++) {
      if (fig.diagonals === 'fromOne' && i > 0) break;
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        items.push({ kind: 'segment', from: ref(i), to: ref(j), dashed: true, width: 'thin', color: fig.diagonals === 'all' ? 'muted' : 'accent' });
      }
    }
  } else if (fig.diagonals !== undefined) {
    fail(T, `"diagonals" must be 'all' or 'fromOne' (got ${JSON.stringify(fig.diagonals)})`);
  }

  // Center, characteristic triangle O-A-B: circumradius to B, apothem to the midpoint of AB.
  const showCenter = !!(fig.center || fig.radius || fig.apothem || fig.centralAngle);
  const F = mid(pts[0], pts[1]);
  if (fig.centralAngle || fig.radius) {
    const color: FigColor | undefined = fig.radius ? 'red' : undefined;
    items.push({ kind: 'segment', from: 'O', to: ref(0), color, width: fig.radius ? 'normal' : 'thin' });
    items.push({ kind: 'segment', from: 'O', to: ref(1), color, width: fig.radius ? 'normal' : 'thin' });
  }
  if (fig.apothem) {
    items.push({ kind: 'segment', from: 'O', to: xy(F), color: 'green' });
    items.push({ kind: 'angle', vertex: xy(F), from: 'O', to: ref(1), right: true, color: 'green' });
    if (typeof fig.apothem === 'string' && fig.apothem) {
      // inside the half-triangle O-F-A (the radius label goes outside O-B)
      const dir = norm(sub(pts[0], F));
      ownLabels.push({ t: 'label', at: lerp(O, F, 0.5), text: fig.apothem, dir, color: 'green' });
    }
  }
  if (typeof fig.radius === 'string' && fig.radius) {
    const B = pts[1];
    let nrm = norm(perp(B));
    if (dot(nrm, sub(pts[0], B)) > 0) nrm = mul(nrm, -1);
    ownLabels.push({ t: 'label', at: lerp(O, B, 0.55), text: fig.radius, dir: nrm, color: 'red' });
  }
  if (fig.centralAngle) {
    items.push({ kind: 'angle', vertex: 'O', from: ref(0), to: ref(1), label: typeof fig.centralAngle === 'string' ? fig.centralAngle : undefined, color: fig.radius ? 'red' : undefined });
  }
  if (showCenter) {
    extraDots.push({ t: 'dot', at: O, r: 2.5 });
    // above the center, away from the characteristic triangle at the bottom
    ownLabels.unshift({ t: 'label', at: O, text: 'O', dir: v(0, 1) });
  }

  // Side labels: every side up to n = 8, otherwise only the bottom side AB.
  const sideLabelPrims: Prim[] = [];
  if (fig.sideLabel) for (let i = 0; i < (n <= 8 ? n : 1); i++) sideLabelPrims.push(sideLabel(pts, i, fig.sideLabel));

  const ctx = makeContext(points, items);
  const geo = geoItemsToPrims(ctx, items);
  const vp = vertexPrims(pts, names);
  return assemble(geo, [...extraDots, ...vp.dots], [...vp.labels, ...ownLabels, ...sideLabelPrims]);
}

// ---------------------------------------------------------------------------------------------
// Circle
// ---------------------------------------------------------------------------------------------

/** Normalises an angle to [0, 360). */
const norm360 = (a: number) => ((a % 360) + 360) % 360;

export function layoutCircle(fig: CircleFigure): LayoutResult {
  const T = 'circle';
  const r = pos(T, 'r', fig.r);
  const O = v(0, 0);
  const points: Record<string, XY> = { O: [0, 0] };
  const items: GeoItem[] = [];
  const ownLabels: Prim[] = [];
  const extraDots: Prim[] = [];
  /** Directions (degrees) of everything that leaves the center — the center label avoids them. */
  const spokes: number[] = [];

  const sector = fig.sector;
  if (sector && (!isNum(sector.angle) || sector.angle <= 0 || sector.angle >= 360))
    fail(T, `"sector.angle" must be between 0 and 360 degrees (got ${JSON.stringify(sector.angle)})`);
  const chord = fig.chord;
  if (chord && (!isNum(chord.angle) || chord.angle <= 0 || chord.angle >= 360))
    fail(T, `"chord.angle" must be between 0 and 360 degrees (got ${JSON.stringify(chord.angle)})`);
  const tangent = fig.tangent;
  if (tangent && !isNum(tangent.at)) fail(T, '"tangent.at" must be a number (degrees)');

  items.push({ kind: 'circle', center: 'O', radius: r, fill: fillOf(fig.fill, !sector), centerDot: false });

  // Sector from 0° counterclockwise, with an angle marker at the center.
  if (sector) {
    items.push({ kind: 'sector', center: 'O', radius: r, from: 0, to: sector.angle, fill: 'accent' });
    items.push({ kind: 'segment', from: 'O', to: xy(polar(O, r, 0)), width: 'normal' });
    items.push({ kind: 'segment', from: 'O', to: xy(polar(O, r, sector.angle)), width: 'normal' });
    spokes.push(0, sector.angle, sector.angle / 2);
    if (sector.label !== undefined) {
      items.push({
        kind: 'angle',
        vertex: 'O',
        from: xy(polar(O, r, 0)),
        to: xy(polar(O, r, sector.angle)),
        label: sector.label || undefined,
        reflex: sector.angle > 180 || undefined,
      });
    }
    if (sector.arcLabel) {
      items.push({ kind: 'arc', center: 'O', radius: r, from: 0, to: sector.angle, color: 'highlight' });
      const m = polar(O, r, sector.angle / 2);
      ownLabels.push({ t: 'label', at: m, text: sector.arcLabel, dir: norm(m), color: 'highlight' });
    }
  }

  // Diameter: horizontal through the center.
  if (fig.diameter) {
    const L = polar(O, r, 180);
    const R = polar(O, r, 0);
    items.push({ kind: 'segment', from: xy(L), to: xy(R), color: 'accent' });
    extraDots.push({ t: 'dot', at: L, r: 2.2, color: 'accent' }, { t: 'dot', at: R, r: 2.2, color: 'accent' });
    spokes.push(0, 180);
    if (typeof fig.diameter === 'string') ownLabels.push({ t: 'label', at: polar(O, r / 2, 180), text: fig.diameter, dir: v(0, 1), color: 'accent' });
  }

  // Radius: to the tangent point, or 55° when a diameter is shown, or −35° below a sector, else 30°.
  if (fig.radius) {
    const ang = tangent ? tangent.at : fig.diameter ? 55 : sector ? -35 : 30;
    const E = polar(O, r, ang);
    items.push({ kind: 'segment', from: 'O', to: xy(E), color: 'highlight' });
    extraDots.push({ t: 'dot', at: E, r: 2.2, color: 'highlight' });
    spokes.push(ang);
    if (typeof fig.radius === 'string') {
      const n = polar(v(0, 0), 1, ang + 90);
      ownLabels.push({ t: 'label', at: polar(O, r / 2, ang), text: fig.radius, dir: n, color: 'highlight' });
    }
  }

  // Chord: symmetric around the bottom (or around the middle of the arc the sector leaves free).
  if (chord) {
    let midAng = 270;
    if (sector && sector.angle > 270 - chord.angle / 2 - 10) midAng = (sector.angle + 360) / 2;
    const P1 = polar(O, r, midAng - chord.angle / 2);
    const P2 = polar(O, r, midAng + chord.angle / 2);
    items.push({ kind: 'segment', from: xy(P1), to: xy(P2), color: 'teal' });
    extraDots.push({ t: 'dot', at: P1, r: 2.2, color: 'teal' }, { t: 'dot', at: P2, r: 2.2, color: 'teal' });
    if (chord.label) {
      // toward the center if the chord is long enough to leave room there, else outside
      const toCenter = norm(sub(O, mid(P1, P2)));
      const dir = chord.angle >= 40 ? toCenter : mul(toCenter, -1);
      ownLabels.push({ t: 'label', at: mid(P1, P2), text: chord.label, dir, color: 'teal' });
    }
  }

  // Tangent at a point of the circle, with the radius to the point of contact.
  if (tangent) {
    const Pt = polar(O, r, tangent.at);
    const t = polar(v(0, 0), 1, tangent.at + 90);
    const E1 = add(Pt, mul(t, -1.25 * r));
    const E2 = add(Pt, mul(t, 1.25 * r));
    items.push({ kind: 'segment', from: xy(E1), to: xy(E2), color: 'purple' });
    if (!fig.radius) {
      items.push({ kind: 'segment', from: 'O', to: xy(Pt), dashed: true, width: 'thin' });
      spokes.push(tangent.at);
    }
    items.push({ kind: 'angle', vertex: xy(Pt), from: 'O', to: xy(E2), right: true });
    extraDots.push({ t: 'dot', at: Pt, r: 2.2, color: 'purple' });
    if (tangent.label) {
      const out = polar(v(0, 0), 1, tangent.at);
      ownLabels.push({ t: 'label', at: E2, text: tangent.label, dir: add(mul(out, 0.8), mul(t, 0.6)), color: 'purple' });
    }
  }

  // Center dot and label, in the largest free direction.
  extraDots.push({ t: 'dot', at: O, r: 2.5 });
  const centerLabel = fig.centerLabel ?? 'O';
  if (centerLabel) {
    let dirDeg = 225;
    if (spokes.length) {
      const sorted = [...new Set(spokes.map(norm360))].sort((a, b) => a - b);
      let best = -1;
      sorted.forEach((a, i) => {
        const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 360;
        if (next - a > best) {
          best = next - a;
          dirDeg = a + (next - a) / 2;
        }
      });
    }
    ownLabels.unshift({ t: 'label', at: O, text: centerLabel, dir: polar(v(0, 0), 1, dirDeg) });
  }

  const ctx = makeContext(points, items);
  const geo = geoItemsToPrims(ctx, items);
  return assemble(geo, extraDots, ownLabels);
}
