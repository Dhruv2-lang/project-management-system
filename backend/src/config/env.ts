import 'dotenv/config';

/**
 * Central, validated environment configuration.
 * The app fails fast at startup if a required variable is missing or weak.
 */
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name} (see backend/.env.example)`);
  }
  return value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw new Error(`Environment variable ${name} must be a non-negative integer`);
  return n;
}

const JWT_SECRET = required('JWT_SECRET');
const minSecretLength = isProduction ? 32 : 16;
if (JWT_SECRET.length < minSecretLength) {
  throw new Error(`JWT_SECRET must be at least ${minSecretLength} characters long`);
}

export const env = {
  NODE_ENV,
  isProduction,
  isTest: NODE_ENV === 'test',
  PORT: int('PORT', 5000),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  // Comma-separated list of allowed browser origins (e.g. the React web app).
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  BCRYPT_ROUNDS: int('BCRYPT_ROUNDS', 12),
  // Auth endpoints (register/login): max attempts per IP per window.
  AUTH_RATE_LIMIT_MAX: int('AUTH_RATE_LIMIT_MAX', 10),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: int('AUTH_RATE_LIMIT_WINDOW_MINUTES', 15),
  // All /api routes: max requests per IP per window.
  API_RATE_LIMIT_MAX: int('API_RATE_LIMIT_MAX', 300),
  // Number of reverse-proxy hops to trust (0 = none). Needed for correct client IPs behind a proxy.
  TRUST_PROXY: int('TRUST_PROXY', 0),
};
