// MavOS Supabase schema types.
// Regenerate with `npx supabase gen types typescript` once you wire up the CLI.
// Hand-authored here so the scaffold compiles out of the box.

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          status: 'open' | 'done' | 'archived';
          priority: 'low' | 'med' | 'high' | null;
          due_at: string | null;
          tags: string[];
          module: string; // 'tasks' | 'ministry' | 'tundra' | etc — flat tag of origin
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'completed_at' | 'tags' | 'status'> & {
          id?: string;
          status?: 'open' | 'done' | 'archived';
          tags?: string[];
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string; // YYYY-MM-DD
          body: string;
          kind: 'daily' | 'worldbuilding' | 'sermon' | 'note';
          world_ref: string | null; // e.g. 'atdaitm:location:the-deep'
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journal_entries']['Row'], 'id' | 'created_at' | 'updated_at' | 'tags'> & {
          id?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: 'workout' | 'smoke' | 'meal' | 'custom';
          notes: string | null;
          logged_at: string;
          metrics: Record<string, number | string> | null;
        };
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'logged_at'> & {
          id?: string;
          logged_at?: string;
        };
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      scripture_log: {
        Row: {
          id: string;
          user_id: string;
          reference: string; // e.g. "John 3:16" or "Romans 8:28-39"
          translation: string; // default 'KJV'
          notes: string | null;
          tags: string[];
          read_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scripture_log']['Row'], 'id' | 'read_at' | 'tags' | 'translation'> & {
          id?: string;
          translation?: string;
          tags?: string[];
          read_at?: string;
        };
        Update: Partial<Database['public']['Tables']['scripture_log']['Insert']>;
      };
      finance_entries: {
        Row: {
          id: string;
          user_id: string;
          kind: 'income' | 'expense' | 'tithe' | 'giving' | 'transfer';
          amount_cents: number;
          currency: string;
          category: string | null;
          memo: string | null;
          occurred_on: string; // YYYY-MM-DD
          recurring: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['finance_entries']['Row'], 'id' | 'created_at' | 'currency' | 'recurring'> & {
          id?: string;
          currency?: string;
          recurring?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['finance_entries']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Task = Database['public']['Tables']['tasks']['Row'];
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type ScriptureLog = Database['public']['Tables']['scripture_log']['Row'];
export type FinanceEntry = Database['public']['Tables']['finance_entries']['Row'];
