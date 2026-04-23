import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CheckSquare, DollarSign, BookOpen, Activity, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTasksStore } from '@/store/tasks';
import { PageIntro } from '@/components/ui';
import type { Task, ScriptureLog, Habit, FinanceEntry } from '@/types/database';

type Summary = {
  openTasks: Task[];
  recentScripture: ScriptureLog | null;
  recentHabit: Habit | null;
  monthSpend: number;
  monthTithe: number;
};

export function Dashboard() {
  const { tasks, load: loadTasks } = useTasksStore();
  const [summary, setSummary] = useState<Summary>({
    openTasks: [],
    recentScripture: null,
    recentHabit: null,
    monthSpend: 0,
    monthTithe: 0,
  });

  useEffect(() => {
    loadTasks();
    loadSummary();
  }, [loadTasks]);

  async function loadSummary() {
    const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

    const [scripRes, habitRes, finRes] = await Promise.all([
      supabase.from('scripture_log').select('*').order('read_at', { ascending: false }).limit(1),
      supabase.from('habits').select('*').order('logged_at', { ascending: false }).limit(1),
      supabase.from('finance_entries').select('*').gte('occurred_on', monthStart),
    ]);

    const fins = (finRes.data as FinanceEntry[]) ?? [];
    const monthSpend = fins.filter((f) => f.kind === 'expense').reduce((s, f) => s + f.amount_cents, 0);
    const monthTithe = fins
      .filter((f) => f.kind === 'tithe' || f.kind === 'giving')
      .reduce((s, f) => s + f.amount_cents, 0);

    setSummary({
      openTasks: [],
      recentScripture: (scripRes.data as ScriptureLog[])?.[0] ?? null,
      recentHabit: (habitRes.data as Habit[])?.[0] ?? null,
      monthSpend,
      monthTithe,
    });
  }

  const openTasks = tasks.filter((t) => t.status === 'open').slice(0, 5);
  const greet = greeting();
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <div>
      <PageIntro title={`${greet}, Michael`} subtitle={today} />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Open tasks — prominent */}
        <Tile to="/tasks" icon={CheckSquare} label="Today" className="md:col-span-4">
          {openTasks.length === 0 ? (
            <div className="text-sm text-ink-400 py-2">No open tasks. Nicely done.</div>
          ) : (
            <ul className="space-y-1.5 mt-2">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm text-ink-200">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-xs text-ink-500">
            {openTasks.length} open · {tasks.filter((t) => t.status === 'done').length} done
          </div>
        </Tile>

        {/* Finances */}
        <Tile to="/finances" icon={DollarSign} label="This month" className="md:col-span-2">
          <div className="mt-2 space-y-2">
            <StatRow label="Spent" value={formatMoney(summary.monthSpend)} />
            <StatRow label="Tithe/giving" value={formatMoney(summary.monthTithe)} accent />
          </div>
        </Tile>

        {/* Scripture */}
        <Tile to="/scripture" icon={BookOpen} label="Scripture" className="md:col-span-3">
          {summary.recentScripture ? (
            <div className="mt-2">
              <div className="font-display text-lg">{summary.recentScripture.reference}</div>
              {summary.recentScripture.notes && (
                <div className="text-sm text-ink-400 mt-1 line-clamp-2">
                  {summary.recentScripture.notes}
                </div>
              )}
              <div className="text-xs text-ink-500 mt-2">
                {format(new Date(summary.recentScripture.read_at), 'MMM d')}
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-400 py-2">No reading logged yet.</div>
          )}
        </Tile>

        {/* Health */}
        <Tile to="/health" icon={Activity} label="Last logged" className="md:col-span-3">
          {summary.recentHabit ? (
            <div className="mt-2">
              <div className="text-sm text-ink-200">{summary.recentHabit.name}</div>
              <div className="text-xs text-ink-500 mt-1 capitalize">
                {summary.recentHabit.kind} · {format(new Date(summary.recentHabit.logged_at), 'MMM d, p')}
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-400 py-2">Nothing logged recently.</div>
          )}
        </Tile>

        {/* Journal */}
        <Tile to="/journal" icon={Feather} label="Journal" className="md:col-span-6">
          <div className="text-sm text-ink-400 py-2">
            Press <kbd className="font-mono text-ink-200 border border-ink-600 rounded px-1">⌘K</kbd> then{' '}
            <kbd className="font-mono text-accent">j:</kbd> to drop a thought in today's entry.
          </div>
        </Tile>
      </div>
    </div>
  );
}

function Tile({
  to,
  icon: Icon,
  label,
  className = '',
  children,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className={`card card-hover p-5 block ${className}`}>
      <div className="flex items-center gap-2 text-ink-400">
        <Icon size={14} />
        <span className="label">{label}</span>
      </div>
      {children}
    </Link>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-ink-400">{label}</span>
      <span className={`font-display text-lg ${accent ? 'text-accent' : 'text-ink-100'}`}>{value}</span>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
