/**
 * Data and statistics figures: bar chart ('barChart'), line chart ('lineChart'), plus the entry
 * points of the pie chart ('pieChart', charts-pie.ts), pictogram and table ('pictogram', 'table',
 * charts-table.ts). Parameters are documented in types.ts.
 *
 * Layout is done directly in screen-like units (fit scale 1, y up) for a target width of
 * SIZES[size].w (300 for 'medium'). Fonts: 'ui' (sans) for every chart text, numbers with a
 * decimal comma (num()).
 *
 * Engine file — content authors never need to touch this.
 */
import type { BarChartFigure, Dir, LineChartFigure } from './types';
import type { LayoutResult } from './index';
import { textWidth, v, type PColor, type Prim } from './scene';
import { num } from '../engine/format';
import {
  FS,
  checkColor,
  checkInAxis,
  checkString,
  chartWidth,
  checkNum,
  ellipsize,
  fail,
  legend,
  niceMultiple,
  plotHeight,
  rect,
  roundedRect,
  seriesColor,
  valueAxis,
  wrap2,
  type ValueAxis,
} from './charts-common';

export { layoutPieChart } from './charts-pie';
export { layoutPictogram, layoutTable } from './charts-table';

/** Gap between touching bars of one category (screen units). */
const GAP = 2;
/** Length of the value-axis arrow above the top grid line. */
const ARROW = 16;
const MAX_CATEGORIES = 40;

type CatFigure = BarChartFigure | LineChartFigure;

function checkSeries(T: string, fig: CatFigure): void {
  if (!Array.isArray(fig.categories) || fig.categories.length === 0) fail(T, 'categories must be a non-empty array of names');
  if (fig.categories.length > MAX_CATEGORIES) fail(T, `too many categories (${fig.categories.length}, at most ${MAX_CATEGORIES})`);
  fig.categories.forEach((c, i) => checkString(T, `categories[${i}]`, c));
  if (!Array.isArray(fig.series) || fig.series.length === 0) fail(T, 'series must be a non-empty array, e.g. [{ values: [3, 5, 2] }]');
  if (fig.series.length > 8) fail(T, `at most 8 series (got ${fig.series.length})`);
  fig.series.forEach((s, i) => {
    if (!s || !Array.isArray(s.values)) fail(T, `series[${i}].values must be an array of numbers`);
    if (s.values.length !== fig.categories.length) {
      fail(T, `series[${i}].values has ${s.values.length} value(s) but there are ${fig.categories.length} categories`);
    }
    s.values.forEach((x, j) => checkNum(T, `series[${i}].values[${j}]`, x));
    if (s.name !== undefined) checkString(T, `series[${i}].name`, s.name);
    checkColor(T, `series[${i}].color`, s.color);
  });
  if (fig.xLabel !== undefined) checkString(T, 'xLabel', fig.xLabel);
  if (fig.yLabel !== undefined) checkString(T, 'yLabel', fig.yLabel);
}

/** Which ticks get a number / a grid line (thinned so they are not too dense). */
function tickPlan(ax: ValueAxis, pxPerStep: number, needNum: number) {
  const k = (t: number) => Math.round(t / ax.step);
  const numEvery = niceMultiple(pxPerStep, needNum);
  const gridEvery = niceMultiple(pxPerStep, 6);
  return {
    numbered: ax.ticks.filter((t) => k(t) % numEvery === 0),
    grid: ax.ticks.filter((t) => k(t) % gridEvery === 0),
  };
}

/** Zigzag on the value axis just above the baseline: the axis does not start at 0. */
function axisBreak(at: (d: number) => [number, number], vertical: boolean): Prim[] {
  const P = (d: number, side: number) => {
    const [x, y] = at(d);
    return vertical ? v(x + side, y) : v(x, y + side);
  };
  const [ax0, ay0] = at(3);
  const [ax1, ay1] = at(13);
  const backing = vertical ? rect(ax0 - 5, ay0, ax1 + 5, ay1, 'paper') : rect(ax0, ay0 - 5, ax1, ay1 + 5, 'paper');
  return [backing, { t: 'poly', pts: [P(3, 0), P(5.5, -4.5), P(10.5, 4.5), P(13, 0)], closed: false, color: 'axis', w: 1.5, obstacle: false }];
}

