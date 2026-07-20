'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';

export interface ActionResult { ok: boolean; error?: string }

export async function addBill(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  const amount = Number(form.get('amount'));
  const dueDay = parseInt(String(form.get('dueDay') ?? ''), 10);
  if (!name) return { ok: false, error: 'Give the bill a name.' };
  if (!(amount >= 0)) return { ok: false, error: 'Enter a valid amount.' };
  if (!(dueDay >= 1 && dueDay <= 31)) return { ok: false, error: 'Due day must be 1-31.' };
  const supabase = createClient();
  const { error } = await supabase.from('bills').insert({
    household_id: ctx.householdId, name, amount, due_day: dueDay, created_by: ctx.userId,
  });
  if (error) return { ok: false, error: "Couldn't save the bill." };
  revalidatePath('/bills');
  return { ok: true };
}

export async function removeBill(id: string): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const supabase = createClient();
  const { error } = await supabase.from('bills')
    .delete().eq('id', id).eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "Couldn't remove." };
  revalidatePath('/bills');
  return { ok: true };
}
