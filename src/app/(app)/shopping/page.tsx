import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { ShoppingList } from '@/features/shopping/ShoppingList';

interface Item { id: string; name: string; checked: boolean }

export default async function ShoppingPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect('/onboarding');
  const supabase = createClient();
  const { data } = await supabase.from('shopping_items')
    .select('id, name, checked')
    .eq('household_id', ctx.householdId)
    .order('checked').order('created_at');
  const items = (data ?? []) as Item[];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Shopping</h1>
        <p className="mt-1 text-sm text-muted">Your shared list, wherever you both are.</p>
      </div>
      <ShoppingList initial={items} />
    </section>
  );
}
