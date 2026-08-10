import { test, expect, type Page } from '@playwright/test';

/**
 * Two kinds of page here, with deliberately different snapshot strategies:
 *
 *  - Index pages (homepage, archives) are mostly lists that grow every time a
 *    post or project is published. A full-page baseline on those goes stale on
 *    publish, which trains everyone to re-record baselines without reading the
 *    diff. Those are clipped to the stable masthead at the top of the page.
 *  - Detail pages (a post, a work item) render fixed content, so they keep
 *    full-page coverage — that is where prose, headings, code and image
 *    styling actually get checked.
 */

/**
 * Wait for the `.reveal` entrance animations to finish.
 *
 * Playwright freezes animations while it captures, but `boundingBox()` reads
 * live layout: `.reveal` starts 6px low, so measuring mid-animation yields a
 * clip height that drifts run to run. Infinite animations (the status-line
 * pulse) never settle, so they are excluded rather than awaited.
 */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
}

/**
 * Regions whose pixels are not a function of the stylesheet, so comparing them
 * only produces noise. `#clock` is a live Amsterdam wall clock in the header of
 * every page — it differs between any two runs. It went unnoticed until now
 * because it was a rounding error against a full-page shot; against a clipped
 * one it is not.
 */
function noise(page: Page, ...extra: string[]) {
  return ['#clock', ...extra].map((s) => page.locator(s));
}

/**
 * A clip rect covering the page from the very top through the bottom of
 * `anchor` — i.e. the header plus whatever masthead the page leads with,
 * and nothing of the content list below it.
 */
async function topThrough(page: Page, anchor: string) {
  const el = page.locator(anchor);
  await el.waitFor();
  const box = await el.boundingBox();
  if (!box) throw new Error(`cannot measure "${anchor}": no bounding box`);
  return {
    x: 0,
    y: 0,
    width: page.viewportSize()!.width,
    height: Math.ceil(box.y + box.height),
  };
}

test.describe('Visual Regression', () => {
  test('homepage desktop', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    // header + hero; the work/writing lists and everything under them are cut off
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      clip: await topThrough(page, '.hero'),
      mask: noise(page),
      maxDiffPixelRatio: 0.02,
    });
  });

  test('homepage mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await settle(page);
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      clip: await topThrough(page, '.hero'),
      mask: noise(page),
      maxDiffPixelRatio: 0.02,
    });
  });

  test('blog post page', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai');
    await settle(page);
    await expect(page).toHaveScreenshot('post-incentives-of-ai.png', {
      fullPage: true,
      mask: noise(page),
      maxDiffPixelRatio: 0.02,
    });
  });

  test('all writing page', async ({ page }) => {
    await page.goto('/posts/');
    await settle(page);
    // crumbs, heading, search and tagbar; the row list below is content that grows
    await expect(page).toHaveScreenshot('posts-index.png', {
      clip: await topThrough(page, '.archive .tagbar'),
      // .archive-count reads "N of N", so it changes with every new post
      mask: noise(page, '.archive-count'),
      maxDiffPixelRatio: 0.02,
    });
  });

  test('all projects page', async ({ page }) => {
    await page.goto('/work/');
    await settle(page);
    await expect(page).toHaveScreenshot('work-index.png', {
      clip: await topThrough(page, '.archive .tagbar'),
      mask: noise(page, '.archive-count'),
      maxDiffPixelRatio: 0.02,
    });
  });

  test('work page', async ({ page }) => {
    await page.goto('/work/dss-handwriting');
    await settle(page);
    await expect(page).toHaveScreenshot('work-dss-handwriting.png', {
      fullPage: true,
      mask: noise(page),
      maxDiffPixelRatio: 0.02,
    });
  });
});
