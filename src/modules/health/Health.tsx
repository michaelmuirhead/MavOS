import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Activity, Flame, UtensilsCrossed, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageIntro, EmptyState } from '@/components/ui';
import type { Habit } from '@/types/database';

const KIND_META: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  workout: { icon: Activity, color: 'text-success', label: 'Workout' },
  smoke: { icon: Flame, color: 'text-accent', label: 'Smoke' },
  meal: { icon: UtensilsCrossed, color: 'text-ink-200', label: 'Meal' },
  custom: { icon: Circle, color: 'text-ink-400', label: 'Log' },
};

export function Health() {
  const [entries, setEntries] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(100);
    if (error) console.error('[health] load failed', error);
    setEntries((data as Habit[]) ?? []);
    setLoading(false);
  }

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.kind === filter);
  const kinds = ['all', 'workout', 'smoke', 'meal', 'custom'] as const;

  return (
    <div>
      <PageIntro title="Health" subtitle="Workouts, smoke sessions, meals" />

      <div className="flex flex-wrap gap-2 mb-4">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`btn ${filter === k ? 'bg-ink-700 text-ink-100' : 'btn-ghost'}`}
          >
            {k === 'all' ? 'All' : KIND_META[k]?.label ?? k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message="Nothing logged yet."
          hint="⌘K → h: grilled ribeye medium rare"
        />
      ) : (
        <ul className="card divide-y divide-ink-700">
          {filtered.map((e) => {
            const meta = KIND_META[e.kind] ?? KIND_META.custom;
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                <div className={`mt-0.5 ${meta.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-100">{e.name}</div>
                  {e.notes && e.notes !== e.name && (
                    <div className="text-xs text-ink-400 mt-1 line-clamp-2">{e.notes}</div>
                  )}
                  <div className="text-[10px] uppercase tracking-wider text-ink-500 mt-1">
                    {meta.label} · {format(new Date(e.logged_at), 'MMM d, p')}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
