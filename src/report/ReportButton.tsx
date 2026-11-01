/**
 * "Hiba jelzése": a flag button in the lesson top bar and a link on the settings screen. It opens
 * a short form (what kind of problem + a few words). The question on screen, the page and the
 * device data go with it (see report.ts); the student never sees other reports.
 */
import { useEffect, useId, useState } from 'react';
import { t } from '../i18n/hu';
import { Dialog } from '../ui/Dialog';
import { showToast } from '../ui/Toast';
import { getReportQuestion } from './context';
import { canSend, MESSAGE_LIMIT, type ReportKind } from './report';
import { submitReport } from './send';
import './report.css';

const KINDS: ReportKind[] = ['wrong_answer', 'bug', 'other'];

export function ReportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const id = useId();
  const [hasQuestion, setHasQuestion] = useState(false);
  const [kind, setKind] = useState<ReportKind>('bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // a fresh form every time it opens; "wrong answer" is offered only while a question is on screen
  useEffect(() => {
    if (!open) return;
    const q = !!getReportQuestion();
    setHasQuestion(q);
    setKind(q ? 'wrong_answer' : 'bug');
    setMessage('');
    setSending(false);
  }, [open]);

  const kinds = hasQuestion ? KINDS : KINDS.filter((k) => k !== 'wrong_answer');
  const ok = canSend(kind, message) && !sending;

  const send = async () => {
    if (!ok) return;
    setSending(true);
    const result = await submitReport(kind, message).catch(() => 'queued' as const);
    onClose();
    showToast(result === 'sent' ? t.report.sent : t.report.queued);
  };

  return (
    <Dialog
      open={open}
      title={t.report.title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" disabled={!ok} onClick={send}>
            {sending ? t.report.sending : t.report.send}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t.common.cancel}
          </button>
        </>
      }
    >
      <form
        className="rp-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <fieldset className="rp-kinds">
          <legend className="rp-label">{t.report.kindLabel}</legend>
          {kinds.map((k) => (
            <label key={k} className={`rp-kind${kind === k ? ' is-selected' : ''}`}>
              <input type="radio" name={`${id}-kind`} value={k} checked={kind === k} onChange={() => setKind(k)} />
              <span>{t.report.kinds[k]}</span>
            </label>
          ))}
        </fieldset>
        <label className="rp-label" htmlFor={`${id}-msg`}>
          {kind === 'wrong_answer' ? t.report.messageOptional : t.report.messageLabel}
        </label>
        <textarea
          id={`${id}-msg`}
          className="rp-text"
          rows={3}
          maxLength={MESSAGE_LIMIT}
          value={message}
          placeholder={t.report.messagePlaceholder}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="rp-note">
          {hasQuestion && <>{t.report.attached} </>}
          {t.report.privacy}
        </p>
      </form>
    </Dialog>
  );
}

/** Flag icon button (lesson top bar) or a text link (settings). */
export function ReportButton({ variant = 'icon' }: { variant?: 'icon' | 'link' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === 'icon' ? (
        <button type="button" className="icon-btn rp-btn" aria-label={t.report.button} title={t.report.button} onClick={() => setOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 21V4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M5 4.5h11.5l-2.4 4 2.4 4H5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <button type="button" className="link-btn rp-link" onClick={() => setOpen(true)}>
          ⚑ {t.report.link}
        </button>
      )}
      <ReportDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
