import { useEffect, useRef, useState } from 'react';
import { useCaptureStore } from '@/store/capture';
import { useTasksStore } from '@/store/tasks';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

/**
 * Prefix-based capture routing.
 *
 * Examples:
 *   "pick up bolts at Home Depot"           → task
 *   "t: call about appraisal"               → task (explicit)
 *   "j: good day with Deisha, Rally prep"   → journal entry (today)
 *   "$: 42.18 lunch"                        → expense
 *   "s: Rom 8:28 — god works all things"    → scripture log
 *   "h: grilled ribeye medium rare"         → health/meal log
 */
type Prefix = 't' | 'j' | '$' | 's' | 'h' | null;

function detectPrefix(raw: string): { prefix: Prefix; body: string } {
  const match = raw.match(/^([tj$sh]):\s*(.*)$/i);
  if (match) return { prefix: match[1].toLowerCase() as Prefix, body: match[2] };
  return { prefix: null, body: raw };
}

export function CaptureBar() {
  const hide = useCaptureStore((s) => s.hide);
  const createTask = useTasksStore((s) => s.create);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { prefix, body } = detectPrefix(value);
  const routeLabel = (
    {
      t: 'Task',
      j: 'Journal',
      $: 'Expense',
      s: 'Scripture',
      h: 'Health log',
    } as const
  )[prefix ?? ''] ?? 'Task (default)';

  async function handleSubmit() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      switch (prefix) {
        case 'j': {
          const today = format(new Date(), 'yyyy-MM-dd');
          await supabase.from('journal_entries').insert({
            user_id: user.id,
            entry_date: today,
            body,
            kind: 'daily',
            world_ref: null,
            tags: [],
          });
          break;
        }
        case '$': {
          // Expected format: "$: 42.18 memo text" or "$: 42.18 tithe offering"
          const dollarMatch = body.match(/^\$?\s*([\d.]+)\s+(.*)$/);
          const amount = dollarMatch ? parseFloat(dollarMatch[1]) : NaN;
          const memo = dollarMatch ? dollarMatch[2] : body;
          if (isNaN(amount)) break;
          const kind = /\btithe\b/i.test(memo)
            ? 'tithe'
            : /\b(giving|offering)\b/i.test(memo)
              ? 'giving'
              : 'expense';
          await supabase.from('finance_entries').insert({
            user_id: user.id,
            kind,
            amount_cents: Math.round(amount * 100),
            category: null,
            memo,
            occurred_on: format(new Date(), 'yyyy-MM-dd'),
          });
          break;
        }
        case 's': {
          // Expected: "s: Rom 8:28 notes..." — ref is first token up to two colons in
          const refMatch = body.match(/^([\w\s]+\d[\d:\-–]*)\s*(?:—|-|:)?\s*(.*)$/);
          const reference = refMatch ? refMatch[1].trim() : body;
          const notes = refMatch ? refMatch[2] : null;
          await supabase.from('scripture_log').insert({
            user_id: user.id,
            reference,
            notes,
          });
          break;
        }
        case 'h': {
          const kind = /\b(workout|lift|run|ran|squat|bench|deadlift)\b/i.test(body)
            ? 'workout'
            : /\b(smoke|smoked|brisket|ribs|pork)\b/i.test(body)
              ? 'smoke'
              : /\b(meal|ate|dinner|breakfast|lunch|grilled)\b/i.test(body)
                ? 'meal'
                : 'custom';
          await supabase.from('habits').insert({
            user_id: user.id,
            kind,
            name: body.slice(0, 80),
            notes: body,
            metrics: null,
          });
          break;
        }
        case 't':
        default:
          await createTask({ title: body });
          break;
      }

      setValue('');
      hide();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/70 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={hide}
    >
      <div
        className="w-full max-w-xl card p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 pt-2 pb-1">
          <span className="label text-accent">{routeLabel}</span>
          <span className="ml-auto text-[10px] font-mono text-ink-500">Enter ↵ to save · Esc to close</span>
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={saving}
          placeholder="Type to capture. Prefix: t: j: $: s: h:"
          className="w-full bg-transparent px-3 py-3 text-lg outline-none placeholder:text-ink-500"
        />
        <div className="px-3 pb-2 pt-1 text-[11px] text-ink-400 flex flex-wrap gap-3">
          <span><kbd className="font-mono">t:</kbd> task</span>
          <span><kbd className="font-mono">j:</kbd> journal</span>
          <span><kbd className="font-mono">$:</kbd> expense/tithe</span>
          <span><kbd className="font-mono">s:</kbd> scripture</span>
          <span><kbd className="font-mono">h:</kbd> health</span>
        </div>
      </div>
    </div>
  );
}
