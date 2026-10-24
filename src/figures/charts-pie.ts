/**
 * Pie chart ('pieChart'): slices clockwise from 12 o'clock, percentages (or values / names) on
 * the slices, small slices labelled outside with a leader line, legend under the pie.
 * Laid out in screen-like units (fit scale 1, y up). Parameters: PieChartFigure in types.ts.
 *
 * Engine file — content authors never need to touch this.
 */
import type { PieChartFigure } from './types';
import type { LayoutResult } from './index';
import { textWidth, v, type PColor, type Prim, type Vec } from './scene';
import { num } from '../engine/format';
import { PALETTE, chartWidth, checkColor, checkNum, checkString, fail, legend } from './charts-common';

const RADIUS = { small: 62, medium: 80, large: 98 } as const;
const IN_SIZE = 13;
const OUT_SIZE = 12.5;

/** Point at clockwise angle `a` (degrees from 12 o'clock) and distance r from the centre. */
const at = (a: number, r: number): Vec => v(r * Math.sin((a * Math.PI) / 180), r * Math.cos((a * Math.PI) / 180));

/** Clockwise angle of p from 12 o'clock, in [0, 360). */
const cwAngle = (p: Vec): number => {
  const a = 90 - (Math.atan2(p.y, p.x) * 180) / Math.PI;
  return ((a % 360) + 360) % 360;
};

/** Distance from p to the segment from the centre to the rim at angle a. */
function distToRay(p: Vec, a: number, R: number): number {
  const d = at(a, 1);
  const t = Math.max(0, Math.min(R, p.x * d.x + p.y * d.y));
  return Math.hypot(p.x - d.x * t, p.y - d.y * t);
}

interface Slice {
  label: string;
  value: number;
  color: PColor;
  a0: number;
  a1: number;
  text: string;
}

