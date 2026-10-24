/**
 * Shared helpers for the data/statistics figures (charts.ts, charts-pie.ts, charts-table.ts):
 * parameter checks, the "nice" value axis, text wrapping, legends, rounded bars and the
 * pictogram symbol shapes. Everything is laid out in screen-like units (fit scale 1, y up).
 *
 * Engine file — content authors never need to touch this.
 */
import type { FigColor } from './types';
import { textWidth, v, SIZES, type PColor, type Prim, type Vec } from './scene';
import { num } from '../engine/format';

// ---------------------------------------------------------------------------------------------
// Parameter checks
// ---------------------------------------------------------------------------------------------

export function fail(type: string, msg: string): never {
  throw new Error(`${type}: ${msg}`);
}

export function checkNum(type: string, field: string, x: unknown): asserts x is number {
  if (typeof x !== 'number' || !Number.isFinite(x)) fail(type, `${field} must be a finite number (got ${String(x)})`);
}

export function checkString(type: string, field: string, x: unknown): asserts x is string {
  if (typeof x !== 'string') fail(type, `${field} must be a string (got ${String(x)})`);
}

const FIG_COLORS = new Set<string>(['ink', 'accent', 'highlight', 'muted', 'good', 'bad', 'blue', 'green', 'orange', 'purple', 'red', 'teal']);

export function checkColor(type: string, field: string, c: unknown): void {
  if (c !== undefined && (typeof c !== 'string' || !FIG_COLORS.has(c))) {
    fail(type, `${field} must be one of ${[...FIG_COLORS].join(', ')} (got ${String(c)})`);
  }
}

