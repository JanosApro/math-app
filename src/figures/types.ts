/**
 * Figure library — the data types.
 *
 * A figure is a plain object: `{ type: '...', ...parameters }`. The library does the layout,
 * scaling, label placement and 3D projection. Content never writes SVG by hand.
 *
 * Browse every figure type with many examples at /dev → "Ábragaléria" (npm run dev, then
 * open http://localhost:5173/#/dev/gallery).
 *
 * Conventions
 * - Coordinates are mathematical: x to the right, y UP. Units are arbitrary ("cm"); the figure
 *   is scaled to fit, keeping true proportions.
 * - Labels are plain text (not LaTeX): use Unicode, e.g. 'α', 'β', 'γ', '√2', 'r = 3 cm',
 *   'm', 'cm²', 'π'. Use num() from the kit to format numbers with a decimal comma.
 * - If a figure does not follow the numbers of the exercise, set `notToScale: true`
 *   ("nem méretarányos" is shown under it).
 */

// ---------------------------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------------------------

/**
 * Theme-aware colors (they adapt to dark mode).
 * - 'ink'        normal lines and text (default)
 * - 'accent'     the topic's color — use for the thing the question is about
 * - 'highlight'  strong orange/red — the unknown or the key segment
 * - 'muted'      grey — construction lines, background objects
 * - 'good'/'bad' green/red
 * - 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' — fixed named colors
 */
export type FigColor =
  | 'ink'
  | 'accent'
  | 'highlight'
  | 'muted'
  | 'good'
  | 'bad'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'teal';

/** A label direction: compass word (y is up, so 'n' is above) or an angle in degrees (0 = right, 90 = up). */
export type Dir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | number;

export type XY = [number, number];

/** Options every figure accepts. */
export interface FigureBase {
  /** Show "nem méretarányos" under the figure. Use when the figure does not follow the numbers. */
  notToScale?: boolean;
  /** Short caption under the figure (plain text). */
  caption?: string;
  /** Overall size. 'medium' (default) fits a phone screen nicely. */
  size?: 'small' | 'medium' | 'large';
  /** Screen-reader description (Hungarian). A generic one is used if omitted. */
  alt?: string;
}

// ---------------------------------------------------------------------------------------------
// 1. General 2D geometry (points, segments, polygons, circles, angles, markers)
// ---------------------------------------------------------------------------------------------

/** Name of a point in the figure's `points`, or literal coordinates. */
export type PointRef = string | XY;

export type LineWidth = 'thin' | 'normal' | 'thick';

export type GeoItem =
  /** A point with a dot and its name as label (unless label: false). */
  | { kind: 'point'; at: PointRef; label?: string | false; labelDir?: Dir; color?: FigColor; dot?: boolean }
  /**
   * A segment. `label` is written next to its midpoint, on the outer side when the segment
   * is a polygon side (or on `labelSide`). `ticks` draws equal-length marks (1–3).
   */
  | {
      kind: 'segment';
      from: PointRef;
      to: PointRef;
      label?: string;
      labelSide?: 'left' | 'right';
      dashed?: boolean;
      color?: FigColor;
      width?: LineWidth;
      ticks?: 1 | 2 | 3;
      arrow?: 'end' | 'both';
    }
  /** A ray from `from` through `through`, drawn to the edge of the figure. */
  | { kind: 'ray'; from: PointRef; through: PointRef; label?: string; dashed?: boolean; color?: FigColor }
  /** A full line through two points, drawn across the figure. `label` is placed near one end. */
  | { kind: 'line'; through: [PointRef, PointRef]; label?: string; dashed?: boolean; color?: FigColor }
  /**
   * A polygon. Vertex names are drawn outside the polygon automatically (vertexLabels: false hides
   * them). `sideLabels[i]` labels the side points[i] → points[i+1] on its outer side.
   */
  | {
      kind: 'polygon';
      points: PointRef[];
      fill?: FigColor | boolean;
      color?: FigColor;
      dashed?: boolean;
      width?: LineWidth;
      vertexLabels?: boolean;
      sideLabels?: (string | null)[];
      ticks?: (0 | 1 | 2 | 3)[];
    }
  /** A circle given by its radius or by a point on it. */
  | {
      kind: 'circle';
      center: PointRef;
      radius: number | PointRef;
      fill?: FigColor | boolean;
      color?: FigColor;
      dashed?: boolean;
      /** Draw a dot at the center (default true). The center's label comes from a 'point' item. */
      centerDot?: boolean;
    }
  /** An arc (e.g. a compass arc). Angles in degrees, counterclockwise from the +x direction. */
  | { kind: 'arc'; center: PointRef; radius: number; from: number; to: number; color?: FigColor; dashed?: boolean; label?: string }
  /** A filled circular sector ("körcikk"). */
  | { kind: 'sector'; center: PointRef; radius: number; from: number; to: number; fill?: FigColor; color?: FigColor; label?: string }
  /**
   * An angle marker at `vertex` between the rays vertex→from and vertex→to (the one smaller
   * than 180°, unless `reflex`). `right: true` draws the square right-angle marker instead of
   * an arc. `arcs: 2` draws a double arc (to show equal angles).
   */
  | {
      kind: 'angle';
      vertex: PointRef;
      from: PointRef;
      to: PointRef;
      label?: string;
      arcs?: 1 | 2 | 3;
      right?: boolean;
      fill?: boolean;
      color?: FigColor;
      reflex?: boolean;
    }
  /** Parallel-line marks (small arrowheads) on the middle of a segment. */
  | { kind: 'parallel'; from: PointRef; to: PointRef; count?: 1 | 2 }
  /**
   * The altitude (height) from `from` perpendicular to the line through `base`. Drawn dashed
   * with a right-angle marker at the foot. If the foot is outside the base segment the base
   * line is extended dashed. `footLabel` names the foot point (e.g. 'T').
   */
  | { kind: 'height'; from: PointRef; base: [PointRef, PointRef]; label?: string; footLabel?: string; color?: FigColor }
  /**
   * A square drawn outward on the segment from→to (for the Pythagorean theorem).
   * `side: 'left'` puts it on the left when walking from → to (default 'right').
   */
  | { kind: 'squareOnSide'; from: PointRef; to: PointRef; side?: 'left' | 'right'; fill?: FigColor; label?: string; grid?: boolean }
  /** A free text label. */
  | { kind: 'label'; at: PointRef; text: string; dir?: Dir; color?: FigColor; size?: 'small' | 'normal' | 'large' }
  /** A shaded region without outline (e.g. the part of an area to highlight). */
  | { kind: 'region'; points: PointRef[]; fill: FigColor; hatch?: boolean };

