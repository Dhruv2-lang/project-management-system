import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import IconButton from './IconButton';
import { colors, radius, shadow, typography } from '../theme';
import { Project } from '../types';
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from '../utils/constants';
import { formatDate } from '../utils/format';

interface Props {
  project: Project;
  deleting?: boolean;
  onPress: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, deleting, onPress, onDelete }: Props) {
  const start = formatDate(project.startDate);
  const end = formatDate(project.endDate);
  const dates = start && end ? `${start} → ${end}` : start ? `Starts ${start}` : end ? `Ends ${end}` : '';
  const count = project.taskCount ?? 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={deleting}
      accessibilityRole="button"
      accessibilityLabel={`Project ${project.name}. Tap to edit`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }, deleting && { opacity: 0.5 }]}
    >
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={typography.h3} numberOfLines={2}>
            {project.name}
          </Text>
          <Badge label={PROJECT_STATUS_LABEL[project.status]} tone={PROJECT_STATUS_TONE[project.status]} />
        </View>
        <IconButton icon="trash-outline" label={`Delete project ${project.name}`} color={colors.danger} onPress={onDelete} disabled={deleting} />
      </View>

      {!!project.description && (
        <Text style={styles.desc} numberOfLines={2}>
          {project.description}
        </Text>
      )}

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="checkbox-outline" size={16} color={colors.textMuted} />
          <Text style={typography.small}>
            {count} {count === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
        {!!dates && (
          <View style={[styles.metaItem, { flexShrink: 1 }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={typography.small} numberOfLines={1}>
              {dates}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, ...shadow },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  desc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
