import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { fetchMembers } from '@/features/household/members';
import { netOwedBy, describeBalance } from '@/features/settlements/balance';

export default async function BalancePage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();

  const [people, { data: expenses }, { data: settlements }] = await Promise.all([
    fetchMembers(supabase, ctx.householdId),
    supabase.from('expenses').select('payer_id, amount')
      .eq('household_id', ctx.householdId),
    supabase.from('settlements').select('from_user_id, to_user_id, amount')
      .eq('household_id', ctx.householdId),
  ]);

  const me = people.find((p) => p.id === ctx.userId) ?? people[0];
  const other = people.find((p) => p.id !== ctx.userId) ?? people[1];

  if (!me || !other) {
    return (
      <section>
        <h1 className="font-display text-2xl">Balance</h1>
        <p className="mt-4 text-muted">
          Once both of you have joined the household, your shared balance shows here.
        </p>
      </section>
    );
  }

  const net = netOwedBy(
    me.id, other.id,
    ((expenses ?? []) as { payer_id: string; amount: number }[])
      .map((e) => ({ payerId: e.payer_id, amount: Number(e.amount) })),
    ((settlements ?? []) as { from_user_id: string; to_user_id: string; amount: number }[])
      .map((s) => ({ fromUserId: s.from_user_id, toUserId: s.to_user_id, amount: Number(s.amount) })),
  );

  const sentence = describeBalance(me.name, other.name, net);

  return (
    <section>
      <h1 className="font-display text-2xl">Balance</h1>
      <div className="mt-6 rounded-card bg-surface shadow-soft border-l-4 border-l-accent border border-line p-6">
        <p className="font-display text-xl leading-snug">{sentence}</p>
        {net !== 0 && (
          <p className="mt-2 text-sm text-muted">
            Split evenly across everything you’ve both spent.
          </p>
        )}
      </div>
      <p className="mt-8 text-sm text-muted">
        Starting fresh from an even balance. Record a payment or a one-off
        adjustment from Settings when you square up.
      </p>
    </section>
  );
}
