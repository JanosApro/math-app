/**
 * Progress actions: everything that changes the stored state goes through here.
 * Pure helpers (streak computation) are exported for the UI and tests.
 */
import type { GradeTopics, TopicMeta } from '../engine/types';
import { topicCompleted } from '../content/catalog';
import { addDays, dayDiff, todayBelgrade } from './dates';
import {
  type AppState,
  type GradeProgress,
  type Settings,
  type SubtopicProgress,
  emptyGradeProgress,
  getState,
  gradeProgress,
  initialState,
  replaceState,
  sanitizeState,
  update,
} from './store';
import { STREAK_MILESTONES, XP } from './xp';

function withGrade(s: AppState, grade: number, fn: (g: GradeProgress) => GradeProgress): AppState {
  const key = String(grade);
  const current = s.grades[key] ?? emptyGradeProgress();
  return { ...s, grades: { ...s.grades, [key]: fn(current) } };
}

function withSubtopic(g: GradeProgress, id: string, fn: (p: SubtopicProgress) => SubtopicProgress): GradeProgress {
  return { ...g, subtopics: { ...g.subtopics, [id]: fn(g.subtopics[id] ?? {}) } };
}

// ---------------------------------------------------------------------------------------------
// Simple setters
// ---------------------------------------------------------------------------------------------

export function setGrade(grade: number): void {
  update((s) => ({ ...s, grade }));
}

export function setNickname(nickname: string): void {
  update((s) => ({ ...s, nickname: nickname.trim().slice(0, 30) }));
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
}

/** The student chose "Mégis megnyitom" for a soft-locked subtopic: never warn again for it. */
export function acknowledgeSkip(grade: number, subtopicId: string): void {
  update((s) => withGrade(s, grade, (g) => withSubtopic(g, subtopicId, (p) => ({ ...p, skipAck: true }))));
}

/** Remembers where the student is inside a lesson (to resume later). */
export function saveLessonStep(grade: number, subtopicId: string, step: number): void {
  update((s) => {
    const cur = gradeProgress(s, grade).subtopics[subtopicId]?.step;
    if (cur === step) return s;
    return withGrade(s, grade, (g) => withSubtopic(g, subtopicId, (p) => ({ ...p, step })));
  });
}

export function addXp(grade: number, amount: number): void {
  if (amount <= 0) return;
  update((s) => withGrade(s, grade, (g) => ({ ...g, xp: g.xp + amount })));
}

// ---------------------------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------------------------

export function isCompleted(s: AppState, grade: number, subtopicId: string): boolean {
  return !!gradeProgress(s, grade).subtopics[subtopicId]?.completedAt;
}

export function completedCount(s: AppState, grade: number): number {
  return Object.values(gradeProgress(s, grade).subtopics).filter((p) => p.completedAt).length;
}

// ---------------------------------------------------------------------------------------------
// Mini test / subtopic completion
// ---------------------------------------------------------------------------------------------

export interface TestOutcome {
  passed: boolean;
  percent: number;
  /** First time this subtopic was completed. */
  firstCompletion: boolean;
  xpGained: number;
  /** Set if this completion finished a whole topic (chapter badge). */
  chapterCompleted?: TopicMeta;
}

/**
 * Records a mini test result. Passing completes the subtopic (first time: XP + maybe chapter).
 * Failing just counts the attempt — no penalty.
 */
export function recordTestResult(grade: number, topics: GradeTopics, subtopicId: string, percent: number, passPercent: number): TestOutcome {
  const before = getState();
  const passed = percent >= passPercent;
  const wasCompleted = isCompleted(before, grade, subtopicId);
  const firstCompletion = passed && !wasCompleted;
  let xpGained = passed ? (firstCompletion ? XP.lessonComplete : XP.lessonReplay) : 0;
  let chapterCompleted: TopicMeta | undefined;
  const today = todayBelgrade();

  update((s) => {
    let next = withGrade(s, grade, (g) =>
      withSubtopic(g, subtopicId, (p) => ({
        ...p,
        testAttempts: (p.testAttempts ?? 0) + 1,
        bestPercent: Math.max(p.bestPercent ?? 0, percent),
        completedAt: p.completedAt ?? (passed ? today : undefined),
        step: passed ? undefined : p.step,
      })),
    );
    if (firstCompletion) {
      const gp = gradeProgress(next, grade);
      const done = (id: string) => !!gp.subtopics[id]?.completedAt;
      const topic = topics.topics.find((t) => t.subtopics.some((x) => x.id === subtopicId));
      if (topic && !gp.chapters[topic.id] && topicCompleted(topic, done)) {
        chapterCompleted = topic;
        xpGained += XP.chapterComplete;
        next = withGrade(next, grade, (g) => ({ ...g, chapters: { ...g.chapters, [topic.id]: today } }));
      }
    }
    return withGrade(next, grade, (g) => ({ ...g, xp: g.xp + xpGained }));
  });
  return { passed, percent, firstCompletion, xpGained, chapterCompleted };
}

