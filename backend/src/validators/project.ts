import { z } from 'zod';
import { optionalDate, optionalText, requiredString, searchParam } from './common';

export const PROJECT_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
const status = z.enum(PROJECT_STATUSES, { error: `status must be one of: ${PROJECT_STATUSES.join(', ')}` });

const base = z.object({
  name: requiredString('Project name', 150),
  description: optionalText('Description', 2000),
  status,
  startDate: optionalDate('startDate'),
  endDate: optionalDate('endDate'),
});

const datesInOrder = (d: { startDate?: Date | null; endDate?: Date | null }) =>
  !d.startDate || !d.endDate || d.endDate >= d.startDate;
const datesMessage = { message: 'endDate must be on or after startDate', path: ['endDate'] };

export const createProjectSchema = base.partial({ status: true }).refine(datesInOrder, datesMessage);

export const updateProjectSchema = base
  .partial()
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'Provide at least one field to update' })
  .refine(datesInOrder, datesMessage);

export const listProjectsQuerySchema = z.object({
  search: searchParam,
  status: status.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
