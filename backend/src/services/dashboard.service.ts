import { prisma } from '../config/prisma';

/**
 * Metrics are computed with two grouped COUNT queries in the database (no rows are loaded into memory),
 * both filtered by the authenticated user's id.
 *
 * Definitions:
 *  - completedTasks = tasks with status COMPLETED
 *  - pendingTasks   = tasks with status PENDING
 *  - inProgressTasks (extra) = tasks with status IN_PROGRESS, so that pending + inProgress + completed = totalTasks
 *  - projectsInProgress = projects with status IN_PROGRESS
 */
export async function getMetrics(userId: string) {
  const [taskGroups, projectGroups] = await Promise.all([
    prisma.task.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
    prisma.project.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
  ]);

  const taskCount = (status: string) => taskGroups.find((g) => g.status === status)?._count._all ?? 0;
  const projectCount = (status: string) => projectGroups.find((g) => g.status === status)?._count._all ?? 0;

  return {
    totalProjects: projectGroups.reduce((sum, g) => sum + g._count._all, 0),
    totalTasks: taskGroups.reduce((sum, g) => sum + g._count._all, 0),
    completedTasks: taskCount('COMPLETED'),
    pendingTasks: taskCount('PENDING'),
    inProgressTasks: taskCount('IN_PROGRESS'),
    projectsInProgress: projectCount('IN_PROGRESS'),
  };
}
