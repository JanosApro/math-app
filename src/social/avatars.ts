import type { AvatarKey } from './types';

export const AVATARS: { key: AvatarKey; emoji: string; label: string }[] = [
  { key: 'fox', emoji: '🦊', label: 'Róka' },
  { key: 'owl', emoji: '🦉', label: 'Bagoly' },
  { key: 'cat', emoji: '🐱', label: 'Cica' },
  { key: 'panda', emoji: '🐼', label: 'Panda' },
  { key: 'rocket', emoji: '🚀', label: 'Rakéta' },
  { key: 'star', emoji: '⭐', label: 'Csillag' },
];

const BY_KEY = new Map(AVATARS.map((a) => [a.key, a]));

export function isAvatarKey(value: unknown): value is AvatarKey {
  return typeof value === 'string' && BY_KEY.has(value as AvatarKey);
}

export function avatarEmoji(key: string): string {
  return BY_KEY.get(key as AvatarKey)?.emoji ?? '🦊';
}

export function avatarLabel(key: string): string {
  return BY_KEY.get(key as AvatarKey)?.label ?? 'Róka';
}
