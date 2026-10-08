import React, { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FilterBar from '../components/FilterBar';
import Fab from '../components/Fab';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import SelectSheet from '../components/SelectSheet';
import TaskCard from '../components/TaskCard';
import { Banner, EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { TasksStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { colors, spacing } from '../theme';
import { Task, TaskInput, TaskPriority, TaskStatus } from '../types';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../utils/constants';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;
type SheetState = { task: Task; kind: 'status' | 'priority' } | null;

export default function TasksScreen({ navigation }: Props) {
  const toast = useToast();
  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText);
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [projectId, setProjectId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);

  const query = useApiQuery(
    () =>
      taskService.list({
        search,
        status: status || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
      }),
    [search, status, priority, projectId],
  );
  // Projects feed the "filter by project" chip (also from the API).
  const projectsQuery = useApiQuery(() => projectService.list(), []);

  const projectOptions = useMemo(
    () => (projectsQuery.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    [projectsQuery.data],
  );

  const tasks = query.data ?? [];
  const filtersActive = !!search.trim() || !!status || !!priority || !!projectId;

  const clearFilters = () => {
    setSearchText('');
    setStatus('');
    setPriority('');
    setProjectId('');
  };

  const updateTask = async (task: Task, input: TaskInput, successMessage: string) => {
    setBusyId(task.id);
    try {
      await taskService.update(task.id, input);
      toast.show(successMessage, 'success');
      await query.reload();
    } catch (e) {
      toast.show(getErrorMessage(e), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleComplete = (task: Task) => {
    const done = task.status === 'COMPLETED';
    return updateTask(task, { status: done ? 'PENDING' : 'COMPLETED' }, done ? 'Task marked as pending' : 'Task completed');
  };

  const confirmDelete = (task: Task) =>
    Alert.alert('Delete task?', `“${task.name}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusyId(task.id);
          try {
            await taskService.remove(task.id);
            toast.show('Task deleted', 'success');
            await query.reload();
          } catch (e) {
            toast.show(getErrorMessage(e), 'error');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);

  const empty = query.error ? (
    <ErrorView message={query.error} onRetry={query.retry} />
  ) : filtersActive ? (
    <EmptyState icon="search" title="No matching tasks" message="Try a different search or clear the filters." actionTitle="Clear filters" onAction={clearFilters} />
  ) : (
    <EmptyState
      icon="checkbox-outline"
      title="No tasks yet"
      message="Add a task to one of your projects to get started."
      actionTitle="Create task"
      onAction={() => navigation.navigate('TaskForm')}
    />
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Tasks" subtitle={query.data ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}` : undefined}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search tasks by name" />
        <FilterBar
          filters={[
            { key: 'status', label: 'Status', allLabel: 'All statuses', value: status, options: TASK_STATUS_OPTIONS, onChange: (v) => setStatus(v as TaskStatus | '') },
            { key: 'priority', label: 'Priority', allLabel: 'All priorities', value: priority, options: TASK_PRIORITY_OPTIONS, onChange: (v) => setPriority(v as TaskPriority | '') },
            { key: 'project', label: 'Project', allLabel: 'All projects', value: projectId, options: projectOptions, onChange: setProjectId },
          ]}
        />
      </ScreenHeader>

      {query.loading ? (
        <LoadingView message="Loading tasks…" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={[styles.list, tasks.length === 0 && { flexGrow: 1 }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={query.error && tasks.length > 0 ? <Banner message={query.error} /> : null}
          ListEmptyComponent={empty}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={query.refreshing}
              onRefresh={() => {
                void query.refresh();
                void projectsQuery.refresh();
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              busy={busyId === item.id}
              onPress={() => navigation.navigate('TaskForm', { task: item })}
              onToggleComplete={() => void toggleComplete(item)}
              onChangeStatus={() => setSheet({ task: item, kind: 'status' })}
              onChangePriority={() => setSheet({ task: item, kind: 'priority' })}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <Fab label="Create task" onPress={() => navigation.navigate('TaskForm', projectId ? { projectId } : undefined)} />

      {sheet && (
        <SelectSheet
          visible
          title={sheet.kind === 'status' ? 'Change status' : 'Change priority'}
          options={sheet.kind === 'status' ? TASK_STATUS_OPTIONS : TASK_PRIORITY_OPTIONS}
          value={sheet.kind === 'status' ? sheet.task.status : sheet.task.priority}
          onClose={() => setSheet(null)}
          onSelect={(value) => {
            const { task, kind } = sheet;
            const current = kind === 'status' ? task.status : task.priority;
            if (value === current) return;
            void updateTask(
              task,
              kind === 'status' ? { status: value as TaskStatus } : { priority: value as TaskPriority },
              kind === 'status' ? 'Status updated' : 'Priority updated',
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: 100 },
});
