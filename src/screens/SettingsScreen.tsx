/**
 * Route #/settings — fits one phone screen: grade (progress is kept per grade) + nickname; sound,
 * reduced motion, dark mode; export / import of the progress file and reset. The "clearing
 * browser data deletes your progress" warning and the about text are behind ⓘ buttons.
 */
import { useEffect, useState, type ReactNode } from 'react';
import pkg from '../../package.json';
import { GRADES } from '../content/registry';
import { t } from '../i18n/hu';
import { downloadProgress, resetProgress, setGrade, setNickname, setSetting } from '../state/progress';
import { isStorageAvailable, useAppState, type Settings } from '../state/store';
import { Dialog } from '../ui/Dialog';
import { InfoButton } from '../ui/InfoButton';
import { showToast } from '../ui/Toast';
import { playSound } from '../ui/sound';
import { navigate, routeToHash } from '../ui/router';
import { ImportProgressButton } from './ImportProgress';
import './screens.css';
import './Settings.css';

function Section({ id, title, info, children }: { id: string; title: string; info?: ReactNode; children: ReactNode }) {
  return (
    <section className="card st-section" aria-labelledby={id}>
      <h2 id={id} className="section-title">
        {title}
        {info && <InfoButton title={title}>{info}</InfoButton>}
      </h2>
      {children}
    </section>
  );
}

/** An on/off switch row (real checkbox, styled). */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="st-toggle">
      <span className="st-toggle-label">{label}</span>
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

  return (
    <div className="page st">
      <h1 className="sr-only">{t.settings.title}</h1>

      {!isStorageAvailable() && (
        <p className="st-banner" role="alert">
          <span aria-hidden="true">⚠️</span> {t.settings.storageUnavailable}
        </p>
      )}

      <Section id="st-me" title={t.settings.me} info={<p>{t.settings.gradeHint}</p>}>
        <div className="st-grades" role="radiogroup" aria-label={t.settings.grade}>
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              role="radio"
              aria-checked={grade === g.grade}
              className={`st-grade${grade === g.grade ? ' is-selected' : ''}`}
              aria-label={g.label}
              onClick={() => {
                if (grade === g.grade) return;
                setGrade(g.grade);
                showToast(t.settings.saved);
              }}
            >
              {g.grade}.
            </button>
          ))}
        </div>
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
            placeholder={t.settings.nickname}
            aria-label={t.settings.nickname}
            onChange={(e) => setNick(e.target.value)}
          />
          <button type="submit" className="btn" disabled={nick.trim() === nickname}>
            {t.settings.nicknameSave}
          </button>
        </form>
      </Section>

      <Section id="st-look" title={t.settings.appearance}>
        <Toggle
          label={t.settings.sound}
          checked={settings.sound}
          onChange={(v) => {
            set('sound', v);
            if (v) setTimeout(() => playSound('tap'), 0); // audible confirmation
          }}
        />
        <Toggle label={t.settings.reduceMotion} checked={settings.reduceMotion} onChange={(v) => set('reduceMotion', v)} />
        <Toggle label={t.settings.darkMode} checked={settings.theme === 'dark'} onChange={(v) => set('theme', v ? 'dark' : 'light')} />
      </Section>

      <Section
        id="st-data"
        title={t.settings.data}
        info={
          <>
            <p>{t.settings.storageWarning}</p>
            <p>{t.settings.dataHint}</p>
          </>
        }
      >
        <div className="st-buttons">
          <button
            type="button"
            className="btn"
            onClick={() => {
              downloadProgress();
              showToast(t.settings.exportDone);
            }}
          >
            ⬇ {t.settings.exportBtn}
          </button>
          <ImportProgressButton label={`⬆ ${t.settings.importBtn}`} className="btn btn-ghost" />
        </div>
        <button type="button" className="link-btn st-reset" onClick={() => setResetOpen(true)}>
          {t.settings.reset}
        </button>
      </Section>

      <p className="st-about">
        {t.appName} {pkg.version}
        <InfoButton title={t.settings.about}>
          <p>{t.settings.aboutText}</p>
        </InfoButton>
        {import.meta.env.DEV && (
          <a className="link-btn" href={routeToHash({ name: 'dev' })}>
            {t.settings.devPage} ›
          </a>
        )}
      </p>

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
