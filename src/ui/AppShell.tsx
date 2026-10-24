/**
 * App chrome around the main screens (map, profile, settings):
 * - top bar: logo + app name + grade, streak 🔥 chip and XP chip (both link to the profile);
 * - navigation: bottom tab bar on phones (safe-area aware), a side rail on desktop (≥ 900 px);
 *   "Napi kihívás" gets a dot while today's challenge is not done yet;
 * - a short fade/slide transition whenever the route changes.
 * Lesson and daily-challenge screens are full-screen (App.tsx renders them without the shell).
 */
import { useMemo, type ReactNode } from 'react';
import type { Route } from './router';
import { routeToHash } from './router';
import { t } from '../i18n/hu';
import { gradeProgress, useAppState } from '../state/store';
import { gradeStreak } from '../state/progress';
import { todayBelgrade } from '../state/dates';
import { GRADES } from '../content/registry';
import { Logo, NavIcon, XpIcon, type NavIconName } from './AppShellIcons';
import { ThemeToggle } from './ThemeToggle';
import './AppShell.css';

const NAV: { name: NavIconName; route: Route; label: string }[] = [
  { name: 'map', route: { name: 'map' }, label: t.nav.map },
  { name: 'daily', route: { name: 'daily' }, label: t.nav.daily },
  { name: 'profile', route: { name: 'profile' }, label: t.nav.profile },
  { name: 'settings', route: { name: 'settings' }, label: t.nav.settings },
];

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  const grade = useAppState((s) => s.grade);
  const gp = useAppState((s) => (grade === null ? null : gradeProgress(s, grade)));
  const today = todayBelgrade();
  const streak = useMemo(() => (gp ? gradeStreak(gp, today) : null), [gp, today]);
  const xp = gp?.xp ?? 0;
  const gradeLabel = grade === null ? '' : (GRADES.find((g) => g.grade === grade)?.label ?? t.common.grade(grade));
  const dailyPending = grade !== null && !!gp && !gp.daily[today];

  return (
    <div className="shell">
      <a className="shell-skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        {t.shell.skipToContent}
      </a>
      <header className="shell-top">
        <a className="shell-brand" href={routeToHash({ name: 'map' })} aria-label={t.shell.home}>
          <Logo size={36} />
          <span className="shell-brand-text">
            <span className="shell-brand-name">{t.appName}</span>
            {gradeLabel && <span className="shell-brand-grade">{gradeLabel}</span>}
          </span>
        </a>
        {grade !== null && streak && (
          <div className="shell-stats">
            <ThemeToggle />
            <a
              className={`shell-chip shell-chip-streak${streak.doneToday ? ' is-lit' : ''}`}
              href={routeToHash({ name: 'profile' })}
              aria-label={t.shell.streakAria(streak.current) + (streak.doneToday ? '' : ` – ${t.shell.streakTodo}`)}
              title={streak.doneToday ? t.streak.label : t.shell.streakTodo}
            >
              <span className="shell-chip-emoji" aria-hidden="true">
                🔥
              </span>
              <span className="shell-chip-num">{streak.current}</span>
            </a>
            <a className="shell-chip shell-chip-xp" href={routeToHash({ name: 'profile' })} aria-label={t.shell.xpAria(xp)} title={t.profile.totalXp}>
              <XpIcon size={18} />
              <span className="shell-chip-num">{xp}</span>
              <span className="shell-chip-unit" aria-hidden="true">
                {t.common.xp}
              </span>
            </a>
          </div>
        )}
      </header>

      <nav className="shell-nav" aria-label={t.shell.mainNav}>
        {NAV.map((item) => {
          const active = item.route.name === route.name;
          return (
            <a key={item.name} className={`shell-nav-item${active ? ' is-active' : ''}`} href={routeToHash(item.route)} aria-current={active ? 'page' : undefined}>
              <span className="shell-nav-icon">
                <NavIcon name={item.name} />
                {item.name === 'daily' && dailyPending && (
                  <>
                    <span className="shell-dot" aria-hidden="true" />
                    <span className="sr-only">{t.shell.dailyPending}</span>
                  </>
                )}
              </span>
              <span className="shell-nav-label">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <main id="main" className="shell-main" tabIndex={-1}>
        <div key={route.name} className="shell-view">
          {children}
        </div>
      </main>
    </div>
  );
}
