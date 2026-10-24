/**
 * A tiny polynomial algebra used to check algebraic-expression answers exactly:
 * the student's input and the expected answer are both expanded into a canonical
 * polynomial with rational coefficients and compared.
 *
 * Supported input: numbers (decimal comma or dot), single-letter variables and π, + − · * /,
 * implicit multiplication (3x, 2ab, 3(x+1), (x+1)(x−1)), powers with ^ or ² ³,
 * parentheses. Division only by a number.
 */
import { gcd } from './math';

/** A rational number as [num, den] with den > 0. */
type Q = [number, number];

const qNorm = (n: number, d: number): Q => {
  if (d === 0) throw new Error('division by zero');
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};
const qAdd = (a: Q, b: Q): Q => qNorm(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const qMul = (a: Q, b: Q): Q => qNorm(a[0] * b[0], a[1] * b[1]);
const qFromDecimal = (s: string): Q => {
  const [i, f = ''] = s.split('.');
  return qNorm(Number(i || '0') * 10 ** f.length + Number(f || '0'), 10 ** f.length);
};

/** Monomial key: variables with exponents in alphabetical order, e.g. "a^2b" → "a2b1"; constant → "". */
export type Poly = Map<string, Q>;

const monoKey = (exps: Record<string, number>): string =>
  Object.keys(exps)
    .filter((k) => exps[k] !== 0)
    .sort()
    .map((k) => `${k}${exps[k]}`)
    .join('');

const parseKey = (key: string): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const m of key.matchAll(/([a-zA-Zπ])(\d+)/g)) out[m[1]] = Number(m[2]);
  return out;
};

const polyConst = (q: Q): Poly => new Map(q[0] === 0 ? [] : [['', q]]);
const polyVar = (x: string): Poly => new Map([[`${x}1`, [1, 1] as Q]]);

function polyAdd(a: Poly, b: Poly, sign = 1): Poly {
  const out: Poly = new Map(a);
  for (const [k, q] of b) {
    const prev = out.get(k) ?? ([0, 1] as Q);
    const sum = qAdd(prev, [sign * q[0], q[1]]);
    if (sum[0] === 0) out.delete(k);
    else out.set(k, sum);
  }
  return out;
}

function polyMul(a: Poly, b: Poly): Poly {
  let out: Poly = new Map();
  for (const [ka, qa] of a) {
    for (const [kb, qb] of b) {
      const ea = parseKey(ka);
      const eb = parseKey(kb);
      for (const [x, e] of Object.entries(eb)) ea[x] = (ea[x] ?? 0) + e;
      out = polyAdd(out, new Map([[monoKey(ea), qMul(qa, qb)]]));
    }
  }
  return out;
}

