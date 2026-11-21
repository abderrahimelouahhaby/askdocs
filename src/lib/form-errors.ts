//a small helper that turns zod errors into one message per field
import type { ZodError } from 'zod';

export function getFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0]);

    if (!(field in errors)) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
