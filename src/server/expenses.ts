'use server';
// Server actions for expenses + settlements. All run server-side, re-validate
// input, and rely on RLS to enforce the household boundary. Inputs are
// validated with Zod before any write (CLAUDE.md 7, 16.1).
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { getHouseholdContext } from '@/lib/auth/session';
import { expenseInput, settlementInput } from '@/lib/validation/expense';

export interface ActionResult { ok: boolean; error?: string }

export async function addExpense(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };

  const parsed = expenseInput.safeParse({
    amount: form.get('amount'),
    categoryId: form.get('categoryId'),
    payerId: form.get('payerId'),
    spentOn: form.get('spentOn'),
    description: form.get('description') ?? '',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('expenses').insert({
    household_id: ctx.householdId,
    category_id: parsed.data.categoryId,
    payer_id: parsed.data.payerId,
    amount: parsed.data.amount,
    spent_on: parsed.data.spentOn,
    description: parsed.data.description,
    created_by: ctx.userId,
  });
  if (error) return { ok: false, error: "We couldn't save that expense. Try again." };

  revalidatePath('/expenses');
  revalidatePath('/balance');
  revalidatePath('/home');
  return { ok: true };
}

export async function addSettlement(form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };

  const parsed = settlementInput.safeParse({
    kind: form.get('kind'),
    fromUserId: form.get('fromUserId'),
    toUserId: form.get('toUserId'),
    amount: form.get('amount'),
    note: form.get('note') ?? '',
    settledOn: form.get('settledOn'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('settlements').insert({
    household_id: ctx.householdId,
    kind: parsed.data.kind,
    from_user_id: parsed.data.fromUserId,
    to_user_id: parsed.data.toUserId,
    amount: parsed.data.amount,
    note: parsed.data.note,
    settled_on: parsed.data.settledOn,
    created_by: ctx.userId,
  });
  if (error) return { ok: false, error: "We couldn't record that. Try again." };

  revalidatePath('/balance');
  return { ok: true };
}

export async function updateExpense(id: string, form: FormData): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };

  const parsed = expenseInput.safeParse({
    amount: form.get('amount'),
    categoryId: form.get('categoryId'),
    payerId: form.get('payerId'),
    spentOn: form.get('spentOn'),
    description: form.get('description') ?? '',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('expenses')
    .update({
      category_id: parsed.data.categoryId,
      payer_id: parsed.data.payerId,
      amount: parsed.data.amount,
      spent_on: parsed.data.spentOn,
      description: parsed.data.description,
    })
    .eq('id', id)
    .eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "We couldn't update that expense." };

  revalidatePath('/expenses');
  revalidatePath('/balance');
  revalidatePath('/home');
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const ctx = await getHouseholdContext();
  if (!ctx) return { ok: false, error: 'Please sign in first.' };

  const supabase = createClient();
  const { error } = await supabase.from('expenses')
    .delete().eq('id', id).eq('household_id', ctx.householdId);
  if (error) return { ok: false, error: "We couldn't delete that expense." };

  revalidatePath('/expenses');
  revalidatePath('/balance');
  revalidatePath('/home');
  return { ok: true };
}
