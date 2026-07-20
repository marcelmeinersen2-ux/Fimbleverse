// Authorization helpers. Never infer auth from client state or email —
// always resolve the user server-side and their household from the DB.
import { createClient } from '@/lib/database/server';

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export interface HouseholdContext {
  householdId: string;
  userId: string;
}

/** Resolve the signed-in user's household. Returns null if none/not signed in. */
export async function getHouseholdContext(): Promise<HouseholdContext | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const row = data as { household_id: string } | null;
  if (!row) return null;
  return { householdId: row.household_id, userId: user.id };
}
