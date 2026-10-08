import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { CheckSquareIcon, CloseIcon, FolderIcon, HomeIcon, LogoutIcon, MenuIcon } from '../components/icons';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/projects', label: 'Projects', icon: FolderIcon },
  { to: '/tasks', label: 'Tasks', icon: CheckSquareIcon },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
        <CheckSquareIcon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-white">Project Manager</span>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await logout(); // route guards redirect to /login once the session is cleared
  }

  const initials = (user?.fullName ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="px-5 py-5">
        <Brand />
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          loading={signingOut}
          className="w-full justify-start !text-slate-300 hover:!bg-slate-800 hover:!text-white"
        >
          {!signingOut && <LogoutIcon className="h-4 w-4" />}
          Log out
        </Button>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-4 z-10 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <CloseIcon />
            </button>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
