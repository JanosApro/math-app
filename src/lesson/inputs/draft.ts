/**
 * What the student has entered so far for a question ("draft"), independent of the UI.
 * `draftToAnswer` turns a complete draft into a StudentAnswer for `checkAnswer`
 * (null while the draft is incomplete — the Check button stays disabled).
 */
import type { AnswerSpec, NumbersAnswer, RichText, StudentAnswer } from '../../engine/types';
import { choiceOrder, joinFields } from '../../engine/answers';
import { expressionToTex } from '../../engine/polynomial';
import { t } from '../../i18n/hu';

export type AnswerDraft =
  | { type: 'text'; text: string }
  | { type: 'fields'; texts: string[]; focus: number }
  | { type: 'choice'; index: number | null }
  | { type: 'truefalse'; value: boolean | null }
  | { type: 'order'; order: number[] }
  | { type: 'match'; rightForLeft: (number | null)[]; pendingLeft: number | null; pendingRight: number | null };

export function emptyDraft(spec: AnswerSpec): AnswerDraft {
  switch (spec.type) {
    case 'number':
    case 'fraction':
    case 'root':
    case 'expression':
      return { type: 'text', text: '' };
    case 'numbers':
      return { type: 'fields', texts: spec.fields.map(() => ''), focus: 0 };
    case 'choice':
      return { type: 'choice', index: null };
    case 'truefalse':
      return { type: 'truefalse', value: null };
    case 'order':
      return { type: 'order', order: [] };
    case 'match':
      return { type: 'match', rightForLeft: spec.pairs.map(() => null), pendingLeft: null, pendingRight: null };
  }
}

/** The StudentAnswer for a complete draft, or null if something is still missing. */
export function draftToAnswer(spec: AnswerSpec, d: AnswerDraft): StudentAnswer | null {
  switch (d.type) {
    case 'text':
      return d.text.trim() ? { type: 'text', text: d.text } : null;
    case 'fields':
      return d.texts.every((x) => x.trim()) ? { type: 'fields', texts: d.texts } : null;
    case 'choice':
      return d.index === null ? null : { type: 'choice', index: d.index };
    case 'truefalse':
      return d.value === null ? null : { type: 'truefalse', value: d.value };
    case 'order':
      return spec.type === 'order' && d.order.length === spec.items.length ? { type: 'order', order: d.order } : null;
    case 'match':
      return d.rightForLeft.every((r) => r !== null) ? { type: 'match', rightForLeft: d.rightForLeft as number[] } : null;
  }
}

/** Display order of order-items: shuffled, but never already in the correct order. */
export function orderDisplay(n: number, seed: number): number[] {
  const o = choiceOrder(n, true, seed ^ 0x5bd1e995);
  if (n > 1 && o.every((v, i) => v === i)) o.push(o.shift()!);
  return o;
}

/** Display order of the right column of a match question (never the identity). */
export function matchDisplay(n: number, seed: number): number[] {
  const o = choiceOrder(n, true, seed ^ 0x27d4eb2d);
  if (n > 1 && o.every((v, i) => v === i)) o.push(o.shift()!);
  return o;
}

// ---------------------------------------------------------------------------------------------
// Typed text → LaTeX (live "Így értem:" preview) and back to RichText (answer review)
// ---------------------------------------------------------------------------------------------

const BOX = '\\square';

/** Decimal number text "12.5" / "12,5" → "12{,}5". */
function texNumber(s: string): string {
  return s.replace(/[.,]/g, '{,}').replace(/-/g, '-');
}

