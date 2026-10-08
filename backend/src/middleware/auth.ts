import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { unauthorized } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

/**
 * Requires `Authorization: Bearer <jwt>`.
 * The user is re-loaded from the database on every request, so tokens of deleted users stop working
 * and `req.user.id` is always a trusted value derived from the verified token.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw unauthorized('Authentication token is missing');
    const token = header.slice(7).trim();
    if (!token) throw unauthorized('Authentication token is missing');

    let userId: string;
    try {
      userId = verifyToken(token).sub;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) throw unauthorized('Token has expired. Please log in again');
      throw unauthorized('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });
    if (!user) throw unauthorized('Invalid authentication token');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
