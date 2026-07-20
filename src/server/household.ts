'use server';
// Household onboarding actions. These call SECURITY DEFINER RPCs that perform
// the privileged, atomic operations (create household + first membership,
// redeem a code). Errors from the RPCs are surfaced in plain language.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/database/server';
import { getCurrentUser } from '@/lib/auth/session';

export interface ActionResult { ok: boolean; error?: string; code?: string }

export async function createHousehold(form: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Please sign in first.' };

  const name = String(form.get('name') ?? '').trim() || 'Our household';
  const supabase = createClient();
  const { error } = await supabase.rpc('create_household', { household_name: name });
  if (error) {
    return { ok: false, error: friendly(error.message) };
  }
  revalidatePath('/', 'layout');
  redirect('/expenses');
}

export async function joinHousehold(form: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Please sign in first.' };

  const code = String(form.get('code') ?? '').trim().toUpperCase();
  if (code.length < 4) return { ok: false, error: 'Enter the full code.' };

  const supabase = createClient();
  const { error } = await supabase.rpc('redeem_invitation', { invite_code: code });
  if (error) {
    return { ok: false, error: friendly(error.message) };
  }
  revalidatePath('/', 'layout');
  redirect('/expenses');
}

export async function createInvite(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Please sign in first.' };

  const supabase = createClient();
  const { data, error } = await supabase.rpc('create_invitation');
  if (error) return { ok: false, error: friendly(error.message) };
  return { ok: true, code: data as string };
}

// Map raw Postgres exception text to calm, user-facing wording.
function friendly(msg: string): string {
  if (msg.includes('already belong')) return 'You already have a household set up.';
  if (msg.includes('already been used')) return 'That code has already been used.';
  if (msg.includes('expired')) return 'That code has expired — ask for a new one.';
  if (msg.includes("isn't valid") || msg.includes('valid')) return "That code isn't valid.";
  if (msg.includes('admin')) return 'Only the person who created the household can invite.';
  return "Something went wrong. Please try again.";
}