export interface GeometryFigure extends FigureBase {
  type: 'geometry';
  /** Named points, e.g. { A: [0, 0], B: [4, 0], C: [0, 3] }. */
  points?: Record<string, XY>;
  /** Drawn in order (later items on top). */
  items: GeoItem[];
  /** Light unit-square grid behind the figure (true = step 1, or a number for the step). */
  grid?: boolean | number;
}

// ---------------------------------------------------------------------------------------------
// 2. Ready-made 2D shapes (built on top of 'geometry')
// ---------------------------------------------------------------------------------------------

/** Vertex name of a triangle. */
export type TriVertex = 'A' | 'B' | 'C';
export type TriSide = 'a' | 'b' | 'c';

/**
 * A triangle ABC with the Hungarian conventions: a = BC, b = CA, c = AB; α at A, β at B, γ at C.
 * Give exactly one of `sides`, `legs` or `coords`.
 */
export interface TriangleFigure extends FigureBase {
  type: 'triangle';
  /** Side lengths [a, b, c]. Drawn with c (AB) horizontal at the bottom. */
  sides?: [number, number, number];
  /**
   * Right triangle with legs [a, b] (right angle at C). By default C is bottom-left, CA is
   * horizontal (length b) and CB vertical (length a); `pose: 'hypotenuse'` puts AB at the bottom.
   */
  legs?: [number, number];
  pose?: 'legs' | 'hypotenuse';
  /** Explicit coordinates of A, B, C. */
  coords?: [XY, XY, XY];
  /** Vertex names (default ['A', 'B', 'C']); use '' to hide one. */
  vertices?: [string, string, string];
  /** Side labels, e.g. { a: '3 cm', b: '4 cm', c: 'c = ?' }. */
  sideLabels?: Partial<Record<TriSide, string>>;
  /** Angle markers with labels, e.g. { A: 'α', B: 'β' }. Use '' for an arc without label. */
  angleLabels?: Partial<Record<TriVertex, string>>;
  /** Right-angle marker (automatic when `legs` is used). */
  rightAngleAt?: TriVertex;
  /** Altitudes, e.g. [{ from: 'C', label: 'm' }]. */
  heights?: { from: TriVertex; label?: string; footLabel?: string }[];
  /** Medians ("súlyvonal"), e.g. [{ from: 'A', label: 'sₐ' }]. */
  medians?: { from: TriVertex; label?: string }[];
  /** Equal-length tick marks per side, e.g. { a: 1, b: 1 } for an isosceles triangle. */
  ticks?: Partial<Record<TriSide, 1 | 2 | 3>>;
  /** Sides drawn in the highlight color (e.g. the unknown side). */
  highlight?: TriSide[];
  fill?: boolean | FigColor;
  /** Squares on the sides (Pythagorean theorem), with optional area labels like 'c²'. */
  squares?: boolean | Partial<Record<TriSide, string>>;
}

