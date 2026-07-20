// Shared shape + fetch for household members with their display name.
// Types the joined-select result explicitly (Supabase's inference can collapse
// to `never` under strict builds). One place, reused across pages.
//
// The client is typed as exactly what createClient() returns, so there's no
// generic-arity mismatch across Supabase versions.
import { createClient } from '@/lib/database/server';

type DbClient = ReturnType<typeof createClient>;

export interface Member {
  id: string;
  role: 'member' | 'admin';
  name: string;
}

interface MemberRow {
  user_id: string;
  role: 'member' | 'admin';
  profiles: { display_name: string } | { display_name: string }[] | null;
}

function displayName(p: MemberRow['profiles']): string {
  if (!p) return 'Someone';
  const row = Array.isArray(p) ? p[0] : p;
  return row?.display_name ?? 'Someone';
}

export async function fetchMembers(
  supabase: DbClient,
  householdId: string,
): Promise<Member[]> {
  const { data } = await supabase
    .from('household_members')
    .select('user_id, role, profiles(display_name)')
    .eq('household_id', householdId);

  const rows = (data ?? []) as unknown as MemberRow[];
  return rows.map((m: MemberRow) => ({
    id: m.user_id,
    role: m.role,
    name: displayName(m.profiles),
  }));
}
