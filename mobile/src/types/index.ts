export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  taskCount?: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  project?: { id: string; name: string };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  projectsInProgress: number;
}

/** Envelope returned by every successful API call. */
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  count?: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

/** Envelope returned by every failed API call. */
export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export interface AuthPayload {
  user: User;
  token: string;
}

/* ---- Request payloads (always backend enum values, never display labels) ---- */
export interface ProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TaskInput {
  projectId?: string;
  name?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
}
