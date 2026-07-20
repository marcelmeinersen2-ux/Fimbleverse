'use client';
import { useState } from 'react';
import { createClient } from '@/lib/database/client';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() || email.split('@')[0] } },
      });
      if (error) { setBusy(false); setError(friendly(error.message)); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setBusy(false); setError(friendly(error.message)); return; }
    }
    // Signed in. Use a full-page navigation (not client router) so the
    // session cookie is fully committed before the next page's server-side
    // auth check runs — a client push here races the cookie and loops.
    window.location.assign('/');
  }

  return (
    <main className="min-h-screen mx-auto max-w-md px-5 flex flex-col justify-center">
      <h1 className="font-display text-3xl">Welcome to Fimbleverse</h1>
      <p className="mt-2 text-muted">A calm shared view of home life.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="block text-sm text-muted mb-1">Your name</label>
            <input id="name" type="text" value={name} maxLength={40}
              onChange={(e) => setName(e.target.value)} placeholder="e.g. Marcel"
              className="w-full rounded-control border border-line px-3 py-2 bg-surface" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-muted mb-1">Email</label>
          <input id="email" type="email" required value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full rounded-control border border-line px-3 py-2 bg-surface" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-muted mb-1">Password</label>
          <input id="password" type="password" required value={password}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
            className="w-full rounded-control border border-line px-3 py-2 bg-surface" />
        </div>

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={busy}
          className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
        className="mt-4 text-sm text-muted">
        {mode === 'signin'
          ? "First time here? Create an account"
          : 'Already have an account? Sign in'}
      </button>
    </main>
  );
}

function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'That email or password is incorrect.';
  if (m.includes('already registered')) return 'An account with that email already exists — sign in instead.';
  if (m.includes('password')) return 'Password must be at least 8 characters.';
  if (m.includes('email')) return 'Please enter a valid email address.';
  return 'Something went wrong. Please try again.';
}
