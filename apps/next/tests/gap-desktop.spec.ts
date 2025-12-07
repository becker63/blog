import { test, expect } from '@playwright/test';

/**
 * Desktop Gap Consistency Test
 * Tests gap consistency on desktop viewports only.
 */

const PORT = 3000;

test('desktop gaps should be consistent (1280px)', async ({ page }) => {
    test.setTimeout(20000);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(1500);

    const gapAnalysis = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const cards: { rect: DOMRect; isNavbar: boolean }[] = [];

        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const isCard = style.borderRadius === '10px' &&
                (style.backgroundColor === 'rgb(0, 0, 0)' || style.backgroundColor === 'rgba(0, 0, 0, 1)');

            if (isCard) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 30) {
                    const isNavbar = [...el.classList].some(c => c.includes('navbar') || c.includes('layerStyle_navbar'));
                    cards.push({ rect, isNavbar });
                }
            }
        });

        cards.sort((a, b) => a.rect.top - b.rect.top);

        const gaps: { gap: number; between: string }[] = [];
        for (let i = 0; i < cards.length - 1; i++) {
            const current = cards[i];
            const next = cards[i + 1];

            if (current.isNavbar || next.isNavbar) continue;

            const horizontalOverlap = !(current.rect.right < next.rect.left || next.rect.right < current.rect.left);
            if (horizontalOverlap && next.rect.top > current.rect.bottom) {
                gaps.push({
                    gap: Math.round(next.rect.top - current.rect.bottom),
                    between: `card ${i} → card ${i + 1}`
                });
            }
        }

        const gapValues = gaps.map(g => g.gap);
        const uniqueGaps = [...new Set(gapValues)];
        const mostCommonGap = gapValues.length > 0
            ? gapValues.sort((a, b) =>
                gapValues.filter(v => v === a).length - gapValues.filter(v => v === b).length
            ).pop()
            : 0;

        const inconsistentGaps = gaps.filter(g =>
            Math.abs(g.gap - (mostCommonGap || 0)) > 2
        );

        return {
            totalCards: cards.length,
            gaps,
            uniqueGaps,
            mostCommonGap,
            inconsistentGaps,
            isConsistent: inconsistentGaps.length === 0
        };
    });

    console.log('--- Desktop Gap Analysis (1280px) ---');
    console.log(`Cards: ${gapAnalysis.totalCards}, Gaps: ${JSON.stringify(gapAnalysis.gaps)}`);
    console.log(`Most common: ${gapAnalysis.mostCommonGap}px, Unique: ${JSON.stringify(gapAnalysis.uniqueGaps)}`);

    if (!gapAnalysis.isConsistent) {
        console.log(`❌ Inconsistent: ${JSON.stringify(gapAnalysis.inconsistentGaps)}`);
    }

    expect(gapAnalysis.isConsistent, `Inconsistent gaps found`).toBe(true);
});
