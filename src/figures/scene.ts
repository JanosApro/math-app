/**
 * Figure core: world-space primitives → fitted screen-space scene.
 *
 * Figure layouts (geometry.ts, solids.ts, charts.ts, …) produce `Prim`s in WORLD coordinates
 * (y up, any units). `fitScene` scales them uniformly into a viewBox, converts decorations
 * (right-angle markers, angle arcs, tick marks, arrowheads) to fixed screen sizes and places
 * the labels so they avoid each other and the lines. The result is a `Scene` that can be
 * rendered by React (FigureView.tsx) or serialised to an SVG string (validation, tests).
 *
 * Engine file — content authors never need to touch this.
 */
import type { Dir, FigColor } from './types';

export interface Vec {
  x: number;
  y: number;
}

export const v = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;
export const cross = (a: Vec, b: Vec): number => a.x * b.y - a.y * b.x;
export const len = (a: Vec): number => Math.hypot(a.x, a.y);
export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Vec, b: Vec): Vec => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const norm = (a: Vec): Vec => {
  const l = len(a);
  return l < 1e-12 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
};
/** Rotate 90° counterclockwise (in a y-up system). */
export const perp = (a: Vec): Vec => ({ x: -a.y, y: a.x });
export const rot = (a: Vec, deg: number): Vec => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
};
export const polar = (c: Vec, r: number, deg: number): Vec => ({
  x: c.x + r * Math.cos((deg * Math.PI) / 180),
  y: c.y + r * Math.sin((deg * Math.PI) / 180),
});
export const centroid = (pts: Vec[]): Vec => mul(pts.reduce(add, v(0, 0)), 1 / Math.max(1, pts.length));
/** Signed area (positive = counterclockwise in a y-up system). */
export const signedArea = (pts: Vec[]): number => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) s += cross(pts[i], pts[(i + 1) % pts.length]);
  return s / 2;
};
/** Foot of the perpendicular from p to the line ab. */
export const foot = (p: Vec, a: Vec, b: Vec): Vec => {
  const d = sub(b, a);
  const t = dot(sub(p, a), d) / dot(d, d);
  return add(a, mul(d, t));
};
/** Unit vector for a label direction keyword or angle (y up). */
export function dirVec(d: Dir): Vec {
  const angles: Record<string, number> = { e: 0, ne: 45, n: 90, nw: 135, w: 180, sw: 225, s: 270, se: 315 };
  const deg = typeof d === 'number' ? d : angles[d];
  return polar(v(0, 0), 1, deg);
}

// ---------------------------------------------------------------------------------------------
// World primitives
// ---------------------------------------------------------------------------------------------

/** Colors usable in primitives: the public FigColor plus a few internal ones. */
export type PColor = FigColor | 'grid' | 'axis' | 'paper' | 'fill' | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';
export type Dash = 'solid' | 'dashed' | 'dotted';

interface Common {
  /** Construction step this primitive belongs to (0 = given). Used by the construction player. */
  step?: number;
}

interface Stroke {
  color?: PColor | 'none';
  /** Stroke width in screen units (default 2). */
  w?: number;
  dash?: Dash;
}

interface Fill {
  fill?: PColor;
  /** Default 0.18 for colors, 1 for 'paper'. */
  fillOpacity?: number;
}

