import { test, expect } from '@playwright/test';

/**
 * Test that verifies the mobile navbar doesn't overlap with content below it.
 * The navbar should be positioned above the content grid, not overlapping.
 */
test.describe('Mobile Navbar Positioning', () => {
    // Mobile resolutions to test
    const mobileViewports = [
        { width: 375, height: 812, name: 'iPhone X' },
        { width: 390, height: 844, name: 'iPhone 12' },
        { width: 414, height: 896, name: 'iPhone XR' },
        { width: 360, height: 740, name: 'Galaxy S8' },
    ];

    for (const viewport of mobileViewports) {
        test(`navbar does not overlap content on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            test.setTimeout(30000);

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:3002');

            // Wait for page to fully load and hydrate
            await page.waitForTimeout(2000);

            // Detect z-overlap: check if navbar overlaps with content elements
            const overlapResult = await page.evaluate(() => {
                // Find the navbar - it contains "becker63" text
                const navbarText = Array.from(document.querySelectorAll('span')).find(
                    el => el.textContent?.includes('becker63')
                );

                if (!navbarText) {
                    return { error: 'Navbar text not found' };
                }

                // Get the navbar container (traverse up to find nav or containing div)
                let navbar: Element | null = navbarText;
                while (navbar && navbar.tagName !== 'NAV' && navbar.parentElement) {
                    navbar = navbar.parentElement;
                    // Stop at a reasonable container level
                    if (navbar.classList.length > 0 || navbar.tagName === 'NAV') {
                        break;
                    }
                }

                const navbarRect = navbar.getBoundingClientRect();

                // Find content elements that should be BELOW the navbar
                // These are the main content cards (black rounded boxes)
                const contentElements = Array.from(document.querySelectorAll('div')).filter(el => {
                    const style = window.getComputedStyle(el);
                    // Looking for content cards with background and border-radius
                    return style.backgroundColor === 'rgb(0, 0, 0)' &&
                        style.borderRadius !== '0px' &&
                        el.getBoundingClientRect().height > 50;
                });

                const overlaps: Array<{
                    navbarBottom: number;
                    contentTop: number;
                    overlap: number;
                    contentClasses: string[];
                }> = [];

                for (const content of contentElements) {
                    const contentRect = content.getBoundingClientRect();

                    // Check if navbar bottom extends into content top
                    // Allow 2px tolerance for rendering differences
                    if (navbarRect.bottom > contentRect.top + 2) {
                        overlaps.push({
                            navbarBottom: Math.round(navbarRect.bottom),
                            contentTop: Math.round(contentRect.top),
                            overlap: Math.round(navbarRect.bottom - contentRect.top),
                            contentClasses: [...content.classList]
                        });
                    }
                }

                return {
                    navbarRect: {
                        top: Math.round(navbarRect.top),
                        bottom: Math.round(navbarRect.bottom),
                        height: Math.round(navbarRect.height)
                    },
                    overlaps,
                    contentElementsFound: contentElements.length
                };
            });

            console.log(`--- ${viewport.name} NAVBAR OVERLAP TEST ---`);
            console.log(JSON.stringify(overlapResult, null, 2));
            console.log('----------------------------------------');

            // Fail if we detected overlaps
            if ('error' in overlapResult) {
                throw new Error(overlapResult.error);
            }

            expect(overlapResult.overlaps.length,
                `Navbar overlaps with ${overlapResult.overlaps.length} content elements`
            ).toBe(0);
        });
    }

    test('navbar fades out and content shifts up on scroll', async ({ page }) => {
        test.setTimeout(30000);

        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Get initial navbar opacity and position
        const initialState = await page.evaluate(() => {
            const navbarText = Array.from(document.querySelectorAll('span')).find(
                el => el.textContent?.includes('becker63')
            );
            if (!navbarText) return null;

            let navbar: Element | null = navbarText;
            while (navbar && navbar.parentElement) {
                const style = window.getComputedStyle(navbar);
                if (style.opacity !== '1' || navbar.tagName === 'NAV') {
                    break;
                }
                navbar = navbar.parentElement;
            }

            const style = window.getComputedStyle(navbar!);
            return {
                opacity: parseFloat(style.opacity),
                top: navbar!.getBoundingClientRect().top
            };
        });

        console.log('Initial state:', initialState);
        expect(initialState).not.toBeNull();
        // Navbar may have 0.7 opacity from layerStyle, check it's visible
        expect(initialState!.opacity).toBeGreaterThan(0.5);

        // Scroll down 250px (animation range is now 0-200)
        await page.evaluate(() => window.scrollBy(0, 250));
        await page.waitForTimeout(500);

        // Check navbar state after scroll
        const scrolledState = await page.evaluate(() => {
            const navbarText = Array.from(document.querySelectorAll('span')).find(
                el => el.textContent?.includes('becker63')
            );
            if (!navbarText) return null;

            let navbar: Element | null = navbarText;
            while (navbar && navbar.parentElement) {
                const style = window.getComputedStyle(navbar);
                // Find the animated container (look for transform or opacity changes)
                if (style.opacity !== '1' || navbar.tagName === 'NAV') {
                    break;
                }
                navbar = navbar.parentElement;
            }

            const style = window.getComputedStyle(navbar!);
            return {
                opacity: parseFloat(style.opacity),
                top: navbar!.getBoundingClientRect().top
            };
        });

        console.log('Scrolled state:', scrolledState);
        expect(scrolledState).not.toBeNull();
        // After scrolling 250px, navbar should be faded out (opacity near 0)
        expect(scrolledState!.opacity).toBeLessThan(0.2);
    });
});
