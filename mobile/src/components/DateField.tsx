import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, MIN_TOUCH, radius, typography } from '../theme';
import { dateToInput, formatDateInput, inputToDate } from '../utils/format';

interface Props {
  label: string;
  /** "YYYY-MM-DD" or "" when not set */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** Native Android date picker dialog; the value is kept as "YYYY-MM-DD". */
export default function DateField({ label, value, onChange, error }: Props) {
  const open = () => {
    DateTimePickerAndroid.open({
      value: inputToDate(value) ?? new Date(),
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(dateToInput(date));
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={typography.label}>{label}</Text>
      <View style={[styles.field, !!error && { borderColor: colors.danger }]}>
        <Pressable
          onPress={open}
          style={styles.main}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatDateInput(value) : 'not set'}. Tap to change`}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.value, !value && { color: '#9AA3B8' }]}>{value ? formatDateInput(value) : 'Not set'}</Text>
        </Pressable>
        {!!value && (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={8}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  field: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: MIN_TOUCH },
  value: { fontSize: 16, color: colors.text },
  clear: { width: 44, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, fontSize: 13 },
});
