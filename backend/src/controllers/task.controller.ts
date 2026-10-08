import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.list(req.user!.id, req.query as any);
  ok(res, tasks, { count: tasks.length });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await taskService.getById(req.user!.id, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  created(res, await taskService.create(req.user!.id, req.body), { message: 'Task created' });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await taskService.update(req.user!.id, req.params.id, req.body), { message: 'Task updated' });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await taskService.remove(req.user!.id, req.params.id);
  ok(res, null, { message: 'Task deleted' });
});
