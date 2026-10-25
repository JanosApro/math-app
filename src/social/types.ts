export type AvatarKey = 'fox' | 'owl' | 'cat' | 'panda' | 'rocket' | 'star';

export interface SocialProfile {
  id: string;
  nickname: string;
  avatar: AvatarKey;
  friend_code: string;
  social_enabled: boolean;
  xp_total: number;
  streak_current: number;
  streak_best: number;
  created_at?: string;
  updated_at?: string;
}

export interface SocialFriend {
  friend_id: string;
  nickname: string;
  avatar: AvatarKey;
  xp_total: number;
  streak_current: number;
  week_xp: number;
  badges: string[];
}

export interface SocialRequest {
  request_id: string;
  requester_id: string;
  nickname: string;
  avatar: AvatarKey;
  created_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  nickname: string;
  avatar: AvatarKey;
  week_xp: number;
  xp_total: number;
  streak_current: number;
  badges: string[];
  is_self: boolean;
}

export type XpEventType =
  | 'answer'
  | 'answer_hint'
  | 'part'
  | 'part_replay'
  | 'lesson'
  | 'lesson_replay'
  | 'daily'
  | 'daily_answer'
  | 'chapter';

export interface XpEvent {
  /** `${type}:${key}` — used for local dedupe. */
  id: string;
  type: XpEventType;
  key: string;
  createdAt: string;
}

export type FriendRequestResult =
  | 'sent'
  | 'not_found'
  | 'self'
  | 'already_friends'
  | 'pending'
  | 'rate_limited'
  | 'disabled';

export interface SocialLocalState {
  version: 1;
  /** Local mirror of the cloud social_enabled flag. */
  enabled: boolean;
  profile: SocialProfile | null;
  friends: SocialFriend[];
  requests: SocialRequest[];
  leaderboard: LeaderboardRow[];
  outbox: XpEvent[];
  lastSyncAt: string | null;
}

export interface EnsureProfileResult {
  profile: SocialProfile;
  /** Present only when the profile was just created. */
  recovery_code: string | null;
}
