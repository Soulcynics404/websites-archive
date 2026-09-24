/* Functional QA harness — Coffee in the Wood
   Gates 1-5,7,8,9 exercised headlessly with playwright-core + system chromium.
   Usage: NODE_PATH=<node_modules> node qa.mjs */
import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://127.0.0.1:8090';
const SHOT_DIR = '/home/ubuntu/builds/sites/coffee-in-the-wood/_qa';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const EXE = '/home/ubuntu/.cache/ms-playwright/chromium-1237/chrome-linux/chrome';
const results = [];
const check = (gate, ok, detail = '') =>
  results.push({ gate, ok, detail: String(detail).slice(0, 220) });

const browser = await chromium.launch({ executablePath: EXE });
try {
  /* ---------- PAGE LOADS (Gate 1) ---------- */
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  for (const p of ['index.html', 'menu.html', 'reviews.html', 'about.html', 'contact.html']) {
    const errs = [];
    const h = await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle', timeout: 30000 })
      .then(r => r.status()).catch(e => 'ERR:' + e.message);
    check(`load ${p}`, h === 200, `status=${h}`);
  }
  check('no uncaught JS errors across pages', pageErrors.length === 0, pageErrors.join(' | '));

  /* ---------- GATE 2/3/4: hero renders instantly + 3D layers ---------- */
  const t0 = Date.now();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'commit' });
  const lcpEl = await page.waitForSelector('.hero h1', { timeout: 5000 });
  const lcpMs = Date.now() - t0;
  const heroVisible = await lcpEl.isVisible() && (await lcpEl.boundingBox()) !== null;
  check('LCP hero <h1> visible immediately', heroVisible && lcpMs < 2500, `${lcpMs}ms to render`);
  const layerInfo = await page.evaluate(() => {
    const stage = document.getElementById('heroStage');
    const cs = getComputedStyle(stage);
    return {
      perspective: cs.perspective,
      transformStyle: cs.transformStyle,
      floats: document.querySelectorAll('.float-card').length,
      backZ: getComputedStyle(document.querySelector('.layer-back')).transform,
      parentPerspective: getComputedStyle(document.querySelector('.hero')).perspective,
    };
  });
  check('hero has perspective + preserve-3d + 3 float cards',
    parseFloat(layerInfo.parentPerspective) > 0 && layerInfo.transformStyle === 'preserve-3d' && layerInfo.floats === 3,
    JSON.stringify(layerInfo).slice(0, 200));

  // mouse-parallax changes --ry
  await page.mouse.move(600, 400);
  const ryBefore = await page.evaluate(() => getComputedStyle(document.getElementById('heroStage')).getPropertyValue('--ry'));
  await page.mouse.move(150, 150, { steps: 4 });
  await page.waitForTimeout(120);
  const ryAfter = await page.evaluate(() => getComputedStyle(document.getElementById('heroStage')).getPropertyValue('--ry'));
  check('mouse-parallax tilts hero stage', ryBefore.trim() !== ryAfter.trim(), `--ry '${ryBefore.trim()}' -> '${ryAfter.trim()}'`);

  /* ---------- GATE 6 (part 1): internal nav links resolve ---------- */
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  const linkCheck = await page.evaluate(async () => {
    const bad = [];
    const urls = new Set();
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (/^(https?:|tel:|mailto:|#)/.test(href)) return;
      urls.add(new URL(href, location.href).href.split('#')[0]);
    });
    for (const u of urls) {
      const r = await fetch(u, { method: 'GET' });
      if (!r.ok) bad.push(u + ' -> ' + r.status);
    }
    return bad;
  });
  check('all in-page link targets fetch OK', linkCheck.length === 0, linkCheck.join(', ') || 'ok');

  /* ---------- GATE 7: cart add/remove/persist ---------- */
  await page.goto(`${BASE}/menu.html`, { waitUntil: 'networkidle' });
  const addBtns = await page.locator('.add-btn').count();
  check('17 Add-to-Order buttons on menu', addBtns === 17, `${addBtns}`);
  const btn = page.locator('.add-btn[data-id="fw"]');
  await btn.click(); await btn.click();            // Flat White x2
  await page.locator('.add-btn[data-id="croiss"]').click(); // Croissant x1
  await page.waitForTimeout(150);
  let cart = await page.evaluate(() => JSON.parse(localStorage.getItem('citw_cart_v1') || '[]'));
  check('cart add writes localStorage', cart.length === 2 && cart[0].qty === 2 && cart[1].id === 'croiss', JSON.stringify(cart));
  let badge = await page.locator('[data-cart-count]').first().textContent();
  check('cart badge shows 3', badge.trim() === '3', badge);

  // remove via ✕ (first line = Flat White -> croissant remains)
  await page.locator('.cart-remove').first().click();
  cart = await page.evaluate(() => JSON.parse(localStorage.getItem('citw_cart_v1') || '[]'));
  check('cart remove deletes the targeted line', cart.length === 1 && cart[0].id === 'croiss' && cart[0].qty === 1, JSON.stringify(cart));

  // qty + on the remaining croissant
  await page.locator('.cart-item .qty-btn').nth(1).click();
  cart = await page.evaluate(() => JSON.parse(localStorage.getItem('citw_cart_v1') || '[]'));
  check('quantity + increments line', cart[0].qty === 2, JSON.stringify(cart));
  const totalTxt = await page.locator('#cart-total').textContent();
  check('total = £5.90 (2×£2.95)', totalTxt.trim() === '£5.90', totalTxt);

  /* persistence: reload keeps items */
  await page.reload({ waitUntil: 'domcontentloaded' });
  cart = await page.evaluate(() => JSON.parse(localStorage.getItem('citw_cart_v1') || '[]'));
  check('cart persists after reload', cart.length === 1 && cart[0].id === 'croiss' && cart[0].qty === 2, JSON.stringify(cart));
  const summaryLines = await page.locator('#summary-list li:not(.os-placeholder)').count();
  const checkoutDisabled = await page.evaluate(() => document.getElementById('checkoutBtn').classList.contains('is-disabled'));
  check('order summary lists lines & checkout enabled', summaryLines >= 2 && !checkoutDisabled, `lines=${summaryLines}`);

  /* clear cart */
  await page.locator('#clearCart').click();
  cart = await page.evaluate(() => JSON.parse(localStorage.getItem('citw_cart_v1') || '[]'));
  const emptyShown = await page.locator('#cart-empty').isVisible();
  check('clear cart empties + empty state returns', cart.length === 0 && emptyShown, JSON.stringify(cart));

  /* cross-page persistence (index badge reflects cart from menu) */
  await page.locator('.add-btn[data-id="latte"]').click();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  badge = await page.locator('[data-cart-count]').first().textContent();
  check('badge persists across pages', badge.trim() === '1', badge);

  /* ---------- GATE 8: contact form ---------- */
  await page.goto(`${BASE}/contact.html`, { waitUntil: 'domcontentloaded' });
  const formAction = await page.evaluate(() => document.getElementById('contactForm').action);
  check('form action = formsubmit.co target', /formsubmit\.co\/harshraj8253@gmail\.com$/.test(formAction), formAction);
  await page.fill('#cf-name', 'QA Bot');
  await page.fill('#cf-email', 'qa@example.com');
  await page.fill('#cf-msg', 'Functional test message.');
  const [req] = await Promise.all([
    page.waitForRequest(r => r.url().includes('formsubmit.co'), { timeout: 8000 }).catch(() => null),
    page.click('#contactForm button[type="submit"]'),
  ]);
  check('submit issues POST to formsubmit.co', !!req && req.method() === 'POST', req ? req.url() : 'no request captured');
  const statusShown = await page
    .waitForFunction(() => document.getElementById('formStatus')?.classList.contains('show'), null, { timeout: 1200 })
    .then(() => true)
    .catch(() => false);
  const navigatedAway = !page.url().includes('contact.html');
  check('confirmation status shown on submit', statusShown || navigatedAway, `status=${statusShown} navigated=${navigatedAway}`);

  /* ---------- GATE 9: reviews marquee ---------- */
  await page.goto(`${BASE}/reviews.html`, { waitUntil: 'networkidle' });
  const marquee = await page.evaluate(() => ({
    tracks: document.querySelectorAll('.marquee-track').length,
    cardsPerTrack: document.querySelectorAll('.marquee-track')[0].children.length,
    uniqueReviews: document.querySelectorAll('.marquee-track')[0].children.length / 2,
    directions: [...document.querySelectorAll('.marquee-track')].map(t => getComputedStyle(t).animationDirection),
    durations: [...document.querySelectorAll('.marquee-track')].map(t => getComputedStyle(t).animationDuration),
  }));
  check('2 marquee rows × 48 cards (24 unique ×2)',
    marquee.tracks === 2 && marquee.cardsPerTrack === 48,
    `tracks=${marquee.tracks} cards=${marquee.cardsPerTrack} dirs=${marquee.directions} dur=${marquee.durations}`);
  check('rows run opposite directions', marquee.directions.join(',') === 'normal,reverse', marquee.directions.join(','));

  // measure movement over ~700ms and hover pause
  const xAt = () => page.evaluate(() => {
    const t = getComputedStyle(document.querySelectorAll('.marquee-track')[0]);
    return new DOMMatrixReadOnly(t.transform === 'none' ? '' : t.transform).m41;
  });
  const x1 = await xAt(); await page.waitForTimeout(700); const x2 = await xAt();
  const moving = Math.abs(x2 - x1) > 2;
  check('marquee actually animates (60fps-capable transform)', moving, `Δx=${(x2 - x1).toFixed(1)}px over 700ms`);
  // bring the first marquee into the viewport, then park the cursor on it
  await page.evaluate(() => document.querySelectorAll('.marquee')[0].scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(150);
  const mb = await page.evaluate(() => {
    const r = document.querySelectorAll('.marquee')[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(mb.x, mb.y);
  await page.waitForTimeout(80);
  const hovering = await page.evaluate(() => document.querySelectorAll('.marquee')[0].matches(':hover'));
  await page.waitForTimeout(120);
  const x3 = await xAt(); await page.waitForTimeout(650); const x4 = await xAt();
  check('pause-on-hover works', Math.abs(x4 - x3) < 0.6 && hovering, `Δx while hovering=${Math.abs(x4 - x3).toFixed(2)}px, :hover=${hovering}`);

  /* counter ticks up (fresh load so we catch it mid-animation) */
  await page.goto(`${BASE}/reviews.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-countup="630"]', { timeout: 5000 });
  const c1 = parseInt(await page.locator('[data-countup="630"]').textContent()) || 0;
  await page.waitForTimeout(600);
  const c2 = parseInt(await page.locator('[data-countup="630"]').textContent());
  check('review counter ticks up toward 630', c2 > c1, `${c1} -> ${c2}`);
  await page.waitForTimeout(2600);
  const c3 = await page.locator('[data-countup="630"]').textContent();
  check('counter lands exactly on 630', c3.trim() === '630', c3);

  /* screenshots for the record */
  await page.screenshot({ path: `${SHOT_DIR}/reviews-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT_DIR}/final-mobile.png`, fullPage: false });
  await page.setViewportSize({ width: 1366, height: 850 });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT_DIR}/final-desktop.png` });
  await page.goto(`${BASE}/menu.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOT_DIR}/menu-desktop.png`, fullPage: true });
} finally {
  await browser.close();
}

console.log('\n' + '='.repeat(74));
let fails = 0;
for (const r of results) {
  console.log(`[${r.ok ? 'PASS' : 'FAIL'}] ${r.gate}${r.detail ? '  — ' + r.detail : ''}`);
  if (!r.ok) fails++;
}
console.log('='.repeat(74));
console.log(`${results.length - fails}/${results.length} browser checks passed`);
process.exit(fails ? 1 : 0);
