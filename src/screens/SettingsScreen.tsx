/**
 * Route #/settings: grade (progress is kept per grade), nickname, sound, reduced motion, theme,
 * export / import of the progress file (with the permanent "clearing browser data deletes your
 * progress" warning), reset, about.
 */
import { useEffect, useState, type ReactNode } from 'react';
import pkg from '../../package.json';
import { GRADES } from '../content/registry';
import { t } from '../i18n/hu';
import { downloadProgress, resetProgress, setGrade, setNickname, setSetting } from '../state/progress';
import { isStorageAvailable, useAppState, type Settings } from '../state/store';
import { Dialog } from '../ui/Dialog';
import { showToast } from '../ui/Toast';
import { navigate, routeToHash } from '../ui/router';
import { ImportProgressButton } from './ImportProgress';
import './screens.css';
import './Settings.css';

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: ReactNode }) {
  return (
    <section className="card st-section" aria-labelledby={id}>
      <h2 id={id} className="section-title">
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

/** An on/off switch row (real checkbox, styled). */
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="st-toggle">
      <span className="st-toggle-text">
        <span className="st-toggle-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" className="st-switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function SettingsScreen() {
  const grade = useAppState((s) => s.grade);
  const nickname = useAppState((s) => s.nickname);
  const settings = useAppState((s) => s.settings);
  const [nick, setNick] = useState(nickname);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => setNick(nickname), [nickname]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSetting(key, value);
    showToast(t.settings.saved);
  };
  const themes: { value: Settings['theme']; label: string }[] = [
    { value: 'auto', label: t.settings.themeAuto },
    { value: 'light', label: t.settings.themeLight },
    { value: 'dark', label: t.settings.themeDark },
  ];

  return (
    <div className="page st">
      <h1 className="screen-title">{t.settings.title}</h1>

      {!isStorageAvailable() && (
        <p className="st-banner" role="alert">
          <span aria-hidden="true">⚠️</span> {t.settings.storageUnavailable}
        </p>
      )}

      <Section id="st-grade" icon="🎒" title={t.settings.grade}>
        <div className="st-grades" role="radiogroup" aria-label={t.settings.grade}>
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              role="radio"
              aria-checked={grade === g.grade}
              className={`st-grade${grade === g.grade ? ' is-selected' : ''}`}
              onClick={() => {
                if (grade === g.grade) return;
                setGrade(g.grade);
                showToast(t.settings.saved);
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="field-hint">{t.settings.gradeHint}</p>
      </Section>

      <Section id="st-nick" icon="🙂" title={t.settings.nickname}>
        <form
          className="st-nick"
          onSubmit={(e) => {
            e.preventDefault();
            setNickname(nick);
            showToast(t.settings.saved);
          }}
        >
          <input
            className="text-input"
            value={nick}
            maxLength={30}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={t.onboarding.nicknamePlaceholder}
            aria-label={t.settings.nickname}
            aria-describedby="st-nick-hint"
            onChange={(e) => setNick(e.target.value)}
          />
          <button type="submit" className="btn" disabled={nick.trim() === nickname}>
            {t.settings.nicknameSave}
          </button>
        </form>
        <p id="st-nick-hint" className="field-hint">
          {t.onboarding.nicknameHint}
        </p>
      </Section>

      <Section id="st-look" icon="🎨" title={t.settings.appearance}>
        <Toggle label={t.settings.sound} hint={t.settings.soundHint} checked={settings.sound} onChange={(v) => set('sound', v)} />
        <Toggle label={t.settings.reduceMotion} checked={settings.reduceMotion} onChange={(v) => set('reduceMotion', v)} />
        <div className="st-theme">
          <span className="st-toggle-label" id="st-theme-label">
            {t.settings.theme}
          </span>
          <div className="st-segment" role="radiogroup" aria-labelledby="st-theme-label">
            {themes.map((th) => (
              <button
                key={th.value}
                type="button"
                role="radio"
                aria-checked={settings.theme === th.value}
                className={`st-seg${settings.theme === th.value ? ' is-selected' : ''}`}
                onClick={() => set('theme', th.value)}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section id="st-data" icon="💾" title={t.settings.data}>
        <p className="st-warning">
          <span aria-hidden="true">⚠️</span> {t.settings.storageWarning}
        </p>
        <p className="field-hint st-data-hint">{t.settings.dataHint}</p>
        <div className="st-buttons">
          <button
            type="button"
            className="btn btn-block"
            onClick={() => {
              downloadProgress();
              showToast(t.settings.exportDone);
            }}
          >
            ⬇ {t.settings.exportBtn}
          </button>
          <ImportProgressButton label={`⬆ ${t.settings.importBtn}`} />
          <button type="button" className="btn btn-ghost btn-block st-reset" onClick={() => setResetOpen(true)}>
            {t.settings.reset}
          </button>
        </div>
      </Section>

      <Section id="st-about" icon="ℹ️" title={t.settings.about}>
        <p className="st-about">{t.settings.aboutText}</p>
        <p className="field-hint">
          {t.appName} · {t.settings.version} {pkg.version}
        </p>
        {import.meta.env.DEV && (
          <a className="link-btn" href={routeToHash({ name: 'dev' })}>
            {t.settings.devPage} ›
          </a>
        )}
      </Section>

      <Dialog
        open={resetOpen}
        title={t.settings.reset}
        onClose={() => setResetOpen(false)}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setResetOpen(false)}>
              {t.common.cancel}
            </button>
            <button
              type="button"
              className="btn btn-bad"
              onClick={() => {
                setResetOpen(false);
                resetProgress();
                showToast(t.settings.resetDone);
                navigate({ name: 'welcome' }, true);
              }}
            >
              {t.settings.resetConfirmBtn}
            </button>
          </>
        }
      >
        <p>{t.settings.resetConfirm}</p>
      </Dialog>
    </div>
  );
}
