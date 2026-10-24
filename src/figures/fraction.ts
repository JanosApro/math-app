/**
 * Layout of the fraction model ('fractionModel': a circle / bar / grid cut into equal parts, some
 * shaded) and the bar model ('barModel': tape diagrams with braces, like the grade 5 book).
 *
 * Fraction model: world units, fitted by fitScene like the geometry figures.
 * Bar model: laid out directly in screen units (fit scale 1, y up), like the number line.
 *
 * Engine file — content authors never need to touch this.
 */
import type { BarModelBrace, BarModelFigure, FigColor, FractionModelFigure } from './types';
import type { LayoutResult } from './index';
import { SIZES, textWidth, v, type Prim, type Vec } from './scene';

function fail(type: string, msg: string): never {
  throw new Error(`${type}: ${msg}`);
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isInt = (x: unknown): x is number => isNum(x) && Number.isInteger(x);

// =============================================================================================
// Fraction model
// =============================================================================================

const MAX_PARTS = { circle: 24, bar: 24, rect: 100 } as const;
const MAX_WHOLES = 6;
const SHADE_OPACITY = 0.55;
const LABEL_SIZE = 17;
/** Box (screen units) the model group is fitted into, per figure size. */
const MODEL_BOX = { small: { w: 200, h: 120 }, medium: { w: 270, h: 160 }, large: { w: 320, h: 220 } } as const;

/** Default grid rows: the divisor of `parts` closest to √parts with rows ≤ columns. */
function defaultRows(parts: number): number {
  let best = 1;
  for (let r = 1; r * r <= parts; r++) if (parts % r === 0) best = r;
  return best;
}

/** '3/4' → { num, den }, '1 3/4' → { whole, num, den }, anything else → null. */
function parseFraction(label: string): { whole?: string; num: string; den: string } | null {
  const m = /^\s*(?:(-?\d+)\s+)?(-?\d+)\s*\/\s*(\d+)\s*$/.exec(label);
  if (!m) return null;
  return { whole: m[1], num: m[2].replace('-', '−'), den: m[3] };
}

export function layoutFractionModel(fig: FractionModelFigure): LayoutResult {
  const T = 'fractionModel';
  const shape = fig.shape;
  if (shape !== 'circle' && shape !== 'bar' && shape !== 'rect') fail(T, `unknown "shape" ${JSON.stringify(shape)} (use 'circle', 'bar' or 'rect')`);
  const parts = fig.parts;
  if (!isInt(parts) || parts < 1 || parts > MAX_PARTS[shape]) fail(T, `"parts" must be a whole number from 1 to ${MAX_PARTS[shape]} for a ${shape} (got ${JSON.stringify(parts)})`);
  const shaded = fig.shaded;
  if (!isInt(shaded) || shaded < 0) fail(T, `"shaded" must be a whole number ≥ 0 (got ${JSON.stringify(shaded)})`);
  const wholes = Math.max(1, Math.ceil(shaded / parts));
  if (wholes > MAX_WHOLES) fail(T, `"shaded" ${shaded} needs ${wholes} wholes; at most ${MAX_WHOLES} are drawn (shaded ≤ ${MAX_WHOLES * parts})`);
  let rows = 1;
  if (shape === 'rect') {
    rows = fig.rows ?? defaultRows(parts);
    if (!isInt(rows) || rows < 1 || parts % rows !== 0) fail(T, `"rows" must be a whole number that divides parts = ${parts} (got ${JSON.stringify(fig.rows)})`);
  } else if (fig.rows !== undefined) {
    fail(T, '"rows" is only used with shape: \'rect\'');
  }
  const cols = parts / rows;
  const color: FigColor = fig.color ?? 'accent';

  // Size of one whole (world units) and the arrangement of the wholes.
  const [w1, h1] = shape === 'circle' ? [2, 2] : shape === 'bar' ? [Math.max(5, Math.min(8, parts * 0.6)), 0.8] : [cols, rows];
  const perRow = shape === 'bar' ? 1 : wholes <= 3 ? wholes : wholes === 4 ? 2 : 3;
  const gap = shape === 'circle' ? 0.45 : shape === 'bar' ? 0.35 : Math.max(0.6, 0.15 * Math.max(cols, rows));
  const nRows = Math.ceil(wholes / perRow);

  const fills: Prim[] = [];
  const lines: Prim[] = [];
  const shadeIn = (w: number) => Math.max(0, Math.min(parts, shaded - w * parts));

  for (let w = 0; w < wholes; w++) {
    const r = Math.floor(w / perRow);
    const inRow = Math.min(perRow, wholes - r * perRow);
    const c = w % perRow;
    // rows with fewer wholes are centered
    const x0 = c * (w1 + gap) + ((perRow - inRow) * (w1 + gap)) / 2;
    const y0 = -r * (h1 + gap) - h1; // top row at y ∈ [-h1, 0]
    const k = shadeIn(w);
    if (shape === 'circle') {
      const O = v(x0 + 1, y0 + 1);
      const step = 360 / parts;
      if (k === parts) fills.push({ t: 'circle', c: O, r: 1, color: 'none', fill: color, fillOpacity: SHADE_OPACITY, obstacle: false });
      else if (k > 0) fills.push({ t: 'arc', c: O, r: 1, from: 90 - k * step, to: 90, sector: true, color: 'none', fill: color, fillOpacity: SHADE_OPACITY, obstacle: false });
      if (parts > 1)
        for (let i = 0; i < parts; i++) {
          const a = ((90 - i * step) * Math.PI) / 180;
          lines.push({ t: 'seg', a: O, b: v(O.x + Math.cos(a), O.y + Math.sin(a)), w: 1.4 });
        }
      lines.push({ t: 'circle', c: O, r: 1, w: 2 });
    } else {
      const cw = w1 / cols;
      const ch = h1 / rows;
      for (let i = 0; i < k; i++) {
        const rr = Math.floor(i / cols);
        const cc = i % cols;
        const X = x0 + cc * cw;
        const Y = y0 + h1 - (rr + 1) * ch; // reading order: from the top-left
        fills.push({ t: 'poly', pts: [v(X, Y), v(X + cw, Y), v(X + cw, Y + ch), v(X, Y + ch)], closed: true, color: 'none', fill: color, fillOpacity: SHADE_OPACITY, obstacle: false });
      }
      for (let i = 1; i < cols; i++) lines.push({ t: 'seg', a: v(x0 + i * cw, y0), b: v(x0 + i * cw, y0 + h1), w: 1.4 });
      for (let i = 1; i < rows; i++) lines.push({ t: 'seg', a: v(x0, y0 + i * ch), b: v(x0 + w1, y0 + i * ch), w: 1.4 });
      lines.push({ t: 'poly', pts: [v(x0, y0), v(x0 + w1, y0), v(x0 + w1, y0 + h1), v(x0, y0 + h1)], closed: true, w: 2 });
    }
  }

  // Scale: the group fits a box a bit smaller than the geometry figures (a model is an
  // illustration, not the main drawing); grid cells at most 36 px.
  const width = perRow * w1 + (perRow - 1) * gap;
  const height = nRows * h1 + (nRows - 1) * gap;
  const box = MODEL_BOX[fig.size ?? 'medium'];
  const s = Math.min(box.w / width, box.h / height, shape === 'rect' ? 36 * (box.w / MODEL_BOX.medium.w) : Infinity);

  // Label under the whole group (a stacked fraction for '3/4', whole + fraction for '1 3/4').
  const labels: Prim[] = [];
  if (fig.label) {
    const bottom = v(width / 2, -height);
    const f = parseFraction(fig.label);
    if (!f) {
      labels.push({ t: 'label', at: bottom, text: fig.label, dir: 's', gap: 8, fixed: true, size: LABEL_SIZE });
    } else {
      const fracW = Math.max(textWidth(f.num, LABEL_SIZE), textWidth(f.den, LABEL_SIZE)) + 4;
      const wholeSize = LABEL_SIZE + 3;
      const wholeW = f.whole ? textWidth(f.whole, wholeSize) + 4 : 0;
      const total = wholeW + fracW;
      const fracX = bottom.x + (total / 2 - fracW / 2) / s;
      labels.push({ t: 'label', at: v(fracX, bottom.y), text: fig.label, frac: { num: f.num, den: f.den }, dir: 's', gap: 6, fixed: true, size: LABEL_SIZE });
      if (f.whole) {
        const wholeX = bottom.x + (-total / 2 + wholeW / 2 - 2) / s;
        labels.push({ t: 'label', at: v(wholeX, bottom.y), text: f.whole.replace('-', '−'), dir: 's', gap: 6 + (LABEL_SIZE * 2.3 - wholeSize * 1.15) / 2, fixed: true, size: wholeSize });
      }
    }
  }
  return { prims: [...fills, ...lines, ...labels], fit: { scale: s } };
}

// =============================================================================================
// Bar model
// =============================================================================================

const SEG_COLORS: FigColor[] = ['blue', 'red', 'green', 'orange', 'purple', 'teal'];
const ROW_GAP = 12;
const BRACE_D = 9;
const BRACE_GAP = 4;
const TEXT = 15;
/** Font size of stacked fractions ('3/8') inside the bars. */
const FRAC = 13;
const SEG_OPACITY = 0.3;

/** Size of a bar-model text: plain, or a stacked fraction for 'a/b'. */
function textBox(text: string): { w: number; h: number; frac?: { num: string; den: string } } {
  const f = parseFraction(text);
  if (f && !f.whole) return { w: Math.max(textWidth(f.num, FRAC), textWidth(f.den, FRAC)) + 4, h: FRAC * 2.3, frac: { num: f.num, den: f.den } };
  return { w: textWidth(text, TEXT), h: TEXT * 1.15 };
}

/** Text centered at `at` (screen units, y up): one text prim, or numerator + bar + denominator. */
function centeredText(at: Vec, text: string): Prim[] {
  const b = textBox(text);
  if (!b.frac) return [{ t: 'text', at, text, size: TEXT, font: 'math', color: 'ink' }];
  return [
    { t: 'text', at: v(at.x, at.y + FRAC * 0.6), text: b.frac.num, size: FRAC, font: 'math', color: 'ink' },
    { t: 'seg', a: v(at.x - b.w / 2 + 1, at.y), b: v(at.x + b.w / 2 - 1, at.y), color: 'ink', w: 1.2, obstacle: false },
    { t: 'text', at: v(at.x, at.y - FRAC * 0.62), text: b.frac.den, size: FRAC, font: 'math', color: 'ink' },
  ];
}

interface NBrace {
  row: number;
  side: 'above' | 'below';
  a: number;
  b: number;
  label: string;
  color?: FigColor;
  level: number;
}

/** Quadratic Bézier samples (without the first point). */
function quad(p0: Vec, c: Vec, p1: Vec, n = 8): Vec[] {
  const out: Vec[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push(v(u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, u * u * p0.y + 2 * u * t * c.y + t * t * p1.y));
  }
  return out;
}

/** A curly brace from x0 to x1 starting at height y, opening towards `sgn` (−1 = down, +1 = up; y up). */
function bracePoints(x0: number, x1: number, y: number, sgn: number): Vec[] {
  const xm = (x0 + x1) / 2;
  const h = (BRACE_D / 2) * sgn;
  const r = Math.min(BRACE_D, (x1 - x0) / 4);
  const pts: Vec[] = [v(x0, y)];
  pts.push(...quad(v(x0, y), v(x0, y + h), v(x0 + r, y + h)));
  pts.push(v(xm - r, y + h));
  pts.push(...quad(v(xm - r, y + h), v(xm, y + h), v(xm, y + 2 * h)));
  pts.push(...quad(v(xm, y + 2 * h), v(xm, y + h), v(xm + r, y + h)));
  pts.push(v(x1 - r, y + h));
  pts.push(...quad(v(x1 - r, y + h), v(x1, y + h), v(x1, y)));
  return pts;
}

export function layoutBarModel(fig: BarModelFigure): LayoutResult {
  const T = 'barModel';
  if (!Array.isArray(fig.rows) || fig.rows.length === 0) fail(T, '"rows" must be a non-empty list of { label?, segments }');
  const rows = fig.rows;
  rows.forEach((row, i) => {
    if (!row || !Array.isArray(row.segments) || row.segments.length === 0) fail(T, `rows[${i}].segments must be a non-empty list of { value, label? }`);
    row.segments.forEach((sg, j) => {
      if (!sg || !isNum(sg.value) || sg.value <= 0) fail(T, `rows[${i}].segments[${j}].value must be a positive number (got ${JSON.stringify(sg?.value)})`);
    });
  });
  const sums = rows.map((r) => r.segments.reduce((s, sg) => s + sg.value, 0));
  const starts = rows.map((r) => {
    const out: number[] = [];
    let acc = 0;
    for (const sg of r.segments) {
      out.push(acc);
      acc += sg.value;
    }
    return out;
  });

  // Braces (the `total` shorthand is a brace over a whole row).
  const raw: (BarModelBrace & { where: string })[] = [...(fig.braces ?? []).map((b, i) => ({ ...b, where: `braces[${i}]` }))];
  if (fig.braces !== undefined && !Array.isArray(fig.braces)) fail(T, '"braces" must be a list');
  if (fig.total) raw.push({ label: fig.total.label, row: fig.total.row, side: fig.total.side, where: 'total' });
  const braces: NBrace[] = raw.map((b) => {
    const side = b.side ?? 'below';
    if (side !== 'above' && side !== 'below') fail(T, `${b.where}.side must be 'above' or 'below'`);
    const row = b.row ?? (side === 'above' ? 0 : rows.length - 1);
    if (!isInt(row) || row < 0 || row >= rows.length) fail(T, `${b.where}.row must be a row index 0–${rows.length - 1} (got ${JSON.stringify(b.row)})`);
    if (typeof b.label !== 'string') fail(T, `${b.where}.label must be a text`);
    let a = 0;
    let e = sums[row];
    if (b.span !== undefined) {
      if (!Array.isArray(b.span) || b.span.length !== 2 || !isNum(b.span[0]) || !isNum(b.span[1]) || b.span[0] < 0 || !(b.span[0] < b.span[1]))
        fail(T, `${b.where}.span must be [from, to] with 0 ≤ from < to (got ${JSON.stringify(b.span)})`);
      [a, e] = b.span;
    } else if (b.segments !== undefined) {
      const n = rows[row].segments.length;
      const [s0, s1] = Array.isArray(b.segments) ? b.segments : [NaN, NaN];
      if (!isInt(s0) || !isInt(s1) || s0 < 0 || s1 >= n || s0 > s1) fail(T, `${b.where}.segments must be [first, last] segment indices of row ${row} (0–${n - 1}, first ≤ last)`);
      a = starts[row][s0];
      e = starts[row][s1] + rows[row].segments[s1].value;
    }
    return { row, side, a, b: e, label: b.label, color: b.color, level: 0 };
  });

  // Bar height: taller when a stacked fraction has to fit inside.
  const anyFrac = rows.some((r) => (r.label && textBox(r.label).frac) || r.segments.some((sg) => sg.label && textBox(sg.label).frac));
  const BAR_H = anyFrac ? 38 : 32;
  const braceLabelH = Math.max(TEXT * 1.15, ...braces.map((b) => textBox(b.label).h));
  const LEVEL_H = BRACE_GAP + BRACE_D + 3 + braceLabelH + 4;

  // Horizontal scale: every row and brace fits into the bar area.
  const W = SIZES[fig.size ?? 'medium'].w;
  const rowLabelW = Math.max(0, ...rows.map((r) => (r.label ? textBox(r.label).w : 0)));
  const labelCol = rowLabelW > 0 ? rowLabelW + 10 : 0;
  const barW = Math.max(150, W - labelCol);
  const maxValue = Math.max(...sums, ...braces.map((b) => b.b));
  const u = barW / maxValue;

  // Brace levels per row and side: overlapping braces (or their labels) go one level further out.
  for (const side of ['above', 'below'] as const) {
    rows.forEach((_, ri) => {
      // inner (shorter) braces first, so they sit next to the bar and the enclosing ones further out
      const list = braces.filter((b) => b.row === ri && b.side === side).sort((p, q) => p.b - p.a - (q.b - q.a) || p.a - q.a);
      const taken: [number, number][][] = [];
      for (const b of list) {
        const mid = ((b.a + b.b) / 2) * u;
        const half = Math.max(((b.b - b.a) * u) / 2, textBox(b.label).w / 2 + 3);
        const ext: [number, number] = [mid - half, mid + half];
        let level = 0;
        // braces that only touch (adjacent segments) share a level
        while (taken[level]?.some(([p, q]) => ext[0] < q - 0.5 && p < ext[1] - 0.5)) level++;
        (taken[level] ??= []).push(ext);
        b.level = level;
      }
    });
  }

  const fillsAndLines: Prim[] = [];
  const texts: Prim[] = [];
  const braceLabels: Prim[] = [];
  const outsideLabels: Prim[] = [];
  let y = 0; // top of the current block; y goes DOWN here, converted with P() (y up)
  const P = (x: number, yy: number) => v(x, -yy);

  rows.forEach((row, ri) => {
    const segs = row.segments;
    const segW = segs.map((sg) => sg.value * u);
    const labelText = segs.map((sg) => sg.label ?? (sg.unknown ? '?' : ''));
    const fitsInside = segs.map((_, j) => !labelText[j] || textBox(labelText[j]).w + 8 <= segW[j]);
    const outsideBoxes = segs.map((_, j) => (fitsInside[j] ? 0 : textBox(labelText[j]).h));
    const above = braces.filter((b) => b.row === ri && b.side === 'above');
    const below = braces.filter((b) => b.row === ri && b.side === 'below');
    const aboveLevels = above.length ? Math.max(...above.map((b) => b.level)) + 1 : 0;
    const belowLevels = below.length ? Math.max(...below.map((b) => b.level)) + 1 : 0;
    const outsideH = Math.max(...outsideBoxes) > 0 ? Math.max(...outsideBoxes) + 6 : 0;
    const top = y + aboveLevels * LEVEL_H + outsideH;
    const bottom = top + BAR_H;

    // pieces
    segs.forEach((sg, j) => {
      const x0 = starts[ri][j] * u;
      const x1 = x0 + segW[j];
      const color: FigColor = sg.color ?? SEG_COLORS[j % SEG_COLORS.length];
      const pts = [P(x0, top), P(x1, top), P(x1, bottom), P(x0, bottom)];
      if (sg.unknown) fillsAndLines.push({ t: 'poly', pts, closed: true, color, w: 1.6, dash: 'dashed', fill: color, fillOpacity: 0.08 });
      else fillsAndLines.push({ t: 'poly', pts, closed: true, color: 'ink', w: 1.4, fill: color, fillOpacity: SEG_OPACITY });
      const text = labelText[j];
      if (!text) return;
      const box = textBox(text);
      if (fitsInside[j]) texts.push(...centeredText(P((x0 + x1) / 2, (top + bottom) / 2), text));
      else outsideLabels.push({ t: 'label', at: P((x0 + x1) / 2, top), text, frac: box.frac, dir: 'n', gap: 3, size: box.frac ? FRAC : TEXT });
    });

    // row name on the left
    if (row.label) {
      const box = textBox(row.label);
      if (box.frac) texts.push(...centeredText(P(-10 - box.w / 2, (top + bottom) / 2), row.label));
      else texts.push({ t: 'text', at: P(-10, (top + bottom) / 2), text: row.label, size: TEXT, anchor: 'end', font: 'math', color: 'ink' });
    }

    // braces
    for (const b of [...above, ...below]) {
      // inset the ends a little, so braces of neighbouring pieces do not merge
      const inset = (b.b - b.a) * u > 12 ? 2 : 0;
      const x0 = b.a * u + inset;
      const x1 = b.b * u - inset;
      const base = b.side === 'below' ? bottom + BRACE_GAP + b.level * LEVEL_H : top - outsideH - BRACE_GAP - b.level * LEVEL_H;
      const sgn = b.side === 'below' ? -1 : 1; // y up: below = towards −y
      const pts = bracePoints(x0, x1, -base, sgn);
      fillsAndLines.push({ t: 'poly', pts, closed: false, color: b.color ?? 'ink', w: 1.5 });
      if (b.label) {
        const tip = v((x0 + x1) / 2, -base + sgn * BRACE_D);
        const box = textBox(b.label);
        braceLabels.push({ t: 'label', at: tip, text: b.label, frac: box.frac, dir: b.side === 'below' ? 's' : 'n', gap: 3, fixed: true, size: box.frac ? FRAC : TEXT, color: b.color });
      }
    }

    y = bottom + belowLevels * LEVEL_H + ROW_GAP;
  });

  return { prims: [...fillsAndLines, ...texts, ...braceLabels, ...outsideLabels], fit: { scale: 1 } };
}
