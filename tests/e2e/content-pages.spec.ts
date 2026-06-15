import { test, expect } from '@playwright/test';

test.describe('Work detail pages', () => {
  test('/work/dss-handwriting renders correctly', async ({ page }) => {
    await page.goto('/work/dss-handwriting');
    await expect(page.locator('body')).not.toContainText('404');
    // Should contain the title
    const content = await page.textContent('body');
    expect(content!.toLowerCase()).toContain('dead sea scrolls');
  });

  test('/work/graphrag renders correctly', async ({ page }) => {
    await page.goto('/work/graphrag');
    await expect(page.locator('body')).not.toContainText('404');
    const content = await page.textContent('body');
    expect(content!.toLowerCase()).toContain('graph');
  });

  test('/work/invertible-flows renders correctly', async ({ page }) => {
    await page.goto('/work/invertible-flows');
    await expect(page.locator('body')).not.toContainText('404');
    const content = await page.textContent('body');
    expect(content!.toLowerCase()).toContain('invertible');
  });

  test('/work/gamejam-projects renders correctly', async ({ page }) => {
    await page.goto('/work/gamejam-projects');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('work pages have header navigation', async ({ page }) => {
    await page.goto('/work/dss-handwriting');
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a[href="/#work"]')).toBeVisible();
  });

  test('work pages have brand link back to home', async ({ page }) => {
    await page.goto('/work/dss-handwriting');
    const brand = page.locator('a.brand');
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute('href', '/');
  });
});

test.describe('Post detail pages', () => {
  test('/posts/incentives-of-ai renders', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai');
    await expect(page.locator('body')).not.toContainText('404');
    const content = await page.textContent('body');
    expect(content!.length).toBeGreaterThan(100);
    expect(content!.toLowerCase()).toContain('ai');
  });

  test('post pages have header navigation', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai');
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();
  });

  test('post pages have proper HTML structure', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai');
    // Should have html lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // Should have meta viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('nonexistent post returns 404', async ({ page }) => {
    const response = await page.goto('/posts/nonexistent-post-that-does-not-exist');
    expect(response!.status()).toBe(404);
  });

  test('nonexistent work returns 404', async ({ page }) => {
    const response = await page.goto('/work/nonexistent-work-item-xyz');
    expect(response!.status()).toBe(404);
  });
});
