import { todayBelgrade } from '../state/dates';
import { newAttemptId } from './codes';
import type { XpEventType } from './types';

const MODULE_ID = /^g\d+-[a-z0-9-]+-\d{2}$/;
const TOPIC_ID = /^g\d+-[a-z0-9-]+$/;
const KEY = /^[a-z0-9:_-]{1,120}$/;

export function isValidModuleId(id: string): boolean {
  return MODULE_ID.test(id);
}

export function isValidTopicId(id: string): boolean {
  return TOPIC_ID.test(id);
}

export function answerEventType(usedHint: boolean): XpEventType {
  return usedHint ? 'answer_hint' : 'answer';
}

/** Unique per part attempt, so a replay can earn capped answer XP without duplicate keys. */
export function answerEventKey(moduleId: string, stepIndex: number, itemKey: string, attemptId = newAttemptId()): string {
  const step = Math.max(0, Math.trunc(stepIndex));
  const item = itemKey.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'q';
  return `answer:${moduleId}:${step}:${item}:${attemptId}`;
}

export function partEventKey(moduleId: string, part: number): string {
  return `part:${moduleId}:${Math.max(0, Math.trunc(part))}`;
}

export function partReplayEventKey(moduleId: string, part: number, date = todayBelgrade()): string {
  return `part_replay:${moduleId}:${Math.max(0, Math.trunc(part))}:${date}`;
}

export function lessonEventKey(moduleId: string): string {
  return `lesson:${moduleId}`;
}

export function lessonReplayEventKey(moduleId: string, date = todayBelgrade()): string {
  return `lesson_replay:${moduleId}:${date}`;
}

export function dailyEventKey(date = todayBelgrade()): string {
  return `daily:${date}`;
}

export function dailyAnswerEventKey(date: string, index: number): string {
  return `daily_answer:${date}:${Math.max(0, Math.trunc(index))}`;
}

export function chapterEventKey(topicId: string): string {
  return `chapter:${topicId}`;
}

/** Matches the SQL CHECK constraint and the prefixes the server accepts. */
export function isValidEventKey(key: string): boolean {
  if (!KEY.test(key)) return false;
  return (
    key.startsWith('answer:') ||
    key.startsWith('part:') ||
    key.startsWith('part_replay:') ||
    key.startsWith('lesson:') ||
    key.startsWith('lesson_replay:') ||
    key.startsWith('daily:') ||
    key.startsWith('daily_answer:') ||
    key.startsWith('chapter:')
  );
}
