export function SetupScreen() {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg card p-8">
        <div className="font-display text-3xl mb-1">MavOS</div>
        <div className="text-sm text-ink-400 mb-6">Setup required</div>

        <p className="text-sm text-ink-200 mb-4">
          Create a <code className="font-mono text-accent">.env.local</code> at the project root with:
        </p>

        <pre className="bg-ink-900 border border-ink-700 rounded-md p-4 text-xs font-mono text-ink-200 overflow-x-auto">
{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>

        <ol className="mt-6 space-y-2 text-sm text-ink-300 list-decimal list-inside">
          <li>Create a free project at <span className="text-accent">supabase.com</span></li>
          <li>Run <code className="font-mono text-ink-100">schema.sql</code> in the SQL editor</li>
          <li>Copy the project URL + anon key from Project Settings → API</li>
          <li>Restart <code className="font-mono text-ink-100">npm run dev</code></li>
        </ol>
      </div>
    </div>
  );
}