/** A short text in math mode, escaping what KaTeX would choke on. */
function texPlain(s: string): string {
  return s
    .replace(/\\/g, '')
    .replace(/[{}#$%&_~]/g, '')
    .replace(/\^/g, '\\^{}')
    .replace(/ /g, '\\ ');
}

function texFractionInput(s: string): string {
  const v = s.trim().replace(/\s+/g, ' ');
  let m = /^(-?)(\d+[.,]?\d*) (\d*)(?:\/(\d*))?$/.exec(v);
  if (m) {
    const [, sign, whole, n, d] = m;
    if (d === undefined) return `${sign}${texNumber(whole)}\\,${n || BOX}`;
    return `${sign}${texNumber(whole)}\\frac{${n || BOX}}{${d || BOX}}`;
  }
  m = /^(-?)(\d*[.,]?\d*)\/(-?\d*)$/.exec(v);
  if (m) {
    const [, sign, n, d] = m;
    return `${sign}\\frac{${n ? texNumber(n) : BOX}}{${d || BOX}}`;
  }
  if (/^-?\d*[.,]?\d*$/.test(v)) return texNumber(v);
  return texPlain(v);
}

function texRootInput(s: string): string {
  const v = s.replace(/\s+/g, '');
  const m = /^(-?)(\d*[.,]?\d*)(√\(?(\d*)\)?)?(?:\/(\d*))?$/.exec(v);
  if (!m) return texPlain(v);
  const [, sign, coef, rootPart, rad, den] = m;
  let top = coef ? texNumber(coef) : '';
  if (rootPart) top += `\\sqrt{${rad || BOX}}`;
  if (!top) top = BOX;
  if (den !== undefined) return `${sign}\\frac{${top}}{${den || BOX}}`;
  return sign + top;
}

function texExpressionInput(s: string): string {
  let v = s.replace(/\s+/g, '');
  if (!v) return '';
  if (/\^$/.test(v)) v += '□';
  if (/[^0-9a-zA-Zπ.,+\-*/^()·×:□]/.test(v)) return texPlain(v);
  return expressionToTex(v)
    .replace(/\^\{?□\}?/g, `^{${BOX}}`)
    .replace(/□/g, BOX)
    .replace(/π/g, '\\pi ');
}

/** LaTeX preview of what the student typed, or '' if there is nothing to show. */
export function inputToTex(spec: AnswerSpec, text: string): string {
  if (!text.trim()) return '';
  switch (spec.type) {
    case 'fraction':
      return texFractionInput(text);
    case 'root':
      return texRootInput(text);
    case 'expression':
      return texExpressionInput(text);
    default:
      return text.includes('/') ? texFractionInput(text) : texNumber(text.trim()).replace(/ /g, '\\ ');
  }
}

/** Typed text as it is shown in the input display (real minus sign, decimal comma). */
export function displayText(text: string): string {
  return text.replace(/-/g, '−').replace(/\./g, ',').replace(/\*/g, '·');
}

function fieldsText(spec: NumbersAnswer, texts: string[]): RichText {
  return joinFields(
    spec,
    spec.fields.map((f, i) => {
      const unit = f.unit ? (/^[°′″]$/.test(f.unit) ? f.unit : ` ${f.unit}`) : '';
      return `${f.label ? `${f.label} ` : ''}$${texNumber(texts[i] ?? '')}$${unit}`;
    }),
  );
}

/** The student's answer as RichText, for "A te válaszod: …" in reviews. */
export function describeAnswer(spec: AnswerSpec, a: StudentAnswer | null): RichText {
  if (!a) return '—';
  switch (a.type) {
    case 'text': {
      const tex = inputToTex(spec, a.text);
      const unit = 'unit' in spec && spec.unit ? ` ${spec.unit}` : '';
      return tex ? `$${tex}$${unit}` : '—';
    }
    case 'fields':
      return spec.type === 'numbers' ? fieldsText(spec, a.texts) : a.texts.join(', ');
    case 'choice':
      return spec.type === 'choice' ? spec.options[a.index] ?? '—' : '—';
    case 'truefalse':
      return a.value ? t.input.trueLabel : t.input.falseLabel;
    case 'order':
      return spec.type === 'order' ? a.order.map((i) => spec.items[i]).join(' → ') : '—';
    case 'match':
      return spec.type === 'match' ? spec.pairs.map(([l], i) => `${l} – ${spec.pairs[a.rightForLeft[i]]?.[1] ?? '?'}`).join('\n') : '—';
  }
}
