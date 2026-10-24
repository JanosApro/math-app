/**
 * Dev-only: the question currently on screen, so the /dev/preview toolbar can show its answer
 * and browser automation can read it (`window.__mkQuestion`). Does nothing in production.
 */
import { useSyncExternalStore } from 'react';
import type { Question } from '../engine/types';

export interface CurrentQuestion {
  question: Question;
  seed: number;
}

let current: CurrentQuestion | null = null;
const listeners = new Set<() => void>();

export function setCurrentQuestion(q: CurrentQuestion | null): void {
  if (!import.meta.env.DEV) return;
  current = q;
  (window as unknown as { __mkQuestion?: CurrentQuestion | null }).__mkQuestion = q;
  for (const l of listeners) l();
}

/** Clears the hook only if it still shows `q` (a late cleanup must not wipe a newer question). */
export function clearCurrentQuestion(q: CurrentQuestion): void {
  if (current === q) setCurrentQuestion(null);
}

export function useCurrentQuestion(): CurrentQuestion | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
