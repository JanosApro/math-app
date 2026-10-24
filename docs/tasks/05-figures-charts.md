# Task 05 — Figures: bar chart, line chart, pie chart, pictogram, table

Brief: `PROMPT.md` §4a ("Data and statistics").

## Already exists
- Types in `src/figures/types.ts`: `BarChartFigure`, `LineChartFigure`, `PieChartFigure`,
  `PictogramFigure`, `TableFigure` (doc comments = spec).
- `src/figures/scene.ts`: primitives incl. `text` (exact position, anchor, rotate, font 'ui' |
  'math'), `poly` with fill, `arc` with `sector`, `label`; `clipPolygonX` (partial pictogram
  symbols), `textWidth`. Charts may return `{ prims, fit: { scale: 1 } }` and lay out in
  screen-like units (y up).
- `src/figures/coordinate.ts` is finished (coordinate plane, number line) — reuse its axis/tick
  style for charts.
- `src/figures/charts.ts`: stubs that throw.

## Build
- `src/figures/charts.ts`: `layoutBarChart`, `layoutLineChart`, `layoutPieChart`,
  `layoutPictogram`, `layoutTable`.
- Gallery `src/dev/gallery/charts.ts`: 12 months, long category names, several series, zero
  values, 12 500-size values, pie with a 2 % slice and many slices, pictogram with partial symbols,
  frequency table with highlights.

## Requirements
- Decimal comma everywhere (`num()` from `src/engine/format.ts`). Font 'ui' for category/axis text.
- Axes with tick values, light horizontal grid lines, series colors 's1'…'s8' (or the given
  FigColor), legend when > 1 series, long names abbreviated/rotated/wrapped so nothing overlaps at
  ~300 units width, `showValues` above bars/points.
- Pie: percentages (rounded, decimal comma) on/near slices; tiny slices labelled outside with a
  leader line; legend.
- Pictogram: label column + rows of symbols; partial last symbol via clipping; legend
  "● = 10 …" (`unitLabel`).
- Table: bordered cells, bold header with light fill, `rowHeaders`, highlighted cells in accent
  tint, column widths from `textWidth`.
- Invalid params (series length ≠ categories, negative pie values, yMax ≤ 0 …) → clear Error.
- 0 validation errors in the gallery; good at phone width and in dark mode (`--dark`).

## Progress log
- 2026-10-24 — started (Claude Code agent). Read the spec, types.ts (charts section), scene.ts,
  coordinate.ts, format.ts, the gallery format and the preview script. Plan: `charts.ts` (entry +
  bar/line), `charts-common.ts` (validation, nice axis, legend, wrapping, symbols),
  `charts-pie.ts`, `charts-table.ts` (pictogram + table); gallery `src/dev/gallery/charts.ts`.
