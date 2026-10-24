/**
 * Layout of the step-by-step compass-and-straightedge construction ('construction').
 *
 * Everything (given items + every step) is laid out ONCE in one viewBox, so nothing moves while
 * the student taps through the steps. Every primitive is tagged with its step (0 = given,
 * i + 1 = steps[i]); FigureView shows the prims with step ≤ current step and animates the newest.
 *
 * Extras over the plain 'geometry' items:
 * - `intersections`: named points computed from circles/lines (no hand-computed coordinates);
 * - `{ kind: 'compass' }` items: compass arcs that cover given points (or full circles);
 * - `numberLine`: a number line along y = 0 in the figure's own units (√2 on the number line).
 *
 * Engine file — content authors never need to touch this.
 */
import type { CompassArc, ConstructionCircle, ConstructionFigure, ConstructionItem, ConstructionPoint, GeoItem, PointRef, XY } from './types';
import type { LayoutResult } from './index';
import { geoItemsToPrims, gridPrims, makeContext, type GeoContext } from './geometry';
import { add, cross, dist, mul, norm, perp, sub, v, type Prim, type Vec } from './scene';
import { num } from '../engine/format';

const T = 'construction';
const EPS = 1e-9;

function fail(msg: string): never {
  throw new Error(`${T}: ${msg}`);
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isXY = (p: unknown): p is XY => Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1]);
const xy = (p: Vec): XY => [p.x, p.y];

/** Resolves a point name or literal coordinates, with a clear error for unknown names. */
function pointOf(points: Record<string, XY>, ref: PointRef, field: string): Vec {
  if (Array.isArray(ref)) {
    if (!isXY(ref)) fail(`${field}: coordinates must be two finite numbers (got ${JSON.stringify(ref)})`);
    return v(ref[0], ref[1]);
  }
  const p = points[ref];
  if (!p) fail(`${field}: unknown point "${String(ref)}" (define it in "points" or "intersections")`);
  return v(p[0], p[1]);
}

/** Radius: a positive number, or a point on the circle. */
function radiusOf(points: Record<string, XY>, center: Vec, r: number | PointRef, field: string): number {
  const rad = typeof r === 'number' ? r : dist(center, pointOf(points, r, field));
  if (!isNum(rad) || rad <= EPS) fail(`${field}: the radius must be a positive number or a point other than the center (got ${JSON.stringify(r)})`);
  return rad;
}

// ---------------------------------------------------------------------------------------------
// Intersections
// ---------------------------------------------------------------------------------------------

function circleOf(points: Record<string, XY>, c: ConstructionCircle, field: string): { c: Vec; r: number } {
  if (!Array.isArray(c) || c.length !== 2) fail(`${field} must be [center, radius], e.g. ['A', 3] or ['A', 'B']`);
  const center = pointOf(points, c[0], `${field}[0]`);
  return { c: center, r: radiusOf(points, center, c[1], `${field}[1]`) };
}

function lineOf(points: Record<string, XY>, l: [PointRef, PointRef], field: string): { p: Vec; d: Vec } {
  if (!Array.isArray(l) || l.length !== 2) fail(`${field} must be two points, e.g. ['A', 'B']`);
  const p = pointOf(points, l[0], `${field}[0]`);
  const q = pointOf(points, l[1], `${field}[1]`);
  if (dist(p, q) < EPS) fail(`${field}: the two points of the line coincide`);
  return { p, d: sub(q, p) };
}

function circleCircle(a: { c: Vec; r: number }, b: { c: Vec; r: number }): Vec[] {
  const d = dist(a.c, b.c);
  if (d < EPS) return [];
  const tol = 1e-9 * Math.max(1, a.r, b.r);
  if (d > a.r + b.r + tol || d < Math.abs(a.r - b.r) - tol) return [];
  const x = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a.r * a.r - x * x));
  const u = norm(sub(b.c, a.c));
  const base = add(a.c, mul(u, x));
  return h < tol ? [base] : [add(base, mul(perp(u), h)), sub(base, mul(perp(u), h))];
}

function circleLine(c: { c: Vec; r: number }, l: { p: Vec; d: Vec }): Vec[] {
  // |p + t·d − c|² = r²
  const f = sub(l.p, c.c);
  const A = l.d.x * l.d.x + l.d.y * l.d.y;
  const B = 2 * (f.x * l.d.x + f.y * l.d.y);
  const C = f.x * f.x + f.y * f.y - c.r * c.r;
  const disc = B * B - 4 * A * C;
  const tol = 1e-9 * Math.max(1, B * B, Math.abs(4 * A * C));
  if (disc < -tol) return [];
  const s = Math.sqrt(Math.max(0, disc));
  const t1 = (-B + s) / (2 * A);
  const t2 = (-B - s) / (2 * A);
  return s < 1e-12 ? [add(l.p, mul(l.d, t1))] : [add(l.p, mul(l.d, t1)), add(l.p, mul(l.d, t2))];
}

