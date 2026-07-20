'use client';
import { useState } from 'react';
import { addBill, removeBill } from '@/server/bills';

interface Bill { id: string; name: string; amount: number; due_day: number }

function zloty(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
}
function ordinal(d: number) {
  const s = ['th', 'st', 'nd', 'rd'], v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function BillsManager({ initial }: { initial: Bill[] }) {
  const [bills, setBills] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await addBill(fd);
    setBusy(false);
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return; }
    e.currentTarget.reset();
    // Refresh list from optimistic values
    setBills([...bills, {
      id: crypto.randomUUID(),
      name: String(fd.get('name')),
      amount: Number(fd.get('amount')),
      due_day: parseInt(String(fd.get('dueDay')), 10),
    }].sort((a, b) => a.due_day - b.due_day));
  }

  async function remove(id: string) {
    setBills(bills.filter((b) => b.id !== id));
    await removeBill(id);
  }

  const monthlyTotal = bills.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      {bills.length > 0 && (
        <div className="rounded-card bg-surface shadow-soft border-l-4 border-l-accent border border-line p-5">
          <p className="font-display text-xl">{zloty(monthlyTotal)} / month</p>
          <p className="mt-1 text-sm text-muted">Across {bills.length} recurring {bills.length === 1 ? 'bill' : 'bills'}.</p>
        </div>
      )}

      <form onSubmit={add} className="rounded-card bg-surface shadow-soft border border-line p-5 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-muted mb-1">Bill name</label>
          <input id="name" name="name" maxLength={100} placeholder="e.g. Electricity"
            className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm text-muted mb-1">Amount (zł)</label>
            <input id="amount" name="amount" type="number" step="0.01" min="0" inputMode="decimal"
              placeholder="0.00" className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
          </div>
          <div className="w-28">
            <label htmlFor="dueDay" className="block text-sm text-muted mb-1">Due day</label>
            <input id="dueDay" name="dueDay" type="number" min="1" max="31" inputMode="numeric"
              placeholder="1" className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
          {busy ? 'Saving...' : 'Add bill'}
        </button>
      </form>

      {bills.length === 0 ? (
        <p className="text-muted text-sm rounded-card border border-line bg-surface p-6">
          No bills yet. Add your recurring ones to see what leaves your account each month.
        </p>
      ) : (
        <ul className="space-y-2">
          {bills.map((b) => (
            <li key={b.id}
              className="rounded-card bg-surface border border-line px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-ink">{b.name}</p>
                <p className="text-xs text-muted">Due the {ordinal(b.due_day)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium tabular-nums">{zloty(Number(b.amount))}</span>
                <button onClick={() => remove(b.id)} aria-label={`Remove ${b.name}`}
                  className="text-muted text-sm">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
