import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { toFieldErrors } from './validate';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.path}`));
}

/** Single place where every error becomes a consistent JSON response: { success:false, message, errors? }. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    status = 422;
    message = 'Validation failed';
    errors = toFieldErrors(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Database errors: translate known codes, never leak SQL/internal details.
    if (err.code === 'P2002') {
      status = 409;
      message = 'A record with these values already exists';
    } else if (err.code === 'P2025') {
      status = 404;
      message = 'Resource not found';
    } else if (err.code === 'P2003') {
      status = 409;
      message = 'Operation conflicts with related data';
    } else {
      logger.error(`Database error ${err.code} on ${req.method} ${req.path}`, err);
    }
  } else if (typeof err === 'object' && err !== null && (err as any).type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body';
  } else if (typeof err === 'object' && err !== null && (err as any).type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  } else {
    logger.error(`Unhandled error on ${req.method} ${req.path}`, err);
  }

  const body: Record<string, unknown> = { success: false, message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
}
