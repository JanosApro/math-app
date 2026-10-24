/**
 * Parsing and checking student answers. Every answer type in `AnswerSpec` is handled here.
 */
import type {
  AnswerSpec,
  CheckResult,
  ExpressionAnswer,
  FractionAnswer,
  NumberAnswer,
  NumbersAnswer,
  RichText,
  RootAnswer,
  StudentAnswer,
} from './types';
import { expressionToTex, parseExpression, polyEquals } from './polynomial';
import { gcd, isSquareFree } from './math';
import { num, texFrac, texMixed, texRoot } from './format';

// ---------------------------------------------------------------------------------------------
// Normalisation and parsing
// ---------------------------------------------------------------------------------------------

/** Unifies minus signs, decimal separators, root signs and spacing. */
export function normalizeInput(raw: string): string {
  return raw
    .replace(/[−–—]/g, '-')
    .replace(/[   ]/g, ' ')
    .replace(/,/g, '.')
    .replace(/[÷:]/g, '/') // 3:4 is not used for fractions in answers, but students may type it
    .replace(/\s*\/\s*/g, '/')
    .replace(/sqrt|gyök/gi, '√')
    .replace(/[*·×]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Removes a trailing unit the student may have typed (e.g. "12 cm", "12cm²", "12 cm2"). */
function stripUnit(s: string, unit?: string): string {
  if (!unit) return s;
  const base = unit.replace(/[²³]/g, '').trim();
  const re = new RegExp(`\\s*${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[²³23]?$`, 'i');
  return s.replace(re, '').trim();
}

const NUMBER_RE = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/** Parses "12", "-3.5", "1 000" (grouped thousands) → number, or null. */
export function parseNumber(raw: string): number | null {
  let s = normalizeInput(raw);
  // "1 000 000" — spaces only allowed as thousands separators
  if (/^[+-]?\d{1,3}( \d{3})+(\.\d+)?$/.test(s)) s = s.replace(/ /g, '');
  s = s.replace(/^([+-]) /, '$1');
  if (!NUMBER_RE.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

export interface ParsedFraction {
  num: number;
  den: number;
  /** written as a mixed number, e.g. "1 3/4" */
  mixed: boolean;
  /** written as a decimal, e.g. "0.75" */
  decimal: boolean;
}

/** Parses "3/4", "-3/4", "1 3/4", "-1 3/4", "5", and "0.75" (as an exact decimal). */
export function parseFraction(raw: string): ParsedFraction | null {
  const s = normalizeInput(raw).replace(/^([+-]) /, '$1');
  let m = /^([+-]?)(\d+) (\d+)\/(\d+)$/.exec(s);
  if (m) {
    const sign = m[1] === '-' ? -1 : 1;
    const whole = Number(m[2]);
    const n = Number(m[3]);
    const d = Number(m[4]);
    if (d === 0) return null;
    return { num: sign * (whole * d + n), den: d, mixed: true, decimal: false };
  }
  m = /^([+-]?)(\d+)\/([+-]?)(\d+)$/.exec(s);
  if (m) {
    const sign = (m[1] === '-' ? -1 : 1) * (m[3] === '-' ? -1 : 1);
    const d = Number(m[4]);
    if (d === 0) return null;
    return { num: sign * Number(m[2]), den: d, mixed: false, decimal: false };
  }
  if (/^[+-]?\d+$/.test(s)) return { num: Number(s), den: 1, mixed: false, decimal: false };
  if (NUMBER_RE.test(s)) {
    const [i, f = ''] = s.replace(/^[+-]/, '').split('.');
    const den = 10 ** f.length;
    const n = Number(i || '0') * den + Number(f || '0');
    return { num: (s.startsWith('-') ? -1 : 1) * n, den, mixed: false, decimal: true };
  }
  return null;
}

export interface ParsedRoot {
  /** value = sign · coefNum/coefDen · √radicand / den */
  coefNum: number;
  coefDen: number;
  radicand: number;
  den: number;
  hasRoot: boolean;
}

/**
 * Parses root expressions: "5√2", "-5√2", "√50", "√(50)", "√3/2", "3√5/5", "7", "4/3".
 * A decimal like "7.07" is returned as null (handled separately with `acceptDecimal`).
 */
export function parseRoot(raw: string): ParsedRoot | null {
  const s = normalizeInput(raw).replace(/ /g, '');
  const m = /^([+-]?)(\d*)(?:√\(?(\d+)\)?)?(?:\/(\d+))?$/.exec(s);
  if (!m) return null;
  const [, signStr, coefStr, radStr, denStr] = m;
  if (!coefStr && !radStr) return null;
  const sign = signStr === '-' ? -1 : 1;
  const coef = coefStr ? Number(coefStr) : 1;
  const radicand = radStr ? Number(radStr) : 1;
  const den = denStr ? Number(denStr) : 1;
  if (den === 0) return null;
  return { coefNum: sign * coef, coefDen: 1, radicand, den, hasRoot: !!radStr };
}

// ---------------------------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------------------------

function tolerance(spec: NumberAnswer): number {
  if (spec.tolerance !== undefined) return spec.tolerance;
  if (spec.precision !== undefined) return 0.5 * 10 ** -spec.precision + 1e-9;
  return 1e-9 * Math.max(1, Math.abs(spec.value));
}

function checkNumber(spec: NumberAnswer, text: string): CheckResult {
  const s = stripUnit(normalizeInput(text), spec.unit);
  const v = parseNumber(s);
  if (v !== null) return { correct: Math.abs(v - spec.value) <= tolerance(spec) };
  if (spec.acceptFraction) {
    const f = parseFraction(s);
    if (f) return { correct: Math.abs(f.num / f.den - spec.value) <= tolerance(spec) };
  }
  return { correct: false, parseError: true };
}

function checkFraction(spec: FractionAnswer, text: string): CheckResult {
  const f = parseFraction(stripUnit(normalizeInput(text), spec.unit));
  if (!f) return { correct: false, parseError: true };
  const equal = f.num * spec.den === spec.num * f.den;
  if (!equal) return { correct: false };
  if (f.decimal) {
    // An exact decimal is fine when allowed, or when the answer is a whole number ("2.0").
    return spec.acceptDecimal || spec.den === 1 || spec.num % spec.den === 0
      ? { correct: true }
      : { correct: false, almost: 'wrongForm' };
  }
  const requireSimplified = spec.requireSimplified ?? true;
  if (requireSimplified && gcd(f.num, f.den) !== 1) return { correct: false, almost: 'notSimplified' };
  const form = spec.form ?? 'any';
  const improper = Math.abs(f.num) > f.den && f.den !== 1;
  if (form === 'mixed' && improper && !f.mixed) return { correct: false, almost: 'wrongForm' };
  if (form === 'improper' && f.mixed) return { correct: false, almost: 'wrongForm' };
  return { correct: true };
}

function checkRoot(spec: RootAnswer, text: string): CheckResult {
  const s = stripUnit(normalizeInput(text), spec.unit);
  const den = spec.den ?? 1;
  const p = parseRoot(s);
  if (!p) {
    if (spec.acceptDecimal !== undefined) {
      const v = parseNumber(s);
      if (v !== null) {
        const target = (spec.coef * Math.sqrt(spec.radicand)) / den;
        return { correct: Math.abs(v - target) <= 0.5 * 10 ** -spec.acceptDecimal + 1e-9 };
      }
    }
    return { correct: false, parseError: true };
  }
  // Compare sign and squares exactly: (cN/cD)²·r/d² vs coef²·R/den²
  const signStudent = Math.sign(p.coefNum);
  const signSpec = Math.sign(spec.coef);
  const lhsNum = p.coefNum * p.coefNum * p.radicand;
  const lhsDen = p.coefDen * p.coefDen * p.den * p.den;
  const rhsNum = spec.coef * spec.coef * spec.radicand;
  const rhsDen = den * den;
  const equal = signStudent === signSpec && lhsNum * rhsDen === rhsNum * lhsDen;
  if (!equal) {
    // A decimal-looking integer (e.g. "7") might still be a decimal approximation.
    if (spec.acceptDecimal !== undefined && !p.hasRoot && p.den === 1) {
      const target = (spec.coef * Math.sqrt(spec.radicand)) / den;
      if (Math.abs(p.coefNum - target) <= 0.5 * 10 ** -spec.acceptDecimal + 1e-9) return { correct: true };
    }
    return { correct: false };
  }
  const requireSimplified = spec.requireSimplified ?? true;
  if (requireSimplified) {
    const rootOk = !p.hasRoot || isSquareFree(p.radicand);
    const radicandOne = p.hasRoot && p.radicand === 1; // "√1" or "5√1"
    const fracOk = gcd(p.coefNum, p.den) === 1;
    const perfect = p.hasRoot && Math.round(Math.sqrt(p.radicand)) ** 2 === p.radicand; // √49 instead of 7
    if (!rootOk || !fracOk || radicandOne || perfect) return { correct: false, almost: 'notSimplified' };
  }
  return { correct: true };
}

function checkNumbers(spec: NumbersAnswer, texts: string[]): CheckResult {
  if (texts.length !== spec.fields.length) return { correct: false, parseError: true };
  let allCorrect = true;
  for (let i = 0; i < spec.fields.length; i++) {
    const f = spec.fields[i];
    const r = checkNumber({ type: 'number', value: f.value, precision: f.precision, unit: f.unit }, texts[i]);
    if (r.parseError) return { correct: false, parseError: true };
    if (!r.correct) allCorrect = false;
  }
  return { correct: allCorrect };
}

function checkExpression(spec: ExpressionAnswer, text: string): CheckResult {
  const student = parseExpression(text);
  if (!student) return { correct: false, parseError: true };
  const expected = parseExpression(spec.value);
  if (!expected) throw new Error(`ExpressionAnswer: cannot parse expected value "${spec.value}"`);
  if (!polyEquals(student.poly, expected.poly)) return { correct: false };
  const form = spec.form ?? 'expanded';
  if (form === 'expanded' && !student.expandedForm) return { correct: false, almost: 'notSimplified' };
  if (form === 'factored' && !student.factoredForm) return { correct: false, almost: 'wrongForm' };
  return { correct: true };
}

/** Letters offered on the keypad for an expression answer. */
export function expressionVars(spec: ExpressionAnswer): string[] {
  return spec.vars ?? [...new Set(spec.value.match(/[a-zA-Zπ]/g) ?? [])].sort();
}

/** Checks a student's answer against the spec. Pure function, safe to call anywhere. */
export function checkAnswer(spec: AnswerSpec, answer: StudentAnswer): CheckResult {
  switch (spec.type) {
    case 'number':
      return answer.type === 'text' ? checkNumber(spec, answer.text) : { correct: false };
    case 'numbers':
      return answer.type === 'fields' ? checkNumbers(spec, answer.texts) : { correct: false };
    case 'expression':
      return answer.type === 'text' ? checkExpression(spec, answer.text) : { correct: false };
    case 'fraction':
      return answer.type === 'text' ? checkFraction(spec, answer.text) : { correct: false };
    case 'root':
      return answer.type === 'text' ? checkRoot(spec, answer.text) : { correct: false };
    case 'choice':
      return { correct: answer.type === 'choice' && answer.index === spec.correct };
    case 'truefalse':
      return { correct: answer.type === 'truefalse' && answer.value === spec.value };
    case 'order':
      return {
        correct:
          answer.type === 'order' &&
          answer.order.length === spec.items.length &&
          answer.order.every((itemIndex, pos) => itemIndex === pos || spec.items[itemIndex] === spec.items[pos]),
      };
    case 'match':
      return {
        correct:
          answer.type === 'match' &&
          answer.rightForLeft.length === spec.pairs.length &&
          answer.rightForLeft.every((r, l) => r === l || spec.pairs[r][1] === spec.pairs[l][1]),
      };
  }
}

/** True if the answer type is typed in (with the keypad) rather than picked. */
export function isTextAnswer(spec: AnswerSpec): spec is NumberAnswer | FractionAnswer | RootAnswer | ExpressionAnswer {
  return spec.type === 'number' || spec.type === 'fraction' || spec.type === 'root' || spec.type === 'expression';
}

/** A number as the student would type it: "-3.5" style is fine for the checker. */
const plainNumber = (v: number, precision?: number) => {
  const x = precision !== undefined ? Number(v.toFixed(precision)) : v;
  return num(x).replace(/\u2212/g, '-').replace(/\u202f/g, '');
};

/**
 * The canonical correct answer as a string the student could type with the keypad.
 * Used by the stress test ("does the answer pass its own checker?") and by the dev preview.
 */
export function canonicalInput(spec: AnswerSpec): StudentAnswer {
  switch (spec.type) {
    case 'number':
      return { type: 'text', text: plainNumber(spec.value, spec.precision) };
    case 'numbers':
      return { type: 'fields', texts: spec.fields.map((f) => plainNumber(f.value, f.precision)) };
    case 'expression':
      return { type: 'text', text: spec.value };
    case 'fraction': {
      const g = gcd(spec.num, spec.den) || 1;
      const n = spec.num / g;
      const d = spec.den / g;
      if (d === 1) return { type: 'text', text: String(n) };
      if (spec.form === 'mixed' && Math.abs(n) > d) {
        const whole = Math.trunc(n / d);
        return { type: 'text', text: `${whole} ${Math.abs(n % d)}/${d}` };
      }
      return { type: 'text', text: `${n}/${d}` };
    }
    case 'root': {
      const den = spec.den ?? 1;
      const g = gcd(spec.coef, den) || 1;
      const c = spec.coef / g;
      const d = den / g;
      const sign = c < 0 ? '-' : '';
      const ac = Math.abs(c);
      let body: string;
      if (spec.radicand === 1) body = String(ac);
      else body = `${ac === 1 ? '' : ac}√${spec.radicand}`;
      return { type: 'text', text: `${sign}${body}${d === 1 ? '' : `/${d}`}` };
    }
    case 'choice':
      return { type: 'choice', index: spec.correct };
    case 'truefalse':
      return { type: 'truefalse', value: spec.value };
    case 'order':
      return { type: 'order', order: spec.items.map((_, i) => i) };
    case 'match':
      return { type: 'match', rightForLeft: spec.pairs.map((_, i) => i) };
  }
}

/** The correct answer as RichText, for "A helyes válasz: …". */
export function formatAnswer(spec: AnswerSpec): RichText {
  const unit = (u?: string) => (u ? ` ${u}` : '');
  switch (spec.type) {
    case 'number':
      return `$${num(spec.value, spec.precision, spec.precision !== undefined)}$${unit(spec.unit)}`;
    case 'numbers':
      return spec.fields
        .map((f) => `${f.label ? `${f.label} ` : ''}$${num(f.value, f.precision, f.precision !== undefined)}$${f.unit ? (/^[°′″]$/.test(f.unit) ? f.unit : ` ${f.unit}`) : ''}`)
        .join(', ');
    case 'expression':
      return `$${expressionToTex(spec.value)}$`;
    case 'fraction': {
      const g = gcd(spec.num, spec.den) || 1;
      const f = { num: spec.num / g, den: spec.den / g };
      const showMixed = spec.form === 'mixed' && Math.abs(f.num) > f.den;
      return `$${showMixed ? texMixed(f) : texFrac(f)}$${unit(spec.unit)}`;
    }
    case 'root':
      return `$${texRoot(spec.coef, spec.radicand, spec.den ?? 1)}$${unit(spec.unit)}`;
    case 'choice':
      return spec.options[spec.correct];
    case 'truefalse':
      return spec.value ? 'Igaz' : 'Hamis';
    case 'order':
      return spec.items.join(' → ');
    case 'match':
      return spec.pairs.map(([l, r]) => `${l} – ${r}`).join('\n');
  }
}

/** Display order for choice options: shuffled deterministically unless shuffle is false. */
export function choiceOrder(optionCount: number, shuffle: boolean, seed: number): number[] {
  const order = Array.from({ length: optionCount }, (_, i) => i);
  if (!shuffle) return order;
  let s = seed >>> 0 || 1;
  for (let i = order.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
