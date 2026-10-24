/**
 * Layout of the coordinate plane ('coordinate') and the number line ('numberLine').
 *
 * Coordinate plane: world units = mathematical units, with a fixed scale chosen here so both axes
 * get the SAME unit length (true proportions). Pixel-sized offsets are converted with px().
 * Number line: laid out directly in screen units (fit scale 1, y up).
 *
 * Engine file — content authors never need to touch this.
 */
import type { CoordFunction, CoordinateFigure, Dir, FigColor, NumberLineFigure, XY } from './types';
import type { LayoutResult } from './index';
import { add, lerp, mid, mul, norm, perp, sub, textWidth, v, SIZES, type PColor, type Prim, type Vec } from './scene';
import { num } from '../engine/format';

const EPS = 1e-9;

function fail(type: string, msg: string): never {
  throw new Error(`${type}: ${msg}`);
}

function checkNum(type: string, field: string, x: unknown): asserts x is number {
  if (typeof x !== 'number' || !Number.isFinite(x)) fail(type, `${field} must be a finite number (got ${String(x)})`);
}

function checkRange(type: string, field: string, r: unknown): asserts r is [number, number] {
  if (!Array.isArray(r) || r.length !== 2) fail(type, `${field} must be a [min, max] pair`);
  checkNum(type, `${field}[0]`, r[0]);
  checkNum(type, `${field}[1]`, r[1]);
  if (!(r[0] < r[1])) fail(type, `${field} range must have min < max (got [${r[0]}, ${r[1]}])`);
}

/** Integer tick indices k with k·step inside [lo, hi] (tolerant to rounding). */
function tickRange(lo: number, hi: number, step: number): [number, number] {
  return [Math.ceil(lo / step - 1e-7), Math.floor(hi / step + 1e-7)];
}

/** Smallest m from 1, 2, 5, 10, 20, 50 … with m·pitch ≥ need. */
function niceMultiple(pitch: number, need: number): number {
  for (let e = 1; e < 1e9; e *= 10) for (const m of [1, 2, 5]) if (m * e * pitch >= need) return m * e;
  return 1e9;
}

/** Coordinates in Hungarian notation: (2; −3). */
export function coordText(p: XY): string {
  return `(${num(p[0])}; ${num(p[1])})`;
}

interface LBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
}
const boxesOverlap = (a: LBox, b: LBox, margin: number) =>
  Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 + margin && Math.abs(a.cy - b.cy) < (a.h + b.h) / 2 + margin;

// =============================================================================================
// Coordinate plane
// =============================================================================================

/** Usable drawing area for the grid (screen units) per figure size. */
const PLANE_BOX = { small: { w: 190, h: 200 }, medium: { w: 262, h: 280 }, large: { w: 300, h: 340 } } as const;
const NUM_SIZE = 13.5;
const POINT_LABEL_SIZE = 15;

