import { useState, type FormEvent } from 'react';
import { projectService } from '../services/project.service';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { toDateInput } from '../utils/date';
import { PROJECT_STATUS_OPTIONS } from '../utils/labels';
import type { Project, ProjectStatus } from '../types';
import { Button } from './Button';
import { Field, Select, TextArea, TextInput } from './FormControls';
import { FormError } from './StateViews';
import { Modal } from './Modal';

interface ProjectFormModalProps {
  /** Pass a project to edit it; omit to create a new one. */
  project?: Project | null;
  onClose: () => void;
  onSaved: (project: Project, mode: 'created' | 'updated') => void;
}

type Errors = Partial<Record<'name' | 'description' | 'status' | 'startDate' | 'endDate', string>>;

export function ProjectFormModal({ project, onClose, onSaved }: ProjectFormModalProps) {
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'NOT_STARTED');
  const [startDate, setStartDate] = useState(toDateInput(project?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(project?.endDate));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Project name is required';
    else if (name.trim().length > 150) next.name = 'Project name must be at most 150 characters';
    if (description.trim().length > 2000) next.description = 'Description must be at most 2000 characters';
    if (startDate && endDate && endDate < startDate) next.endDate = 'End date must be on or after the start date';
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
      name: name.trim(),
      description: description.trim() || null,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    setSubmitting(true);
    try {
      const saved = project ? await projectService.update(project.id, payload) : await projectService.create(payload);
      onSaved(saved, isEdit ? 'updated' : 'created');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const known: Errors = {};
      for (const key of ['name', 'description', 'status', 'startDate', 'endDate'] as const) {
        if (fieldErrors[key]) known[key] = fieldErrors[key];
      }
      setErrors(known);
      if (Object.keys(known).length === 0) setFormError(getErrorMessage(err, 'Could not save the project.'));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit project' : 'New project'} onClose={onClose} busy={submitting}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormError message={formError} />}

        <Field id="project-name" label="Name" required error={errors.name}>
          <TextInput
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={Boolean(errors.name)}
            disabled={submitting}
            maxLength={150}
            placeholder="e.g. Website redesign"
          />
        </Field>

        <Field id="project-description" label="Description" error={errors.description}>
          <TextArea
            id="project-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            invalid={Boolean(errors.description)}
            disabled={submitting}
            maxLength={2000}
            placeholder="What is this project about?"
          />
        </Field>

        <Field id="project-status" label="Status" error={errors.status}>
          <Select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            invalid={Boolean(errors.status)}
            disabled={submitting}
          >
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="project-start" label="Start date" error={errors.startDate}>
            <TextInput
              id="project-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              invalid={Boolean(errors.startDate)}
              disabled={submitting}
            />
          </Field>
          <Field id="project-end" label="End date" error={errors.endDate}>
            <TextInput
              id="project-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              invalid={Boolean(errors.endDate)}
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
