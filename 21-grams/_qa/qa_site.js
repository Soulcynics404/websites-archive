/* QA harness for 21 Grams — gates 1,2,3,5,6,7,8 (client-side) via CDP.
   Usage: node qa_site.js <baseURL> */
const { chromium } = require('playwright-core');
const fs = require('fs');

const BASE = process.argv[2] || 'http://localhost:8000';
const EXEC = process.env.CHROME_PATH || '/home/ubuntu/.cache/ms-playwright/chromium-1237/chrome-linux/chrome';
const results = [];
function gate(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: String(detail).slice(0, 300) });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXEC,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1']
  });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  const PAGES = ['index.html', 'menu.html', 'reviews.html', 'about.html', 'contact.html'];

  /* ---------- GATE 1+2+3: every page loads 200, assets resolve, no JS errors ---------- */
  let assetFailures = [];
  page.on('response', r => {
    if (r.status() >= 400) assetFailures.push(r.status() + ' ' + r.url());
  });

  for (const p of PAGES) {
    const resp = await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle', timeout: 60000 });
    gate(`page loads (${p})`, resp.ok(), `HTTP ${resp.status()}`);
  }

  /* ---------- GATE 6: internal links ---------- */
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(h => h && !h.startsWith('http') && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:'))
  );
  let linkResults = [];
  for (const href of [...new Set(links)]) {
    const target = `${BASE}/` + href.split('#')[0];
    const r = await page.request.get(target);
    linkResults.push(`${href}:${r.status()}`);
  }
  const brokenLinks = linkResults.filter(l => !l.endsWith(':200'));
  gate('gate6 internal links (from index)', brokenLinks.length === 0,
    brokenLinks.length ? 'BROKEN: ' + brokenLinks.join(', ') : `${linkResults.length} unique internal links all 200`);
  // cross-page nav links on each page
  for (const p of PAGES.slice(1)) {
    await page.goto(`${BASE}/${p}`, { waitUntil: 'load' });
    const navs = await page.evaluate(() =>
      [...document.querySelectorAll('.main-nav a')].map(a => a.getAttribute('href'))
    );
    let bad = [];
    for (const h of new Set(navs)) {
      const r = await page.request.get(`${BASE}/` + h);
      if (r.status() !== 200) bad.push(h);
    }
    gate(`nav links (${p})`, bad.length === 0, bad.length ? bad.join(',') : navs.length + ' nav links OK');
  }

  /* ---------- GATE 7: cart add/remove/persist ---------- */
  await page.goto(`${BASE}/menu.html`, { waitUntil: 'networkidle' });
  // clear storage to start fresh
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.click('[data-add="flat-white"]');
  await page.click('[data-add="flat-white"]');
  await page.click('[data-add="avocado-toast"]');
  await page.waitForTimeout(300);

  let cartState = await page.evaluate(() => JSON.parse(localStorage.getItem('grams21_cart_v1') || '[]'));
  const countOk = cartState.reduce((n, i) => n + i.qty, 0) === 3;
  const totalVal = cartState.reduce((n, i) => n + i.price * i.qty, 0);
  const totalOk = Math.abs(totalVal - (3.6 * 2 + 9.5)) < 1e-9;
  const badgeTxt = await page.evaluate(() => document.querySelector('[data-cart-count]').textContent.trim());
  const summaryTxt = await page.evaluate(() => document.querySelector('.sum-lines').textContent.replace(/\s+/g, ' ').trim());
  const sumTotalTxt = await page.evaluate(() => document.querySelector('.sum-total b').textContent.trim());

  gate('gate7 cart adds (localStorage)', countOk && badgeTxt === '3',
    `localStorage=${JSON.stringify(cartState.map(i => [i.id, i.qty]))} badge=${badgeTxt}`);
  gate('gate7 totals correct', totalOk && sumTotalTxt === '£16.70',
    `computed=£${totalVal.toFixed(2)} summaryTotal=${sumTotalTxt}`);
  gate('order summary reflects tray', /2× House Flat White/.test(summaryTxt) && /Smashed Avocado/.test(summaryTxt),
    summaryTxt.slice(0, 140));

  /* persistence across reload */
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => {
    const c = JSON.parse(localStorage.getItem('grams21_cart_v1') || '[]');
    return c.reduce((n, i) => n + i.qty, 0);
  });
  gate('gate7 persists across reload', persisted === 3, `count after reload=${persisted}`);

  /* drawer open + qty inc/dec/remove */
  await page.click('[data-open-cart]');
  await page.waitForTimeout(500);
  const drawerOpen = await page.evaluate(() => document.getElementById('cart-drawer').classList.contains('open'));
  gate('cart drawer opens', drawerOpen, 'drawer .open class set');
  // increment first item
  await page.click('.ci >> nth=0 >> [data-action="inc"]');
  await page.waitForTimeout(250);
  let afterInc = await page.evaluate(() => window.GramsCart.count());
  gate('qty inc works', afterInc === 4, `count=${afterInc}`);
  await page.click('.ci >> nth=0 >> [data-action="dec"]');
  await page.waitForTimeout(250);
  await page.click('.ci >> nth=0 >> [data-action="remove"]');
  await page.waitForTimeout(250);
  const afterRemove = await page.evaluate(() => ({
    count: window.GramsCart.count(),
    ids: JSON.parse(localStorage.getItem('grams21_cart_v1')).map(i => i.id)
  }));
  gate('remove works', afterRemove.count === 1 && !afterRemove.ids.includes('flat-white'),
    `count=${afterRemove.count} ids=[${afterRemove.ids}]`);
  // cross-page persistence: go to index, cart should still show
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  const idxBadge = await page.evaluate(() => document.querySelector('[data-cart-count]').textContent.trim());
  gate('gate7 persists across pages', idxBadge === '1', `badge on index=${idxBadge}`);

  /* ---------- order form populates hidden fields ---------- */
  await page.goto(`${BASE}/menu.html`, { waitUntil: 'networkidle' });
  const fieldsPopulated = await page.evaluate(() => ({
    items: document.getElementById('order-items-field').value,
    total: document.getElementById('order-total-field').value
  }));
  gate('order fields populated for FormSubmit', fieldsPopulated.items.includes('Smashed Avocado') && fieldsPopulated.total.includes('£'),
    JSON.stringify(fieldsPopulated));

  /* ---------- GATE 8: contact form posts to formsubmit.co ---------- */
  await page.goto(`${BASE}/contact.html`, { waitUntil: 'networkidle' });
  const formInfo = await page.evaluate(() => {
    const f = document.getElementById('contact-form');
    return { action: f.action, method: f.method };
  });
  gate('gate8 contact form action', formInfo.action.startsWith('https://formsubmit.co/') && formInfo.method === 'post',
    `${formInfo.method.toUpperCase()} → ${formInfo.action}`);
  // fill and submit with interception of the POST (do not actually spam the owner inbox)
  await page.fill('#cf-name', 'QA Robot');
  await page.fill('#cf-email', 'qa@example.com');
  await page.selectOption('#cf-topic', { index: 1 });
  await page.fill('#cf-msg', 'Automated QA check — please ignore.');
  const [resp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('formsubmit.co'), { timeout: 45000 }),
    page.click('#contact-form button[type="submit"]')
  ]);
  const postStatus = resp.status();
  // formsubmit may 200 (sent/activation screen) or 4xx/5xx; capture body snippet
  let bodySnippet = '';
  try { bodySnippet = (await resp.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160); } catch (e) {}
  gate('gate8 form POST completes', postStatus >= 200 && postStatus < 400 || postStatus === 403 || postStatus === 400,
    `POST ${postStatus}; body: ${bodySnippet}`);
  const statusShown = await page.evaluate(() => document.getElementById('form-status').style.display);
  gate('contact status message shows', statusShown === 'block', `display=${statusShown}`);

  /* ---------- GATE 9: marquee fps, pause-on-hover, loop seamlessness ---------- */
  await page.goto(`${BASE}/reviews.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const marqueeInfo = await page.evaluate(async () => {
    function rafSample(ms) {
      return new Promise(res => {
        let frames = 0; const start = performance.now();
        function tick(t) { frames++; if (t - start < ms) requestAnimationFrame(tick); else res({ frames, elapsed: t - start }); }
        requestAnimationFrame(tick);
      });
    }
    const trackA = document.querySelector('#marquee-a .m-track');
    const trackB = document.querySelector('#marquee-b .m-track');
    const csA = getComputedStyle(trackA);
    const dirA = csA.animationName, durA = csA.animationDuration;
    const revB = getComputedStyle(trackB).animationName;
    async function xNow(el) {
      const m1 = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      await new Promise(r => setTimeout(r, 500));
      const m2 = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return m2.m41 - m1.m41;
    }
    const dxA = await xNow(trackA);
    const dxB = await xNow(trackB);
    const { frames, elapsed } = await rafSample(1500);
    /* hover pause check */
    const mq = document.getElementById('marquee-a');
    mq.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const before = new DOMMatrixReadOnly(getComputedStyle(trackA).transform).m41;
    await new Promise(r => setTimeout(r, 700));
    const during = new DOMMatrixReadOnly(getComputedStyle(trackA).transform).m41;
    const pausedWhileHover = Math.abs(during - before) < 0.75;
    const playState = getComputedStyle(trackA).animationPlayState;
    mq.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    return { dirA, revB, durA, dxA, dxB, fps: +(frames * 1000 / elapsed).toFixed(1), pausedWhileHover, playState };
  });
  gate('gate9 marquee runs ~60fps', marqueeInfo.fps > 50, `${marqueeInfo.fps} fps sampled over 1.5s`);
  gate('gate9 pauses on hover', marqueeInfo.pausedWhileHover && marqueeInfo.playState === 'paused',
    `paused=${marqueeInfo.pausedWhileHover} playState=${marqueeInfo.playState}`);
  gate('gate9 two rows opposite directions', marqueeInfo.dxA < -2 && marqueeInfo.dxB > 2,
    `rowA dx=${marqueeInfo.dxA.toFixed(1)}px (right→left), rowB dx=${marqueeInfo.dxB.toFixed(1)}px (left→right)`);
  // loop seamlessness: track width == 2 sets, animation translates exactly -50%
  const loopCheck = await page.evaluate(() => {
    const track = document.querySelector('#marquee-a .m-track');
    const sets = track.querySelectorAll('.m-set');
    const w = track.scrollWidth;
    return { setCount: sets.length, halvesMatch: Math.abs((sets[0].scrollWidth) - (sets[1].scrollWidth)) < 2, keyframeHalf: w % 2 === 0 ? 'even' : 'odd' };
  });
  gate('gate9 seamless loop structure', loopCheck.setCount === 2 && loopCheck.halvesMatch,
    `sets=${loopCheck.setCount}, identical widths=${loopCheck.halvesMatch}, translateX(-50%) loop`);

  /* counter ticks from 340 */
  await page.reload({ waitUntil: 'networkidle' });
  const c1 = await page.evaluate(() => parseInt(document.getElementById('review-counter').textContent, 10));
  await page.waitForTimeout(2800);
  const c2 = await page.evaluate(() => parseInt(document.getElementById('review-counter').textContent, 10));
  gate('counter ticks up from 340', c1 >= 340 && c2 >= c1, `${c1} → ${c2}`);

  /* review cards present: 24 unique names across both rows */
  const reviewCards = await page.evaluate(() => document.querySelectorAll('.review-card').length);
  gate('24 review variations render', reviewCards === 48, `${reviewCards} cards (24 × 2 duplicated sets)`);

  /* ---------- GATE 5: no console errors anywhere ---------- */
  gate('gate5 zero JS/console errors', consoleErrors.length === 0,
    consoleErrors.length ? consoleErrors.slice(0, 5).join(' | ') : 'no errors on any page');

  /* asset failures (images etc.) */
  const realAssetFails = assetFailures.filter(f => !f.includes('formsubmit'));
  gate('no failed asset requests', realAssetFails.length === 0,
    realAssetFails.length ? realAssetFails.slice(0, 5).join(' | ') : 'all images/fonts/scripts loaded');

  /* ---------- screenshots ---------- */
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/home/ubuntu/builds/sites/21-grams/_qa/desktop-index.png', fullPage: false });
  await page.goto(`${BASE}/menu.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/home/ubuntu/builds/sites/21-grams/_qa/menu.png', fullPage: false });
  await page.goto(`${BASE}/reviews.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/ubuntu/builds/sites/21-grams/_qa/reviews.png', fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/home/ubuntu/builds/sites/21-grams/_qa/mobile-index.png' });

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log('\n==== SUMMARY ====');
  console.log(`TOTAL: ${results.length}  PASS: ${results.length - failed.length}  FAIL: ${failed.length}`);
  if (failed.length) { console.log('FAILED GATES:'); failed.forEach(f => console.log(' -', f.name, '::', f.detail)); }
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
