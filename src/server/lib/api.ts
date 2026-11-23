import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { getSession } from './session';

export async function requireApiSession() {
  const session = await getSession();

  if (!session) {
    throw new AppError(401, 'You must be signed in');
  }

  return session;
}

export async function handleRoute(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Unexpected error in a route handler', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
