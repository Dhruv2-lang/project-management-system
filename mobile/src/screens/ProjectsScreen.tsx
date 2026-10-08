import React, { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FilterBar from '../components/FilterBar';
import Fab from '../components/Fab';
import ProjectCard from '../components/ProjectCard';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { Banner, EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProjectsStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { colors, spacing } from '../theme';
import { Project, ProjectStatus } from '../types';
import { PROJECT_STATUS_OPTIONS } from '../utils/constants';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectList'>;

export default function ProjectsScreen({ navigation }: Props) {
  const toast = useToast();
  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText);
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const query = useApiQuery(
    () => projectService.list({ search, status: status || undefined }),
    [search, status],
  );

  const filtersActive = !!search.trim() || !!status;
  const projects = query.data ?? [];

  const clearFilters = () => {
    setSearchText('');
    setStatus('');
  };

  const confirmDelete = (project: Project) => {
    const n = project.taskCount ?? 0;
    const extra = n > 0 ? ` This will also permanently delete its ${n} ${n === 1 ? 'task' : 'tasks'}.` : '';
    Alert.alert('Delete project?', `“${project.name}” will be permanently deleted.${extra}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(project.id);
          try {
            await projectService.remove(project.id);
            toast.show('Project deleted', 'success');
            await query.reload();
          } catch (e) {
            toast.show(getErrorMessage(e), 'error');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const empty = query.error ? (
    <ErrorView message={query.error} onRetry={query.retry} />
  ) : filtersActive ? (
    <EmptyState icon="search" title="No matching projects" message="Try a different search or clear the filters." actionTitle="Clear filters" onAction={clearFilters} />
  ) : (
    <EmptyState
      icon="folder-open-outline"
      title="No projects yet"
      message="Create your first project to start organising tasks."
      actionTitle="Create project"
      onAction={() => navigation.navigate('ProjectForm')}
    />
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Projects" subtitle={query.data ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` : undefined}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search projects by name" />
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              allLabel: 'All statuses',
              value: status,
              options: PROJECT_STATUS_OPTIONS,
              onChange: (v) => setStatus(v as ProjectStatus | ''),
            },
          ]}
        />
      </ScreenHeader>

      {query.loading ? (
        <LoadingView message="Loading projects…" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.list, projects.length === 0 && { flexGrow: 1 }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={query.error && projects.length > 0 ? <Banner message={query.error} /> : null}
          ListEmptyComponent={empty}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={query.refreshing} onRefresh={query.refresh} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              deleting={deletingId === item.id}
              onPress={() => navigation.navigate('ProjectForm', { project: item })}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <Fab label="Create project" onPress={() => navigation.navigate('ProjectForm')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: 100 },
});
