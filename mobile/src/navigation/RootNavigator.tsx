import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LoadingView } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import ConnectionErrorScreen from '../screens/ConnectionErrorScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import ProjectFormScreen from '../screens/ProjectFormScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import TasksScreen from '../screens/TasksScreen';
import { colors } from '../theme';
import {
  AuthStackParamList,
  MainTabParamList,
  ProjectsStackParamList,
  TasksStackParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const formHeader = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ProjectsNavigator() {
  return (
    <ProjectsStack.Navigator screenOptions={formHeader}>
      <ProjectsStack.Screen name="ProjectList" component={ProjectsScreen} options={{ headerShown: false }} />
      <ProjectsStack.Screen
        name="ProjectForm"
        component={ProjectFormScreen}
        options={({ route }) => ({ title: route.params?.project ? 'Edit project' : 'New project' })}
      />
    </ProjectsStack.Navigator>
  );
}

function TasksNavigator() {
  return (
    <TasksStack.Navigator screenOptions={formHeader}>
      <TasksStack.Screen name="TaskList" component={TasksScreen} options={{ headerShown: false }} />
      <TasksStack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({ title: route.params?.task ? 'Edit task' : 'New task' })}
      />
    </TasksStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof MainTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  DashboardTab: ['grid', 'grid-outline'],
  ProjectsTab: ['folder-open', 'folder-open-outline'],
  TasksTab: ['checkmark-done-circle', 'checkmark-done-circle-outline'],
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="ProjectsTab" component={ProjectsNavigator} options={{ title: 'Projects' }} />
      <Tabs.Screen name="TasksTab" component={TasksNavigator} options={{ title: 'Tasks' }} />
    </Tabs.Navigator>
  );
}

/**
 * Protected navigation: the authenticated tree only exists while a validated
 * session exists. Logout / 401 swaps it for the auth tree, which also resets all state.
 */
export default function RootNavigator() {
  const { status, retryBootstrap } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingView message="Checking your session…" />
      </View>
    );
  }
  if (status === 'offline') {
    return <ConnectionErrorScreen onRetry={() => void retryBootstrap()} />;
  }
  return status === 'authenticated' ? <MainTabs /> : <AuthNavigator />;
}
