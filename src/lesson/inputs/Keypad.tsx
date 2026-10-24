/**
 * The on-screen keypad (no OS keyboard on phones). Layout:
 *
 *   [type-specific keys: / ␣ √ x y ^ ( ) + · ° ′ …]
 *   1 2 3 ⌫
 *   4 5 6 ⌫
 *   7 8 9 ⌫
 *   − 0 , C
 */
import { t } from '../../i18n/hu';
import { BACKSPACE_KEY, CLEAR_KEY, COMMA_KEY, DIGIT_KEYS, MINUS_KEY, type KeyAction, type KeyDef } from './keys';
import './keypad.css';

function Key({ def, onKey, disabled, className }: { def: KeyDef; onKey: (a: KeyAction) => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      className={`kp-key kp-${def.tone ?? 'op'}${className ? ` ${className}` : ''}`}
      aria-label={def.aria}
      title={def.aria}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onKey(def.action)}
    >
      {def.label}
    </button>
  );
}

export function Keypad({ specials, onKey, disabled }: { specials: KeyDef[]; onKey: (a: KeyAction) => void; disabled?: boolean }) {
  const d = (n: string) => DIGIT_KEYS.find((k) => k.label === n)!;
  return (
    <div className={`kp${disabled ? ' kp-disabled' : ''}`} role="group" aria-label={t.input.keypad}>
      {specials.length > 0 && (
        <div className="kp-specials">
          {specials.map((k, i) => (
            <Key key={i} def={k} onKey={onKey} disabled={disabled} />
          ))}
        </div>
      )}
      <div className="kp-grid">
        {['1', '2', '3'].map((n) => (
          <Key key={n} def={d(n)} onKey={onKey} disabled={disabled} />
        ))}
        <Key def={BACKSPACE_KEY} onKey={onKey} disabled={disabled} className="kp-tall" />
        {['4', '5', '6', '7', '8', '9'].map((n) => (
          <Key key={n} def={d(n)} onKey={onKey} disabled={disabled} />
        ))}
        <Key def={MINUS_KEY} onKey={onKey} disabled={disabled} />
        <Key def={d('0')} onKey={onKey} disabled={disabled} />
        <Key def={COMMA_KEY} onKey={onKey} disabled={disabled} />
        <Key def={CLEAR_KEY} onKey={onKey} disabled={disabled} />
      </div>
    </div>
  );
}

/** All keys of a keypad (for the physical keyboard mapping). */
export function allKeys(specials: KeyDef[]): KeyDef[] {
  return [...DIGIT_KEYS, MINUS_KEY, COMMA_KEY, ...specials];
}
