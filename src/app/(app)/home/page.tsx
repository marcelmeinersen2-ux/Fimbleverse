import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { fetchMembers } from '@/features/household/members';
import { netOwedBy, describeBalance } from '@/features/settlements/balance';

const features = [
  { href: '/expenses', title: 'Expenses', desc: 'Track shared spending' },
  { href: '/balance',  title: 'Balance',  desc: 'Who owes whom' },
  { href: '/shopping', title: 'Shopping', desc: 'Your shared list' },
  { href: '/bills',    title: 'Bills',    desc: 'Monthly recurring' },
  { href: '/cats',     title: 'Cats',     desc: 'Feeding log' },
  { href: '/notes',    title: 'Notes',    desc: 'Reminders for each other' },
];

export default async function HomePage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();

  const today = new Date().toISOString().slice(0, 10);
  const [people, { data: feedings }, { data: expenses }, { data: settlements }] =
    await Promise.all([
      fetchMembers(supabase, ctx.householdId),
      supabase.from('cat_feedings').select('id').eq('household_id', ctx.householdId).eq('fed_on', today),
      supabase.from('expenses').select('payer_id, amount').eq('household_id', ctx.householdId),
      supabase.from('settlements').select('from_user_id, to_user_id, amount').eq('household_id', ctx.householdId),
    ]);

  const me = people.find((p) => p.id === ctx.userId);
  const other = people.find((p) => p.id !== ctx.userId);
  let balanceLine = 'Add an expense to get started';
  if (me && other) {
    const net = netOwedBy(me.id, other.id,
      ((expenses ?? []) as { payer_id: string; amount: number }[]).map((e) => ({ payerId: e.payer_id, amount: Number(e.amount) })),
      ((settlements ?? []) as { from_user_id: string; to_user_id: string; amount: number }[]).map((s) => ({ fromUserId: s.from_user_id, toUserId: s.to_user_id, amount: Number(s.amount) })),
    );
    balanceLine = describeBalance(me.name, other.name, net);
  }
  const catsFed = (feedings ?? []).length > 0;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Fimbleverse</h1>
        <p className="mt-1 text-sm text-muted">A calm shared view of home life.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-surface border-l-4 border-l-accent border border-line p-4">
          <p className="text-xs text-muted">Balance</p>
          <p className="font-display text-base mt-1 leading-snug">{balanceLine}</p>
        </div>
        <div className="rounded-card bg-surface border-l-4 border-l-primary border border-line p-4">
          <p className="text-xs text-muted">Cats today</p>
          <p className="font-display text-base mt-1">{catsFed ? 'Fed \u2713' : 'Not fed yet'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href}
            className="rounded-card bg-surface border border-line p-4 hover:border-primary transition-colors">
            <p className="font-medium text-ink">{f.title}</p>
            <p className="text-xs text-muted mt-0.5">{f.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
