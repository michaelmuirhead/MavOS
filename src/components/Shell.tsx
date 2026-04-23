import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  BookOpen,
  Activity,
  Feather,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCaptureStore } from '@/store/capture';
import { CaptureBar } from './CaptureBar';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/finances', label: 'Finances', icon: DollarSign },
  { to: '/scripture', label: 'Scripture', icon: BookOpen },
  { to: '/health', label: 'Health', icon: Activity },
  { to: '/journal', label: 'Journal', icon: Feather },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const { open, toggle, show } = useCaptureStore();
  const location = useLocation();

  // Global hotkey: Cmd/Ctrl+K opens capture
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && open) toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, open]);

  const activeLabel = NAV.find((n) => n.to === location.pathname)?.label ?? 'MavOS';

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-ink-700 bg-ink-800/40 px-4 py-6">
        <div className="mb-10 px-2">
          <div className="font-display text-2xl tracking-tight">MavOS</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mt-1">
            personal ops
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-ink-700 text-ink-100'
                    : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-ink-700 flex items-center justify-between text-xs text-ink-400">
          <span className="truncate">{user?.email}</span>
          <button onClick={signOut} className="hover:text-ink-200" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-ink-800">
          <div className="flex items-center gap-3">
            <div className="md:hidden font-display text-xl">MavOS</div>
            <h1 className="hidden md:block font-display text-xl tracking-tight">{activeLabel}</h1>
          </div>
          <button
            onClick={show}
            className="btn bg-ink-700 hover:bg-ink-600 text-ink-100 border border-ink-600"
            title="Capture (⌘K)"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Capture</span>
            <kbd className="hidden md:inline text-[10px] font-mono text-ink-400 border border-ink-600 rounded px-1 py-0.5">
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ink-900/95 backdrop-blur border-t border-ink-700 grid grid-cols-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-colors ${
                  isActive ? 'text-accent' : 'text-ink-400'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {open && <CaptureBar />}
    </div>
  );
}
