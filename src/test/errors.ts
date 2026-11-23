import type { AppError } from '../server/lib/errors';

export async function catchError(fn: () => unknown): Promise<AppError> {
  try {
    await fn();
  } catch (error) {
    return error as AppError;
  }

  throw new Error('Expected the function to throw');
}
