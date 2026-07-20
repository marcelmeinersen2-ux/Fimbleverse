import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { NotesBoard } from '@/features/notes/NotesBoard';

interface Note { id: string; body: string; done: boolean }

export default async function NotesPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();
  const { data } = await supabase.from('notes')
    .select('id, body, done')
    .eq('household_id', ctx.householdId)
    .order('done').order('created_at', { ascending: false });
  const notes = (data ?? []) as Note[];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Notes</h1>
        <p className="mt-1 text-sm text-muted">Little reminders for each other.</p>
      </div>
      <NotesBoard initial={notes} />
    </section>
  );
}