export type Prim = Common &
  (
    | ({ t: 'seg'; a: Vec; b: Vec; arrowEnd?: boolean; arrowStart?: boolean; obstacle?: boolean } & Stroke)
    | ({ t: 'poly'; pts: Vec[]; closed: boolean; obstacle?: boolean } & Stroke & Fill)
    | ({ t: 'circle'; c: Vec; r: number; obstacle?: boolean } & Stroke & Fill)
    /** Ellipse (or elliptic arc from/to, degrees of the parameter angle, counterclockwise). */
    | ({ t: 'ellipse'; c: Vec; rx: number; ry: number; from?: number; to?: number; obstacle?: boolean } & Stroke & Fill)
    /** Circular arc, degrees counterclockwise; `sector` closes it through the center. */
    | ({ t: 'arc'; c: Vec; r: number; from: number; to: number; sector?: boolean; obstacle?: boolean } & Stroke & Fill)
    | { t: 'dot'; at: Vec; r?: number; color?: PColor; hollow?: boolean }
    | {
        t: 'label';
        at: Vec;
        text: string;
        /** Preferred direction (default: away from the figure's center). */
        dir?: Dir | Vec;
        /** Gap between anchor and label box in screen units (default 5). */
        gap?: number;
        size?: number;
        color?: PColor;
        bold?: boolean;
        /** 'math' (serif, italic single letters — default) or 'ui' (sans). */
        font?: 'math' | 'ui';
        /** Do not move it to avoid collisions. */
        fixed?: boolean;
        /** Stacked fraction label. */
        frac?: { num: string; den: string };
      }
    /** Right-angle square at `at`; p1/p2 are points along the two legs. */
    | { t: 'rightAngle'; at: Vec; p1: Vec; p2: Vec; size?: number; color?: PColor; fill?: boolean }
    /** Angle arc at `at` between rays to p1 and p2 (the smaller angle unless reflex). */
    | {
        t: 'angleArc';
        at: Vec;
        p1: Vec;
        p2: Vec;
        count?: number;
        r?: number;
        color?: PColor;
        fill?: boolean;
        label?: string;
        reflex?: boolean;
      }
    /** Equal-length tick marks across the middle of segment ab. */
    | { t: 'ticks'; a: Vec; b: Vec; count: number; color?: PColor }
    /** Parallel marks (chevrons) at the middle of segment ab, pointing from a to b. */
    | { t: 'parallelMark'; a: Vec; b: Vec; count: number; color?: PColor }
    /** Text at an exact position (charts, tables). Not moved. `anchor` is horizontal alignment. */
    | {
        t: 'text';
        at: Vec;
        text: string;
        size?: number;
        anchor?: 'start' | 'middle' | 'end';
        color?: PColor;
        bold?: boolean;
        font?: 'math' | 'ui';
        /** Rotation in degrees (counterclockwise), e.g. 90 for a y-axis title. */
        rotate?: number;
      }
  );

// ---------------------------------------------------------------------------------------------
// Screen scene
// ---------------------------------------------------------------------------------------------

export interface TextRun {
  text: string;
  italic?: boolean;
}

export type SvgItem = { step?: number } & (
  | {
      k: 'path';
      d: string;
      /** All coordinates used in d (for validation). */
      nums: number[];
      stroke?: string;
      sw?: number;
      dash?: string;
      fill?: string;
      fillOpacity?: number;
      linecap?: 'round' | 'butt';
    }
  | { k: 'circle'; cx: number; cy: number; r: number; stroke?: string; sw?: number; fill?: string; fillOpacity?: number; dash?: string }
  | {
      k: 'text';
      x: number;
      y: number;
      runs: TextRun[];
      size: number;
      fill: string;
      anchor: 'start' | 'middle' | 'end';
      bold?: boolean;
      font: 'math' | 'ui';
      halo: boolean;
      rotate?: number;
      /** Estimated bounding box (for validation). */
      box: Box;
    }
);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scene {
  viewBox: Box;
  items: SvgItem[];
  notToScale?: boolean;
  caption?: string;
  /** Warnings collected during layout (e.g. labels that could not avoid overlapping). */
  warnings: string[];
}

export const COLOR: Record<PColor, string> = {
  ink: 'var(--fig-ink)',
  accent: 'var(--fig-accent)',
  highlight: 'var(--fig-hi)',
  muted: 'var(--fig-muted)',
  good: 'var(--fig-good)',
  bad: 'var(--fig-bad)',
  blue: 'var(--fig-blue)',
  green: 'var(--fig-green)',
  orange: 'var(--fig-orange)',
  purple: 'var(--fig-purple)',
  red: 'var(--fig-red)',
  teal: 'var(--fig-teal)',
  grid: 'var(--fig-grid)',
  axis: 'var(--fig-axis)',
  paper: 'var(--fig-paper)',
  fill: 'var(--fig-fill)',
  s1: 'var(--fig-s1)',
  s2: 'var(--fig-s2)',
  s3: 'var(--fig-s3)',
  s4: 'var(--fig-s4)',
  s5: 'var(--fig-s5)',
  s6: 'var(--fig-s6)',
  s7: 'var(--fig-s7)',
  s8: 'var(--fig-s8)',
};

export const DASH: Record<Dash, string | undefined> = { solid: undefined, dashed: '6 4', dotted: '1.5 4' };

/** Default sizes in screen units. The SVG scales with the card width; ~1 unit ≈ 1 CSS px on phones. */
export const SIZES = {
  small: { w: 220, h: 170 },
  medium: { w: 300, h: 230 },
  large: { w: 340, h: 300 },
} as const;

