-- MavOS schema — run in Supabase SQL editor (Project → SQL → New query)
-- All tables are user-scoped with Row Level Security. When you invite your
-- wife later, her data is automatically walled off from yours.

-- ============================================================
-- Tasks
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'done', 'archived')),
  priority text check (priority in ('low', 'med', 'high')),
  due_at timestamptz,
  tags text[] not null default '{}',
  module text not null default 'tasks',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_due_idx on public.tasks (user_id, due_at);

-- ============================================================
-- Journal entries
-- ============================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  body text not null,
  kind text not null default 'daily' check (kind in ('daily', 'worldbuilding', 'sermon', 'note')),
  world_ref text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_user_date_idx on public.journal_entries (user_id, entry_date desc);
create index if not exists journal_user_kind_idx on public.journal_entries (user_id, kind);

-- ============================================================
-- Habits (workouts, smokes, meals, custom)
-- ============================================================
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'custom' check (kind in ('workout', 'smoke', 'meal', 'custom')),
  notes text,
  logged_at timestamptz not null default now(),
  metrics jsonb
);

create index if not exists habits_user_logged_idx on public.habits (user_id, logged_at desc);
create index if not exists habits_user_kind_idx on public.habits (user_id, kind);

-- ============================================================
-- Scripture log
-- ============================================================
create table if not exists public.scripture_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null,
  translation text not null default 'KJV',
  notes text,
  tags text[] not null default '{}',
  read_at timestamptz not null default now()
);

create index if not exists scripture_user_read_idx on public.scripture_log (user_id, read_at desc);

-- ============================================================
-- Finance entries
-- ============================================================
create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense', 'tithe', 'giving', 'transfer')),
  amount_cents integer not null,
  currency text not null default 'USD',
  category text,
  memo text,
  occurred_on date not null default current_date,
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists finance_user_occurred_idx on public.finance_entries (user_id, occurred_on desc);
create index if not exists finance_user_kind_idx on public.finance_entries (user_id, kind);

-- ============================================================
-- Row Level Security — each user only sees their own rows
-- ============================================================
alter table public.tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.habits enable row level security;
alter table public.scripture_log enable row level security;
alter table public.finance_entries enable row level security;

-- Helper: drop + recreate policy (idempotent re-runs)
do $$
declare
  t text;
begin
  for t in select unnest(array['tasks', 'journal_entries', 'habits', 'scripture_log', 'finance_entries'])
  loop
    execute format('drop policy if exists "own rows select" on public.%I', t);
    execute format('drop policy if exists "own rows insert" on public.%I', t);
    execute format('drop policy if exists "own rows update" on public.%I', t);
    execute format('drop policy if exists "own rows delete" on public.%I', t);

    execute format($p$create policy "own rows select" on public.%I for select using (auth.uid() = user_id)$p$, t);
    execute format($p$create policy "own rows insert" on public.%I for insert with check (auth.uid() = user_id)$p$, t);
    execute format($p$create policy "own rows update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)$p$, t);
    execute format($p$create policy "own rows delete" on public.%I for delete using (auth.uid() = user_id)$p$, t);
  end loop;
end $$;

-- ============================================================
-- updated_at trigger for journal_entries
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists journal_touch on public.journal_entries;
create trigger journal_touch before update on public.journal_entries
  for each row execute function public.touch_updated_at();
