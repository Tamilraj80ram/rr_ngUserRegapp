import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('root path redirects to the register page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/register$/);
  });

  test('can navigate from register to login and back', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();

    // "Log in" only appears in the page's own switch link (nav says "Login"),
    // so this is unambiguous.
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    // "Register" appears both in the top nav and in this page's switch link,
    // so scope to the switch link specifically to avoid ambiguity.
    await page.locator('.switch').getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('top nav links work from either page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('navigation').getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
