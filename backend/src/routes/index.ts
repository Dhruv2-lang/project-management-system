import { RequestHandler, Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { createAuthRouter } from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';

export function createApiRouter(authLimiter: RequestHandler) {
  const router = Router();

  // Public: liveness + database connectivity check.
  router.get(
    '/health',
    asyncHandler(async (_req, res) => {
      await prisma.$queryRaw`SELECT 1`; // static tagged template: no user input involved
      res.json({ success: true, data: { status: 'ok', database: 'connected' } });
    }),
  );

  router.use('/auth', createAuthRouter(authLimiter));

  // Everything below requires a valid JWT.
  router.use('/projects', authenticate, projectRoutes);
  router.use('/tasks', authenticate, taskRoutes);
  router.use('/dashboard', authenticate, dashboardRoutes);

  return router;
}
