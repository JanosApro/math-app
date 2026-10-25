/**
 * Local-only entry point for gameplay code. It never imports Supabase: the outbox is written
 * immediately, and a dynamic import starts the sync when possible.
 */
import { enqueueEvent } from './outbox';
import { getSocialLocal, updateSocialLocal } from './storage';
import type { XpEventType } from './types';

export function queueXpEvent(type: XpEventType, key: string): void {
  const local = getSocialLocal();
  if (!local.enabled) return;
  updateSocialLocal((s) => ({ ...s, outbox: enqueueEvent(s.outbox, type, key) }));
  void import('./sync')
    .then((m) => m.syncOutbox())
    .catch(() => {});
}
