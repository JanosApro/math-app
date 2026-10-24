/**
 * Accessible modal dialog. Esc and the backdrop close it (unless `dismissable` is false).
 *
 *   <Dialog open={open} title="Előreugranál?" onClose={() => setOpen(false)}
 *     actions={<><button className="btn">Igen</button><button className="btn btn-ghost">Nem</button></>}>
 *     <p>…</p>
 *   </Dialog>
 *
 * - role="dialog" + aria-modal, labelled by the title and described by the body;
 * - focus moves to the first action (the primary one), Tab/Shift+Tab stay inside the dialog,
 *   and focus returns to the previously focused element when it closes;
 * - the page behind does not scroll while the dialog is open.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import './Dialog.css';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  title,
  children,
  actions,
  onClose,
  dismissable = true,
}: {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  /** Buttons, stacked full-width on phones. Put the primary action first. */
  actions?: ReactNode;
  onClose: () => void;
  dismissable?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  // Keep the latest callbacks without re-running the focus effect on every parent render.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const dismissRef = useRef(dismissable);
  dismissRef.current = dismissable;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>(`.dlg-actions :is(${FOCUSABLE})`) ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? el)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissRef.current) {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === a || document.activeElement === el)) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.overflow = prevOverflow;
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="dlg-backdrop anim-fade-in" onClick={dismissable ? onClose : undefined}>
      <div
        ref={panel}
        className="dlg-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={children ? `${id}-body` : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={`${id}-title`} className="dlg-title">
          {title}
        </h2>
        {children && (
          <div id={`${id}-body`} className="dlg-body">
            {children}
          </div>
        )}
        {actions && <div className="dlg-actions">{actions}</div>}
      </div>
    </div>
  );
}
