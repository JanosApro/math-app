# Task 06 — Figures: constructions, fraction model, bar model + missing gallery sections

Brief: `PROMPT.md` §4a (constructions; fractions for grade 5).

## Already exists
- Finished: `geometry.ts` (general figure, `makeContext`, `geoItemsToPrims`, `gridPrims`),
  `shapes.ts` (triangle, quadrilateral, regularPolygon, circle), `coordinate.ts` (coordinate
  plane, number line). Their galleries are MISSING except `src/dev/gallery/geometry.ts`.
- Types: `ConstructionFigure`, `FractionModelFigure`, `BarModelFigure` (+ BarModelRow/Segment/
  Brace) in `src/figures/types.ts`. Stubs in `construction.ts` and `fraction.ts`
  (`layoutFractionModel`, `layoutBarModel`) throw.
- `FigureView.tsx` already plays constructions: return `{ prims, steps: captions }` with every
  prim tagged `step` (0 = given, i + 1 = construction step i); items of the current step are
  animated.

## Build
- `layoutConstruction`: points + `given` items (step 0) + steps (items with step i + 1, compass
  arcs as 'arc' items, intersections as 'point' items); one viewBox containing all steps.
- `layoutFractionModel`: circle (slices), bar, rect grid (`rows`); shaded parts in `color`
  (default 'accent'); shaded > parts → several wholes side by side; optional label (use the label
  prim's `frac` option for "3/4"-style labels).
- `layoutBarModel`: rows of proportional colored segments with labels, braces for totals
  (see the BarModel types).
- Gallery sections (new files): `shapes.ts` (thin/obtuse triangles, heights outside, squares on
  sides, every quadrilateral shape incl. rhombus by diagonals, right trapezoid, deltoid, n = 3 and
  n = 12 regular polygons, circle options), `coordinate.ts` (ranges −20..20, non-integer step,
  steep/flat lines, inverse proportionality, distance triangles with negative coordinates),
  `numberline.ts` (fractions with denominator 4, negatives, 0,1 steps, open/closed intervals,
  rays, jumps), `construction.ts` (segment bisector, angle bisector, perpendicular, √2 on the
  number line), `fraction.ts` (models + bar models, improper fractions).
- 0 validation errors (`npx tsx scripts/dev/figure-preview.ts <section> <outDir> [--dark]`), look
  at the screenshots, fix what looks wrong in your own files. If a shared file (scene.ts,
  geometry.ts) needs a fix, keep it minimal and re-run every gallery section.
- Document the parameter semantics in `CONTENT_GUIDE.md` (figure section).

## Progress log
- 2026-10-24 (Claude, task 06 agent): read the docs + figure core (types, scene, geometry, shapes,
  coordinate, FigureView, gallery format). Plan: construction.ts → fraction.ts (fractionModel +
  barModel) → gallery sections (construction, fraction, shapes, coordinate, numberline) → visual
  review + fixes in shapes.ts / coordinate.ts (incl. the triangle `squares` label collisions of the
  Pythagoras lesson) → CONTENT_GUIDE / README / HANDOFF.
- construction.ts done: one viewBox for all steps, prims tagged step 0 (given) / i + 1; additive
  types: `intersections` (computed circle/line intersection points, `pick`/`near`), `compass` items
  (arc through given points or full circle), `numberLine` (number line in figure units, for √2).
  Gallery `src/dev/gallery/construction.ts`: segment bisector, angle bisector, perpendicular from a
  point, √2 on the number line, SSS triangle, 60° angle on a grid — 0 errors, steps verified via
  `layoutFigure(...).steps` + per-step item counts.
- fraction.ts done: fractionModel (circle/bar/rect, improper → several wholes, '3/4' and '1 3/4'
  labels stacked) and barModel (proportional rows, colors blue/red/green/…, unknown pieces dashed,
  'a/b' labels stacked inside, too-long labels above, braces with levels, `total` shorthand).
  Gallery `src/dev/gallery/fraction.ts` (20 entries) — 0 errors, light + dark checked.
- scene.ts (shared): `sceneToSvg` now writes `fill-opacity`/`stroke-dasharray` for circles (PNG
  previews showed every filled circle opaque; the React renderer was already right).
