import { useCallback, useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import { getErrorMessage } from '../utils/errors';
import type { DashboardStats } from '../types';
import { ErrorState, PageHeader } from '../components/StateViews';
import { PageSpinner } from '../components/Spinner';
import { CheckCircleIcon, CheckSquareIcon, ClockIcon, FolderIcon, PlayIcon } from '../components/icons';

interface StatCardProps {
  label: string;
  value: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: string;
}

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await dashboardService.get());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = user?.fullName.split(/\s+/)[0] ?? '';
  const completion = stats && stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's where your work stands today." />

      {loading && <PageSpinner label="Loading dashboard…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderIcon} tone="bg-indigo-50 text-indigo-600" />
            <StatCard label="Total Tasks" value={stats.totalTasks} icon={CheckSquareIcon} tone="bg-sky-50 text-sky-600" />
            <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircleIcon} tone="bg-emerald-50 text-emerald-600" />
            <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={ClockIcon} tone="bg-amber-50 text-amber-600" />
            <StatCard label="Tasks In Progress" value={stats.inProgressTasks} icon={PlayIcon} tone="bg-violet-50 text-violet-600" />
            <StatCard label="Projects In Progress" value={stats.projectsInProgress} icon={PlayIcon} tone="bg-rose-50 text-rose-600" />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="progress-heading">
            <div className="flex items-center justify-between">
              <h2 id="progress-heading" className="text-sm font-semibold text-slate-900">
                Task completion
              </h2>
              <span className="text-sm font-medium text-slate-600">{completion}%</span>
            </div>
            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Percentage of tasks completed"
            >
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {stats.totalTasks === 0
                ? 'You have no tasks yet.'
                : `${stats.completedTasks} of ${stats.totalTasks} tasks completed.`}
            </p>
          </section>

          {stats.totalProjects === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm text-slate-600">Nothing here yet. Create your first project to get started.</p>
              <Link
                to="/projects"
                className="mt-3 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Go to projects
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
