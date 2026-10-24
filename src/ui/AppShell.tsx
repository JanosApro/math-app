// PLACEHOLDER — not built yet. Replace it following docs/tasks/01-app-shell.md
// (top bar with streak + XP, bottom navigation). Keep the export name and props.
import type { ReactNode } from 'react';
import type { Route } from './router';

export function AppShell({ children }: { route: Route; children: ReactNode }) {
  return <>{children}</>;
}