function computePoint(points: Record<string, XY>, name: string, def: ConstructionPoint): Vec {
  const f = `intersections.${name}`;
  if (!def || typeof def !== 'object') fail(`${f} must be an object like { circles: [['A', 3], ['B', 3]] }`);
  let cands: Vec[];
  let what: string;
  if ('circles' in def) {
    if (!Array.isArray(def.circles) || def.circles.length !== 2) fail(`${f}.circles must be two circles, e.g. [['A', 3], ['B', 3]]`);
    cands = circleCircle(circleOf(points, def.circles[0], `${f}.circles[0]`), circleOf(points, def.circles[1], `${f}.circles[1]`));
    what = 'the two circles do not intersect';
  } else if ('lines' in def) {
    if (!Array.isArray(def.lines) || def.lines.length !== 2) fail(`${f}.lines must be two lines, e.g. [['A', 'B'], ['C', 'D']]`);
    const l1 = lineOf(points, def.lines[0], `${f}.lines[0]`);
    const l2 = lineOf(points, def.lines[1], `${f}.lines[1]`);
    const den = cross(l1.d, l2.d);
    cands = Math.abs(den) < 1e-12 * Math.max(1, Math.hypot(l1.d.x, l1.d.y) * Math.hypot(l2.d.x, l2.d.y)) ? [] : [add(l1.p, mul(l1.d, cross(sub(l2.p, l1.p), l2.d) / den))];
    what = 'the two lines are parallel';
  } else if ('circle' in def && 'line' in def) {
    cands = circleLine(circleOf(points, def.circle, `${f}.circle`), lineOf(points, def.line, `${f}.line`));
    what = 'the line does not cross the circle';
  } else {
    fail(`${f} needs "circles", "lines" or "circle" + "line"`);
  }
  if (cands.length === 0) fail(`${f}: ${what}`);
  if (cands.length === 1) return cands[0];
  if (def.near !== undefined) {
    const n = pointOf(points, def.near, `${f}.near`);
    return dist(cands[0], n) <= dist(cands[1], n) ? cands[0] : cands[1];
  }
  const pick = def.pick ?? 'above';
  const [p, q] = cands;
  const tie = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  switch (pick) {
    case 'above':
      return tie(p.y, q.y) ? (p.x <= q.x ? p : q) : p.y > q.y ? p : q;
    case 'below':
      return tie(p.y, q.y) ? (p.x >= q.x ? p : q) : p.y < q.y ? p : q;
    case 'left':
      return tie(p.x, q.x) ? (p.y >= q.y ? p : q) : p.x < q.x ? p : q;
    case 'right':
      return tie(p.x, q.x) ? (p.y <= q.y ? p : q) : p.x > q.x ? p : q;
    default:
      return fail(`${f}.pick must be 'above', 'below', 'left' or 'right' (got ${JSON.stringify(pick)})`);
  }
}

// ---------------------------------------------------------------------------------------------
// Compass arcs → plain 'arc' items
// ---------------------------------------------------------------------------------------------

const deg = (d: Vec) => (Math.atan2(d.y, d.x) * 180) / Math.PI;
const n360 = (a: number) => ((a % 360) + 360) % 360;

function compassToArc(points: Record<string, XY>, it: CompassArc, field: string): GeoItem {
  const c = pointOf(points, it.center, `${field}.center`);
  const through = it.through ?? [];
  if (!Array.isArray(through)) fail(`${field}.through must be a list of points`);
  let r: number;
  if (it.radius !== undefined) r = radiusOf(points, c, it.radius, `${field}.radius`);
  else if (through.length) r = radiusOf(points, c, through[0], `${field}.through[0]`);
  else fail(`${field} needs "radius" or "through"`);
  const ext = it.extend ?? 15;
  if (!isNum(ext) || ext < 0) fail(`${field}.extend must be a number ≥ 0 (got ${JSON.stringify(it.extend)})`);
  const full: GeoItem = { kind: 'arc', center: xy(c), radius: r, from: 0, to: 360, color: it.color ?? 'muted', dashed: it.dashed };
  if (!through.length) return full;
  const angles = through.map((p, i) => {
    const q = pointOf(points, p, `${field}.through[${i}]`);
    if (dist(q, c) < EPS) fail(`${field}.through[${i}] is the center itself`);
    return n360(deg(sub(q, c)));
  });
  angles.sort((a, b) => a - b);
  // the shortest arc covering every direction = the complement of the largest gap
  let gapEnd = 0;
  let gap = -1;
  angles.forEach((a, i) => {
    const next = i + 1 < angles.length ? angles[i + 1] : angles[0] + 360;
    if (next - a > gap) {
      gap = next - a;
      gapEnd = i + 1 < angles.length ? i + 1 : 0;
    }
  });
  const from = angles[gapEnd];
  const span = 360 - gap;
  if (span + 2 * ext >= 359.5) return full;
  return { ...full, from: from - ext, to: from + span + ext };
}

// ---------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------

const MARKERS = new Set<Prim['t']>(['label', 'ticks', 'rightAngle', 'angleArc', 'parallelMark']);

