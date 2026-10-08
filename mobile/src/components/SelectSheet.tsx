import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, MIN_TOUCH, radius, typography } from '../theme';

export interface SheetOption {
  value: string;
  label: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: SheetOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/** Bottom sheet with a single-choice list. Used for filters, quick status/priority changes and project pickers. */
export default function SelectSheet({ visible, title, options, value, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} onPress={() => undefined}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value || '__all__'}
            style={{ maxHeight: 360 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]}
                >
                  <Text style={[styles.rowText, selected && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={22} color={colors.primary} />}
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={[typography.small, { padding: 16 }]}>No options available.</Text>}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 8 },
  title: { ...typography.h3, paddingHorizontal: 12, paddingVertical: 8 },
  row: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  rowText: { fontSize: 16, color: colors.text, flex: 1 },
});
