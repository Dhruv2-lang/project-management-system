import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth';

export const createAuthRouter = (authLimiter: import('express').RequestHandler) => {
  const router = Router();
  router.post('/register', authLimiter, validate('body', registerSchema), ctrl.register);
  router.post('/login', authLimiter, validate('body', loginSchema), ctrl.login);
  router.post('/logout', ctrl.logout);
  router.get('/me', authenticate, ctrl.me);
  return router;
};
