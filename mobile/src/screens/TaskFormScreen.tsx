import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import DateField from '../components/DateField';
import OptionPills from '../components/OptionPills';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { Banner, EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { MainTabParamList, TasksStackParamList } from '../navigation/types';
import { ApiError, getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { colors } from '../theme';
import { TaskInput, TaskPriority, TaskStatus } from '../types';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../utils/constants';
import { isoToDateInput, toApiDate } from '../utils/format';
import { Errors, hasErrors, validateOptionalDate, validateOptionalText, validateRequiredText } from '../utils/validation';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskForm'>;
type Field = 'projectId' | 'name' | 'description' | 'dueDate';

export default function TaskFormScreen({ navigation, route }: Props) {
  const toast = useToast();
  const tabs = useNavigation<NavigationProp<MainTabParamList>>();
  const editing = route.params?.task;

  const [projectId, setProjectId] = useState(editing?.projectId ?? route.params?.projectId ?? '');
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(editing?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(editing?.status ?? 'PENDING');
  const [dueDate, setDueDate] = useState(isoToDateInput(editing?.dueDate));
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const projectsQuery = useApiQuery(() => projectService.list(), []);
  const projectOptions = useMemo(
    () => (projectsQuery.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    [projectsQuery.data],
  );

  if (projectsQuery.loading) return <LoadingView message="Loading projects…" />;
  if (projectsQuery.error && !projectsQuery.data) {
    return <ErrorView message={projectsQuery.error} onRetry={projectsQuery.retry} />;
  }
  if (projectOptions.length === 0) {
    return (
      <EmptyState
        icon="folder-open-outline"
        title="Create a project first"
        message="Every task belongs to a project. Create a project, then come back to add tasks."
        actionTitle="Create project"
        onAction={() => tabs.navigate('ProjectsTab', { screen: 'ProjectForm' })}
      />
    );
  }

  const submit = async () => {
    const next: Errors<Field> = {
      projectId: projectId ? undefined : 'Please choose a project',
      name: validateRequiredText('Task name', name, 150),
      description: validateOptionalText('Description', description, 2000),
      dueDate: validateOptionalDate('Due date', dueDate),
    };
    setErrors(next);
    setFormError(null);
    if (hasErrors(next)) return;

    setSubmitting(true);
    try {
      if (editing) {
        const payload: TaskInput = {
          projectId,
          name: name.trim(),
          description: description.trim() || null,
          priority,
          status,
          dueDate: toApiDate(dueDate),
        };
        await taskService.update(editing.id, payload);
      } else {
        const payload: TaskInput = { projectId, name: name.trim(), priority, status };
        if (description.trim()) payload.description = description.trim();
        if (dueDate) payload.dueDate = toApiDate(dueDate);
        await taskService.create(payload);
      }
      toast.show(editing ? 'Task updated' : 'Task created', 'success');
      navigation.goBack();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        setErrors((prev) => ({ ...prev, ...e.fieldErrors }));
      }
      setFormError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!formError && <Banner message={formError} />}
        <SelectField label="Project" placeholder="Choose a project" value={projectId} options={projectOptions} onChange={setProjectId} error={errors.projectId} />
        <TextField label="Task name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Write quarterly report" maxLength={150} />
        <TextField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          placeholder="Add some details"
          multiline
          maxLength={2000}
        />
        <OptionPills label="Priority" options={TASK_PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        <OptionPills label="Status" options={TASK_STATUS_OPTIONS} value={status} onChange={setStatus} />
        <DateField label="Due date (optional)" value={dueDate} onChange={setDueDate} error={errors.dueDate} />
        <View style={{ height: 8 }} />
        <Button title={editing ? 'Save changes' : 'Create task'} onPress={submit} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
});
