/**
 * Helpers for multiple-choice questions. Good distractors are the results of TYPICAL
 * MISTAKES (forgot to take the square root, added instead of squaring, mixed up the
 * hypotenuse and a leg, …), not random numbers. List those first; the helper removes
 * duplicates and only fills the rest with nearby values if needed.
 */
import type { ChoiceAnswer, RichText } from './types';
import type { Rng } from './rng';
import { num } from './format';

export interface ChoiceOptions<T> {
  /** Total number of options including the correct one. Default 4. */
  count?: number;
  /** How a value is shown. Default: numbers with num() in math mode, strings as they are. */
  format?: (value: T) => RichText;
  /** Produces extra wrong values when the typical mistakes are not enough (duplicates are skipped). */
  fallback?: (rng: Rng, attempt: number) => T;
  /** Keep the options in the given order (correct first is NOT allowed then — pass `shuffle: false` only for ordered scales). */
  shuffle?: boolean;
}

function defaultFormat<T>(v: T): RichText {
  return typeof v === 'number' ? `$${num(v)}$` : String(v);
}

/**
 * Builds a multiple-choice answer.
 *
 *   answer: choice(rng, 10, [14, 100, 7], { fallback: (r) => r.int(5, 20) })
 *
 * - `wrongs` are typical-mistake values, most important first. Values equal to the correct
 *   one (after formatting) and duplicates are dropped automatically.
 * - The engine shuffles the options when displaying them.
 */
export function choice<T>(rng: Rng, correct: T, wrongs: T[], opts: ChoiceOptions<T> = {}): ChoiceAnswer {
  const count = opts.count ?? 4;
  const format = opts.format ?? defaultFormat;
  const correctText = format(correct);
  const seen = new Set<string>([correctText]);
  const options: RichText[] = [];
  const tryAdd = (v: T) => {
    if (options.length >= count - 1) return;
    if (typeof v === 'number' && !Number.isFinite(v)) return;
    const t = format(v);
    if (seen.has(t)) return;
    seen.add(t);
    options.push(t);
  };
  for (const w of wrongs) tryAdd(w);
  if (options.length < count - 1 && opts.fallback) {
    for (let attempt = 0; attempt < 200 && options.length < count - 1; attempt++) tryAdd(opts.fallback(rng, attempt));
  }
  if (options.length < count - 1) {
    throw new Error(`choice(): could only build ${options.length + 1} different options, need ${count}. Add more wrong values or a fallback.`);
  }
  // Put the correct answer at a random position so even `shuffle: false` is not predictable.
  const correctIndex = opts.shuffle === false ? 0 : rng.int(0, options.length);
  options.splice(correctIndex, 0, correctText);
  return { type: 'choice', options, correct: correctIndex, shuffle: opts.shuffle ?? true };
}

/**
 * A multiple-choice answer from fixed texts, where the correct one is given separately.
 *   textChoice('Igen, mert …', ['Nem, mert …', 'Csak ha …'])
 */
export function textChoice(correct: RichText, wrongs: RichText[], shuffle = true): ChoiceAnswer {
  const unique = [...new Set(wrongs.filter((w) => w !== correct))];
  return { type: 'choice', options: [correct, ...unique], correct: 0, shuffle };
}

/** Whole numbers near `value` (excluding it), useful as a `fallback`. */
export function nearbyInt(value: number, spread = 5, min = -Infinity) {
  return (rng: Rng) => {
    let v: number;
    do {
      v = value + rng.int(-spread, spread);
    } while (v === value || v < min);
    return v;
  };
}

/** Values near `value` changed by a random factor (0.5×–1.5×), rounded to `decimals`. */
export function nearbyScaled(value: number, decimals = 0) {
  return (rng: Rng) => {
    const f = 0.5 + rng.next();
    const v = value * f;
    const p = 10 ** decimals;
    return Math.round(v * p) / p;
  };
}
