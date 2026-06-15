import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('portfolio_theme'));
    await page.reload();
  });

  test('theme toggle button exists', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-label', 'toggle theme');
  });

  test('clicking toggle changes data-theme attribute', async ({ page }) => {
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    await page.locator('#theme-toggle').click();

    const newTheme = await html.getAttribute('data-theme');
    // Theme should have changed
    expect(newTheme).not.toBe(initialTheme);
    expect(['dark', 'light']).toContain(newTheme);
  });

  test('clicking toggle twice returns to original state', async ({ page }) => {
    const html = page.locator('html');
    // An unset data-theme renders as the default 'light' theme (see :root in
    // global.css — there is no prefers-color-scheme), so normalise null →
    // 'light' to compare the effective theme rather than the raw attribute.
    const initialTheme = (await html.getAttribute('data-theme')) ?? 'light';

    await page.locator('#theme-toggle').click();
    await page.locator('#theme-toggle').click();

    const finalTheme = (await html.getAttribute('data-theme')) ?? 'light';
    expect(finalTheme).toBe(initialTheme);
  });

  test('theme preference persists in localStorage', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    const theme = await page.evaluate(() => localStorage.getItem('portfolio_theme'));
    expect(['dark', 'light']).toContain(theme);
  });

  test('theme persists after page reload', async ({ page }) => {
    // Set theme to dark
    await page.evaluate(() => localStorage.setItem('portfolio_theme', 'dark'));
    await page.reload();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('theme persists as light after reload', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('portfolio_theme', 'light'));
    await page.reload();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
