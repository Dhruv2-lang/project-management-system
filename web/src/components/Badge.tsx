import type { ProjectStatus, TaskPriority, TaskStatus } from '../types';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
} from '../utils/labels';

function Pill({ label, style }: { label: string; style: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Pill label={PROJECT_STATUS_LABELS[status]} style={PROJECT_STATUS_STYLES[status]} />;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Pill label={TASK_STATUS_LABELS[status]} style={TASK_STATUS_STYLES[status]} />;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Pill label={TASK_PRIORITY_LABELS[priority]} style={TASK_PRIORITY_STYLES[priority]} />;
}
