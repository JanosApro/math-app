/**
 * Turning modules + generator references into concrete questions, and composing the
 * daily challenge deterministically.
 */
import type { DailyConfig, GenRef, GradeTopics, LessonStep, Question, SubtopicModule } from './types';
import { createRng, hashString } from './rng';

/** A stable seed from any parts: seedOf('test', id, 3) */
export function seedOf(...parts: (string | number)[]): number {
  return hashString(parts.join(':'));
}

/** Every step of a lesson, all parts in order. */
export function lessonSteps(mod: SubtopicModule): LessonStep[] {
  return (mod.parts ?? []).flatMap((p) => p.steps ?? []);
}

/** Generates a question. Throws a descriptive error if the generator is missing or fails. */
export function generateQuestion(mod: SubtopicModule, ref: GenRef, seed: number): Question {
  const gen = mod.generators.find((g) => g.id === ref.generator);
  if (!gen) throw new Error(`${mod.id}: unknown generator "${ref.generator}"`);
  if (!gen.levels.includes(ref.level)) throw new Error(`${mod.id}/${gen.id}: level ${ref.level} not supported`);
  return gen.generate(createRng(seed), ref.level);
}

export interface DailyItem {
  subtopicId: string;
  ref: GenRef;
  seed: number;
}

/** Number of questions in the daily challenge. */
export const DAILY_COUNT = 6;

/**
 * Subtopics the daily challenge may use: the ids in daily.json that have content,
 * or — if that list is empty — every subtopic with content.
 */
export function eligibleDailySubtopics(topics: GradeTopics, config: DailyConfig, hasContent: (id: string) => boolean): string[] {
  const all = topics.topics.flatMap((t) => t.subtopics).filter((s) => s.status !== 'todo' && hasContent(s.id)).map((s) => s.id);
  const listed = config.subtopics.filter((id) => all.includes(id));
  return listed.length > 0 ? listed : all;
}

/**
 * The daily challenge for a grade and date. Same inputs ⇒ same questions for everyone.
 * `modules` must contain every eligible subtopic's module.
 */
export function planDaily(grade: number, date: string, eligible: string[], modules: Map<string, SubtopicModule>, count = DAILY_COUNT): DailyItem[] {
  if (eligible.length === 0) return [];
  const rng = createRng(`daily:${grade}:${date}`);
  const order = rng.shuffle([...eligible].sort());
  const items: DailyItem[] = [];
  for (let i = 0; i < count; i++) {
    const subtopicId = order[i % order.length];
    const mod = modules.get(subtopicId);
    if (!mod) continue;
    const refs = mod.daily && mod.daily.length > 0 ? mod.daily : mod.miniTest.items;
    const ref = rng.pick(refs);
    items.push({ subtopicId, ref, seed: rng.int(1, 2 ** 31 - 1) });
  }
  return items;
}
