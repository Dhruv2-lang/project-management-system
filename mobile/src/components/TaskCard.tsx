import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import IconButton from './IconButton';
import { colors, radius, shadow, typography } from '../theme';
import { Task } from '../types';
import { PRIORITY_LABEL, PRIORITY_TONE, TASK_STATUS_LABEL, TASK_STATUS_TONE } from '../utils/constants';
import { formatDate, isOverdue } from '../utils/format';

interface Props {
  task: Task;
  busy?: boolean;
  onPress: () => void;
  onToggleComplete: () => void;
  onChangeStatus: () => void;
  onChangePriority: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, busy, onPress, onToggleComplete, onChangeStatus, onChangePriority, onDelete }: Props) {
  const done = task.status === 'COMPLETED';
  const overdue = isOverdue(task.dueDate, done);
  const due = formatDate(task.dueDate);

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={`Task ${task.name}. Tap to edit`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }, busy && { opacity: 0.55 }]}
    >
      <Pressable
        onPress={onToggleComplete}
        disabled={busy}
        hitSlop={4}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? 'Mark as pending' : 'Mark as complete'}
        style={styles.checkWrap}
      >
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={done ? colors.success : colors.textMuted}
        />
      </Pressable>

      <View style={styles.body}>
        <Text style={[typography.h3, done && styles.done]} numberOfLines={2}>
          {task.name}
        </Text>
        {!!task.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        <View style={styles.badges}>
          <Badge
            label={PRIORITY_LABEL[task.priority]}
            tone={PRIORITY_TONE[task.priority]}
            onPress={onChangePriority}
            disabled={busy}
            accessibilityLabel={`Priority ${PRIORITY_LABEL[task.priority]}. Tap to change`}
          />
          <Badge
            label={TASK_STATUS_LABEL[task.status]}
            tone={TASK_STATUS_TONE[task.status]}
            onPress={onChangeStatus}
            disabled={busy}
            accessibilityLabel={`Status ${TASK_STATUS_LABEL[task.status]}. Tap to change`}
          />
        </View>
        <View style={styles.meta}>
          {!!task.project && (
            <View style={[styles.metaItem, { flexShrink: 1 }]}>
              <Ionicons name="folder-outline" size={15} color={colors.textMuted} />
              <Text style={typography.small} numberOfLines={1}>
                {task.project.name}
              </Text>
            </View>
          )}
          {!!due && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={15} color={overdue ? colors.danger : colors.textMuted} />
              <Text style={[typography.small, overdue && { color: colors.danger, fontWeight: '600' }]}>
                {overdue ? `Overdue · ${due}` : due}
              </Text>
            </View>
          )}
        </View>
      </View>

      <IconButton icon="trash-outline" label={`Delete task ${task.name}`} color={colors.danger} onPress={onDelete} disabled={busy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingLeft: 6,
    paddingRight: 6,
    ...shadow,
  },
  checkWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 8, paddingTop: 10, paddingRight: 4 },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  desc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6, alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
