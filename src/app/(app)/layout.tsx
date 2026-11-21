import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/auth/logout-button';
import { requireSession } from '@/server/lib/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/documents">Documents</Link>
            <Link href="/chat">Chat</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
