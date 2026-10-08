import type { ReactNode } from 'react';
import { CheckSquareIcon } from '../components/icons';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
            <CheckSquareIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Project Manager</span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Plan projects. Track tasks. Ship on time.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            One place to organise your projects, prioritise your tasks and see exactly where everything stands.
          </p>
        </div>
        <p className="text-sm text-slate-400">Project Management System</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <CheckSquareIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Project Manager</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}
