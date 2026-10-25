import type { XpEvent, XpEventType } from './types';

export const OUTBOX_LIMIT = 500;

/** Local dedupe id: one type + one server idempotency key. */
export function eventId(type: XpEventType, key: string): string {
  return `${type}:${key}`;
}

/** Appends an event unless the same type/key is already waiting. Drops the oldest when full. */
export function enqueueEvent(
  list: readonly XpEvent[],
  type: XpEventType,
  key: string,
  now: number | Date = Date.now(),
): XpEvent[] {
  const id = eventId(type, key);
  if (list.some((e) => e.id === id)) return [...list];
  const event: XpEvent = {
    id,
    type,
    key,
    createdAt: (now instanceof Date ? now : new Date(now)).toISOString(),
  };
  return [...list, event].slice(-OUTBOX_LIMIT);
}

/** The next events to send, oldest first. */
export function takeBatch(list: readonly XpEvent[], limit = 10): XpEvent[] {
  return list.slice(0, Math.max(1, limit));
}

export function removeEvent(list: readonly XpEvent[], id: string): XpEvent[] {
  return list.filter((e) => e.id !== id);
}

export function removeEvents(list: readonly XpEvent[], ids: readonly string[]): XpEvent[] {
  const drop = new Set(ids);
  return list.filter((e) => !drop.has(e.id));
}

export function outboxCount(list: readonly XpEvent[]): number {
  return list.length;
}