/** Vertices are A, B, C, D counterclockwise from bottom-left; sides a = AB, b = BC, c = CD, d = DA. */
export interface QuadrilateralFigure extends FigureBase {
  type: 'quadrilateral';
  shape: 'square' | 'rectangle' | 'rhombus' | 'parallelogram' | 'trapezoid' | 'deltoid';
  /** square: a. rectangle: a (width), b (height). parallelogram: a, b, angle. */
  a?: number;
  b?: number;
  /** Angle at A in degrees (rhombus, parallelogram). */
  angle?: number;
  /** Rhombus / deltoid by diagonals: e = AC, f = BD. */
  e?: number;
  f?: number;
  /** Trapezoid: bases a (bottom) and c (top), height m, and `shift` = horizontal offset of D from A
   *  (default: isosceles). `shift: 0` gives a right trapezoid. */
  c?: number;
  m?: number;
  shift?: number;
  /** Deltoid: distance of the diagonal crossing from A along AC (default e/3). */
  split?: number;
  vertices?: [string, string, string, string];
  sideLabels?: Partial<Record<'a' | 'b' | 'c' | 'd', string>>;
  angleLabels?: Partial<Record<'A' | 'B' | 'C' | 'D', string>>;
  /** Draw the diagonals (dashed). Labels e.g. { e: 'e', f: 'f' }; `true` = no labels. */
  diagonals?: boolean | { e?: string; f?: string };
  /** Draw a height from D (or C) to the base AB, with a label, e.g. { label: 'm' }. */
  height?: { label?: string; from?: 'C' | 'D' };
  ticks?: Partial<Record<'a' | 'b' | 'c' | 'd', 1 | 2 | 3>>;
  highlight?: ('a' | 'b' | 'c' | 'd' | 'e' | 'f')[];
  /** Highlight a sub-triangle by vertex names; 'O' is the diagonals' intersection, 'T' the height's foot. */
  highlightTriangle?: [string, string, string];
  fill?: boolean | FigColor;
}

export interface RegularPolygonFigure extends FigureBase {
  type: 'regularPolygon';
  /** Number of sides, 3–12. */
  n: number;
  /** Side length (only matters for proportions of labels). Default 1. */
  side?: number;
  vertices?: string[] | false;
  sideLabel?: string;
  /** Center O with circumradius / apothem / central angle markers. */
  center?: boolean;
  radius?: string | boolean;
  apothem?: string | boolean;
  centralAngle?: string | boolean;
  /** 'all' diagonals, or 'fromOne' (from vertex A only). */
  diagonals?: 'all' | 'fromOne';
  fill?: boolean | FigColor;
}

export interface CircleFigure extends FigureBase {
  type: 'circle';
  r: number;
  /** Center label (default 'O'); '' hides it. */
  centerLabel?: string;
  radius?: string | boolean;
  diameter?: string | boolean;
  /** A chord with central angle in degrees, optional label. */
  chord?: { angle: number; label?: string };
  /** Shaded sector with central angle in degrees, e.g. { angle: 60, label: '60°' }. */
  sector?: { angle: number; label?: string; arcLabel?: string };
  /** A tangent line at the given angle position (degrees on the circle). */
  tangent?: { at: number; label?: string };
  fill?: boolean | FigColor;
}

// ---------------------------------------------------------------------------------------------
// 3. 3D solids (consistent oblique projection, hidden edges dashed)
// ---------------------------------------------------------------------------------------------

/**
 * Keys of the segments a solid can show/label:
 * - 'a', 'b', 'c'     base edges / cuboid edges (length, depth, height)
 * - 'h'               height of a prism/cylinder (the side edge) or of a pyramid/cone (the axis, dashed inside)
 * - 'r', 'd'          radius / diameter of the base (cylinder, cone, sphere)
 * - 's'               slant height: cone generator ("alkotó") or pyramid face height ("oldallap magassága")
 * - 'edge'            pyramid lateral edge ("oldalél")
 * - 'spaceDiagonal'   cube/cuboid space diagonal ("testátló")
 * - 'faceDiagonal'    diagonal of the base face ("lapátló" / "alaplap átlója")
 * - 'baseDiagonal'    same as faceDiagonal, for pyramids/prisms with square/rect base
 * - 'apothem'         for pyramids: from base center to the midpoint of a base edge
 */
export type SolidSegment =
  | 'a'
  | 'b'
  | 'c'
  | 'h'
  | 'r'
  | 'd'
  | 's'
  | 'edge'
  | 'spaceDiagonal'
  | 'faceDiagonal'
  | 'baseDiagonal'
  | 'apothem';

