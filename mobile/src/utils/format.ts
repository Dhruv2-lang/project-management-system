const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-01T00:00:00.000Z" -> "1 Nov 2026" (dates are stored as UTC midnight). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** ISO timestamp from the API -> "YYYY-MM-DD" for form state. */
export function isoToDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Local Date (from the native picker) -> "YYYY-MM-DD". */
export function dateToInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" -> local Date (noon, avoids DST edge cases) or null. */
export function inputToDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Form value -> API value. Single place to change the outgoing date format. */
export function toApiDate(value: string): string | null {
  return value ? value : null;
}

export function formatDateInput(value: string): string {
  const d = inputToDate(value);
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '';
}

export function isOverdue(dueIso: string | null, completed: boolean): boolean {
  if (!dueIso || completed) return false;
  return dueIso.slice(0, 10) < dateToInput(new Date());
}
