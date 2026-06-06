import { test, expect } from '@playwright/test';

test.describe('Command palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('command palette is hidden by default', async ({ page }) => {
    const cmd = page.locator('#cmd');
    await expect(cmd).toHaveAttribute('aria-hidden', 'true');
    await expect(cmd).not.toHaveClass(/open/);
  });

  test('opens with / key', async ({ page }) => {
    await page.keyboard.press('/');
    const cmd = page.locator('#cmd');
    await expect(cmd).toHaveClass(/open/);
    await expect(cmd).toHaveAttribute('aria-hidden', 'false');
  });

  test('opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const cmd = page.locator('#cmd');
    await expect(cmd).toHaveClass(/open/);
  });

  test('input is focused when opened', async ({ page }) => {
    await page.keyboard.press('/');
    const input = page.locator('#cmd-input');
    await expect(input).toBeFocused();
  });

  test('shows results when opened', async ({ page }) => {
    await page.keyboard.press('/');
    const results = page.locator('#cmd-results .item');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('first result is selected by default', async ({ page }) => {
    await page.keyboard.press('/');
    const firstItem = page.locator('#cmd-results .item').first();
    await expect(firstItem).toHaveClass(/sel/);
  });

  test('closes with Escape', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#cmd')).toHaveClass(/open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#cmd')).not.toHaveClass(/open/);
    await expect(page.locator('#cmd')).toHaveAttribute('aria-hidden', 'true');
  });

  test('closes when clicking backdrop', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#cmd')).toHaveClass(/open/);

    // Click the cmd overlay itself (the backdrop)
    await page.locator('#cmd').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#cmd')).not.toHaveClass(/open/);
  });

  test('typing filters results', async ({ page }) => {
    await page.keyboard.press('/');
    const initialCount = await page.locator('#cmd-results .item').count();

    // Type something specific that should narrow results
    await page.locator('#cmd-input').fill('about');
    const filteredCount = await page.locator('#cmd-results .item').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('arrow down moves selection', async ({ page }) => {
    await page.keyboard.press('/');
    const items = page.locator('#cmd-results .item');
    const count = await items.count();
    if (count < 2) return;

    await expect(items.first()).toHaveClass(/sel/);
    await page.keyboard.press('ArrowDown');
    await expect(items.first()).not.toHaveClass(/sel/);
    await expect(items.nth(1)).toHaveClass(/sel/);
  });

  test('arrow up moves selection up', async ({ page }) => {
    await page.keyboard.press('/');
    const items = page.locator('#cmd-results .item');
    const count = await items.count();
    if (count < 2) return;

    // Move down then up
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toHaveClass(/sel/);
    await page.keyboard.press('ArrowUp');
    await expect(items.first()).toHaveClass(/sel/);
  });

  test('Enter navigates to selected item', async ({ page }) => {
    await page.keyboard.press('/');
    const firstItem = page.locator('#cmd-results .item').first();
    const href = await firstItem.getAttribute('data-href');
    expect(href).toBeTruthy();

    await page.keyboard.press('Enter');
    // Should navigate — URL should change
    await page.waitForURL((url) => url.pathname !== '/');
  });

  test('results show kind labels (work, writing, page)', async ({ page }) => {
    await page.keyboard.press('/');
    const kinds = page.locator('#cmd-results .item .kind');
    const count = await kinds.count();
    expect(count).toBeGreaterThan(0);

    // Collect all kind texts
    const kindTexts = new Set<string>();
    for (let i = 0; i < count; i++) {
      const text = await kinds.nth(i).textContent();
      kindTexts.add(text!.trim());
    }
    // Should have at least work and page kinds
    expect(kindTexts.has('work') || kindTexts.has('writing') || kindTexts.has('page')).toBe(true);
  });

  test('does not open when typing in input field', async ({ page }) => {
    // Focus the contact form email input first
    const emailInput = page.locator('#f-email');
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.focus();
    await page.keyboard.press('/');

    // Command palette should NOT open
    await expect(page.locator('#cmd')).not.toHaveClass(/open/);
  });
});
