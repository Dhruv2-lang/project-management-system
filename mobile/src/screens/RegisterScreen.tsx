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
import { ApiError, getErrorMessage } from '../services/api';
import { colors, radius, typography } from '../theme';
import { hasErrors, validateEmail, validateFullName, validatePassword } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type FieldErrors = { fullName?: string; email?: string; password?: string };

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    setFormError(null);
    if (hasErrors(next)) return;

    setSubmitting(true);
    try {
      await signUp(fullName, email, password);
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        setErrors({ fullName: e.fieldErrors.fullName, email: e.fieldErrors.email, password: e.fieldErrors.password });
      }
      // 409 (email already registered) and everything else: show the friendly server message.
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
              <Ionicons name="person-add" size={32} color="#fff" />
            </View>
            <Text style={typography.h1}>Create account</Text>
            <Text style={[typography.small, { fontSize: 15 }]}>Start organising your work in minutes</Text>
          </View>

          {!!formError && <Banner message={formError} />}

          <TextField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            placeholder="Alice Smith"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
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
            placeholder="At least 8 characters"
            password
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Text style={[typography.small, { marginTop: -6, marginBottom: 14 }]}>
            Use 8–72 characters with at least one letter and one number.
          </Text>

          <Button title="Create account" onPress={submit} loading={submitting} />
          <Button
            title="I already have an account"
            variant="ghost"
            disabled={submitting}
            onPress={() => navigation.navigate('Login')}
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
  brand: { alignItems: 'center', gap: 6, marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});
