import { env } from '../config/env';

/** Minimal logger. Never log passwords, tokens or request bodies. */
const stamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string) => {
    if (!env.isTest) console.log(`[${stamp()}] INFO  ${msg}`);
  },
  warn: (msg: string) => {
    if (!env.isTest) console.warn(`[${stamp()}] WARN  ${msg}`);
  },
  error: (msg: string, err?: unknown) => {
    if (env.isTest) return;
    console.error(`[${stamp()}] ERROR ${msg}`);
    if (err instanceof Error) console.error(env.isProduction ? `${err.name}: ${err.message}` : err.stack);
  },
};
