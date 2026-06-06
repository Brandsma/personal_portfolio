import { test, expect } from '@playwright/test';

test.describe('Post section tag filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('post filter buttons exist', async ({ page }) => {
    const tagbar = page.locator('#post-tagbar');
    await expect(tagbar.locator('button[data-filter="all"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="essay"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="research"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="ramble"]')).toBeVisible();
  });

  test('"all" is active by default', async ({ page }) => {
    const allBtn = page.locator('#post-tagbar button[data-filter="all"]');
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a tag hides non-matching posts', async ({ page }) => {
    const totalPosts = await page.locator('#post-list li').count();
    // Only test if there are posts
    if (totalPosts === 0) return;

    // Click essay filter
    await page.locator('#post-tagbar button[data-filter="essay"]').click();

    const visiblePosts = page.locator('#post-list li:not(.hidden)');
    const hiddenPosts = page.locator('#post-list li.hidden');

    const visibleCount = await visiblePosts.count();
    const hiddenCount = await hiddenPosts.count();

    // Unless all posts are essays, some should be hidden
    expect(visibleCount + hiddenCount).toBe(totalPosts);

    // All visible posts should have the essay tag
    for (let i = 0; i < visibleCount; i++) {
      const tag = await visiblePosts.nth(i).getAttribute('data-tag');
      expect(tag).toBe('essay');
    }
  });

  test('clicking "all" shows all posts again', async ({ page }) => {
    // Filter first
    await page.locator('#post-tagbar button[data-filter="essay"]').click();
    // Then show all
    await page.locator('#post-tagbar button[data-filter="all"]').click();

    const hiddenPosts = await page.locator('#post-list li.hidden').count();
    expect(hiddenPosts).toBe(0);
  });
});

test.describe('Post expand/collapse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('posts start collapsed (expand section hidden)', async ({ page }) => {
    const expandSections = page.locator('#post-list .row-expand');
    const count = await expandSections.count();
    if (count === 0) return;

    // All should have aria-hidden="true"
    for (let i = 0; i < count; i++) {
      await expect(expandSections.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('clicking a post title expands its excerpt', async ({ page }) => {
    const firstPost = page.locator('#post-list li').first();
    const titleLink = firstPost.locator('.row-title a');
    const expandSection = firstPost.locator('.row-expand');

    // Click to expand (first click expands, doesn't navigate)
    await titleLink.click();
    await expect(firstPost).toHaveClass(/open/);
    await expect(expandSection).toHaveAttribute('aria-hidden', 'false');
  });

  test('clicking another post collapses the previous one', async ({ page }) => {
    const posts = page.locator('#post-list li');
    const postCount = await posts.count();
    if (postCount < 2) return;

    const firstPost = posts.nth(0);
    const secondPost = posts.nth(1);

    // Expand first
    await firstPost.locator('.row-title a').click();
    await expect(firstPost).toHaveClass(/open/);

    // Click second
    await secondPost.locator('.row-title a').click();
    await expect(secondPost).toHaveClass(/open/);
    // First should no longer be open
    await expect(firstPost).not.toHaveClass(/open/);
  });

  test('expanded post shows excerpt text', async ({ page }) => {
    const firstPost = page.locator('#post-list li').first();
    const titleLink = firstPost.locator('.row-title a');
    const expandInner = firstPost.locator('.row-expand-inner');

    await titleLink.click();
    // Should have some text content
    const text = await expandInner.textContent();
    expect(text!.trim().length).toBeGreaterThan(0);
  });

  test('expanded post has "read the whole thing" link', async ({ page }) => {
    const firstPost = page.locator('#post-list li').first();
    await firstPost.locator('.row-title a').click();

    const readLink = firstPost.locator('.row-expand-inner a.read');
    await expect(readLink).toBeVisible();
    await expect(readLink).toContainText('read the whole thing');
  });
});
