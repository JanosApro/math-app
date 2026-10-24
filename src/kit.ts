/**
 * THE content kit — the only import a subtopic file needs:
 *
 *   import { defineSubtopic, num, m, tex, choice, simplifyRoot, type Question } from '../../../kit';
 *
 * Everything here is documented in CONTENT_GUIDE.md.
 */

// Types
export type {
  AnswerSpec,
  ChoiceAnswer,
  CheckStep,
  Difficulty,
  ExampleStep,
  ExploreStep,
  ExpressionAnswer,
  FractionAnswer,
  GenRef,
  GeneratorDef,
  LessonStep,
  MatchAnswer,
  MiniTestDef,
  NumberAnswer,
  NumbersAnswer,
  OrderAnswer,
  PracticeStep,
  Question,
  RichText,
  RootAnswer,
  SubtopicModule,
  TheoryStep,
  TrueFalseAnswer,
} from './engine/types';
export type { Rng } from './engine/rng';
export type * from './figures/types';

// Number formatting and LaTeX builders
export { num, signed, paren, m, tex, texFrac, texMixed, texRoot, rootText, withUnit, joinHu, article, MINUS } from './engine/format';

// Exact math
export {
  gcd,
  lcm,
  round,
  clean,
  almostEqual,
  isPerfectSquare,
  decimalPlaces,
  frac,
  simplify,
  isSimplified,
  fracAdd,
  fracSub,
  fracMul,
  fracDiv,
  fracEquals,
  fracCompare,
  fracValue,
  isTerminating,
  decimalToFrac,
  toMixed,
  simplifyRoot,
  isSquareFree,
  PYTHAGOREAN_TRIPLES,
  PRIMITIVE_TRIPLES,
  type Frac,
} from './engine/math';

// Multiple choice helpers
export { choice, textChoice, nearbyInt, nearbyScaled } from './engine/distractors';

// Geometry helper for figure points (perpendicular foot etc.)
export { foot as perpendicularFoot } from './figures/scene';

import type { SubtopicModule } from './engine/types';

/**
 * Wrap your module with this. It only returns its argument, but gives you autocompletion
 * and type errors in the right place:
 *
 *   export default defineSubtopic({ id: 'g7-pitagorasz-01', goals: [...], steps: [...], generators: [...], miniTest: {...} });
 */
export function defineSubtopic(mod: SubtopicModule): SubtopicModule {
  return mod;
}
