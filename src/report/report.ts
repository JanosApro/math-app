/**
 * Pure helpers of the bug report: the context object that travels with a report and the small
 * local outbox (reports wait here while offline or while the Supabase project is not set up).
 */
import { formatAnswer } from '../engine/answers';
import type { CapturedError, ReportQuestion } from './context';

export type ReportKind = 'wrong_answer' | 'bug' | 'other';

export interface PendingReport {
  key: string;
  kind: ReportKind;
  message: string;
  context: Record<string, unknown>;
  createdAt: string;
  tries: number;
}

/** At most this many reports wait locally; the oldest is dropped first. */
export const PENDING_LIMIT = 10;
/** Report text limit in the dialog (the server allows 2000). */
export const MESSAGE_LIMIT = 500;
/** The server refuses a context over 16 kB; stay well below. */
const CONTEXT_CHARS = 12000;

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** A random lower-case id the server accepts (`^[a-z0-9-]{8,64}$`). */
export function newReportId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `r${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export interface ContextInput {
  page: string;
  grade: number | null;
  appVersion: string;
  device: { userAgent: string; viewport: string; pixelRatio: number; language: string; online: boolean; theme: string };
  question: ReportQuestion | null;
  errors: CapturedError[];
  now: Date;
}

/** The question on screen as plain data: where it came from, the task, the right and the given answer. */
function questionContext(q: ReportQuestion): Record<string, unknown> {
  const o = q.origin;
  const origin = o ? [o.subtopic, o.generator, o.level !== undefined ? `L${o.level}` : undefined, o.part !== undefined ? `${o.part + 1}. rész` : undefined, o.step !== undefined ? `${o.step + 1}. lépés` : undefined].filter(Boolean).join(' · ') : undefined;
  let correct: string | undefined;
  try {
    correct = formatAnswer(q.question.answer);
  } catch {
    correct = undefined;
  }
  return {
    origin,
    subtopic: o?.subtopic,
    generator: o?.generator,
    level: o?.level,
    seed: q.seed,
    mode: q.mode,
    prompt: clip(q.question.prompt, 2000),
    correct: correct && clip(correct, 500),
    student: q.student ? clip(JSON.stringify(q.student), 500) : undefined,
    studentCorrect: q.correct,
  };
}

/** Everything that travels with a report besides the student's own words. No personal data. */
export function buildReportContext(input: ContextInput): Record<string, unknown> {
  const ctx: Record<string, unknown> = {
    page: clip(input.page, 200),
    grade: input.grade,
    appVersion: input.appVersion,
    sentAt: input.now.toISOString(),
    device: { ...input.device, userAgent: clip(input.device.userAgent, 300) },
    question: input.question ? questionContext(input.question) : undefined,
    errors: input.errors.length ? input.errors : undefined,
  };
  // keep the context small: drop the error list first, then shorten the task text
  if (JSON.stringify(ctx).length > CONTEXT_CHARS) delete ctx.errors;
  if (JSON.stringify(ctx).length > CONTEXT_CHARS && ctx.question) {
    const q = ctx.question as Record<string, unknown>;
    q.prompt = clip(String(q.prompt ?? ''), 300);
  }
  return JSON.parse(JSON.stringify(ctx)) as Record<string, unknown>; // drops undefined fields
}

/** Adds a report to the outbox; the oldest falls out beyond PENDING_LIMIT. */
export function addPending(list: PendingReport[], r: PendingReport): PendingReport[] {
  const next = [...list.filter((x) => x.key !== r.key), r];
  return next.slice(Math.max(0, next.length - PENDING_LIMIT));
}

export function removePending(list: PendingReport[], key: string): PendingReport[] {
  return list.filter((x) => x.key !== key);
}

/** The text a report needs: a wrong-answer report may be empty (the task says it all). */
export function canSend(kind: ReportKind, message: string): boolean {
  return kind === 'wrong_answer' || message.trim().length >= 3;
}
