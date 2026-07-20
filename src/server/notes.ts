'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';

export interface ActionResult { ok: boolean; error?: string }

export async function addNote(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const body = String(form.get('body') ?? '').trim().slice(0, 300);
  if (!body) return { ok: false, error: 'Write something first.' };
  const supabase = createClient();
  const { error } = await supabase.from('notes').insert({
    household_id: ctx.householdId, body, created_by: ctx.userId,
  });
  if (error) return { ok: false, error: "Couldn't save the note." };
  revalidatePath('/notes');
  return { ok: true };
}

export async function toggleNote(id: string, done: boolean): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const supabase = createClient();
  const { error } = await supabase.from('notes')
    .update({ done }).eq('id', id).eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "Couldn't update." };
  revalidatePath('/notes');
  return { ok: true };
}

export async function removeNote(id: string): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };
  const supabase = createClient();
  const { error } = await supabase.from('notes')
    .delete().eq('id', id).eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "Couldn't remove." };
  revalidatePath('/notes');
  return { ok: true };
}
