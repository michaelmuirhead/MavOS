import { useState } from 'react';
import { useAuthStore } from '@/store/auth';

export function SignIn() {
  const signIn = useAuthStore((s) => s.signInWithMagicLink);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function handle() {
    if (!email) return;
    setStatus('sending');
    const { error } = await signIn(email);
    if (error) {
      setErr(error);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="font-display text-3xl mb-1">MavOS</div>
        <div className="text-sm text-ink-400 mb-8">Personal life operating system</div>

        {status === 'sent' ? (
          <div className="text-sm text-ink-200">
            Magic link sent to <span className="text-accent">{email}</span>. Check your inbox.
          </div>
        ) : (
          <>
            <label className="label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full mb-4"
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === 'Enter' && handle()}
            />
            <button
              onClick={handle}
              disabled={status === 'sending' || !email}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {err && <div className="text-xs text-danger mt-3">{err}</div>}
          </>
        )}
      </div>
    </div>
  );
}
