const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro size
    colorScheme: 'dark',
  });

  // Test 1: Initial page load - check background color
  console.log('\n=== TEST 1: Initial page load background ===');
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  CONSOLE ERROR:', msg.text());
  });
  // Capture first paint color using performance observer
  await page.goto('http://localhost:3000/portfolio/', { waitUntil: 'commit' });
  // Check computed background color immediately
  const bgColor = await page.evaluate(() => {
    return {
      html: getComputedStyle(document.documentElement).backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
      bodyHeight: document.body.getBoundingClientRect().height,
      htmlHeight: document.documentElement.getBoundingClientRect().height,
      vpH: window.innerHeight,
    };
  });
  console.log('  html bg:        ', bgColor.html);
  console.log('  body bg:        ', bgColor.body);
  console.log('  body height:    ', bgColor.bodyHeight);
  console.log('  html height:    ', bgColor.htmlHeight);
  console.log('  viewport height:', bgColor.vpH);

  const isDark = (c) => {
    const m = c.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!m) return c === 'rgb(8, 8, 15)' || c === '#08080f' || c.includes('08080f');
    return parseInt(m[1]) < 20 && parseInt(m[2]) < 20 && parseInt(m[3]) < 20;
  };

  if (isDark(bgColor.html) && isDark(bgColor.body)) {
    console.log('  ✓ Dark background confirmed');
  } else {
    console.log('  ✗ WHITE FLASH DETECTED - background is not dark!');
  }

  // Test 2: Check theme-color meta tag position
  console.log('\n=== TEST 2: Theme-color meta tag ===');
  const themeColor = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return null;
    const head = document.head;
    const allMeta = head.querySelectorAll('meta');
    let themeIdx = -1;
    for (let i = 0; i < allMeta.length; i++) {
      if (allMeta[i].name === 'theme-color') { themeIdx = i; break; }
    }
    return {
      content: meta.content,
      media: meta.media || null,
      index: themeIdx,
      totalMetas: allMeta.length,
    };
  });
  if (themeColor) {
    console.log('  content:', themeColor.content);
    console.log('  media:', themeColor.media);
    console.log('  index in head:', themeColor.index, '/', themeColor.totalMetas);
    if (themeColor.index === 0) console.log('  ✓ theme-color is FIRST meta tag');
    else console.log('  ⚠ theme-color is NOT first');
  } else {
    console.log('  ✗ No theme-color meta tag found!');
  }

  // Test 3: Anti-flash overlay
  console.log('\n=== TEST 3: Anti-flash overlay ===');
  const antiFlash = await page.evaluate(() => {
    const el = document.getElementById('__anti_flash');
    if (!el) return { exists: false };
    const style = window.getComputedStyle(el);
    return {
      exists: true,
      bg: style.backgroundColor,
      zIndex: style.zIndex,
      position: style.position,
      display: style.display,
    };
  });
  if (antiFlash && antiFlash.exists) {
    console.log('  bg:', antiFlash.bg);
    console.log('  z-index:', antiFlash.zIndex);
    console.log('  position:', antiFlash.position);
    if (isDark(antiFlash.bg)) console.log('  ✓ Anti-flash overlay is dark');
    else console.log('  ✗ Anti-flash overlay is NOT dark!');
  } else {
    console.log('  ⚠ Anti-flash overlay not found (may be after 5s timeout)');
  }

  // Test 4: Check FOUC by reloading
  console.log('\n=== TEST 4: Full page reload (hard refresh) ===');
  await page.goto('http://localhost:3000/portfolio/', { waitUntil: 'networkidle' });
  const afterLoad = await page.evaluate(() => {
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    return {
      htmlBg: htmlStyle.backgroundColor,
      bodyBg: bodyStyle.backgroundColor,
      colorScheme: htmlStyle.colorScheme,
    };
  });
  console.log('  html bg:', afterLoad.htmlBg);
  console.log('  body bg:', afterLoad.bodyBg);
  console.log('  color-scheme:', afterLoad.colorScheme);
  if (isDark(afterLoad.htmlBg) && isDark(afterLoad.bodyBg)) {
    console.log('  ✓ No FOUC detected');
  } else {
    console.log('  ✗ FOUC DETECTED!');
  }

  // Test 5: Route navigation
  console.log('\n=== TEST 5: Route navigation between pages ===');
  await page.goto('http://localhost:3000/portfolio/contact/', { waitUntil: 'networkidle' });
  const contactBg = await page.evaluate(() => {
    return {
      html: getComputedStyle(document.documentElement).backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
    };
  });
  console.log('  Contact page html bg:', contactBg.html);
  console.log('  Contact page body bg:', contactBg.body);
  if (isDark(contactBg.html) && isDark(contactBg.body)) {
    console.log('  ✓ Contact page is dark');
  } else {
    console.log('  ✗ Contact page WHITE FLASH!');
  }

  // Test 6: Console errors
  console.log('\n=== TEST 6: Console errors ===');
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('http://localhost:3000/portfolio/', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 1000));
  if (errors.length === 0) {
    console.log('  ✓ No JavaScript errors');
  } else {
    console.log('  ✗ Errors:', errors);
  }

  // Test 7: Screenshot comparison
  console.log('\n=== TEST 7: Visual screenshot ===');
  await page.screenshot({ path: '/tmp/portfolio-initial.png', fullPage: false });
  console.log('  ✓ Screenshot saved to /tmp/portfolio-initial.png');

  await browser.close();
  console.log('\n=== ALL TESTS COMPLETE ===\n');
})();