/** Speaker button (sound on / off), in the lesson top bar. */
import { t } from '../i18n/hu';
import { setSetting } from '../state/progress';
import { useAppState } from '../state/store';
import { playSound } from './sound';

export function SoundToggle() {
  const on = useAppState((s) => s.settings.sound);
  const label = on ? t.shell.soundOff : t.shell.soundOn;
  return (
    <button
      type="button"
      className={`icon-btn sound-toggle${on ? '' : ' is-off'}`}
      aria-label={label}
      title={label}
      aria-pressed={on}
      onClick={() => {
        setSetting('sound', !on);
        if (!on) setTimeout(() => playSound('tap'), 0);
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        {on ? (
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
