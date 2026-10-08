import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { taskService } from '../services/task.service';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { getErrorMessage } from '../utils/errors';
import { formatDate, isPastDate } from '../utils/date';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../utils/labels';
import type { Project, Task, TaskInput, TaskPriority, TaskStatus } from '../types';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Select, TextInput } from '../components/FormControls';
import { EmptyState, ErrorState, PageHeader } from '../components/StateViews';
import { PageSpinner } from '../components/Spinner';
import { TaskFormModal } from '../components/TaskFormModal';
import {
  CalendarIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../components/icons';

const COMPACT_SELECT = 'py-1.5 text-xs';

export function TasksPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | TaskStatus>('');
  const [priorityFilter, setPriorityFilter] = useState<'' | TaskPriority>('');
  // Deep link from the Projects page: /tasks?projectId=<id>
  const [projectFilter, setProjectFilter] = useState(searchParams.get('projectId') ?? '');
  const debouncedSearch = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());

  const requestId = useRef(0);

  // Projects feed the project filter and the task form.
  useEffect(() => {
    let cancelled = false;
    projectService
      .list()
      .then((list) => {
        if (!cancelled) setProjects(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Could not load your projects.'));
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  /** `silent` refreshes the list without dimming it (used after inline edits). */
  const load = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) {
        setRefreshing(true);
        setError(null);
      }
      try {
        const list = await taskService.list({
          search: debouncedSearch.trim() || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          projectId: projectFilter || undefined,
        });
        if (id === requestId.current) setTasks(list);
      } catch (err) {
        if (id === requestId.current && !silent) setError(getErrorMessage(err, 'Could not load your tasks.'));
      } finally {
        if (id === requestId.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    [debouncedSearch, statusFilter, priorityFilter, projectFilter],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const hasFilters = search.trim() !== '' || statusFilter !== '' || priorityFilter !== '' || projectFilter !== '';

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSaved(task: Task, mode: 'created' | 'updated') {
    closeForm();
    toast.success(mode === 'created' ? `Task “${task.name}” created.` : `Task “${task.name}” updated.`);
    void load();
  }

  /** Inline change of status / priority / completion for one task. */
  async function patchTask(task: Task, patch: TaskInput, successMessage?: string) {
    setBusyIds((current) => new Set(current).add(task.id));
    try {
      const updated = await taskService.update(task.id, patch);
      setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, ...updated } : item)));
      if (successMessage) toast.success(successMessage);
      void load(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the task.'));
    } finally {
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  }

  function toggleComplete(task: Task) {
    if (task.status === 'COMPLETED') {
      void patchTask(task, { status: 'PENDING' }, `Task “${task.name}” reopened.`);
    } else {
      void patchTask(task, { status: 'COMPLETED' }, `Task “${task.name}” marked complete.`);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await taskService.remove(deleting.id);
      toast.success(`Task “${deleting.name}” deleted.`);
      setDeleting(null);
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete the task.'));
    } finally {
      setDeleteBusy(false);
    }
  }

  const noProjects = projects.length === 0;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Everything you need to get done, across all projects."
        action={
          <Button onClick={openCreate} disabled={noProjects} title={noProjects ? 'Create a project first' : undefined}>
            <PlusIcon className="h-4 w-4" />
            New task
          </Button>
        }
      />

      {noProjects && !initialLoading && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tasks belong to a project. Create a project first, then come back to add tasks.
        </p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_160px_160px_200px_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            type="search"
            aria-label="Search tasks by name"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter tasks by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | TaskStatus)}
        >
          <option value="">All statuses</option>
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter tasks by priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as '' | TaskPriority)}
        >
          <option value="">All priorities</option>
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter tasks by project"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {initialLoading && <PageSpinner label="Loading tasks…" />}

      {!initialLoading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!initialLoading && !error && tasks.length === 0 && (
        <EmptyState
          icon={<CheckSquareIcon className="h-6 w-6" />}
          title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
          description={
            hasFilters
              ? 'Try a different search term or filter, or clear the filters.'
              : noProjects
                ? 'Create a project first, then add tasks to it.'
                : 'Add your first task to start tracking your work.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              !noProjects && (
                <Button onClick={openCreate}>
                  <PlusIcon className="h-4 w-4" />
                  New task
                </Button>
              )
            )
          }
        />
      )}

      {!initialLoading && !error && tasks.length > 0 && (
        <div
          className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${refreshing ? 'opacity-60' : ''}`}
          aria-busy={refreshing}
        >
          {/* Column headers (desktop only; on small screens each task is a card) */}
          <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_7rem_9rem_10rem_5rem] items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span><span className="sr-only">Done</span></span>
            <span>Task</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Due</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const busy = busyIds.has(task.id);
              const done = task.status === 'COMPLETED';
              const overdue = !done && isPastDate(task.dueDate);
              return (
                <li
                  key={task.id}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-[2.5rem_minmax(0,1fr)_7rem_9rem_10rem_5rem] md:items-center"
                >
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    disabled={busy}
                    aria-label={done ? `Mark “${task.name}” as pending` : `Mark “${task.name}” as complete`}
                    aria-pressed={done}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                      done
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                        : 'text-slate-300 ring-1 ring-inset ring-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-300'
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>

                  <div className="min-w-0">
                    <p className={`break-words text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {task.name}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 line-clamp-2 break-words text-xs text-slate-500">{task.description}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Project: <span className="font-medium text-slate-600">{task.project.name}</span>
                    </p>
                  </div>

                  {/* Below md these three controls sit on one row under the task, aligned with its text. */}
                  <div className="col-start-2 grid grid-cols-2 gap-3 md:contents">
                    <div className="md:col-auto">
                      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400 md:hidden">
                        Priority
                      </span>
                      <Select
                        aria-label={`Priority for ${task.name}`}
                        value={task.priority}
                        disabled={busy}
                        className={COMPACT_SELECT}
                        onChange={(e) => void patchTask(task, { priority: e.target.value as TaskPriority })}
                      >
                        {TASK_PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400 md:hidden">
                        Status
                      </span>
                      <Select
                        aria-label={`Status for ${task.name}`}
                        value={task.status}
                        disabled={busy}
                        className={COMPACT_SELECT}
                        onChange={(e) => void patchTask(task, { status: e.target.value as TaskStatus })}
                      >
                        {TASK_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="col-start-2 flex items-center justify-between md:col-auto md:contents">
                    <p
                      className={`flex items-center gap-1.5 text-xs ${overdue ? 'font-medium text-rose-600' : 'text-slate-500'}`}
                    >
                      {task.dueDate ? (
                        <>
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {formatDate(task.dueDate)}
                            {overdue && ' · Overdue'}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">No due date</span>
                      )}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        aria-label={`Edit task ${task.name}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(task)}
                        aria-label={`Delete task ${task.name}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {formOpen && (
        <TaskFormModal
          task={editing}
          projects={projects}
          defaultProjectId={projectFilter || undefined}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          confirmLabel="Delete task"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          message={
            <>
              <p>
                <strong className="text-slate-900">{deleting.name}</strong> will be permanently deleted.
              </p>
              <p className="mt-2">This cannot be undone.</p>
            </>
          }
        />
      )}
    </>
  );
}
