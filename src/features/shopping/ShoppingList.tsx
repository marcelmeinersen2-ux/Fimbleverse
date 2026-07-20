'use client';
import { useState } from 'react';
import { addItem, toggleItem, clearChecked } from '@/server/shopping';

interface Item { id: string; name: string; checked: boolean }

export function ShoppingList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const name = text.trim();
    if (!name) return;
    setBusy(true);
    const fd = new FormData(); fd.set('name', name);
    const res = await addItem(fd);
    setBusy(false);
    if (res.ok) {
      setItems([...items, { id: crypto.randomUUID(), name, checked: false }]);
      setText('');
    }
  }

  async function toggle(id: string, checked: boolean) {
    setItems(items.map((i) => (i.id === id ? { ...i, checked } : i)));
    await toggleItem(id, checked);
  }

  async function clear() {
    setItems(items.filter((i) => !i.checked));
    await clearChecked();
  }

  const hasChecked = items.some((i) => i.checked);

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Add an item" maxLength={100}
          className="flex-1 rounded-control border border-line px-3 py-2 bg-surface" />
        <button type="submit" disabled={busy}
          className="rounded-control bg-primary text-primary-ink font-medium px-4 disabled:opacity-60">
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-muted text-sm rounded-card border border-line bg-surface p-6">
          Nothing on the list yet. Add the first thing above.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id}>
              <label className="flex items-center gap-3 rounded-card bg-surface border border-line px-4 py-3">
                <input type="checkbox" checked={i.checked}
                  onChange={(e) => toggle(i.id, e.target.checked)}
                  className="h-5 w-5 accent-primary" style={{ minHeight: 'auto' }} />
                <span className={i.checked ? 'line-through text-muted' : 'text-ink'}>{i.name}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {hasChecked && (
        <button onClick={clear} className="text-sm text-muted">Clear checked items</button>
      )}
    </div>
  );
}