export const FONT_SIZE = 16;

// ---------------------------------------------------------------------------------------------
// Text measurement (estimate; good enough for layout)
// ---------------------------------------------------------------------------------------------

const NARROW = new Set([...'ijlt.,:;!|\'’ ()[]1fr']);
const WIDE = new Set([...'mwMWŐŰ%@']);

export function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) {
    if (ch === ' ' || ch === ' ') w += 0.27;
    else if (NARROW.has(ch)) w += 0.32;
    else if (WIDE.has(ch)) w += 0.85;
    else if (/[A-ZÁÉÍÓÖÚÜ]/.test(ch)) w += 0.68;
    else if (/[²³₀-₉ₐ-ₜ]/.test(ch)) w += 0.36;
    else if (ch === '√') w += 0.7;
    else w += 0.53;
  }
  return w * size;
}

/** Splits a label into runs, making single Latin letters (variables like a, r, m, x) italic. */
export function labelRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const re = /(^|[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű])([a-zA-Z])(?=$|[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length;
    const letter = m[2];
    // Upper-case point names (A, B, O, T) stay upright; lower-case variables are italic.
    if (letter === letter.toUpperCase()) continue;
    // A letter after "number + space" is a unit (5 m, 3 g, 2 l) → upright.
    if (/\d[\s\u202f]+$/.test(text.slice(0, start))) continue;
    // "a henger magassága": an 'a' followed by a word is the Hungarian article → upright.
    if (letter === 'a' && /^[\s\u202f]+[a-záéíóöőúüű]{2}/.test(text.slice(start + 1))) continue;
    if (start > last) runs.push({ text: text.slice(last, start) });
    runs.push({ text: letter, italic: true });
    last = start + 1;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  // merge neighbours with same style
  const merged: TextRun[] = [];
  for (const r of runs) {
    const prev = merged[merged.length - 1];
    if (prev && !!prev.italic === !!r.italic) prev.text += r.text;
    else merged.push({ ...r });
  }
  return merged;
}

// ---------------------------------------------------------------------------------------------
// Geometry helpers for collision tests
// ---------------------------------------------------------------------------------------------

function boxOverlap(a: Box, b: Box, margin = 0): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + margin;
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + margin;
  return w > 0 && h > 0 ? w * h : 0;
}

/** Does segment pq cross box b? (Liang–Barsky) */
function segHitsBox(p: Vec, q: Vec, b: Box): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const checks: [number, number][] = [
    [-dx, p.x - b.x],
    [dx, b.x + b.w - p.x],
    [-dy, p.y - b.y],
    [dy, b.y + b.h - p.y],
  ];
  for (const [pp, qq] of checks) {
    if (Math.abs(pp) < 1e-12) {
      if (qq < 0) return false;
    } else {
      const r = qq / pp;
      if (pp < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }
  return t0 <= t1;
}

function sampleArc(c: Vec, rx: number, ry: number, from: number, to: number, n = 48): Vec[] {
  let span = to - from;
  if (span < 0) span += 360;
  const steps = Math.max(4, Math.ceil((n * span) / 360));
  const pts: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + (span * i) / steps) * Math.PI) / 180;
    pts.push(v(c.x + rx * Math.cos(a), c.y + ry * Math.sin(a)));
  }
  return pts;
}

// ---------------------------------------------------------------------------------------------
// Fitting
// ---------------------------------------------------------------------------------------------

