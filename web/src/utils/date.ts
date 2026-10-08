// The API returns ISO timestamps at UTC midnight (e.g. 2026-01-01T00:00:00.000Z) for date-only fields.
// Dates are therefore read and displayed in UTC so they never shift by a day in any browser time zone.

/** ISO timestamp -> "YYYY-MM-DD" for <input type="date">. */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** ISO timestamp -> "Jan 1, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** Today's date as "YYYY-MM-DD" in the user's local time zone. */
export function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** True when a due date is before today (and the caller decides whether the task is still open). */
export function isPastDate(iso: string | null | undefined): boolean {
  const value = toDateInput(iso);
  return value !== '' && value < todayInput();
}
