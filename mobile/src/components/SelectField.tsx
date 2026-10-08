import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectSheet, { SheetOption } from './SelectSheet';
import { colors, MIN_TOUCH, radius, typography } from '../theme';

interface Props {
  label: string;
  placeholder: string;
  value: string;
  options: SheetOption[];
  onChange: (v: string) => void;
  error?: string;
}

/** Form field that opens a bottom-sheet picker (used for choosing a project). */
export default function SelectField({ label, placeholder, value, options, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View style={styles.wrap}>
      <Text style={typography.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        style={[styles.field, !!error && { borderColor: colors.danger }]}
      >
        <Text style={[styles.value, !selected && { color: '#9AA3B8' }]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <SelectSheet visible={open} title={label} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  field: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  value: { flex: 1, fontSize: 16, color: colors.text },
  error: { color: colors.danger, fontSize: 13 },
});
