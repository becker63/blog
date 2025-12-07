import { test, expect } from '@playwright/test';

test('SVG visibility across viewport sizes', async ({ page }) => {
    test.setTimeout(120000);

    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Test viewport widths from desktop down to mobile
    const testWidths = [
        1920, 1440, 1280, 1024,  // Desktop
        1023, 1000, 900, 800,    // Tablet/transition
        768, 700, 600, 500,     // Mobile breakpoints
        400, 360, 320           // Small mobile
    ];

    const results: { width: number; bebopVisible: boolean; bebopInfo: any }[] = [];

    for (const width of testWidths) {
        await page.setViewportSize({ width, height: 768 });
        await page.waitForTimeout(500); // Allow layout to settle

        // Look specifically for the Bebop SVG (react-inlinesvg output)
        // It should be a large SVG with a viewBox of "0 0 1042 1066"
        const bebopInfo = await page.evaluate(() => {
            // Find all SVGs
            const allSvgs = document.querySelectorAll('svg');

            for (const svg of allSvgs) {
                const rect = svg.getBoundingClientRect();
                const viewBox = svg.getAttribute('viewBox');
                const style = window.getComputedStyle(svg);

                // Bebop SVG should have the specific viewBox or be reasonably large
                const isBebop = viewBox === '0 0 1042 1066' ||
                    (rect.width > 50 && rect.height > 50);

                if (isBebop && rect.width > 0 && rect.height > 0) {
                    return {
                        found: true,
                        visible: true,
                        viewBox,
                        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
                        display: style.display,
                        visibility: style.visibility
                    };
                }
            }

            // Check if Bebop container exists even if SVG is 0x0
            const allSvgsInfo: any[] = [];
            allSvgs.forEach(svg => {
                const rect = svg.getBoundingClientRect();
                allSvgsInfo.push({
                    viewBox: svg.getAttribute('viewBox'),
                    width: rect.width,
                    height: rect.height,
                    classList: [...svg.classList]
                });
            });

            return { found: false, visible: false, allSvgs: allSvgsInfo };
        });

        const isVisible = bebopInfo.found && bebopInfo.visible;
        results.push({ width, bebopVisible: isVisible, bebopInfo });

        console.log(`Viewport ${width}px: Bebop ${isVisible ? '✓ VISIBLE' : '✗ HIDDEN'}`, JSON.stringify(bebopInfo));
    }

    // Find the breakpoint where Bebop disappears
    let lastVisibleWidth = 0;
    let firstHiddenWidth = 0;

    for (let i = 0; i < results.length; i++) {
        if (results[i].bebopVisible) {
            lastVisibleWidth = results[i].width;
        } else if (lastVisibleWidth > 0 && firstHiddenWidth === 0) {
            firstHiddenWidth = results[i].width;
        }
    }

    console.log('--- BREAKPOINT ANALYSIS ---');
    console.log(`Bebop visible at: ${lastVisibleWidth}px`);
    console.log(`Bebop hidden at: ${firstHiddenWidth}px`);
    console.log(`Breakpoint is between ${firstHiddenWidth}px and ${lastVisibleWidth}px`);
    console.log('---------------------------');

    // The test reports the breakpoint
});

test('Bebop SVG should be visible at all viewports', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Test both desktop and mobile viewports
    const testWidths = [
        { width: 1920, name: 'desktop-1920' },
        { width: 1024, name: 'desktop-1024' },
        { width: 768, name: 'tablet' },
        { width: 375, name: 'mobile' }
    ];

    for (const { width, name } of testWidths) {
        await page.setViewportSize({ width, height: 768 });
        await page.waitForTimeout(500);

        const bebopVisible = await page.evaluate(() => {
            const allSvgs = document.querySelectorAll('svg');
            for (const svg of allSvgs) {
                const rect = svg.getBoundingClientRect();
                const viewBox = svg.getAttribute('viewBox');

                // Bebop should have viewBox or be large
                if ((viewBox === '0 0 1042 1066' || rect.width > 50) &&
                    rect.width > 0 && rect.height > 0) {
                    return true;
                }
            }
            return false;
        });

        console.log(`[${name}] ${width}px: Bebop ${bebopVisible ? '✓ VISIBLE' : '✗ HIDDEN'}`);
        expect(bebopVisible, `Bebop SVG should be visible at ${width}px (${name})`).toBe(true);
    }
});