interface CatLabels {
  prims: Prim[];
  /** Lowest y used (y up). */
  bottom: number;
}

/**
 * Category names under a horizontal category axis: one line, wrapped onto two lines, or turned
 * vertical when there is no room. `xs` are the slot centres, `top` the y of their upper edge.
 */
function categoryLabels(categories: string[], xs: number[], slot: number, top: number, maxVertical: number): CatLabels {
  const prims: Prim[] = [];
  const avail = slot - 4;
  for (const size of [FS.cat, 12, 11]) {
    const lines = categories.map((c) => wrap2(c, size, avail));
    if (lines.every((l) => l !== null)) {
      let maxLines = 1;
      lines.forEach((l, i) => {
        maxLines = Math.max(maxLines, l!.length);
        l!.forEach((line, j) => prims.push({ t: 'text', at: v(xs[i], top - size * 0.6 - j * size * 1.15), text: line, size, anchor: 'middle', font: 'ui' }));
      });
      return { prims, bottom: top - size * 1.2 - (maxLines - 1) * size * 1.15 };
    }
  }
  // Vertical names (reading upwards), ending just under the axis.
  const size = Math.max(8, Math.min(12, slot / 1.25));
  let maxW = 0;
  categories.forEach((c, i) => {
    const text = ellipsize(c, size, maxVertical);
    const w = textWidth(text, size);
    maxW = Math.max(maxW, w);
    prims.push({ t: 'text', at: v(xs[i], top - w / 2), text, size, anchor: 'middle', font: 'ui', rotate: 90 });
  });
  return { prims, bottom: top - maxW };
}

function seriesNames(fig: CatFigure): string[] {
  return fig.series.map((s, i) => s.name ?? `${i + 1}. adatsor`);
}

// =============================================================================================
// Bar chart and line chart (vertical value axis)
// =============================================================================================

export function layoutBarChart(fig: BarChartFigure): LayoutResult {
  const T = 'barChart';
  checkSeries(T, fig);
  if (fig.horizontal) return layoutHorizontalBars(fig);
  return layoutColumns(T, fig, 'bar');
}

export function layoutLineChart(fig: LineChartFigure): LayoutResult {
  const T = 'lineChart';
  checkSeries(T, fig);
  return layoutColumns(T, fig, 'line');
}