export interface FitOptions {
  size?: 'small' | 'medium' | 'large';
  /** Fixed scale (screen units per world unit). Charts use 1. */
  scale?: number;
  /** Padding around everything in screen units (default 8). */
  pad?: number;
  notToScale?: boolean;
  caption?: string;
  /** Extra world points that must be inside the drawing area (e.g. the full axis range). */
  include?: Vec[];
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

/** Converts world primitives into a fitted screen scene. */
export function fitScene(prims: Prim[], opts: FitOptions = {}): Scene {
  const warnings: string[] = [];
  const size = SIZES[opts.size ?? 'medium'];
  const pad = opts.pad ?? 8;

  // 1. World bounding box of the geometry (labels excluded).
  const pts: Vec[] = [...(opts.include ?? [])];
  for (const p of prims) {
    switch (p.t) {
      case 'seg':
        pts.push(p.a, p.b);
        break;
      case 'poly':
        pts.push(...p.pts);
        break;
      case 'circle':
        pts.push(v(p.c.x - p.r, p.c.y - p.r), v(p.c.x + p.r, p.c.y + p.r));
        break;
      case 'ellipse':
        if (p.from === undefined) pts.push(v(p.c.x - p.rx, p.c.y - p.ry), v(p.c.x + p.rx, p.c.y + p.ry));
        else pts.push(...sampleArc(p.c, p.rx, p.ry, p.from, p.to ?? p.from + 360));
        break;
      case 'arc':
        pts.push(...sampleArc(p.c, p.r, p.r, p.from, p.to));
        if (p.sector) pts.push(p.c);
        break;
      case 'dot':
      case 'label':
      case 'text':
        pts.push(p.at);
        break;
      case 'rightAngle':
      case 'angleArc':
        pts.push(p.at);
        break;
      case 'ticks':
      case 'parallelMark':
        pts.push(p.a, p.b);
        break;
    }
  }
  for (const p of pts) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      return {
        viewBox: { x: 0, y: 0, w: 100, h: 40 },
        items: [],
        warnings: [],
        caption: 'HIBA: nem véges koordináta (NaN/Infinity) az ábrában',
        notToScale: opts.notToScale,
      };
    }
  }
  if (pts.length === 0) pts.push(v(0, 0));
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const bw = maxX - minX;
  const bh = maxY - minY;
  let s: number;
  if (opts.scale !== undefined) s = opts.scale;
  else if (bw < 1e-9 && bh < 1e-9) s = 1;
  else if (bw < 1e-9) s = size.h / bh;
  else if (bh < 1e-9) s = size.w / bw;
  else s = Math.min(size.w / bw, size.h / bh);

  const T = (p: Vec): Vec => v((p.x - minX) * s, (maxY - p.y) * s);
  const items: SvgItem[] = [];
  /** Screen-space line segments that labels should avoid. */
  const obstacles: [Vec, Vec][] = [];
  const dotBoxes: Box[] = [];

  const strokeAttrs = (p: Stroke) => ({
    stroke: p.color === 'none' ? undefined : COLOR[(p.color ?? 'ink') as PColor],
    sw: p.w ?? 2,
    dash: DASH[p.dash ?? 'solid'],
  });
  const fillAttrs = (p: Fill) =>
    p.fill ? { fill: COLOR[p.fill], fillOpacity: p.fillOpacity ?? (p.fill === 'paper' ? 1 : 0.18) } : { fill: 'none' };

  const pathFrom = (screenPts: Vec[], closed: boolean) => {
    const d = screenPts.map((q, i) => `${i ? 'L' : 'M'}${fmt(q.x)} ${fmt(q.y)}`).join('') + (closed ? 'Z' : '');
    return { d, nums: screenPts.flatMap((q) => [q.x, q.y]) };
  };

  const arrowHead = (tip: Vec, from: Vec, color: string, sw: number, step?: number) => {
    const d = norm(sub(tip, from));
    const n = perp(d);
    const L = 7 + sw;
    const W = 3.5 + sw / 2;
    const base = sub(tip, mul(d, L));
    const ptsA = [tip, add(base, mul(n, W)), add(base, mul(n, -W))];
    items.push({ k: 'path', ...pathFrom(ptsA, true), fill: color, fillOpacity: 1, stroke: color, sw: 1, step });
  };

  const labels: Extract<Prim, { t: 'label' }>[] = [];
  const angleLabels: { at: Vec; dir: Vec; text: string; color?: PColor; step?: number; r: number }[] = [];

  for (const p of prims) {
    const step = p.step;
    switch (p.t) {
      case 'seg': {
        const a = T(p.a);
        const b = T(p.b);
        const st = strokeAttrs(p);
        items.push({ k: 'path', ...pathFrom([a, b], false), ...st, linecap: 'round', step });
        if (p.obstacle !== false) obstacles.push([a, b]);
        if (p.arrowEnd && st.stroke) arrowHead(b, a, st.stroke, st.sw, step);
        if (p.arrowStart && st.stroke) arrowHead(a, b, st.stroke, st.sw, step);
        break;
      }
      case 'poly': {
        const sp = p.pts.map(T);
        items.push({ k: 'path', ...pathFrom(sp, p.closed), ...strokeAttrs(p), ...fillAttrs(p), step });
        if (p.obstacle !== false && p.color !== 'none')
          for (let i = 0; i < sp.length - (p.closed ? 0 : 1); i++) obstacles.push([sp[i], sp[(i + 1) % sp.length]]);
        break;
      }
      case 'circle': {
        const c = T(p.c);
        items.push({ k: 'circle', cx: c.x, cy: c.y, r: p.r * s, ...strokeAttrs(p), ...fillAttrs(p), step });
        if (p.obstacle !== false && p.color !== 'none') {
          const sp = sampleArc(p.c, p.r, p.r, 0, 360, 36).map(T);
          for (let i = 0; i < sp.length - 1; i++) obstacles.push([sp[i], sp[i + 1]]);
        }
        break;
      }
      case 'ellipse':
      case 'arc': {
        const rx = p.t === 'arc' ? p.r : p.rx;
        const ry = p.t === 'arc' ? p.r : p.ry;
        const from = p.from ?? 0;
        const to = p.to ?? from + 360;
        const sp = sampleArc(p.c, rx, ry, from, to, 96).map(T);
        const sector = p.t === 'arc' && p.sector;
        const all = sector ? [T(p.c), ...sp] : sp;
        const full = p.t === 'ellipse' && p.from === undefined;
        items.push({ k: 'path', ...pathFrom(all, sector || full), ...strokeAttrs(p), ...fillAttrs(p), step });
        if (p.obstacle !== false && p.color !== 'none') for (let i = 0; i < sp.length - 1; i += 2) obstacles.push([sp[i], sp[Math.min(i + 2, sp.length - 1)]]);
        break;
      }
      case 'dot': {
        const c = T(p.at);
        const r = p.r ?? 3.5;
        const col = COLOR[p.color ?? 'ink'];
        items.push({ k: 'circle', cx: c.x, cy: c.y, r, fill: p.hollow ? COLOR.paper : col, fillOpacity: 1, stroke: col, sw: p.hollow ? 2 : 0, step });
        dotBoxes.push({ x: c.x - r, y: c.y - r, w: 2 * r, h: 2 * r });
        break;
      }
      case 'rightAngle': {
        const at = T(p.at);
        const d1 = norm(sub(T(p.p1), at));
        const d2 = norm(sub(T(p.p2), at));
        const k = p.size ?? 11;
        const q1 = add(at, mul(d1, k));
        const q3 = add(at, mul(d2, k));
        const q2 = add(q1, mul(d2, k));
        const col = COLOR[p.color ?? 'ink'];
        if (p.fill) items.push({ k: 'path', ...pathFrom([at, q1, q2, q3], true), fill: col, fillOpacity: 0.15, step });
        items.push({ k: 'path', ...pathFrom([q1, q2, q3], false), stroke: col, sw: 1.5, fill: 'none', step });
        const dotC = add(at, mul(add(d1, d2), k * 0.5));
        items.push({ k: 'circle', cx: dotC.x, cy: dotC.y, r: 1.4, fill: col, fillOpacity: 1, step });
        break;
      }
      case 'angleArc': {
        const at = T(p.at);
        const d1 = norm(sub(T(p.p1), at));
        const d2 = norm(sub(T(p.p2), at));
        // angles in screen space (y down) → use math angle with flipped y
        let a1 = Math.atan2(-d1.y, d1.x);
        let a2 = Math.atan2(-d2.y, d2.x);
        let span = a2 - a1;
        while (span < 0) span += 2 * Math.PI;
        // choose the smaller angle (or the reflex one if asked)
        if ((span > Math.PI) !== !!p.reflex) {
          [a1, a2] = [a2, a1];
          span = 2 * Math.PI - span;
        }
        const r0 = p.r ?? Math.max(14, Math.min(26, 30 - span * 4));
        const col = COLOR[p.color ?? 'ink'];
        const count = p.count ?? 1;
        for (let i = 0; i < count; i++) {
          const r = r0 + i * 4;
          const arcPts: Vec[] = [];
          const n = Math.max(6, Math.ceil(span * 16));
          for (let j = 0; j <= n; j++) {
            const a = a1 + (span * j) / n;
            arcPts.push(v(at.x + r * Math.cos(a), at.y - r * Math.sin(a)));
          }
          if (p.fill && i === 0) items.push({ k: 'path', ...pathFrom([at, ...arcPts], true), fill: col, fillOpacity: 0.18, step });
          items.push({ k: 'path', ...pathFrom(arcPts, false), stroke: col, sw: 1.5, fill: 'none', step });
        }
        if (p.label) {
          const amid = a1 + span / 2;
          angleLabels.push({
            at,
            dir: v(Math.cos(amid), -Math.sin(amid)),
            text: p.label,
            color: p.color,
            step,
            r: r0 + (count - 1) * 4,
          });
        }
        break;
      }
      case 'ticks': {
        const a = T(p.a);
        const b = T(p.b);
        const d = norm(sub(b, a));
        const n = perp(d);
        const m = mid(a, b);
        const col = COLOR[p.color ?? 'ink'];
        for (let i = 0; i < p.count; i++) {
          const c = add(m, mul(d, (i - (p.count - 1) / 2) * 4.5));
          items.push({ k: 'path', ...pathFrom([add(c, mul(n, 6)), sub(c, mul(n, 6))], false), stroke: col, sw: 1.6, step });
        }
        break;
      }
      case 'parallelMark': {
        const a = T(p.a);
        const b = T(p.b);
        const d = norm(sub(b, a));
        const n = perp(d);
        const m = mid(a, b);
        const col = COLOR[p.color ?? 'ink'];
        for (let i = 0; i < p.count; i++) {
          const tip = add(m, mul(d, (i - (p.count - 1) / 2) * 6 + 3));
          const back = sub(tip, mul(d, 6));
          items.push({ k: 'path', ...pathFrom([add(back, mul(n, 4.5)), tip, sub(back, mul(n, 4.5))], false), stroke: col, sw: 1.6, fill: 'none', step });
        }
        break;
      }
      case 'text': {
        const at = T(p.at);
        const size = p.size ?? FONT_SIZE - 2;
        const font = p.font ?? 'ui';
        const runs = font === 'math' ? labelRuns(p.text) : [{ text: p.text }];
        const w = textWidth(p.text, size);
        const anchor = p.anchor ?? 'middle';
        const x0 = anchor === 'start' ? at.x : anchor === 'end' ? at.x - w : at.x - w / 2;
        let box: Box = { x: x0, y: at.y - size * 0.6, w, h: size * 1.2 };
        if (p.rotate) {
          // only ±90 rotations are used (axis titles)
          box = { x: at.x - size * 0.6, y: at.y - w / 2, w: size * 1.2, h: w };
        }
        items.push({ k: 'text', x: at.x, y: at.y, runs, size, fill: COLOR[p.color ?? 'ink'], anchor, bold: p.bold, font, halo: false, rotate: p.rotate, box, step });
        break;
      }
      case 'label':
        labels.push(p);
        break;
    }
  }

  // 2. Label placement.
  const geomBox = (() => {
    const sp = pts.map(T);
    const xs = sp.map((q) => q.x);
    const ys = sp.map((q) => q.y);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  })();
  const center = v(geomBox.x + geomBox.w / 2, geomBox.y + geomBox.h / 2);
  const placed: Box[] = [];

  const place = (
    anchor: Vec,
    pref: Vec,
    text: string,
    size: number,
    gap: number,
    fixed: boolean,
    fracLabel?: { num: string; den: string },
  ): { box: Box; overlaps: boolean } => {
    const w = fracLabel ? Math.max(textWidth(fracLabel.num, size), textWidth(fracLabel.den, size)) + 4 : textWidth(text, size);
    const h = fracLabel ? size * 2.3 : size * 1.15;
    const boxAt = (d: Vec, g: number): Box => {
      const ext = Math.abs(d.x) * (w / 2) + Math.abs(d.y) * (h / 2);
      const c = add(anchor, mul(d, g + ext));
      return { x: c.x - w / 2, y: c.y - h / 2, w, h };
    };
    const cost = (b: Box): number => {
      let c = 0;
      for (const o of placed) c += boxOverlap(b, o, 2) * 10;
      for (const o of dotBoxes) c += boxOverlap(b, o, 1) * 4;
      const shrunk = { x: b.x + 1, y: b.y + 1, w: b.w - 2, h: b.h - 2 };
      for (const [p1, p2] of obstacles) if (segHitsBox(p1, p2, shrunk)) c += 120;
      return c;
    };
    if (fixed) {
      const b = boxAt(pref, gap);
      return { box: b, overlaps: cost(b) > 0 };
    }
    let best: Box | null = null;
    let bestCost = Infinity;
    const angles = [0, 25, -25, 50, -50, 80, -80, 115, -115, 150, -150, 180];
    for (const extra of [0, 6, 14]) {
      for (const ang of angles) {
        // rotate in screen space (y down): use math rotation on flipped vector
        const r = rot(v(pref.x, -pref.y), ang);
        const d = v(r.x, -r.y);
        const b = boxAt(d, gap + extra);
        const c = cost(b) + Math.abs(ang) * 0.4 + extra * 3;
        if (c < bestCost) {
          bestCost = c;
          best = b;
        }
      }
      if (bestCost < 60) break;
    }
    const b = best ?? boxAt(pref, gap);
    return { box: b, overlaps: bestCost >= 100 };
  };

  const pushLabel = (box: Box, text: string, size: number, color: string, bold: boolean | undefined, font: 'math' | 'ui', step: number | undefined, fracLabel?: { num: string; den: string }) => {
    placed.push(box);
    if (fracLabel) {
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      items.push({ k: 'text', x: cx, y: cy - size * 0.55, runs: labelRuns(fracLabel.num), size, fill: color, anchor: 'middle', bold, font, halo: true, box: { ...box, h: box.h / 2 }, step });
      items.push({ k: 'path', ...pathFrom([v(box.x + 1, cy), v(box.x + box.w - 1, cy)], false), stroke: color, sw: 1.3, step });
      items.push({ k: 'text', x: cx, y: cy + size * 0.6, runs: labelRuns(fracLabel.den), size, fill: color, anchor: 'middle', bold, font, halo: true, box: { ...box, y: cy, h: box.h / 2 }, step });
      return;
    }
    items.push({
      k: 'text',
      x: box.x + box.w / 2,
      y: box.y + box.h / 2,
      runs: font === 'math' ? labelRuns(text) : [{ text }],
      size,
      fill: color,
      anchor: 'middle',
      bold,
      font,
      halo: true,
      box,
      step,
    });
  };

  for (const a of angleLabels) {
    const size = FONT_SIZE - 1;
    const { box } = place(a.at, a.dir, a.text, size, a.r + 1, false);
    pushLabel(box, a.text, size, COLOR[a.color ?? 'ink'], false, 'math', a.step);
  }
  for (const l of labels) {
    const anchor = T(l.at);
    let pref: Vec;
    if (l.dir === undefined) {
      const away = sub(anchor, center);
      pref = len(away) < 1e-6 ? v(0.7, -0.7) : norm(away);
    } else if (typeof l.dir === 'object') {
      pref = norm(v(l.dir.x, -l.dir.y));
    } else {
      const d = dirVec(l.dir);
      pref = v(d.x, -d.y);
    }
    const size = l.size ?? FONT_SIZE;
    const { box, overlaps } = place(anchor, pref, l.text, size, l.gap ?? 5, !!l.fixed, l.frac);
    if (overlaps) warnings.push(`A(z) "${l.text}" címke nem tudta elkerülni az ütközést.`);
    pushLabel(box, l.text, size, COLOR[l.color ?? 'ink'], l.bold, l.font ?? 'math', l.step, l.frac);
  }

  // 3. viewBox around everything.
  const bounds: Box[] = [geomBox];
  for (const it of items) {
    if (it.k === 'text') bounds.push(it.box);
    else if (it.k === 'circle') bounds.push({ x: it.cx - it.r, y: it.cy - it.r, w: 2 * it.r, h: 2 * it.r });
    else {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i < it.nums.length; i += 2) {
        xs.push(it.nums[i]);
        ys.push(it.nums[i + 1]);
      }
      if (xs.length) bounds.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) });
    }
  }
  const x0 = Math.min(...bounds.map((b) => b.x)) - pad;
  const y0 = Math.min(...bounds.map((b) => b.y)) - pad;
  const x1 = Math.max(...bounds.map((b) => b.x + b.w)) + pad;
  const y1 = Math.max(...bounds.map((b) => b.y + b.h)) + pad;
  return {
    viewBox: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
    items,
    notToScale: opts.notToScale,
    caption: opts.caption,
    warnings,
  };
}

