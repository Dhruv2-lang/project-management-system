import type { ProjectStatus, TaskPriority, TaskStatus } from '../types';

// The API uses UPPER_SNAKE_CASE enums; the UI shows friendly labels.

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const PROJECT_STATUS_OPTIONS = toOptions(PROJECT_STATUS_LABELS);
export const TASK_STATUS_OPTIONS = toOptions(TASK_STATUS_LABELS);
export const TASK_PRIORITY_OPTIONS = toOptions(TASK_PRIORITY_LABELS);

// Full class names so Tailwind can detect them at build time.
export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'bg-sky-50 text-sky-700 ring-sky-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 ring-rose-200',
};
