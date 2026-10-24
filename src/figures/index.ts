/**
 * Figure library entry point: `layoutFigure(figure)` turns any Figure into a fitted Scene.
 * React rendering: src/figures/FigureView.tsx. Validation: `checkFigure`.
 */
import type { Figure } from './types';
import { fitScene, sceneToSvg, validateScene, type FitOptions, type Prim, type Scene } from './scene';
import { layoutGeometry } from './geometry';
import { layoutCircle, layoutQuadrilateral, layoutRegularPolygon, layoutTriangle } from './shapes';
import { layoutNet, layoutSolid } from './solids';
import { layoutCoordinate, layoutNumberLine } from './coordinate';
import { layoutBarChart, layoutLineChart, layoutPictogram, layoutPieChart, layoutTable } from './charts';
import { layoutBarModel, layoutFractionModel } from './fraction';
import { layoutConstruction } from './construction';

/** What a family layout returns: primitives, plus optional fit options and construction captions. */
export type LayoutResult = Prim[] | { prims: Prim[]; fit?: FitOptions; steps?: string[] };

export interface FigureLayout {
  scene: Scene;
  /** For constructions: the caption of each step (step i ↔ prims with step === i + 1). */
  steps?: string[];
}

type Layouts = { [K in Figure['type']]: (fig: Extract<Figure, { type: K }>) => LayoutResult };

const LAYOUTS: Layouts = {
  geometry: layoutGeometry,
  triangle: layoutTriangle,
  quadrilateral: layoutQuadrilateral,
  regularPolygon: layoutRegularPolygon,
  circle: layoutCircle,
  solid: layoutSolid,
  net: layoutNet,
  coordinate: layoutCoordinate,
  numberLine: layoutNumberLine,
  barChart: layoutBarChart,
  lineChart: layoutLineChart,
  pieChart: layoutPieChart,
  pictogram: layoutPictogram,
  table: layoutTable,
  fractionModel: layoutFractionModel,
  construction: layoutConstruction,
  barModel: layoutBarModel,
};

export function layoutFigure(fig: Figure): FigureLayout {
  const fn = LAYOUTS[fig.type] as (f: Figure) => LayoutResult;
  if (!fn) throw new Error(`Unknown figure type "${(fig as { type: string }).type}"`);
  const res = fn(fig);
  const { prims, fit, steps } = Array.isArray(res) ? { prims: res, fit: undefined, steps: undefined } : res;
  const scene = fitScene(prims, { size: fig.size, notToScale: fig.notToScale, caption: fig.caption, ...fit });
  return { scene, steps };
}

/** Lays out a figure and reports problems (NaN coordinates, elements outside the viewBox, …). */
export function checkFigure(fig: Figure): { errors: string[]; warnings: string[]; svg: string } {
  try {
    const { scene } = layoutFigure(fig);
    const res = validateScene(scene);
    return { ...res, svg: sceneToSvg(scene) };
  } catch (e) {
    return { errors: [`Layout threw: ${(e as Error).message}`], warnings: [], svg: '' };
  }
}

export type { Figure } from './types';
