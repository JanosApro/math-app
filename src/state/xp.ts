/** XP rewards and levels — tweak the numbers here. */
export const XP = {
  /** Correct answer in a lesson (check or practice), first try without hint. */
  correct: 10,
  /** Correct answer after using the hint or after a parse-error retry. */
  correctWithHint: 5,
  /** Passing a mini test for the first time. */
  lessonComplete: 50,
  /** Passing a mini test again later (practice). */
  lessonReplay: 10,
  /** Completing every subtopic of a topic. */
  chapterComplete: 150,
  /** Finishing the daily challenge (first time that day). */
  dailyComplete: 30,
  /** Per correct answer in the daily challenge (first time that day). */
  dailyCorrect: 5,
} as const;

export const STREAK_MILESTONES = [7, 30, 100] as const;

/** Level from total XP: level n needs 50·n·(n−1) XP (0, 100, 300, 600, 1000, …). */
export function levelFromXp(xp: number): { level: number; current: number; next: number } {
  let level = 1;
  while (50 * (level + 1) * level <= xp) level++;
  const current = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return { level, current, next };
}