export function layoutConstruction(fig: ConstructionFigure): LayoutResult {
  if (!fig.points || typeof fig.points !== 'object' || Array.isArray(fig.points)) fail('"points" must be an object like { A: [0, 0], B: [4, 0] }');
  for (const [k, p] of Object.entries(fig.points)) if (!isXY(p)) fail(`points.${k} must be [x, y] with finite numbers (got ${JSON.stringify(p)})`);
  if (!Array.isArray(fig.steps) || fig.steps.length === 0) fail('"steps" must be a non-empty list of { caption, items }');
  fig.steps.forEach((s, i) => {
    if (!s || typeof s.caption !== 'string' || !s.caption.trim()) fail(`steps[${i}].caption must be a non-empty text`);
    if (!Array.isArray(s.items)) fail(`steps[${i}].items must be a list of items`);
  });
  if (fig.given !== undefined && !Array.isArray(fig.given)) fail('"given" must be a list of items');

  // 1. Points, then the computed intersections in order.
  const points: Record<string, XY> = { ...fig.points };
  for (const [name, def] of Object.entries(fig.intersections ?? {})) {
    if (name in fig.points) fail(`intersections.${name}: "${name}" is already defined in "points"`);
    points[name] = xy(computePoint(points, name, def));
  }

  // 2. Compass arcs → arc items; group 0 = given, i + 1 = steps[i].
  const convert = (items: ConstructionItem[], field: string): GeoItem[] =>
    items.map((it, j) => {
      if (!it || typeof it !== 'object') fail(`${field}[${j}] is not an item`);
      return it.kind === 'compass' ? compassToArc(points, it, `${field}[${j}]`) : (it as GeoItem);
    });
  const groups: GeoItem[][] = [convert(fig.given ?? [], 'given'), ...fig.steps.map((s, i) => convert(s.items, `steps[${i}].items`))];

  // 3. Number line (part of the given picture).
  const nl = fig.numberLine;
  const nlDraw: Prim[] = [];
  const nlLabels: Prim[] = [];
  const extraPts: Vec[] = [];
  if (nl) {
    if (!isNum(nl.min) || !isNum(nl.max) || !(nl.min < nl.max)) fail(`numberLine needs min < max (got ${JSON.stringify(nl)})`);
    const step = nl.step ?? 1;
    if (!isNum(step) || step <= 0) fail(`numberLine.step must be > 0 (got ${JSON.stringify(nl.step)})`);
    const k0 = Math.ceil(nl.min / step - 1e-7);
    const k1 = Math.floor(nl.max / step + 1e-7);
    if (k1 - k0 > 60) fail('numberLine has too many ticks; use a larger step');
    const left = v(nl.min - 0.35 * step, 0);
    const right = v(nl.max + 0.6 * step, 0);
    extraPts.push(left, right);
    nlDraw.push({ t: 'seg', a: left, b: right, color: 'ink', w: 1.8, arrowEnd: true, step: 0 });
    const e = step * 1e-3;
    for (let k = k0; k <= k1; k++) {
      const x = k * step;
      nlDraw.push({ t: 'ticks', a: v(x - e, 0), b: v(x + e, 0), count: 1, step: 0 });
      nlLabels.push({ t: 'label', at: v(x, 0), text: num(x), dir: 's', gap: 8, fixed: true, size: 14, step: 0 });
    }
  }

  // 4. One context for all steps (bounds for lines/rays, label sides, labelled names). Arcs
  //    count with their real extent (makeContext would use the full circle's box).
  const all = groups.flat();
  for (const it of all) {
    if (it.kind !== 'arc') continue;
    const c = Array.isArray(it.center) ? v(it.center[0], it.center[1]) : pointOf(points, it.center, 'arc.center');
    const span = it.to - it.from === 360 ? 360 : n360(it.to - it.from);
    for (let k = 0; k <= 24; k++) extraPts.push(add(c, mul(v(Math.cos(((it.from + (span * k) / 24) * Math.PI) / 180), Math.sin(((it.from + (span * k) / 24) * Math.PI) / 180)), it.radius)));
  }
  const ctx: GeoContext = makeContext(points, all.filter((it) => it.kind !== 'arc'), extraPts);
  const draws: Prim[] = [];
  const fills: Prim[] = [];
  const dots: Prim[] = [];
  const marks: Prim[] = [];
  groups.forEach((items, step) => {
    // a point that already has its name written is not named again
    const prepared = items.map((it) =>
      it.kind === 'point' && typeof it.at === 'string' && it.label === undefined && ctx.labelled.has(it.at) ? { ...it, label: false as const } : it,
    );
    let prims: Prim[];
    try {
      prims = geoItemsToPrims(ctx, prepared, step);
    } catch (e) {
      fail(`${step === 0 ? 'given' : `steps[${step - 1}]`}: ${(e as Error).message}`);
    }
    for (const p of prims) {
      if (MARKERS.has(p.t)) marks.push(p);
      else if (p.t === 'dot') dots.push(p);
      else if (p.t === 'poly' && p.color === 'none') fills.push(p);
      else draws.push(p);
    }
  });
  const grid = fig.grid ? gridPrims(ctx, fig.grid === true ? 1 : fig.grid) : [];
  return {
    prims: [...grid, ...fills, ...nlDraw, ...draws, ...dots, ...nlLabels, ...marks],
    steps: fig.steps.map((s) => s.caption),
  };
}
