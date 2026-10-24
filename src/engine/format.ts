/**
 * Formatting helpers for Hungarian notation (decimal comma, thousands grouping)
 * and small LaTeX builders for RichText math (`$...$`).
 */
import { clean, round, simplify, toMixed, type Frac } from './math';

/** Narrow no-break space used for thousands grouping (12 500). Converted to `\,` inside math. */
export const THIN_SPACE = ' ';
/** The real minus sign (−). Converted to `-` inside math. */
export const MINUS = '−';

/**
 * Formats a number the Hungarian way: decimal comma, thousands grouped from 5 digits on.
 * Works in plain text and inside `$...$`.
 *
 *   num(0.5) → "0,5"    num(12500) → "12 500"    num(-3) → "−3"    num(2/3, 2) → "0,67"
 *
 * @param decimals round to this many decimal places (trailing zeros are removed unless `fixed`).
 */
export function num(x: number, decimals?: number, fixed = false): string {
  if (!Number.isFinite(x)) throw new Error(`num: not a finite number: ${x}`);
  let v = decimals === undefined ? clean(x) : round(x, decimals);
  if (Object.is(v, -0)) v = 0;
  const neg = v < 0;
  let s = Math.abs(v).toString();
  if (s.includes('e')) s = Math.abs(v).toFixed(decimals ?? 10).replace(/\.?0+$/, '');
  if (fixed && decimals !== undefined) s = Math.abs(v).toFixed(decimals);
  let [intPart, fracPart] = s.split('.');
  if (intPart.length >= 5) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const body = fracPart ? `${intPart},${fracPart}` : intPart;
  return neg ? MINUS + body : body;
}

/**
 * A number with an explicit sign, for building expressions: `x ${signed(-3)}` → "x − 3",
 * `x ${signed(4)}` → "x + 4".
 */
export function signed(x: number, decimals?: number): string {
  return x < 0 ? `${MINUS} ${num(-x, decimals)}` : `+ ${num(x, decimals)}`;
}

/** A negative number in parentheses, for products like 3 · (−2). Positive numbers stay as they are. */
export function paren(x: number, decimals?: number): string {
  return x < 0 ? `(${num(x, decimals)})` : num(x, decimals);
}

/** Wraps LaTeX in `$...$`. */
export function m(latex: string): string {
  return `$${latex}$`;
}

/**
 * Tagged template that keeps backslashes, so you can write LaTeX naturally:
 *   tex`$\sqrt{${n}}$`  instead of  '$\\sqrt{' + n + '}$'
 */
export function tex(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw({ raw: strings }, ...values);
}

/** LaTeX for a fraction: texFrac(3, 4) → "\frac{3}{4}", texFrac(-1, 2) → "-\frac{1}{2}". Integers stay integers when den is 1 and `keepOne` is false. */
export function texFrac(numOrFrac: number | Frac, den?: number, keepOne = false): string {
  const f: Frac = typeof numOrFrac === 'number' ? { num: numOrFrac, den: den ?? 1 } : numOrFrac;
  const n = f.den < 0 ? -f.num : f.num;
  const d = Math.abs(f.den);
  if (d === 1 && !keepOne) return num(n);
  const body = `\\frac{${num(Math.abs(n))}}{${num(d)}}`;
  return n < 0 ? `-${body}` : body;
}

/** LaTeX for a fraction as a mixed number when |f| > 1: 7/4 → "1\frac{3}{4}". The fraction is simplified first. */
export function texMixed(f: Frac): string {
  const s = simplify(f);
  const { whole, num: n, den } = toMixed(s);
  if (whole === 0) return texFrac(n, den);
  if (n === 0) return num(whole);
  return `${num(whole)}\\frac{${num(n)}}{${num(den)}}`;
}

/**
 * LaTeX for (coef·√radicand)/den. texRoot(5, 2) → "5\sqrt{2}", texRoot(1, 3, 2) → "\frac{\sqrt{3}}{2}",
 * texRoot(4, 1) → "4".
 */
export function texRoot(coef: number, radicand: number, den = 1): string {
  let top: string;
  if (radicand === 1) top = num(Math.abs(coef));
  else if (Math.abs(coef) === 1) top = `\\sqrt{${num(radicand)}}`;
  else top = `${num(Math.abs(coef))}\\sqrt{${num(radicand)}}`;
  const sign = coef < 0 ? '-' : '';
  if (den === 1) return sign + top;
  return `${sign}\\frac{${top}}{${num(den)}}`;
}

/** Plain-text root for figure labels: rootText(5, 2) → "5√2", rootText(1, 3) → "√3". */
export function rootText(coef: number, radicand: number): string {
  if (radicand === 1) return num(coef);
  const c = Math.abs(coef) === 1 ? (coef < 0 ? MINUS : '') : num(coef);
  return `${c}√${num(radicand)}`;
}

/** Number with unit for text and figure labels: withUnit(3.5, 'cm') → "3,5 cm". */
export function withUnit(x: number, unit: string, decimals?: number): string {
  return `${num(x, decimals)} ${unit}`;
}

/** Hungarian list joining: ['a', 'b', 'c'] → "a, b és c". */
export function joinHu(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} és ${items[items.length - 1]}`;
}

/**
 * The Hungarian definite article for a number or word: "a" or "az".
 * az 1, az 5, az 50, az 1000 — a 2, a 3, a 10 …  (`az` before a vowel sound).
 */
export function article(next: number | string): 'a' | 'az' {
  if (typeof next === 'string') {
    const t = next.trim();
    if (/^[−-]/.test(t)) return 'a'; // "mínusz …"
    const digits = /^[\d  ]+/.exec(t);
    if (!digits) return /^[aáeéiíoóöőuúüű]/i.test(t) ? 'az' : 'a';
    next = Number(digits[0].replace(/[  ]/g, ''));
  }
  if (next < 0) return 'a'; // "mínusz …"
  const n = Math.trunc(next);
  // spoken Hungarian: egy (1), öt (5), ötven (50–59), ötszáz (500–599), ezer (1000–1999), egymillió ...
  const s = n.toString();
  if (n === 1 || s[0] === '5') return 'az';
  if (s.length === 4 && s[0] === '1') return 'az'; // ezer...
  if (s.length === 7 && s[0] === '1') return 'az'; // egymillió
  return 'a';
}
