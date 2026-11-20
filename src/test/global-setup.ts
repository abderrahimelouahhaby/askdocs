import 'dotenv/config';
import { execSync } from 'node:child_process';

export default function setup() {
  const url = process.env.DATABASE_URL_TEST;

  if (!url) {
    throw new Error('DATABASE_URL_TEST is not set');
  }
  if (!url.includes('_test')) {
    throw new Error('DATABASE_URL_TEST must point to a database whose name contains _test');
  }

  process.env.DATABASE_URL = url;
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
