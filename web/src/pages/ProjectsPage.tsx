import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/date';
import { PROJECT_STATUS_OPTIONS } from '../utils/labels';
import type { Project, ProjectStatus } from '../types';
import { Button } from '../components/Button';
import { ProjectStatusBadge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Select, TextInput } from '../components/FormControls';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { EmptyState, ErrorState, PageHeader } from '../components/StateViews';
import { PageSpinner } from '../components/Spinner';
import { CalendarIcon, FolderIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from '../components/icons';

function dateRange(project: Project): string | null {
  const start = formatDate(project.startDate);
  const end = formatDate(project.endDate);
  if (start && end) return `${start} – ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Ends ${end}`;
  return null;
}

export function ProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ProjectStatus>('');
  const debouncedSearch = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Ignore responses from superseded requests (fast typing / quick filter changes).
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setRefreshing(true);
    setError(null);
    try {
      const list = await projectService.list({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
      });
      if (id === requestId.current) setProjects(list);
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err, 'Could not load your projects.'));
    } finally {
      if (id === requestId.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasFilters = search.trim() !== '' || statusFilter !== '';

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSaved(project: Project, mode: 'created' | 'updated') {
    closeForm();
    toast.success(mode === 'created' ? `Project “${project.name}” created.` : `Project “${project.name}” updated.`);
    void load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await projectService.remove(deleting.id);
      toast.success(`Project “${deleting.name}” deleted.`);
      setDeleting(null);
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete the project.'));
    } finally {
      setDeleteBusy(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create and track the projects you are working on."
        action={
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            type="search"
            aria-label="Search projects by name"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter projects by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | ProjectStatus)}
        >
          <option value="">All statuses</option>
          {PROJECT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {initialLoading && <PageSpinner label="Loading projects…" />}

      {!initialLoading && error && <ErrorState message={error} onRetry={load} />}

      {!initialLoading && !error && projects.length === 0 && (
        <EmptyState
          icon={<FolderIcon className="h-6 w-6" />}
          title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
          description={
            hasFilters
              ? 'Try a different search term or status, or clear the filters.'
              : 'Projects group your tasks together. Create your first one to get started.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={openCreate}>
                <PlusIcon className="h-4 w-4" />
                New project
              </Button>
            )
          }
        />
      )}

      {!initialLoading && !error && projects.length > 0 && (
        <ul
          className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${refreshing ? 'opacity-60' : ''}`}
          aria-busy={refreshing}
        >
          {projects.map((project) => {
            const range = dateRange(project);
            return (
              <li
                key={project.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-base font-semibold text-slate-900">{project.name}</h2>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <p className="mt-2 line-clamp-3 flex-1 break-words text-sm text-slate-500">
                  {project.description || 'No description.'}
                </p>

                {range && (
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarIcon className="h-4 w-4" />
                    {range}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Link
                    to={`/tasks?projectId=${project.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      aria-label={`Edit project ${project.name}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(project)}
                      aria-label={`Delete project ${project.name}`}
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
      )}

      {formOpen && <ProjectFormModal project={editing} onClose={closeForm} onSaved={handleSaved} />}

      {deleting && (
        <ConfirmDialog
          title="Delete project?"
          confirmLabel="Delete project"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          message={
            <>
              <p>
                <strong className="text-slate-900">{deleting.name}</strong> will be permanently deleted.
              </p>
              {deleting.taskCount > 0 && (
                <p className="mt-2 text-rose-700">
                  This also deletes its {deleting.taskCount} {deleting.taskCount === 1 ? 'task' : 'tasks'}. This cannot
                  be undone.
                </p>
              )}
              {deleting.taskCount === 0 && <p className="mt-2">This cannot be undone.</p>}
            </>
          }
        />
      )}
    </>
  );
}
