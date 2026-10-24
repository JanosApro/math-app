/**
 * Keypad keys per answer type, text editing, and physical-keyboard mapping.
 */
import type { AnswerSpec } from '../../engine/types';
import { expressionVars } from '../../engine/answers';
import { t } from '../../i18n/hu';

export type KeyAction =
  | { kind: 'insert'; text: string }
  | { kind: 'backspace' }
  | { kind: 'clear' }
  /** numbers answer: finish the field that has this unit (or the focused one) and go on */
  | { kind: 'next'; unit?: string };

export interface KeyDef {
  /** What the key shows. */
  label: string;
  aria: string;
  action: KeyAction;
  /** Visual style: digits are big and plain, operators tinted, actions muted. */
  tone?: 'digit' | 'op' | 'letter' | 'action';
}

const ins = (text: string, aria: string, tone: KeyDef['tone'] = 'op', label = text): KeyDef => ({ label, aria, action: { kind: 'insert', text }, tone });

export const DIGIT_KEYS: KeyDef[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => ins(d, d, 'digit'));
export const MINUS_KEY = ins('-', t.input.minusKey, 'op', '−');
export const COMMA_KEY = ins(',', t.input.commaKey, 'op', ',');
export const BACKSPACE_KEY: KeyDef = { label: '⌫', aria: t.input.backspace, action: { kind: 'backspace' }, tone: 'action' };
export const CLEAR_KEY: KeyDef = { label: 'C', aria: t.input.clear, action: { kind: 'clear' }, tone: 'action' };

/** Type-specific keys shown in the row above the digits. */
export function specialKeys(spec: AnswerSpec): KeyDef[] {
  switch (spec.type) {
    case 'number':
      return spec.acceptFraction ? [ins('/', t.input.fractionKey)] : [];
    case 'fraction':
      return [ins('/', t.input.fractionKey), ins(' ', t.input.mixedKey, 'op', t.input.spaceLabel)];
    case 'root':
      return [ins('√', t.input.rootKey), ins('/', t.input.fractionKey)];
    case 'expression': {
      const vars = expressionVars(spec);
      return [
        ...vars.map((v) => ins(v, v === 'π' ? 'pí' : v, 'letter')),
        ins('^', t.input.powerKey, 'op', 'xⁿ'),
        ins('(', t.input.openParenKey),
        ins(')', t.input.closeParenKey),
        ins('+', t.input.plusKey),
        ins('·', t.input.timesKey),
      ];
    }
    case 'numbers': {
      const units = [...new Set(spec.fields.map((f) => f.unit).filter((u): u is string => !!u && /^[°′″]$/.test(u)))];
      const keys: KeyDef[] = units.map((u) => ({ label: u, aria: t.input.unitKey(u), action: { kind: 'next', unit: u }, tone: 'op' }));
      if (spec.fields.length > 1) keys.push({ label: '⇥', aria: t.input.nextField, action: { kind: 'next' }, tone: 'action' });
      return keys;
    }
    default:
      return [];
  }
}

const MAX_LEN = 40;

/** Applies an insert/backspace/clear to a text (append-only editing, no caret). */
export function editText(text: string, action: KeyAction): string {
  switch (action.kind) {
    case 'backspace':
      return text.slice(0, -1);
    case 'clear':
      return '';
    case 'insert': {
      if (text.length >= MAX_LEN) return text;
      const ch = action.text;
      // no leading space, no double spaces (mixed numbers)
      if (ch === ' ' && (text === '' || text.endsWith(' ') || text.endsWith('-'))) return text;
      // one decimal comma per number
      if (ch === ',' && /,\d*$/.test(text)) return text;
      return text + ch;
    }
    default:
      return text;
  }
}

/**
 * Maps a physical key press to a keypad action, if that key exists on this keypad.
 * Returns null for keys the keypad does not have (they are ignored).
 */
export function keyFromEvent(e: KeyboardEvent, keys: KeyDef[]): KeyAction | null {
  const k = e.key;
  if (k === 'Backspace') return { kind: 'backspace' };
  if (k === 'Delete') return { kind: 'clear' };
  const inserts = new Set(keys.flatMap((d) => (d.action.kind === 'insert' ? [d.action.text] : [])));
  const nextKeys = keys.filter((d) => d.action.kind === 'next');
  const want = (text: string): KeyAction | null => (inserts.has(text) ? { kind: 'insert', text } : null);
  if (/^\d$/.test(k)) return want(k);
  if (k === ',' || k === '.') return want(',');
  if (k === '-' || k === '−' || k === 'Subtract') return want('-');
  if (k === '/' || k === ':' || k === '÷') return want('/');
  if (k === ' ') return want(' ');
  if (k === '*' || k === '·' || k === '×') return want('·');
  if (k === '^' || k === '(' || k === ')' || k === '+') return want(k);
  if (k === '√') return want('√');
  if (k === 'Tab' || k === 'Enter') return null;
  if (k === "'" || k === '′') {
    const d = nextKeys.find((x) => x.action.kind === 'next' && x.action.unit === '′');
    return d ? d.action : null;
  }
  if (k === '°' || k === '"' || k === '″') {
    const unit = k === '°' ? '°' : '″';
    const d = nextKeys.find((x) => x.action.kind === 'next' && x.action.unit === unit);
    return d ? d.action : null;
  }
  if (k.length === 1 && /[a-zA-Zπ]/.test(k)) {
    if (inserts.has(k)) return { kind: 'insert', text: k };
    if (inserts.has(k.toLowerCase())) return { kind: 'insert', text: k.toLowerCase() };
    if ((k === 'p' || k === 'P') && inserts.has('π')) return { kind: 'insert', text: 'π' };
    if (/^[rgsvRGSV]$/.test(k) && inserts.has('√')) return { kind: 'insert', text: '√' };
  }
  return null;
}

/** True if a keyboard event should be left alone (modifiers, focus in a form field, a dialog is open). */
export function ignoreKeyEvent(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const el = e.target as HTMLElement | null;
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return true;
  if (document.querySelector('.dlg-backdrop')) return true;
  return false;
}
