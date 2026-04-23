import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { PageIntro, SectionHeader, EmptyState } from '@/components/ui';
import type { FinanceEntry } from '@/types/database';

export function Finances() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function load() {
    setLoading(true);
    const from = format(startOfMonth(month), 'yyyy-MM-dd');
    const to = format(endOfMonth(month), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('finance_entries')
      .select('*')
      .gte('occurred_on', from)
      .lte('occurred_on', to)
      .order('occurred_on', { ascending: false });
    if (error) console.error('[finances] load failed', error);
    setEntries((data as FinanceEntry[]) ?? []);
    setLoading(false);
  }

  const totals = entries.reduce(
    (acc, e) => {
      if (e.kind === 'income') acc.income += e.amount_cents;
      else if (e.kind === 'expense') acc.spent += e.amount_cents;
      else if (e.kind === 'tithe') acc.tithe += e.amount_cents;
      else if (e.kind === 'giving') acc.giving += e.amount_cents;
      return acc;
    },
    { income: 0, spent: 0, tithe: 0, giving: 0 }
  );

  return (
    <div>
      <PageIntro title="Finances" subtitle={format(month, 'MMMM yyyy')} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Income" value={totals.income} />
        <StatCard label="Spent" value={totals.spent} />
        <StatCard label="Tithe" value={totals.tithe} accent />
        <StatCard label="Other giving" value={totals.giving} accent />
      </div>

      <SectionHeader label="Entries" />
      {loading ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : entries.length === 0 ? (
        <EmptyState
          message="No entries this month."
          hint="Capture with ⌘K → $: 42.18 groceries"
        />
      ) : (
        <ul className="card divide-y divide-ink-700">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-16 text-xs text-ink-500 font-mono">
                {format(new Date(e.occurred_on), 'MMM d')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink-100 truncate">{e.memo ?? '(no memo)'}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500 mt-0.5">{e.kind}</div>
              </div>
              <div
                className={`font-display text-base tabular-nums ${
                  e.kind === 'income' ? 'text-success' : e.kind === 'tithe' || e.kind === 'giving' ? 'text-accent' : 'text-ink-100'
                }`}
              >
                {e.kind === 'income' ? '+' : ''}${(e.amount_cents / 100).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card p-4">
      <div className="label text-ink-400">{label}</div>
      <div className={`font-display text-2xl mt-1 ${accent ? 'text-accent' : 'text-ink-100'}`}>
        ${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