// ---------------------------------------------------------------------------------------------
// Validation and SVG string output (used by npm run check and the dev gallery)
// ---------------------------------------------------------------------------------------------

export function validateScene(scene: Scene): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings = [...scene.warnings];
  const vb = scene.viewBox;
  if (scene.caption?.startsWith('HIBA')) errors.push(scene.caption);
  for (const n of [vb.x, vb.y, vb.w, vb.h]) if (!Number.isFinite(n)) errors.push('viewBox contains NaN/Infinity');
  if (vb.w <= 0 || vb.h <= 0) errors.push('Empty viewBox');
  if (vb.w > 2000 || vb.h > 2000) warnings.push(`Very large viewBox ${Math.round(vb.w)}×${Math.round(vb.h)}`);
  const inside = (x: number, y: number) => x >= vb.x - 0.5 && x <= vb.x + vb.w + 0.5 && y >= vb.y - 0.5 && y <= vb.y + vb.h + 0.5;
  let outside = 0;
  const texts: Box[] = [];
  for (const it of scene.items) {
    if (it.k === 'path') {
      for (const n of it.nums) if (!Number.isFinite(n)) errors.push('Path with NaN/Infinity coordinate');
      for (let i = 0; i < it.nums.length; i += 2) if (!inside(it.nums[i], it.nums[i + 1])) outside++;
    } else if (it.k === 'circle') {
      if (![it.cx, it.cy, it.r].every(Number.isFinite)) errors.push('Circle with NaN/Infinity');
      else if (!inside(it.cx - it.r, it.cy - it.r) || !inside(it.cx + it.r, it.cy + it.r)) outside++;
    } else {
      if (![it.x, it.y].every(Number.isFinite)) errors.push(`Text "${it.runs.map((r) => r.text).join('')}" at NaN position`);
      const t = it.runs.map((r) => r.text).join('');
      if (/undefined|NaN|Infinity|\[object/.test(t)) errors.push(`Label contains "${t}"`);
      if (!inside(it.box.x, it.box.y) || !inside(it.box.x + it.box.w, it.box.y + it.box.h)) outside++;
      texts.push(it.box);
    }
  }
  if (outside) errors.push(`${outside} element(s) outside the viewBox`);
  let overlaps = 0;
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) if (boxOverlap(texts[i], texts[j], -1) > 4) overlaps++;
  if (overlaps) warnings.push(`${overlaps} overlapping label pair(s)`);
  return { errors: [...new Set(errors)], warnings };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Serialises a scene to a standalone SVG string (CSS variables stay as they are). */
