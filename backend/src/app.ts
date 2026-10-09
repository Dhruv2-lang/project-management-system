import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createApiLimiter, createAuthLimiter } from './middleware/rateLimiters';
import { createApiRouter } from './routes';

export interface AppOptions {
  /** Override the auth rate limit (used by tests). */
  authRateLimitMax?: number;
}

const DEV_LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function createApp(options: AppOptions = {}) {
  const app = express();
  if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet());

  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header = non-browser client (React Native, curl, server-to-server): CORS does not apply.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // In development any localhost port is allowed (Vite, Expo web, etc). Never in production.
        if (!env.isProduction && DEV_LOCALHOST.test(origin)) return callback(null, true);
        return callback(null, false); // no CORS headers => the browser blocks the response
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );

  if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use(express.json({ limit: '100kb' }));

// Root endpoint: confirms the API service is running.
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Project Management API is running',
    health: '/api/health'
  });
});

app.use(
  '/api',
  createApiLimiter(),
  createApiRouter(createAuthLimiter(options.authRateLimitMax))
);

app.use(notFoundHandler);
app.use(errorHandler);

  return app;
}
