import { test, expect } from '@playwright/test';

test.describe('All writing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/posts/');
  });

  test('lists every post with a matching count', async ({ page }) => {
    const rows = page.locator('.archive ol.list > li');
    const total = await rows.count();
    expect(total).toBeGreaterThanOrEqual(1);
    await expect(page.locator('.archive-count')).toHaveText(`${total} of ${total}`);
  });

  test('has a search input and a dynamic tagbar', async ({ page }) => {
    await expect(page.locator('.archive-search')).toBeVisible();
    const tagbar = page.locator('.archive .tagbar');
    await expect(tagbar.locator('button[data-filter="all"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(tagbar.locator('button[data-filter="essay"]')).toBeVisible();
  });

  test('search narrows the list and updates the count', async ({ page }) => {
    const total = await page.locator('.archive ol.list > li').count();
    await page.fill('.archive-search', 'listen friend');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText('listen');
    await expect(page.locator('.archive-count')).toHaveText(`1 of ${total}`);
  });

  test('no matches shows the empty state and reset restores everything', async ({ page }) => {
    const total = await page.locator('.archive ol.list > li').count();
    await page.fill('.archive-search', 'zzzzqqqq');
    await expect(page.locator('.archive ol.list > li:not(.hidden)')).toHaveCount(0);
    const empty = page.locator('.archive-empty');
    await expect(empty).toBeVisible();

    await page.click('.archive-reset');
    await expect(page.locator('.archive ol.list > li:not(.hidden)')).toHaveCount(total);
    await expect(empty).toBeHidden();
  });

  test('tag filter hides non-matching items', async ({ page }) => {
    await page.click('.archive .tagbar button[data-filter="essay"]');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    const n = await visible.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(visible.nth(i)).toHaveAttribute('data-tag', 'essay');
    }
  });

  test('filters are reflected in the URL and restored from it', async ({ page }) => {
    await page.fill('.archive-search', 'listen');
    await expect(page).toHaveURL(/q=listen/);

    await page.goto('/posts/?tag=essay&q=listen');
    await expect(page.locator('.archive-search')).toHaveValue('listen');
    await expect(page.locator('.archive .tagbar button[data-filter="essay"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('rows link to post detail pages', async ({ page }) => {
    const firstLink = page.locator('.archive ol.list a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/posts\/.+/);
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('h1.post-title')).toBeVisible();
  });
});