/**
 * Right triangles inside a solid that can be highlighted (filled, right-angle marked):
 * - 'axial'      cone: r, h, s  |  pyramid: apothem, h, s (face height)
 * - 'edge'       pyramid: half base diagonal, h, lateral edge
 * - 'diagonal'   cuboid/cube: base diagonal, c, space diagonal
 * - 'face'       cuboid/cube/prism: a, b and the base diagonal
 */
export type SolidTriangle = 'axial' | 'edge' | 'diagonal' | 'face';

interface SolidBase extends FigureBase {
  type: 'solid';
  /**
   * Segment labels, e.g. { r: 'r = 3 cm', h: 'h = 7 cm' }. Labelling a segment also draws it
   * (e.g. 'r' draws the radius, 'spaceDiagonal' draws the diagonal).
   */
  labels?: Partial<Record<SolidSegment, string>>;
  /** Extra segments to draw without a label. */
  show?: SolidSegment[];
  /** Segments to draw in the highlight color. */
  highlight?: SolidSegment[];
  /** A right triangle to highlight inside the solid. */
  triangle?: SolidTriangle;
  /** Vertex names (cuboid: A–H, pyramid apex: as given). false hides them (default). */
  vertexLabels?: boolean | string[];
  /** Fill the faces lightly in the topic color (default true). */
  fill?: boolean;
}

export type SolidFigure =
  | (SolidBase & { shape: 'cube'; a: number })
  | (SolidBase & { shape: 'cuboid'; a: number; b: number; c: number })
  | (SolidBase & {
      shape: 'prism';
      /** 'regular' uses `n` sides. */
      base: 'triangle' | 'square' | 'rectangle' | 'hexagon' | 'regular';
      n?: number;
      a: number;
      /** second base edge for 'rectangle' */
      b?: number;
      h: number;
    })
  | (SolidBase & {
      shape: 'pyramid';
      base: 'triangle' | 'square' | 'rectangle' | 'hexagon' | 'regular';
      n?: number;
      a: number;
      b?: number;
      h: number;
    })
  | (SolidBase & { shape: 'cylinder'; r: number; h: number })
  | (SolidBase & { shape: 'cone'; r: number; h: number })
  | (SolidBase & { shape: 'sphere'; r: number });

/** The net ("hálózat") of a solid, laid out flat. */
export interface NetFigure extends FigureBase {
  type: 'net';
  of: 'cube' | 'cuboid' | 'triangularPrism' | 'squarePyramid' | 'cylinder' | 'cone';
  /** Sizes: cube a; cuboid a, b, c; triangularPrism a (equilateral base), h; squarePyramid a, s (face height); cylinder r, h; cone r, s. */
  a?: number;
  b?: number;
  c?: number;
  h?: number;
  r?: number;
  s?: number;
  /** Edge labels by key ('a', 'b', 'c', 'h', 'r', 's'). */
  labels?: Partial<Record<'a' | 'b' | 'c' | 'h' | 'r' | 's', string>>;
  /** Color the base faces differently from the lateral faces (default true). */
  colorFaces?: boolean;
}

// ---------------------------------------------------------------------------------------------
// 4. Coordinate plane
// ---------------------------------------------------------------------------------------------

/**
 * A graph on the coordinate plane. Every graph is clipped to the visible x/y range.
 * `label` is written next to the graph (e.g. 'y = 2x + 1', 'f', 'y = 6/x'); color default 'accent'.
 */
export type CoordFunction =
  /** y = k·x + n  (n = 0, the default: direct proportionality, the line goes through the origin) */
  | { kind: 'linear'; k: number; n?: number; label?: string; color?: FigColor; dashed?: boolean }
  /**
   * y = k / x  (inverse proportionality, k ≠ 0): both branches of the hyperbola, never drawn
   * across the asymptote x = 0. `positiveOnly: true` draws only the x > 0 branch (real-life
   * quantities such as speed and time).
   */
  | { kind: 'inverse'; k: number; label?: string; color?: FigColor; dashed?: boolean; positiveOnly?: boolean }
  /** The vertical line x = c (given as `x`). */
  | { kind: 'vertical'; x: number; label?: string; color?: FigColor; dashed?: boolean };

/**
 * Coordinate plane with EQUAL unit length on both axes (true proportions, so distances are
 * correct). Axes with arrowheads at the positive ends, named x and y; ticks at every `step`;
 * numbers with decimal comma; a single 0 at the origin. Everything must lie inside the visible
 * range (otherwise the layout throws an error naming the item).
 *
 *   { type: 'coordinate', x: [-1, 6], y: [-1, 5],
 *     points: [{ at: [2, 3], label: 'A', showCoords: true, projections: true }] }
 */
