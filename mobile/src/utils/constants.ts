import { ProjectStatus, TaskPriority, TaskStatus } from '../types';
import { colors } from '../theme';

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const PROJECT_STATUS_OPTIONS: Option<ProjectStatus>[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const TASK_STATUS_OPTIONS: Option<TaskStatus>[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS: Option<TaskPriority>[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};
export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export interface Tone {
  fg: string;
  bg: string;
}
export const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  NOT_STARTED: { fg: colors.neutral, bg: colors.neutralSoft },
  IN_PROGRESS: { fg: colors.info, bg: colors.infoSoft },
  COMPLETED: { fg: colors.success, bg: colors.successSoft },
};
export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  PENDING: { fg: colors.neutral, bg: colors.neutralSoft },
  IN_PROGRESS: { fg: colors.info, bg: colors.infoSoft },
  COMPLETED: { fg: colors.success, bg: colors.successSoft },
};
export const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  LOW: { fg: colors.success, bg: colors.successSoft },
  MEDIUM: { fg: colors.warning, bg: colors.warningSoft },
  HIGH: { fg: colors.danger, bg: colors.dangerSoft },
};

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
export const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Please check your internet connection and try again.';
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
