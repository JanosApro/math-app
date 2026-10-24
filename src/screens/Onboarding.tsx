// PLACEHOLDER — not built yet. Replace it following docs/tasks/01-app-shell.md.
// Keep the default export and its props; App.tsx routes to it.
import { t } from '../i18n/hu';

export default function Onboarding() {
  return (
    <div className="page">
      <div className="card">
        <h2>{t.common.soon}</h2>
        <p className="muted">Onboarding (placeholder)</p>
      </div>
    </div>
  );
}
