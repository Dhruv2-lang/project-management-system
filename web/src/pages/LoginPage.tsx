import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/Button';
import { Field, TextInput } from '../components/FormControls';
import { FormError } from '../components/StateViews';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'email' | 'password', string>>;

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const found: Errors = {};
    if (!email.trim()) found.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address';
    if (!password) found.password = 'Password is required';
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // On success the auth context flips to "authenticated" and the route guard redirects.
      await login({ email: email.trim(), password });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const known: Errors = {};
      if (fieldErrors.email) known.email = fieldErrors.email;
      if (fieldErrors.password) known.password = fieldErrors.password;
      setErrors(known);
      if (Object.keys(known).length === 0) setFormError(getErrorMessage(err, 'Could not sign you in.'));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your projects and tasks."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormError message={formError} />}

        <Field id="login-email" label="Email" error={errors.email}>
          <TextInput
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={Boolean(errors.email)}
            disabled={submitting}
            placeholder="you@example.com"
          />
        </Field>

        <Field id="login-password" label="Password" error={errors.password}>
          <TextInput
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(errors.password)}
            disabled={submitting}
            placeholder="Your password"
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
