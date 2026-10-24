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

export type CoordFunction =
  /** y = k·x + n  (n = 0: direct proportionality) */
  | { kind: 'linear'; k: number; n?: number; label?: string; color?: FigColor; dashed?: boolean }
  /** y = k / x  (inverse proportionality), drawn for x ≠ 0 */
  | { kind: 'inverse'; k: number; label?: string; color?: FigColor; dashed?: boolean; positiveOnly?: boolean }
  /** x = c */
  | { kind: 'vertical'; x: number; label?: string; color?: FigColor; dashed?: boolean };

export interface CoordinateFigure extends FigureBase {
  type: 'coordinate';
  /** Visible x range, e.g. [-5, 5]. */
  x: [number, number];
  /** Visible y range. */
  y: [number, number];
  /** Grid lines (default true). */
  grid?: boolean;
  /** Distance between ticks (default 1). */
  step?: number;
  /** Write a number at every n-th tick (default 1; 0 = no numbers). */
  labelEvery?: number;
  /** Axis names, default ['x', 'y']. */
  axisLabels?: [string, string];
  points?: { at: XY; label?: string; showCoords?: boolean; color?: FigColor; hollow?: boolean; labelDir?: Dir; projections?: boolean }[];
  segments?: { from: XY; to: XY; label?: string; dashed?: boolean; color?: FigColor }[];
  polygons?: { points: XY[]; fill?: FigColor | boolean; color?: FigColor; vertexLabels?: string[] }[];
  functions?: CoordFunction[];
  /**
   * Distance between two points with the helper right triangle (Δx and Δy legs, dashed).
   * labels: { dx: '4', dy: '3', d: 'd = 5' } (omit any to hide).
   */
  distances?: { from: XY; to: XY; labels?: { dx?: string; dy?: string; d?: string }; color?: FigColor }[];
}

// ---------------------------------------------------------------------------------------------
// 5. Number line
// ---------------------------------------------------------------------------------------------

export interface NumberLineFigure extends FigureBase {
  type: 'numberLine';
  min: number;
  max: number;
  /** Distance between labelled (major) ticks. */
  step: number;
  /** Minor ticks per major interval (e.g. 4 → quarters). Default 1 (none). */
  subdivisions?: number;
  /** Which ticks get numbers: 'major' (default), 'all', 'ends', 'none', or a list of values. */
  tickLabels?: 'major' | 'all' | 'ends' | 'none' | number[];
  /** Show tick numbers as fractions with this denominator (e.g. 4 → 1/4, 2/4 …) instead of decimals. */
  fractionDenominator?: number;
  points?: { value: number; label?: string; color?: FigColor; open?: boolean; below?: boolean }[];
  /** Intervals; use -Infinity / Infinity for rays. */
  intervals?: { from: number; to: number; fromClosed?: boolean; toClosed?: boolean; color?: FigColor; label?: string }[];
  /** Jump arcs above the line (e.g. +3 steps for addition). */
  jumps?: { from: number; to: number; label?: string; color?: FigColor }[];
}

// ---------------------------------------------------------------------------------------------
// 6. Data and statistics
// ---------------------------------------------------------------------------------------------

export interface ChartSeries {
  name?: string;
  values: number[];
  color?: FigColor;
}

export interface BarChartFigure extends FigureBase {
  type: 'barChart';
  categories: string[];
  series: ChartSeries[];
  yMax?: number;
  yStep?: number;
  xLabel?: string;
  yLabel?: string;
  /** Write the value above each bar. */
  showValues?: boolean;
  horizontal?: boolean;
}

export interface LineChartFigure extends FigureBase {
  type: 'lineChart';
  categories: string[];
  series: ChartSeries[];
  yMin?: number;
  yMax?: number;
  yStep?: number;
  xLabel?: string;
  yLabel?: string;
  showValues?: boolean;
}

export interface PieChartFigure extends FigureBase {
  type: 'pieChart';
  slices: { label: string; value: number; color?: FigColor }[];
  /** What to write on the slices: 'percent' (default), 'value', 'label', 'none'. */
  show?: 'percent' | 'value' | 'label' | 'none';
  /** Legend with the labels (default true). */
  legend?: boolean;
}

export interface PictogramFigure extends FigureBase {
  type: 'pictogram';
  rows: { label: string; value: number }[];
  /** One symbol stands for this many (e.g. 10). Remainders are drawn as partial symbols. */
  unit: number;
  symbol?: 'circle' | 'square' | 'star' | 'person' | 'heart';
  /** Legend text, e.g. '= 10 tanuló'. */
  unitLabel?: string;
}

/** A table, e.g. a frequency table ("gyakorisági táblázat"). */
export interface TableFigure extends FigureBase {
  type: 'table';
  /** Header row. */
  header?: string[];
  rows: string[][];
  /** Treat the first column as row headers (bold). */
  rowHeaders?: boolean;
  /** Cells to highlight, as [row, col] (0-based, header not counted). */
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

export interface ConstructionStep {
  /** What happens in this step (RichText, Hungarian), e.g. 'Körzővel kört rajzolunk A középponttal.' */
  caption: string;
  /** Items added in this step (shown highlighted, earlier steps are shown normally). */
  items: GeoItem[];
}

/** A step-by-step construction. The student taps through the steps. */
export interface ConstructionFigure extends FigureBase {
  type: 'construction';
  points: Record<string, XY>;
  /** Items visible from the start (e.g. the given segment). */
  given?: GeoItem[];
  steps: ConstructionStep[];
  grid?: boolean | number;
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
  | ConstructionFigure;

export type FigureType = Figure['type'];
