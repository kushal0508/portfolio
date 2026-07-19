import { chromium } from "playwright"

const URL = "http://127.0.0.1:3000"
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

const issues = { errors: [], warnings: [], failures: [] }

function log(type, msg) {
  const prefix = { error: "❌", warn: "⚠️", ok: "✅", info: "ℹ️" }[type] || "•"
  console.log(`  ${prefix} ${msg}`)
}

async function runTests() {
  console.log("\n========== CINEMATIC PORTFOLIO QA AUDIT ==========\n")

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n--- ${device.toUpperCase()} (${viewport.width}x${viewport.height}) ---\n`)

    const context = await browser.newContext({ viewport })
    const page = await context.newPage()

    const consoleErrors = []
    const consoleWarnings = []

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
      if (msg.type() === "warning") consoleWarnings.push(msg.text())
    })

    page.on("pageerror", (err) => consoleErrors.push(err.message))

    // 1. Load page
    try {
      await page.goto(URL, { waitUntil: "networkidle", timeout: 15000 })
      log("ok", `Page loaded (${viewport.width}x${viewport.height})`)
    } catch (e) {
      log("error", `Failed to load: ${e.message}`)
      issues.errors.push(`Page load failed on ${device}: ${e.message}`)
      await context.close()
      continue
    }

    // 2. Check loading screen
    try {
      const loader = await page.locator("text=Loading Experience").isVisible({ timeout: 2000 })
      if (loader) {
        log("ok", "Loading screen appears")
        // Wait for it to disappear
        await page.waitForSelector("text=Loading Experience", { state: "hidden", timeout: 6000 }).catch(() => {})
      } else {
        log("warn", "Loading screen not found (may have already loaded)")
      }
    } catch (e) {
      log("warn", `Loading screen check: ${e.message}`)
    }

    // 3. Check navbar
    try {
      const nav = await page.locator("nav").first()
      const navVisible = await nav.isVisible()
      if (navVisible) {
        log("ok", "Navigation bar is visible")
        const navButtons = await nav.locator("button").all()
        log("ok", `Nav has ${navButtons.length} buttons`)
        const navTexts = await Promise.all(navButtons.map((b) => b.textContent()))
        log("info", `Nav items: ${navTexts.join(", ") || "none"}`)
      } else {
        log("error", "Navigation bar not visible")
        issues.failures.push(`Nav not visible on ${device}`)
      }
    } catch (e) {
      log("error", `Nav check failed: ${e.message}`)
      issues.errors.push(`Nav error on ${device}: ${e.message}`)
    }

    // 4. Check hero/opening section
    try {
      const heroText = await page.locator("text=Kushal").first().isVisible({ timeout: 2000 })
      if (heroText) {
        log("ok", "Hero section visible with name")
      } else {
        log("warn", "Hero name not visible (may be scrolled past)")
      }

      const subtitle = await page.locator("text=Digital Solutions").isVisible({ timeout: 1000 }).catch(() => false)
      if (subtitle) log("ok", "Hero subtitle visible")
    } catch (e) {
      log("warn", `Hero check: ${e.message}`)
    }

    // 5. Check Resume link
    try {
      const resumeLinks = await page.locator('a[href*="drive.google.com"]').all()
      if (resumeLinks.length > 0) {
        log("ok", `${resumeLinks.length} Resume link(s) found`)
      } else {
        log("warn", "No resume links found")
      }
    } catch (e) {
      log("warn", `Resume link check: ${e.message}`)
    }

    // 6. Scroll through sections and check visibility
    const sections = [
      { name: "About", text: "practical" },
      { name: "Skills", text: "Technologies" },
      { name: "Experience", text: "Professional" },
      { name: "Work", text: "Featured" },
      { name: "Achievements", text: "Milestones" },
      { name: "Contact", text: "connect" },
    ]

    for (const section of sections) {
      try {
        await page.evaluate(() => window.scrollTo(0, 0))
        const sectionPositions = {
          About: 0.22,
          Skills: 0.38,
          Experience: 0.54,
          Work: 0.70,
          Achievements: 0.84,
          Contact: 0.95,
        }
        const pos = sectionPositions[section.name]
        if (pos !== undefined) {
          await page.evaluate((p) => window.scrollTo(0, p * 6000), pos)
          await page.waitForTimeout(500)

          const visible = await page.locator(`text=${section.text}`).first().isVisible({ timeout: 2000 }).catch(() => false)
          if (visible) {
            log("ok", `${section.name} section visible`)
          } else {
            log("warn", `${section.name} section text not found`)
          }
        }
      } catch (e) {
        log("warn", `${section.name} check: ${e.message}`)
      }
    }

    // 7. Check project cards
    try {
      await page.evaluate(() => window.scrollTo(0, 0.7 * 6000))
      await page.waitForTimeout(400)

      const project = await page.locator("text=WerWoods").first().isVisible({ timeout: 2000 }).catch(() => false)
      if (project) {
        log("ok", "Project cards visible (WerWoods found)")
      } else {
        log("warn", "Project cards not found")
      }
    } catch (e) {
      log("warn", `Projects check: ${e.message}`)
    }

    // 8. Check experience card
    try {
      await page.evaluate(() => window.scrollTo(0, 0.54 * 6000))
      await page.waitForTimeout(400)
      const exp = await page.locator("text=Amcap").first().isVisible({ timeout: 2000 }).catch(() => false)
      if (exp) {
        log("ok", "Experience section visible (Amcap found)")
      }
    } catch (e) {
      log("warn", `Experience check: ${e.message}`)
    }

    // 9. Check console for errors
    await page.waitForTimeout(300)
    if (consoleErrors.length === 0) {
      log("ok", "No console errors")
    } else {
      consoleErrors.forEach((err) => {
        log("error", `Console error: ${err.slice(0, 120)}`)
        issues.errors.push(`Console error on ${device}: ${err}`)
      })
    }

    if (consoleWarnings.length === 0) {
      log("ok", "No console warnings")
    } else {
      consoleWarnings.forEach((w) => {
        log("warn", `Console warning: ${w.slice(0, 120)}`)
        issues.warnings.push(`Console warning on ${device}: ${w}`)
      })
    }

    // 10. Screenshot
    try {
      await page.screenshot({ path: `/tmp/screenshot-${device}.png`, fullPage: true })
      log("ok", `Screenshot saved (screenshot-${device}.png)`)
    } catch (e) {
      log("warn", `Screenshot failed: ${e.message}`)
    }

    await context.close()
  }

  await browser.close()

  // Summary
  console.log("\n========== QA SUMMARY ==========\n")
  console.log(`  Errors:   ${issues.errors.length}`)
  console.log(`  Warnings: ${issues.warnings.length}`)
  console.log(`  Failures: ${issues.failures.length}`)

  if (issues.errors.length > 0) {
    console.log("\n--- Errors ---")
    issues.errors.forEach((e) => console.log(`  • ${e}`))
  }
  if (issues.warnings.length > 0) {
    console.log("\n--- Warnings ---")
    issues.warnings.forEach((w) => console.log(`  • ${w}`))
  }
  if (issues.failures.length > 0) {
    console.log("\n--- Failures ---")
    issues.failures.forEach((f) => console.log(`  • ${f}`))
  }

  const passed = issues.errors.length === 0 && issues.failures.length === 0
  console.log(`\n  ${passed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}\n`)
  process.exit(passed ? 0 : 1)
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err)
  process.exit(1)
})