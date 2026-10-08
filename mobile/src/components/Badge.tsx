import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme';
import { Tone } from '../utils/constants';

interface Props {
  label: string;
  tone: Tone;
  /** When provided the badge becomes a button (with a chevron) - used for quick status/priority changes. */
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function Badge({ label, tone, onPress, disabled, accessibilityLabel }: Props) {
  const content = (
    <>
      <Text style={[styles.text, { color: tone.fg }]}>{label}</Text>
      {onPress && <Ionicons name="chevron-down" size={12} color={tone.fg} />}
    </>
  );
  if (!onPress) return <Pressable disabled style={[styles.badge, { backgroundColor: tone.bg }]}>{content}</Pressable>;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.badge, { backgroundColor: tone.bg, opacity: disabled ? 0.5 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});
