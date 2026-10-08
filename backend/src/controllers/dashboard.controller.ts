import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await dashboardService.getMetrics(req.user!.id));
});
