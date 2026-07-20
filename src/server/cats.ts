'use server';
// Cat feeding log actions. Shared household data; validated server-side.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';

export interface ActionResult { ok: boolean; error?: string }

export async function logFeeding(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };

  const meal = String(form.get('meal') ?? '').trim().slice(0, 100);
  const hadSnack = form.get('hadSnack') === 'on' || form.get('hadSnack') === 'true';
  const today = new Date().toISOString().slice(0, 10);

  const supabase = createClient();
  const { error } = await supabase.from('cat_feedings').insert({
    household_id: ctx.householdId,
    fed_on: today,
    meal,
    had_snack: hadSnack,
    fed_by: ctx.userId,
  });
  if (error) return { ok: false, error: "We couldn't save that. Try again." };

  revalidatePath('/cats');
  return { ok: true };
}
