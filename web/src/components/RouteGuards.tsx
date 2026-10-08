import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { PageSpinner } from './Spinner';
import { AlertIcon } from './icons';

/** Only allow in-app paths so a crafted `from` can never redirect off-site. */
function safePath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

/** Wraps every page that needs a signed-in user; everyone else is sent to /login. */
export function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <PageSpinner label="Checking your session…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertIcon className="h-10 w-10 text-rose-500" />
        <h1 className="text-lg font-semibold text-slate-900">Can&apos;t reach the server</h1>
        <p className="max-w-sm text-sm text-slate-500">
          We couldn&apos;t verify your session. Check that the backend is running and your connection is working.
        </p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}

/** Login/register: signed-in users are bounced to where they were headed (or the dashboard). */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <PageSpinner label="Checking your session…" />
      </div>
    );
  }

  if (status === 'authenticated') {
    const from = (location.state as { from?: unknown } | null)?.from;
    return <Navigate to={safePath(from)} replace />;
  }

  return <Outlet />;
}
