import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

interface Props {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  fg: string;
  bg: string;
  width: number;
}

export default function StatCard({ label, value, icon, fg, bg, width }: Props) {
  return (
    <View style={[styles.card, { width }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.icon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={fg} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 4, ...shadow },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  value: { fontSize: 30, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
});
