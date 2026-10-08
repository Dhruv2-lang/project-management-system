import { DefaultTheme, Theme } from '@react-navigation/native';

export const colors = {
  primary: '#3B5BDB',
  primaryDark: '#2F49B0',
  primarySoft: '#E7ECFD',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  text: '#1B2236',
  textMuted: '#667089',
  border: '#E1E6F0',
  success: '#2B9A66',
  successSoft: '#E3F5EC',
  warning: '#C98A0B',
  warningSoft: '#FDF3DC',
  danger: '#D8394F',
  dangerSoft: '#FCE8EB',
  neutral: '#5A6580',
  neutralSoft: '#EAEEF6',
  info: '#2F7FD1',
  infoSoft: '#E3F0FC',
  overlay: 'rgba(20, 27, 45, 0.45)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const MIN_TOUCH = 48;

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#1B2236',
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
