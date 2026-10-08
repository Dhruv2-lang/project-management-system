import { useState, type FormEvent } from 'react';
import { taskService } from '../services/task.service';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { toDateInput } from '../utils/date';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../utils/labels';
import type { Project, Task, TaskPriority, TaskStatus } from '../types';
import { Button } from './Button';
import { Field, Select, TextArea, TextInput } from './FormControls';
import { FormError } from './StateViews';
import { Modal } from './Modal';

interface TaskFormModalProps {
  /** Pass a task to edit it; omit to create a new one. */
  task?: Task | null;
  /** The user's projects (a task must belong to one of them). */
  projects: Project[];
  /** Pre-selected project when creating (e.g. the project filter that is active). */
  defaultProjectId?: string;
  onClose: () => void;
  onSaved: (task: Task, mode: 'created' | 'updated') => void;
}

type Errors = Partial<Record<'projectId' | 'name' | 'description' | 'priority' | 'status' | 'dueDate', string>>;

export function TaskFormModal({ task, projects, defaultProjectId, onClose, onSaved }: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const [projectId, setProjectId] = useState(task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? '');
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'PENDING');
  const [dueDate, setDueDate] = useState(toDateInput(task?.dueDate));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!projectId) next.projectId = 'Choose a project for this task';
    if (!name.trim()) next.name = 'Task name is required';
    else if (name.trim().length > 150) next.name = 'Task name must be at most 150 characters';
    if (description.trim().length > 2000) next.description = 'Description must be at most 2000 characters';
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    const payload = {
      projectId,
      name: name.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate || null,
    };

    setSubmitting(true);
    try {
      const saved = task ? await taskService.update(task.id, payload) : await taskService.create(payload);
      onSaved(saved, isEdit ? 'updated' : 'created');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const known: Errors = {};
      for (const key of ['projectId', 'name', 'description', 'priority', 'status', 'dueDate'] as const) {
        if (fieldErrors[key]) known[key] = fieldErrors[key];
      }
      setErrors(known);
      if (Object.keys(known).length === 0) setFormError(getErrorMessage(err, 'Could not save the task.'));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit task' : 'New task'} onClose={onClose} busy={submitting}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormError message={formError} />}

        <Field id="task-project" label="Project" required error={errors.projectId}>
          <Select
            id="task-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            invalid={Boolean(errors.projectId)}
            disabled={submitting}
          >
            {!projectId && <option value="">Select a project…</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="task-name" label="Name" required error={errors.name}>
          <TextInput
            id="task-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={Boolean(errors.name)}
            disabled={submitting}
            maxLength={150}
            placeholder="e.g. Write the launch announcement"
          />
        </Field>

        <Field id="task-description" label="Description" error={errors.description}>
          <TextArea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            invalid={Boolean(errors.description)}
            disabled={submitting}
            maxLength={2000}
            placeholder="Add any details"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="task-priority" label="Priority" error={errors.priority}>
            <Select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              invalid={Boolean(errors.priority)}
              disabled={submitting}
            >
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="task-status" label="Status" error={errors.status}>
            <Select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              invalid={Boolean(errors.status)}
              disabled={submitting}
            >
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field id="task-due" label="Due date" error={errors.dueDate}>
          <TextInput
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            invalid={Boolean(errors.dueDate)}
            disabled={submitting}
          />
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
