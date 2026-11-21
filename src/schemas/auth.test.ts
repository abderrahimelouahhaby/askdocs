import { describe, expect, it } from 'vitest';
import { PASSWORD_MAX_LENGTH, signInSchema, signUpSchema } from './auth';

const validSignUp = {
  name: 'Ana Dahmani',
  email: 'ana@example.com',
  password: 'correct-horse-battery',
};

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it('trims and lowercases the email', () => {
    const result = signUpSchema.parse({ ...validSignUp, email: '  Ana@Example.COM ' });
    expect(result.email).toBe('ana@example.com');
  });

  it('rejects an invalid email', () => {
    expect(signUpSchema.safeParse({ ...validSignUp, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a short password', () => {
    expect(signUpSchema.safeParse({ ...validSignUp, password: 'short' }).success).toBe(false);
  });

  it('rejects a password longer than the maximum', () => {
    const password = 'a'.repeat(PASSWORD_MAX_LENGTH + 1);
    expect(signUpSchema.safeParse({ ...validSignUp, password }).success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('requires a password', () => {
    expect(signInSchema.safeParse({ email: 'ana@example.com', password: '' }).success).toBe(false);
  });
});
