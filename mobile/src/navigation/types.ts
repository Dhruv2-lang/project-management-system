import { NavigatorScreenParams } from '@react-navigation/native';
import { Project, Task } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProjectsStackParamList = {
  ProjectList: undefined;
  ProjectForm: { project?: Project } | undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskForm: { task?: Task; projectId?: string } | undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  ProjectsTab: NavigatorScreenParams<ProjectsStackParamList> | undefined;
  TasksTab: NavigatorScreenParams<TasksStackParamList> | undefined;
};
