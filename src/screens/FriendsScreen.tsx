/**
 * Route #/friends — optional, pseudonymous social layer.
 *
 * The screen is deliberately a set of cards (not a public profile): own pseudonymous profile,
 * add-by-code, incoming requests, friends, friends-only weekly leaderboard, and privacy actions.
 * Math progress stays local; the shared numbers come from server-side XP events.
 */
import { useEffect, useMemo, useState } from 'react';
import { t } from '../i18n/hu';
import { GRADES, getGradeTopics } from '../content/registry';
import { AVATARS, avatarEmoji } from '../social/avatars';
import { formatFriendCode, formatRecoveryCode, isValidFriendCode, isValidRecoveryCode, normalizeCode } from '../social/codes';
import type { AvatarKey, FriendRequestResult, LeaderboardRow, SocialFriend } from '../social/types';
import { useSocial } from '../social/useSocial';
import { Dialog } from '../ui/Dialog';
import { InfoButton } from '../ui/InfoButton';
import { showToast } from '../ui/Toast';
import './screens.css';
import './Friends.css';

async function copyText(text: string, success: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(success);
  } catch {
    showToast(t.social.errorGeneric);
  }
}

const REQUEST_MESSAGES: Record<FriendRequestResult, string> = {
  sent: t.social.requestSent,
  not_found: t.social.requestNotFound,
  self: t.social.requestSelf,
  already_friends: t.social.requestAlready,
  pending: t.social.requestPending,
  rate_limited: t.social.requestRateLimited,
  disabled: t.social.requestDisabled,
};

function badgeLabel(key: string, topicTitles: Map<string, string>): string {
  if (key.startsWith('streak:')) return t.social.badgeStreak(Number(key.slice(7)) || 0);
  if (key.startsWith('xp:')) return t.social.badgeXp(Number(key.slice(3)) || 0);
  if (key === 'first-lesson') return t.social.badgeFirstLesson;
  if (key.startsWith('chapter:')) return topicTitles.get(key.slice(8)) ?? t.social.badgeChapter;
  return key;
}

function badgeEmoji(key: string): string {
  if (key.startsWith('streak:')) return '🔥';
  if (key.startsWith('xp:')) return '⭐';
  if (key === 'first-lesson') return '🎓';
  if (key.startsWith('chapter:')) return '🏆';
  return '🏅';
}

function BadgeChips({ badges, topicTitles }: { badges: string[]; topicTitles: Map<string, string> }) {
  return (
    <span className="fr-badges" title={badges.map((b) => badgeLabel(b, topicTitles)).join(', ')}>
      {badges.slice(0, 4).map((b) => (
        <span key={b} className="fr-badge" aria-label={badgeLabel(b, topicTitles)}>
          {badgeEmoji(b)}
        </span>
      ))}
      {badges.length > 4 && <span className="fr-badge-more">+{badges.length - 4}</span>}
    </span>
  );
}

