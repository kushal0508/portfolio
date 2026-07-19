import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

test.describe('Portfolio Enhanced QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await sleep(2500)
  })

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { width: 320, height: 568, label: '320px' },
      { width: 375, height: 667, label: '375px' },
      { width: 425, height: 900, label: '425px' },
      { width: 768, height: 1024, label: '768px' },
      { width: 1024, height: 768, label: '1024px' },
      { width: 1280, height: 800, label: '1280px' },
      { width: 1440, height: 900, label: '1440px' },
      { width: 1920, height: 1080, label: '1920px' },
    ]

    for (const { width, height, label } of breakpoints) {
      test(`No overflow at ${label}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await sleep(500)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = await page.evaluate(() => window.innerWidth)
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
      })

      test(`Navbar renders at ${label}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await sleep(500)
        const nav = page.locator('nav[aria-label="Main navigation"]')
        await expect(nav).toBeVisible()
      })
    }
  })

  test.describe('Accessibility', () => {
    test('Skip link is first focusable element', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toHaveAttribute('href', /#main-content/i)
    })

    test('Navigation has correct ARIA attributes', async ({ page }) => {
      const nav = page.locator('nav[aria-label="Main navigation"]')
      await expect(nav).toBeVisible()
      const buttons = nav.locator('button')
      const count = await buttons.count()
      expect(count).toBeGreaterThanOrEqual(7)
    })

    test('Journey compass has ARIA labels', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await sleep(500)
      const compass = page.locator('[aria-label="Journey navigation"]')
      await expect(compass).toBeVisible()
      const dots = compass.locator('button[aria-label]')
      const count = await dots.count()
      expect(count).toBeGreaterThanOrEqual(7)
    })
  })

  test.describe('3D & Canvas', () => {
    test('R3F Canvas renders', async ({ page }) => {
      const canvas = page.locator('canvas')
      await expect(canvas.first()).toBeVisible()
    })

    test('No WebGL errors in console', async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      await page.reload({ waitUntil: 'networkidle' })
      await sleep(3000)
      const webglErrors = errors.filter(e =>
        e.includes('WebGL') || e.includes('THREE') || e.includes('three')
      )
      expect(webglErrors.length).toBe(0)
    })
  })

  test.describe('Cinematic Experience', () => {
    test('Loader appears on fresh load', async ({ page }) => {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await sleep(200)
      const loader = page.locator('text=booting portfolio.exe')
      await expect(loader).toBeVisible({ timeout: 3000 })
    })

    test('Loader transitions away', async ({ page }) => {
      await page.reload({ waitUntil: 'networkidle' })
      await sleep(4000)
      const loader = page.locator('text=booting portfolio.exe')
      await expect(loader).not.toBeVisible({ timeout: 5000 })
    })

    test('Journey compass exists', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await sleep(500)
      const compass = page.locator('[aria-label="Journey navigation"]')
      await expect(compass).toBeVisible()
    })

    test('Scroll spacer exists', async ({ page }) => {
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
      expect(bodyHeight).toBeGreaterThan(5000)
    })
  })

  test.describe('Navigation & Sections', () => {
    test('All 7 nav items present', async ({ page }) => {
      const labels = ['Home', 'About', 'Skills', 'Experience', 'Projects', 'Achievements', 'Contact']
      for (const label of labels) {
        const btn = page.locator(`nav[aria-label="Main navigation"] button:has-text("${label}")`)
        await expect(btn).toBeVisible()
      }
    })

    test('Active navigation indicator renders', async ({ page }) => {
      const indicator = page.locator('.nav-active-indicator')
      await expect(indicator).toBeVisible()
    })

    test('Active navigation indicator updates on click', async ({ page }) => {
      const indicator = page.locator('.nav-active-indicator')
      await expect(indicator).toBeVisible()
      const initialLeft = await indicator.evaluate(el => el.getBoundingClientRect().left)
      await page.locator('nav[aria-label="Main navigation"] button:has-text("About")').click()
      await sleep(1500)
      const movedLeft = await indicator.evaluate(el => el.getBoundingClientRect().left)
      expect(movedLeft).not.toBe(initialLeft)
    })

    test('Mobile hamburger menu toggles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await sleep(500)
      const menuBtn = page.locator('.nav-mobile-toggle')
      await expect(menuBtn).toBeVisible()
      await menuBtn.click()
      await sleep(300)
      await expect(page.locator('#mobile-menu')).toBeVisible()
      await menuBtn.click()
      await sleep(300)
      await expect(page.locator('#mobile-menu')).not.toBeVisible()
    })

    test('Mobile menu navigation works', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await sleep(500)
      await page.locator('.nav-mobile-toggle').click()
      await sleep(300)
      await page.locator('#mobile-menu button:has-text("Contact")').click()
      await sleep(1000)
      await expect(page.locator('#mobile-menu')).not.toBeVisible()
    })
  })

  test.describe('Content Verification', () => {
    test('Hero section has name and title', async ({ page }) => {
      const hero = page.locator('#hero')
      const h1 = hero.locator('h1')
      await expect(h1).toBeVisible()
      await expect(h1).toContainText(/Kushal/i)
    })

    test('Hero has role badges', async ({ page }) => {
      const hero = page.locator('#hero')
      await expect(hero.locator('text=Odoo Techno-Functional Intern').first()).toBeVisible()
    })

    test('CTA buttons visible', async ({ page }) => {
      const resumeBtn = page.locator('a[aria-label="View Resume"]')
      const contactBtn = page.locator('button[aria-label="Get in Touch"]')
      await expect(resumeBtn).toBeVisible()
      await expect(contactBtn).toBeVisible()
    })

    test('About section has bio', async ({ page }) => {
      const about = page.locator('#about')
      const bio = about.locator('p').first()
      await expect(bio).toBeVisible()
      await expect(about).toContainText(/Mysore|developer|engineer/i)
    })

    test('Skills section renders skill tags', async ({ page }) => {
      const skills = page.locator('#skills')
      const chips = skills.locator('span.relative.px-5')
      const count = await chips.count()
      expect(count).toBeGreaterThan(0)
    })

    test('Experience card renders', async ({ page }) => {
      const exp = page.locator('#experience')
      await expect(exp.locator('h3')).toBeVisible()
    })

    test('Project cards render', async ({ page }) => {
      const projects = page.locator('#projects')
      const cards = projects.locator('.group.glass')
      const count = await cards.count()
      expect(count).toBeGreaterThan(0)
      const firstCard = cards.first()
      await expect(firstCard.locator('h3')).toBeVisible()
    })

    test('Achievement section renders', async ({ page }) => {
      const ach = page.locator('#achievements')
      const cards = ach.locator('.group.glass')
      const count = await cards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('Contact section has social links', async ({ page }) => {
      const contact = page.locator('#contact')
      const github = contact.locator('a[href*="github.com"]')
      const linkedin = contact.locator('a[href*="linkedin.com"]')
      await expect(github).toBeVisible()
      await expect(linkedin).toBeVisible()
    })
  })

  test.describe('External Links', () => {
    test('GitHub link points to correct profile', async ({ page }) => {
      const gh = page.locator('a[href*="github.com"]').first()
      const href = await gh.getAttribute('href')
      expect(href).toContain('kushal')
    })

    test('LinkedIn link points to correct profile', async ({ page }) => {
      const li = page.locator('a[href*="linkedin.com"]').first()
      const href = await li.getAttribute('href')
      expect(href).toContain('kushal')
    })

    test('Email link is valid', async ({ page }) => {
      const email = page.locator('a[href^="mailto:"]').first()
      const href = await email.getAttribute('href')
      expect(href).toContain('@')
    })
  })

  test.describe('Scroll & Animation', () => {
    test('Scroll progress bar exists', async ({ page }) => {
      const bar = page.locator('.scroll-progress')
      await expect(bar).toBeAttached()
    })

    test('Nav brand shows initials', async ({ page }) => {
      const brand = page.locator('.nav-brand-text')
      await expect(brand).toBeVisible()
    })

    test('Hero text gradient classes present', async ({ page }) => {
      const h1 = page.locator('#hero h1')
      const spans = h1.locator('span.bg-gradient-to-r')
      const count = await spans.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('No Runtime Errors', () => {
    test('Zero console errors during scroll journey', async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      const scrollSteps = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 0]
      for (const pos of scrollSteps) {
        await page.evaluate(p => window.scrollTo(0, p), pos)
        await sleep(800)
      }
      const critical = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Extension') &&
        !e.includes('chrome-extension') &&
        !e.includes('ResizeObserver') &&
        !e.includes('404')
      )
      expect(critical).toEqual([])
    })

    test('No uncaught exceptions during full scroll', async ({ page }) => {
      const errors = []
      page.on('pageerror', err => errors.push(err.message))
      for (let i = 0; i <= 8000; i += 500) {
        await page.evaluate(p => window.scrollTo(0, p), i)
      }
      await sleep(2000)
      expect(errors).toEqual([])
    })
  })

  test.describe('SEO & Metadata', () => {
    test('Title contains name and role', async ({ page }) => {
      const title = await page.title()
      expect(title).toContain('Kushal R')
      expect(title).toContain('Odoo')
    })

    test('Meta description present', async ({ page }) => {
      const desc = await page.locator('meta[name="description"]').getAttribute('content')
      expect(desc).toBeTruthy()
      expect(desc).toContain('Kushal R')
    })

    test('Open Graph tags present', async ({ page }) => {
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain('Kushal R')
    })

    test('Twitter card present', async ({ page }) => {
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
      expect(twitterCard).toBe('summary_large_image')
    })

    test('Structured data present', async ({ page }) => {
      const ldJson = await page.locator('script[type="application/ld+json"]').textContent()
      expect(ldJson).toContain('Kushal R')
      expect(ldJson).toContain('Person')
    })
  })
})
