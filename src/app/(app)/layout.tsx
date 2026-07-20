import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

const tabs = [
  { href: '/home',     label: 'Home' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/shopping', label: 'Shopping' },
  { href: '/settings', label: 'Settings' },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen mx-auto max-w-md">
      <main className="safe-top px-5 pt-8 pb-32">{children}</main>
      <nav className="safe-bottom fixed bottom-0 inset-x-0 mx-auto max-w-md bg-surface border-t border-line">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => (
            <li key={t.href}>
              <Link href={t.href}
                className="flex items-center justify-center py-4 text-sm text-muted hover:text-ink active:text-ink">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
