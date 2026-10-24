/**
 * Layout of the general 'geometry' figure: named points + drawing items → world primitives.
 * Also used by the ready-made shapes (triangle, quadrilateral, …) and constructions.
 */
import type { FigColor, GeoItem, GeometryFigure, LineWidth, PointRef, XY } from './types';
import {
  add,
  centroid,
  dist,
  dot,
  foot,
  len,
  mid,
  mul,
  norm,
  perp,
  type Prim,
  signedArea,
  sub,
  v,
  type Vec,
} from './scene';

export const WIDTH: Record<LineWidth, number> = { thin: 1.2, normal: 2, thick: 3.2 };

export interface GeoContext {
  points: Record<string, XY>;
  /** Names already labelled (to avoid duplicate vertex labels). */
  labelled: Set<string>;
  /** Center of the whole figure, used to put labels on the outer side. */
  center: Vec;
  /** World bounds for rays and full lines. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  step?: number;
}

export function resolve(ctx: GeoContext, ref: PointRef): Vec {
  if (Array.isArray(ref)) return v(ref[0], ref[1]);
  const p = ctx.points[ref];
  if (!p) throw new Error(`Geometry: unknown point "${ref}"`);
  return v(p[0], p[1]);
}

const nameOf = (ref: PointRef): string | null => (typeof ref === 'string' ? ref : null);

/** All world points an item touches (for bounds). */
function itemPoints(ctx: GeoContext, it: GeoItem): Vec[] {
  const r = (p: PointRef) => resolve(ctx, p);
  switch (it.kind) {
    case 'point':
    case 'label':
      return [r(it.at)];
    case 'segment':
    case 'parallel':
      return [r(it.from), r(it.to)];
    case 'ray':
      return [r(it.from), r(it.through)];
    case 'line':
      return [r(it.through[0]), r(it.through[1])];
    case 'polygon':
    case 'region':
      return it.points.map(r);
    case 'circle': {
      const c = r(it.center);
      const rad = typeof it.radius === 'number' ? it.radius : dist(c, r(it.radius));
      return [add(c, v(-rad, -rad)), add(c, v(rad, rad))];
    }
    case 'arc':
    case 'sector': {
      const c = r(it.center);
      return [add(c, v(-it.radius, -it.radius)), add(c, v(it.radius, it.radius))];
    }
    case 'angle':
      return [r(it.vertex)];
    case 'height': {
      const p = r(it.from);
      const a = r(it.base[0]);
      const b = r(it.base[1]);
      return [p, a, b, foot(p, a, b)];
    }
    case 'squareOnSide': {
      const a = r(it.from);
      const b = r(it.to);
      const n = squareNormal(a, b, it.side);
      return [a, b, add(a, n), add(b, n)];
    }
  }
}

function squareNormal(a: Vec, b: Vec, side: 'left' | 'right' = 'right'): Vec {
  const d = sub(b, a);
  const left = perp(d); // rotate +90°
  return side === 'left' ? left : mul(left, -1);
}

export function makeContext(points: Record<string, XY>, items: GeoItem[], extraPts: Vec[] = []): GeoContext {
  const ctx: GeoContext = {
    points,
    labelled: new Set(),
    center: v(0, 0),
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  };
  const pts: Vec[] = [...Object.values(points).map(([x, y]) => v(x, y)), ...extraPts];
  for (const it of items) if (it.kind !== 'ray' && it.kind !== 'line') pts.push(...itemPoints(ctx, it));
  for (const it of items) if (it.kind === 'ray' || it.kind === 'line') pts.push(...itemPoints(ctx, it));
  if (pts.length === 0) pts.push(v(0, 0));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const m = Math.max(maxX - minX, maxY - minY, 1) * 0.12;
  ctx.bounds = { minX: minX - m, maxX: maxX + m, minY: minY - m, maxY: maxY + m };
  ctx.center = v((minX + maxX) / 2, (minY + maxY) / 2);
  return ctx;
}

/** Clips the infinite line p + t·d (t ≥ tMin) to the bounds box; returns the visible part. */
function clipLine(p: Vec, d: Vec, b: GeoContext['bounds'], tMin = -Infinity): [Vec, Vec] | null {
  let t0 = tMin;
  let t1 = Infinity;
  const checks: [number, number, number][] = [
    [d.x, p.x, b.minX],
    [-d.x, -p.x, -b.maxX],
    [d.y, p.y, b.minY],
    [-d.y, -p.y, -b.maxY],
  ];
  for (const [dd, pp, lim] of checks) {
    // constraint: pp + t·dd ≥ lim
    if (Math.abs(dd) < 1e-12) {
      if (pp < lim) return null;
    } else {
      const t = (lim - pp) / dd;
      if (dd > 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  if (t0 > t1) return null;
  return [add(p, mul(d, t0)), add(p, mul(d, t1))];
}

/** Direction that points away from `center` perpendicular to segment ab. */
function outwardNormal(a: Vec, b: Vec, center: Vec, side?: 'left' | 'right'): Vec {
  const n = norm(perp(sub(b, a))); // left normal
  if (side === 'left') return n;
  if (side === 'right') return mul(n, -1);
  const m = mid(a, b);
  return dot(n, sub(m, center)) >= 0 ? n : mul(n, -1);
}

const fillColor = (f: FigColor | boolean | undefined, dflt: FigColor = 'accent'): FigColor | undefined =>
  f === true ? dflt : f === false || f === undefined ? undefined : f;

/** Converts geometry items to primitives. `step` tags everything (constructions). */
export function geoItemsToPrims(ctx: GeoContext, items: GeoItem[], step?: number): Prim[] {
  const out: Prim[] = [];
  const later: Prim[] = []; // labels and markers on top
  const r = (p: PointRef) => resolve(ctx, p);

  const labelPoint = (ref: PointRef, text: string, dir: Vec | undefined, color?: FigColor) => {
    later.push({ t: 'label', at: r(ref), text, dir, color, step });
  };

  for (const it of items) {
    switch (it.kind) {
      case 'point': {
        const p = r(it.at);
        if (it.dot !== false) out.push({ t: 'dot', at: p, color: it.color, r: 3, step });
        const name = nameOf(it.at);
        const text = it.label === false ? null : it.label ?? name;
        if (text) {
          later.push({ t: 'label', at: p, text, dir: it.labelDir, color: it.color, step });
          if (name) ctx.labelled.add(name);
        }
        break;
      }
      case 'segment': {
        const a = r(it.from);
        const b = r(it.to);
        out.push({
          t: 'seg',
          a,
          b,
          color: it.color,
          w: WIDTH[it.width ?? 'normal'],
          dash: it.dashed ? 'dashed' : 'solid',
          arrowEnd: it.arrow === 'end' || it.arrow === 'both',
          arrowStart: it.arrow === 'both',
          step,
        });
        if (it.ticks) later.push({ t: 'ticks', a, b, count: it.ticks, color: it.color, step });
        if (it.label) later.push({ t: 'label', at: mid(a, b), text: it.label, dir: outwardNormal(a, b, ctx.center, it.labelSide), color: it.color, step });
        break;
      }
      case 'ray':
      case 'line': {
        const a = r(it.kind === 'ray' ? it.from : it.through[0]);
        const b = r(it.kind === 'ray' ? it.through : it.through[1]);
        const d = norm(sub(b, a));
        const seg = clipLine(a, d, ctx.bounds, it.kind === 'ray' ? 0 : -Infinity);
        if (!seg) break;
        out.push({ t: 'seg', a: seg[0], b: seg[1], color: it.color, dash: it.dashed ? 'dashed' : 'solid', step });
        if (it.label) later.push({ t: 'label', at: seg[1], text: it.label, dir: add(mul(d, -0.3), outwardNormal(seg[0], seg[1], ctx.center)), color: it.color, step });
        break;
      }
      case 'polygon': {
        const pts = it.points.map(r);
        const fill = fillColor(it.fill);
        out.push({
          t: 'poly',
          pts,
          closed: true,
          color: it.color,
          w: WIDTH[it.width ?? 'normal'],
          dash: it.dashed ? 'dashed' : 'solid',
          fill,
          step,
        });
        const ccw = signedArea(pts) >= 0;
        const n = pts.length;
        const c = centroid(pts);
        if (it.vertexLabels !== false) {
          it.points.forEach((ref, i) => {
            const name = nameOf(ref);
            if (!name || ctx.labelled.has(name)) return;
            const P = pts[i];
            const prev = pts[(i - 1 + n) % n];
            const next = pts[(i + 1) % n];
            let d = mul(add(norm(sub(prev, P)), norm(sub(next, P))), -1);
            if (len(d) < 1e-6) d = sub(P, c);
            ctx.labelled.add(name);
            out.push({ t: 'dot', at: P, r: 2.2, color: it.color, step });
            labelPoint(ref, name, norm(d), it.color);
          });
        }
        it.sideLabels?.forEach((text, i) => {
          if (!text) return;
          const a = pts[i];
          const b = pts[(i + 1) % n];
          const left = norm(perp(sub(b, a)));
          const outward = ccw ? mul(left, -1) : left;
          later.push({ t: 'label', at: mid(a, b), text, dir: outward, color: it.color, step });
        });
        it.ticks?.forEach((count, i) => {
          if (!count) return;
          later.push({ t: 'ticks', a: pts[i], b: pts[(i + 1) % n], count, color: it.color, step });
        });
        break;
      }
      case 'circle': {
        const c = r(it.center);
        const rad = typeof it.radius === 'number' ? it.radius : dist(c, r(it.radius));
        out.push({ t: 'circle', c, r: rad, color: it.color, dash: it.dashed ? 'dashed' : 'solid', fill: fillColor(it.fill), step });
        if (it.centerDot !== false) out.push({ t: 'dot', at: c, r: 2.5, color: it.color, step });
        break;
      }
      case 'arc': {
        const c = r(it.center);
        out.push({ t: 'arc', c, r: it.radius, from: it.from, to: it.to, color: it.color ?? 'muted', w: 1.6, dash: it.dashed ? 'dashed' : 'solid', step });
        if (it.label) {
          const a = ((it.from + (((it.to - it.from) % 360) + 360) % 360 / 2) * Math.PI) / 180;
          later.push({ t: 'label', at: add(c, v(Math.cos(a) * it.radius, Math.sin(a) * it.radius)), text: it.label, dir: v(Math.cos(a), Math.sin(a)), color: it.color, step });
        }
        break;
      }
      case 'sector': {
        const c = r(it.center);
        out.push({ t: 'arc', c, r: it.radius, from: it.from, to: it.to, sector: true, color: it.color, fill: it.fill ?? 'accent', step });
        if (it.label) {
          const span = ((it.to - it.from) % 360 + 360) % 360;
          const a = ((it.from + span / 2) * Math.PI) / 180;
          later.push({ t: 'label', at: add(c, v(Math.cos(a) * it.radius * 0.55, Math.sin(a) * it.radius * 0.55)), text: it.label, dir: v(Math.cos(a), Math.sin(a)), gap: 0, fixed: true, color: it.color, step });
        }
        break;
      }
      case 'angle': {
        const at = r(it.vertex);
        const p1 = r(it.from);
        const p2 = r(it.to);
        if (it.right) {
          later.push({ t: 'rightAngle', at, p1, p2, color: it.color, fill: it.fill, step });
          if (it.label) {
            const d = norm(add(norm(sub(p1, at)), norm(sub(p2, at))));
            later.push({ t: 'label', at, text: it.label, dir: d, gap: 18, color: it.color, step });
          }
        } else {
          later.push({ t: 'angleArc', at, p1, p2, count: it.arcs, label: it.label, fill: it.fill, color: it.color, reflex: it.reflex, step });
        }
        break;
      }
      case 'parallel':
        later.push({ t: 'parallelMark', a: r(it.from), b: r(it.to), count: it.count ?? 1, step });
        break;
      case 'height': {
        const P = r(it.from);
        const A = r(it.base[0]);
        const B = r(it.base[1]);
        const F = foot(P, A, B);
        const ab = sub(B, A);
        const t = dot(sub(F, A), ab) / dot(ab, ab);
        if (t < -1e-9) out.push({ t: 'seg', a: A, b: F, dash: 'dashed', color: 'muted', w: 1.4, step });
        if (t > 1 + 1e-9) out.push({ t: 'seg', a: B, b: F, dash: 'dashed', color: 'muted', w: 1.4, step });
        out.push({ t: 'seg', a: P, b: F, dash: 'dashed', color: it.color, step });
        const other = dist(F, A) > dist(F, B) ? A : B;
        if (dist(P, F) > 1e-9) later.push({ t: 'rightAngle', at: F, p1: P, p2: other, color: it.color, step });
        if (it.label) {
          const side = norm(perp(sub(F, P)));
          const toward = dot(side, sub(other, F)) > 0 ? mul(side, -1) : side;
          later.push({ t: 'label', at: mid(P, F), text: it.label, dir: toward, color: it.color, step });
        }
        if (it.footLabel) later.push({ t: 'label', at: F, text: it.footLabel, dir: norm(sub(F, P)), color: it.color, step });
        break;
      }
      case 'squareOnSide': {
        const A = r(it.from);
        const B = r(it.to);
        const n = squareNormal(A, B, it.side);
        const C = add(B, n);
        const D = add(A, n);
        out.push({ t: 'poly', pts: [A, B, C, D], closed: true, fill: it.fill ?? 'accent', w: 1.6, step });
        if (it.grid) {
          const k = Math.round(dist(A, B));
          for (let i = 1; i < k; i++) {
            const f = i / k;
            out.push({ t: 'seg', a: add(A, mul(sub(B, A), f)), b: add(D, mul(sub(B, A), f)), color: 'muted', w: 0.8, obstacle: false, step });
            out.push({ t: 'seg', a: add(A, mul(n, f)), b: add(B, mul(n, f)), color: 'muted', w: 0.8, obstacle: false, step });
          }
        }
        if (it.label) later.push({ t: 'label', at: centroid([A, B, C, D]), text: it.label, dir: v(0, 0), gap: 0, fixed: true, bold: true, step });
        break;
      }
      case 'label': {
        const size = it.size === 'small' ? 13 : it.size === 'large' ? 19 : undefined;
        later.push({ t: 'label', at: r(it.at), text: it.text, dir: it.dir, color: it.color, size, step });
        break;
      }
      case 'region':
        out.push({ t: 'poly', pts: it.points.map(r), closed: true, color: 'none', fill: it.fill, fillOpacity: it.hatch ? 0.32 : 0.22, obstacle: false, step });
        break;
    }
  }
  return [...out, ...later];
}

/** Light background grid. */
export function gridPrims(ctx: GeoContext, stepSize: number): Prim[] {
  const out: Prim[] = [];
  const b = ctx.bounds;
  const x0 = Math.floor(b.minX / stepSize) * stepSize;
  const x1 = Math.ceil(b.maxX / stepSize) * stepSize;
  const y0 = Math.floor(b.minY / stepSize) * stepSize;
  const y1 = Math.ceil(b.maxY / stepSize) * stepSize;
  if ((x1 - x0) / stepSize > 60 || (y1 - y0) / stepSize > 60) return out;
  for (let x = x0; x <= x1 + 1e-9; x += stepSize) out.push({ t: 'seg', a: v(x, y0), b: v(x, y1), color: 'grid', w: 1, obstacle: false });
  for (let y = y0; y <= y1 + 1e-9; y += stepSize) out.push({ t: 'seg', a: v(x0, y), b: v(x1, y), color: 'grid', w: 1, obstacle: false });
  return out;
}

export function layoutGeometry(fig: GeometryFigure): Prim[] {
  const ctx = makeContext(fig.points ?? {}, fig.items);
  const grid = fig.grid ? gridPrims(ctx, fig.grid === true ? 1 : fig.grid) : [];
  return [...grid, ...geoItemsToPrims(ctx, fig.items)];
}
