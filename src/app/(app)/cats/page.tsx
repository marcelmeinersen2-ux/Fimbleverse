import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { fetchMembers } from '@/features/household/members';
import { LogFeeding } from '@/features/cats/LogFeeding';

interface FeedingRow {
  id: string;
  meal: string;
  had_snack: boolean;
  fed_by: string;
  created_at: string;
}

export default async function CatsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [people, { data: feedingsData }] = await Promise.all([
    fetchMembers(supabase, ctx.householdId),
    supabase.from('cat_feedings')
      .select('id, meal, had_snack, fed_by, created_at')
      .eq('household_id', ctx.householdId)
      .eq('fed_on', today)
      .order('created_at', { ascending: false }),
  ]);

  const feedings = (feedingsData ?? []) as FeedingRow[];
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? 'Someone';
  const fedToday = feedings.length > 0;
  const timeOf = (iso: string) =>
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Cats</h1>
        <p className="mt-1 text-sm text-muted">Have the cats been fed today?</p>
      </div>

      {/* The at-a-glance answer, stated plainly. */}
      <div className={`rounded-card p-5 border ${fedToday
        ? 'bg-surface border-l-4 border-l-primary border-line'
        : 'bg-surface border-l-4 border-l-accent border-line'}`}>
        <p className="font-display text-xl">
          {fedToday ? 'Fed today \u2713' : 'Not fed yet today'}
        </p>
      </div>

      <LogFeeding />

      {feedings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted mb-3">Today</h2>
          <ul className="space-y-2">
            {feedings.map((f) => (
              <li key={f.id}
                className="rounded-card bg-surface border border-line px-4 py-3">
                <p className="text-ink">
                  {f.meal || 'Fed'}{f.had_snack ? ' + snack' : ''}
                </p>
                <p className="text-xs text-muted">
                  {timeOf(f.created_at)} by {nameOf(f.fed_by)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
