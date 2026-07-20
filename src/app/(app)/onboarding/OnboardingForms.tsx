'use client';
import { useState } from 'react';
import { createHousehold, joinHousehold } from '@/server/household';

type Mode = 'choose' | 'create' | 'join';

export function OnboardingForms() {
  const [mode, setMode] = useState<Mode>('choose');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(action: (f: FormData) => Promise<{ ok: boolean; error?: string }>,
                        e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await action(new FormData(e.currentTarget));
    // On success the action redirects, so we only get here on failure.
    setBusy(false);
    if (res && !res.ok) setError(res.error ?? 'Something went wrong.');
  }

  if (mode === 'choose') {
    return (
      <div className="space-y-3">
        <button onClick={() => setMode('create')}
          className="w-full rounded-control bg-primary text-primary-ink font-medium py-3">
          Start a new household
        </button>
        <button onClick={() => setMode('join')}
          className="w-full rounded-control bg-surface border border-line font-medium py-3">
          Join with a code
        </button>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <form onSubmit={(e) => submit(createHousehold, e)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-muted mb-1">Household name</label>
          <input id="name" name="name" type="text" maxLength={60} defaultValue="Our household"
            className="w-full rounded-control border border-line px-3 py-2 bg-surface" />
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
          {busy ? 'Setting up…' : 'Create household'}
        </button>
        <button type="button" onClick={() => { setMode('choose'); setError(null); }}
          className="w-full text-sm text-muted py-2">Back</button>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => submit(joinHousehold, e)} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm text-muted mb-1">Invite code</label>
        <input id="code" name="code" type="text" autoCapitalize="characters"
          placeholder="ABC123" maxLength={8}
          className="w-full rounded-control border border-line px-3 py-2 bg-surface tracking-widest uppercase" />
        <p className="mt-1 text-xs text-muted">Ask your partner for the code shown on their Settings screen.</p>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={busy}
        className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
        {busy ? 'Joining…' : 'Join household'}
      </button>
      <button type="button" onClick={() => { setMode('choose'); setError(null); }}
        className="w-full text-sm text-muted py-2">Back</button>
    </form>
  );
}
