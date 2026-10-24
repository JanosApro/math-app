/**
 * Route #/profile — fits one phone screen: nickname + level + XP bar, four small stats (lessons,
 * chapters, current and best streak), a calendar of the last weeks (days with a finished lesson
 * part, mini test or daily challenge marked with 🔥 — not only by color; the streak rule behind
 * ⓘ) and one swipeable row of badges (earned first; tap one for its name). Current grade only.
 */
import { useMemo, useState, type CSSProperties } from 'react';
import { flatten, topicColor } from '../content/catalog';
import { GRADES, getGradeTopics } from '../content/registry';
import { t } from '../i18n/hu';
import { gradeStreak } from '../state/progress';
import { addDays, formatDateHu, todayBelgrade, weekdayMon0 } from '../state/dates';
import { gradeProgress, useAppState, type GradeProgress } from '../state/store';
import { levelFromXp, STREAK_MILESTONES } from '../state/xp';
import { LockIcon, XpIcon } from '../ui/AppShellIcons';
import { Dialog } from '../ui/Dialog';
import { InfoButton } from '../ui/InfoButton';
import { TopicIcon } from '../ui/TopicIcon';
import { routeToHash } from '../ui/router';
import './screens.css';
import './Profile.css';

const WEEKS = 4;

function Calendar({ gp, today }: { gp: GradeProgress; today: string }) {
  // Monday of the week (WEEKS − 1) weeks ago … Sunday of this week
  const start = addDays(today, -weekdayMon0(today) - 7 * (WEEKS - 1));
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
  return (
    <div className="pf-cal" role="table" aria-label={t.streak.calendar}>
      <div className="pf-cal-row pf-cal-head" role="row">
        {t.streak.weekdays.map((w) => (
          <span key={w} className="pf-cal-wd" role="columnheader">
            {w}
          </span>
        ))}
      </div>
      {Array.from({ length: WEEKS }, (_, w) => (
        <div key={w} className="pf-cal-row" role="row">
          {days.slice(w * 7, w * 7 + 7).map((d) => {
            const done = !!gp.daily[d] || (gp.activity?.[d] ?? 0) > 0;
            const isToday = d === today;
            const future = d > today;
            const day = Number(d.slice(8));
            const cls = ['pf-cal-day', done ? 'is-done' : '', isToday ? 'is-today' : '', future ? 'is-future' : ''].filter(Boolean).join(' ');
            return (
              <span key={d} className={cls} role="cell" aria-label={`${formatDateHu(d)}${isToday ? ` (${t.streak.today})` : ''}${done ? ` – ${t.streak.dayDone}` : ''}`}>
                {done ? (
                  <span className="pf-cal-fire" aria-hidden="true">
                    🔥
                  </span>
                ) : null}
                <span className="pf-cal-num" aria-hidden="true">
                  {day}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function ProfileScreen() {
  const grade = useAppState((s) => s.grade);
  const nickname = useAppState((s) => s.nickname);
  const gp = useAppState((s) => (grade === null ? null : gradeProgress(s, grade)));
  const today = useMemo(() => todayBelgrade(), []);
  const topics = grade === null ? undefined : getGradeTopics(grade);
  const streak = useMemo(() => (gp ? gradeStreak(gp, today) : null), [gp, today]);
  const [badgeOpen, setBadgeOpen] = useState<string | null>(null);
  if (grade === null || !gp || !streak) return null;

  const lv = levelFromXp(gp.xp);
  const lvPct = ((gp.xp - lv.current) / (lv.next - lv.current)) * 100;
  const all = topics ? flatten(topics) : [];
  const lessonsDone = all.filter((f) => gp.subtopics[f.sub.id]?.completedAt).length;
  const chaptersDone = Object.keys(gp.chapters).length;
  const gradeLabel = GRADES.find((g) => g.grade === grade)?.label ?? t.common.grade(grade);
  const initial = (nickname.trim()[0] ?? '?').toUpperCase();

  type Badge = { key: string; name: string; earned: boolean; color?: string; icon?: string; streak?: number };
  const badges: Badge[] = [
    ...(topics?.topics ?? []).map((tp) => ({ key: tp.id, name: t.badges.chapter(tp.title), earned: !!gp.chapters[tp.id], color: topicColor(topics!, tp), icon: tp.icon })),
    ...STREAK_MILESTONES.map((m) => ({
      key: `streak-${m}`,
      name: m === 7 ? t.badges.streak7 : m === 30 ? t.badges.streak30 : t.badges.streak100,
      earned: gp.streakBadges.includes(m),
      streak: m,
    })),
  ];
  const earnedFirst = [...badges.filter((b) => b.earned), ...badges.filter((b) => !b.earned)];
  const open = badges.find((b) => b.key === badgeOpen);

  return (
    <div className="page pf">
      <h1 className="sr-only">{t.profile.title}</h1>

      <section className="card pf-hero" aria-label={t.profile.title}>
        <div className="pf-hero-top">
          <span className={`pf-avatar${nickname ? '' : ' is-anon'}`} aria-hidden="true">
            {nickname ? initial : '★'}
          </span>
          <div className="pf-hero-text">
            <span className="pf-name">
              {nickname || t.profile.anonymous}
              <a className="pf-edit" href={routeToHash({ name: 'settings' })} aria-label={t.profile.editNickname} title={t.profile.editNickname}>
                ✏️
              </a>
            </span>
            <span className="pf-grade">{gradeLabel}</span>
          </div>
          <span className="pf-level-badge" title={t.profile.level(lv.level)}>
            <span className="sr-only">{t.profile.level(lv.level)}</span>
            <span aria-hidden="true">{lv.level}</span>
          </span>
        </div>
        <div className="pf-level-row">
          <span className="pf-xp">
            <XpIcon size={16} />
            {gp.xp} {t.common.xp}
          </span>
          <div className="pbar pf-level-bar" role="progressbar" aria-valuemin={lv.current} aria-valuemax={lv.next} aria-valuenow={gp.xp} aria-label={t.profile.level(lv.level)}>
            <div className={`pbar-fill${gp.xp === lv.current ? ' is-zero' : ''}`} style={{ width: `${lvPct}%` }} />
          </div>
        </div>
      </section>

      <section className="pf-stats" aria-label={t.profile.stats}>
        <div className="pf-stat">
          <span className="pf-stat-value">
            {lessonsDone}
            <small>/{all.length}</small>
          </span>
          <span className="pf-stat-label">{t.profile.statLessons}</span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-value">
            {chaptersDone}
            <small>/{topics?.topics.length ?? 0}</small>
          </span>
          <span className="pf-stat-label">{t.profile.statChapters}</span>
        </div>
        <div className="pf-stat pf-stat-streak">
          <span className="pf-stat-value">
            <span aria-hidden="true">🔥</span>
            {streak.current}
          </span>
          <span className="pf-stat-label">{t.profile.statStreak}</span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-value">
            <span aria-hidden="true">🏆</span>
            {streak.best}
          </span>
          <span className="pf-stat-label">{t.profile.statBest}</span>
        </div>
      </section>

      <section className="card pf-cal-card" aria-labelledby="pf-cal-title">
        <h2 id="pf-cal-title" className="section-title">
          {t.streak.calendar}
          <InfoButton title={t.streak.label}>
            <p>{t.streak.explain}</p>
          </InfoButton>
        </h2>
        <Calendar gp={gp} today={today} />
      </section>

      <section className="card pf-badges-card" aria-labelledby="pf-badges-title">
        <h2 id="pf-badges-title" className="section-title">
          {t.profile.badges}
          <span className="pf-badges-count">
            {badges.filter((b) => b.earned).length}/{badges.length}
          </span>
        </h2>
        <ul className="pf-badges">
          {earnedFirst.map((b) => (
            <li key={b.key}>
              <button
                type="button"
                className={`pf-badge${b.earned ? ' is-earned' : ''}${b.streak ? ' pf-badge-streak' : ''}`}
                style={b.color ? ({ '--badge-src': b.color } as CSSProperties) : undefined}
                onClick={() => setBadgeOpen(b.key)}
                aria-label={`${b.name} – ${b.earned ? t.profile.earned : t.profile.notEarned}`}
                title={b.name}
              >
                <BadgeDisc b={b} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Dialog
        open={!!open}
        title={open?.name ?? ''}
        onClose={() => setBadgeOpen(null)}
        actions={
          <button type="button" className="btn" onClick={() => setBadgeOpen(null)}>
            {t.common.ok}
          </button>
        }
      >
        {open && (
          <div className="pf-badge-detail">
            <span className={`pf-badge${open.earned ? ' is-earned' : ''}${open.streak ? ' pf-badge-streak' : ''}`} style={open.color ? ({ '--badge-src': open.color } as CSSProperties) : undefined}>
              <BadgeDisc b={open} />
            </span>
            <p>{open.earned ? t.profile.badgeEarned : open.streak ? t.profile.badgeStreakHow(open.streak) : t.profile.badgeChapterHow}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function BadgeDisc({ b }: { b: { earned: boolean; icon?: string; streak?: number } }) {
  return (
    <span className="pf-badge-disc" aria-hidden="true">
      {b.streak ? (
        <>
          <span className="pf-badge-fire">🔥</span>
          <span className="pf-badge-num">{b.streak}</span>
        </>
      ) : (
        <TopicIcon name={b.icon} size={28} />
      )}
      {!b.earned && (
        <span className="pf-badge-lock">
          <LockIcon size={12} />
        </span>
      )}
    </span>
  );
}
