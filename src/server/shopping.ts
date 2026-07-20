'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';

export interface ActionResult { ok: boolean; error?: string }

export async function addItem(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  if (!name) return { ok: false, error: 'Type something to add.' };
  const supabase = createClient();
  const { error } = await supabase.from('shopping_items').insert({
    household_id: ctx.householdId, name, created_by: ctx.userId,
  });
  if (error) return { ok: false, error: "Couldn't add that. Try again." };
  revalidatePath('/shopping');
  return { ok: true };
}

export async function toggleItem(id: string, checked: boolean): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const supabase = createClient();
  const { error } = await supabase.from('shopping_items')
    .update({ checked }).eq('id', id).eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "Couldn't update." };
  revalidatePath('/shopping');
  return { ok: true };
}

export async function clearChecked(): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const supabase = createClient();
  const { error } = await supabase.from('shopping_items')
    .delete().eq('household_id', ctx.householdId).eq('checked', true);
  if (error) return { ok: false, error: "Couldn't clear." };
  revalidatePath('/shopping');
  return { ok: true };
}
