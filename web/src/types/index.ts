// Types mirror the backend contract documented in docs/API.md.

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
  taskCount: number;
}

export interface TaskProjectRef {
  id: string;
  name: string;
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
  project: TaskProjectRef;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  projectsInProgress: number;
}

// ---- Request bodies ----

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

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

export interface ProjectListParams {
  search?: string;
  status?: ProjectStatus;
}

export interface TaskListParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
}

// ---- Response envelopes ----

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiList<T> extends ApiSuccess<T[]> {
  count: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export interface AuthPayload {
  user: User;
  token: string;
}
