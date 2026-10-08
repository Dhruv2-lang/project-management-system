import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { safeUserSelect } from '../services/auth.service';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { unauthorized } from '../utils/AppError';
import { created, ok } from '../utils/response';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  created(res, result, { message: 'Registration successful' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ok(res, result, { message: 'Login successful' });
});

/**
 * JWTs are stateless and there is NO server-side token revocation. Logout is therefore a client-side action:
 * the client must delete its stored token. This endpoint exists for a consistent API and always succeeds.
 */
export const logout = (_req: Request, res: Response) => {
  ok(res, null, { message: 'Logged out. Discard the stored token on the client; it remains valid until it expires.' });
};

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: safeUserSelect });
  if (!user) throw unauthorized('Invalid authentication token');
  ok(res, { user });
});
