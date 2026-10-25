/**
 * Thin, typed wrapper around Supabase. Only the public anon key is used here.
 * All writes that matter (XP, streaks, badges, friendships) go through SECURITY DEFINER RPCs.
 */
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { isAvatarKey } from './avatars';
import { SOCIAL_AUTH_STORAGE_KEY, SOCIAL_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';
import type {
  EnsureProfileResult,
  FriendRequestResult,
  LeaderboardRow,
  SocialFriend,
  SocialProfile,
  SocialRequest,
} from './types';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SOCIAL_CONFIGURED) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: SOCIAL_AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export function isSocialConfigured(): boolean {
  return SOCIAL_CONFIGURED;
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

/** Creates an anonymous Supabase user when there is no session yet. */
export async function ensureAnonymousSession(): Promise<Session> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const existing = await getSession();
  if (existing) return existing;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) throw new Error(error?.message ?? 'anonymous_sign_in_failed');
  return data.session;
}

function asProfile(raw: unknown): SocialProfile | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;
  return {
    id: r.id,
    nickname: typeof r.nickname === 'string' ? r.nickname : 'Felfedező',
    avatar: isAvatarKey(r.avatar) ? r.avatar : 'fox',
    friend_code: typeof r.friend_code === 'string' ? r.friend_code : '',
    social_enabled: r.social_enabled === true,
    xp_total: Number(r.xp_total) || 0,
    streak_current: Number(r.streak_current) || 0,
    streak_best: Number(r.streak_best) || 0,
    created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
}

function asStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
}

function asFriend(raw: unknown): SocialFriend | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.friend_id !== 'string') return null;
  return {
    friend_id: r.friend_id,
    nickname: typeof r.nickname === 'string' ? r.nickname : 'Felfedező',
    avatar: isAvatarKey(r.avatar) ? r.avatar : 'fox',
    xp_total: Number(r.xp_total) || 0,
    streak_current: Number(r.streak_current) || 0,
    week_xp: Number(r.week_xp) || 0,
    badges: asStringArray(r.badges),
  };
}

function asRequest(raw: unknown): SocialRequest | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.request_id !== 'string' || typeof r.requester_id !== 'string') return null;
  return {
    request_id: r.request_id,
    requester_id: r.requester_id,
    nickname: typeof r.nickname === 'string' ? r.nickname : 'Felfedező',
    avatar: isAvatarKey(r.avatar) ? r.avatar : 'fox',
    created_at: typeof r.created_at === 'string' ? r.created_at : '',
  };
}

function asLeaderboardRow(raw: unknown): LeaderboardRow | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.user_id !== 'string') return null;
  return {
    user_id: r.user_id,
    nickname: typeof r.nickname === 'string' ? r.nickname : 'Felfedező',
    avatar: isAvatarKey(r.avatar) ? r.avatar : 'fox',
    week_xp: Number(r.week_xp) || 0,
    xp_total: Number(r.xp_total) || 0,
    streak_current: Number(r.streak_current) || 0,
    badges: asStringArray(r.badges),
    is_self: r.is_self === true,
  };
}

export async function ensureProfile(): Promise<EnsureProfileResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('ensure_profile');
  if (error) throw new Error(error.message);
  const raw = data as { profile?: unknown; recovery_code?: unknown } | null;
  const profile = asProfile(raw?.profile);
  if (!profile) throw new Error('profile_missing');
  return {
    profile,
    recovery_code: typeof raw?.recovery_code === 'string' ? raw.recovery_code : null,
  };
}

export async function setProfile(nickname: string, avatar: string, socialEnabled: boolean): Promise<SocialProfile> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('set_profile', {
    p_nickname: nickname,
    p_avatar: avatar,
    p_social_enabled: socialEnabled,
  });
  if (error) throw new Error(error.message);
  const profile = asProfile(data);
  if (!profile) throw new Error('profile_missing');
  return profile;
}

export async function rotateRecoveryCode(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('rotate_recovery_code');
  if (error) throw new Error(error.message);
  if (typeof data !== 'string') throw new Error('recovery_code_missing');
  return data;
}

export async function findFriend(code: string): Promise<{ id: string; nickname: string; avatar: string } | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('find_by_friend_code', { p_code: code });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;
  return {
    id: r.id,
    nickname: typeof r.nickname === 'string' ? r.nickname : 'Felfedező',
    avatar: isAvatarKey(r.avatar) ? r.avatar : 'fox',
  };
}

export async function sendFriendRequest(code: string): Promise<FriendRequestResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('send_friend_request', { p_code: code });
  if (error) throw new Error(error.message);
  const status = typeof data === 'string' ? data : 'not_found';
  return status as FriendRequestResult;
}

export async function listFriendRequests(): Promise<SocialRequest[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('list_friend_requests');
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []).map(asRequest).filter((x): x is SocialRequest => !!x);
}

export async function respondFriendRequest(id: string, accept: boolean): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('respond_friend_request', { p_id: id, p_accept: accept });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function removeFriend(friendId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('remove_friend', { p_friend_id: friendId });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function listFriends(): Promise<SocialFriend[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('list_friends');
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []).map(asFriend).filter((x): x is SocialFriend => !!x);
}

export async function friendLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('friend_leaderboard');
  if (error) throw new Error(error.message);
  return (Array.isArray(data) ? data : []).map(asLeaderboardRow).filter((x): x is LeaderboardRow => !!x);
}

export interface AwardResult {
  awarded: boolean;
  duplicate: boolean;
  xp: number;
  profile: SocialProfile;
}

export async function awardXp(type: string, key: string): Promise<AwardResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { data, error } = await supabase.rpc('award_xp', { p_event_type: type, p_event_key: key });
  if (error) throw new Error(error.message);
  const raw = data as { awarded?: unknown; duplicate?: unknown; xp?: unknown; profile?: unknown } | null;
  const profile = asProfile(raw?.profile);
  if (!profile) throw new Error('profile_missing');
  return {
    awarded: raw?.awarded === true,
    duplicate: raw?.duplicate === true,
    xp: Number(raw?.xp) || 0,
    profile,
  };
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw new Error(error.message);
}

export async function recoverAccount(friendCode: string, recoveryCode: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('social_not_configured');
  const { error } = await supabase.functions.invoke('recover-account', {
    body: { friendCode, recoveryCode },
  });
  if (error) throw new Error(error.message);
}

export async function signOutSocial(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** Network failures are retryable; validation/permission errors are not. */
export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /failed to fetch|network|load failed|fetch failed|timeout|offline/i.test(message);
}
