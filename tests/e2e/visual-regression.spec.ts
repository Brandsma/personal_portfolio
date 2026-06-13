import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('homepage mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('blog post page', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('post-incentives-of-ai.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('work page', async ({ page }) => {
    await page.goto('/work/dss-handwriting');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('work-dss-handwriting.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
