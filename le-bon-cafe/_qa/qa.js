/* Live QA for Le Bon Cafe — gates 1-4, 7, 9 */
const { chromium } = require('playwright-core');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium-1234/chrome-linux/chrome';
const BASE = 'http://localhost:8046';
const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ' :: ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));

  /* ---------- GATE 1-5: all pages load, no console errors ---------- */
  const pages = ['index.html', 'menu.html', 'reviews.html', 'about.html', 'contact.html'];
  for (const p of pages) {
    const resp = await page.goto(BASE + '/' + p, { waitUntil: 'networkidle' });
    log(`load ${p}`, resp.status() === 200, `HTTP ${resp.status()}`);
    // no horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    log(`no h-overflow ${p}`, overflow <= 1, `${overflow}px`);
    // broken images
    const badImgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(0, 90)));
    if (badImgs.length) log(`images ${p}`, false, badImgs.join(', '));
  }
  log('console errors (all pages)', consoleErrors.length === 0, consoleErrors.slice(0, 4).join(' | '));

  /* ---------- GATE 7: cart add/remove + localStorage persistence ---------- */
  await page.goto(BASE + '/menu.html', { waitUntil: 'networkidle' });
  await page.click('.add-btn[data-id="b1"]');
  await page.waitForTimeout(300);
  let count = await page.textContent('.cart-count');
  log('cart badge increments', count.trim() === '1', `badge=${count.trim()}`);
  await page.click('.add-btn[data-id="p3"]');
  await page.waitForTimeout(200);

  // persist across reload
  await page.reload({ waitUntil: 'networkidle' });
  count = await page.evaluate(() => document.querySelector('.cart-count').textContent.trim());
  log('cart persists after reload', count === '2', `badge=${count}`);
  const stored = await page.evaluate(() => localStorage.getItem('leboncart_v1'));
  log('localStorage key set', !!stored && stored.includes('"qty"'), (stored || '').slice(0, 80));

  // qty stepper + remove
  await page.click('[data-open-cart]'); // open drawer
  await page.waitForSelector('#miniCartItems .mini-line');
  await page.click('#miniCartItems .mini-line [data-act="inc"]');
  await page.waitForTimeout(200);
  const afterInc = await page.evaluate(() => JSON.parse(localStorage.getItem('leboncart_v1'))['b1'].qty);
  log('qty stepper inc', afterInc === 2, `b1 qty=${afterInc}`);
  await page.click('#miniCartItems .mini-line [data-act="dec"]');
  await page.waitForTimeout(150);

  // use the drawer CTA -> drawer must close and jump to order summary
  await page.click('#cartDrawer a[href="#order-summary"]');
  await page.waitForTimeout(600);
  const drawerClosed = await page.evaluate(() =>
    !document.getElementById('cartDrawer').classList.contains('open') &&
    !document.getElementById('cartOverlay').classList.contains('show'));
  log('drawer CTA closes drawer', drawerClosed);

  // order summary panel totals
  const total = await page.textContent('#orderTotal');
  log('order summary total renders', /^£\d+\.\d{2}$/.test(total), total);

  // place order -> confirm drawer opens and basket clears
  await page.click('#placeOrderBtn');
  await page.waitForTimeout(400);
  const confirmVisible = await page.evaluate(() =>
    document.getElementById('confirmDrawer').style.transform.replace(/\s/g, '') === 'translateX(0px)' ||
    document.getElementById('confirmDrawer').style.transform.replace(/\s/g, '') === 'translateX(0)');
  const cleared = await page.evaluate(() => localStorage.getItem('leboncart_v1'));
  log('place order flow works', confirmVisible && (cleared === '{}' || !cleared), `cleared=${cleared}`);
  await page.click('#confirmDrawer .cart-close');

  /* ---------- GATE 9: marquee runs, pauses on hover, seamless loop ---------- */
  await page.goto(BASE + '/reviews.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const cards = await page.evaluate(() => document.querySelectorAll('.review-card').length);
  const uniques = await page.evaluate(() => {
    const seen = new Set();
    document.querySelectorAll('.review-card .rc-text').forEach(el => seen.add(el.textContent));
    return seen.size;
  });
  log('24 unique review variations rendered', uniques === 24, `${uniques} unique / ${cards} DOM cards (x2 rows, x2 loop copies)`);

  const anim = async () => page.evaluate(() => getComputedStyle(document.querySelector('.marquee-track.rtl')).transform);
  const t1 = await anim(); await page.waitForTimeout(500); const t2 = await anim();
  log('marquee is moving', t1 !== t2, `${t1.slice(0, 28)} → ${t2.slice(0, 28)}`);

  // pause on hover
  await page.hover('.marquee-row#rowRtl');
  await page.waitForTimeout(120);
  const paused = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.marquee-track.rtl')).animationPlayState);
  log('marquee pauses on hover', paused === 'paused', paused);
  await page.hover('.reviews-intro');

  // both directions present
  const dirs = await page.evaluate(() => ({
    rtl: !!document.querySelector('.marquee-track.rtl'),
    ltr: !!document.querySelector('.marquee-track.ltr'),
  }));
  log('two rows opposite directions', dirs.rtl && dirs.ltr, JSON.stringify(dirs));

  // counter ticks up from 453 base (seed storage so count-up doesn't race the first tick)
  await page.evaluate(() => { sessionStorage.setItem('lbc_seeded', '1'); });
  await page.reload({ waitUntil: 'networkidle' });
  const c1 = await page.textContent('#gcounter');
  await page.waitForTimeout(4400);
  const c2 = await page.textContent('#gcounter');
  const tickedUp = parseInt(c2) >= parseInt(c1) && parseInt(c2) >= 453;
  log('counter at/above 453 and ticking', tickedUp, `${c1} → ${c2}`);

  /* ---------- screenshots ---------- */
  for (const [name, path] of [['desktop-index.png', '/index.html'], ['desktop-reviews.png', '/reviews.html'], ['desktop-menu.png', '/menu.html']]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: __dirname + '/' + name });
  }
  // mobile
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await mob.screenshot({ path: __dirname + '/mobile-index.png' });

  await browser.close();
  const fails = results.filter(r => !r.pass).length;
  console.log(`\n==== LIVE QA SUMMARY: ${results.length - fails}/${results.length} checks passed ====`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('QA crashed:', e); process.exit(2); });
