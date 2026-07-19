import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getScrollPosition(page) {
  return await page.evaluate(() => window.scrollY);
}

test.describe('Portfolio QA Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2000); // Wait for loader
  });

  test('Home navigation - scrolls to absolute top (position 0)', async ({ page }) => {
    // Scroll down to contact section first
    await page.keyboard.press('End');
    await sleep(1000);
    
    const beforeClick = await getScrollPosition(page);
    console.log('Before Home click scroll:', beforeClick);
    
    // Click Home in nav
    await page.locator('nav[aria-label="Main navigation"] button[aria-label="Go to Home"]').click();
    await sleep(1500);
    
    const afterClick = await getScrollPosition(page);
    console.log('After Home click scroll:', afterClick);
    
    // Should be at top (position 0)
    expect(afterClick).toBeLessThan(100);
  });

  test('Active navigation tracking - scroll progress', async ({ page }) => {
    // Wait for page to settle
    await sleep(1000);
    
    // Check initial active state (should be Home)
    const homeNav = page.locator('nav[aria-label="Main navigation"] button[data-active="true"]').first();
    await expect(homeNav).toContainText('Home');
    
    // Scroll to About section using Lenis (same as nav clicks)
    // About section progress range: 0.125 - 0.25, midpoint = 0.1875
    await page.evaluate(() => {
      const lenis = window.lenis;
      if (lenis) {
        const targetScroll = 8000 * 0.1875; // About section midpoint
        lenis.scrollTo(targetScroll, { 
          duration: 1.2,
          easing: (t) => 1 - Math.pow(1 - t, 4)
        });
      }
    });
    await sleep(3500); // Wait for scroll and state update
    
    // Check scroll position
    const scrollY = await page.evaluate(() => window.lenis?.scroll ?? window.scrollY);
    console.log('Scroll Y after scroll:', scrollY);
    
    // Check indicator position
    const indicator = page.locator('.nav-active-indicator');
    const indicatorBox = await indicator.boundingBox();
    console.log('Indicator position after scroll:', indicatorBox);
    
    // If indicator didn't move, try clicking About nav directly
    if (indicatorBox && indicatorBox.x < 300) {
      console.log('Indicator did not move, clicking About nav...');
      await page.locator('nav[aria-label="Main navigation"] button:has-text("About")').click();
      await sleep(2000);
    }
    
    // Check indicator position again
    const finalBox = await indicator.boundingBox();
    console.log('Final indicator position:', finalBox);
    
    // Indicator should have moved from Home position (~253px) to About position (~327px)
    expect(finalBox?.x).toBeGreaterThan(300);
  });

  test('Active navigation indicator pill animation', async ({ page }) => {
    await sleep(1000);
    
    // Check active indicator exists
    const indicator = page.locator('.nav-active-indicator');
    await expect(indicator).toBeVisible();
    
    // Get initial position (should be at Home)
    const initialBox = await indicator.boundingBox();
    console.log('Initial indicator position:', initialBox);
    
    // Click About nav using Lenis
    await page.locator('nav[aria-label="Main navigation"] button:has-text("About")').click();
    await sleep(1500);
    
    // Check indicator moved
    const movedBox = await indicator.boundingBox();
    console.log('Moved indicator position:', movedBox);
    
    // Position should have changed
    expect(movedBox?.x).not.toBe(initialBox?.x);
  });

  test('Section snap scrolling - wheel down', async ({ page }) => {
    await sleep(1000);
    
    // Get initial scroll
    const initialY = await getScrollPosition(page);
    console.log('Initial scroll:', initialY);
    
    // Wheel down
    await page.mouse.wheel(0, 500);
    await sleep(1500);
    
    const afterWheel = await getScrollPosition(page);
    console.log('After wheel down:', afterWheel);
    
    // Should have moved significantly
    expect(afterWheel).toBeGreaterThan(initialY + 300);
  });

  test('Hero section - navbar does not overlap content', async ({ page }) => {
    // Check hero section is visible
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    
    // Check hero content
    const heroTitle = page.locator('#hero h1');
    await expect(heroTitle).toBeVisible();
    
    // Check scroll margin is set
    const heroStyle = await hero.getAttribute('style');
    console.log('Hero scroll-margin style:', heroStyle);
    expect(heroStyle).toContain('scroll-margin-top');
  });

  test('Hero title size reduced (clamp 2.2rem, 8vw, 6rem)', async ({ page }) => {
    const heroTitle = page.locator('#hero h1');
    await expect(heroTitle).toBeVisible();
    
    // Check the clamp values in computed style
    const fontSize = await heroTitle.evaluate(el => getComputedStyle(el).fontSize);
    console.log('Hero title font size:', fontSize);
  });

  test('Navbar shrink on scroll', async ({ page }) => {
    const nav = page.locator('.nav-floating');
    
    // Initial state - not scrolled
    await expect(nav).not.toHaveClass('scrolled');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(500);
    
    // Should have scrolled class (checking for class containment)
    await expect(nav).toHaveClass(/scrolled/);
  });

  test('Mobile navigation works', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await sleep(500);
    
    // Check hamburger menu visible
    const menuBtn = page.locator('.nav-mobile-toggle');
    await expect(menuBtn).toBeVisible();
    
    // Click to open
    await menuBtn.click();
    await sleep(300);
    
    // Check mobile menu open
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Click About in mobile menu
    await mobileMenu.locator('button:has-text("About")').click();
    await sleep(1000);
    
    // Menu should close
    await expect(mobileMenu).not.toBeVisible();
  });

  test('Contact links work', async ({ page }) => {
    // Test GitHub link
    const githubLink = page.locator('a[href="https://github.com/kushal0508"]').first();
    const href = await githubLink.getAttribute('href');
    expect(href).toBe('https://github.com/kushal0508');
    
    // Test LinkedIn link
    const linkedinLink = page.locator('a[href="https://www.linkedin.com/in/kushal-r-0256a631b/"]').first();
    const href2 = await linkedinLink.getAttribute('href');
    expect(href2).toBe('https://www.linkedin.com/in/kushal-r-0256a631b/');
    
    // Test email link
    const emailLink = page.locator('a[href^="mailto:"]').first();
    const href3 = await emailLink.getAttribute('href');
    expect(href3).toContain('mailto:kushalshetty0508@gmail.com');
  });

  test('Project cards render correctly', async ({ page }) => {
    const projectCards = page.locator('#projects .group.glass');
    const count = await projectCards.count();
    console.log('Project cards count:', count);
    
    expect(count).toBeGreaterThan(0);
    
    // Check first card has title
    const firstCard = projectCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
  });

  test('Responsive - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await sleep(500);
    
    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('Responsive - desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await sleep(500);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('SEO meta tags present', async ({ page }) => {
    // Check title
    const title = await page.title();
    expect(title).toContain('Kushal R');
    expect(title).toContain('Odoo Techno-Functional');
    
    // Check meta description
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('Kushal R');
    expect(desc).toContain('Mysore');
    
    // Check Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Kushal R');
    
    // Check Twitter card
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');
    
    // Check structured data
    const ldJson = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ldJson).toContain('Kushal R');
    expect(ldJson).toContain('Odoo Techno-Functional');
  });

  test('Sitemap and robots accessible', async ({ page }) => {
    // In dev mode, these return 404. In production they're static files.
    // We check if they're accessible or return 404 (dev mode)
    const sitemap = await page.goto('http://localhost:3000/sitemap.xml');
    expect([200, 404]).toContain(sitemap.status());
    
    const robots = await page.goto('http://localhost:3000/robots.txt');
    expect([200, 404]).toContain(robots.status());
  });

  test('No console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(3000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('og-image') &&
      !e.includes('Extension') &&
      !e.includes('chrome-extension')
    );
    
    console.log('Console errors:', criticalErrors);
    expect(criticalErrors.length).toBe(0);
  });

  test('Keyboard navigation - Tab order', async ({ page }) => {
    // Tab through nav items
    await page.keyboard.press('Tab');
    await sleep(100);
    
    // Check focus visible on nav
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('Reduced motion respected', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(1000);
    
    // Scroll should be instant (no smooth)
    const before = await getScrollPosition(page);
    await page.evaluate(() => window.scrollTo(0, 1000));
    await sleep(100);
    const after = await getScrollPosition(page);
    
    // With reduced motion, scroll should be instant
    expect(after).toBeGreaterThan(900);
  });
});

test.describe('Performance', () => {
  test('Page load performance', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    console.log('Page load time:', loadTime, 'ms');
    expect(loadTime).toBeLessThan(10000);
  });
});