export function polyEquals(a: Poly, b: Poly): boolean {
  if (a.size !== b.size) return false;
  for (const [k, q] of a) {
    const r = b.get(k);
    if (!r || r[0] !== q[0] || r[1] !== q[1]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// Tokenizer and parser
// ---------------------------------------------------------------------------------------------

type Tok = { t: 'num'; v: string } | { t: 'var'; v: string } | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' | '(' | ')' };

export function normalizeExpression(raw: string): string {
  return raw
    .replace(/[−–]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/:/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

function tokenize(s: string): Tok[] | null {
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\d|\./.test(ch)) {
      const m = /^(\d+(\.\d+)?|\.\d+)/.exec(s.slice(i));
      if (!m) return null;
      toks.push({ t: 'num', v: m[0] });
      i += m[0].length;
    } else if (/[a-zA-Zπ]/.test(ch)) {
      toks.push({ t: 'var', v: ch });
      i++;
    } else if ('+-*/^()'.includes(ch)) {
      toks.push({ t: 'op', v: ch as '+' });
      i++;
    } else return null;
  }
  return toks;
}

export interface ParsedExpression {
  poly: Poly;
  hasParens: boolean;
  /** True if written in expanded, simplified form (see ExpressionAnswer.form). */
  expandedForm: boolean;
  /** True if it is a single product containing a parenthesised factor with coprime integer coefficients. */
  factoredForm: boolean;
}

/** Parses an expression; returns null if it cannot be understood. */
export function parseExpression(raw: string): ParsedExpression | null {
  const s = normalizeExpression(raw);
  if (!s) return null;
  const toks = tokenize(s);
  if (!toks) return null;
  let pos = 0;
  const peek = () => toks[pos];
  const isOp = (tok: Tok | undefined, v: string) => !!tok && tok.t === 'op' && tok.v === v;

  // Form tracking for the top level
  interface TermInfo {
    nums: number;
    vars: Record<string, number>;
    hasParens: boolean;
    hasDiv: boolean;
  }
  const topTerms: { info: TermInfo; poly: Poly }[] = [];
  let depth = 0;

  const parseExpr = (): Poly => {
    let result: Poly = new Map();
    let sign = 1;
    if (isOp(peek(), '+')) pos++;
    else if (isOp(peek(), '-')) {
      pos++;
      sign = -1;
    }
    for (;;) {
      const info: TermInfo = { nums: 0, vars: {}, hasParens: false, hasDiv: false };
      const term = parseTerm(info);
      if (depth === 0) topTerms.push({ info, poly: term });
      result = polyAdd(result, term, sign);
      if (isOp(peek(), '+')) {
        pos++;
        sign = 1;
      } else if (isOp(peek(), '-')) {
        pos++;
        sign = -1;
      } else break;
    }
    return result;
  };

  const parseTerm = (info: TermInfo): Poly => {
    let result = parsePower(info);
    for (;;) {
      const tok = peek();
      if (isOp(tok, '*')) {
        pos++;
        result = polyMul(result, parsePower(info));
      } else if (isOp(tok, '/')) {
        pos++;
        info.hasDiv = true;
        const divisor = parsePower(info);
        if (divisor.size !== 1 || !divisor.has('')) throw new Error('division by non-constant');
        const q = divisor.get('')!;
        result = polyMul(result, polyConst(qNorm(q[1], q[0])));
      } else if (tok && (tok.t === 'var' || isOp(tok, '('))) {
        result = polyMul(result, parsePower(info));
      } else break;
    }
    return result;
  };

  const parsePower = (info: TermInfo): Poly => {
    const base = parseAtom(info);
    if (isOp(peek(), '^')) {
      pos++;
      const e = peek();
      if (!e || e.t !== 'num' || e.v.includes('.')) throw new Error('bad exponent');
      pos++;
      const n = Number(e.v);
      if (n > 12) throw new Error('exponent too large');
      let out: Poly = polyConst([1, 1]);
      for (let i = 0; i < n; i++) out = polyMul(out, base.poly);
      return out;
    }
    return base.poly;
  };

  const parseAtom = (info: TermInfo): { poly: Poly } => {
    const tok = peek();
    if (!tok) throw new Error('unexpected end');
    if (tok.t === 'num') {
      pos++;
      if (depth === 0) info.nums++;
      return { poly: polyConst(qFromDecimal(tok.v)) };
    }
    if (tok.t === 'var') {
      pos++;
      if (depth === 0) info.vars[tok.v] = (info.vars[tok.v] ?? 0) + 1;
      return { poly: polyVar(tok.v) };
    }
    if (isOp(tok, '(')) {
      pos++;
      depth++;
      info.hasParens = true;
      const inner = parseExpr();
      depth--;
      if (!isOp(peek(), ')')) throw new Error('missing )');
      pos++;
      return { poly: inner };
    }
    if (isOp(tok, '-')) {
      pos++;
      const a = parseAtom(info);
      return { poly: polyMul(polyConst([-1, 1]), a.poly) };
    }
    throw new Error('unexpected token');
  };

  let poly: Poly;
  try {
    // The top-level parse records terms only while depth === 0, so nested expressions
    // (inside parentheses) do not add top-level terms.
    poly = parseExpr();
    if (pos !== toks.length) return null;
  } catch {
    return null;
  }

  const hasParens = s.includes('(');
  const keys = topTerms.map((t) => [...t.poly.keys()]);
  const expandedForm =
    !hasParens &&
    topTerms.every((t) => t.info.nums <= 1 && Object.values(t.info.vars).every((c) => c <= 1) && !t.info.hasDiv && t.poly.size === 1) &&
    new Set(keys.map((k) => k[0])).size === topTerms.length;
  const factoredForm =
    topTerms.length === 1 &&
    topTerms[0].info.hasParens &&
    (() => {
      // every parenthesised factor must have coprime integer coefficients (common factor fully taken out)
      const inner = s.match(/\(([^()]*)\)/g) ?? [];
      return inner.every((grp) => {
        const p = parseExpression(grp.slice(1, -1));
        if (!p) return false;
        const coefs = [...p.poly.values()];
        if (coefs.some((q) => q[1] !== 1)) return true;
        return coefs.reduce((g, q) => gcd(g, q[0]), 0) === 1;
      });
    })();
  return { poly, hasParens, expandedForm, factoredForm };
}

/** LaTeX for an expression string as typed: '3x^2-2x+1' → '3x^{2}-2x+1', '*' → '\cdot'. */
export function expressionToTex(raw: string): string {
  return normalizeExpression(raw)
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\*/g, ' \\cdot ')
    .replace(/(\d)\.(\d)/g, '$1,$2')
    .replace(/-/g, ' - ')
    .replace(/\+/g, ' + ')
    .replace(/^ - /, '-')
    .replace(/\( - /g, '(-');
}
