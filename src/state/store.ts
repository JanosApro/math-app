/**
 * The app state, persisted in localStorage (never cookies, never a server).
 * All storage access is wrapped in try/catch: if storage is unavailable (private mode,
 * blocked site data) the app keeps working in memory and shows a notice.
 */
import { useSyncExternalStore } from 'react';

export const STORAGE_KEY = 'matek-kaland:v1';
export const STATE_VERSION = 1;

export interface Settings {
  sound: boolean;
  reduceMotion: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export interface SubtopicProgress {
  /** Date (YYYY-MM-DD) of the first successful mini test. */
  completedAt?: string;
  /** Best mini test result in percent. */
  bestPercent?: number;
  testAttempts?: number;
  /** The student confirmed opening this soft-locked subtopic; don't warn again. */
  skipAck?: boolean;
  /** Index of the lesson step to resume from. */
  step?: number;
}

export interface DailyRecord {
  correct: number;
  total: number;
  xp: number;
}

export interface GradeProgress {
  xp: number;
  subtopics: Record<string, SubtopicProgress>;
  /** topicId → date the chapter was completed (chapter badge). */
  chapters: Record<string, string>;
  /** date (YYYY-MM-DD, Belgrade) → daily challenge result. One record per day. */
  daily: Record<string, DailyRecord>;
  /** Streak milestones already celebrated (7, 30, 100). */
  streakBadges: number[];
}

export interface AppState {
  version: number;
  /** Currently selected grade; null until onboarding is done. */
  grade: number | null;
  /** Optional nickname — never a real name. */
  nickname: string;
  settings: Settings;
  /** Progress per grade (key: grade number as string). */
  grades: Record<string, GradeProgress>;
}

export function emptyGradeProgress(): GradeProgress {
  return { xp: 0, subtopics: {}, chapters: {}, daily: {}, streakBadges: [] };
}

export function initialState(): AppState {
  return {
    version: STATE_VERSION,
    grade: null,
    nickname: '',
    settings: { sound: false, reduceMotion: false, theme: 'auto' },
    grades: {},
  };
}

// ---------------------------------------------------------------------------------------------
// Validation / migration (also used by import)
// ---------------------------------------------------------------------------------------------

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Turns unknown JSON into a valid AppState, or returns null if it is not ours. */
export function sanitizeState(raw: unknown): AppState | null {
  if (!isObj(raw) || typeof raw.version !== 'number' || !isObj(raw.grades)) return null;
  const base = initialState();
  const settings = isObj(raw.settings) ? raw.settings : {};
  const state: AppState = {
    version: STATE_VERSION,
    grade: typeof raw.grade === 'number' ? raw.grade : null,
    nickname: typeof raw.nickname === 'string' ? raw.nickname.slice(0, 30) : '',
    settings: {
      sound: typeof settings.sound === 'boolean' ? settings.sound : base.settings.sound,
      reduceMotion: typeof settings.reduceMotion === 'boolean' ? settings.reduceMotion : base.settings.reduceMotion,
      theme: settings.theme === 'light' || settings.theme === 'dark' ? settings.theme : 'auto',
    },
    grades: {},
  };
  for (const [g, gp] of Object.entries(raw.grades)) {
    if (!/^\d+$/.test(g) || !isObj(gp)) continue;
    const p = emptyGradeProgress();
    p.xp = typeof gp.xp === 'number' && gp.xp >= 0 ? Math.floor(gp.xp) : 0;
    if (isObj(gp.subtopics)) {
      for (const [id, sp] of Object.entries(gp.subtopics)) {
        if (!isObj(sp)) continue;
        const s: SubtopicProgress = {};
        if (typeof sp.completedAt === 'string') s.completedAt = sp.completedAt;
        if (typeof sp.bestPercent === 'number') s.bestPercent = sp.bestPercent;
        if (typeof sp.testAttempts === 'number') s.testAttempts = sp.testAttempts;
        if (sp.skipAck === true) s.skipAck = true;
        if (typeof sp.step === 'number') s.step = sp.step;
        p.subtopics[id] = s;
      }
    }
    if (isObj(gp.chapters)) for (const [id, d] of Object.entries(gp.chapters)) if (typeof d === 'string') p.chapters[id] = d;
    if (isObj(gp.daily)) {
      for (const [d, r] of Object.entries(gp.daily)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !isObj(r)) continue;
        p.daily[d] = { correct: Number(r.correct) || 0, total: Number(r.total) || 0, xp: Number(r.xp) || 0 };
      }
    }
    if (Array.isArray(gp.streakBadges)) p.streakBadges = gp.streakBadges.filter((n): n is number => typeof n === 'number');
    state.grades[g] = p;
  }
  return state;
}

// ---------------------------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------------------------

let storageOk = true;

function readStorage(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return sanitizeState(JSON.parse(raw)) ?? initialState();
  } catch {
    storageOk = false;
    return initialState();
  }
}

function writeStorage(s: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

/** False if the browser refused to store data (private mode, blocked storage, quota). */
export function isStorageAvailable(): boolean {
  return storageOk;
}

// ---------------------------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------------------------

let state: AppState = typeof window === 'undefined' ? initialState() : readStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getState(): AppState {
  return state;
}

/** Replaces the state with the result of `fn` (which must not mutate its argument) and saves it. */
export function update(fn: (s: AppState) => AppState): void {
  const next = fn(state);
  if (next === state) return;
  state = next;
  writeStorage(state);
  emit();
}

/** Replaces everything (import / reset). */
export function replaceState(next: AppState): void {
  state = next;
  writeStorage(state);
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keep several open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = readStorage();
      emit();
    }
  });
}

/** React hook: re-renders when the selected part of the state changes. */
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/** Progress of a grade (a fresh empty object if none yet — do not mutate it). */
export function gradeProgress(s: AppState, grade: number): GradeProgress {
  return s.grades[String(grade)] ?? EMPTY;
}
const EMPTY: GradeProgress = Object.freeze(emptyGradeProgress()) as GradeProgress;
