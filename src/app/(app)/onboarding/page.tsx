import { redirect } from 'next/navigation';
import { getHouseholdContext, getCurrentUser } from '@/lib/auth/session';
import { OnboardingForms } from './OnboardingForms';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Already in a household? Skip onboarding.
  const ctx = await getHouseholdContext();
  if (ctx) redirect('/expenses');

  return (
    <section className="pt-6">
      <h1 className="font-display text-2xl">Welcome</h1>
      <p className="mt-2 text-muted text-sm">
        Set up your shared space. Start a new household, or join your partner’s
        with the code they share with you.
      </p>
      <div className="mt-8">
        <OnboardingForms />
      </div>
    </section>
  );
}
