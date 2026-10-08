import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, radius, spacing, typography } from '../theme';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.small, { marginTop: spacing.md }]}>{message}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
      </View>
      <Text style={styles.title}>Couldn’t load data</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button title="Try again" icon="refresh" onPress={onRetry} style={{ marginTop: spacing.lg, minWidth: 160 }} />}
    </View>
  );
}

interface EmptyProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionTitle, onAction }: EmptyProps) {
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} style={{ marginTop: spacing.lg, minWidth: 180 }} />
      )}
    </View>
  );
}

/** Inline banner for non-blocking errors (e.g. a failed background refresh) and notices. */
export function Banner({ message, tone = 'danger' }: { message: string; tone?: 'danger' | 'warning' | 'info' }) {
  const map = {
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' as const },
    warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'warning' as const },
    info: { bg: colors.infoSoft, fg: colors.info, icon: 'information-circle' as const },
  }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: map.bg }]} accessibilityLiveRegion="polite">
      <Ionicons name={map.icon} size={18} color={map.fg} />
      <Text style={[styles.bannerText, { color: map.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { ...typography.h3, textAlign: 'center' },
  message: { ...typography.small, fontSize: 14, textAlign: 'center', marginTop: 6, maxWidth: 320, lineHeight: 20 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, marginBottom: spacing.md },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '500' },
});