export function layoutCoordinate(fig: CoordinateFigure): LayoutResult {
  const T = 'coordinate';
  checkRange(T, 'x', fig.x);
  checkRange(T, 'y', fig.y);
  const step = fig.step ?? 1;
  checkNum(T, 'step', step);
  if (step <= 0) fail(T, `step must be > 0 (got ${step})`);
  const labelEvery = fig.labelEvery ?? 1;
  if (!Number.isInteger(labelEvery) || labelEvery < 0) fail(T, `labelEvery must be a whole number ≥ 0 (got ${labelEvery})`);

  // The visible range always contains the origin.
  const x0 = Math.min(fig.x[0], 0);
  const x1 = Math.max(fig.x[1], 0);
  const y0 = Math.min(fig.y[0], 0);
  const y1 = Math.max(fig.y[1], 0);
  const [kx0, kx1] = tickRange(x0, x1, step);
  const [ky0, ky1] = tickRange(y0, y1, step);
  if (kx1 - kx0 > 400 || ky1 - ky0 > 400) fail(T, `too many ticks (step ${step} for range x [${x0}, ${x1}], y [${y0}, ${y1}]); use a larger step`);

  const box = PLANE_BOX[fig.size ?? 'medium'];
  const s = Math.min(box.w / (x1 - x0), box.h / (y1 - y0), 60);
  /** Screen units → world units. */
  const px = (n: number) => n / s;
  const inside = (p: XY) => p[0] >= x0 - EPS && p[0] <= x1 + EPS && p[1] >= y0 - EPS && p[1] <= y1 + EPS;
  const checkPoint = (p: unknown, field: string) => {
    if (!Array.isArray(p) || p.length !== 2) fail(T, `${field} must be an [x, y] pair`);
    checkNum(T, `${field}[0]`, p[0]);
    checkNum(T, `${field}[1]`, p[1]);
    if (!inside(p as XY)) fail(T, `${field} ${coordText(p as XY)} is outside the visible range x [${x0}, ${x1}], y [${y0}, ${y1}]`);
  };

  const grid: Prim[] = [];
  const fills: Prim[] = [];
  const axes: Prim[] = [];
  const aux: Prim[] = []; // dashed helper lines
  const graphs: Prim[] = [];
  const numbers: Prim[] = [];
  const markers: Prim[] = [];
  const dots: Prim[] = [];
  const fixedLabels: Prim[] = [];
  const labels: Prim[] = [];

  // --- grid ------------------------------------------------------------------------------------
  const pitch = step * s;
  const tickEvery = niceMultiple(pitch, 4);
  if (fig.grid !== false) {
    const gridEvery = Math.max(tickEvery, niceMultiple(pitch, 7));
    for (let k = kx0; k <= kx1; k++) if (k % gridEvery === 0) grid.push({ t: 'seg', a: v(k * step, y0), b: v(k * step, y1), color: 'grid', w: 1, obstacle: false });
    for (let k = ky0; k <= ky1; k++) if (k % gridEvery === 0) grid.push({ t: 'seg', a: v(x0, k * step), b: v(x1, k * step), color: 'grid', w: 1, obstacle: false });
  }

  // --- axes, ticks -----------------------------------------------------------------------------
  const ARROW = 18;
  axes.push({ t: 'seg', a: v(x0, 0), b: v(x1 + px(ARROW), 0), color: 'axis', w: 1.6, arrowEnd: true });
  axes.push({ t: 'seg', a: v(0, y0), b: v(0, y1 + px(ARROW)), color: 'axis', w: 1.6, arrowEnd: true });
  for (let k = kx0; k <= kx1; k++)
    if (k !== 0 && k % tickEvery === 0) axes.push({ t: 'seg', a: v(k * step, -px(3)), b: v(k * step, px(3)), color: 'axis', w: 1.2, obstacle: false });
  for (let k = ky0; k <= ky1; k++)
    if (k !== 0 && k % tickEvery === 0) axes.push({ t: 'seg', a: v(-px(3), k * step), b: v(px(3), k * step), color: 'axis', w: 1.2, obstacle: false });

  const [xName, yName] = fig.axisLabels ?? ['x', 'y'];
  if (xName) {
    const w = textWidth(xName, 16);
    fixedLabels.push({ t: 'label', at: v(x1 + px(5 + w / 2), 0), text: xName, dir: 'n', gap: 6, fixed: true });
  }
  if (yName) fixedLabels.push({ t: 'label', at: v(0, y1 + px(13)), text: yName, dir: 'e', gap: 7, fixed: true });

  // --- tick numbers ------------------------------------------------------------------------------
  // Text at exact positions with a paper-coloured backing box (hides grid/graph lines behind the
  // digits). The backing box outline is an obstacle, so point labels avoid the numbers.
  const accepted: LBox[] = [];
  const NUM_H = NUM_SIZE * 1.05;
  const addNumber = (text: string, cx: number, cy: number, w: number): void => {
    const b: LBox = { cx, cy, w: w + 2, h: NUM_H };
    if (accepted.some((o) => boxesOverlap(o, b, 2))) return;
    accepted.push(b);
    const hw = px(b.w / 2);
    const hh = px(b.h / 2);
    const X = px(cx);
    const Y = px(cy);
    numbers.push({
      t: 'poly',
      pts: [v(X - hw, Y - hh), v(X + hw, Y - hh), v(X + hw, Y + hh), v(X - hw, Y + hh)],
      closed: true,
      color: 'paper',
      w: 0.5,
      fill: 'paper',
      fillOpacity: 1,
    });
    numbers.push({ t: 'text', at: v(X, Y), text, size: NUM_SIZE, anchor: 'middle', font: 'math', color: 'ink' });
  };
  const originLabel = fig.originLabel ?? (labelEvery === 0 ? '' : '0');
  const BELOW = -(5 + NUM_H / 2); // centre of x-axis numbers, in screen units (y up)
  const LEFT = 5; // gap between the y axis and the right edge of y-axis numbers
  if (originLabel) {
    const w = textWidth(originLabel, NUM_SIZE);
    addNumber(originLabel, -(LEFT + w / 2), BELOW, w);
  }
  if (labelEvery > 0) {
    const minusW = textWidth('−', NUM_SIZE);
    const xs: { k: number; text: string; w: number }[] = [];
    for (let k = kx0; k <= kx1; k++) if (k !== 0 && k % labelEvery === 0) xs.push({ k, text: num(k * step), w: textWidth(num(k * step), NUM_SIZE) });
    const ys: { k: number; text: string; w: number }[] = [];
    for (let k = ky0; k <= ky1; k++) if (k !== 0 && k % labelEvery === 0) ys.push({ k, text: num(k * step), w: textWidth(num(k * step), NUM_SIZE) });
    const maxW = Math.max(0, ...xs.map((q) => q.w));
    const mx = labelEvery * niceMultiple(pitch * labelEvery, maxW + 6) ;
    const my = labelEvery * niceMultiple(pitch * labelEvery, NUM_H + 3);
    for (const q of xs) {
      if (q.k % mx !== 0) continue;
      // centre the digits under the tick; the minus sign sticks out to the left
      const shift = q.k < 0 ? -minusW / 2 : 0;
      addNumber(q.text, q.k * step * s + shift, BELOW, q.w);
    }
    for (const q of ys) if (q.k % my === 0) addNumber(q.text, -(LEFT + q.w / 2), q.k * step * s, q.w);
  }

  // --- polygons --------------------------------------------------------------------------------
  (fig.polygons ?? []).forEach((pg, i) => {
    const f = `polygons[${i}]`;
    if (!Array.isArray(pg.points) || pg.points.length < 2) fail(T, `${f}.points needs at least 2 points`);
    pg.points.forEach((p, j) => checkPoint(p, `${f}.points[${j}]`));
    const pts = pg.points.map((p) => v(p[0], p[1]));
    const fill: FigColor | undefined = pg.fill === true ? 'accent' : pg.fill || undefined;
    fills.push({ t: 'poly', pts, closed: true, color: pg.color ?? 'ink', w: 2, fill, fillOpacity: fill ? 0.2 : undefined });
    if (pg.vertexLabels) {
      if (pg.vertexLabels.length > pts.length) fail(T, `${f}.vertexLabels has more names than the polygon has points`);
      const c = mul(pts.reduce(add, v(0, 0)), 1 / pts.length);
      pg.vertexLabels.forEach((name, j) => {
        if (!name) return;
        const P = pts[j];
        const prev = pts[(j - 1 + pts.length) % pts.length];
        const next = pts[(j + 1) % pts.length];
        let d = mul(add(norm(sub(prev, P)), norm(sub(next, P))), -1);
        if (Math.hypot(d.x, d.y) < 1e-6) d = sub(P, c);
        dots.push({ t: 'dot', at: P, r: 3, color: pg.color ?? 'ink' });
        labels.push({ t: 'label', at: P, text: name, dir: norm(d), color: pg.color, size: POINT_LABEL_SIZE });
      });
    }
  });

  // --- functions -------------------------------------------------------------------------------
  const funcLabels: Prim[] = [];
  (fig.functions ?? []).forEach((fn, i) => {
    const res = functionPrims(fn, `functions[${i}]`, { x0, x1, y0, y1 }, px);
    graphs.push(...res.prims);
    funcLabels.push(...res.labels);
  });

  // --- segments --------------------------------------------------------------------------------
  const segLabels: Prim[] = [];
  const planeCenter = v((x0 + x1) / 2, (y0 + y1) / 2);
  (fig.segments ?? []).forEach((sg, i) => {
    checkPoint(sg.from, `segments[${i}].from`);
    checkPoint(sg.to, `segments[${i}].to`);
    const a = v(sg.from[0], sg.from[1]);
    const b = v(sg.to[0], sg.to[1]);
    graphs.push({ t: 'seg', a, b, color: sg.color ?? 'ink', w: 2.2, dash: sg.dashed ? 'dashed' : 'solid' });
    if (sg.label) {
      const m = mid(a, b);
      let n = norm(perp(sub(b, a)));
      const away = sub(m, planeCenter);
      if (n.x * away.x + n.y * away.y < 0 || (Math.abs(away.x) + Math.abs(away.y) < 1e-9 && n.y < 0)) n = mul(n, -1);
      segLabels.push({ t: 'label', at: m, text: sg.label, dir: n, color: sg.color, size: POINT_LABEL_SIZE });
    }
  });

  // --- points ----------------------------------------------------------------------------------
  const pointKeys = new Set<string>();
  const pointLabels: Prim[] = [];
  (fig.points ?? []).forEach((pt, i) => {
    checkPoint(pt.at, `points[${i}].at`);
    const P = v(pt.at[0], pt.at[1]);
    pointKeys.add(`${P.x},${P.y}`);
    if (pt.projections) {
      if (Math.abs(P.y) > EPS) aux.push({ t: 'seg', a: P, b: v(P.x, 0), color: 'muted', w: 1.3, dash: 'dashed' });
      if (Math.abs(P.x) > EPS) aux.push({ t: 'seg', a: P, b: v(0, P.y), color: 'muted', w: 1.3, dash: 'dashed' });
    }
    dots.push({ t: 'dot', at: P, r: 3.6, color: pt.color ?? 'ink', hollow: pt.hollow });
    const text = pt.showCoords ? `${pt.label ?? ''}${coordText(pt.at)}` : pt.label;
    if (text) {
      const dir: Dir | Vec = pt.labelDir ?? norm(v(P.x < -EPS ? -1 : 1, P.y < -EPS ? -1 : 1));
      pointLabels.push({ t: 'label', at: P, text, dir, color: pt.color, size: POINT_LABEL_SIZE, gap: 5 });
    }
  });

  // --- distances -------------------------------------------------------------------------------
  const distLabels: Prim[] = [];
  (fig.distances ?? []).forEach((ds, i) => {
    const f = `distances[${i}]`;
    checkPoint(ds.from, `${f}.from`);
    checkPoint(ds.to, `${f}.to`);
    const A = v(ds.from[0], ds.from[1]);
    const B = v(ds.to[0], ds.to[1]);
    if (Math.abs(A.x - B.x) < EPS && Math.abs(A.y - B.y) < EPS) fail(T, `${f}: from and to are the same point`);
    const color = ds.color ?? 'highlight';
    // Right-angle corner below the hypotenuse: x of the higher point, y of the lower point.
    const [lo, hi] = A.y <= B.y ? [A, B] : [B, A];
    const C = v(hi.x, lo.y);
    const horizontal = Math.abs(A.x - B.x) > EPS;
    const vertical = Math.abs(A.y - B.y) > EPS;
    if (horizontal && vertical) {
      aux.push({ t: 'seg', a: lo, b: C, color: 'accent', w: 1.6, dash: 'dashed' });
      aux.push({ t: 'seg', a: C, b: hi, color: 'accent', w: 1.6, dash: 'dashed' });
      markers.push({ t: 'rightAngle', at: C, p1: lo, p2: hi, color: 'accent' });
    }
    graphs.push({ t: 'seg', a: A, b: B, color, w: 2.8 });
    for (const P of [A, B]) if (!pointKeys.has(`${P.x},${P.y}`)) dots.push({ t: 'dot', at: P, r: 3, color: 'ink' });
    const L = ds.labels ?? {};
    if (L.dx && horizontal) distLabels.push({ t: 'label', at: mid(lo, C), text: L.dx, dir: vertical ? 's' : 'n', color: 'accent', size: POINT_LABEL_SIZE });
    if (L.dy && vertical) distLabels.push({ t: 'label', at: mid(C, hi), text: L.dy, dir: horizontal ? (lo.x < C.x ? 'e' : 'w') : 'e', color: 'accent', size: POINT_LABEL_SIZE });
    if (L.d) {
      let n = norm(perp(sub(B, A)));
      const away = sub(mid(A, B), C);
      if (horizontal && vertical && n.x * away.x + n.y * away.y < 0) n = mul(n, -1);
      if (!(horizontal && vertical) && n.y < 0) n = mul(n, -1);
      distLabels.push({ t: 'label', at: mid(A, B), text: L.d, dir: n, color, size: POINT_LABEL_SIZE });
    }
  });

  const prims: Prim[] = [
    ...grid,
    ...fills,
    ...axes,
    ...aux,
    ...graphs,
    ...numbers,
    ...markers,
    ...dots,
    ...fixedLabels,
    ...pointLabels,
    ...distLabels,
    ...labels,
    ...funcLabels,
    ...segLabels,
  ];
  return { prims, fit: { scale: s } };
}

