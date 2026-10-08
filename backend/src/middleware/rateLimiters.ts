import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const handler = (message: string) => (_req: any, _res: any, next: (e: unknown) => void) =>
  next(new AppError(429, message));

/** Strict limiter for register/login to slow down brute-force and credential-stuffing attempts. */
export const createAuthLimiter = (max = env.AUTH_RATE_LIMIT_MAX) =>
  rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: handler('Too many authentication attempts. Please try again later.'),
  });

/** Broad limiter for the rest of the API. */
export const createApiLimiter = (max = env.API_RATE_LIMIT_MAX) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: handler('Too many requests. Please slow down.'),
  });
