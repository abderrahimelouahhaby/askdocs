import { expect, test } from '@playwright/test';
import { PASSWORD, logOut, signUp, uniqueEmail } from './helpers';

test('a visitor can sign up, log out and log back in', async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, email);
  await logOut(page);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/documents/);
});

test('private pages redirect to sign in when logged out', async ({ page }) => {
  await page.goto('/documents');
  await expect(page).toHaveURL(/sign-in/);

  await page.goto('/chat');
  await expect(page).toHaveURL(/sign-in/);
});

test('a wrong password shows an error and keeps the user out', async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, email);
  await logOut(page);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('wrong-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await expect(page).toHaveURL(/sign-in/);
});
