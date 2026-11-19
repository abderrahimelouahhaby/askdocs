import { describe, expect, it } from 'vitest';
import { parseEnv } from './env.schema';

const validEnv = {
  DATABASE_URL: 'postgresql://askdocs:askdocs@localhost:5432/askdocs',
  BETTER_AUTH_SECRET: 'a'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  AI_PROVIDER: 'fake',
};

describe('parseEnv', () => {
  it('accepts a valid environment', () => {
    expect(parseEnv(validEnv).AI_PROVIDER).toBe('fake');
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });

  it('throws when the secret is too short', () => {
    expect(() => parseEnv({ ...validEnv, BETTER_AUTH_SECRET: 'short' })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
  });

  it('asks for the Google key when AI_PROVIDER is gemini', () => {
    expect(() => parseEnv({ ...validEnv, AI_PROVIDER: 'gemini' })).toThrow(
      /GOOGLE_GENERATIVE_AI_API_KEY/,
    );
  });
});
