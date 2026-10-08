export type Errors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | undefined {
  const v = email.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return undefined;
}

/** Mirrors the backend rule: 8-72 chars, at least one letter and one number. */
export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return undefined;
}

export function validateFullName(name: string): string | undefined {
  const v = name.trim();
  if (!v) return 'Full name is required';
  if (v.length > 100) return 'Full name must be 100 characters or fewer';
  return undefined;
}

export function validateRequiredText(label: string, value: string, max: number): string | undefined {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (v.length > max) return `${label} must be ${max} characters or fewer`;
  return undefined;
}

export function validateOptionalText(label: string, value: string, max: number): string | undefined {
  if (value.trim().length > max) return `${label} must be ${max} characters or fewer`;
  return undefined;
}

/** Date fields are "YYYY-MM-DD" strings (empty = not set). */
export function validateOptionalDate(label: string, value: string): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return `${label} is not a valid date`;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) {
    return `${label} is not a valid date`;
  }
  return undefined;
}

export function validateDateOrder(start: string, end: string): string | undefined {
  if (start && end && end < start) return 'End date must be on or after the start date';
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
