/**
 * Typed answers (number, fraction, root, expression) and multi-field `numbers` answers:
 * a display (no <input>, so the phone keyboard never opens) + live KaTeX preview + keypad.
 * The physical keyboard works too while the question is active.
 */
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { ExpressionAnswer, FractionAnswer, NumberAnswer, NumbersAnswer, RichText, RootAnswer } from '../../engine/types';
import { RichInline, renderMath } from '../../ui/Rich';
import { t } from '../../i18n/hu';
import { Keypad, allKeys } from './Keypad';
import { editText, ignoreKeyEvent, keyFromEvent, specialKeys, type KeyAction, type KeyDef } from './keys';
import { displayText, inputToTex } from './draft';

export type TextSpec = NumberAnswer | FractionAnswer | RootAnswer | ExpressionAnswer;
export type Verdict = 'correct' | 'wrong' | null;

/** Listens to the physical keyboard while `active`. */
function usePhysicalKeys(active: boolean, keys: KeyDef[], onKey: (a: KeyAction) => void, extra?: (e: KeyboardEvent) => boolean) {
  const ref = useRef({ keys, onKey, extra });
  ref.current = { keys, onKey, extra };
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (ignoreKeyEvent(e)) return;
      if (ref.current.extra?.(e)) {
        e.preventDefault();
        return;
      }
      const a = keyFromEvent(e, ref.current.keys);
      if (!a) return;
      e.preventDefault();
      ref.current.onKey(a);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);
}

/**
 * On the first key press, scrolls the answer area (display + keypad) into view: on short phones
 * the keypad starts below the fixed action bar. `scroll-margin-bottom` in CSS keeps it above the bar.
 */
function useRevealOnFirstKey() {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const reveal = () => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };
  return { ref, reveal };
}

function Display({
  text,
  label,
  focused,
  verdict,
  onClick,
  className,
}: {
  text: string;
  label: string;
  focused: boolean;
  verdict: Verdict;
  onClick?: () => void;
  className?: string;
}) {
  const cls = ['kp-display', text ? '' : 'is-empty', focused ? 'is-focused' : '', verdict ? `is-${verdict}` : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} role="textbox" aria-label={label} aria-readonly={!focused} inputMode="none" tabIndex={-1} onClick={onClick}>
      <span className="kp-text">{displayText(text)}</span>
      {focused && <span className="kp-caret" aria-hidden="true" />}
      {!text && !focused && <span className="kp-placeholder">…</span>}
      {verdict && (
        <span className="kp-verdict" aria-hidden="true">
          {verdict === 'correct' ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}

const plain = (rich: RichText | undefined) => (rich ?? '').replace(/\$/g, '').replace(/\*\*/g, '').trim();

export function TextAnswer({
  spec,
  inputLabel,
  text,
  onChange,
  locked,
  verdict,
  notice,
}: {
  spec: TextSpec;
  inputLabel?: RichText;
  text: string;
  onChange: (text: string) => void;
  locked?: boolean;
  verdict?: Verdict;
  /** Shown between the display and the keypad ("simplify it" …). */
  notice?: ReactNode;
}) {
  const specials = useMemo(() => specialKeys(spec), [spec]);
  const keys = useMemo(() => allKeys(specials), [specials]);
  const { ref, reveal } = useRevealOnFirstKey();
  const onKey = (a: KeyAction) => {
    if (locked) return;
    reveal();
    onChange(editText(text, a));
  };
  usePhysicalKeys(!locked, keys, onKey);

  const showsPreview = spec.type === 'fraction' || spec.type === 'root' || spec.type === 'expression' || (spec.type === 'number' && !!spec.acceptFraction);
  const tex = showsPreview ? inputToTex(spec, text) : '';
  const unit = 'unit' in spec ? spec.unit : undefined;
  return (
    <div className="kp-text-answer" ref={ref}>
      <div className="kp-answer-row">
        {inputLabel && (
          <span className="kp-label">
            <RichInline text={inputLabel} />
          </span>
        )}
        <Display text={text} label={plain(inputLabel) || t.input.placeholder} focused={!locked} verdict={verdict ?? null} />
        {unit && <span className="kp-unit">{unit}</span>}
      </div>
      {showsPreview && (
        <div className="kp-preview" aria-live="polite">
          {tex && (
            <>
              <span className="kp-preview-label">{t.input.preview}</span>{' '}
              <span className="math" dangerouslySetInnerHTML={{ __html: renderMath(tex) }} />
              {unit && <span className="kp-preview-unit"> {unit}</span>}
            </>
          )}
        </div>
      )}
      {notice}
      {!locked && <Keypad specials={specials} onKey={onKey} />}
    </div>
  );
}

export function NumbersAnswerInput({
  spec,
  texts,
  focus,
  onChange,
  locked,
  verdict,
  notice,
}: {
  spec: NumbersAnswer;
  texts: string[];
  focus: number;
  onChange: (texts: string[], focus: number) => void;
  locked?: boolean;
  verdict?: Verdict;
  notice?: ReactNode;
}) {
  const specials = useMemo(() => specialKeys(spec), [spec]);
  const keys = useMemo(() => allKeys(specials), [specials]);
  const { ref, reveal } = useRevealOnFirstKey();
  const n = spec.fields.length;
  const onKey = (a: KeyAction) => {
    if (locked) return;
    reveal();
    const cur = texts[focus] ?? '';
    if (a.kind === 'next') {
      let from = focus;
      if (a.unit) {
        // finish the field with this unit (the focused one if it has it, else the first one)
        const idx = spec.fields[focus]?.unit === a.unit ? focus : spec.fields.findIndex((f) => f.unit === a.unit);
        if (idx >= 0) from = idx;
      }
      onChange(texts, a.unit ? Math.min(n - 1, from + 1) : (from + 1) % n);
      return;
    }
    if (a.kind === 'backspace' && cur === '' && focus > 0) {
      onChange(texts, focus - 1);
      return;
    }
    const next = [...texts];
    next[focus] = editText(cur, a);
    onChange(next, focus);
  };
  usePhysicalKeys(!locked, keys, onKey, (e) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const dir = e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey) ? -1 : 1;
      onChange(texts, (focus + dir + n) % n);
      return true;
    }
    return false;
  });

  return (
    <div className="kp-text-answer" ref={ref}>
      <div className="kp-fields">
        {spec.fields.map((f, i) => (
          <div key={i} className="kp-field">
            {f.label && (
              <span className="kp-label">
                <RichInline text={f.label} />
              </span>
            )}
            <Display
              text={texts[i] ?? ''}
              label={plain(f.label) || `${i + 1}.`}
              focused={!locked && i === focus}
              verdict={verdict ?? null}
              onClick={locked ? undefined : () => onChange(texts, i)}
              className="kp-display-field"
            />
            {f.unit && <span className={/^[°′″]$/.test(f.unit) ? 'kp-unit kp-unit-tight' : 'kp-unit'}>{f.unit}</span>}
          </div>
        ))}
      </div>
      {notice}
      {!locked && <Keypad specials={specials} onKey={onKey} />}
    </div>
  );
}
