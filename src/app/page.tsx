import { redirect } from 'next/navigation';
import { getCurrentUser, getHouseholdContext } from '@/lib/auth/session';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const ctx = await getHouseholdContext();
  redirect(ctx ? '/home' : '/onboarding');
}
