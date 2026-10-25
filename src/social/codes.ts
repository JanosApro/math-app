/** Friend codes and recovery codes: uppercase, no ambiguous 0/O/1/I characters. */
export const FRIEND_CODE_LENGTH = 8;
export const RECOVERY_CODE_LENGTH = 20;
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Uppercase and strip spaces/hyphens. The server does the same before lookup. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidFriendCode(input: string): boolean {
  return new RegExp(`^[A-HJ-NP-Z2-9]{${FRIEND_CODE_LENGTH}}$`).test(normalizeCode(input));
}

export function isValidRecoveryCode(input: string): boolean {
  return new RegExp(`^[A-HJ-NP-Z2-9]{${RECOVERY_CODE_LENGTH}}$`).test(normalizeCode(input));
}

/** ABCD2345EFGH6789JKLM → ABCD-2345-EFGH-6789-JKLM */
export function formatRecoveryCode(input: string): string {
  const code = normalizeCode(input);
  return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
}

export function formatFriendCode(input: string): string {
  return normalizeCode(input).replace(/(.{4})(?=.)/g, '$1 ');
}

/** Random id for one lesson part attempt; keeps answer event keys unique across replays. */
export function newAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
