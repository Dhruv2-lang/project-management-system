import React from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import IconButton from '../components/IconButton';
import StatCard from '../components/StatCard';
import { Banner, ErrorView, LoadingView } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { dashboardService } from '../services/dashboardService';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const query = useApiQuery(() => dashboardService.get(), []);

  const cardWidth = Math.floor((width - spacing.lg * 2 - spacing.md) / 2);
  const stats = query.data;
  const firstName = user?.fullName?.split(' ')[0] ?? '';

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);

  const header = (
    <ScreenHeader
      title={firstName ? `Hi, ${firstName}` : 'Dashboard'}
      subtitle="Here’s an overview of your work"
      right={<IconButton icon="log-out-outline" label="Log out" color={colors.text} onPress={confirmLogout} />}
    />
  );

  if (query.loading) {
    return (
      <View style={styles.screen}>
        {header}
        <LoadingView message="Loading dashboard…" />
      </View>
    );
  }

  const completion = stats && stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.refreshing} onRefresh={query.refresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {!!query.error && !stats && <ErrorView message={query.error} onRetry={query.retry} />}
        {!!query.error && !!stats && <Banner message={query.error} />}

        {stats && (
          <>
            <View style={styles.progressCard}>
              <View style={styles.progressTop}>
                <Text style={typography.h3}>Task completion</Text>
                <Text style={styles.percent}>{completion}%</Text>
              </View>
              <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: completion }}>
                <View style={[styles.fill, { width: `${completion}%` }]} />
              </View>
              <Text style={typography.small}>
                {stats.completedTasks} of {stats.totalTasks} tasks completed
              </Text>
            </View>

            <View style={styles.grid}>
              <StatCard width={cardWidth} label="Total Projects" value={stats.totalProjects} icon="folder-open" fg={colors.primary} bg={colors.primarySoft} />
              <StatCard width={cardWidth} label="Total Tasks" value={stats.totalTasks} icon="list" fg={colors.info} bg={colors.infoSoft} />
              <StatCard width={cardWidth} label="Completed Tasks" value={stats.completedTasks} icon="checkmark-done" fg={colors.success} bg={colors.successSoft} />
              <StatCard width={cardWidth} label="Pending Tasks" value={stats.pendingTasks} icon="time" fg={colors.warning} bg={colors.warningSoft} />
              <StatCard width={cardWidth} label="Projects In Progress" value={stats.projectsInProgress} icon="rocket" fg={colors.primary} bg={colors.primarySoft} />
              <StatCard width={cardWidth} label="Tasks In Progress" value={stats.inProgressTasks} icon="play-circle" fg={colors.info} bg={colors.infoSoft} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  progressCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, ...shadow },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percent: { fontSize: 22, fontWeight: '800', color: colors.primary },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.neutralSoft, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.success },
});