export interface CoordinateFigure extends FigureBase {
  type: 'coordinate';
  /**
   * Visible x range [min, max], e.g. [-5, 5] (min < max). The range is always widened to include
   * 0, so the origin and both axes are visible (e.g. [2, 8] is drawn as [0, 8]).
   */
  x: [number, number];
  /** Visible y range [min, max] (min < max); widened to include 0 like `x`. */
  y: [number, number];
  /** Light grid lines at every tick (default true). Thinned automatically if they would be denser than ~7 px. */
  grid?: boolean;
  /** Distance between ticks on both axes (default 1; may be 0.5, 2, 5 …; must be > 0). */
  step?: number;
  /**
   * Write a number at every n-th tick, counted from 0 (default 1; 0 = no numbers). This is a
   * minimum: numbers are thinned automatically (×2, ×5, ×10 …) if they would overlap.
   */
  labelEvery?: number;
  /** Axis names, default ['x', 'y']. */
  axisLabels?: [string, string];
  /** Label at the origin, default '0' (use 'O' for the point O, '' to hide). Hidden if labelEvery is 0 and not given. */
  originLabel?: string;
  /**
   * Points (filled dots; `hollow: true` = empty circle).
   * - label: the name, e.g. 'A'. With `showCoords: true` the coordinates are appended: 'A(2; −3)'
   *   (or just '(2; −3)' without a label).
   * - color: default 'ink'. labelDir: preferred label side (default: away from the axes).
   * - projections: dashed lines from the point to both axes (to read off the coordinates).
   */
  points?: { at: XY; label?: string; showCoords?: boolean; color?: FigColor; hollow?: boolean; labelDir?: Dir; projections?: boolean }[];
  /** Segments (no end dots — add the endpoints to `points` to show/name them). Color default 'ink'. */
  segments?: { from: XY; to: XY; label?: string; dashed?: boolean; color?: FigColor }[];
  /**
   * Polygons. fill: true = light 'accent' fill, or a color. vertexLabels: names for the vertices in
   * order (e.g. ['A', 'B', 'C']), drawn outside the polygon with a dot; omit for no names.
   */
  polygons?: { points: XY[]; fill?: FigColor | boolean; color?: FigColor; vertexLabels?: string[] }[];
  /** Graphs of functions, see CoordFunction. */
  functions?: CoordFunction[];
  /**
   * Distance between two points with the helper right triangle: dashed Δx and Δy legs (accent),
   * right-angle marker, the segment itself highlighted (color, default 'highlight').
   * labels: { dx: '4', dy: '3', d: 'd = 5' } — each one is optional; omitted ones are not written.
   * The endpoints get small dots unless they are also listed in `points`.
   */
  distances?: { from: XY; to: XY; labels?: { dx?: string; dy?: string; d?: string }; color?: FigColor }[];
}

// ---------------------------------------------------------------------------------------------
// 5. Number line
// ---------------------------------------------------------------------------------------------

/**
 * A horizontal number line with an arrow at the right end, ticks and numbers below it.
 *
 *   { type: 'numberLine', min: -5, max: 5, step: 1, points: [{ value: -3, label: 'A' }] }
 *   { type: 'numberLine', min: 0, max: 2, step: 1, subdivisions: 4, tickLabels: 'all', fractionDenominator: 4 }
 */
export interface NumberLineFigure extends FigureBase {
  type: 'numberLine';
  /** Left end of the visible part (min < max). */
  min: number;
  /** Right end of the visible part. */
  max: number;
  /** Distance between major ticks (> 0). Major ticks sit at the multiples of `step` (0, ±step, …). */
  step: number;
  /** Minor ticks per major interval, e.g. 4 → quarters, 10 → tenths (default 1 = no minor ticks). Minor ticks are shorter. */
  subdivisions?: number;
  /**
   * Which ticks get numbers: 'major' (default), 'all' (minor ticks too), 'ends' (only the first
   * and last major tick), 'none', or a list of values (a major tick is drawn at each).
   * Numbers that would overlap are thinned automatically (except for an explicit list).
   */
  tickLabels?: 'major' | 'all' | 'ends' | 'none' | number[];
  /**
   * Write tick numbers as stacked fractions with this denominator, NOT simplified: with 4 the
   * ticks read 1/4, 2/4, 3/4, 1, 5/4 … (whole numbers are written as integers). Values that are
   * not multiples of 1/den fall back to decimals.
   */
  fractionDenominator?: number;
  /**
   * Points: a dot on the line (`open: true` = hollow circle) with its label above
   * (`below: true` puts it under the numbers). Color default 'accent'. Value must be in [min, max].
   */
  points?: { value: number; label?: string; color?: FigColor; open?: boolean; below?: boolean }[];
  /**
   * Intervals as thick bars just above the line: filled end dot = closed end (default),
   * hollow = open end (`fromClosed`/`toClosed: false`). Use -Infinity / Infinity for rays
   * (drawn with an arrow). Finite ends must be inside [min, max], from < to. Several intervals are
   * stacked. Default colors: accent, highlight, green, purple. `label` is written above the bar.
   */
  intervals?: { from: number; to: number; fromClosed?: boolean; toClosed?: boolean; color?: FigColor; label?: string }[];
  /**
   * Jump arcs above the line with an arrowhead at `to` (addition/subtraction as steps).
   * label default: the signed difference ('+3', '−2'); '' hides it. Color default 'highlight'.
   */
  jumps?: { from: number; to: number; label?: string; color?: FigColor }[];
}