export default function FriendsScreen() {
  const social = useSocial();
  const [nickname, setNickname] = useState(social.profile?.nickname ?? '');
  const [avatar, setAvatar] = useState<AvatarKey>(social.profile?.avatar ?? 'fox');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<'profile' | 'friends' | 'ranking' | 'privacy'>('profile');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryFriend, setRecoveryFriend] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SocialFriend | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (social.profile) {
      setNickname(social.profile.nickname);
      setAvatar(social.profile.avatar);
    }
  }, [social.profile?.id, social.profile?.nickname, social.profile?.avatar]);

  const topicTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of GRADES) {
      const topics = getGradeTopics(g.grade);
      if (!topics) continue;
      for (const topic of topics.topics) map.set(topic.id, topic.title);
    }
    return map;
  }, []);

  const run = async (fn: () => Promise<void>, success?: string) => {
    try {
      await fn();
      if (success) showToast(success);
    } catch {
      showToast(t.social.errorGeneric);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!social.profile) return;
    await run(() => social.saveProfile(nickname, avatar), t.social.saved);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCode(code);
    if (!isValidFriendCode(normalized)) {
      showToast(t.social.invalidCode);
      return;
    }
    try {
      const result = await social.addFriend(normalized);
      showToast(REQUEST_MESSAGES[result]);
      if (result === 'sent') setCode('');
    } catch {
      showToast(t.social.errorGeneric);
    }
  };

  const submitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (!isValidFriendCode(recoveryFriend) || !isValidRecoveryCode(recoveryCodeInput)) {
      setRecoveryError(t.social.invalidCode);
      return;
    }
    try {
      await social.recover(recoveryFriend, recoveryCodeInput);
      setRecoveryOpen(false);
      setRecoveryFriend('');
      setRecoveryCodeInput('');
      showToast(t.social.recoverySuccess);
    } catch (error) {
      setRecoveryError(error instanceof Error && error.message === 'social_active' ? t.social.recoveryActive : t.social.recoveryError);
    }
  };

  const openRecovery = () => {
    setRecoveryError(null);
    setRecoveryOpen(true);
  };

  const header = (
    <h1 className="screen-title fr-title">
      {t.social.title}
      <InfoButton title={t.social.privacyTitle}>
        <p>{t.social.privacyBody}</p>
      </InfoButton>
    </h1>
  );

  if (!social.configured) {
    return (
      <div className="page fr">
        {header}
        <section className="card fr-card">
          <h2 className="section-title">{t.social.notConfigured}</h2>
          <p>{t.social.notConfiguredBody}</p>
        </section>
      </div>
    );
  }

  if (social.loading) {
    return (
      <div className="page fr">
        {header}
        <section className="card fr-card fr-loading" aria-live="polite">
          {t.social.loading}
        </section>
      </div>
    );
  }

  const status = (
    <>
      {!social.online && <p className="fr-banner">{t.social.offline}</p>}
      {social.profile?.social_enabled && social.outboxCount > 0 && (
        <p className="fr-banner fr-banner-muted">{t.social.pendingSync(social.outboxCount)}</p>
      )}
      {social.error && (
        <p className="fr-banner fr-banner-bad" role="alert">
          {t.social.error}{' '}
          <button type="button" className="link-btn" onClick={() => void social.refresh()}>
            {t.social.retry}
          </button>
        </p>
      )}
    </>
  );

  const profile = social.profile;
  const enabled = !!profile?.social_enabled;

  return (
    <div className="page fr">
      {header}
      {status}

      {!profile && (
        <>
          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.enable}
              <InfoButton title={t.social.privacyTitle}>
                <p>{t.social.intro}</p>
              </InfoButton>
            </h2>
            <p className="fr-muted fr-hint">{t.social.enableHint}</p>
            <button type="button" className="btn btn-block fr-card-btn" disabled={social.busy} onClick={() => void run(social.enable)}>
              {social.busy ? t.social.enabling : t.social.enable}
            </button>
          </section>
          <section className="card fr-card fr-small-card">
            <h2 className="section-title">
              {t.social.recovery}
              <InfoButton title={t.social.recoveryTitle}>
                <p>{t.social.recoveryBody}</p>
              </InfoButton>
            </h2>
            <button type="button" className="btn btn-ghost btn-block fr-card-btn" onClick={openRecovery}>
              {t.social.recovery}
            </button>
          </section>
        </>
      )}

      {profile && !enabled && (
        <>
          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.disabledTitle}
              <InfoButton title={t.social.disabledTitle}>
                <p>{t.social.disabledBody}</p>
              </InfoButton>
            </h2>
            <p className="fr-muted fr-hint">{t.social.disabledHint}</p>
            <button type="button" className="btn btn-block fr-card-btn" disabled={social.busy} onClick={() => void run(social.enable)}>
              {social.busy ? t.social.enabling : t.social.enable}
            </button>
          </section>
          <section className="card fr-card fr-small-card">
            <h2 className="section-title">{t.social.account}</h2>
            <div className="fr-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSignOutOpen(true)}>
                {t.social.signOut}
              </button>
              <button type="button" className="btn btn-bad" onClick={() => setDeleteOpen(true)}>
                {t.social.deleteAccount}
              </button>
            </div>
          </section>
        </>
      )}

      {profile && enabled && (
        <>
          <div className="fr-tabs" role="tablist" aria-label={t.social.title}>
            {(
              [
                ['profile', t.social.tabProfile],
                ['friends', t.social.tabFriends],
                ['ranking', t.social.tabRanking],
                ['privacy', t.social.tabPrivacy],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`fr-tab${tab === key ? ' is-active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.profileTitle}
              <InfoButton title={t.social.sharedXp}>
                <p>{t.social.sharedSince}</p>
              </InfoButton>
            </h2>
            <form className="fr-profile-form" onSubmit={save}>
              <div className="fr-avatar-row" role="group" aria-label={t.social.avatar}>
                {AVATARS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`fr-avatar-option${avatar === a.key ? ' is-selected' : ''}`}
                    aria-label={a.label}
                    aria-pressed={avatar === a.key}
                    onClick={() => setAvatar(a.key)}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
              <div className="fr-nick-row">
                <div className="fr-field">
                  <span className="fr-label fr-label-row">
                    {t.social.nickname}
                    <InfoButton title={t.social.nickname}>
                      <p>{t.social.nicknameHint}</p>
                    </InfoButton>
                  </span>
                  <input
                    id="fr-nick"
                    className="text-input"
                    value={nickname}
                    maxLength={20}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder={t.social.nickname}
                    aria-label={t.social.nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn" disabled={social.busy || (nickname.trim() === profile.nickname && avatar === profile.avatar)}>
                  {t.social.save}
                </button>
              </div>
            </form>

            <div className="fr-code-row">
              <div>
                <span className="fr-label fr-label-row">
                  {t.social.friendCode}
                  <InfoButton title={t.social.friendCode}>
                    <p>{t.social.friendCodeHint}</p>
                  </InfoButton>
                </span>
                <code className="fr-code">{formatFriendCode(profile.friend_code)}</code>
              </div>
              <button type="button" className="btn btn-small btn-ghost" onClick={() => void copyText(profile.friend_code, t.social.friendCodeCopied)}>
                {t.social.copy}
              </button>
            </div>

            <div className="fr-stats">
              <div className="fr-stat">
                <span className="fr-stat-value">{profile.xp_total}</span>
                <span className="fr-stat-label">{t.social.sharedXp}</span>
              </div>
              <div className="fr-stat">
                <span className="fr-stat-value">🔥 {profile.streak_current}</span>
                <span className="fr-stat-label">{t.social.sharedStreak}</span>
              </div>
            </div>
          </section>
          )}

          {tab === 'friends' && (
          <>
          <section className="card fr-card">
            <h2 className="section-title">{t.social.addFriend}</h2>
            <form className="fr-add-form" onSubmit={add}>
              <input
                className="text-input"
                value={code}
                maxLength={12}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder={t.social.addFriendPlaceholder}
                aria-label={t.social.addFriend}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn" disabled={social.busy || code.trim() === ''}>
                {t.social.addFriendBtn}
              </button>
            </form>
          </section>

          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.requests}
              {social.requests.length > 0 && <span className="fr-count">{social.requests.length}</span>}
            </h2>
            {social.requests.length === 0 ? (
              <p className="fr-empty">{t.social.noRequests}</p>
            ) : (
              <ul className="fr-list">
                {social.requests.map((r) => (
                  <li key={r.request_id} className="fr-person">
                    <span className="fr-avatar" aria-hidden="true">
                      {avatarEmoji(r.avatar)}
                    </span>
                    <span className="fr-person-name">{r.nickname}</span>
                    <span className="fr-person-actions">
                      <button type="button" className="btn btn-small" disabled={social.busy} onClick={() => void run(() => social.respond(r.request_id, true))}>
                        {t.social.accept}
                      </button>
                      <button type="button" className="btn btn-small btn-ghost" disabled={social.busy} onClick={() => void run(() => social.respond(r.request_id, false))}>
                        {t.social.reject}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.friends}
              {social.friends.length > 0 && <span className="fr-count">{social.friends.length}</span>}
            </h2>
            {social.friends.length === 0 ? (
              <p className="fr-empty">{t.social.noFriends}</p>
            ) : (
              <ul className="fr-list">
                {social.friends.map((f) => (
                  <li key={f.friend_id} className="fr-person fr-friend">
                    <span className="fr-avatar" aria-hidden="true">
                      {avatarEmoji(f.avatar)}
                    </span>
                    <span className="fr-person-main">
                      <span className="fr-person-name">{f.nickname}</span>
                      <span className="fr-person-meta">
                        {f.xp_total} XP · 🔥 {f.streak_current}
                      </span>
                    </span>
                    {f.badges.length > 0 && <BadgeChips badges={f.badges} topicTitles={topicTitles} />}
                    <button type="button" className="fr-remove" aria-label={`${t.social.remove}: ${f.nickname}`} onClick={() => setRemoveTarget(f)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </>
          )}

          {tab === 'ranking' && (
          <section className="card fr-card">
            <h2 className="section-title">
              {t.social.leaderboard}
              <InfoButton title={t.social.leaderboard}>
                <p>{t.social.leaderboardInfo}</p>
              </InfoButton>
            </h2>
            {social.leaderboard.length === 0 ? (
              <p className="fr-empty">{t.social.noLeaderboard}</p>
            ) : (
              <ol className="fr-rank-list">
                {social.leaderboard.map((row, i) => (
                  <LeaderboardItem key={row.user_id} row={row} rank={i + 1} topicTitles={topicTitles} />
                ))}
              </ol>
            )}
          </section>
          )}

          {tab === 'privacy' && (
          <section className="card fr-card fr-small-card">
            <h2 className="section-title">{t.social.privacySettings}</h2>
            <p>{t.social.privacySettingsBody}</p>
            <div className="fr-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setDisableOpen(true)}>
                {t.social.disable}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setSignOutOpen(true)}>
                {t.social.signOut}
              </button>
              <button type="button" className="btn btn-bad" onClick={() => setDeleteOpen(true)}>
                {t.social.deleteAccount}
              </button>
            </div>
            <button type="button" className="link-btn fr-inline-link" onClick={() => void run(social.rotateRecovery)}>
              {t.social.newRecoveryCode}
            </button>
          </section>
          )}
        </>
      )}

      <Dialog
        open={!!social.recoveryCode}
        title={t.social.recoveryCodeTitle}
        onClose={social.dismissRecovery}
        actions={
          <button type="button" className="btn btn-block" onClick={social.dismissRecovery}>
            {t.social.recoveryCodeSaved}
          </button>
        }
      >
        <p>{t.social.recoveryCodeBody}</p>
        <p className="fr-warn">{t.social.recoveryCodeOnce}</p>
        {social.recoveryCode && (
          <div className="fr-code-row">
            <code className="fr-code fr-code-recovery">{formatRecoveryCode(social.recoveryCode)}</code>
            <button type="button" className="btn btn-small btn-ghost" onClick={() => void copyText(social.recoveryCode!, t.social.recoveryCodeCopied)}>
              {t.social.copy}
            </button>
          </div>
        )}
      </Dialog>

      <Dialog
        open={recoveryOpen}
        title={t.social.recoveryTitle}
        onClose={() => setRecoveryOpen(false)}
        actions={
          <>
            <button type="submit" form="fr-recovery-form" className="btn" disabled={social.busy}>
              {t.social.recoverBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRecoveryOpen(false)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.social.recoveryBody}</p>
        <p className="fr-warn">{t.social.recoveryWarning}</p>
        <form id="fr-recovery-form" className="fr-dialog-form" onSubmit={submitRecovery}>
          <label className="fr-label" htmlFor="fr-rec-friend">
            {t.social.friendCodeLabel}
          </label>
          <input
            id="fr-rec-friend"
            className="text-input"
            value={recoveryFriend}
            maxLength={12}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t.social.friendCodePlaceholder}
            onChange={(e) => setRecoveryFriend(e.target.value.toUpperCase())}
          />
          <label className="fr-label" htmlFor="fr-rec-code">
            {t.social.recoveryCodeLabel}
          </label>
          <input
            id="fr-rec-code"
            className="text-input"
            value={recoveryCodeInput}
            maxLength={29}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t.social.recoveryCodePlaceholder}
            onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
          />
          {recoveryError && <p className="import-error">{recoveryError}</p>}
        </form>
      </Dialog>

      <Dialog
        open={!!removeTarget}
        title={t.social.remove}
        onClose={() => setRemoveTarget(null)}
        actions={
          <>
            <button
              type="button"
              className="btn btn-bad"
              onClick={() => {
                const target = removeTarget;
                setRemoveTarget(null);
                if (target) void run(() => social.remove(target.friend_id));
              }}
            >
              {t.social.removeBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRemoveTarget(null)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.social.removeConfirm}</p>
      </Dialog>

      <Dialog
        open={disableOpen}
        title={t.social.disable}
        onClose={() => setDisableOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setDisableOpen(false);
                void run(social.disable, t.social.disabledDone);
              }}
            >
              {t.social.disableBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setDisableOpen(false)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.social.disableConfirm}</p>
      </Dialog>

      <Dialog
        open={signOutOpen}
        title={t.social.signOut}
        onClose={() => setSignOutOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSignOutOpen(false);
                void run(social.signOut, t.social.signOutDone);
              }}
            >
              {t.social.signOutBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSignOutOpen(false)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.social.signOutConfirm}</p>
      </Dialog>

      <Dialog
        open={deleteOpen}
        title={t.social.deleteAccount}
        onClose={() => setDeleteOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn-bad"
              onClick={() => {
                setDeleteOpen(false);
                void (async () => {
                  try {
                    await social.deleteAccount();
                    showToast(t.social.deleteDone);
                  } catch {
                    showToast(t.social.deleteError);
                  }
                })();
              }}
            >
              {t.social.deleteBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.social.deleteConfirm}</p>
      </Dialog>
    </div>
  );
}

function LeaderboardItem({ row, rank, topicTitles }: { row: LeaderboardRow; rank: number; topicTitles: Map<string, string> }) {
  return (
    <li className={`fr-rank${row.is_self ? ' is-self' : ''}`}>
      <span className="fr-rank-num">{t.social.rank(rank)}</span>
      <span className="fr-avatar" aria-hidden="true">
        {avatarEmoji(row.avatar)}
      </span>
      <span className="fr-rank-main">
        <span className="fr-person-name">
          {row.nickname}
          {row.is_self && <span className="fr-you"> ({t.social.you})</span>}
        </span>
        <span className="fr-person-meta">
          {row.xp_total} {t.social.totalXp} · 🔥 {row.streak_current}
        </span>
      </span>
      <span className="fr-rank-week">
        <strong>{row.week_xp}</strong>
        <small>{t.social.weekXp}</small>
      </span>
      {row.badges.length > 0 && <BadgeChips badges={row.badges} topicTitles={topicTitles} />}
    </li>
  );
}
