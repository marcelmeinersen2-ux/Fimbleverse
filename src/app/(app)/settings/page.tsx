import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { fetchMembers } from '@/features/household/members';
import { InviteCode } from '@/features/household/InviteCode';

export default async function SettingsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();

  const [{ data: household }, people] = await Promise.all([
    supabase.from('households').select('name').eq('id', ctx.householdId).maybeSingle(),
    fetchMembers(supabase, ctx.householdId),
  ]);

  const householdName = (household as { name: string } | null)?.name ?? 'Your household';
  const me = people.find((p) => p.id === ctx.userId);
  const isAdmin = me?.role === 'admin';
  const soloSoFar = people.length < 2;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">{householdName}</p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted mb-3">Members</h2>
        <ul className="space-y-2">
          {people.map((p) => (
            <li key={p.id}
              className="rounded-card bg-surface border border-line px-4 py-3 flex justify-between">
              <span>{p.name}{p.id === ctx.userId ? ' (you)' : ''}</span>
              <span className="text-sm text-muted">{p.role}</span>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && soloSoFar && <InviteCode />}

      <p className="text-xs text-muted">
        Recording payments and one-off adjustments will live here soon.
      </p>
    </section>
  );
}
