import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('signin page renders correctly', async ({ page }) => {
    await page.goto('/signin');

    // Check sign-in button is visible
    const signInButton = page.getByRole('button', { name: /sign in with github/i });
    await expect(signInButton).toBeVisible();
  });

  test('clicking sign in redirects to GitHub OAuth', async ({ page }) => {
    await page.goto('/signin');

    // Click the sign-in button
    const signInButton = page.getByRole('button', { name: /sign in with github/i });
    await signInButton.click();

    // Wait for navigation to GitHub
    await page.waitForURL(/github\.com/, { timeout: 10000 });

    // Verify we're on GitHub's OAuth page
    expect(page.url()).toContain('github.com');
  });
});
