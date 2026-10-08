import { z } from 'zod';

export const requiredString = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

/** Optional free text; empty string is stored as null. */
export const optionalText = (label: string, max: number) =>
  z
    .string({ error: `${label} must be a string` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

/**
 * True only for real calendar dates in ISO 8601 form. `Date.parse` alone is too lenient: it rolls
 * "2026-02-31" over to March 3rd, so the year/month/day components are checked explicitly.
 */
function isRealIsoDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!m || Number.isNaN(Date.parse(value))) return false;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/** ISO-8601 date or datetime string -> Date. null clears the value. */
export const optionalDate = (label: string) =>
  z
    .string({ error: `${label} must be a valid ISO 8601 date (e.g. 2026-10-31)` })
    .refine(isRealIsoDate, `${label} must be a valid ISO 8601 date (e.g. 2026-10-31)`)
    .transform((v) => new Date(v))
    .nullable()
    .optional();

export const idParamSchema = z.object({ id: z.uuid() });

/** Query-string text that treats an empty value as "not provided". */
export const searchParam = z
  .string()
  .trim()
  .max(100, 'search must be at most 100 characters')
  .optional()
  .transform((v) => (v ? v : undefined));
