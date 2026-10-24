/**
 * Content schema — the contract between lesson content (src/content/**) and the engine.
 *
 * Content authors: you never need to edit this file. Import the types and helpers from
 * `src/kit.ts` instead. If TypeScript complains about your content, the error message
 * points at the field that does not match this schema.
 */
import type { Figure } from '../figures/types';
import type { Rng } from './rng';

/** Difficulty level of a generated exercise: 1 = easy, 2 = medium, 3 = hard. */
export type Difficulty = 1 | 2 | 3;

/**
 * Student-facing text (Hungarian).
 *
 * - Inline math goes between `$...$` and uses KaTeX (LaTeX) syntax, e.g. `$a^2 + b^2 = c^2$`.
 *   Inside math a comma between two digits is shown as a decimal comma: `$0,5$` → 0,5.
 * - `**bold**` makes bold text.
 * - A single `\n` is a line break, an empty line (`\n\n`) starts a new paragraph.
 * - Lines starting with `- ` become bullet points.
 *
 * Backslashes: in normal TS strings write `\\sqrt{2}` (two backslashes), or use the
 * `tex` tagged template from the kit: tex`$\sqrt{2}$`. `npm run check` catches mistakes.
 */
export type RichText = string;

// ---------------------------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------------------------

/** A whole number or decimal answer, e.g. 12 or 3,75. Accepts both comma and dot. */
export interface NumberAnswer {
  type: 'number';
  /** The exact correct value (computed by code). */
  value: number;
  /**
   * Number of decimal places the answer must be rounded to. With `precision: 2` and
   * value 7.0710678, the student must type 7,07 (7,071 is also accepted, 7,1 is not).
   * Omit for exact answers (integers, terminating decimals).
   */
  precision?: number;
  /** Absolute tolerance, overrides `precision` for checking. Rarely needed. */
  tolerance?: number;
  /** Unit shown after the input box, e.g. 'cm', 'cm²', '°'. */
  unit?: string;
  /** Also accept a fraction like 1/2 if it equals the value. Default: false. */
  acceptFraction?: boolean;
}

/** A fraction answer, e.g. 3/4 or the mixed number 1 1/2. */
export interface FractionAnswer {
  type: 'fraction';
  /** Numerator (may be negative). */
  num: number;
  /** Denominator, positive. */
  den: number;
  /**
   * When true (default), an equal but non-simplified answer (6/8 for 3/4) is not accepted;
   * the student gets a friendly "simplify it" message instead.
   */
  requireSimplified?: boolean;
  /**
   * 'any' (default): 7/4 and 1 3/4 are both fine.
   * 'mixed': the student must write a mixed number when the value is greater than 1.
   * 'improper': the student must not write a mixed number.
   */
  form?: 'any' | 'mixed' | 'improper';
  /** Also accept an exact decimal, e.g. 0,75 for 3/4. Default: false. */
  acceptDecimal?: boolean;
  unit?: string;
}

/**
 * An answer of the form (coef · √radicand) / den, e.g. 5√2, √3/2, 4 (radicand 1).
 * The engine compares values exactly, so √50 equals 5√2.
 */
export interface RootAnswer {
  type: 'root';
  /** Integer coefficient in front of the root (may be negative). */
  coef: number;
  /** Integer under the root, ≥ 1. Use 1 for an answer without a root. */
  radicand: number;
  /** Positive integer denominator. Default: 1. */
  den?: number;
  /**
   * When true (default), √50 is answered with "simplify it" instead of being accepted —
   * the student must write 5√2. Set false when the lesson has not taught partial root
   * extraction yet (e.g. 7th grade Pythagoras lesson 1 accepts √50 as well).
   */
  requireSimplified?: boolean;
  /** Also accept a decimal approximation with this many decimals (e.g. 2 → 7,07). */
  acceptDecimal?: number;
  unit?: string;
}

/** Multiple choice with exactly one correct option. */
export interface ChoiceAnswer {
  type: 'choice';
  /** The options. They are shuffled for display unless `shuffle: false`. */
  options: RichText[];
  /** Index of the correct option in `options` (before shuffling). */
  correct: number;
  /** Default true. Set false when the order matters (e.g. 'A', 'B', 'C', 'D' or sizes). */
  shuffle?: boolean;
}

/** True/false (Igaz / Hamis). */
export interface TrueFalseAnswer {
  type: 'truefalse';
  value: boolean;
}

/** Put the items in the correct order. `items` is listed in the CORRECT order. */
export interface OrderAnswer {
  type: 'order';
  items: RichText[];
  /** Short hint shown above the items, e.g. 'A legkisebbtől a legnagyobbig'. */
  direction?: RichText;
}

