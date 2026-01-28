import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('welcome screen renders correctly when not logged in', async ({ page }) => {
    await page.goto('/');

    // Check welcome heading is visible
    await expect(page.getByRole('heading', { name: /welcome to/i })).toBeVisible();
    await expect(page.getByText('Workbench')).toBeVisible();

    // Check sign-in button is visible
    const signInButton = page.getByRole('button', { name: /continue with github/i });
    await expect(signInButton).toBeVisible();

    // Check footer text
    await expect(page.getByText(/secure authentication powered by github/i)).toBeVisible();
  });

  test('clicking sign in redirects to GitHub OAuth', async ({ page }) => {
    await page.goto('/');

    // Click the sign-in button
    const signInButton = page.getByRole('button', { name: /continue with github/i });
    await signInButton.click();

    // Wait for navigation to GitHub
    await page.waitForURL(/github\.com/, { timeout: 10000 });

    // Verify we're on GitHub's OAuth page
    expect(page.url()).toContain('github.com');
  });

  test('navbar is not visible on welcome screen', async ({ page }) => {
    await page.goto('/');

    // Navbar should not be visible
    await expect(page.getByRole('navigation')).not.toBeVisible();
  });

  test('logo is displayed on welcome screen', async ({ page }) => {
    await page.goto('/');

    // Logo "W" should be visible
    await expect(page.locator('text=W').first()).toBeVisible();
  });
});

test.describe('Authenticated User', () => {
  // These tests would require mocking authentication state
  // or using a test account. For now, we'll skip the actual login
  // and just verify the expected behavior.

  test.skip('dashboard is shown when logged in', async ({ page }) => {
    // This test requires authentication setup
    await page.goto('/');

    // Should see navbar
    await expect(page.getByRole('navigation')).toBeVisible();

    // Should see welcome message
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test.skip('user can sign out', async ({ page }) => {
    // This test requires authentication setup
    await page.goto('/');

    // Click avatar to open dropdown
    await page.getByRole('button').first().click();

    // Click sign out
    await page.getByText('Sign Out').click();

    // Should redirect to welcome screen
    await expect(page.getByRole('heading', { name: /welcome to/i })).toBeVisible();
  });
});
