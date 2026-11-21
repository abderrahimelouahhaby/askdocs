import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must have at least 2 characters')
    .max(80, 'Name is too long'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must have at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, 'Password is too long'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
