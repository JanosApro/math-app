/**
 * Calendar dates as 'YYYY-MM-DD' strings in the Europe/Belgrade timezone, so the daily
 * challenge changes at local midnight for every student.
 */
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit' });

/** Today's date in Belgrade, e.g. '2026-10-24'. */
export function todayBelgrade(now: Date = new Date()): string {
  return fmt.format(now);
}

function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(date: string, days: number): string {
  const t = new Date(toUtc(date) + days * 86400000);
  return t.toISOString().slice(0, 10);
}

/** Whole days from a to b (b − a). */
export function dayDiff(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayMon0(date: string): number {
  return (new Date(toUtc(date)).getUTCDay() + 6) % 7;
}

/**
 * School year progress (0..1): from September 1 to June 15 (Serbian school year).
 * Used for the "where should I be by now" marker of the year goal.
 */
export function schoolYearProgress(date: string): number {
  const [y, m] = date.split('-').map(Number);
  const startYear = m >= 7 ? y : y - 1;
  const start = `${startYear}-09-01`;
  const end = `${startYear + 1}-06-15`;
  const total = dayDiff(start, end);
  const done = dayDiff(start, date);
  return Math.min(1, Math.max(0, done / total));
}

const HU_MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

/** '2026-10-24' → '2026. október 24.' */
export function formatDateHu(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y}. ${HU_MONTHS[m - 1]} ${d}.`;
}
