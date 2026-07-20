'use client';
import { useState } from 'react';
import { createInvite } from '@/server/household';

export function InviteCode() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true); setError(null);
    const res = await createInvite();
    setBusy(false);
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return; }
    setCode(res.code ?? null);
  }

  return (
    <div className="rounded-card bg-surface border border-line p-5">
      <h2 className="font-medium">Invite your partner</h2>
      <p className="mt-1 text-sm text-muted">
        Generate a code and share it with them. They enter it when they sign in.
        It works once and expires after 7 days.
      </p>
      {code ? (
        <div className="mt-4">
          <p className="font-display text-3xl tracking-widest text-center py-3 rounded-control bg-bg border border-line">
            {code}
          </p>
          <button onClick={generate} disabled={busy}
            className="mt-3 w-full text-sm text-muted py-2">
            Generate a different code
          </button>
        </div>
      ) : (
        <button onClick={generate} disabled={busy}
          className="mt-4 w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
          {busy ? 'Generating…' : 'Create invite code'}
        </button>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
