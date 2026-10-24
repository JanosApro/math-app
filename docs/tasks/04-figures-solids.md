# Task 04 — Figures: 3D solids and nets

Brief: `PROMPT.md` §4a. Style: `docs/materials-grade-8.md` (how the textbook draws solids).

## Already exists
- Types in `src/figures/types.ts`: `SolidFigure` (cube, cuboid, prism, pyramid, cylinder, cone,
  sphere), `SolidSegment`, `SolidTriangle`, `NetFigure` — the doc comments there are the spec.
- `src/figures/scene.ts`: world primitives (`Prim`, y up: seg, poly, circle, ellipse with partial
  `from`/`to`, arc, dot, label, rightAngle, angleArc, ticks…) → `fitScene` (scaling, label
  placement, markers). Vector helpers exported.
- `src/figures/geometry.ts` (2D layout; reuse for nets), `src/figures/shapes.ts` (finished 2D
  shapes — good reference for style and validation errors).
- `src/figures/solids.ts`: stubs `layoutSolid`, `layoutNet` that throw.
- Preview: `npx tsx scripts/dev/figure-preview.ts solids <outDir> [--dark]`.

## Build
- `src/figures/solids.ts` (split helpers into `solids-*.ts` if long).
- Galleries `src/dev/gallery/solids.ts`, `src/dev/gallery/nets.ts` with edge cases: flat and tall
  cylinders, tiny radius, r = 1200, long labels, every SolidSegment and SolidTriangle at least
  once, prisms/pyramids with n = 3, 4, 5, 6, 8, rectangle-base pyramid.

## Requirements
- One projection for polyhedra: oblique cabinet — verticals vertical, width horizontal, depth
  up-right at 45° shortened to 1/2. Round solids: flat ellipse bases (ry ≈ 0.3·r); sphere = circle
  + equator ellipse (back half dashed).
- Hidden edges dashed, visible solid, computed properly (back-face test for convex solids, any n).
  Cylinder/cone: back half of the base ellipse dashed, silhouette lines tangent to the ellipse.
- `fill` (default true): light 'accent' tint; top base strongest, bottom medium, sides pale
  (fillOpacity per face, painter's order); hidden edges drawn on top of fills.
- Labels by SolidSegment key; labelling a key also draws it (radius, dashed height axis with a
  right-angle marker at the base center, slant height, space/face diagonal, apothem, lateral edge,
  diameter). `highlight` = 'highlight' color, thicker. `triangle` fills + outlines the right
  triangle in 'highlight' with a right-angle marker (geometrically exact — used for Pythagoras in 3D).
- Notation used by the app (from the grade-8 textbook conventions): r radius, H height of the
  solid, a base edge, s slant height — but labels are free text from content.
- `vertexLabels: true`: cuboid A–D bottom (counterclockwise from front-left), E–H top; pyramid
  base A, B, C… and apex V (or a custom list).
- Nets: cube (cross), cuboid, triangular prism, square pyramid, cylinder (rectangle width 2rπ —
  true proportions — plus two circles), cone (sector with radius s and angle 360·r/s + base circle).
  Base faces tinted differently when `colorFaces` (default true).
- True proportions; `notToScale` only adds the note. Theme color names only (no hex).
- Invalid params (non-positive sizes, missing fields, n < 3) → clear English Error naming the field.
- Every gallery entry: 0 validation errors; looks good at ~300 units wide and in dark mode.
- Document the exact parameter semantics in `CONTENT_GUIDE.md` (figure section).
