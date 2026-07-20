'use client';
import { useState } from 'react';
import { addNote, toggleNote, removeNote } from '@/server/notes';

interface Note { id: string; body: string; done: boolean }

export function NotesBoard({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    const fd = new FormData(); fd.set('body', body);
    const res = await addNote(fd);
    setBusy(false);
    if (res.ok) {
      setNotes([{ id: crypto.randomUUID(), body, done: false }, ...notes]);
      setText('');
    }
  }

  async function toggle(id: string, done: boolean) {
    setNotes(notes.map((n) => (n.id === id ? { ...n, done } : n)));
    await toggleNote(id, done);
  }
  async function remove(id: string) {
    setNotes(notes.filter((n) => n.id !== id));
    await removeNote(id);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Leave a note" maxLength={300}
          className="flex-1 rounded-control border border-line px-3 py-2 bg-surface" />
        <button type="submit" disabled={busy}
          className="rounded-control bg-primary text-primary-ink font-medium px-4 disabled:opacity-60">
          Add
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-muted text-sm rounded-card border border-line bg-surface p-6">
          No notes yet. Leave one for each other above.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id}
              className="rounded-card bg-surface border border-line px-4 py-3 flex items-start gap-3">
              <input type="checkbox" checked={n.done}
                onChange={(e) => toggle(n.id, e.target.checked)}
                className="h-5 w-5 mt-0.5 accent-primary" style={{ minHeight: 'auto' }} />
              <span className={`flex-1 ${n.done ? 'line-through text-muted' : 'text-ink'}`}>{n.body}</span>
              <button onClick={() => remove(n.id)} aria-label="Remove note"
                className="text-muted text-sm">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
