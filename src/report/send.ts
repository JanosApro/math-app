/**
 * Sending bug reports: every report goes into a small localStorage outbox first, then to the
 * Supabase function `submit_bug_report` (public anon key, no sign-in). Network errors and the
 * server's rate limit keep the report for the next try (app start, back online); a report the
 * server refuses as invalid is dropped. Supabase is only loaded when there is something to send.
 */
import pkg from '../../package.json';
import { SOCIAL_CONFIGURED } from '../social/config';
import { getState } from '../state/store';
import { getReportQuestion, recentErrors } from './context';
import { addPending, buildReportContext, newReportId, removePending, type PendingReport, type ReportKind } from './report';

const STORAGE_KEY = 'zsebmatek-reports';
/** A report that failed this many times is given up. */
const MAX_TRIES = 20;

interface ReportStore {
  clientId: string;
  pending: PendingReport[];
}

function load(): ReportStore {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<ReportStore> | null;
    if (raw && typeof raw.clientId === 'string' && Array.isArray(raw.pending)) return { clientId: raw.clientId, pending: raw.pending };
  } catch {
    /* fall through to a fresh store */
  }
  return { clientId: newReportId(), pending: [] };
}

function save(s: ReportStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked: the report is only kept in memory for this send */
  }
}

/** Number of reports still waiting to be sent. */
export function pendingReportCount(): number {
  return load().pending.length;
}

/** Snapshot of the screen right now (the question on screen, page, device …). */
function currentContext(): Record<string, unknown> {
  const s = getState();
  return buildReportContext({
    page: location.hash || '#/',
    grade: s.grade,
    appVersion: pkg.version,
    device: {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      language: navigator.language,
      online: navigator.onLine,
      theme: s.settings.theme,
    },
    question: getReportQuestion(),
    errors: recentErrors(),
    now: new Date(),
  });
}

/**
 * Saves the report and tries to send it at once.
 * 'sent' = the server has it; 'queued' = it waits on this device and goes out later.
 */
export async function submitReport(kind: ReportKind, message: string): Promise<'sent' | 'queued'> {
  const store = load();
  const report: PendingReport = { key: newReportId(), kind, message: message.trim(), context: currentContext(), createdAt: new Date().toISOString(), tries: 0 };
  save({ ...store, pending: addPending(store.pending, report) });
  await flushReports();
  return load().pending.some((r) => r.key === report.key) ? 'queued' : 'sent';
}

let flushing: Promise<void> | null = null;

/** Sends the waiting reports (safe to call any time; concurrent calls share one run). */
export function flushReports(): Promise<void> {
  if (!flushing) flushing = doFlush().finally(() => (flushing = null));
  return flushing;
}

async function doFlush(): Promise<void> {
  if (!SOCIAL_CONFIGURED || typeof navigator === 'undefined' || !navigator.onLine) return;
  if (load().pending.length === 0) return;
  let supabase;
  try {
    supabase = (await import('../social/client')).getSupabase();
  } catch {
    return; // the chunk could not be loaded (offline): try again later
  }
  if (!supabase) return;
  for (const report of load().pending) {
    const { error } = await supabase.rpc('submit_bug_report', {
      p_report_key: report.key,
      p_client_id: load().clientId,
      p_kind: report.kind,
      p_message: report.message,
      p_context: report.context,
    });
    const store = load();
    if (!error) {
      save({ ...store, pending: removePending(store.pending, report.key) });
      continue;
    }
    // invalid input (22023) can never succeed: drop it; anything else waits for the next try
    const invalid = error.code === '22023';
    const tries = report.tries + 1;
    if (invalid || tries >= MAX_TRIES) save({ ...store, pending: removePending(store.pending, report.key) });
    else save({ ...store, pending: store.pending.map((r) => (r.key === report.key ? { ...r, tries } : r)) });
    if (!invalid) return; // offline or rate limited: stop here, keep the rest in order
  }
}

let started = false;

/** Sends what is waiting now and whenever the device comes back online (call once at startup). */
export function initReportSync(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  void flushReports();
  window.addEventListener('online', () => void flushReports());
}
