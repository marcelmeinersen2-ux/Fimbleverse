import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { BillsManager } from '@/features/bills/BillsManager';

interface Bill { id: string; name: string; amount: number; due_day: number }

export default async function BillsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();
  const { data } = await supabase.from('bills')
    .select('id, name, amount, due_day')
    .eq('household_id', ctx.householdId)
    .order('due_day');
  const bills = (data ?? []) as Bill[];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Bills</h1>
        <p className="mt-1 text-sm text-muted">What leaves your account each month.</p>
      </div>
      <BillsManager initial={bills} />
    </section>
  );
}