function layoutColumns(T: string, fig: CatFigure, kind: 'bar' | 'line'): LayoutResult {
  const { categories, series } = fig;
  const n = categories.length;
  const nS = series.length;
  const ax = valueAxis(T, series.flatMap((s) => s.values), fig);
  series.forEach((s, i) => s.values.forEach((x, j) => checkInAxis(T, ax, x, `series[${i}].values[${j}] ("${categories[j]}")`)));

  const W = chartWidth(fig.size);
  const PH = plotHeight(fig.size);
  const Y = (x: number) => ((x - ax.lo) / (ax.hi - ax.lo)) * PH;
  const plan = tickPlan(ax, (ax.step / (ax.hi - ax.lo)) * PH, FS.axis * 1.3);
  const numW = Math.max(...plan.numbered.map((t) => textWidth(num(t), FS.axis)));
  const left = numW + 9; // numbers end 6 units left of the axis
  const PW = W - left - 6;
  const slot = PW / n;
  const xs = categories.map((_, i) => (i + 0.5) * slot);
  const base = Math.min(ax.hi, Math.max(ax.lo, 0)); // bars grow from 0 (or from yMin when zoomed in)

  const grid: Prim[] = [];
  const backing: Prim[] = [];
  const marks: Prim[] = [];
  const axes: Prim[] = [];
  const texts: Prim[] = [];
  const labels: Prim[] = [];

  // --- grid, value axis ------------------------------------------------------------------------
  for (const t of plan.grid) if (t > ax.lo) grid.push({ t: 'seg', a: v(0, Y(t)), b: v(PW, Y(t)), color: 'grid', w: 1, obstacle: false });
  for (const t of plan.numbered) {
    axes.push({ t: 'seg', a: v(-3, Y(t)), b: v(0, Y(t)), color: 'axis', w: 1.2, obstacle: false });
    texts.push({ t: 'text', at: v(-6, Y(t)), text: num(t), size: FS.axis, anchor: 'end', font: 'ui' });
  }
  axes.push({ t: 'seg', a: v(0, 0), b: v(PW, 0), color: 'axis', w: 1.5 });
  if (base > ax.lo) axes.push({ t: 'seg', a: v(0, Y(base)), b: v(PW, Y(base)), color: 'axis', w: 1.2, obstacle: false });
  if (ax.lo > 0) axes.push(...axisBreak((d) => [0, d], true));

  let top = PH + ARROW; // highest y used so far (value labels may go higher)
  let bottom = -6; // upper edge of the category names (value labels of negative bars may push it down)

  if (kind === 'bar') {
    // --- bars --------------------------------------------------------------------------------
    const groupMax = slot * (nS === 1 ? 0.62 : 0.8);
    const barW = Math.min(nS === 1 ? 34 : 22, (groupMax - (nS - 1) * GAP) / nS);
    const groupW = nS * barW + (nS - 1) * GAP;
    const barX = (i: number, j: number) => xs[i] - groupW / 2 + j * (barW + GAP);
    series.forEach((s, j) => {
      const color = seriesColor(j, s.color);
      s.values.forEach((x, i) => {
        if (Math.abs(Y(x) - Y(base)) < 0.3) return; // zero bar: nothing to draw
        const x0 = barX(i, j);
        const [y0, y1] = x > base ? [Y(base), Y(x)] : [Y(x), Y(base)];
        marks.push({ t: 'poly', pts: roundedRect(x0, y0, x0 + barW, y1, 3, x > base ? 'top' : 'bottom'), closed: true, color: 'none', fill: color, fillOpacity: 1, obstacle: false });
      });
    });
    // --- values above the bars -----------------------------------------------------------------
    if (fig.showValues) {
      const all = series.flatMap((s) => s.values.map((x) => num(x)));
      const limit = nS > 1 ? barW + GAP - 1 : slot - 3;
      let size: number = FS.value;
      let vertical = false;
      if (Math.max(...all.map((t) => textWidth(t, size))) > limit) {
        size = 11;
        if (Math.max(...all.map((t) => textWidth(t, size))) > limit) vertical = true;
      }
      series.forEach((s, j) => {
        s.values.forEach((x, i) => {
          const text = num(x);
          const w = textWidth(text, size);
          const cx = barX(i, j) + barW / 2;
          const up = x >= base;
          const ext = vertical ? w : size * 1.15;
          const cy = up ? Y(x) + 3 + ext / 2 : Y(x) - 3 - ext / 2;
          const [bw, bh] = vertical ? [size * 1.15, w + 2] : [w + 2, size * 1.15];
          backing.push(rect(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2, 'paper'));
          texts.push({ t: 'text', at: v(cx, cy), text, size, anchor: 'middle', font: 'ui', rotate: vertical ? 90 : undefined });
          top = Math.max(top, cy + ext / 2 + 4);
          bottom = Math.min(bottom, cy - ext / 2 - 4);
        });
      });
    }
  } else {
    // --- lines and dots ----------------------------------------------------------------------
    for (const x of xs) axes.push({ t: 'seg', a: v(x, 0), b: v(x, -4), color: 'axis', w: 1.2, obstacle: false });
    bottom = -8;
    series.forEach((s, j) => {
      const color = seriesColor(j, s.color);
      const pts = s.values.map((x, i) => v(xs[i], Y(x)));
      if (pts.length > 1) marks.push({ t: 'poly', pts, closed: false, color, w: 2.4 });
    });
    series.forEach((s, j) => {
      const color = seriesColor(j, s.color);
      s.values.forEach((x, i) => marks.push({ t: 'circle', c: v(xs[i], Y(x)), r: 4.2, color: 'paper', w: 1.5, fill: color, fillOpacity: 1, obstacle: false }));
    });
    if (fig.showValues) {
      series.forEach((s, j) => {
        s.values.forEach((x, i) => {
          let dir: Dir = 'n';
          if (nS > 1) {
            const others = series.filter((_, k) => k !== j).map((o) => o.values[i]);
            if (others.every((o) => o > x)) dir = 's';
          } else {
            const prev = s.values[i - 1];
            const next = s.values[i + 1];
            if ((prev === undefined || prev > x) && (next === undefined || next > x) && (prev !== undefined || next !== undefined)) dir = 's';
          }
          labels.push({ t: 'label', at: v(xs[i], Y(x)), text: num(x), dir, gap: 6, size: FS.value, font: 'ui' });
          if (dir === 'n') top = Math.max(top, Y(x) + 6 + FS.value * 1.2 + 6);
        });
      });
    }
  }

  // value axis with arrow (drawn after the grid so it is on top)
  axes.push({ t: 'seg', a: v(0, 0), b: v(0, PH + ARROW), color: 'axis', w: 1.5, arrowEnd: true });

  // --- category names, axis titles, legend -----------------------------------------------------
  const cats = categoryLabels(categories, xs, slot, bottom, Math.max(60, PH * 0.6));
  texts.push(...cats.prims);
  let y = cats.bottom;
  if (fig.xLabel) {
    texts.push({ t: 'text', at: v(PW / 2, y - 6 - FS.title * 0.6), text: fig.xLabel, size: FS.title, anchor: 'middle', font: 'ui' });
    y -= 6 + FS.title * 1.2;
  }
  if (fig.yLabel) texts.push({ t: 'text', at: v(-left, top + 4 + FS.title * 0.6), text: fig.yLabel, size: FS.title, anchor: 'start', font: 'ui' });
  if (nS > 1) {
    const items = seriesNames(fig).map((text, j) => ({ text, color: seriesColor(j, series[j].color) as PColor, swatch: kind === 'bar' ? ('box' as const) : ('line' as const) }));
    const lg = legend(items, (PW - left) / 2, y - 10, W);
    texts.push(...lg.prims);
  }

  return { prims: [...grid, ...backing, ...marks, ...axes, ...texts, ...labels], fit: { scale: 1 } };
}

