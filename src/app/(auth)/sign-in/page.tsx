import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form';
import { getSession } from '@/server/lib/session';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect('/documents');
  }

  return <SignInForm />;
}
