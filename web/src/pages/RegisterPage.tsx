import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/Button';
import { Field, TextInput } from '../components/FormControls';
import { FormError } from '../components/StateViews';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'fullName' | 'email' | 'password', string>>;

// Mirrors the backend rules: 8-72 characters with at least one letter and one number.
function passwordProblem(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return undefined;
}

export function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const found: Errors = {};
    if (!fullName.trim()) found.fullName = 'Full name is required';
    else if (fullName.trim().length > 100) found.fullName = 'Full name must be at most 100 characters';
    if (!email.trim()) found.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address';
    const passwordError = passwordProblem(password);
    if (passwordError) found.password = passwordError;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // The API signs the new user in; the route guard then redirects to the dashboard.
      await register({ fullName: fullName.trim(), email: email.trim(), password });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const known: Errors = {};
      for (const key of ['fullName', 'email', 'password'] as const) {
        if (fieldErrors[key]) known[key] = fieldErrors[key];
      }
      setErrors(known);
      if (Object.keys(known).length === 0) setFormError(getErrorMessage(err, 'Could not create your account.'));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organising your projects in a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormError message={formError} />}

        <Field id="register-name" label="Full name" error={errors.fullName}>
          <TextInput
            id="register-name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            invalid={Boolean(errors.fullName)}
            disabled={submitting}
            maxLength={100}
            placeholder="Alice Smith"
          />
        </Field>

        <Field id="register-email" label="Email" error={errors.email}>
          <TextInput
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={Boolean(errors.email)}
            disabled={submitting}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          id="register-password"
          label="Password"
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
        >
          <TextInput
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(errors.password)}
            disabled={submitting}
            maxLength={72}
            placeholder="Create a password"
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
