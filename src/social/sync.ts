/**
 * Offline-first XP outbox. Local gameplay writes an event immediately; this module sends it to
 * the server when possible. The server owns the XP amount, streak and badges.
 */
import { awardXp, getSession, isNetworkError } from './client';
import { SOCIAL_CONFIGURED } from './config';
import { enqueueEvent, outboxCount, removeEvent, takeBatch } from './outbox';
import { getSocialLocal, updateSocialLocal } from './storage';
import type { XpEventType } from './types';

let syncing = false;
let initialized = false;

export interface SyncResult {
  synced: number;
  pending: number;
  stoppedOffline: boolean;
}

/** The server's per-minute limit is temporary: keep the events for the next trigger. */
function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /too many xp events|rate limit/i.test(message);
}

/** Adds one event to the local outbox (only while the social feature is enabled). */
export function queueXpEvent(type: XpEventType, key: string): void {
  if (!SOCIAL_CONFIGURED) return;
  const local = getSocialLocal();
  if (!local.enabled) return;
  updateSocialLocal((s) => ({ ...s, outbox: enqueueEvent(s.outbox, type, key) }));
  void syncOutbox();
}

/**
 * Sends a small batch. Duplicate keys are treated as success; validation/cap errors are dropped;
 * network errors keep the events for the next online/visibility change.
 */
export async function syncOutbox(): Promise<SyncResult> {
  const local = getSocialLocal();
  if (!SOCIAL_CONFIGURED || !local.enabled || typeof navigator === 'undefined' || !navigator.onLine) {
    return { synced: 0, pending: outboxCount(local.outbox), stoppedOffline: true };
  }
  if (syncing) return { synced: 0, pending: outboxCount(local.outbox), stoppedOffline: false };

  syncing = true;
  let synced = 0;
  let stoppedOffline = false;
  let rateLimited = false;
  try {
    const session = await getSession();
    if (!session) return { synced: 0, pending: outboxCount(getSocialLocal().outbox), stoppedOffline: false };

    // Drain in small batches. A single trigger can therefore clear a long offline backlog;
    // a network error stops the loop and keeps the remaining events for the next trigger.
    for (let round = 0; round < 50; round++) {
      const batch = takeBatch(getSocialLocal().outbox, 10);
      if (batch.length === 0) break;
      let progressed = false;
      for (const event of batch) {
        try {
          const result = await awardXp(event.type, event.key);
          updateSocialLocal((s) => ({
            ...s,
            profile: result.profile,
            outbox: removeEvent(s.outbox, event.id),
            lastSyncAt: new Date().toISOString(),
          }));
          synced++;
          progressed = true;
        } catch (error) {
          if (isNetworkError(error)) {
            stoppedOffline = true;
            break;
          }
          if (isRateLimitError(error)) {
            // Temporary: stop and leave the remaining events for the next trigger.
            rateLimited = true;
            break;
          }
          // Invalid key, permission, social disabled or a daily cap: retrying cannot help.
          console.warn('Dropping social XP event', event.type, event.key, error);
          updateSocialLocal((s) => ({ ...s, outbox: removeEvent(s.outbox, event.id) }));
          progressed = true;
        }
      }
      if (stoppedOffline || rateLimited || !progressed) break;
    }
  } catch (error) {
    if (!isNetworkError(error)) console.warn('Social sync failed', error);
    stoppedOffline = isNetworkError(error);
  } finally {
    syncing = false;
  }

  return { synced, pending: outboxCount(getSocialLocal().outbox), stoppedOffline };
}

/** Call once from the app shell. Safe to call more than once. */
export function initSocialSync(): () => void {
  if (!SOCIAL_CONFIGURED || initialized || typeof window === 'undefined') return () => {};
  initialized = true;

  const onOnline = () => void syncOutbox();
  const onVisible = () => {
    if (document.visibilityState === 'visible') void syncOutbox();
  };
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisible);
  void syncOutbox();

  return () => {
    window.removeEventListener('online', onOnline);
    document.removeEventListener('visibilitychange', onVisible);
    initialized = false;
  };
}
