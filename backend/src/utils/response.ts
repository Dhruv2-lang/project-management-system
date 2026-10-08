import { Response } from 'express';

/** Every successful response has the shape { success: true, data, ...extras }. */
export function ok<T>(res: Response, data: T, extra: Record<string, unknown> = {}, status = 200) {
  return res.status(status).json({ success: true, ...extra, data });
}

export const created = <T>(res: Response, data: T, extra: Record<string, unknown> = {}) => ok(res, data, extra, 201);
