/**
 * What a bug report should know about the moment it was sent:
 * - the question on screen (set by QuestionRunner, cleared when it unmounts), with the
 *   generator that made it, so the teacher can reproduce it from subtopic + generator + level + seed;
 * - the last few uncaught errors of this page load (window "error" / "unhandledrejection").
 * Nothing here is sent anywhere by itself: only the report dialog reads it.
 */
import type { Question, StudentAnswer } from '../engine/types';

/** Where a question came from. `part` + `step` (0-based) are set for the fixed check questions of a lesson. */
export interface QuestionOrigin {
  subtopic: string;
  generator?: string;
  level?: number;
  part?: number;
  step?: number;
}

export interface ReportQuestion {
  question: Question;
  seed: number;
  mode: 'lesson' | 'test' | 'daily';
  origin?: QuestionOrigin;
  /** The student's checked answer, once there is one. */
  student?: StudentAnswer;
  correct?: boolean;
}

export interface CapturedError {
  message: string;
  where?: string;
  at: string;
}

const MAX_ERRORS = 5;
let current: ReportQuestion | null = null;
const errors: CapturedError[] = [];

export function setReportQuestion(q: ReportQuestion): void {
  current = q;
}

/** Clears only if `q` is still the current one (a late cleanup must not wipe a newer question). */
export function clearReportQuestion(q: ReportQuestion): void {
  if (current === q) current = null;
}

export function getReportQuestion(): ReportQuestion | null {
  return current;
}

export function recordError(message: string, where?: string): void {
  errors.push({ message: message.slice(0, 300), where: where?.slice(0, 200), at: new Date().toISOString() });
  if (errors.length > MAX_ERRORS) errors.splice(0, errors.length - MAX_ERRORS);
}

export function recentErrors(): CapturedError[] {
  return errors.slice();
}

let installed = false;

/** Starts remembering uncaught errors (call once at startup). */
export function installErrorCapture(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => {
    const where = e.filename ? `${e.filename.replace(/^.*\//, '')}:${e.lineno}:${e.colno}` : undefined;
    recordError(e.message || String(e.error ?? 'error'), where);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as unknown;
    recordError(r instanceof Error ? r.message : String(r ?? 'unhandled rejection'), 'promise');
  });
}
