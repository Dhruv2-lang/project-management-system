import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { conflict, unauthorized } from '../utils/AppError';
import { signToken } from '../utils/jwt';

/** Fields that are safe to return to clients. passwordHash is never selected unless needed for login. */
export const safeUserSelect = { id: true, fullName: true, email: true, createdAt: true } as const;

// Used to keep login timing similar whether or not the email exists (mitigates user enumeration).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.BCRYPT_ROUNDS);

export async function register(input: { fullName: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  try {
    const user = await prisma.user.create({
      data: { fullName: input.fullName, email: input.email, passwordHash },
      select: safeUserSelect,
    });
    return { user, token: signToken(user.id) };
  } catch (err) {
    // Two simultaneous registrations with the same email: the unique index is the final guard.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw conflict('An account with this email already exists');
    }
    throw err;
  }
}

export async function login(input: { email: string; password: string }) {
  const record = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(input.password, record?.passwordHash ?? DUMMY_HASH);
  if (!record || !valid) throw unauthorized('Invalid email or password');

  const { passwordHash: _omit, ...user } = record;
  return { user, token: signToken(record.id) };
}
