import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { fetchMembers } from '@/features/household/members';
import { netOwedBy, describeBalance } from '@/features/settlements/balance';
import { AddExpenseForm } from '@/features/expenses/components/AddExpenseForm';
import { ExpenseList, type ExpenseItem } from '@/features/expenses/components/ExpenseList';
import { SpendingBreakdown } from '@/features/expenses/SpendingBreakdown';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

interface RawExpense {
  id: string; amount: number; spent_on: string; description: string;
  category_id: string; payer_id: string;
  expense_categories: { name: string } | { name: string }[] | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

export default async function ExpensesPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();

  const [{ data: categories }, people, { data: expensesData }, { data: settlements }] =
    await Promise.all([
      supabase.from('expense_categories').select('id, name')
        .eq('household_id', ctx.householdId).order('sort_order'),
      fetchMembers(supabase, ctx.householdId),
      supabase.from('expenses')
        .select('id, amount, spent_on, description, category_id, payer_id, expense_categories(name), profiles:payer_id(display_name)')
        .eq('household_id', ctx.householdId)
        .order('spent_on', { ascending: false })
        .limit(100),
      supabase.from('settlements').select('from_user_id, to_user_id, amount')
        .eq('household_id', ctx.householdId),
    ]);

  const cats = (categories ?? []) as { id: string; name: string }[];
  const raw = (expensesData ?? []) as unknown as RawExpense[];

  const items: ExpenseItem[] = raw.map((e) => ({
    id: e.id, amount: Number(e.amount), spent_on: e.spent_on,
    description: e.description, category_id: e.category_id, payer_id: e.payer_id,
    categoryName: one(e.expense_categories)?.name ?? '',
    payerName: one(e.profiles)?.display_name ?? '',
  }));

  // Current balance line.
  const me = people.find((p) => p.id === ctx.userId);
  const other = people.find((p) => p.id !== ctx.userId);
  let balanceLine: string | null = null;
  if (me && other) {
    const net = netOwedBy(me.id, other.id,
      items.map((e) => ({ payerId: e.payer_id, amount: e.amount })),
      ((settlements ?? []) as { from_user_id: string; to_user_id: string; amount: number }[])
        .map((s) => ({ fromUserId: s.from_user_id, toUserId: s.to_user_id, amount: Number(s.amount) })),
    );
    balanceLine = describeBalance(me.name, other.name, net);
  }

  // This month's category breakdown.
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(now);
  const byCat = new Map<string, number>();
  let grand = 0;
  for (const e of items) {
    if (e.spent_on.startsWith(monthPrefix)) {
      byCat.set(e.categoryName, (byCat.get(e.categoryName) ?? 0) + e.amount);
      grand += e.amount;
    }
  }
  const totals = Array.from(byCat.entries()).map(([name, total]) => ({ name, total }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Expenses</h1>
        <p className="mt-1 text-sm text-muted">Everything you both spend, in one place.</p>
      </div>

      {balanceLine && (
        <div className="rounded-card bg-surface shadow-soft border-l-4 border-l-accent border border-line p-4">
          <p className="text-xs text-muted">Right now</p>
          <p className="font-display text-lg leading-snug">{balanceLine}</p>
        </div>
      )}

      <AddExpenseForm categories={cats} people={people} today={today} />

      <SpendingBreakdown totals={totals} grandTotal={grand} monthLabel={monthLabel} />

      <div>
        <h2 className="text-sm font-medium text-muted mb-3">Recent</h2>
        <ExpenseList initial={items} categories={cats} people={people} />
      </div>
    </section>
  );
}
