/**
 * "Haladás visszatöltése fájlból": a button + hidden file input + confirm dialog.
 * Used on the settings screen and on the onboarding screen (new device → restore first).
 *
 * Flow: pick file → parseProgressFile → (invalid: friendly inline error + toast)
 *       → confirm dialog with a short summary → importProgress → toast → onImported().
 */
import { useRef, useState } from 'react';
import { t } from '../i18n/hu';
import type { AppState } from '../state/store';
import { importProgress, parseProgressFile } from '../state/progress';
import { Dialog } from '../ui/Dialog';
import { showToast } from '../ui/Toast';

function summary(s: AppState): { lessons: number; xp: number } {
  let lessons = 0;
  let xp = 0;
  for (const gp of Object.values(s.grades)) {
    xp += gp.xp;
    lessons += Object.values(gp.subtopics).filter((p) => p.completedAt).length;
  }
  return { lessons, xp };
}

export function ImportProgressButton({
  label = t.settings.importBtn,
  className = 'btn btn-ghost btn-block',
  onImported,
}: {
  label?: string;
  className?: string;
  onImported?: (s: AppState) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppState | null>(null);
  const [error, setError] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    let text = '';
    try {
      text = await file.text();
    } catch {
      /* unreadable → handled as invalid below */
    }
    const parsed = text ? parseProgressFile(text) : null;
    if (!parsed) {
      setError(true);
      showToast(t.settings.importError);
      return;
    }
    setError(false);
    setPending(parsed);
  }

  function confirm() {
    if (!pending) return;
    const next = pending;
    setPending(null);
    importProgress(next);
    showToast(t.settings.importDone);
    onImported?.(next);
  }

  const info = pending ? summary(pending) : null;
  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input ref={input} type="file" accept=".json,application/json" hidden onChange={onFile} aria-hidden="true" tabIndex={-1} />
      {error && (
        <p className="import-error" role="alert">
          {t.settings.importError}
        </p>
      )}
      <Dialog
        open={!!pending}
        title={t.settings.importBtn}
        onClose={() => setPending(null)}
        actions={
          <>
            <button type="button" className="btn" onClick={confirm}>
              {t.settings.importConfirmBtn}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPending(null)}>
              {t.common.cancel}
            </button>
          </>
        }
      >
        <p>{t.settings.importConfirm}</p>
        {info && <p className="import-summary">{t.settings.importSummary(info.lessons, info.xp)}</p>}
      </Dialog>
    </>
  );
}
