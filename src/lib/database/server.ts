// Server Supabase client, bound to the request's auth cookies.
// This is user-scoped: every query runs under the signed-in user and is
// therefore subject to RLS. We never use the service-role key here
// (CLAUDE.md 8.4 — prefer authenticated access + RLS).
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component; middleware refreshes sessions.
          }
        },
      },
    },
  );
}
