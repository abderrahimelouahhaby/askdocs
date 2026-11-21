import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!testDatabaseUrl || !testDatabaseUrl.includes('_test')) {
  throw new Error('Set DATABASE_URL_TEST to a database whose name contains _test');
}

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx prisma migrate deploy && npm run ${isCI ? 'start' : 'dev'}`,
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: testDatabaseUrl,
      BETTER_AUTH_URL: 'http://localhost:3000',
      AI_PROVIDER: 'fake',
    },
  },
});