// ---------------------------------------------------------------------------------------------
// 6. Data and statistics
// ---------------------------------------------------------------------------------------------

/**
 * One data series of a bar/line chart. `values[i]` belongs to `categories[i]` (same length).
 * `name` is shown in the legend (a legend appears when there are 2+ series).
 * Default colors: series 1, 2, 3 … get the chart palette colors in order.
 */
export interface ChartSeries {
  name?: string;
  values: number[];
  color?: FigColor;
}

/**
 * Bar chart ("oszlopdiagram"): one bar per category and series, value axis with grid lines.
 * Long category names are wrapped onto two lines, or turned vertical if there is no room
 * (for 12 months prefer short names: 'jan.', 'febr.' … or 'I.'–'XII.').
 *
 *   { type: 'barChart', categories: ['H', 'K', 'Sze'], series: [{ values: [3, 5, 2] }], yLabel: 'tanulók száma' }
 */
export interface BarChartFigure extends FigureBase {
  type: 'barChart';
  categories: string[];
  series: ChartSeries[];
  /** Bottom of the value axis. Default 0 (or a rounded value below the smallest negative value). */
  yMin?: number;
  /** Top of the value axis. Default: the largest value rounded up to a "nice" number. All values must be ≤ yMax. */
  yMax?: number;
  /** Distance between value-axis numbers / grid lines (> 0). Default: automatic (4–6 lines). */
  yStep?: number;
  /** Title of the category axis, written centered under the category names. */
  xLabel?: string;
  /** Title of the value axis (e.g. 'tanulók száma' or 'db'), written above the value axis. */
  yLabel?: string;
  /** Write the value above each bar (decimal comma). */
  showValues?: boolean;
  /** Horizontal bars, category names on the left (good for long names). */
  horizontal?: boolean;
}

/**
 * Line chart ("vonaldiagram"): one dot per category, joined by lines; several series allowed.
 * Same axis rules as the bar chart. yMin default: 0 (or a rounded value below the smallest
 * negative value) — set it (e.g. 15) to zoom in on values far from 0.
 */
export interface LineChartFigure extends FigureBase {
  type: 'lineChart';
  categories: string[];
  series: ChartSeries[];
  yMin?: number;
  yMax?: number;
  yStep?: number;
  xLabel?: string;
  yLabel?: string;
  /** Write the value above each dot. */
  showValues?: boolean;
}

/**
 * Pie chart ("kördiagram"), slices clockwise from 12 o'clock in the given order. Values ≥ 0 (any
 * unit — percentages are computed from the total). Small slices get their text outside with a
 * leader line. Default slice colors: the chart palette in order.
 */
export interface PieChartFigure extends FigureBase {
  type: 'pieChart';
  slices: { label: string; value: number; color?: FigColor }[];
  /**
   * What to write on the slices: 'percent' (default; rounded to 1 decimal, e.g. '12,5%'),
   * 'value' (the given value), 'label' (the slice name), 'none'.
   */
  show?: 'percent' | 'value' | 'label' | 'none';
  /** Legend with the slice names (default true, except with show: 'label'). */
  legend?: boolean;
}

/**
 * Pictogram ("képdiagram"): a row of symbols per category; one symbol = `unit` pieces. A remainder
 * is drawn as a partial (cut) symbol, e.g. 25 with unit 10 → 2½ symbols. Legend under it.
 */
export interface PictogramFigure extends FigureBase {
  type: 'pictogram';
  /** One row per category: name and value (≥ 0). */
  rows: { label: string; value: number }[];
  /** One symbol stands for this many (e.g. 10). Must be > 0. At most 40 symbols per row. */
  unit: number;
  /** Symbol shape, default 'circle'. */
  symbol?: 'circle' | 'square' | 'star' | 'person' | 'heart';
  /**
   * Legend text after the symbol. A text starting with '=' is used as is ('= 10 tanuló'); otherwise
   * '= <unit> ' is put in front ('tanuló' → '= 10 tanuló'). Default '= <unit>'.
   */
  unitLabel?: string;
  /** Symbol color (default 'accent'). */
  color?: FigColor;
  /** Write the value at the end of each row (default false — reading it off is often the task). */
  showValues?: boolean;
}

