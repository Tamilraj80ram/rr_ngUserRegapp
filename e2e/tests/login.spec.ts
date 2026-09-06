import { expect, test } from '@playwright/test';
import { makeTestUser, registerUserViaApi } from './test-utils';

test.describe('Login', () => {
  test('user can log in with correct credentials', async ({ page, request }) => {
    const user = makeTestUser('login-success');
    await registerUserViaApi(request, user);

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText(`Welcome back, ${user.fullName}!`)).toBeVisible();
  });

  test('shows an error for the wrong password', async ({ page, request }) => {
    const user = makeTestUser('login-wrong-pw');
    await registerUserViaApi(request, user);

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill('totally-wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('shows an error for an email that was never registered', async ({ page }) => {
    const user = makeTestUser('login-unknown');

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('requires a valid email format before submitting', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('whatever123');
    await page.getByLabel('Password').blur();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });
});