interface Window {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** A graph clipped to the window, plus its label. */
function functionPrims(fn: CoordFunction, field: string, win: Window, px: (n: number) => number): { prims: Prim[]; labels: Prim[] } {
  const T = 'coordinate';
  const color: PColor = fn.color ?? 'accent';
  const dash = fn.dashed ? 'dashed' : 'solid';
  const prims: Prim[] = [];
  const labels: Prim[] = [];
  const { x0, x1, y0, y1 } = win;
  const label = (at: Vec, dir: Vec | Dir) => {
    if (fn.label) labels.push({ t: 'label', at, text: fn.label, dir, color, size: POINT_LABEL_SIZE, gap: 6 });
  };

  if (fn.kind === 'linear') {
    checkNum(T, `${field}.k`, fn.k);
    const n = fn.n ?? 0;
    checkNum(T, `${field}.n`, n);
    let lo = x0;
    let hi = x1;
    if (Math.abs(fn.k) < 1e-12) {
      if (n < y0 - EPS || n > y1 + EPS) fail(T, `${field} (y = ${n}) is outside the visible y range [${y0}, ${y1}]`);
    } else {
      const xa = (y0 - n) / fn.k;
      const xb = (y1 - n) / fn.k;
      lo = Math.max(x0, Math.min(xa, xb));
      hi = Math.min(x1, Math.max(xa, xb));
    }
    if (hi - lo < 1e-9) fail(T, `${field} (y = ${fn.k}·x + ${n}) does not pass through the visible range`);
    const clampY = (y: number) => Math.min(y1, Math.max(y0, y));
    const P = v(lo, clampY(fn.k * lo + n));
    const Q = v(hi, clampY(fn.k * hi + n));
    prims.push({ t: 'seg', a: P, b: Q, color, w: 2.2, dash });
    let nrm = norm(perp(sub(Q, P)));
    if (nrm.y < 0) nrm = mul(nrm, -1);
    label(lerp(P, Q, 0.82), nrm);
    return { prims, labels };
  }

  if (fn.kind === 'vertical') {
    checkNum(T, `${field}.x`, fn.x);
    if (fn.x < x0 - EPS || fn.x > x1 + EPS) fail(T, `${field} (x = ${fn.x}) is outside the visible x range [${x0}, ${x1}]`);
    prims.push({ t: 'seg', a: v(fn.x, y0), b: v(fn.x, y1), color, w: 2.2, dash });
    label(v(fn.x, y1 - (y1 - y0) * 0.12), 'e');
    return { prims, labels };
  }

  // inverse proportionality y = k / x: one polyline per branch, cut at the window edges.
  const k = fn.k;
  checkNum(T, `${field}.k`, k);
  if (Math.abs(k) < 1e-12) fail(T, `${field}.k must not be 0 for an inverse proportionality`);
  const branches: [number, number][] = [];
  if (x1 > EPS) branches.push([Math.max(x0, 0), x1]);
  if (!fn.positiveOnly && x0 < -EPS) branches.push([x0, Math.min(x1, 0)]);
  const visible = (x: number) => Math.abs(x) > 1e-12 && k / x >= y0 - EPS && k / x <= y1 + EPS;
  let labelled = false;
  let anyBranch = false;
  for (const [a, b] of branches) {
    // y = k/x is monotonic on a branch, so the visible part is a single interval whose ends are
    // among a, b, k/y0, k/y1.
    const cands = [a, b, ...[y0, y1].filter((y) => Math.abs(y) > 1e-12).map((y) => k / y)]
      .filter((x) => x >= a - EPS && x <= b + EPS)
      .sort((p, q) => p - q);
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i + 1 < cands.length; i++) {
      const m = (cands[i] + cands[i + 1]) / 2;
      if (cands[i + 1] - cands[i] > 1e-9 && visible(m)) {
        lo = Math.min(lo, cands[i]);
        hi = Math.max(hi, cands[i + 1]);
      }
    }
    if (!(hi > lo)) continue;
    anyBranch = true;
    // Samples uniform in x and in y, so both the flat and the steep parts are smooth.
    const xs = new Set<number>([lo, hi]);
    const N = 160;
    for (let i = 1; i < N; i++) xs.add(lo + ((hi - lo) * i) / N);
    const ya = k / lo;
    const yb = k / hi;
    for (let i = 1; i < N; i++) {
      const y = ya + ((yb - ya) * i) / N;
      if (Math.abs(y) > 1e-12) {
        const x = k / y;
        if (x > lo && x < hi) xs.add(x);
      }
    }
    const sorted = [...xs].sort((p, q) => p - q);
    const pts = sorted.map((x) => v(x, Math.min(y1, Math.max(y0, k / x))));
    prims.push({ t: 'poly', pts, closed: false, color, w: 2.2, dash });
    if (!labelled && fn.label) {
      // Label at the "elbow" (x = ±√|k|) if visible, else in the middle of the visible part.
      const sign = a >= 0 ? 1 : -1;
      let x = sign * Math.sqrt(Math.abs(k));
      if (!(x > lo && x < hi)) x = sorted[Math.floor(sorted.length / 2)];
      const y = k / x;
      label(v(x, y), norm(v(Math.sign(x) || 1, Math.sign(y) || 1)));
      labelled = true;
    }
  }
  if (!anyBranch) fail(T, `${field} (y = ${k}/x) does not pass through the visible range`);
  void px;
  return { prims, labels };
}

