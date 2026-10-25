/**
 * Local social cache + offline outbox. Separate from the math progress key, so the existing
 * progress format and storage migration stay untouched.
 *
 * Cloud data is never overwritten automatically: the outbox only appends XP events, and profile
 * fields change only after an explicit user action.
 */
import { isAvatarKey } from './avatars';
import { isValidEventKey } from './eventKeys';
import type { LeaderboardRow, SocialFriend, SocialLocalState, SocialProfile, SocialRequest, XpEvent } from './types';

const KEY = 'zsebmatek-social:v1';

const empty = (): SocialLocalState => ({
  version: 1,
  enabled: false,
  profile: null,
  friends: [],
  requests: [],
  leaderboard: [],
  outbox: [],
  lastSyncAt: null,
});

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

function profileFrom(raw: unknown): SocialProfile | null {
  if (!isObj(raw) || typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    nickname: typeof raw.nickname === 'string' ? raw.nickname.slice(0, 20) : 'Felfedező',
    avatar: isAvatarKey(raw.avatar) ? raw.avatar : 'fox',
    friend_code: typeof raw.friend_code === 'string' ? raw.friend_code : '',
    social_enabled: raw.social_enabled === true,
    xp_total: Number(raw.xp_total) || 0,
    streak_current: Number(raw.streak_current) || 0,
    streak_best: Number(raw.streak_best) || 0,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

function friendFrom(raw: unknown): SocialFriend | null {
  if (!isObj(raw) || typeof raw.friend_id !== 'string') return null;
  return {
    friend_id: raw.friend_id,
    nickname: typeof raw.nickname === 'string' ? raw.nickname : 'Felfedező',
    avatar: isAvatarKey(raw.avatar) ? raw.avatar : 'fox',
    xp_total: Number(raw.xp_total) || 0,
    streak_current: Number(raw.streak_current) || 0,
    week_xp: Number(raw.week_xp) || 0,
    badges: Array.isArray(raw.badges) ? raw.badges.filter((b): b is string => typeof b === 'string') : [],
  };
}

function requestFrom(raw: unknown): SocialRequest | null {
  if (!isObj(raw) || typeof raw.request_id !== 'string' || typeof raw.requester_id !== 'string') return null;
  return {
    request_id: raw.request_id,
    requester_id: raw.requester_id,
    nickname: typeof raw.nickname === 'string' ? raw.nickname : 'Felfedező',
    avatar: isAvatarKey(raw.avatar) ? raw.avatar : 'fox',
    created_at: typeof raw.created_at === 'string' ? raw.created_at : '',
  };
}

function leaderboardFrom(raw: unknown): LeaderboardRow | null {
  if (!isObj(raw) || typeof raw.user_id !== 'string') return null;
  return {
    user_id: raw.user_id,
    nickname: typeof raw.nickname === 'string' ? raw.nickname : 'Felfedező',
    avatar: isAvatarKey(raw.avatar) ? raw.avatar : 'fox',
    week_xp: Number(raw.week_xp) || 0,
    xp_total: Number(raw.xp_total) || 0,
    streak_current: Number(raw.streak_current) || 0,
    badges: Array.isArray(raw.badges) ? raw.badges.filter((b): b is string => typeof b === 'string') : [],
    is_self: raw.is_self === true,
  };
}

function eventFrom(raw: unknown): XpEvent | null {
  if (!isObj(raw) || typeof raw.type !== 'string' || typeof raw.key !== 'string') return null;
  if (!isValidEventKey(raw.key)) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : `${raw.type}:${raw.key}`,
    type: raw.type as XpEvent['type'],
    key: raw.key,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date(0).toISOString(),
  };
}

function sanitize(raw: unknown): SocialLocalState {
  if (!isObj(raw)) return empty();
  const out = empty();
  out.enabled = raw.enabled === true;
  out.profile = profileFrom(raw.profile);
  out.friends = Array.isArray(raw.friends) ? raw.friends.map(friendFrom).filter((x): x is SocialFriend => !!x) : [];
  out.requests = Array.isArray(raw.requests) ? raw.requests.map(requestFrom).filter((x): x is SocialRequest => !!x) : [];
  out.leaderboard = Array.isArray(raw.leaderboard) ? raw.leaderboard.map(leaderboardFrom).filter((x): x is LeaderboardRow => !!x) : [];
  out.outbox = Array.isArray(raw.outbox) ? raw.outbox.map(eventFrom).filter((x): x is XpEvent => !!x).slice(-500) : [];
  out.lastSyncAt = typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null;
  return out;
}

function read(): SocialLocalState {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

let snapshot: SocialLocalState = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSocialLocal(): SocialLocalState {
  return snapshot;
}

export function subscribeSocialLocal(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(next: SocialLocalState) {
  snapshot = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage can be blocked; the in-memory snapshot still works for this tab.
    }
  }
  emit();
}

export function updateSocialLocal(fn: (current: SocialLocalState) => SocialLocalState): void {
  const next = fn(snapshot);
  if (next !== snapshot) write(next);
}

export function setSocialLocal(next: SocialLocalState): void {
  write(next);
}

export function clearSocialLocal(): void {
  write(empty());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      snapshot = read();
      emit();
    }
  });
}
