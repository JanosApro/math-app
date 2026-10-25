/**
 * React binding for the optional social layer. All cloud writes go through the RPC wrappers;
 * the hook only keeps the UI state and the local cache in sync.
 */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import * as api from './client';
import { SOCIAL_CONFIGURED } from './config';
import { syncOutbox } from './sync';
import { clearSocialLocal, getSocialLocal, subscribeSocialLocal, updateSocialLocal } from './storage';
import type { FriendRequestResult, LeaderboardRow, SocialFriend, SocialProfile, SocialRequest } from './types';

export interface SocialApi {
  configured: boolean;
  loading: boolean;
  busy: boolean;
  error: string | null;
  online: boolean;
  profile: SocialProfile | null;
  friends: SocialFriend[];
  requests: SocialRequest[];
  leaderboard: LeaderboardRow[];
  outboxCount: number;
  recoveryCode: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  saveProfile: (nickname: string, avatar: string) => Promise<void>;
  addFriend: (code: string) => Promise<FriendRequestResult>;
  respond: (id: string, accept: boolean) => Promise<void>;
  remove: (friendId: string) => Promise<void>;
  refresh: () => Promise<void>;
  rotateRecovery: () => Promise<void>;
  dismissRecovery: () => void;
  recover: (friendCode: string, recoveryCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? 'social_error');
}