// =============================================================================================
// Number line
// =============================================================================================

const NL_NUM = 14;
const NL_FRAC = 13;
const INTERVAL_COLORS: FigColor[] = ['accent', 'highlight', 'green', 'purple'];

export function layoutNumberLine(fig: NumberLineFigure): LayoutResult {
  const T = 'numberLine';
  checkNum(T, 'min', fig.min);
  checkNum(T, 'max', fig.max);
  if (!(fig.min < fig.max)) fail(T, `min must be < max (got min ${fig.min}, max ${fig.max})`);
  checkNum(T, 'step', fig.step);
  if (fig.step <= 0) fail(T, `step must be > 0 (got ${fig.step})`);
  const subdiv = fig.subdivisions ?? 1;
  if (!Number.isInteger(subdiv) || subdiv < 1 || subdiv > 20) fail(T, `subdivisions must be a whole number 1–20 (got ${subdiv})`);
  const den = fig.fractionDenominator;
  if (den !== undefined && (!Number.isInteger(den) || den < 1 || den > 100)) fail(T, `fractionDenominator must be a whole number 1–100 (got ${den})`);
  const { min, max, step } = fig;
  const [k0, k1] = tickRange(min, max, step);
  if (k1 - k0 > 100) fail(T, `too many major ticks (${k1 - k0 + 1}); use a larger step`);
  if ((k1 - k0 + 1) * subdiv > 400) fail(T, `too many minor ticks; use fewer subdivisions`);
  const inRange = (x: number) => x >= min - EPS && x <= max + EPS;
  const checkValue = (x: unknown, field: string) => {
    checkNum(T, field, x);
    if (!inRange(x)) fail(T, `${field} (${x}) is outside [min, max] = [${min}, ${max}]`);
  };

  const W = SIZES[fig.size ?? 'medium'].w;
  const LEFT_EXT = 10;
  const RIGHT_EXT = 22;
  const lineLen = W - 58;
  const u = lineLen / (max - min);
  const X = (x: number) => (x - min) * u;

  const lines: Prim[] = [];
  const ticks: Prim[] = [];
  const overlay: Prim[] = [];
  const dots: Prim[] = [];
  const tickLabels: Prim[] = [];
  const labels: Prim[] = [];

  lines.push({ t: 'seg', a: v(-LEFT_EXT, 0), b: v(lineLen + RIGHT_EXT, 0), color: 'ink', w: 1.8, arrowEnd: true });

  // --- ticks -----------------------------------------------------------------------------------
  const sub = step / subdiv;
  const [j0, j1] = tickRange(min, max, sub);
  const majorAt = new Set<number>();
  for (let j = j0; j <= j1; j++) {
    const major = j % subdiv === 0;
    const x = X(j * sub);
    if (major) majorAt.add(j);
    const hh = major ? 6.5 : 4;
    ticks.push({ t: 'seg', a: v(x, -hh), b: v(x, hh), color: 'ink', w: major ? 1.6 : 1.1, obstacle: false });
  }

  // --- tick numbers ----------------------------------------------------------------------------
  type Cand = { value: number; idx: number };
  const mode = fig.tickLabels ?? 'major';
  let cands: Cand[] = [];
  let thin = true;
  let unit = step;
  if (Array.isArray(mode)) {
    thin = false;
    mode.forEach((x, i) => {
      checkValue(x, `tickLabels[${i}]`);
      cands.push({ value: x, idx: i });
      const onTick = Math.abs(x / sub - Math.round(x / sub)) < 1e-7 && Math.round(x / sub) % subdiv === 0;
      if (!onTick) ticks.push({ t: 'seg', a: v(X(x), -6.5), b: v(X(x), 6.5), color: 'ink', w: 1.6, obstacle: false });
    });
  } else if (mode === 'major' || mode === 'ends') {
    for (let k = k0; k <= k1; k++) cands.push({ value: k * step, idx: k });
    if (mode === 'ends') {
      cands = cands.length > 1 ? [cands[0], cands[cands.length - 1]] : cands;
      thin = false;
    }
  } else if (mode === 'all') {
    unit = sub;
    for (let j = j0; j <= j1; j++) cands.push({ value: j * sub, idx: j });
  }

  const labelOf = (x: number): { text: string; frac?: { num: string; den: string }; neg: boolean } => {
    if (den !== undefined) {
      const kk = Math.round(x * den);
      if (Math.abs(x * den - kk) < 1e-6) {
        if (kk % den === 0) return { text: num(kk / den), neg: false };
        return { text: `${kk}/${den}`, frac: { num: String(Math.abs(kk)), den: String(den) }, neg: kk < 0 };
      }
    }
    return { text: num(x), neg: false };
  };
  const minusW = textWidth('−', NL_FRAC);
  const widthOf = (l: ReturnType<typeof labelOf>) =>
    l.frac ? Math.max(textWidth(l.frac.num, NL_FRAC), textWidth(l.frac.den, NL_FRAC)) + 4 + (l.neg ? minusW + 2 : 0) : textWidth(l.text, NL_NUM);
  const labelled = cands.map((c) => ({ ...c, l: labelOf(c.value) }));
  let every = 1;
  if (thin && labelled.length > 1) {
    const maxW = Math.max(...labelled.map((c) => widthOf(c.l)));
    every = niceMultiple(unit * u, maxW + 6);
  }
  const hasFrac = labelled.some((c) => c.l.frac);
  const labelH = hasFrac ? NL_FRAC * 2.3 : NL_NUM * 1.15;
  const placedNums: LBox[] = [];
  for (const c of labelled) {
    if (thin && c.idx % every !== 0) continue;
    const x = X(c.value);
    const w = widthOf(c.l);
    const h = c.l.frac ? NL_FRAC * 2.3 : NL_NUM * 1.15;
    const b: LBox = { cx: x, cy: -(10 + h / 2), w, h };
    if (placedNums.some((o) => boxesOverlap(o, b, 1))) continue;
    placedNums.push(b);
    if (c.l.frac) {
      tickLabels.push({ t: 'label', at: v(x, -6.5), text: c.l.text, frac: c.l.frac, dir: 's', gap: 3, fixed: true, size: NL_FRAC });
      if (c.l.neg) {
        const fw = Math.max(textWidth(c.l.frac.num, NL_FRAC), textWidth(c.l.frac.den, NL_FRAC)) + 4;
        tickLabels.push({ t: 'text', at: v(x - fw / 2 - minusW / 2 - 1, -6.5 - 3 - (NL_FRAC * 2.3) / 2), text: '−', size: NL_FRAC, font: 'math' });
      }
    } else {
      tickLabels.push({ t: 'label', at: v(x, -6.5), text: c.l.text, dir: 's', gap: 3, fixed: true, size: NL_NUM });
    }
  }

  // --- intervals -------------------------------------------------------------------------------
  const intervals = fig.intervals ?? [];
  intervals.forEach((iv, i) => {
    const f = `intervals[${i}]`;
    for (const key of ['from', 'to'] as const) {
      const x = iv[key];
      if (typeof x !== 'number' || Number.isNaN(x)) fail(T, `${f}.${key} must be a number (or ±Infinity)`);
      if (Number.isFinite(x) && !inRange(x)) fail(T, `${f}.${key} (${x}) is outside [min, max] = [${min}, ${max}]`);
    }
    if (!(iv.from < iv.to)) fail(T, `${f}: from must be < to (got ${iv.from}, ${iv.to})`);
    const color: FigColor = iv.color ?? INTERVAL_COLORS[i % INTERVAL_COLORS.length];
    const y = 14 + 13 * i;
    const xa = Number.isFinite(iv.from) ? X(iv.from) : -LEFT_EXT - 4;
    const xb = Number.isFinite(iv.to) ? X(iv.to) : lineLen + RIGHT_EXT;
    overlay.push({ t: 'seg', a: v(xa, y), b: v(xb, y), color, w: 4, arrowStart: !Number.isFinite(iv.from), arrowEnd: !Number.isFinite(iv.to) });
    const ends: [number, boolean][] = [];
    if (Number.isFinite(iv.from)) ends.push([xa, iv.fromClosed !== false]);
    if (Number.isFinite(iv.to)) ends.push([xb, iv.toClosed !== false]);
    for (const [x, closed] of ends) {
      overlay.push({ t: 'seg', a: v(x, y - 5), b: v(x, 0), color, w: 1, dash: 'dashed', obstacle: false });
      dots.push({ t: 'dot', at: v(x, y), r: 5, color, hollow: !closed });
    }
    if (iv.label) labels.push({ t: 'label', at: v((Math.max(xa, -LEFT_EXT) + Math.min(xb, lineLen)) / 2, y), text: iv.label, dir: 'n', gap: 6, color, size: 15 });
  });

  // --- jumps -----------------------------------------------------------------------------------
  const jumpBase = intervals.length ? 14 + 13 * intervals.length : 2;
  /** Spans and heights of the jumps drawn so far: an overlapping jump is drawn taller. */
  const drawnJumps: { lo: number; hi: number; h: number }[] = [];
  (fig.jumps ?? []).forEach((jp, i) => {
    const f = `jumps[${i}]`;
    checkValue(jp.from, `${f}.from`);
    checkValue(jp.to, `${f}.to`);
    if (Math.abs(jp.from - jp.to) < EPS) fail(T, `${f}: from and to are equal`);
    const color: FigColor = jp.color ?? 'highlight';
    const xa = X(jp.from);
    const xb = X(jp.to);
    const c = Math.abs(xb - xa);
    let h = Math.min(42, Math.max(12, 0.3 * c + 6));
    const lo = Math.min(xa, xb);
    const hi = Math.max(xa, xb);
    for (const o of drawnJumps) if (Math.min(hi, o.hi) - Math.max(lo, o.lo) > 1) h = Math.max(h, o.h + 18);
    drawnJumps.push({ lo, hi, h });
    const R = (c * c) / 4 / (2 * h) + h / 2;
    const cx = (xa + xb) / 2;
    const cy = jumpBase + h - R;
    let ta = Math.atan2(jumpBase - cy, xa - cx);
    let tb = Math.atan2(jumpBase - cy, xb - cx);
    if (xa < xb) {
      while (ta < tb) ta += 2 * Math.PI;
    } else {
      while (tb < ta) tb += 2 * Math.PI;
    }
    const pts: Vec[] = [];
    const N = 40;
    for (let q = 0; q <= N; q++) {
      const t = ta + ((tb - ta) * q) / N;
      pts.push(v(cx + R * Math.cos(t), cy + R * Math.sin(t)));
    }
    overlay.push({ t: 'poly', pts, closed: false, color, w: 1.8 });
    overlay.push({ t: 'seg', a: pts[N - 2], b: pts[N], color, w: 1.8, arrowEnd: true });
    const d = jp.to - jp.from;
    const text = jp.label ?? `${d > 0 ? '+' : '−'}${num(Math.abs(d))}`;
    if (text) labels.push({ t: 'label', at: v(cx, jumpBase + h), text, dir: 'n', gap: 3, color, size: 15 });
  });

  // --- points ----------------------------------------------------------------------------------
  const pointLabels: Prim[] = [];
  (fig.points ?? []).forEach((pt, i) => {
    checkValue(pt.value, `points[${i}].value`);
    const color: FigColor = pt.color ?? 'accent';
    const x = X(pt.value);
    dots.push({ t: 'dot', at: v(x, 0), r: 4.5, color, hollow: pt.open });
    if (pt.label) {
      pointLabels.push(
        pt.below
          ? { t: 'label', at: v(x, 0), text: pt.label, dir: 's', gap: 10 + labelH + 2, color, size: 16 }
          : { t: 'label', at: v(x, 0), text: pt.label, dir: 'n', gap: 8 + (intervals.length ? 13 * intervals.length + 6 : 0), color, size: 16 },
      );
    }
  });

  return {
    prims: [...lines, ...ticks, ...overlay, ...dots, ...tickLabels, ...pointLabels, ...labels],
    fit: { scale: 1 },
  };
}