/**
 * A table, e.g. a frequency table ("gyakorisági táblázat"). Column widths fit the text. Numbers
 * may be given as numbers: they are written with a decimal comma (0.5 → '0,5').
 *
 *   { type: 'table', header: ['Jegy', '1', '2', '3', '4', '5'], rows: [['Gyakoriság', 1, 4, 7, 9, 5]], rowHeaders: true }
 */
export interface TableFigure extends FigureBase {
  type: 'table';
  /** Header row (bold, light background). Same number of cells as each row. */
  header?: (string | number)[];
  /** The body rows; every row must have the same number of cells. */
  rows: (string | number)[][];
  /** Treat the first column as row headers (bold, light background, left-aligned). */
  rowHeaders?: boolean;
  /** Cells to highlight (accent tint, bold), as [row, col] (0-based, header row not counted). */
  highlight?: [number, number][];
}

// ---------------------------------------------------------------------------------------------
// 7. Fractions
// ---------------------------------------------------------------------------------------------

/** A shape cut into equal parts, some shaded: "3/4 of a pizza". */
export interface FractionModelFigure extends FigureBase {
  type: 'fractionModel';
  shape: 'circle' | 'bar' | 'rect';
  /** Number of equal parts in one whole. */
  parts: number;
  /** Number of shaded parts (may exceed `parts` for improper fractions: extra wholes are drawn). */
  shaded: number;
  /** For 'rect': rows of the grid (parts must be divisible by rows). */
  rows?: number;
  color?: FigColor;
  /** Label under the model, e.g. '3/4'. */
  label?: string;
}

// ---------------------------------------------------------------------------------------------
// 8. Constructions (compass and straightedge, step by step)
// ---------------------------------------------------------------------------------------------

/**
 * A compass arc (constructions only): the circle around `center` with the given radius, drawn
 * as an arc that covers the `through` points (plus `extend` degrees at both ends), or as a full
 * circle when `through` is omitted. Grey ('muted') like a pencil line unless `color` is given.
 *
 *   { kind: 'compass', center: 'A', through: ['P', 'Q'] }      // arc around A through P and Q
 *   { kind: 'compass', center: 'B', radius: 'A' }               // full circle around B through A
 *   { kind: 'compass', center: 'O', radius: 2, through: ['X'] } // short arc of radius 2 across ray OX
 */
export interface CompassArc {
  kind: 'compass';
  center: PointRef;
  /**
   * A number, or a point the circle passes through (radius = its distance from `center`).
   * Default: the distance from `center` to `through[0]`.
   */
  radius?: number | PointRef;
  /**
   * Points (or directions) the arc must cover: the arc spans the directions center → point, the
   * shortest way round, so ['P', 'Q'] above and below draws the arc between them.
   */
  through?: PointRef[];
  /** Extra degrees added at both ends (default 15; with a single `through` point: ±15°). */
  extend?: number;
  color?: FigColor;
  dashed?: boolean;
}

/** Anything a construction step can draw: every geometry item, plus compass arcs. */
export type ConstructionItem = GeoItem | CompassArc;

/** A circle for intersections: [center, radius] — radius is a number or a point on the circle. */
export type ConstructionCircle = [PointRef, number | PointRef];

/**
 * A point computed by the construction (so authors never compute intersections by hand).
 * Where there are two intersections, `pick` chooses one: 'above' (default; larger y), 'below',
 * 'left', 'right' — or `near`: the one closer to that point.
 *
 *   P: { circles: [['A', 3], ['B', 3]] }                    // upper intersection of two circles
 *   Q: { circles: [['A', 3], ['B', 3]], pick: 'below' }
 *   M: { lines: [['A', 'B'], ['P', 'Q']] }                  // intersection of lines AB and PQ
 *   X: { circle: ['O', 2], line: ['O', 'K'], near: 'K' }   // where the circle crosses ray OK
 */
export type ConstructionPoint = (
  | { circles: [ConstructionCircle, ConstructionCircle] }
  | { lines: [[PointRef, PointRef], [PointRef, PointRef]] }
  | { circle: ConstructionCircle; line: [PointRef, PointRef] }
) & { pick?: 'above' | 'below' | 'left' | 'right'; near?: PointRef };

export interface ConstructionStep {
  /** What happens in this step (RichText, Hungarian), e.g. 'Körzővel kört rajzolunk A középponttal.' */
  caption: string;
  /** Items added in this step (animated when the step is shown; earlier steps stay visible). */
  items: ConstructionItem[];
}

