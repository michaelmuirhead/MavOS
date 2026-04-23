import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTasksStore } from '@/store/tasks';
import { PageIntro, EmptyState } from '@/components/ui';

type Filter = 'open' | 'done' | 'all';

export function Tasks() {
  const { tasks, loading, load, toggle, remove } = useTasksStore();
  const [filter, setFilter] = useState<Filter>('open');

  useEffect(() => {
    load();
  }, [load]);

  const filtered = tasks.filter((t) => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div>
      <PageIntro title="Tasks" subtitle="⌘K to capture. No prefix = task." />

      <div className="flex gap-2 mb-4">
        {(['open', 'done', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'bg-ink-700 text-ink-100' : 'btn-ghost'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="text-xs text-ink-500 ml-1">
              {f === 'open'
                ? tasks.filter((t) => t.status === 'open').length
                : f === 'done'
                  ? tasks.filter((t) => t.status === 'done').length
                  : tasks.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState message="Nothing here." hint="Hit ⌘K to drop in a task." />
      ) : (
        <ul className="card divide-y divide-ink-700">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3 group">
              <button
                onClick={() => toggle(t.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  t.status === 'done'
                    ? 'bg-accent border-accent text-ink-900'
                    : 'border-ink-500 hover:border-accent'
                }`}
              >
                {t.status === 'done' && <Check size={12} strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm truncate ${
                    t.status === 'done' ? 'line-through text-ink-500' : 'text-ink-100'
                  }`}
                >
                  {t.title}
                </div>
                {(t.notes || t.due_at) && (
                  <div className="text-xs text-ink-500 mt-0.5 truncate">
                    {t.due_at && `Due ${format(new Date(t.due_at), 'MMM d')}`}
                    {t.due_at && t.notes && ' · '}
                    {t.notes}
                  </div>
                )}
              </div>

              {t.tags.length > 0 && (
                <div className="hidden sm:flex gap-1">
                  {t.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] text-ink-400 bg-ink-700 rounded px-1.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-danger transition"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
