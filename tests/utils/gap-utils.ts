/**
 * Shared gap detection utilities for Playwright tests.
 * Provides consistent gap analysis across all pages.
 */

import { Page } from '@playwright/test';

/** Expected gap between cards (matches panda spacing.layout = 12px) */
export const EXPECTED_GAP = 12;

/** Tolerance for sub-pixel rendering differences */
export const GAP_TOLERANCE = 2;

/** Standard port for dev server */
export const PORT = 3000;

/** Base URL for tests */
export const BASE_URL = `http://localhost:${PORT}`;

/** Standard viewport configurations */
export const VIEWPORTS = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
    desktopLarge: { width: 1280, height: 800 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

/** Card detection result */
export interface CardInfo {
    rect: {
        top: number;
        bottom: number;
        left: number;
        right: number;
        width: number;
        height: number;
    };
    isNavbar: boolean;
    classList: string[];
}

/** Gap measurement between two cards */
export interface GapInfo {
    gap: number;
    between: string;
    card1Classes: string[];
    card2Classes: string[];
}

/** Full gap analysis result */
export interface GapAnalysis {
    pageUrl: string;
    viewport: { width: number; height: number };
    totalCards: number;
    gaps: GapInfo[];
    uniqueGaps: number[];
    mostCommonGap: number | null;
    inconsistentGaps: GapInfo[];
    isConsistent: boolean;
}

/**
 * Analyze gaps between card elements on a page.
 * Cards are identified by borderRadius: 10px and black background.
 */
export async function analyzeGaps(page: Page): Promise<GapAnalysis> {
    const viewport = page.viewportSize() || { width: 0, height: 0 };
    const pageUrl = page.url();

    const analysis = await page.evaluate((expectedGap) => {
        const allElements = document.querySelectorAll('*');
        const cards: { rect: DOMRect; isNavbar: boolean; classList: string[] }[] = [];

        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const isCard = style.borderRadius === '10px' &&
                (style.backgroundColor === 'rgb(0, 0, 0)' || style.backgroundColor === 'rgba(0, 0, 0, 1)');

            if (isCard) {
                const rect = el.getBoundingClientRect();
                // Filter out very small elements
                if (rect.width > 50 && rect.height > 30) {
                    const classList = [...el.classList];
                    const isNavbar = classList.some(c =>
                        c.includes('navbar') || c.includes('layerStyle_navbar')
                    );
                    cards.push({ rect, isNavbar, classList });
                }
            }
        });

        // Sort by vertical position
        cards.sort((a, b) => a.rect.top - b.rect.top);

        // Calculate gaps between vertically adjacent cards
        const gaps: { gap: number; between: string; card1Classes: string[]; card2Classes: string[] }[] = [];
        for (let i = 0; i < cards.length - 1; i++) {
            const current = cards[i];
            const next = cards[i + 1];

            // Skip navbar comparisons
            if (current.isNavbar || next.isNavbar) continue;

            // Check for horizontal overlap (cards must be in same column)
            const horizontalOverlap = !(current.rect.right < next.rect.left || next.rect.right < current.rect.left);

            if (horizontalOverlap && next.rect.top > current.rect.bottom) {
                gaps.push({
                    gap: Math.round(next.rect.top - current.rect.bottom),
                    between: `card ${i} → card ${i + 1}`,
                    card1Classes: current.classList,
                    card2Classes: next.classList,
                });
            }
        }

        // Analyze gap consistency
        const gapValues = gaps.map(g => g.gap);
        const uniqueGaps = [...new Set(gapValues)];

        // Find most common gap
        let mostCommonGap: number | null = null;
        if (gapValues.length > 0) {
            const frequency: Record<number, number> = {};
            gapValues.forEach(g => {
                frequency[g] = (frequency[g] || 0) + 1;
            });
            let maxFreq = 0;
            for (const [gap, freq] of Object.entries(frequency)) {
                if (freq > maxFreq) {
                    maxFreq = freq;
                    mostCommonGap = parseInt(gap);
                }
            }
        }

        // Find inconsistent gaps (more than 2px from expected)
        const inconsistentGaps = gaps.filter(g =>
            Math.abs(g.gap - expectedGap) > 2
        );

        return {
            totalCards: cards.length,
            gaps,
            uniqueGaps,
            mostCommonGap,
            inconsistentGaps,
            isConsistent: inconsistentGaps.length === 0,
        };
    }, EXPECTED_GAP);

    return {
        pageUrl,
        viewport,
        ...analysis,
    };
}

/**
 * Log gap analysis results to console.
 */
export function logGapAnalysis(analysis: GapAnalysis): void {
    console.log(`\n--- Gap Analysis: ${analysis.pageUrl} @ ${analysis.viewport.width}x${analysis.viewport.height} ---`);
    console.log(`Cards found: ${analysis.totalCards}`);
    console.log(`Gaps measured: ${analysis.gaps.length}`);
    console.log(`Gap values: ${JSON.stringify(analysis.gaps.map(g => g.gap))}`);
    console.log(`Unique gaps: ${JSON.stringify(analysis.uniqueGaps)}`);
    console.log(`Most common gap: ${analysis.mostCommonGap}px`);
    console.log(`Expected gap: ${EXPECTED_GAP}px (±${GAP_TOLERANCE}px tolerance)`);

    if (analysis.isConsistent) {
        console.log(`✅ All gaps consistent`);
    } else {
        console.log(`❌ Inconsistent gaps found:`);
        analysis.inconsistentGaps.forEach(g => {
            console.log(`  - ${g.between}: ${g.gap}px (expected ~${EXPECTED_GAP}px)`);
        });
    }
}

/**
 * Get a blog slug for testing /Blogs/[slug] pages.
 */
export async function getFirstBlogSlug(page: Page): Promise<string | null> {
    await page.goto(`${BASE_URL}/Search`);
    await page.waitForTimeout(1000);

    const slug = await page.evaluate(() => {
        const link = document.querySelector('a[href*="/Blogs/"]');
        if (link) {
            const href = link.getAttribute('href');
            if (href) {
                const match = href.match(/\/Blogs\/([^/]+)/);
                return match ? match[1] : null;
            }
        }
        return null;
    });

    return slug;
}