// ---------------------------------------------------------------------------------------------
// Daily challenge and streak
// ---------------------------------------------------------------------------------------------

export interface StreakInfo {
  /** Consecutive days up to today (or up to yesterday if today is not done yet). */
  current: number;
  best: number;
  doneToday: boolean;
}

/** Computes the streak from the set of days with a completed daily challenge. */
export function computeStreak(days: string[], today: string): StreakInfo {
  const set = new Set(days);
  const doneToday = set.has(today);
  let current = 0;
  let d = doneToday ? today : addDays(today, -1);
  while (set.has(d)) {
    current++;
    d = addDays(d, -1);
  }
  const sorted = [...set].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev && dayDiff(prev, day) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return { current, best: Math.max(best, current), doneToday };
}

export function streakOf(s: AppState, grade: number, today = todayBelgrade()): StreakInfo {
  return computeStreak(Object.keys(gradeProgress(s, grade).daily), today);
}

export interface DailyOutcome {
  /** False if today's challenge had already been completed (replay for practice: no XP/streak). */
  counted: boolean;
  xpGained: number;
  streak: StreakInfo;
  /** A streak milestone (7, 30, 100) reached for the first time. */
  milestone?: number;
}

/** Records the daily challenge. Only the first completion of the day counts. */
export function recordDaily(grade: number, date: string, correct: number, total: number): DailyOutcome {
  const s0 = getState();
  const already = !!gradeProgress(s0, grade).daily[date];
  if (already) return { counted: false, xpGained: 0, streak: streakOf(s0, grade, date) };
  const xpGained = XP.dailyComplete + XP.dailyCorrect * correct;
  let milestone: number | undefined;
  update((s) =>
    withGrade(s, grade, (g) => {
      const daily = { ...g.daily, [date]: { correct, total, xp: xpGained } };
      const streak = computeStreak(Object.keys(daily), date);
      const reached = STREAK_MILESTONES.filter((m) => streak.current >= m && !g.streakBadges.includes(m));
      milestone = reached.length ? reached[reached.length - 1] : undefined;
      return { ...g, daily, xp: g.xp + xpGained, streakBadges: [...g.streakBadges, ...reached] };
    }),
  );
  return { counted: true, xpGained, streak: streakOf(getState(), grade, date), milestone };
}

// ---------------------------------------------------------------------------------------------
// Export / import / reset
// ---------------------------------------------------------------------------------------------

export interface ProgressFile {
  app: 'matek-kaland';
  exportedAt: string;
  state: AppState;
}

export function exportProgressJson(): string {
  const file: ProgressFile = { app: 'matek-kaland', exportedAt: new Date().toISOString(), state: getState() };
  return JSON.stringify(file, null, 2);
}

/** Triggers a download of the progress file. */
export function downloadProgress(): void {
  const blob = new Blob([exportProgressJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `matek-kaland-mentes-${todayBelgrade()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parses an exported file. Returns the state or null if the file is not a valid save. */
export function parseProgressFile(text: string): AppState | null {
  try {
    const data = JSON.parse(text) as unknown;
    if (typeof data === 'object' && data !== null && (data as ProgressFile).app === 'matek-kaland') {
      return sanitizeState((data as ProgressFile).state);
    }
    return sanitizeState(data); // a raw state object also works
  } catch {
    return null;
  }
}

export function importProgress(next: AppState): void {
  replaceState(next);
}

export function resetProgress(): void {
  const s = getState();
  replaceState({ ...initialState(), settings: s.settings });
}
