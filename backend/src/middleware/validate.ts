import { NextFunction, Request, Response } from 'express';
import { z, ZodType } from 'zod';
import { badRequest, validationError, FieldError } from '../utils/AppError';
import { idParamSchema } from '../validators/common';

export function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((i) => ({ field: i.path.join('.') || 'body', message: i.message }));
}

/** Validates (and sanitizes) req.body / req.query with a zod schema. Unknown keys are stripped. */
export const validate =
  (source: 'body' | 'query', schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const input = source === 'body' ? (req.body ?? {}) : req.query;
    const result = schema.safeParse(input);
    if (!result.success) return next(validationError(toFieldErrors(result.error)));
    if (source === 'body') req.body = result.data;
    else Object.assign(req, { query: result.data });
    next();
  };

/** Rejects malformed :id path params (must be a UUID) before they reach the database. */
export function validateIdParam(req: Request, _res: Response, next: NextFunction) {
  if (!idParamSchema.safeParse(req.params).success) return next(badRequest('Invalid id format'));
  next();
}
