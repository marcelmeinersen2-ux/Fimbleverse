'use client';
import { useState } from 'react';
import { addExpense } from '@/server/expenses';

interface Option { id: string; name: string }

export function AddExpenseForm(
  { categories, people, today }:
  { categories: Option[]; people: Option[]; today: string },
) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError(null);
    const form = new FormData(e.currentTarget);
    const res = await addExpense(form);
    setSaving(false);
    if (!res.ok) { setError(res.error ?? 'Something went wrong.'); return; }
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card bg-surface shadow-soft border border-line p-5 space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm text-muted mb-1">Amount (zł)</label>
        <input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" min="0"
          required placeholder="0.00"
          className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm text-muted mb-1">Category</label>
        <select id="categoryId" name="categoryId" required
          className="w-full rounded-control border border-line px-3 py-2 bg-bg">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="payerId" className="block text-sm text-muted mb-1">Who paid</label>
        <select id="payerId" name="payerId" required
          className="w-full rounded-control border border-line px-3 py-2 bg-bg">
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="spentOn" className="block text-sm text-muted mb-1">Date</label>
        <input id="spentOn" name="spentOn" type="date" required defaultValue={today}
          className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-muted mb-1">
          Description <span className="text-muted">(optional)</span>
        </label>
        <input id="description" name="description" type="text" maxLength={200}
          placeholder="e.g. Makro"
          className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={saving}
        className="w-full rounded-control bg-primary text-primary-ink font-medium py-3 disabled:opacity-60">
        {saving ? 'Saving…' : 'Add expense'}
      </button>
    </form>
  );
}