export function sceneToSvg(scene: Scene): string {
  const vb = scene.viewBox;
  const parts: string[] = [];
  for (const it of scene.items) {
    if (it.k === 'path') {
      parts.push(
        `<path d="${it.d}" fill="${it.fill ?? 'none'}"${it.fillOpacity !== undefined ? ` fill-opacity="${it.fillOpacity}"` : ''}${it.stroke ? ` stroke="${it.stroke}" stroke-width="${it.sw ?? 2}"` : ''}${it.dash ? ` stroke-dasharray="${it.dash}"` : ''}/>`,
      );
    } else if (it.k === 'circle') {
      parts.push(
        `<circle cx="${fmt(it.cx)}" cy="${fmt(it.cy)}" r="${fmt(it.r)}" fill="${it.fill ?? 'none'}"${it.fillOpacity !== undefined ? ` fill-opacity="${it.fillOpacity}"` : ''}${it.stroke ? ` stroke="${it.stroke}" stroke-width="${it.sw ?? 2}"` : ''}${it.dash ? ` stroke-dasharray="${it.dash}"` : ''}/>`,
      );
    } else {
      const runs = it.runs.map((r) => (r.italic ? `<tspan font-style="italic">${esc(r.text)}</tspan>` : esc(r.text))).join('');
      // bold / rotate as in FigureView.tsx (added for the charts: table headers, vertical names)
      const extra = `${it.bold ? ' font-weight="700"' : ''}${it.rotate ? ` transform="rotate(${-it.rotate} ${fmt(it.x)} ${fmt(it.y)})"` : ''}`;
      parts.push(`<text x="${fmt(it.x)}" y="${fmt(it.y)}" font-size="${it.size}" text-anchor="${it.anchor}" dominant-baseline="central" fill="${it.fill}"${extra}>${runs}</text>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.w)} ${fmt(vb.h)}">${parts.join('')}</svg>`;
}

/** Clips a polygon to x ≤ maxX (Sutherland–Hodgman). Used for partial pictogram symbols. */
export function clipPolygonX(pts: Vec[], maxX: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const ain = a.x <= maxX;
    const bin = b.x <= maxX;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (maxX - a.x) / (b.x - a.x);
      out.push(v(maxX, a.y + (b.y - a.y) * t));
    }
  }
  return out;
}
