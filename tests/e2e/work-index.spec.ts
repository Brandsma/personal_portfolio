import { test, expect } from '@playwright/test';

test.describe('All projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/');
  });

  test('lists every project with a matching count', async ({ page }) => {
    const rows = page.locator('.archive ol.list > li');
    const total = await rows.count();
    expect(total).toBeGreaterThanOrEqual(5);
    await expect(page.locator('.archive-count')).toHaveText(`${total} of ${total}`);
  });

  test('has a search input and a dynamic tagbar', async ({ page }) => {
    await expect(page.locator('.archive-search')).toBeVisible();
    const tagbar = page.locator('.archive .tagbar');
    await expect(tagbar.locator('button[data-filter="all"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // tags are derived from content, so at least these exist today
    await expect(tagbar.locator('button[data-filter="research"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="engineering"]')).toBeVisible();
  });

  test('substring search narrows the list and updates the count', async ({ page }) => {
    const total = await page.locator('.archive ol.list > li').count();
    await page.fill('.archive-search', 'pixel');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText('tether-art');
    await expect(page.locator('.archive-count')).toHaveText(`1 of ${total}`);
  });

  test('best match is reordered to the top', async ({ page }) => {
    // "tether" also subsequence-matches other haystacks; the literal hit must rank first
    await page.fill('.archive-search', 'tether');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    expect(await visible.count()).toBeGreaterThanOrEqual(1);
    await expect(visible.first()).toContainText('tether-art');
  });

  test('fuzzy subsequence search matches (gjam → game jam)', async ({ page }) => {
    await page.fill('.archive-search', 'gjam');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText(/game jam/i);
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
    await expect(page.locator('.archive-search')).toHaveValue('');
  });

  test('tag filter hides non-matching items', async ({ page }) => {
    await page.click('.archive .tagbar button[data-filter="research"]');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    const n = await visible.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(visible.nth(i)).toHaveAttribute('data-tag', 'research');
    }
  });

  test('search and tag filter combine (AND)', async ({ page }) => {
    await page.click('.archive .tagbar button[data-filter="research"]');
    await page.fill('.archive-search', 'flows');
    const visible = page.locator('.archive ol.list > li:not(.hidden)');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText('invertible');
  });

  test('clearing the search restores all items', async ({ page }) => {
    const total = await page.locator('.archive ol.list > li').count();
    await page.fill('.archive-search', 'pixel');
    await expect(page.locator('.archive ol.list > li:not(.hidden)')).toHaveCount(1);
    await page.fill('.archive-search', '');
    await expect(page.locator('.archive ol.list > li:not(.hidden)')).toHaveCount(total);
  });

  test('filters are reflected in the URL', async ({ page }) => {
    await page.fill('.archive-search', 'tether');
    await expect(page).toHaveURL(/q=tether/);
    await page.click('.archive .tagbar button[data-filter="engineering"]');
    await expect(page).toHaveURL(/tag=engineering/);
  });

  test('initial state is read from URL params', async ({ page }) => {
    await page.goto('/work/?tag=engineering&q=tether');
    await expect(page.locator('.archive-search')).toHaveValue('tether');
    await expect(
      page.locator('.archive .tagbar button[data-filter="engineering"]'),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.archive ol.list > li:not(.hidden)')).toHaveCount(1);
  });

  test('rows link to project detail pages', async ({ page }) => {
    const firstLink = page.locator('.archive ol.list a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/work\/.+/);
    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('h1.work-title')).toBeVisible();
  });
});
