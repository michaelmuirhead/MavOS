import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageIntro, EmptyState } from '@/components/ui';
import type { JournalEntry } from '@/types/database';

type Kind = JournalEntry['kind'];

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Kind | 'all'>('all');
  const [todayDraft, setTodayDraft] = useState('');
  const [todayId, setTodayId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) console.error('[journal] load failed', error);
    const rows = (data as JournalEntry[]) ?? [];
    setEntries(rows);

    // Merge all of today's daily entries into the editor
    const todayRows = rows.filter((r) => r.entry_date === today && r.kind === 'daily');
    if (todayRows.length > 0) {
      setTodayDraft(todayRows.map((r) => r.body).join('\n\n---\n\n'));
      setTodayId(todayRows[0].id);
    }
    setLoading(false);
  }

  async function saveToday() {
    if (!todayDraft.trim()) return;
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setSaving(false);
      return;
    }

    if (todayId) {
      await supabase
        .from('journal_entries')
        .update({ body: todayDraft, updated_at: new Date().toISOString() })
        .eq('id', todayId);
    } else {
      const { data } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_date: today,
          body: todayDraft,
          kind: 'daily',
          world_ref: null,
          tags: [],
        })
        .select()
        .single();
      if (data) setTodayId((data as JournalEntry).id);
    }
    setSaving(false);
    load();
  }

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.kind === filter);
  const kinds: (Kind | 'all')[] = ['all', 'daily', 'worldbuilding', 'sermon', 'note'];

  return (
    <div>
      <PageIntro title="Journal" subtitle="Daily notes, sermons, and ATDaItM worldbuilding" />

      {/* Today's entry — inline editor */}
      <section className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label">Today</div>
            <div className="font-display text-lg mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</div>
          </div>
          <button
            onClick={saveToday}
            disabled={saving || !todayDraft.trim()}
            className="btn-primary disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <textarea
          value={todayDraft}
          onChange={(e) => setTodayDraft(e.target.value)}
          placeholder="What happened today? What did you learn? What's on your mind?"
          rows={8}
          className="input w-full font-sans resize-none"
        />
        <div className="text-xs text-ink-500 mt-2">
          Tip: ⌘K → <kbd className="font-mono text-accent">j:</kbd> appends quick thoughts throughout the day.
        </div>
      </section>

      {/* History */}
      <div className="flex flex-wrap gap-2 mb-4">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`btn ${filter === k ? 'bg-ink-700 text-ink-100' : 'btn-ghost'}`}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState message="No entries yet." />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <article key={e.id} className="card p-5">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg">
                    {format(new Date(e.entry_date), 'MMM d, yyyy')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 bg-ink-700 rounded px-1.5 py-0.5">
                    {e.kind}
                  </span>
                </div>
                {e.world_ref && (
                  <span className="text-xs text-accent font-mono">{e.world_ref}</span>
                )}
              </div>
              <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-wrap">{e.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
