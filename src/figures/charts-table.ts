/**
 * Pictogram ('pictogram') and table ('table'). Laid out in screen-like units (fit scale 1, y up).
 * Parameters: PictogramFigure and TableFigure in types.ts.
 *
 * Engine file — content authors never need to touch this.
 */
import type { PictogramFigure, TableFigure } from './types';
import type { LayoutResult } from './index';
import { clipPolygonX, textWidth, v, type Prim, type Vec } from './scene';
import { num } from '../engine/format';
import {
  BOLD,
  cellText,
  chartWidth,
  checkColor,
  checkNum,
  checkString,
  clean,
  ellipsize,
  fail,
  rect,
  symbolPolys,
  wrap2,
  type SymbolKind,
} from './charts-common';

// =============================================================================================
// Pictogram
// =============================================================================================

const SYMBOLS: SymbolKind[] = ['circle', 'square', 'star', 'person', 'heart'];
const MAX_SYMBOLS = 40;
const PG_LABEL = 14;
const PG_VALUE = 13;

export function layoutPictogram(fig: PictogramFigure): LayoutResult {
  const T = 'pictogram';
  if (!Array.isArray(fig.rows) || fig.rows.length === 0) fail(T, "rows must be a non-empty array, e.g. [{ label: 'Anna', value: 30 }]");
  checkNum(T, 'unit', fig.unit);
  if (fig.unit <= 0) fail(T, `unit must be > 0 (got ${fig.unit})`);
  const symbol = fig.symbol ?? 'circle';
  if (!SYMBOLS.includes(symbol)) fail(T, `symbol must be one of ${SYMBOLS.join(', ')} (got ${String(symbol)})`);
  checkColor(T, 'color', fig.color);
  if (fig.unitLabel !== undefined) checkString(T, 'unitLabel', fig.unitLabel);
  const counts = fig.rows.map((r, i) => {
    if (!r || typeof r !== 'object') fail(T, `rows[${i}] must be an object { label, value }`);
    checkString(T, `rows[${i}].label`, r.label);
    checkNum(T, `rows[${i}].value`, r.value);
    if (r.value < 0) fail(T, `rows[${i}].value must be ≥ 0 (got ${r.value})`);
    const c = clean(r.value / fig.unit);
    if (c > MAX_SYMBOLS) fail(T, `rows[${i}] needs ${num(c)} symbols (${num(r.value)} / ${num(fig.unit)}); at most ${MAX_SYMBOLS} — use a larger unit`);
    return c;
  });
  const color = fig.color ?? 'accent';

  const W = chartWidth(fig.size);
  const lines = fig.rows.map((r) => wrap2(r.label, PG_LABEL, W * 0.34) ?? [ellipsize(r.label, PG_LABEL, W * 0.4)]);
  const labelW = Math.max(...lines.flat().map((l) => textWidth(l, PG_LABEL)));
  const valW = fig.showValues ? Math.max(...fig.rows.map((r) => textWidth(num(r.value), PG_VALUE))) + 10 : 0;
  const x0 = labelW + 16; // symbols start here
  const avail = W - x0 - valW - 4;
  const maxCount = Math.max(1, ...counts.map((c) => Math.ceil(c - 1e-9)));
  const pitch = Math.max(14, Math.min(26, avail / maxCount));
  const perLine = Math.max(1, Math.floor(avail / pitch + 1e-9));
  const S = Math.min(21, pitch * 0.82);

  const fills: Prim[] = [];
  const lines2: Prim[] = [];
  const texts: Prim[] = [];

  let y = 0; // top of the current row
  const rowTops: number[] = [];
  fig.rows.forEach((r, i) => {
    const c = counts[i];
    const full = Math.floor(c + 1e-9);
    const frac = c - full > 1e-6 ? c - full : 0;
    const nSym = full + (frac ? 1 : 0);
    const symLines = Math.max(1, Math.ceil(nSym / perLine));
    const rowH = Math.max(lines[i].length * PG_LABEL * 1.15 + 10, symLines * pitch + 8);
    const cy = y - rowH / 2;
    rowTops.push(y);
    // name
    lines[i].forEach((line, k) => {
      texts.push({ t: 'text', at: v(0, cy + ((lines[i].length - 1) / 2 - k) * PG_LABEL * 1.15), text: line, size: PG_LABEL, anchor: 'start', font: 'ui' });
    });
    // symbols
    const symTop = cy + ((symLines - 1) * pitch) / 2;
    for (let k = 0; k < nSym; k++) {
      const sx = x0 + ((k % perLine) + 0.5) * pitch;
      const sy = symTop - Math.floor(k / perLine) * pitch;
      let polys = symbolPolys(symbol, sx, sy, S);
      if (k === full && frac) {
        const xsAll = polys.flat().map((p) => p.x);
        const minX = Math.min(...xsAll);
        const cut = minX + frac * (Math.max(...xsAll) - minX);
        polys = polys.map((p) => clipPolygonX(p, cut)).filter((p) => p.length >= 3);
      }
      for (const p of polys) fills.push({ t: 'poly', pts: p, closed: true, color: 'none', fill: color, fillOpacity: 1, obstacle: false });
    }
    if (fig.showValues) {
      texts.push({ t: 'text', at: v(x0 + Math.min(maxCount, perLine) * pitch + 10, cy), text: num(r.value), size: PG_VALUE, anchor: 'start', font: 'ui' });
    }
    y -= rowH;
  });
  const right = x0 + Math.min(maxCount, perLine) * pitch + (fig.showValues ? valW + 4 : 4);
  // row separators and the line between names and symbols
  for (const t of [...rowTops.slice(1)]) lines2.push({ t: 'seg', a: v(0, t), b: v(right, t), color: 'grid', w: 1, obstacle: false });
  lines2.push({ t: 'seg', a: v(0, 0), b: v(right, 0), color: 'muted', w: 1.2, obstacle: false });
  lines2.push({ t: 'seg', a: v(0, y), b: v(right, y), color: 'muted', w: 1.2, obstacle: false });
  lines2.push({ t: 'seg', a: v(x0 - 7, 0), b: v(x0 - 7, y), color: 'muted', w: 1.2, obstacle: false });

  // legend: one symbol "= 10 tanuló"
  const ul = fig.unitLabel?.trim();
  const legendText = ul === undefined || ul === '' ? `= ${num(fig.unit)}` : ul.startsWith('=') ? ul : `= ${num(fig.unit)} ${ul}`;
  const ly = y - 10 - Math.max(S, PG_LABEL * 1.2) / 2;
  for (const p of symbolPolys(symbol, x0 + S / 2, ly, S)) fills.push({ t: 'poly', pts: p, closed: true, color: 'none', fill: color, fillOpacity: 1, obstacle: false });
  texts.push({ t: 'text', at: v(x0 + S + 6, ly), text: legendText, size: PG_LABEL, anchor: 'start', font: 'ui' });

  return { prims: [...lines2, ...fills, ...texts], fit: { scale: 1 } };
}

