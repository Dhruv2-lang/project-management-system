import { z } from 'zod';
import { optionalDate, optionalText, requiredString, searchParam } from './common';

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const priority = z.enum(TASK_PRIORITIES, { error: `priority must be one of: ${TASK_PRIORITIES.join(', ')}` });
const status = z.enum(TASK_STATUSES, { error: `status must be one of: ${TASK_STATUSES.join(', ')}` });
const projectId = z.uuid({ error: 'projectId must be a valid id' });

const base = z.object({
  projectId,
  name: requiredString('Task name', 150),
  description: optionalText('Description', 2000),
  priority,
  status,
  dueDate: optionalDate('dueDate'),
});

// userId is intentionally NOT part of any schema: zod strips unknown keys, and the owner always comes from the JWT.
export const createTaskSchema = base.partial({ priority: true, status: true });

export const updateTaskSchema = base
  .partial()
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'Provide at least one field to update' });

export const listTasksQuerySchema = z.object({
  search: searchParam,
  status: status.optional(),
  priority: priority.optional(),
  projectId: projectId.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
