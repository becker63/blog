import { test, expect } from '@playwright/test';

test('homepage layouts correctly with no overflow', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Go to homepage
    await page.goto('http://localhost:3000');

    // Wait for settlement
    await page.waitForTimeout(2000);

    // Overflow detection with different rules for horizontal vs vertical:
    // - HORIZONTAL: Always fail. Images should scale, never clip horizontally.
    // - VERTICAL: Skip if element is clipped by ancestor with overflow:hidden (acceptable for scrollable areas)
    const overflowIssues = await page.evaluate(() => {
        const issues: { type: string; element: string; value: number; viewport: number; classList: string[]; clipped?: boolean }[] = [];

        // Helper: check if element is vertically clipped by ancestor with overflow:hidden
        const isVerticallyClippedByAncestor = (el: Element): boolean => {
            let current: Element | null = el.parentElement;
            while (current) {
                const style = window.getComputedStyle(current);
                if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
                    const ancestorRect = current.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    if (elRect.bottom > ancestorRect.bottom) {
                        return true; // Element is vertically clipped
                    }
                }
                current = current.parentElement;
            }
            return false;
        };

        // Helper: check if element is horizontally clipped by ancestor
        const isHorizontallyClippedByAncestor = (el: Element): boolean => {
            let current: Element | null = el.parentElement;
            while (current) {
                const style = window.getComputedStyle(current);
                if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
                    const ancestorRect = current.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    if (elRect.right > ancestorRect.right) {
                        return true; // Element is horizontally clipped
                    }
                }
                current = current.parentElement;
            }
            return false;
        };

        document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();

            // HORIZONTAL OVERFLOW: Always report, even if clipped (clipping is a bug for horizontal)
            if (rect.right > window.innerWidth + 1) {
                const isClipped = isHorizontallyClippedByAncestor(el);
                issues.push({
                    type: isClipped ? "horizontal-clipped" : "horizontal-overflow",
                    element: el.tagName,
                    value: rect.right,
                    viewport: window.innerWidth,
                    classList: [...el.classList],
                    clipped: isClipped
                });
            }

            // VERTICAL OVERFLOW: Skip if clipped (acceptable for scrollable content)
            if (rect.bottom > window.innerHeight + 1) {
                if (!isVerticallyClippedByAncestor(el)) {
                    issues.push({
                        type: "vertical-overflow",
                        element: el.tagName,
                        value: rect.bottom,
                        viewport: window.innerHeight,
                        classList: [...el.classList]
                    });
                }
            }
        });

        return issues;
    });

    console.log("--- OVERFLOW DIAGNOSTICS ---");
    if (overflowIssues.length === 0) {
        console.log("No overflow detected. Layout is correct.");
    } else {
        console.log("Overflow Issues Found:");
        console.log(JSON.stringify(overflowIssues, null, 2));
    }
    console.log("----------------------------");

    expect(overflowIssues.length).toBe(0);
});
