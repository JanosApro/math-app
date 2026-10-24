/**
 * Answers that are picked rather than typed: multiple choice, true/false, ordering, matching.
 * All of them work with taps (big targets) and, on desktop, with the keyboard where it is cheap.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { ChoiceAnswer, MatchAnswer, OrderAnswer } from '../../engine/types';
import { choiceOrder } from '../../engine/answers';
import { Rich, RichInline } from '../../ui/Rich';
import { t } from '../../i18n/hu';
import { ignoreKeyEvent } from './keys';
import { matchDisplay, orderDisplay } from './draft';
import type { Verdict } from './TextAnswer';

function useKeys(active: boolean, handler: (e: KeyboardEvent) => boolean) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => {
      if (ignoreKeyEvent(e)) return;
      if (ref.current(e)) e.preventDefault();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active]);
}

const Mark = ({ ok }: { ok: boolean }) => (
  <span className={`kp-mark ${ok ? 'kp-mark-ok' : 'kp-mark-bad'}`} aria-label={ok ? t.input.markCorrect : t.input.markWrong}>
    {ok ? '✓' : '✗'}
  </span>
);

// ---------------------------------------------------------------------------------------------

export function ChoiceInput({
  spec,
  seed,
  index,
  onSelect,
  locked,
  verdict,
}: {
  spec: ChoiceAnswer;
  seed: number;
  index: number | null;
  onSelect: (i: number) => void;
  locked?: boolean;
  verdict?: Verdict;
}) {
  const order = useMemo(() => choiceOrder(spec.options.length, spec.shuffle ?? true, seed), [spec, seed]);
  useKeys(!locked, (e) => {
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= order.length) {
      onSelect(order[n - 1]);
      return true;
    }
    return false;
  });
  return (
    <div className="kp-choices" role="radiogroup">
      {order.map((orig) => {
        const selected = index === orig;
        const isCorrect = orig === spec.correct;
        const reveal = !!verdict && (isCorrect || selected);
        const cls = ['kp-choice', selected ? 'is-selected' : '', reveal ? (isCorrect ? 'is-correct' : 'is-wrong') : ''].filter(Boolean).join(' ');
        return (
          <button
            key={orig}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cls}
            data-index={orig}
            disabled={locked}
            onClick={() => onSelect(orig)}
          >
            <span className="kp-radio" aria-hidden="true">
              {reveal ? (isCorrect ? '✓' : '✗') : ''}
            </span>
            <span className="kp-choice-text">
              <RichInline text={spec.options[orig]} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

export function TrueFalseInput({
  correctValue,
  value,
  onSelect,
  locked,
  verdict,
}: {
  correctValue: boolean;
  value: boolean | null;
  onSelect: (v: boolean) => void;
  locked?: boolean;
  verdict?: Verdict;
}) {
  useKeys(!locked, (e) => {
    const k = e.key.toLowerCase();
    if (k === 'i' || k === '1') onSelect(true);
    else if (k === 'h' || k === '2') onSelect(false);
    else return false;
    return true;
  });
  const btn = (v: boolean) => {
    const selected = value === v;
    const isCorrect = v === correctValue;
    const reveal = !!verdict && (isCorrect || selected);
    const cls = ['kp-tf', v ? 'kp-tf-true' : 'kp-tf-false', selected ? 'is-selected' : '', reveal ? (isCorrect ? 'is-correct' : 'is-wrong') : '']
      .filter(Boolean)
      .join(' ');
    return (
      <button type="button" role="radio" aria-checked={selected} className={cls} disabled={locked} onClick={() => onSelect(v)}>
        <span className="kp-tf-icon" aria-hidden="true">
          {v ? '✓' : '✗'}
        </span>
        {v ? t.input.trueLabel : t.input.falseLabel}
      </button>
    );
  };
  return (
    <div className="kp-tfs" role="radiogroup">
      {btn(true)}
      {btn(false)}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

export function OrderInput({
  spec,
  seed,
  order,
  onChange,
  locked,
  verdict,
}: {
  spec: OrderAnswer;
  seed: number;
  order: number[];
  onChange: (order: number[]) => void;
  locked?: boolean;
  verdict?: Verdict;
}) {
  const display = useMemo(() => orderDisplay(spec.items.length, seed), [spec, seed]);
  const tap = (i: number) => {
    if (locked) return;
    onChange(order.includes(i) ? order.filter((x) => x !== i) : [...order, i]);
  };
  useKeys(!locked, (e) => {
    if (e.key === 'Backspace') {
      onChange(order.slice(0, -1));
      return true;
    }
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= display.length) {
      tap(display[n - 1]);
      return true;
    }
    return false;
  });
  const okAt = (pos: number) => order[pos] === pos || spec.items[order[pos]] === spec.items[pos];
  return (
    <div className="kp-order">
      {spec.direction && (
        <div className="kp-direction">
          <Rich text={spec.direction} />
        </div>
      )}
      <div className="kp-order-items">
        {display.map((i) => {
          const pos = order.indexOf(i);
          const picked = pos >= 0;
          return (
            <button
              key={i}
              type="button"
              className={`kp-order-item${picked ? ' is-picked' : ''}`}
              data-index={i}
              disabled={locked}
              aria-pressed={picked}
              onClick={() => tap(i)}
            >
              <span className="kp-badge" aria-hidden={!picked}>
                {picked ? pos + 1 : ''}
              </span>
              <span className="kp-order-text">
                <RichInline text={spec.items[i]} />
              </span>
              {verdict && picked && <Mark ok={okAt(pos)} />}
            </button>
          );
        })}
      </div>
      {order.length > 0 && (
        <div className="kp-sequence" aria-live="polite">
          {order.map((i, pos) => (
            <span key={pos} className="kp-seq-chip">
              <span className="kp-seq-num">{pos + 1}.</span> <RichInline text={spec.items[i]} />
            </span>
          ))}
        </div>
      )}
      {!locked && (
        <div className="kp-tools">
          <button type="button" className="btn btn-small btn-ghost" disabled={order.length === 0} onClick={() => onChange(order.slice(0, -1))}>
            ↶ {t.input.undo}
          </button>
          <button type="button" className="btn btn-small btn-ghost" disabled={order.length === 0} onClick={() => onChange([])}>
            {t.input.reset}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

export interface MatchDraft {
  rightForLeft: (number | null)[];
  pendingLeft: number | null;
  pendingRight: number | null;
}

const PAIR_COLORS = 8;

export function MatchInput({
  spec,
  seed,
  draft,
  onChange,
  locked,
  verdict,
}: {
  spec: MatchAnswer;
  seed: number;
  draft: MatchDraft;
  onChange: (d: MatchDraft) => void;
  locked?: boolean;
  verdict?: Verdict;
}) {
  const rights = useMemo(() => matchDisplay(spec.pairs.length, seed), [spec, seed]);
  const { rightForLeft, pendingLeft, pendingRight } = draft;
  const leftOfRight = (r: number) => rightForLeft.indexOf(r);
  // pair numbers in the order of the left column
  const pairNo = (l: number) => (rightForLeft[l] === null ? 0 : rightForLeft.slice(0, l + 1).filter((x) => x !== null).length);

  const pair = (l: number, r: number) => {
    const next = [...rightForLeft];
    next[l] = r;
    onChange({ rightForLeft: next, pendingLeft: null, pendingRight: null });
  };
  const tapLeft = (l: number) => {
    if (locked) return;
    if (rightForLeft[l] !== null) {
      const next = [...rightForLeft];
      next[l] = null;
      onChange({ rightForLeft: next, pendingLeft: null, pendingRight: null });
    } else if (pendingRight !== null) pair(l, pendingRight);
    else onChange({ ...draft, pendingLeft: pendingLeft === l ? null : l, pendingRight: null });
  };
  const tapRight = (r: number) => {
    if (locked) return;
    const l = leftOfRight(r);
    if (l >= 0) {
      const next = [...rightForLeft];
      next[l] = null;
      onChange({ rightForLeft: next, pendingLeft: null, pendingRight: null });
    } else if (pendingLeft !== null) pair(pendingLeft, r);
    else onChange({ ...draft, pendingRight: pendingRight === r ? null : r, pendingLeft: null });
  };
  const okFor = (l: number) => {
    const r = rightForLeft[l];
    return r !== null && (r === l || spec.pairs[r][1] === spec.pairs[l][1]);
  };
  const pairClass = (no: number) => (no > 0 ? ` is-paired kp-pair-${((no - 1) % PAIR_COLORS) + 1}` : '');

  return (
    <div className="kp-match">
      <div className="kp-match-cols">
        <div className="kp-match-col">
          {spec.pairs.map(([left], l) => {
            const no = pairNo(l);
            return (
              <button
                key={l}
                type="button"
                className={`kp-match-item${pendingLeft === l ? ' is-pending' : ''}${pairClass(no)}`}
                data-left={l}
                disabled={locked}
                aria-pressed={pendingLeft === l || no > 0}
                onClick={() => tapLeft(l)}
              >
                <span className="kp-match-text">
                  <RichInline text={left} />
                </span>
                {no > 0 && <span className="kp-badge">{no}</span>}
                {verdict && no > 0 && <Mark ok={okFor(l)} />}
              </button>
            );
          })}
        </div>
        <div className="kp-match-col">
          {rights.map((r) => {
            const l = leftOfRight(r);
            const no = l >= 0 ? pairNo(l) : 0;
            return (
              <button
                key={r}
                type="button"
                className={`kp-match-item${pendingRight === r ? ' is-pending' : ''}${pairClass(no)}`}
                data-right={r}
                disabled={locked}
                aria-pressed={pendingRight === r || no > 0}
                onClick={() => tapRight(r)}
              >
                {no > 0 && <span className="kp-badge">{no}</span>}
                <span className="kp-match-text">
                  <RichInline text={spec.pairs[r][1]} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {!locked && (
        <div className="kp-tools">
          <button
            type="button"
            className="btn btn-small btn-ghost"
            disabled={rightForLeft.every((x) => x === null)}
            onClick={() => onChange({ rightForLeft: rightForLeft.map(() => null), pendingLeft: null, pendingRight: null })}
          >
            {t.input.reset}
          </button>
        </div>
      )}
    </div>
  );
}