export function useSocial(): SocialApi {
  const local = useSyncExternalStore(subscribeSocialLocal, getSocialLocal, getSocialLocal);
  const [loading, setLoading] = useState(SOCIAL_CONFIGURED);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const applyProfile = useCallback((profile: SocialProfile) => {
    updateSocialLocal((s) => ({ ...s, enabled: profile.social_enabled, profile }));
  }, []);

  const loadAll = useCallback(async () => {
    const current = getSocialLocal();
    if (!current.profile?.social_enabled) return;
    const [friends, requests, leaderboard] = await Promise.all([
      api.listFriends(),
      api.listFriendRequests(),
      api.friendLeaderboard(),
    ]);
    updateSocialLocal((s) => ({
      ...s,
      friends,
      requests,
      leaderboard,
      lastSyncAt: new Date().toISOString(),
    }));
  }, []);

  const refresh = useCallback(async () => {
    if (!SOCIAL_CONFIGURED) return;
    setError(null);
    try {
      const session = await api.getSession();
      if (!session) {
        updateSocialLocal((s) => ({ ...s, enabled: false, profile: null, friends: [], requests: [], leaderboard: [] }));
        return;
      }
      const result = await api.ensureProfile();
      applyProfile(result.profile);
      if (result.recovery_code) setRecoveryCode(result.recovery_code);
      if (result.profile.social_enabled) await loadAll();
      await syncOutbox();
    } catch (e) {
      setError(message(e));
    }
  }, [applyProfile, loadAll]);

  useEffect(() => {
    if (!SOCIAL_CONFIGURED) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const session = await api.getSession();
        if (!session) return;
        const result = await api.ensureProfile();
        if (cancelled) return;
        applyProfile(result.profile);
        if (result.recovery_code) setRecoveryCode(result.recovery_code);
        if (result.profile.social_enabled) await loadAll();
        await syncOutbox();
      } catch (e) {
        if (!cancelled) setError(message(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const unsubscribeAuth = api.onAuthStateChange((session) => {
      if (!session) {
        updateSocialLocal((s) => ({ ...s, enabled: false, profile: null, friends: [], requests: [], leaderboard: [] }));
      }
    });
    const onOnline = () => {
      setOnline(true);
      void syncOutbox();
      void refresh();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      cancelled = true;
      unsubscribeAuth();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [applyProfile, loadAll, refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await api.ensureAnonymousSession();
      const result = await api.ensureProfile();
      let code = result.recovery_code;
      // A profile can exist with social still off (created earlier but never enabled). Give the
      // student a fresh recovery code now, because the first one may have been lost.
      if (!code && !result.profile.social_enabled) code = await api.rotateRecoveryCode();
      const profile = await api.setProfile(result.profile.nickname, result.profile.avatar, true);
      applyProfile(profile);
      if (code) setRecoveryCode(code);
      await loadAll();
      await syncOutbox();
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, [applyProfile, loadAll]);

  const disable = useCallback(async () => {
    if (!local.profile) return;
    setBusy(true);
    setError(null);
    try {
      const profile = await api.setProfile(local.profile.nickname, local.profile.avatar, false);
      applyProfile(profile);
      // Stop collecting new events while social is off. Keep the outbox: pending XP is sent
      // when the student turns social back on (new events are ignored while disabled).
      updateSocialLocal((s) => ({ ...s, enabled: false, friends: [], requests: [], leaderboard: [] }));
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, [applyProfile, local.profile]);

  const saveProfile = useCallback(
    async (nickname: string, avatar: string) => {
      if (!local.profile) return;
      setBusy(true);
      setError(null);
      try {
        const profile = await api.setProfile(nickname, avatar, local.profile.social_enabled);
        applyProfile(profile);
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [applyProfile, local.profile],
  );

  const addFriend = useCallback(
    async (code: string) => {
      setBusy(true);
      setError(null);
      try {
        const result = await api.sendFriendRequest(code);
        if (result === 'sent') await loadAll();
        return result;
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [loadAll],
  );

  const respond = useCallback(
    async (id: string, accept: boolean) => {
      setBusy(true);
      setError(null);
      try {
        await api.respondFriendRequest(id, accept);
        await loadAll();
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [loadAll],
  );

  const remove = useCallback(
    async (friendId: string) => {
      setBusy(true);
      setError(null);
      try {
        await api.removeFriend(friendId);
        await loadAll();
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [loadAll],
  );

  const rotateRecovery = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setRecoveryCode(await api.rotateRecoveryCode());
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const dismissRecovery = useCallback(() => setRecoveryCode(null), []);

  const recover = useCallback(
    async (friendCode: string, code: string) => {
      setBusy(true);
      setError(null);
      try {
        // Recovering replaces the current anonymous identity. Never silently discard an active
        // social account: the student must sign out first (the old account stays recoverable).
        if (getSocialLocal().profile?.social_enabled) throw new Error('social_active');
        await api.signOutSocial();
        clearSocialLocal();
        await api.ensureAnonymousSession();
        await api.ensureProfile();
        await api.recoverAccount(friendCode, code);
        const result = await api.ensureProfile();
        applyProfile(result.profile);
        if (result.recovery_code) setRecoveryCode(result.recovery_code);
        // The account is already recovered at this point; a failed list refresh or code rotation
        // must not turn that into an error. The next refresh retries the lists, and the old
        // recovery code stays valid until the student rotates it.
        await loadAll().catch(() => {});
        await syncOutbox();
        try {
          setRecoveryCode(await api.rotateRecoveryCode());
        } catch {
          // Keep the code the student just used; they can rotate it later.
        }
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [applyProfile, loadAll],
  );

  const signOut = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await api.signOutSocial();
      clearSocialLocal();
      setRecoveryCode(null);
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount();
      await api.signOutSocial().catch(() => {});
      clearSocialLocal();
      setRecoveryCode(null);
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  return useMemo(
    () => ({
      configured: SOCIAL_CONFIGURED,
      loading,
      busy,
      error,
      online,
      profile: local.profile,
      friends: local.friends,
      requests: local.requests,
      leaderboard: local.leaderboard,
      outboxCount: local.outbox.length,
      recoveryCode,
      enable,
      disable,
      saveProfile,
      addFriend,
      respond,
      remove,
      refresh,
      rotateRecovery,
      dismissRecovery,
      recover,
      signOut,
      deleteAccount,
    }),
    [
      loading,
      busy,
      error,
      online,
      local.profile,
      local.friends,
      local.requests,
      local.leaderboard,
      local.outbox.length,
      recoveryCode,
      enable,
      disable,
      saveProfile,
      addFriend,
      respond,
      remove,
      refresh,
      rotateRecovery,
      dismissRecovery,
      recover,
      signOut,
      deleteAccount,
    ],
  );
}
