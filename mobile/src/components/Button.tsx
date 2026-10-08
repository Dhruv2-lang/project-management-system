import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, MIN_TOUCH, radius } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.primarySoft,
  danger: colors.danger,
  ghost: 'transparent',
};
const FG: Record<Variant, string> = {
  primary: '#fff',
  secondary: colors.primary,
  danger: '#fff',
  ghost: colors.primary,
};

/** Disabled (and non-interactive) while `loading`, so double-submits are impossible. */
export default function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: Props) {
  const inactive = !!loading || !!disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BG[variant], opacity: inactive ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={FG[variant]} />}
          <Text style={[styles.text, { color: FG[variant] }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 16, fontWeight: '600' },
});
