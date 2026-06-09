import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (axe-core)', () => {
  test('homepage has no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (criticalSerious.length > 0) {
      console.log('\n=== Critical/Serious Violations on / ===');
      for (const v of criticalSerious) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    - ${node.html}`);
        }
      }
    }

    // Log minor/moderate for awareness without failing
    const minorModerate = results.violations.filter(
      (v) => v.impact === 'moderate' || v.impact === 'minor',
    );
    if (minorModerate.length > 0) {
      console.log('\n=== Minor/Moderate Violations on / (informational) ===');
      for (const v of minorModerate) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
      }
    }

    expect(criticalSerious).toEqual([]);
  });

  test('blog post page has no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/posts/incentives-of-ai/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (criticalSerious.length > 0) {
      console.log('\n=== Critical/Serious Violations on /posts/incentives-of-ai/ ===');
      for (const v of criticalSerious) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    - ${node.html}`);
        }
      }
    }

    const minorModerate = results.violations.filter(
      (v) => v.impact === 'moderate' || v.impact === 'minor',
    );
    if (minorModerate.length > 0) {
      console.log(
        '\n=== Minor/Moderate Violations on /posts/incentives-of-ai/ (informational) ===',
      );
      for (const v of minorModerate) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
      }
    }

    expect(criticalSerious).toEqual([]);
  });

  test('work page has no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/work/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (criticalSerious.length > 0) {
      console.log('\n=== Critical/Serious Violations on /work/ ===');
      for (const v of criticalSerious) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        for (const node of v.nodes) {
          console.log(`    - ${node.html}`);
        }
      }
    }

    const minorModerate = results.violations.filter(
      (v) => v.impact === 'moderate' || v.impact === 'minor',
    );
    if (minorModerate.length > 0) {
      console.log('\n=== Minor/Moderate Violations on /work/ (informational) ===');
      for (const v of minorModerate) {
        console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
      }
    }

    expect(criticalSerious).toEqual([]);
  });
});
