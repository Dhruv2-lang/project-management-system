import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectSheet, { SheetOption } from './SelectSheet';
import { colors, radius } from '../theme';

export interface FilterDef {
  key: string;
  label: string; // e.g. "Status"
  allLabel?: string; // e.g. "All statuses"
  value: string; // '' = no filter
  options: SheetOption[]; // WITHOUT the "All" entry
  onChange: (value: string) => void;
}

/** Horizontal row of dropdown-style filter chips; each opens a bottom sheet. */
export default function FilterBar({ filters }: { filters: FilterDef[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = filters.find((f) => f.key === openKey);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
        {filters.map((f) => {
          const selected = f.options.find((o) => o.value === f.value);
          const isActive = !!f.value;
          return (
            <Pressable
              key={f.key}
              onPress={() => setOpenKey(f.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}: ${selected?.label ?? 'All'}`}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.text, isActive && { color: colors.primary }]} numberOfLines={1}>
                {f.label}: {selected?.label ?? 'All'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={isActive ? colors.primary : colors.textMuted} />
            </Pressable>
          );
        })}
      </ScrollView>
      {active && (
        <SelectSheet
          visible
          title={`Filter by ${active.label.toLowerCase()}`}
          options={[{ value: '', label: active.allLabel ?? `All` }, ...active.options]}
          value={active.value}
          onSelect={active.onChange}
          onClose={() => setOpenKey(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2, paddingRight: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    maxWidth: 240,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1 },
});
