import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { PageIntro, EmptyState } from '@/components/ui';
import type { ScriptureLog } from '@/types/database';

export function Scripture() {
  const [entries, setEntries] = useState<ScriptureLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('scripture_log')
      .select('*')
      .order('read_at', { ascending: false })
      .limit(100);
    if (error) console.error('[scripture] load failed', error);
    setEntries((data as ScriptureLog[]) ?? []);
    setLoading(false);
  }

  return (
    <div>
      <PageIntro title="Scripture" subtitle="KJV study log" />

      {loading ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : entries.length === 0 ? (
        <EmptyState
          message="No scripture logged yet."
          hint="Capture with ⌘K → s: Rom 8:28 — God works all things"
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <article key={e.id} className="card p-5">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display text-xl text-ink-100">{e.reference}</h3>
                <div className="text-xs text-ink-500 font-mono">
                  {format(new Date(e.read_at), 'MMM d, yyyy')}
                </div>
              </div>
              {e.notes && (
                <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-wrap">{e.notes}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-[11px] text-ink-500">
                <span className="uppercase tracking-wider">{e.translation}</span>
                {e.tags.length > 0 && (
                  <div className="flex gap-1">
                    {e.tags.map((tag) => (
                      <span key={tag} className="bg-ink-700 text-ink-300 rounded px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