// =============================================================================================
// Table
// =============================================================================================

export function layoutTable(fig: TableFigure): LayoutResult {
  const T = 'table';
  if (!Array.isArray(fig.rows) || fig.rows.length === 0) fail(T, "rows must be a non-empty array of rows, e.g. [['Gyakoriság', 1, 4, 7]]");
  const checkRow = (row: unknown, field: string): (string | number)[] => {
    if (!Array.isArray(row)) fail(T, `${field} must be an array of cells`);
    row.forEach((c, j) => {
      if (typeof c === 'number') checkNum(T, `${field}[${j}]`, c);
      else if (typeof c !== 'string') fail(T, `${field}[${j}] must be a string or a number (got ${String(c)})`);
    });
    return row as (string | number)[];
  };
  const header = fig.header === undefined ? undefined : checkRow(fig.header, 'header');
  const body = fig.rows.map((r, i) => checkRow(r, `rows[${i}]`));
  const nCols = (header ?? body[0]).length;
  if (nCols === 0) fail(T, 'rows must have at least one cell');
  if (header && header.length !== body[0].length) fail(T, `header has ${header.length} cells but rows[0] has ${body[0].length}`);
  body.forEach((r, i) => {
    if (r.length !== nCols) fail(T, `rows[${i}] has ${r.length} cells but ${header ? 'the header' : 'rows[0]'} has ${nCols}`);
  });
  const hl = new Set<string>();
  (fig.highlight ?? []).forEach((h, k) => {
    if (!Array.isArray(h) || h.length !== 2 || !h.every((x) => Number.isInteger(x))) fail(T, `highlight[${k}] must be a [row, col] pair of whole numbers`);
    const [r, c] = h;
    if (r < 0 || r >= body.length || c < 0 || c >= nCols) {
      fail(T, `highlight[${k}] = [${r}, ${c}] is outside the table (${body.length} rows × ${nCols} columns, counted from 0, header not counted)`);
    }
    hl.add(`${r},${c}`);
  });

  // all cells as [row][col]; row 0 is the header when there is one
  const grid: { text: string; bold: boolean; head: boolean; hi: boolean; left: boolean }[][] = [];
  if (header) grid.push(header.map((c, j) => ({ text: cellText(c), bold: true, head: true, hi: false, left: !!fig.rowHeaders && j === 0 })));
  body.forEach((r, i) =>
    grid.push(
      r.map((c, j) => {
        const rh = !!fig.rowHeaders && j === 0;
        const hi = hl.has(`${i},${j}`);
        return { text: cellText(c), bold: rh || hi, head: rh, hi, left: rh };
      }),
    ),
  );

  const W = chartWidth(fig.size);
  let size = 14;
  let pad = 9;
  let colW: number[] = [];
  for (const [s, p] of [
    [14, 9],
    [13, 7],
    [12, 5],
  ] as const) {
    size = s;
    pad = p;
    colW = Array.from({ length: nCols }, (_, j) => Math.max(s * 1.9, ...grid.map((row) => textWidth(row[j].text, s) * (row[j].bold ? BOLD : 1) + 2 * p)));
    if (colW.reduce((a, b) => a + b, 0) <= W + 20) break;
  }
  const rowH = Math.round(size * 1.95);
  const xs = [0];
  for (const w of colW) xs.push(xs[xs.length - 1] + w);
  const totalW = xs[xs.length - 1];
  const totalH = grid.length * rowH;

  const fills: Prim[] = [];
  const rules: Prim[] = [];
  const texts: Prim[] = [];
  grid.forEach((row, r) => {
    const yTop = -r * rowH;
    row.forEach((cell, c) => {
      if (cell.hi) fills.push(rect(xs[c], yTop - rowH, xs[c + 1], yTop, 'accent', 0.22));
      else if (cell.head) fills.push(rect(xs[c], yTop - rowH, xs[c + 1], yTop, 'fill'));
      if (cell.text) {
        texts.push({
          t: 'text',
          at: v(cell.left ? xs[c] + pad : (xs[c] + xs[c + 1]) / 2, yTop - rowH / 2),
          text: cell.text,
          size,
          anchor: cell.left ? 'start' : 'middle',
          bold: cell.bold || undefined,
          font: 'ui',
        });
      }
    });
  });
  // inner rules, then the frame
  for (let r = 1; r < grid.length; r++) {
    const strong = !!header && r === 1;
    rules.push({ t: 'seg', a: v(0, -r * rowH), b: v(totalW, -r * rowH), color: strong ? 'axis' : 'muted', w: strong ? 1.5 : 1, obstacle: false });
  }
  for (let c = 1; c < nCols; c++) {
    const strong = !!fig.rowHeaders && c === 1;
    rules.push({ t: 'seg', a: v(xs[c], 0), b: v(xs[c], -totalH), color: strong ? 'axis' : 'muted', w: strong ? 1.5 : 1, obstacle: false });
  }
  const frame: Vec[] = [v(0, 0), v(totalW, 0), v(totalW, -totalH), v(0, -totalH)];
  rules.push({ t: 'poly', pts: frame, closed: true, color: 'axis', w: 1.6, obstacle: false });

  return { prims: [...fills, ...rules, ...texts], fit: { scale: 1 } };
}
