import { test, expect } from '@playwright/test';

test.describe('Header navigation', () => {
  test('has all main nav links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');
    await expect(nav.locator('a[href="/#work"]')).toBeVisible();
    await expect(nav.locator('a[href="/#writing"]')).toBeVisible();
    await expect(nav.locator('a[href="/#about"]')).toBeVisible();
    await expect(nav.locator('a[href="/#contact"]')).toBeVisible();
  });

  test('brand link goes to homepage', async ({ page }) => {
    await page.goto('/');
    const brand = page.locator('a.brand');
    await expect(brand).toHaveAttribute('href', '/');
    await expect(brand).toContainText('abebrandsma');
  });

  test('clicking work nav scrolls to work section', async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav a[href="/#work"]').click();
    const workSection = page.locator('#work');
    await expect(workSection).toBeInViewport();
  });

  test('clicking about nav scrolls to about section', async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav a[href="/#about"]').click();
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeInViewport();
  });

  test('clicking contact nav scrolls to contact section', async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav a[href="/#contact"]').click();
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeInViewport();
  });
});

test.describe('Work section links', () => {
  test('work items have links to detail pages', async ({ page }) => {
    await page.goto('/');
    const workList = page.locator('#work-list');
    const firstLink = workList.locator('li a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/work\/.+/);
  });

  test('work detail page loads when navigated to', async ({ page }) => {
    await page.goto('/');
    const workLink = page.locator('#work-list li a').first();
    const href = await workLink.getAttribute('href');
    await page.goto(href!);
    // Should not be a 404
    await expect(page.locator('body')).not.toContainText('404');
  });
});

test.describe('Writing section links', () => {
  test('post items have links to detail pages', async ({ page }) => {
    await page.goto('/');
    const postList = page.locator('#post-list');
    const firstLink = postList.locator('li .row-title a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/posts\/.+/);
  });

  test('post detail page loads when navigated to', async ({ page }) => {
    await page.goto('/');
    const postLink = page.locator('#post-list li .row-title a').first();
    const href = await postLink.getAttribute('href');
    await page.goto(href!);
    await expect(page.locator('body')).not.toContainText('404');
  });
});
