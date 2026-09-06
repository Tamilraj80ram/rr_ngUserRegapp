import { expect, test } from '@playwright/test';
import { makeTestUser, registerUserViaApi } from './test-utils';

test.describe('Registration', () => {
  test('user can register and is redirected to the login page', async ({ page }) => {
    const user = makeTestUser('register-success');

    await page.goto('/register');

    await page.getByLabel('Full name').fill(user.fullName);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill(user.password);
    await page.getByLabel('Confirm password').fill(user.password);

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Account created!')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 5000 });
  });

  test('shows a conflict error when the email is already registered', async ({ page, request }) => {
    const user = makeTestUser('register-dupe');
    await registerUserViaApi(request, user);

    await page.goto('/register');
    await page.getByLabel('Full name').fill(user.fullName);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill(user.password);
    await page.getByLabel('Confirm password').fill(user.password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('An account with this email already exists.')).toBeVisible();
    // Should stay on the register page, not navigate away.
    await expect(page).toHaveURL(/\/register$/);
  });

  test('shows inline validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Full name').fill('J');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('123');
    await page.getByLabel('Confirm password').fill('456');

    // Blur the last field so all controls become "touched" and show errors.
    await page.getByLabel('Confirm password').blur();

    await expect(page.getByText('Full name must be at least 2 characters.')).toBeVisible();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();

    // The register button submits nothing useful while invalid; clicking it
    // should not navigate away from the register page.
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
