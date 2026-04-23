import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types/database';

type TasksState = {
  tasks: Task[];
  loading: boolean;
  load: () => Promise<void>;
  create: (input: Pick<Task, 'title'> & Partial<Pick<Task, 'notes' | 'priority' | 'due_at' | 'tags' | 'module'>>) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[tasks] load failed', error);
      set({ loading: false });
      return;
    }
    set({ tasks: (data as Task[]) ?? [], loading: false });
  },

  create: async (input) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        notes: input.notes ?? null,
        priority: input.priority ?? null,
        due_at: input.due_at ?? null,
        tags: input.tags ?? [],
        module: input.module ?? 'tasks',
        status: 'open',
      })
      .select()
      .single();
    if (error) {
      console.error('[tasks] create failed', error);
      return;
    }
    set({ tasks: [data as Task, ...get().tasks] });
  },

  toggle: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'done' ? 'open' : 'done';
    const { error } = await supabase
      .from('tasks')
      .update({
        status: nextStatus,
        completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (error) {
      console.error('[tasks] toggle failed', error);
      return;
    }
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, status: nextStatus, completed_at: nextStatus === 'done' ? new Date().toISOString() : null } : t
      ),
    });
  },

  remove: async (id) => {
    const { error } = await supabase.from('tasks').update({ status: 'archived' }).eq('id', id);
    if (error) {
      console.error('[tasks] remove failed', error);
      return;
    }
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
