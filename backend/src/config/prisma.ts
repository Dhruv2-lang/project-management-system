import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

// Prisma 6 "client" engine: queries run through the pg driver adapter (no native engine binary).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: env.isProduction ? ['error'] : env.isTest ? [] : ['warn', 'error'],
});
