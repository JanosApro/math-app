/**
 * Route #/profile: nickname, level + XP, lessons/chapters done, current and best streak,
 * a calendar of the last 5 weeks (Monday first, done days marked with 🔥 — not only by color),
 * chapter badges and streak badges (7 / 30 / 100). Everything is for the current grade.
 */
import { useMemo, type CSSProperties } from 'react';
import { flatten, topicColor } from '../content/catalog';
import { GRADES, getGradeTopics } from '../content/registry';
import { t } from '../i18n/hu';
import { computeStreak } from '../state/progress';
import { addDays, formatDateHu, todayBelgrade, weekdayMon0 } from '../state/dates';
import { gradeProgress, useAppState, type GradeProgress } from '../state/store';
import { levelFromXp, STREAK_MILESTONES } from '../state/xp';
import { LockIcon, XpIcon } from '../ui/AppShellIcons';
import { TopicIcon } from '../ui/TopicIcon';
import { routeToHash } from '../ui/router';
import './screens.css';
import './Profile.css';

const WEEKS = 5;

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
            const done = !!gp.daily[d];
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
  const streak = useMemo(() => (gp ? computeStreak(Object.keys(gp.daily), today) : null), [gp, today]);
  if (grade === null || !gp || !streak) return null;

  const lv = levelFromXp(gp.xp);
  const lvPct = ((gp.xp - lv.current) / (lv.next - lv.current)) * 100;
  const all = topics ? flatten(topics) : [];
  const lessonsDone = all.filter((f) => gp.subtopics[f.sub.id]?.completedAt).length;
  const chaptersDone = Object.keys(gp.chapters).length;
  const gradeLabel = GRADES.find((g) => g.grade === grade)?.label ?? t.common.grade(grade);
  const initial = (nickname.trim()[0] ?? '?').toUpperCase();

  return (
    <div className="page pf">
      <h1 className="screen-title">{t.profile.title}</h1>

      <section className="card pf-hero">
        <span className={`pf-avatar${nickname ? '' : ' is-anon'}`} aria-hidden="true">
          {nickname ? initial : '★'}
        </span>
        <div className="pf-hero-text">
          <span className="pf-name">{nickname || t.profile.anonymous}</span>
          <span className="pf-grade">{gradeLabel}</span>
          <a className="link-btn pf-edit" href={routeToHash({ name: 'settings' })}>
            {t.profile.editNickname}
          </a>
        </div>
      </section>

      <section className="card pf-level" aria-labelledby="pf-level-title">
        <div className="pf-level-head">
          <span className="pf-level-badge" aria-hidden="true">
            {lv.level}
          </span>
          <div className="pf-level-text">
            <h2 id="pf-level-title" className="pf-level-title">
              {t.profile.level(lv.level)}
            </h2>
            <span className="pf-level-sub">{t.profile.xpToNext(lv.next - gp.xp)}</span>
          </div>
          <span className="pf-xp">
            <XpIcon size={18} />
            {gp.xp} {t.common.xp}
          </span>
        </div>
        <div className="pbar pf-level-bar" role="progressbar" aria-valuemin={lv.current} aria-valuemax={lv.next} aria-valuenow={gp.xp} aria-label={t.profile.level(lv.level)}>
          <div className={`pbar-fill${gp.xp === lv.current ? ' is-zero' : ''}`} style={{ width: `${lvPct}%` }} />
        </div>
      </section>

      <section className="pf-stats" aria-label={t.profile.title}>
        <div className="pf-stat">
          <span className="pf-stat-value">
            {lessonsDone}
            <small> / {all.length}</small>
          </span>
          <span className="pf-stat-label">{t.profile.lessonsDone}</span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-value">
            {chaptersDone}
            <small> / {topics?.topics.length ?? 0}</small>
          </span>
          <span className="pf-stat-label">{t.profile.chaptersDone}</span>
        </div>
        <div className="pf-stat pf-stat-streak">
          <span className="pf-stat-value">
            <span aria-hidden="true">🔥</span> {streak.current}
          </span>
          <span className="pf-stat-label">{t.streak.current}</span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-value">{streak.best}</span>
          <span className="pf-stat-label">{t.streak.best}</span>
        </div>
      </section>

      <section className="card" aria-labelledby="pf-cal-title">
        <h2 id="pf-cal-title" className="section-title">
          <span aria-hidden="true">📅</span> {t.streak.calendar}
        </h2>
        <Calendar gp={gp} today={today} />
        <p className="field-hint">{t.streak.explain}</p>
      </section>

      <section className="card" aria-labelledby="pf-badges-title">
        <h2 id="pf-badges-title" className="section-title">
          <span aria-hidden="true">🏅</span> {t.profile.badges}
        </h2>
        {chaptersDone === 0 && gp.streakBadges.length === 0 && <p className="pf-nobadges">{t.profile.noBadges}</p>}
        <h3 className="pf-badges-sub">{t.profile.chapterBadges}</h3>
        <ul className="pf-badges">
          {topics?.topics.map((tp) => {
            const earned = !!gp.chapters[tp.id];
            return (
              <li key={tp.id} className={`pf-badge${earned ? ' is-earned' : ''}`} style={{ '--badge': topicColor(topics, tp) } as CSSProperties}>
                <span className="pf-badge-disc" aria-hidden="true">
                  <TopicIcon name={tp.icon} size={30} />
                  {!earned && (
                    <span className="pf-badge-lock">
                      <LockIcon size={14} />
                    </span>
                  )}
                </span>
                <span className="pf-badge-name">{t.badges.chapter(tp.title)}</span>
                <span className="pf-badge-state">{earned ? t.profile.earned : t.profile.notEarned}</span>
              </li>
            );
          })}
        </ul>
        <h3 className="pf-badges-sub">{t.profile.streakBadges}</h3>
        <ul className="pf-badges">
          {STREAK_MILESTONES.map((m) => {
            const earned = gp.streakBadges.includes(m);
            const name = m === 7 ? t.badges.streak7 : m === 30 ? t.badges.streak30 : t.badges.streak100;
            return (
              <li key={m} className={`pf-badge pf-badge-streak${earned ? ' is-earned' : ''}`}>
                <span className="pf-badge-disc" aria-hidden="true">
                  <span className="pf-badge-fire">🔥</span>
                  <span className="pf-badge-num">{m}</span>
                  {!earned && (
                    <span className="pf-badge-lock">
                      <LockIcon size={14} />
                    </span>
                  )}
                </span>
                <span className="pf-badge-name">{name}</span>
                <span className="pf-badge-state">{earned ? t.profile.earned : t.profile.notEarned}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
