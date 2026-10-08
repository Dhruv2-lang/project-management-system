import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  sub: string; // user id
}

export function signToken(userId: string): string {
  const options: SignOptions = { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId }, env.JWT_SECRET, options);
}

/** Throws jsonwebtoken errors (TokenExpiredError / JsonWebTokenError) on failure. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return { sub: decoded.sub };
}
