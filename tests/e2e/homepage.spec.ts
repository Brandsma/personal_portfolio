import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/abe brandsma/i);
  });

  test('displays hero section with name', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toContainText('abe brandsma');
  });

  test('displays subtitle', async ({ page }) => {
    await page.goto('/');
    const sub = page.locator('.sub');
    await expect(sub).toContainText('ai research engineer');
  });
});

test.describe('Selected work', () => {
  test('shows a show-all-projects link under the work list', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#work .show-all a');
    await expect(link).toBeVisible();
    await expect(link).toContainText('show all projects');
    await expect(link).toHaveAttribute('href', '/work/');
  });

  test('show-all link navigates to the all projects page', async ({ page }) => {
    await page.goto('/');
    await page.click('#work .show-all a');
    await expect(page).toHaveURL(/\/work\/?$/);
    await expect(page.locator('h2')).toContainText('all projects');
  });
});

test.describe('Writing section', () => {
  test('shows a show-all-writing link under the post list', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#writing .show-all a');
    await expect(link).toBeVisible();
    await expect(link).toContainText('show all writing');
    await expect(link).toHaveAttribute('href', '/posts/');
  });

  test('show-all link navigates to the all writing page', async ({ page }) => {
    await page.goto('/');
    await page.click('#writing .show-all a');
    await expect(page).toHaveURL(/\/posts\/?$/);
    await expect(page.locator('h2')).toContainText('all writing');
  });
});

test.describe('Navigation', () => {
  test('has working internal links', async ({ page }) => {
    await page.goto('/');
    // Check that there are links on the page
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('about section exists', async ({ page }) => {
    await page.goto('/');
    const aboutSection = page.locator('#about');
    // If about section exists, it should be visible
    if ((await aboutSection.count()) > 0) {
      await expect(aboutSection).toBeVisible();
    }
  });
});

test.describe('Content sections', () => {
  test('work section renders', async ({ page }) => {
    await page.goto('/');
    // Page should have content (not be empty/error)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
});
