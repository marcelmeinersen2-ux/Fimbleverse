'use client';
import { useState } from 'react';
import { logFeeding } from '@/server/cats';

export function LogFeeding() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await logFeeding(new FormData(e.currentTarget));
    setBusy(false);
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return; }
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={submit}
      className="rounded-card bg-surface shadow-soft border border-line p-5 space-y-4">
      <div>
        <label htmlFor="meal" className="block text-sm text-muted mb-1">What did they get?</label>
        <input id="meal" name="meal" type="text" maxLength={100}
          placeholder="e.g. wet food + kibble"
          className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
      </div>
      <label className="flex items-center gap-3">
        <input name="hadSnack" type="checkbox"
          className="h-5 w-5 rounded border-line accent-primary" style={{ minHeight: 'auto' }} />
        <span className="text-ink">They also had a snack</span>
      </label>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={busy}
        className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
        {busy ? 'Saving...' : 'Mark as fed'}
      </button>
    </form>
  );
}