/** The chart palette: series / slice i gets PALETTE[i] unless it has its own color. */
export const PALETTE: PColor[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

export function seriesColor(i: number, own: FigColor | undefined): PColor {
  return own ?? PALETTE[i % PALETTE.length];
}

/** Table cells / labels: numbers get the decimal comma, strings stay as they are. */
export function cellText(x: string | number): string {
  return typeof x === 'number' ? num(x) : x;
}

const isInt = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
/** Removes floating-point noise (0.30000000000000004 → 0.3). */
export const clean = (x: number) => (x === 0 ? 0 : Number(x.toPrecision(12)));

// ---------------------------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------------------------

/** Font sizes (screen units). */
export const FS = { axis: 12.5, cat: 13, title: 13, value: 12, legend: 13 } as const;

/** Total width the layout aims for (the figure scales with the card; ~1 unit ≈ 1 CSS px on phones). */
export function chartWidth(size: 'small' | 'medium' | 'large' | undefined): number {
  return SIZES[size ?? 'medium'].w;
}

/** Height of the plot area of bar/line charts. */
export function plotHeight(size: 'small' | 'medium' | 'large' | undefined): number {
  return { small: 120, medium: 160, large: 200 }[size ?? 'medium'];
}

/** Smallest m from 1, 2, 5, 10, 20, 50 … with m·pitch ≥ need. */
export function niceMultiple(pitch: number, need: number): number {
  for (let e = 1; e < 1e9; e *= 10) for (const m of [1, 2, 5]) if (m * e * pitch >= need) return m * e;
  return 1e9;
}

// ---------------------------------------------------------------------------------------------
// Value axis
// ---------------------------------------------------------------------------------------------

export interface ValueAxis {
  lo: number;
  hi: number;
  step: number;
  /** Multiples of step inside [lo, hi]. */
  ticks: number[];
}

/**
 * The value axis of a bar/line chart. Defaults: lo = 0 (or a step multiple below the smallest
 * negative value), hi = the largest value rounded up to a step multiple, step = the smallest of
 * 1, 2, 2.5, 5 × 10ⁿ that gives at most 6 intervals (whole steps only when all data are whole).
 */
export function valueAxis(type: string, values: number[], o: { yMin?: number; yMax?: number; yStep?: number }): ValueAxis {
  if (o.yMin !== undefined) checkNum(type, 'yMin', o.yMin);
  if (o.yMax !== undefined) checkNum(type, 'yMax', o.yMax);
  if (o.yStep !== undefined) {
    checkNum(type, 'yStep', o.yStep);
    if (o.yStep <= 0) fail(type, `yStep must be > 0 (got ${o.yStep})`);
  }
  if (o.yMin !== undefined && o.yMax !== undefined && !(o.yMax > o.yMin)) {
    fail(type, `yMax must be greater than yMin (got yMin ${o.yMin}, yMax ${o.yMax})`);
  }
  if (o.yMax !== undefined && o.yMin === undefined && o.yMax <= 0 && Math.min(...values) >= 0) {
    fail(type, `yMax must be > 0 (got ${o.yMax})`);
  }
  const dMin = Math.min(...values);
  let dMax = Math.max(...values);
  const base = o.yMin ?? Math.min(0, dMin);
  if (o.yMax === undefined && dMax <= base && dMin >= base) dMax = base + 5; // all values equal to the base (e.g. all 0)
  const integer = [...values, o.yMin ?? 0, o.yMax ?? 0].every(isInt);

  const build = (step: number) => {
    const lo = o.yMin ?? (dMin >= 0 ? 0 : clean(Math.floor(dMin / step + 1e-9) * step));
    const hi = o.yMax ?? (dMax <= 0 && dMin < 0 ? 0 : clean(Math.ceil(dMax / step - 1e-9) * step));
    return { lo, hi };
  };

  let step = o.yStep;
  if (step === undefined) {
    search: for (let e = -6; e <= 12; e++) {
      for (const m of [1, 2, 2.5, 5]) {
        const s = clean(m * 10 ** e);
        if (integer && !isInt(s)) continue;
        const { lo, hi } = build(s);
        if (hi > lo && (hi - lo) / s <= 6 + 1e-9) {
          step = s;
          break search;
        }
      }
    }
    if (step === undefined) fail(type, 'could not choose a value-axis step (values too large?)');
  }
  const { lo, hi } = build(step);
  if (!(hi > lo)) fail(type, `the value axis is empty (yMin ${lo}, yMax ${hi})`);
  const k0 = Math.ceil(lo / step - 1e-9);
  const k1 = Math.floor(hi / step + 1e-9);
  if (k1 - k0 > 60) fail(type, `too many grid lines (${k1 - k0 + 1}) for yStep ${step}; use a larger yStep`);
  const ticks: number[] = [];
  for (let k = k0; k <= k1; k++) ticks.push(clean(k * step));
  return { lo, hi, step, ticks };
}

/** Throws if a value is outside [lo, hi] of the axis. */
export function checkInAxis(type: string, ax: ValueAxis, value: number, field: string): void {
  const tol = (ax.hi - ax.lo) * 1e-9;
  if (value > ax.hi + tol) fail(type, `${field} = ${value} is above yMax (${ax.hi}); raise yMax or leave it out`);
  if (value < ax.lo - tol) fail(type, `${field} = ${value} is below yMin (${ax.lo}); lower yMin or leave it out`);
}

// ---------------------------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------------------------

/** Bold text is a little wider than textWidth() estimates. */
export const BOLD = 1.08;

/**
 * Splits a label into at most two lines (at a space or after a hyphen) so that the wider line is
 * as narrow as possible. Returns null if it does not fit into maxW.
 */
export function wrap2(text: string, size: number, maxW: number): string[] | null {
  if (textWidth(text, size) <= maxW) return [text];
  const best = bestSplit(text, size);
  return best.length === 2 && Math.max(...best.map((l) => textWidth(l, size))) <= maxW ? best : null;
}

/** The best two-line split of a label (or the label itself if it has no break point). */
export function bestSplit(text: string, size: number): string[] {
  let best: string[] = [text];
  let bestW = textWidth(text, size);
  for (let i = 1; i < text.length; i++) {
    let a: string;
    let b: string;
    if (text[i] === ' ') {
      a = text.slice(0, i);
      b = text.slice(i + 1);
    } else if (text[i - 1] === '-' || text[i - 1] === '/') {
      a = text.slice(0, i);
      b = text.slice(i);
    } else continue;
    a = a.trim();
    b = b.trim();
    if (!a || !b) continue;
    const w = Math.max(textWidth(a, size), textWidth(b, size));
    if (w < bestW) {
      bestW = w;
      best = [a, b];
    }
  }
  return best;
}

/** Shortens a label with '…' so it fits maxW. */
export function ellipsize(text: string, size: number, maxW: number): string {
  if (textWidth(text, size) <= maxW) return text;
  let t = text;
  while (t.length > 1 && textWidth(t + '…', size) > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

// ---------------------------------------------------------------------------------------------
// Boxes (y up: y0 = bottom, y1 = top)
// ---------------------------------------------------------------------------------------------

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const centeredRect = (c: Vec, w: number, h: number): Rect => ({ x0: c.x - w / 2, y0: c.y - h / 2, x1: c.x + w / 2, y1: c.y + h / 2 });

export const rectsOverlap = (a: Rect, b: Rect, margin = 0): boolean =>
  a.x0 < b.x1 + margin && b.x0 < a.x1 + margin && a.y0 < b.y1 + margin && b.y0 < a.y1 + margin;

/** Does the segment pq cross the rectangle? (Liang–Barsky) */
export function segHitsRect(p: Vec, q: Vec, r: Rect): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const checks: [number, number][] = [
    [-dx, p.x - r.x0],
    [dx, r.x1 - p.x],
    [-dy, p.y - r.y0],
    [dy, r.y1 - p.y],
  ];
  for (const [pp, qq] of checks) {
    if (Math.abs(pp) < 1e-12) {
      if (qq < 0) return false;
    } else {
      const t = qq / pp;
      if (pp < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return t0 <= t1;
}

// ---------------------------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------------------------

function cornerPts(cx: number, cy: number, r: number, from: number, to: number): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i <= 4; i++) {
    const a = ((from + ((to - from) * i) / 4) * Math.PI) / 180;
    pts.push(v(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return pts;
}

/**
 * Rectangle [x0, x1] × [y0, y1] (y up) with rounded corners on one side (the data end of a bar),
 * or on all corners.
 */
export function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number, side: 'top' | 'bottom' | 'left' | 'right' | 'all'): Vec[] {
  const rr = Math.max(0, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
  const has = (c: 'bl' | 'br' | 'tr' | 'tl') =>
    rr > 0.3 &&
    (side === 'all' ||
      (side === 'top' && (c === 'tl' || c === 'tr')) ||
      (side === 'bottom' && (c === 'bl' || c === 'br')) ||
      (side === 'left' && (c === 'bl' || c === 'tl')) ||
      (side === 'right' && (c === 'br' || c === 'tr')));
  const pts: Vec[] = [];
  pts.push(...(has('bl') ? cornerPts(x0 + rr, y0 + rr, rr, 180, 270) : [v(x0, y0)]));
  pts.push(...(has('br') ? cornerPts(x1 - rr, y0 + rr, rr, 270, 360) : [v(x1, y0)]));
  pts.push(...(has('tr') ? cornerPts(x1 - rr, y1 - rr, rr, 0, 90) : [v(x1, y1)]));
  pts.push(...(has('tl') ? cornerPts(x0 + rr, y1 - rr, rr, 90, 180) : [v(x0, y1)]));
  return pts;
}

/** A filled rectangle (backing box / cell). */
export function rect(x0: number, y0: number, x1: number, y1: number, fill: PColor, fillOpacity = 1): Prim {
  return { t: 'poly', pts: [v(x0, y0), v(x1, y0), v(x1, y1), v(x0, y1)], closed: true, color: 'none', fill, fillOpacity, obstacle: false };
}

export type SymbolKind = 'circle' | 'square' | 'star' | 'person' | 'heart';

/** Pictogram symbol polygons centred at (cx, cy), fitting an s × s box (y up). */
export function symbolPolys(kind: SymbolKind, cx: number, cy: number, s: number): Vec[][] {
  const circle = (x: number, y: number, r: number, n = 28): Vec[] =>
    Array.from({ length: n }, (_, i) => v(x + r * Math.cos((2 * Math.PI * i) / n), y + r * Math.sin((2 * Math.PI * i) / n)));
  switch (kind) {
    case 'circle':
      return [circle(cx, cy, s * 0.46)];
    case 'square':
      return [roundedRect(cx - s * 0.43, cy - s * 0.43, cx + s * 0.43, cy + s * 0.43, s * 0.12, 'all')];
    case 'star': {
      const R = s / 1.86;
      const yc = cy - R * 0.0955; // centre the bounding box (top R, bottom −0.809R)
      const pts: Vec[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? R : R * 0.42;
        const a = ((90 + i * 36) * Math.PI) / 180;
        pts.push(v(cx + r * Math.cos(a), yc + r * Math.sin(a)));
      }
      return [pts];
    }
    case 'heart': {
      const k = (s * 0.95) / 32;
      const pts: Vec[] = [];
      for (let i = 0; i < 48; i++) {
        const t = (2 * Math.PI * i) / 48;
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push(v(cx + x * k, cy + (y + 2.5) * k));
      }
      return [pts];
    }
    case 'person': {
      const body = roundedRect(cx - s * 0.3, cy - s * 0.48, cx + s * 0.3, cy + s * 0.1, s * 0.22, 'top');
      return [body, circle(cx, cy + s * 0.31, s * 0.165, 20)];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------------------------

export interface LegendItem {
  text: string;
  color: PColor;
  /** 'box' = filled square (bars, slices), 'line' = short line with a dot (line charts). */
  swatch: 'box' | 'line';
}

const SW_BOX = 12;
const SW_LINE = 20;
const LEG_ROW = 19;
const LEG_COL_GAP = 16;

/**
 * Legend rows under a chart: one centred row if it fits into maxW, otherwise a grid of
 * left-aligned columns (row by row, in the given order), centred on cx. `top` is the y of its
 * upper edge (y up). Returns the prims and the height used.
 */
export function legend(items: LegendItem[], cx: number, top: number, maxW: number): { prims: Prim[]; height: number } {
  const prims: Prim[] = [];
  if (!items.length) return { prims, height: 0 };
  const swW = (it: LegendItem) => (it.swatch === 'line' ? SW_LINE : SW_BOX);
  const widths = items.map((it) => swW(it) + 5 + textWidth(it.text, FS.legend));
  const total = widths.reduce((a, b) => a + b, 0) + LEG_COL_GAP * (items.length - 1);
  let cols: number;
  let colW: number[];
  if (total <= maxW) {
    cols = items.length;
    colW = widths;
  } else {
    // as many columns as fit; each column as wide as its widest item
    const colWidths = (k: number) => Array.from({ length: k }, (_, c) => Math.max(...widths.filter((_, i) => i % k === c)));
    cols = items.length - 1;
    colW = colWidths(cols);
    while (cols > 1 && colW.reduce((a, b) => a + b, 0) + LEG_COL_GAP * (cols - 1) > maxW) colW = colWidths(--cols);
  }
  const gridW = colW.reduce((a, b) => a + b, 0) + LEG_COL_GAP * (cols - 1);
  const x0 = cx - gridW / 2;
  const rows = Math.ceil(items.length / cols);
  items.forEach((it, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = x0 + colW.slice(0, c).reduce((a, b) => a + b, 0) + LEG_COL_GAP * c;
    const y = top - LEG_ROW / 2 - r * LEG_ROW;
    if (it.swatch === 'box') {
      prims.push({ t: 'poly', pts: roundedRect(x, y - SW_BOX / 2, x + SW_BOX, y + SW_BOX / 2, 2.5, 'all'), closed: true, color: 'none', fill: it.color, fillOpacity: 1, obstacle: false });
    } else {
      prims.push({ t: 'seg', a: v(x, y), b: v(x + SW_LINE, y), color: it.color, w: 2.4, obstacle: false });
      prims.push({ t: 'circle', c: v(x + SW_LINE / 2, y), r: 3.6, color: 'paper', w: 1.5, fill: it.color, fillOpacity: 1, obstacle: false });
    }
    prims.push({ t: 'text', at: v(x + swW(it) + 5, y), text: it.text, size: FS.legend, anchor: 'start', font: 'ui' });
  });
  return { prims, height: rows * LEG_ROW };
}
