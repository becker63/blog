import { test, expect } from '@playwright/test';

/**
 * Mobile Navbar Animation Test
 * 
 * Focused test for verifying mobile navbar behavior:
 * 1. Width consistency - navbar should maintain same width while animating
 * 2. Gap consistency - gap between navbar and content should match gaps between other items
 * 3. No z-overlap with content
 */

const PORT = 3000; // Use current dev server port

test.describe('Mobile Navbar Animation', () => {
    test('navbar maintains width, gap, and no overlap on mobile', async ({ page }) => {
        test.setTimeout(30000);

        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(`http://localhost:${PORT}`);
        await page.waitForTimeout(2000);

        // === TEST 1: Width Consistency ===
        const initialState = await page.evaluate(() => {
            const navbarText = Array.from(document.querySelectorAll('span')).find(
                el => el.textContent?.includes('becker63')
            );
            if (!navbarText) return null;

            // Find the navbar's animated container (the motion.div with 90vw width)
            let navbarContainer: Element | null = navbarText;
            while (navbarContainer && navbarContainer.parentElement) {
                navbarContainer = navbarContainer.parentElement;
                const style = window.getComputedStyle(navbarContainer);
                // Look for the container that has the 90vw width
                if (style.width && parseFloat(style.width) > 200) {
                    break;
                }
            }

            const rect = navbarContainer?.getBoundingClientRect();
            return {
                width: Math.round(rect?.width || 0),
                bottom: Math.round(rect?.bottom || 0),
            };
        });

        console.log('Initial navbar state:', initialState);
        expect(initialState, 'Navbar not found').not.toBeNull();
        const initialWidth = initialState!.width;

        // === TEST 2: Gap Consistency (before scroll) ===
        const gapAnalysis = await page.evaluate(() => {
            // Find navbar bottom
            const navbarText = Array.from(document.querySelectorAll('span')).find(
                el => el.textContent?.includes('becker63')
            );
            if (!navbarText) return { error: 'Navbar not found' };

            let navbarContainer: Element | null = navbarText;
            while (navbarContainer && navbarContainer.parentElement) {
                navbarContainer = navbarContainer.parentElement;
                const style = window.getComputedStyle(navbarContainer);
                if (style.width && parseFloat(style.width) > 200) {
                    break;
                }
            }

            const navbarRect = navbarContainer?.getBoundingClientRect();
            if (!navbarRect) return { error: 'Navbar container not found' };

            // Find content cards (black boxes with border-radius)
            const cards: { rect: DOMRect }[] = [];
            document.querySelectorAll('div').forEach(el => {
                const style = window.getComputedStyle(el);
                const isCard = style.borderRadius === '10px' &&
                    (style.backgroundColor === 'rgb(0, 0, 0)' || style.backgroundColor === 'rgba(0, 0, 0, 1)');

                if (isCard) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 50 && rect.height > 30) {
                        cards.push({ rect });
                    }
                }
            });

            cards.sort((a, b) => a.rect.top - b.rect.top);

            const firstCard = cards[0];
            if (!firstCard) return { error: 'No content cards found' };

            // Gap between navbar and first content
            const navbarToContentGap = Math.round(firstCard.rect.top - navbarRect.bottom);

            // Gaps between content cards
            const contentGaps: number[] = [];
            for (let i = 0; i < cards.length - 1; i++) {
                const current = cards[i];
                const next = cards[i + 1];
                const horizontalOverlap = !(current.rect.right < next.rect.left || next.rect.right < current.rect.left);
                if (horizontalOverlap && next.rect.top > current.rect.bottom) {
                    contentGaps.push(Math.round(next.rect.top - current.rect.bottom));
                }
            }

            const expectedGap = contentGaps.length > 0 ? contentGaps[0] : 12; // Default to layout token (12px)

            return {
                navbarToContentGap,
                contentGaps,
                expectedGap,
                gapDifference: Math.abs(navbarToContentGap - expectedGap),
                hasOverlap: navbarToContentGap < 0
            };
        });

        console.log('Gap analysis:', gapAnalysis);

        if ('error' in gapAnalysis) {
            throw new Error(gapAnalysis.error);
        }

        // Check no overlap
        expect(gapAnalysis.hasOverlap, 'Navbar overlaps with content').toBe(false);

        // Check gap consistency - navbar may have different margins than content
        // Allow more tolerance since navbar uses edge margins while content uses centered 90vw
        expect(
            gapAnalysis.gapDifference,
            `Navbar gap (${gapAnalysis.navbarToContentGap}px) differs from content gaps (${gapAnalysis.expectedGap}px)`
        ).toBeLessThanOrEqual(8);

        // === TEST 3: Width Consistency During Scroll ===
        await page.evaluate(() => window.scrollBy(0, 100));
        await page.waitForTimeout(300);

        const midScrollState = await page.evaluate(() => {
            const navbarText = Array.from(document.querySelectorAll('span')).find(
                el => el.textContent?.includes('becker63')
            );
            if (!navbarText) return null;

            let navbarContainer: Element | null = navbarText;
            while (navbarContainer && navbarContainer.parentElement) {
                navbarContainer = navbarContainer.parentElement;
                const style = window.getComputedStyle(navbarContainer);
                if (style.width && parseFloat(style.width) > 200) {
                    break;
                }
            }

            const rect = navbarContainer?.getBoundingClientRect();
            return {
                width: Math.round(rect?.width || 0),
            };
        });

        console.log('Mid-scroll navbar state:', midScrollState);
        expect(midScrollState, 'Navbar not found after scroll').not.toBeNull();

        const widthDiff = Math.abs(initialWidth - midScrollState!.width);
        expect(
            widthDiff,
            `Navbar width changed from ${initialWidth}px to ${midScrollState!.width}px during scroll`
        ).toBeLessThanOrEqual(2);

        console.log('✅ All navbar animation tests passed');
    });
});
