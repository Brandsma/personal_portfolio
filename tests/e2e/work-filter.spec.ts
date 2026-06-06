import { test, expect } from '@playwright/test';

test.describe('Work section tag filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all filter buttons exist', async ({ page }) => {
    const tagbar = page.locator('#work-tagbar');
    await expect(tagbar.locator('button[data-filter="all"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="research"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="engineering"]')).toBeVisible();
    await expect(tagbar.locator('button[data-filter="side project"]')).toBeVisible();
  });

  test('"all" button is pressed by default', async ({ page }) => {
    const allBtn = page.locator('#work-tagbar button[data-filter="all"]');
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a tag filter sets it as pressed', async ({ page }) => {
    const researchBtn = page.locator('#work-tagbar button[data-filter="research"]');
    await researchBtn.click();
    await expect(researchBtn).toHaveAttribute('aria-pressed', 'true');

    // "all" should no longer be pressed
    const allBtn = page.locator('#work-tagbar button[data-filter="all"]');
    await expect(allBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking "research" hides non-research items', async ({ page }) => {
    const researchBtn = page.locator('#work-tagbar button[data-filter="research"]');
    await researchBtn.click();

    const visibleItems = page.locator('#work-list li:not(.hidden)');
    const allVisible = await visibleItems.count();
    expect(allVisible).toBeGreaterThan(0);

    // All visible items should have data-tag="research"
    for (let i = 0; i < allVisible; i++) {
      const tag = await visibleItems.nth(i).getAttribute('data-tag');
      expect(tag).toBe('research');
    }
  });

  test('clicking "all" shows everything again', async ({ page }) => {
    // First filter to research
    await page.locator('#work-tagbar button[data-filter="research"]').click();
    const hiddenAfterFilter = await page.locator('#work-list li.hidden').count();
    expect(hiddenAfterFilter).toBeGreaterThanOrEqual(0);

    // Then click all
    await page.locator('#work-tagbar button[data-filter="all"]').click();
    const hiddenAfterAll = await page.locator('#work-list li.hidden').count();
    expect(hiddenAfterAll).toBe(0);
  });

  test('work count updates when filtering', async ({ page }) => {
    const countEl = page.locator('#work-count');
    const totalText = await countEl.textContent();
    // Should show "N of N" initially
    expect(totalText).toMatch(/\d+ of \d+/);

    const totalMatch = totalText!.match(/(\d+) of (\d+)/);
    const total = parseInt(totalMatch![2]);

    // Filter to research
    await page.locator('#work-tagbar button[data-filter="research"]').click();
    const filteredText = await countEl.textContent();
    const filteredMatch = filteredText!.match(/(\d+) of (\d+)/);
    const visible = parseInt(filteredMatch![1]);
    const stillTotal = parseInt(filteredMatch![2]);

    expect(stillTotal).toBe(total); // total doesn't change
    expect(visible).toBeLessThanOrEqual(total);
  });

  test('only one filter button can be active at a time', async ({ page }) => {
    await page.locator('#work-tagbar button[data-filter="research"]').click();
    await page.locator('#work-tagbar button[data-filter="engineering"]').click();

    const pressedButtons = page.locator('#work-tagbar button[aria-pressed="true"]');
    await expect(pressedButtons).toHaveCount(1);
    await expect(pressedButtons).toHaveAttribute('data-filter', 'engineering');
  });
});
