import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { Banner } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { colors, radius, typography } from '../theme';
import { hasErrors, validateEmail } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn, sessionMessage, clearSessionMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next = {
      email: validateEmail(email),
      password: password ? undefined : 'Password is required',
    };
    setErrors(next);
    setFormError(null);
    if (hasErrors(next)) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setFormError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="checkmark-done" size={36} color="#fff" />
            </View>
            <Text style={typography.h1}>Welcome back</Text>
            <Text style={[typography.small, { fontSize: 15 }]}>Log in to manage your projects and tasks</Text>
          </View>

          {!!sessionMessage && <Banner tone="warning" message={sessionMessage} />}
          {!!formError && <Banner message={formError} />}

          <TextField
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (sessionMessage) clearSessionMessage();
            }}
            error={errors.email}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Your password"
            password
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Button title="Log in" onPress={submit} loading={submitting} style={{ marginTop: 6 }} />
          <Button
            title="Create an account"
            variant="ghost"
            disabled={submitting}
            onPress={() => {
              clearSessionMessage();
              navigation.navigate('Register');
            }}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  brand: { alignItems: 'center', gap: 6, marginBottom: 28 },
  logo: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});
