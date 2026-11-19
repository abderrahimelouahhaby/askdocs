import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    AI_PROVIDER: z.enum(['gemini', 'fake']).default('fake'),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  })
  .refine((env) => env.AI_PROVIDER !== 'gemini' || Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY), {
    message: 'GOOGLE_GENERATIVE_AI_API_KEY is required when AI_PROVIDER is gemini',
    path: ['GOOGLE_GENERATIVE_AI_API_KEY'],
  });

export function parseEnv(source: Record<string, string | undefined>) {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables: ${problems}`);
  }

  return result.data;
}
