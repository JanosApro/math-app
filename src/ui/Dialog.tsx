/**
 * Accessible modal dialog. Esc and the backdrop close it (unless `dismissable` is false).
 *
 *   <Dialog open={open} title="Előreugranál?" onClose={() => setOpen(false)}
 *     actions={<><button className="btn">Igen</button><button className="btn btn-ghost">Nem</button></>}>
 *     <p>…</p>
 *   </Dialog>
 */
import { useEffect, useRef, type ReactNode } from 'react';
import './Dialog.css';

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
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
    (first ?? panel.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, dismissable, onClose]);
  if (!open) return null;
  return (
    <div className="dlg-backdrop anim-fade-in" onClick={dismissable ? onClose : undefined}>
      <div
        ref={panel}
        className="dlg-panel anim-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dlg-title" className="dlg-title">
          {title}
        </h2>
        {children && <div className="dlg-body">{children}</div>}
        {actions && <div className="dlg-actions">{actions}</div>}
      </div>
    </div>
  );
}
