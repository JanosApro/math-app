/**
 * Shared helpers of the 3D figures: input validation, a tiny 3D vector kit, fill opacities.
 * Used by solids.ts (the 'solid' figure) and solids-net.ts (the 'net' figure).
 *
 * Engine file — content authors never need to touch this.
 */
import { v, type Vec } from './scene';

// ---------------------------------------------------------------------------------------------
// Validation (same style as shapes.ts: `<figure>: <field> …` errors)
// ---------------------------------------------------------------------------------------------

export function fail(type: string, msg: string): never {
  throw new Error(`${type}: ${msg}`);
}

export function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

/** A required positive number. */
export function pos(type: string, field: string, x: unknown): number {
  if (x === undefined) fail(type, `"${field}" is required`);
  if (!isNum(x) || x <= 0) fail(type, `"${field}" must be a positive number (got ${JSON.stringify(x)})`);
  return x;
}

/** A required whole number in [min, max]. */
export function wholeIn(type: string, field: string, x: unknown, min: number, max: number): number {
  if (x === undefined) fail(type, `"${field}" is required (a whole number from ${min} to ${max})`);
  if (!isNum(x) || !Number.isInteger(x) || x < min || x > max)
    fail(type, `"${field}" must be a whole number from ${min} to ${max} (got ${JSON.stringify(x)})`);
  return x;
}

/** Validates a `labels` object: only the allowed keys, string values. */
export function checkLabelObject<K extends string>(type: string, labels: unknown, allowed: readonly K[], what: string): Partial<Record<K, string>> {
  if (labels === undefined) return {};
  if (labels === null || typeof labels !== 'object' || Array.isArray(labels)) fail(type, '"labels" must be an object, e.g. { a: \'a = 4 cm\' }');
  const out: Partial<Record<K, string>> = {};
  for (const [k, val] of Object.entries(labels as Record<string, unknown>)) {
    if (!allowed.includes(k as K)) fail(type, `"labels.${k}": unknown key — ${what} has ${allowed.map((x) => `'${x}'`).join(', ')}`);
    if (val === undefined) continue;
    if (typeof val !== 'string') fail(type, `"labels.${k}" must be a string (got ${JSON.stringify(val)})`);
    out[k as K] = val;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 3D vectors: x to the right, y = depth (away from the viewer), z up
// ---------------------------------------------------------------------------------------------

export interface P3 {
  x: number;
  y: number;
  z: number;
}

export const p3 = (x: number, y: number, z: number): P3 => ({ x, y, z });
export const add3 = (a: P3, b: P3): P3 => p3(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub3 = (a: P3, b: P3): P3 => p3(a.x - b.x, a.y - b.y, a.z - b.z);
export const mul3 = (a: P3, k: number): P3 => p3(a.x * k, a.y * k, a.z * k);
export const dot3 = (a: P3, b: P3): number => a.x * b.x + a.y * b.y + a.z * b.z;
export const len3 = (a: P3): number => Math.hypot(a.x, a.y, a.z);
export const mid3 = (a: P3, b: P3): P3 => p3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);

/** Newell normal of a planar polygon (counterclockwise seen from outside → outward normal). */
export function newell(pts: P3[]): P3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    x += (a.y - b.y) * (a.z + b.z);
    y += (a.z - b.z) * (a.x + b.x);
    z += (a.x - b.x) * (a.y + b.y);
  }
  return p3(x, y, z);
}

// ---------------------------------------------------------------------------------------------
// Drawing constants
// ---------------------------------------------------------------------------------------------

/**
 * Fill opacities of the 'accent' tint ("tinted glass", like the grade 8 textbook): top base
 * strongest, bottom base medium (seen through the lateral faces), visible lateral faces pale.
 */
export const ALPHA = { top: 0.34, bottom: 0.2, side: 0.09, sphere: 0.12, triangle: 0.22, netBase: 0.32, netSide: 0.1 };

/** Line widths in screen units. */
export const WIDTH = { edge: 2, hidden: 1.4, aux: 1.6, hi: 3, fold: 1.2 };

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Points of an elliptic arc from parameter angle `from` to `to` (degrees, either direction). */
export function ellipsePts(c: Vec, rx: number, ry: number, from: number, to: number, perTurn = 96): Vec[] {
  const steps = Math.max(4, Math.ceil((perTurn * Math.abs(to - from)) / 360));
  const out: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    out.push(v(c.x + rx * Math.cos(t), c.y + ry * Math.sin(t)));
  }
  return out;
}
