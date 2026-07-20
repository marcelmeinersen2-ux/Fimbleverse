'use client';
import { useState } from 'react';
import { updateExpense, deleteExpense } from '@/server/expenses';

interface Option { id: string; name: string }
export interface ExpenseItem {
  id: string;
  amount: number;
  spent_on: string;
  description: string;
  category_id: string;
  payer_id: string;
  categoryName: string;
  payerName: string;
}

function zloty(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
}
function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function ExpenseList(
  { initial, categories, people }:
  { initial: ExpenseItem[]; categories: Option[]; people: Option[] },
) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function nameOf(list: Option[], id: string) {
    return list.find((o) => o.id === id)?.name ?? '';
  }

  function otherName(payerId: string) {
    const nonPayer = people.find((pp) => pp.id !== payerId);
    return nonPayer?.name ?? '';
  }

  async function saveEdit(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await updateExpense(id, fd);
    setBusy(false);
    if (res.ok) {
      setItems(items.map((it) => it.id === id ? {
        ...it,
        amount: Number(fd.get('amount')),
        category_id: String(fd.get('categoryId')),
        payer_id: String(fd.get('payerId')),
        spent_on: String(fd.get('spentOn')),
        description: String(fd.get('description') ?? ''),
        categoryName: nameOf(categories, String(fd.get('categoryId'))),
        payerName: nameOf(people, String(fd.get('payerId'))),
      } : it));
      setEditing(null);
    }
  }

  async function doDelete(id: string) {
    setBusy(true);
    const res = await deleteExpense(id);
    setBusy(false);
    if (res.ok) { setItems(items.filter((it) => it.id !== id)); setConfirmDelete(null); }
  }

  if (items.length === 0) {
    return (
      <p className="text-muted text-sm rounded-card border border-line bg-surface p-6">
        No expenses yet. Add your first one above and it&rsquo;ll show up here.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((e) => {
        const half = Math.round((e.amount / 2) * 100) / 100;
        if (editing === e.id) {
          return (
            <li key={e.id} className="rounded-card bg-surface border border-primary p-4">
              <form onSubmit={(ev) => saveEdit(e.id, ev)} className="space-y-3">
                <input name="amount" type="number" step="0.01" min="0" defaultValue={e.amount}
                  className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
                <select name="categoryId" defaultValue={e.category_id}
                  className="w-full rounded-control border border-line px-3 py-2 bg-bg">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="payerId" defaultValue={e.payer_id}
                  className="w-full rounded-control border border-line px-3 py-2 bg-bg">
                  {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input name="spentOn" type="date" defaultValue={e.spent_on}
                  className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
                <input name="description" type="text" defaultValue={e.description} maxLength={200}
                  placeholder="Description"
                  className="w-full rounded-control border border-line px-3 py-2 bg-bg" />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy}
                    className="flex-1 rounded-control bg-primary text-primary-ink font-medium py-2 disabled:opacity-60">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditing(null)}
                    className="rounded-control border border-line px-4 py-2 text-muted">Cancel</button>
                </div>
              </form>
            </li>
          );
        }
        return (
          <li key={e.id} className="rounded-card bg-surface border border-line px-4 py-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-ink">{e.description || e.categoryName}</p>
                <p className="text-xs text-muted">
                  {shortDate(e.spent_on)} - {e.categoryName} - {e.payerName} paid
                </p>
              </div>
              <span className="font-medium tabular-nums">{zloty(e.amount)}</span>
            </div>
            <p className="text-xs text-accent-ink mt-1">
              {e.payerName} paid - {otherName(e.payer_id)} owes {zloty(half)}
            </p>
            {confirmDelete === e.id ? (
              <div className="flex gap-2 mt-3">
                <button onClick={() => doDelete(e.id)} disabled={busy}
                  className="rounded-control bg-danger text-white text-sm px-3 py-1.5 disabled:opacity-60">
                  Delete for good
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  className="rounded-control border border-line text-sm px-3 py-1.5 text-muted">Keep</button>
              </div>
            ) : (
              <div className="flex gap-4 mt-2">
                <button onClick={() => setEditing(e.id)} className="text-sm text-muted">Edit</button>
                <button onClick={() => setConfirmDelete(e.id)} className="text-sm text-muted">Delete</button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
