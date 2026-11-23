import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'correct-horse-battery';

export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1000000)}@example.com`;
}

export async function signUp(page: Page, email: string) {
  await page.goto('/sign-up');
  await page.getByLabel('Name').fill('Test User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/documents/);
}

export async function logOut(page: Page) {
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/sign-in/);
}
