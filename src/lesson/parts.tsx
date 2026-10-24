/**
 * Small building blocks shared by the lesson player, the mini test and the daily challenge.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { t } from '../i18n/hu';
import { SoundToggle } from '../ui/SoundToggle';

/** True if animations should be skipped (system setting or the app's "Kevesebb animáció"). */
export function reducedMotion(): boolean {
  try {
    return document.documentElement.classList.contains('reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Top bar: ✕ (exit) + progress bar in the topic color. */
export function LessonTopBar({ progress, onClose, label, children }: { progress: number; onClose: () => void; label?: string; children?: ReactNode }) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <header className="lesson-top">
      <div className="lesson-top-inner">
        <button type="button" className="icon-btn lesson-close" onClick={onClose} aria-label={t.lesson.quit} title={t.lesson.quit}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="lesson-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label ?? t.lesson.progressLabel}>
          <div className="lesson-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <SoundToggle />
        {children}
      </div>
    </header>
  );
}

/** Action bar fixed to the bottom of the screen (primary buttons within thumb reach). */
export function LessonFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <div className="lesson-footer-spacer" aria-hidden="true" />
      <div className={`lesson-footer${className ? ` ${className}` : ''}`}>
        <div className="lesson-footer-inner">{children}</div>
      </div>
    </>
  );
}

/**
 * Enter (physical keyboard) triggers `handler` while `enabled`. Ignored in form fields, open
 * dialogs and on focused buttons outside the answer area (Enter already clicks those).
 */
export function useEnterKey(handler: () => void, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (el && (el.tagName === 'BUTTON' || el.tagName === 'A') && !el.closest('.lesson-answer')) return;
      if (document.querySelector('.dlg-backdrop')) return;
      e.preventDefault();
      ref.current();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [enabled]);
}

/** Counts from 0 up to `value` (short, eased). */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? value : 0));
  useEffect(() => {
    if (reducedMotion() || value <= 0) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      setShown(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="lesson-countup">{shown}</span>;
}

/**
 * CSS confetti (decorative, hidden with reduced motion): pieces explode out of the middle of the
 * screen, then tumble down. Stars, dots and strips in the figure palette.
 */
export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    // deterministic pseudo-random spread
    const r = (k: number) => {
      const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const shape = i % 3 === 0 ? 'star' : i % 3 === 1 ? 'dot' : 'strip';
    const size = shape === 'star' ? 14 + Math.round(r(6) * 8) : 7 + Math.round(r(6) * 6);
    const style = {
      animationDelay: `${(r(2) * 0.25).toFixed(2)}s`,
      animationDuration: `${(1.9 + r(3) * 1.1).toFixed(2)}s`,
      // burst target (relative to the screen center), then the fall drift
      '--cf-x': `${((r(1) - 0.5) * 92).toFixed(1)}vw`,
      '--cf-y': `${(-12 - r(4) * 34).toFixed(1)}vh`,
      '--cf-drift': `${((r(8) - 0.5) * 30).toFixed(1)}vw`,
      '--cf-rot': `${Math.round(360 + r(5) * 720)}deg`,
      background: `var(--fig-s${(i % 8) + 1})`,
      width: `${size}px`,
      height: `${shape === 'strip' ? size * 1.8 : size}px`,
    } as CSSProperties;
    return <span key={i} className={`lesson-confetti-piece is-${shape}`} style={style} />;
  });
  return (
    <div className="lesson-confetti" aria-hidden="true">
      {pieces}
    </div>
  );
}

/** A ring of little stars and dots flying out of its parent (decorative, e.g. around the ✓). */
export function Burst({ count = 12, distance = 48 }: { count?: number; distance?: number }) {
  return (
    <span className="lesson-burst" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={
            {
              '--ba': `${Math.round((i * 360) / count + (i % 2) * 9)}deg`,
              '--bd': `${-Math.round(distance * (i % 2 ? 0.72 : 1))}px`,
              '--bc': `var(--fig-s${(i % 8) + 1})`,
              animationDelay: `${(i % 3) * 0.03}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

/** Small label above a card: "Elmélet", "Gyakorlás · 1/2" … */
export function StepChip({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <div className="lesson-chip">
      {icon && (
        <span className="lesson-chip-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

/** Scrolls the page to the top (new step). */
export function scrollTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'auto' });
  } catch {
    /* ignore */
  }
}
