/**
 * Light / dark switch: a round button with a sun (in dark mode) or a moon (in light mode).
 * Shown in the top bar of the main screens and on the welcome screen; settings has it too.
 */
import { t } from '../i18n/hu';
import { setSetting } from '../state/progress';
import { useAppState } from '../state/store';
import { playSound } from './sound';
import './ThemeToggle.css';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useAppState((s) => s.settings.theme);
  const dark = theme === 'dark';
  const label = dark ? t.shell.toLight : t.shell.toDark;
  return (
    <button
      type="button"
      className={`theme-toggle${dark ? ' is-dark' : ''}${className ? ` ${className}` : ''}`}
      onClick={() => {
        setSetting('theme', dark ? 'light' : 'dark');
        playSound('tap');
      }}
      aria-label={label}
      title={label}
      aria-pressed={dark}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        {dark ? (
          <g className="theme-toggle-sun">
            <circle cx="12" cy="12" r="4.6" />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d="M12 2.2v2.6" transform={`rotate(${i * 45} 12 12)`} />
            ))}
          </g>
        ) : (
          <path className="theme-toggle-moon" d="M20.3 14.6A8.6 8.6 0 0 1 9.4 3.7a8.6 8.6 0 1 0 10.9 10.9z" />
        )}
      </svg>
    </button>
  );
}
