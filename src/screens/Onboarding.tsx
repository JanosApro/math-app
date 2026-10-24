/**
 * Onboarding: welcome, grade picker (data-driven from GRADES — a new grade appears
 * automatically), optional nickname (never a real name) → setGrade → map. Fits one phone screen:
 * the privacy note and the nickname advice are behind ⓘ buttons. Also offers "restore from
 * file" for students moving to a new device.
 */
import { useMemo, useState } from 'react';
import { t } from '../i18n/hu';
import { GRADES, getGradeTopics } from '../content/registry';
import { flatten } from '../content/catalog';
import { setGrade, setNickname } from '../state/progress';
import { useAppState } from '../state/store';
import { navigate } from '../ui/router';
import { Logo } from '../ui/AppShellIcons';
import { InfoButton } from '../ui/InfoButton';
import { ThemeToggle } from '../ui/ThemeToggle';
import { WelcomeArt } from './WelcomeArt';
import { ImportProgressButton } from './ImportProgress';
import './screens.css';
import './Onboarding.css';

/** A playful accent per grade tile (cycled for future grades). */
const TILE_TONES = ['coral', 'violet', 'teal', 'berry', 'gold', 'indigo'];

export default function Onboarding() {
  const currentGrade = useAppState((s) => s.grade);
  const currentNick = useAppState((s) => s.nickname);
  const [grade, setPicked] = useState<number | null>(currentGrade);
  const [nick, setNick] = useState(currentNick);

  const lessonCounts = useMemo(() => new Map(GRADES.map((g) => [g.grade, flatten(getGradeTopics(g.grade) ?? { grade: g.grade, topics: [] }).length])), []);

  function start(e: React.FormEvent) {
    e.preventDefault();
    if (grade === null) return;
    setNickname(nick);
    setGrade(grade);
    navigate({ name: 'map' }, true);
  }

  return (
    <div className="onb">
      <ThemeToggle className="onb-theme" />
      <div className="onb-hero">
        <div className="onb-brand">
          <Logo size={44} />
          <span>{t.appName}</span>
        </div>
        <WelcomeArt />
        <p className="onb-tagline">{t.tagline}</p>
      </div>

      <form className="onb-card card anim-slide-up" onSubmit={start}>
        <h1 className="onb-title">
          {t.onboarding.welcome}
          <InfoButton title={t.onboarding.privacyTitle}>
            <p>{t.onboarding.privacy}</p>
          </InfoButton>
        </h1>

        <fieldset className="onb-fieldset">
          <legend className="onb-label">{t.onboarding.pickGrade}</legend>
          <div className="onb-grades" role="radiogroup" aria-label={t.onboarding.pickGrade}>
            {GRADES.map((g, i) => {
              const selected = grade === g.grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`onb-grade tone-${TILE_TONES[i % TILE_TONES.length]}${selected ? ' is-selected' : ''}`}
                  onClick={() => setPicked(g.grade)}
                >
                  <span className="onb-grade-num">{g.grade}.</span>
                  <span className="onb-grade-label">{g.label.replace(/^\d+\.\s*/, '')}</span>
                  <span className="sr-only">{t.onboarding.gradeLessons(lessonCounts.get(g.grade) ?? 0)}</span>
                  <span className="onb-grade-check" aria-hidden="true">
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="onb-field">
          <div className="onb-label-row">
            <label className="onb-label" htmlFor="onb-nick">
              {t.onboarding.nicknameLabel}
            </label>
            <InfoButton title={t.onboarding.nicknameLabel}>
              <p>{t.onboarding.nicknameHint}</p>
            </InfoButton>
          </div>
          <input
            id="onb-nick"
            className="text-input"
            value={nick}
            maxLength={30}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={t.onboarding.nicknamePlaceholder}
            onChange={(e) => setNick(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-block onb-go" disabled={grade === null}>
          {t.onboarding.go}
        </button>

        <div className="onb-restore">
          <ImportProgressButton
            label={t.onboarding.haveBackup}
            className="link-btn"
            onImported={(s) => {
              if (s.grade !== null) navigate({ name: 'map' }, true);
            }}
          />
        </div>
      </form>
    </div>
  );
}
