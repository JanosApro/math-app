/**
 * A small round ⓘ (or 🔍) button next to a title that opens the longer explanation in a dialog.
 * The screens stay short; the few genuinely useful explanations live behind these buttons.
 *
 *   <InfoButton title="Sorozat">A sorozat akkor nő, ha …</InfoButton>
 *   <InfoButton title="1. feladat" icon="search" label="Megoldás">…</InfoButton>
 */
import { useState, type ReactNode } from 'react';
import { t } from '../i18n/hu';
import { Dialog } from './Dialog';
import './InfoButton.css';

export function InfoButton({
  title,
  children,
  icon = 'info',
  label,
  className,
}: {
  /** Dialog title (also the button's accessible name unless `label` is given). */
  title: ReactNode;
  children: ReactNode;
  icon?: 'info' | 'search';
  /** Accessible name of the button (default: "Információ: <title>"). */
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const name = label ?? (typeof title === 'string' ? t.common.infoAbout(title) : t.common.info);
  return (
    <>
      <button
        type="button"
        className={`info-btn${icon === 'search' ? ' is-search' : ''}${className ? ` ${className}` : ''}`}
        aria-label={name}
        title={name}
        onClick={(e) => {
          e.stopPropagation(); // never also trigger a clickable row around it
          setOpen(true);
        }}
      >
        {icon === 'info' ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <circle cx="12" cy="6.6" r="1.9" fill="currentColor" />
            <path d="M12 10.8v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
            <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.6" />
            <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <Dialog
        open={open}
        title={title}
        onClose={() => setOpen(false)}
        actions={
          <button type="button" className="btn" onClick={() => setOpen(false)}>
            {t.common.ok}
          </button>
        }
      >
        <div className="info-body">{children}</div>
      </Dialog>
    </>
  );
}
