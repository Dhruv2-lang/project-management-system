import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.list(req.user!.id, req.query as any);
  ok(res, projects, { count: projects.length });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await projectService.getById(req.user!.id, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  created(res, await projectService.create(req.user!.id, req.body), { message: 'Project created' });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await projectService.update(req.user!.id, req.params.id, req.body), { message: 'Project updated' });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await projectService.remove(req.user!.id, req.params.id);
  ok(res, null, { message: 'Project and its tasks deleted' });
});