// =============================================================================================
// Horizontal bar chart (category names on the left)
// =============================================================================================

function layoutHorizontalBars(fig: BarChartFigure): LayoutResult {
  const T = 'barChart';
  const { categories, series } = fig;
  const n = categories.length;
  const nS = series.length;
  const ax = valueAxis(T, series.flatMap((s) => s.values), fig);
  series.forEach((s, i) => s.values.forEach((x, j) => checkInAxis(T, ax, x, `series[${i}].values[${j}] ("${categories[j]}")`)));

  const W = chartWidth(fig.size);
  const size = FS.cat;
  const lines = categories.map((c) => wrap2(c, size, W * 0.38) ?? wrap2(c, size, W * 0.5) ?? [ellipsize(c, size, W * 0.5)]);
  const labelW = Math.max(...lines.flat().map((l) => textWidth(l, size)));
  const maxLines = Math.max(...lines.map((l) => l.length));
  const bt = nS === 1 ? 18 : 14; // bar thickness
  const groupH = nS * bt + (nS - 1) * GAP;
  const slotH = Math.max(groupH + 10, maxLines * size * 1.15 + 8);
  const PHh = n * slotH;

  const valTexts = series.map((s) => s.values.map((x) => num(x)));
  const valW = fig.showValues ? Math.max(...valTexts.flat().map((t) => textWidth(t, FS.value))) : 0;
  const numTexts = ax.ticks.map((x) => num(x));
  const lastNumHalf = textWidth(numTexts[numTexts.length - 1], FS.axis) / 2;
  const left = labelW + 10;
  const right = Math.max(fig.showValues ? valW + 6 : 0, lastNumHalf, ARROW) + 4;
  const PW = W - left - right;
  if (PW < 60) fail(T, 'category names are too long for a horizontal bar chart; shorten them');
  const X = (x: number) => ((x - ax.lo) / (ax.hi - ax.lo)) * PW;
  const base = Math.min(ax.hi, Math.max(ax.lo, 0));

  const grid: Prim[] = [];
  const marks: Prim[] = [];
  const axes: Prim[] = [];
  const texts: Prim[] = [];

  // --- value axis at the bottom --------------------------------------------------------------
  const pxPerStep = (ax.step / (ax.hi - ax.lo)) * PW;
  const maxNumW = Math.max(...numTexts.map((t) => textWidth(t, FS.axis)));
  const plan = tickPlan(ax, pxPerStep, maxNumW + 8);
  for (const t of plan.grid) if (t > ax.lo) grid.push({ t: 'seg', a: v(X(t), 0), b: v(X(t), -PHh), color: 'grid', w: 1, obstacle: false });
  const numY = -PHh - 6 - FS.axis * 0.6;
  for (const t of plan.numbered) {
    axes.push({ t: 'seg', a: v(X(t), -PHh), b: v(X(t), -PHh - 3), color: 'axis', w: 1.2, obstacle: false });
    texts.push({ t: 'text', at: v(X(t), numY), text: num(t), size: FS.axis, anchor: 'middle', font: 'ui' });
  }
  axes.push({ t: 'seg', a: v(0, 0), b: v(0, -PHh), color: 'axis', w: 1.5 });
  if (base > ax.lo) axes.push({ t: 'seg', a: v(X(base), 0), b: v(X(base), -PHh), color: 'axis', w: 1.2, obstacle: false });
  if (ax.lo > 0) axes.push(...axisBreak((d) => [d, -PHh], false));
  axes.push({ t: 'seg', a: v(0, -PHh), b: v(PW + ARROW, -PHh), color: 'axis', w: 1.5, arrowEnd: true });

  // --- bars and values -------------------------------------------------------------------------
  let catRight = -8;
  series.forEach((s, j) => {
    const color = seriesColor(j, s.color);
    s.values.forEach((x, i) => {
      const cy = -(i + 0.5) * slotH;
      const y1 = cy + groupH / 2 - j * (bt + GAP);
      const y0 = y1 - bt;
      if (Math.abs(X(x) - X(base)) >= 0.3) {
        const [x0, x1] = x > base ? [X(base), X(x)] : [X(x), X(base)];
        marks.push({ t: 'poly', pts: roundedRect(x0, y0, x1, y1, 3, x > base ? 'right' : 'left'), closed: true, color: 'none', fill: color, fillOpacity: 1, obstacle: false });
      }
      if (fig.showValues) {
        const text = valTexts[j][i];
        const pos = x >= base;
        const tx = pos ? X(x) + 4 : X(x) - 4;
        texts.push({ t: 'text', at: v(tx, (y0 + y1) / 2), text, size: FS.value, anchor: pos ? 'start' : 'end', font: 'ui' });
        if (!pos) catRight = Math.min(catRight, tx - textWidth(text, FS.value) - 6);
      }
    });
  });

  // --- category names (right-aligned) ----------------------------------------------------------
  lines.forEach((l, i) => {
    const cy = -(i + 0.5) * slotH;
    l.forEach((line, k) => {
      const y = cy + ((l.length - 1) / 2 - k) * size * 1.15;
      texts.push({ t: 'text', at: v(catRight, y), text: line, size, anchor: 'end', font: 'ui' });
    });
  });

  // --- axis titles, legend -----------------------------------------------------------------------
  let y = numY - FS.axis * 0.6;
  if (fig.yLabel) {
    texts.push({ t: 'text', at: v(PW / 2, y - 5 - FS.title * 0.6), text: fig.yLabel, size: FS.title, anchor: 'middle', font: 'ui' });
    y -= 5 + FS.title * 1.2;
  }
  if (fig.xLabel) texts.push({ t: 'text', at: v(catRight, 6 + FS.title * 0.6), text: fig.xLabel, size: FS.title, anchor: 'end', font: 'ui' });
  if (nS > 1) {
    const items = seriesNames(fig).map((text, j) => ({ text, color: seriesColor(j, series[j].color) as PColor, swatch: 'box' as const }));
    texts.push(...legend(items, (PW + catRight - labelW) / 2, y - 10, W).prims);
  }

  return { prims: [...grid, ...marks, ...axes, ...texts], fit: { scale: 1 } };
}