/** Match each left item with its right pair. `pairs` are listed correctly matched. */
export interface MatchAnswer {
  type: 'match';
  pairs: [RichText, RichText][];
}

/**
 * Several number fields at once, e.g. a system of equations (x = …, y = …), a point's
 * coordinates, or an angle in degrees and minutes (35° 48′). Every field must be correct.
 */
export interface NumbersAnswer {
  type: 'numbers';
  fields: {
    /** Text in front of the field, e.g. '$x =$'. */
    label?: RichText;
    value: number;
    /** Same meaning as in NumberAnswer. */
    precision?: number;
    /** Unit after the field, e.g. '°', '′', 'cm'. */
    unit?: string;
  }[];
}

/**
 * An algebraic expression (a polynomial), e.g. 3x² − 2x + 1 or 6a²b.
 * The student types it with the keypad (letters, ^, parentheses). The engine expands both
 * expressions and compares them exactly, so any correct form with the same value is recognised.
 */
export interface ExpressionAnswer {
  type: 'expression';
  /**
   * The correct answer, written the way a student would type it, in the required form:
   * '3x^2-2x+1', '6a^2b', '(a+b)^2'. Use * or · for multiplication if you like.
   * π counts as a symbol, so answers like '36π' (volume left in terms of π) work too.
   */
  value: string;
  /** Letters available on the keypad. Default: the letters in `value`. */
  vars?: string[];
  /**
   * 'expanded' (default): the student must give the expanded, simplified form
   *   (no parentheses, like terms combined, x·x written as x^2). An equal but unsimplified
   *   answer gets a friendly "simplify it" message.
   * 'factored': the answer must contain parentheses (a product), e.g. 3(x+2).
   * 'any': any equivalent expression is accepted.
   */
  form?: 'expanded' | 'factored' | 'any';
}

export type AnswerSpec =
  | NumberAnswer
  | NumbersAnswer
  | ExpressionAnswer
  | FractionAnswer
  | RootAnswer
  | ChoiceAnswer
  | TrueFalseAnswer
  | OrderAnswer
  | MatchAnswer;

export type AnswerType = AnswerSpec['type'];

/** What the student entered. Text answers are strings; the others are index-based. */
export type StudentAnswer =
  | { type: 'text'; text: string }
  | { type: 'fields'; texts: string[] }
  | { type: 'choice'; index: number }
  | { type: 'truefalse'; value: boolean }
  | { type: 'order'; order: number[] }
  | { type: 'match'; rightForLeft: number[] };