export function layoutPieChart(fig: PieChartFigure): LayoutResult {
  const T = 'pieChart';
  if (!Array.isArray(fig.slices) || fig.slices.length === 0) fail(T, "slices must be a non-empty array, e.g. [{ label: 'A', value: 3 }]");
  fig.slices.forEach((s, i) => {
    if (!s || typeof s !== 'object') fail(T, `slices[${i}] must be an object { label, value }`);
    checkString(T, `slices[${i}].label`, s.label);
    checkNum(T, `slices[${i}].value`, s.value);
    if (s.value < 0) fail(T, `slices[${i}].value must be ≥ 0 (got ${s.value})`);
    checkColor(T, `slices[${i}].color`, s.color);
  });
  if (fig.slices.length > PALETTE.length && fig.slices.slice(PALETTE.length).some((s) => !s.color)) {
    fail(T, `more than ${PALETTE.length} slices: give slices ${PALETTE.length + 1}+ their own color, or merge the small ones into 'egyéb'`);
  }
  const show = fig.show ?? 'percent';
  if (!['percent', 'value', 'label', 'none'].includes(show)) fail(T, `show must be 'percent', 'value', 'label' or 'none' (got ${String(show)})`);
  const total = fig.slices.reduce((s, x) => s + x.value, 0);
  if (!(total > 0)) fail(T, 'the slice values add up to 0; at least one value must be > 0');

  const R = RADIUS[fig.size ?? 'medium'];
  const W = chartWidth(fig.size);
  // Slices without a color take the palette in order, skipping hues used by explicit colors
  // (e.g. { color: 'bad' } is red, so the next default slice is not red as well).
  const SAME_HUE: Partial<Record<string, PColor>> = { blue: 's1', orange: 's2', green: 's3', good: 's3', red: 's4', bad: 's4', highlight: 's4', purple: 's5', teal: 's6' };
  const taken = new Set(fig.slices.map((x) => (x.color ? SAME_HUE[x.color] ?? x.color : undefined)).filter(Boolean));
  const free = PALETTE.filter((p) => !taken.has(p));
  let nextFree = 0;
  const defaultColor = (i: number): PColor => (free.length > 0 && fig.slices.length <= PALETTE.length ? free[nextFree++ % free.length] : PALETTE[i % PALETTE.length]);
  let acc = 0;
  const slices: Slice[] = fig.slices.map((s, i) => {
    const a0 = (acc / total) * 360;
    acc += s.value;
    const a1 = (acc / total) * 360;
    const text = show === 'percent' ? `${num((s.value / total) * 100, 1)}%` : show === 'value' ? num(s.value) : show === 'label' ? s.label : '';
    return { label: s.label, value: s.value, color: s.color ?? defaultColor(i), a0, a1, text };
  });

  const wedges: Prim[] = [];
  const leaders: Prim[] = [];
  const texts: Prim[] = [];
  const inside: Prim[] = [];

  // --- slices --------------------------------------------------------------------------------
  for (const s of slices) {
    if (s.value <= 0) continue;
    if (s.a1 - s.a0 >= 359.999) wedges.push({ t: 'circle', c: v(0, 0), r: R, fill: s.color, fillOpacity: 1, color: 'none', obstacle: false });
    else wedges.push({ t: 'arc', c: v(0, 0), r: R, from: 90 - s.a1, to: 90 - s.a0, sector: true, fill: s.color, fillOpacity: 1, color: 'paper', w: 1.5, obstacle: false });
  }

  // --- texts on / next to the slices -------------------------------------------------------
  const outside: { s: Slice; mid: number; side: 1 | -1; y: number; w: number }[] = [];
  for (const s of slices) {
    if (!s.text || s.value <= 0) continue;
    const span = s.a1 - s.a0;
    const mid = (s.a0 + s.a1) / 2;
    const w = textWidth(s.text, IN_SIZE) + 2;
    const h = IN_SIZE * 1.15;
    if (span >= 359.999) {
      inside.push({ t: 'label', at: v(0, 0), text: s.text, dir: v(0, 0), gap: 0, fixed: true, size: IN_SIZE, font: 'ui' });
      continue;
    }
    const fits = (c: Vec) =>
      [v(-w / 2, -h / 2), v(w / 2, -h / 2), v(w / 2, h / 2), v(-w / 2, h / 2)].every((d) => {
        const p = v(c.x + d.x, c.y + d.y);
        const ang = cwAngle(p);
        const inSpan = ang >= s.a0 && ang <= s.a1;
        return Math.hypot(p.x, p.y) <= R - 4 && inSpan && distToRay(p, s.a0, R) >= 3 && distToRay(p, s.a1, R) >= 3;
      });
    const spot = [0.62, 0.55, 0.7, 0.47, 0.38].map((k) => at(mid, R * k)).find(fits);
    if (spot) inside.push({ t: 'label', at: spot, text: s.text, dir: v(0, 0), gap: 0, fixed: true, size: IN_SIZE, font: 'ui' });
    else {
      const side = Math.sin((mid * Math.PI) / 180) >= -1e-9 ? 1 : -1;
      outside.push({ s, mid, side, y: at(mid, R + 10).y, w: textWidth(s.text, OUT_SIZE) });
    }
  }

  // Outside texts: a column on each side; pushed apart vertically so they never overlap.
  const rowH = OUT_SIZE * 1.2 + 2;
  let lowest = -R;
  for (const side of [1, -1] as const) {
    const list = outside.filter((o) => o.side === side).sort((a, b) => b.y - a.y);
    for (let k = 1; k < list.length; k++) list[k].y = Math.min(list[k].y, list[k - 1].y - rowH);
    // if the column runs far below the pie, shift it up (as far as the top allows)
    const overflow = list.length ? -R - 6 - list[list.length - 1].y : 0;
    if (overflow > 0) {
      const room = list.length ? R + 14 - list[0].y : 0;
      const shift = Math.min(overflow, Math.max(0, room));
      for (const o of list) o.y += shift;
    }
    for (const o of list) {
      const rim = at(o.mid, R - 1);
      const elbow = at(o.mid, R + 9);
      const end = v(side * (R + 13), o.y);
      const pts = Math.abs(elbow.x) < Math.abs(end.x) ? [rim, elbow, end] : [rim, v(side * (Math.abs(elbow.x) + 4), o.y)];
      leaders.push({ t: 'poly', pts, closed: false, color: 'ink', w: 1, obstacle: false });
      const tx = Math.abs(pts[pts.length - 1].x) + 3;
      texts.push({ t: 'text', at: v(side * tx, o.y), text: o.s.text, size: OUT_SIZE, anchor: side > 0 ? 'start' : 'end', font: 'ui' });
      lowest = Math.min(lowest, o.y - rowH / 2);
    }
  }

  // --- legend ----------------------------------------------------------------------------------
  const showLegend = fig.legend ?? show !== 'label';
  if (showLegend) {
    const items = slices.map((s) => ({ text: s.label, color: s.color, swatch: 'box' as const }));
    texts.push(...legend(items, 0, lowest - 12, Math.max(W, 2 * R + 40)).prims);
  }

  return { prims: [...wedges, ...leaders, ...texts, ...inside], fit: { scale: 1 } };
}
