/**
 * Comprehensive Gap Consistency Tests
 *
 * Tests gap consistency across all pages at multiple viewports.
 * Uses the shared gap-utils for consistent detection.
 *
 * Expected gap: 12px (from panda.config.ts spacing.layout token)
 */

import { test, expect } from '@playwright/test';
import {
    analyzeGaps,
    logGapAnalysis,
    getFirstBlogSlug,
    VIEWPORTS,
    BASE_URL,
    EXPECTED_GAP,
    ViewportName,
} from './utils/gap-utils';

// Test configuration
const TEST_TIMEOUT = 30000;
const LOAD_WAIT = 1500;

// Viewports to test for each page
const TEST_VIEWPORTS: ViewportName[] = ['mobile', 'tablet', 'desktop', 'desktopLarge'];

// Pages to test
const PAGES = [
    { name: 'Root', path: '/' },
    { name: 'Search', path: '/Search' },
];

// ============================================================================
// ROOT PAGE TESTS
// ============================================================================

test.describe('Root Page Gap Consistency', () => {
    for (const viewportName of TEST_VIEWPORTS) {
        const viewport = VIEWPORTS[viewportName];

        test(`gaps should be consistent at ${viewportName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            test.setTimeout(TEST_TIMEOUT);

            await page.setViewportSize(viewport);
            await page.goto(`${BASE_URL}/`);
            await page.waitForTimeout(LOAD_WAIT);

            const analysis = await analyzeGaps(page);
            logGapAnalysis(analysis);

            // Verify gaps are consistent
            expect(
                analysis.isConsistent,
                `Root page has inconsistent gaps at ${viewportName}: ${JSON.stringify(analysis.inconsistentGaps)}`
            ).toBe(true);

            // Verify most common gap is close to expected (12px)
            if (analysis.mostCommonGap !== null) {
                expect(
                    Math.abs(analysis.mostCommonGap - EXPECTED_GAP),
                    `Root page gap (${analysis.mostCommonGap}px) deviates from expected (${EXPECTED_GAP}px)`
                ).toBeLessThanOrEqual(2);
            }
        });
    }
});

// ============================================================================
// SEARCH PAGE TESTS
// ============================================================================

test.describe('Search Page Gap Consistency', () => {
    for (const viewportName of TEST_VIEWPORTS) {
        const viewport = VIEWPORTS[viewportName];

        test(`gaps should be consistent at ${viewportName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            test.setTimeout(TEST_TIMEOUT);

            await page.setViewportSize(viewport);
            await page.goto(`${BASE_URL}/Search`);
            await page.waitForTimeout(LOAD_WAIT);

            const analysis = await analyzeGaps(page);
            logGapAnalysis(analysis);

            // Search page may have different gap semantics (blog cards have mb:5)
            // So we check for consistency among detected gaps
            if (analysis.gaps.length > 1) {
                expect(
                    analysis.isConsistent,
                    `Search page has inconsistent gaps at ${viewportName}: ${JSON.stringify(analysis.inconsistentGaps)}`
                ).toBe(true);
            } else {
                console.log(`Only ${analysis.gaps.length} gap(s) found on Search page - skipping consistency check`);
            }
        });
    }
});

// ============================================================================
// BLOG PAGE TESTS
// ============================================================================

test.describe('Blog Page Gap Consistency', () => {
    let blogSlug: string | null = null;

    test.beforeAll(async ({ browser }) => {
        // Get a valid blog slug before running tests
        const page = await browser.newPage();
        blogSlug = await getFirstBlogSlug(page);
        await page.close();

        if (!blogSlug) {
            console.log('⚠️ No blog posts found - blog page tests will be skipped');
        }
    });

    for (const viewportName of TEST_VIEWPORTS) {
        const viewport = VIEWPORTS[viewportName];

        test(`gaps should be consistent at ${viewportName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            test.setTimeout(TEST_TIMEOUT);

            // Skip if no blog posts available
            test.skip(!blogSlug, 'No blog posts available for testing');

            await page.setViewportSize(viewport);
            await page.goto(`${BASE_URL}/Blogs/${blogSlug}`);
            await page.waitForTimeout(LOAD_WAIT);

            const analysis = await analyzeGaps(page);
            logGapAnalysis(analysis);

            // Blog pages typically have a single card with content
            // Check that any gaps found are consistent
            if (analysis.gaps.length > 0) {
                expect(
                    analysis.isConsistent,
                    `Blog page has inconsistent gaps at ${viewportName}: ${JSON.stringify(analysis.inconsistentGaps)}`
                ).toBe(true);
            } else {
                console.log(`No gaps between cards on Blog page at ${viewportName} - expected for single-card layout`);
            }
        });
    }
});

// ============================================================================
// CROSS-PAGE CONSISTENCY TEST
// ============================================================================

test.describe('Cross-Page Gap Consistency', () => {
    test('all pages should use the same base gap value', async ({ page }) => {
        test.setTimeout(60000);

        const gapsBySite: { page: string; gaps: number[] }[] = [];

        // Test root page at desktop
        await page.setViewportSize(VIEWPORTS.desktopLarge);
        await page.goto(`${BASE_URL}/`);
        await page.waitForTimeout(LOAD_WAIT);
        const rootAnalysis = await analyzeGaps(page);
        gapsBySite.push({ page: 'Root', gaps: rootAnalysis.gaps.map(g => g.gap) });

        // Test Search page
        await page.goto(`${BASE_URL}/Search`);
        await page.waitForTimeout(LOAD_WAIT);
        const searchAnalysis = await analyzeGaps(page);
        gapsBySite.push({ page: 'Search', gaps: searchAnalysis.gaps.map(g => g.gap) });

        // Log results
        console.log('\n=== Cross-Page Gap Summary ===');
        gapsBySite.forEach(({ page, gaps }) => {
            console.log(`${page}: ${gaps.length > 0 ? gaps.join(', ') + 'px' : 'no gaps detected'}`);
        });

        // All detected gaps should be close to 12px (the layout token)
        for (const { page: pageName, gaps } of gapsBySite) {
            for (const gap of gaps) {
                expect(
                    Math.abs(gap - EXPECTED_GAP),
                    `${pageName} has gap ${gap}px, expected ~${EXPECTED_GAP}px`
                ).toBeLessThanOrEqual(2);
            }
        }
    });
});
