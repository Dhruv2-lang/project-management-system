import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, MIN_TOUCH, radius, typography } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  password?: boolean;
}

export default function TextField({ label, error, password, style, multiline, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!password);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={typography.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: colors.primary },
          !!error && { borderColor: colors.danger },
          multiline && { alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          placeholderTextColor="#9AA3B8"
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={label}
          style={[styles.input, multiline && styles.multiline, style]}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            style={styles.eye}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: MIN_TOUCH,
  },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: colors.text },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  eye: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, fontSize: 13 },
});
