/**
 * Exact arithmetic helpers: integers, fractions and square roots.
 * Generators compute answers with these, so answers are always exact.
 */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

/** Round to `decimals` decimal places (half away from zero), avoiding float noise like 2.675 → 2.67. */
export function round(x: number, decimals = 0): number {
  const f = 10 ** decimals;
  const y = Math.abs(x) * f;
  const r = Math.round(y + 1e-9 * Math.max(1, y));
  return (Math.sign(x) * r) / f;
}

/** Removes float noise: 0.1 + 0.2 → 0.3. Use on results of decimal arithmetic before formatting. */
export function clean(x: number): number {
  return Number.parseFloat(x.toPrecision(12));
}

export function almostEqual(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

export function isPerfectSquare(n: number): boolean {
  if (n < 0 || !Number.isInteger(n)) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** Number of decimal places of a (terminating) decimal, e.g. 2.75 → 2. */
export function decimalPlaces(x: number): number {
  const s = clean(x).toString();
  if (s.includes('e')) return 0;
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

// ---------------------------------------------------------------------------------------------
// Fractions
// ---------------------------------------------------------------------------------------------

/** An exact fraction. Always stored with a positive denominator. */
export interface Frac {
  num: number;
  den: number;
}

/** Create a fraction; it is NOT simplified automatically (use `simplify`). */
export function frac(num: number, den = 1): Frac {
  if (den === 0) throw new Error('frac: zero denominator');
  if (!Number.isInteger(num) || !Number.isInteger(den)) throw new Error(`frac: non-integer ${num}/${den}`);
  return den < 0 ? { num: -num, den: -den } : { num, den };
}

export function simplify(f: Frac): Frac {
  const g = gcd(f.num, f.den) || 1;
  return frac(f.num / g, f.den / g);
}

export function isSimplified(f: Frac): boolean {
  return gcd(f.num, f.den) === 1;
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return simplify(frac(a.num * b.den + b.num * a.den, a.den * b.den));
}

export function fracSub(a: Frac, b: Frac): Frac {
  return simplify(frac(a.num * b.den - b.num * a.den, a.den * b.den));
}

export function fracMul(a: Frac, b: Frac): Frac {
  return simplify(frac(a.num * b.num, a.den * b.den));
}

export function fracDiv(a: Frac, b: Frac): Frac {
  if (b.num === 0) throw new Error('fracDiv: division by zero');
  return simplify(frac(a.num * b.den, a.den * b.num));
}

export function fracEquals(a: Frac, b: Frac): boolean {
  return a.num * b.den === b.num * a.den;
}

/** -1, 0 or 1 */
export function fracCompare(a: Frac, b: Frac): number {
  return Math.sign(a.num * b.den - b.num * a.den);
}

export function fracValue(f: Frac): number {
  return f.num / f.den;
}

/** True if the fraction has a terminating decimal form (denominator only has factors 2 and 5). */
export function isTerminating(f: Frac): boolean {
  let d = simplify(f).den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Converts a terminating decimal like 0.375 to the simplified fraction 3/8. */
export function decimalToFrac(x: number): Frac {
  const places = decimalPlaces(x);
  const den = 10 ** places;
  return simplify(frac(Math.round(x * den), den));
}

/** Splits an improper fraction into a mixed number: 7/4 → { whole: 1, num: 3, den: 4 }. Sign goes on `whole` (or num if whole is 0). */
export function toMixed(f: Frac): { whole: number; num: number; den: number } {
  const s = Math.sign(f.num) || 1;
  const n = Math.abs(f.num);
  const whole = Math.floor(n / f.den);
  const rest = n % f.den;
  if (whole === 0) return { whole: 0, num: s * rest, den: f.den };
  return { whole: s * whole, num: rest, den: f.den };
}

// ---------------------------------------------------------------------------------------------
// Square roots
// ---------------------------------------------------------------------------------------------

/** √n = coef·√radicand with the radicand square-free. √50 → { coef: 5, radicand: 2 }. */
export function simplifyRoot(n: number): { coef: number; radicand: number } {
  if (!Number.isInteger(n) || n < 0) throw new Error(`simplifyRoot: invalid ${n}`);
  if (n === 0) return { coef: 0, radicand: 1 };
  let coef = 1;
  let radicand = n;
  for (let k = 2; k * k <= radicand; k++) {
    while (radicand % (k * k) === 0) {
      radicand /= k * k;
      coef *= k;
    }
  }
  return { coef, radicand };
}

/** True if n has no square factor > 1 (2, 3, 5, 6, 7, 10, …). */
export function isSquareFree(n: number): boolean {
  return simplifyRoot(n).coef === 1;
}

/**
 * Pythagorean triples (a < b < c) with c ≤ 100, primitive ones and their multiples.
 * Handy for generators that need whole-number answers.
 */
export const PYTHAGOREAN_TRIPLES: readonly [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let c = 1; c <= 100; c++) {
    for (let a = 1; a < c; a++) {
      const b2 = c * c - a * a;
      const b = Math.round(Math.sqrt(b2));
      if (b > a && b * b === b2) out.push([a, b, c]);
    }
  }
  return out;
})();

/** Primitive triples only: (3,4,5), (5,12,13), (8,15,17), (7,24,25), … */
export const PRIMITIVE_TRIPLES: readonly [number, number, number][] = PYTHAGOREAN_TRIPLES.filter(
  ([a, b, c]) => gcd(gcd(a, b), c) === 1,
);