/**
 * A step-by-step compass-and-straightedge construction. The student taps through the steps;
 * the figure is scaled once so that every step fits (nothing jumps between steps).
 *
 *   { type: 'construction',
 *     points: { A: [0, 0], B: [5, 0] },
 *     intersections: { P: { circles: [['A', 3.5], ['B', 3.5]] }, Q: { circles: [['A', 3.5], ['B', 3.5]], pick: 'below' } },
 *     given: [{ kind: 'segment', from: 'A', to: 'B' }, { kind: 'point', at: 'A' }, { kind: 'point', at: 'B' }],
 *     steps: [
 *       { caption: 'Körzővel ívet rajzolunk $A$ körül…', items: [{ kind: 'compass', center: 'A', through: ['P', 'Q'] }] },
 *       { caption: '…ugyanakkora sugárral $B$ körül is.', items: [{ kind: 'compass', center: 'B', through: ['P', 'Q'] }] },
 *       { caption: 'Az ívek metszéspontjai $P$ és $Q$.', items: [{ kind: 'point', at: 'P' }, { kind: 'point', at: 'Q' }] },
 *       { caption: 'A $PQ$ egyenes a felezőmerőleges.', items: [{ kind: 'line', through: ['P', 'Q'], label: 'f', color: 'accent' }] },
 *     ] }
 */
export interface ConstructionFigure extends FigureBase {
  type: 'construction';
  /** Named points with coordinates (the given ones and any you want to place yourself). */
  points: Record<string, XY>;
  /**
   * Named points computed from earlier ones (intersections of circles and lines), evaluated in
   * order, so later entries may use earlier ones. Usable everywhere a point name is.
   */
  intersections?: Record<string, ConstructionPoint>;
  /** Items visible from the start (e.g. the given segment or angle). */
  given?: ConstructionItem[];
  steps: ConstructionStep[];
  grid?: boolean | number;
  /**
   * A number line along the x axis (y = 0) in the same units as the points, drawn as given:
   * ticks at every `step` (default 1) from `min` to `max`, numbers under them, arrow at the right.
   * For constructions like √2 on the number line.
   */
  numberLine?: { min: number; max: number; step?: number };
}

// ---------------------------------------------------------------------------------------------
// 9. Bar model ("szalagmodell") for word problems, like the coloured bars of the grade 5 book
// ---------------------------------------------------------------------------------------------

/** One piece of a bar. Its width is `value` on a scale shared by all rows (true proportions). */
export interface BarModelSegment {
  /** Size of the piece (> 0). */
  value: number;
  /** Text inside the piece, e.g. 'a', '350', 'x'. Too long for the piece → written above it. */
  label?: string;
  /** Fill color. Default by position in the row: blue, red, green, orange, purple, teal. */
  color?: FigColor;
  /** The unknown piece: dashed outline, light fill, label defaults to '?'. */
  unknown?: boolean;
}

export interface BarModelRow {
  /** Name written left of the bar, e.g. 'Anna', 'a', '1. nap'. */
  label?: string;
  /** Pieces from left to right. Every row starts at the same left edge. */
  segments: BarModelSegment[];
}

/** A curly brace along a bar, with a label (a total, a part, a difference). */
export interface BarModelBrace {
  /** Row index (0 = top bar). Default: the last row for 'below', the first row for 'above'. */
  row?: number;
  /** Segments covered, [first, last] indices in that row (inclusive). Default: the whole row. */
  segments?: [number, number];
  /** Or an explicit span on the value scale, e.g. [30, 50] (overrides `segments`). It may
   *  reach past the row's end, e.g. the difference to a longer row. */
  span?: [number, number];
  label: string;
  /** 'below' (default) or 'above' the bar. */
  side?: 'above' | 'below';
  color?: FigColor;
}

/**
 * Bar model / tape diagram: horizontal bars made of coloured pieces, braces for totals and
 * parts. E.g. "a + b = 120": rows: [{ segments: [{ value: 70, label: 'a' }, { value: 50, label: 'b' }] }],
 * total: { label: '120' }.
 */
export interface BarModelFigure extends FigureBase {
  type: 'barModel';
  rows: BarModelRow[];
  /** Shorthand for a brace under a whole row (default: the last row). */
  total?: { label: string; row?: number; side?: 'above' | 'below' };
  braces?: BarModelBrace[];
}

// ---------------------------------------------------------------------------------------------

export type Figure =
  | GeometryFigure
  | TriangleFigure
  | QuadrilateralFigure
  | RegularPolygonFigure
  | CircleFigure
  | SolidFigure
  | NetFigure
  | CoordinateFigure
  | NumberLineFigure
  | BarChartFigure
  | LineChartFigure
  | PieChartFigure
  | PictogramFigure
  | TableFigure
  | FractionModelFigure
  | ConstructionFigure
  | BarModelFigure;

export type FigureType = Figure['type'];
