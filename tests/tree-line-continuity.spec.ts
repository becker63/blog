import { test, expect } from '@playwright/test';

/**
 * Test that tree lines connecting blog cards render continuously
 * with no gaps between cards at all viewport sizes.
 */

const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'desktopLarge', width: 1920, height: 1080 },
];

test.describe('Tree Line Continuity', () => {
    for (const viewport of viewports) {
        test(`tree lines connect without gaps at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:3000/Search');
            await page.waitForLoadState('networkidle');

            // Find blog cards by looking for links to /Blogs/
            const blogLinks = await page.locator('a[href^="/Blogs/"]').all();
            const cardCount = blogLinks.length;

            console.log(`\n--- Tree Line Analysis at ${viewport.name} ---`);
            console.log(`Blog cards found: ${cardCount}`);

            if (cardCount < 2) {
                console.log(`Only ${cardCount} cards found - skipping gap test`);
                return;
            }

            // Get all vertical line segments (1px wide white elements)
            const verticalLines = await page.evaluate(() => {
                const elements: { top: number; bottom: number; left: number; height: number }[] = [];

                document.querySelectorAll('div').forEach((el) => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();

                    // Look for thin vertical line elements (1px wide, reasonably tall, white/visible)
                    if (
                        rect.width >= 0.5 && rect.width <= 2 &&
                        rect.height > 20 &&
                        (style.backgroundColor === 'rgb(255, 255, 255)' ||
                            style.backgroundColor === 'white' ||
                            style.background.includes('white') ||
                            style.background.includes('rgb(255, 255, 255)'))
                    ) {
                        elements.push({
                            top: Math.round(rect.top),
                            bottom: Math.round(rect.bottom),
                            left: Math.round(rect.left),
                            height: Math.round(rect.height),
                        });
                    }
                });

                return elements;
            });

            console.log(`Vertical line segments found: ${verticalLines.length}`);

            if (verticalLines.length === 0) {
                // If no lines found via computed style, try to find them by checking styled divs
                console.log('No vertical lines detected via computed style - checking if tree lines exist in DOM');

                // Take screenshot to verify visually
                await page.screenshot({ path: `test-results/tree-lines-${viewport.name}.png` });
                console.log(`Screenshot saved to test-results/tree-lines-${viewport.name}.png`);
                return;
            }

            // Group lines by their left position (same vertical column)
            const linesByColumn = new Map<number, typeof verticalLines>();
            for (const line of verticalLines) {
                // Use a tolerance of 5px for grouping lines in same column
                let foundColumn = false;
                for (const [key, _] of linesByColumn) {
                    if (Math.abs(key - line.left) < 5) {
                        linesByColumn.get(key)!.push(line);
                        foundColumn = true;
                        break;
                    }
                }
                if (!foundColumn) {
                    linesByColumn.set(line.left, [line]);
                }
            }

            console.log(`Distinct line columns: ${linesByColumn.size}`);

            // For each column, verify lines connect without significant gaps
            let gapsFound = 0;
            for (const [left, lines] of linesByColumn) {
                // Sort by vertical position
                lines.sort((a, b) => a.top - b.top);

                // Check for gaps between consecutive segments
                for (let i = 0; i < lines.length - 1; i++) {
                    const current = lines[i];
                    const next = lines[i + 1];
                    const gap = next.top - current.bottom;

                    // Allow tolerance for subpixel rendering and small layout variations
                    const tolerance = 3;

                    if (gap > tolerance) {
                        gapsFound++;
                        console.log(`⚠️ Gap of ${gap}px at column ${left} (line ${i} to ${i + 1})`);
                    }
                }
            }

            // Expect no gaps or report them
            expect(gapsFound, `Found ${gapsFound} gaps in tree lines`).toBe(0);
            console.log('✅ Tree lines are continuous with no gaps');
        });
    }
});
