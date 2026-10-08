import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, validationError } from '../utils/AppError';
import { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from '../validators/project';

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  _count: { select: { tasks: true } },
} satisfies Prisma.ProjectSelect;

type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectSelect }>;

/** Flattens Prisma's _count into a client-friendly `taskCount`. */
function shape({ _count, ...project }: ProjectRow) {
  return { ...project, taskCount: _count.tasks };
}

/** Every query below is scoped by userId taken from the JWT, so other users' rows can never match. */
async function findOwned(userId: string, id: string) {
  const project = await prisma.project.findFirst({ where: { id, userId }, select: projectSelect });
  if (!project) throw notFound('Project not found');
  return project;
}

export async function list(userId: string, q: ListProjectsQuery) {
  const where: Prisma.ProjectWhereInput = { userId };
  if (q.status) where.status = q.status;
  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { description: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  const rows = await prisma.project.findMany({ where, select: projectSelect, orderBy: { createdAt: 'desc' } });
  return rows.map(shape);
}

export async function getById(userId: string, id: string) {
  return shape(await findOwned(userId, id));
}

export async function create(userId: string, input: CreateProjectInput) {
  const row = await prisma.project.create({
    data: {
      userId, // from the JWT, never from the request body
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    select: projectSelect,
  });
  return shape(row);
}

export async function update(userId: string, id: string, input: UpdateProjectInput) {
  const existing = await findOwned(userId, id);

  // Validate the date range against the merged (stored + incoming) values.
  const startDate = input.startDate !== undefined ? input.startDate : existing.startDate;
  const endDate = input.endDate !== undefined ? input.endDate : existing.endDate;
  if (startDate && endDate && endDate < startDate) {
    throw validationError([{ field: 'endDate', message: 'endDate must be on or after startDate' }]);
  }

  const row = await prisma.project.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    select: projectSelect,
  });
  return shape(row);
}

/** Deleting a project also deletes its tasks (ON DELETE CASCADE in the database). */
export async function remove(userId: string, id: string) {
  const { count } = await prisma.project.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound('Project not found');
}
