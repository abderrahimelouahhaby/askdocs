import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { getSession } from '@/server/lib/session';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignUpPage() {
  const session = await getSession();

  if (session) {
    redirect('/documents');
  }

  return <SignUpForm />;
}