export interface CheckResult {
  correct: boolean;
  /**
   * The answer has the right value but the wrong form. The UI shows a friendly message
   * and lets the student fix it without counting a mistake.
   */
  almost?: 'notSimplified' | 'wrongForm';
  /** The input could not be understood (e.g. "3//4"). The student may try again. */
  parseError?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Questions and generators
// ---------------------------------------------------------------------------------------------

/** One exercise as shown to the student. Generators create these. */
export interface Question {
  /** The task text. */
  prompt: RichText;
  /** Optional figure. For generated questions it must follow the generated numbers. */
  figure?: Figure;
  answer: AnswerSpec;
  /** A short nudge in the right direction. Must not give the answer away. */
  hint: RichText;
  /** Worked solution, one entry per step. The last step should state the result. */
  solution: RichText[];
  /** Text shown in front of the input box, e.g. '$c =$'. */
  inputLabel?: RichText;
}

/**
 * A procedural exercise generator. Same rng seed + same level ⇒ same question.
 * All randomness must come from `rng` (never Math.random).
 */
export interface GeneratorDef {
  /** Unique within the subtopic, kebab-case, e.g. 'hypotenuse'. */
  id: string;
  /** Short developer description shown in /dev, e.g. 'Átfogó kiszámítása két befogóból'. */
  title: string;
  /** Which levels this generator supports. */
  levels: Difficulty[];
  generate: (rng: Rng, level: Difficulty) => Question;
}

/** Reference to a generator at a level, used by practice steps, mini tests and the daily challenge. */
export interface GenRef {
  generator: string;
  level: Difficulty;
}

// ---------------------------------------------------------------------------------------------
// Lesson steps
// ---------------------------------------------------------------------------------------------

/** A short explanation card. Keep `body` to 2–5 short sentences. */
export interface TheoryStep {
  type: 'theory';
  title?: RichText;
  body: RichText;
  figure?: Figure;
  /** A highlighted box under the body, e.g. a formula to remember. */
  remember?: RichText;
}

export interface ExampleSolutionStep {
  text: RichText;
  /** Optional figure that replaces the example's figure from this step on. */
  figure?: Figure;
}

/** A worked example revealed one step at a time. */
export interface ExampleStep {
  type: 'example';
  title?: RichText;
  problem: RichText;
  figure?: Figure;
  steps: ExampleSolutionStep[];
  /** Final answer sentence shown after the last step, e.g. 'Az átfogó 10 cm.' */
  answer: RichText;
}

/** An understanding check between theory cards (usually choice or true/false). */
export interface CheckStep {
  type: 'check';
  question: Question;
}

/** Generated practice exercises. */
export interface PracticeStep {
  type: 'practice';
  generator: string;
  level: Difficulty;
  /** How many exercises in a row. Default 1. */
  count?: number;
}

/**
 * An interactive card with sliders. `render` receives the current slider values and
 * returns the figure and text to show. Use it sparingly, where moving a value really
 * helps understanding (e.g. cylinder volume as r changes).
 */
export interface ExploreStep {
  type: 'explore';
  title?: RichText;
  body: RichText;
  sliders: { name: string; label: RichText; min: number; max: number; step: number; value: number }[];
  render: (values: Record<string, number>) => { figure?: Figure; text: RichText };
}

export type LessonStep = TheoryStep | ExampleStep | CheckStep | PracticeStep | ExploreStep;

/**
 * A short part of a lesson — about 5 minutes: typically 1–2 explanation steps (theory / example /
 * explore) and 3–6 questions (checks and practice). Every finished part gives XP and counts for
 * the daily streak. A lesson has 3–5 parts; after them comes the mini test.
 */
export interface LessonPart {
  /** Short title shown in the part list, e.g. 'Az átfogó kiszámítása'. */
  title: RichText;
  steps: LessonStep[];
}

// ---------------------------------------------------------------------------------------------
// Subtopic module
// ---------------------------------------------------------------------------------------------

export interface MiniTestDef {
  /** 5–8 items. Mix the levels. */
  items: GenRef[];
  /** Pass mark in percent. Default 80. */
  passPercent?: number;
}

/** What a subtopic file (e.g. `01-bizonyitas-alapok.ts`) default-exports. */
export interface SubtopicModule {
  /** Must equal the subtopic id in topics.json, e.g. 'g7-pitagorasz-01'. */
  id: string;
  /** Learning goals, Hungarian, shown on the lesson start screen. 2–4 short items. */
  goals: RichText[];
  /**
   * The lesson in 3–5 short parts (about 5 minutes each), in order: theory + checks, examples,
   * practice. The mini test comes after the last part.
   */
  parts: LessonPart[];
  generators: GeneratorDef[];
  miniTest: MiniTestDef;
  /** Which generators the daily challenge may use. Default: the mini test items. */
  daily?: GenRef[];
}

// ---------------------------------------------------------------------------------------------
// Catalog (topics.json / grades.json)
// ---------------------------------------------------------------------------------------------

export type ContentStatus = 'todo' | 'draft' | 'done';

export interface SubtopicMeta {
  /** Globally unique, e.g. 'g7-pitagorasz-01'. */
  id: string;
  /** File name of the module in the topic folder, without '.ts', e.g. '01-bizonyitas-alapok'. */
  file: string;
  title: string;
  status: ContentStatus;
  /** One line (English) describing what the lesson must cover. For content authors. */
  scope?: string;
  /**
   * Subtopic ids that must be completed first. Default: every earlier subtopic in the grade.
   * Use [] for "no prerequisites", or list specific ids (may be in other topics).
   */
  prerequisites?: string[];
  source?: string;
}

export interface TopicMeta {
  /** e.g. 'g7-pitagorasz' */
  id: string;
  /** Folder name under the grade folder, e.g. 'pitagorasz'. */
  folder: string;
  title: string;
  /** Optional CSS color, e.g. '#2f80ed'. Default: picked from the palette by position. */
  color?: string;
  /** Optional icon name (see src/ui/TopicIcon.tsx). */
  icon?: string;
  /**
   * Topic ids whose subtopics must be completed before this topic's subtopics.
   * Default: every earlier topic in the grade. A subtopic's own `prerequisites` overrides this.
   */
  prerequisites?: string[];
  subtopics: SubtopicMeta[];
}

export interface GradeTopics {
  grade: number;
  topics: TopicMeta[];
}

export interface GradeInfo {
  grade: number;
  /** e.g. '7. osztály' */
  label: string;
}

export interface DailyConfig {
  /** Subtopic ids covered in class so far. Empty ⇒ every subtopic that has content. */
  subtopics: string[];
  /** Free-text instructions for the teacher (ignored by the app). */
  _help?: string;
}
