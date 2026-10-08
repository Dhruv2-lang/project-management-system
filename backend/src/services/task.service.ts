import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound } from '../utils/AppError';
import { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../validators/task';

const taskSelect = {
  id: true,
  projectId: true,
  name: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  createdAt: true,
  project: { select: { id: true, name: true } },
} satisfies Prisma.TaskSelect;

/** A task may only be attached to a project the same user owns. Otherwise: 404 (do not reveal it exists). */
async function assertOwnsProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId }, select: { id: true } });
  if (!project) throw notFound('Project not found');
}

async function findOwned(userId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, userId }, select: taskSelect });
  if (!task) throw notFound('Task not found');
  return task;
}

export async function list(userId: string, q: ListTasksQuery) {
  const where: Prisma.TaskWhereInput = { userId };
  if (q.status) where.status = q.status;
  if (q.priority) where.priority = q.priority;
  if (q.projectId) where.projectId = q.projectId;
  if (q.search) where.name = { contains: q.search, mode: 'insensitive' };
  return prisma.task.findMany({ where, select: taskSelect, orderBy: { createdAt: 'desc' } });
}

export const getById = findOwned;

export async function create(userId: string, input: CreateTaskInput) {
  await assertOwnsProject(userId, input.projectId);
  return prisma.task.create({
    data: {
      userId, // from the JWT, never from the request body
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate,
    },
    select: taskSelect,
  });
}

export async function update(userId: string, id: string, input: UpdateTaskInput) {
  await findOwned(userId, id);
  if (input.projectId) await assertOwnsProject(userId, input.projectId); // moving a task: target must be yours too

  return prisma.task.update({
    where: { id },
    data: {
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate,
    },
    select: taskSelect,
  });
}

export async function remove(userId: string, id: string) {
  const { count } = await prisma.task.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound('Task not found');
}
