/* Visual sanity: hero 3D parallax responds to mouse; images actually render (naturalWidth>0). */
const { chromium } = require('playwright-core');
const BASE = process.argv[2] || 'https://21-grams-alpha.vercel.app';
const EXEC = '/home/ubuntu/.cache/ms-playwright/chromium-1237/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newContext({ viewport: { width: 1366, height: 900 } }).then(c => c.newPage());

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.mouse.move(400, 300);
  await page.waitForTimeout(250);

  const before = await page.evaluate(() => {
    const s = document.getElementById('hero-scene');
    return {
      rx: s.style.getPropertyValue('--rx'),
      mx: s.style.getPropertyValue('--mx'),
      imgsBroken: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src.slice(0, 90))
    };
  });

  await page.mouse.move(1200, 700);
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => {
    const s = document.getElementById('hero-scene');
    return { rx: s.style.getPropertyValue('--rx'), mx: s.style.getPropertyValue('--mx') };
  });

  console.log(`parallax before mouse: --mx=${before.mx} | after: --mx=${after.mx}`);
  console.log(before.mx !== after.mx ? 'PASS | hero mouse-parallax updates CSS vars' : 'FAIL | no parallax response');
  console.log(before.imgsBroken.length === 0
    ? 'PASS | all hero images decoded (naturalWidth > 0)'
    : 'FAIL | broken imgs: ' + before.imgsBroken.join(', '));

  /* marquee visual: cards visible and moving in both rows */
  await page.goto(`${BASE}/reviews.html`, { waitUntil: 'networkidle' });
  const vis = await page.evaluate(() => {
    const a = document.querySelectorAll('#marquee-a .review-card').length;
    const b = document.querySelectorAll('#marquee-b .review-card').length;
    const r = document.querySelector('#marquee-a .review-card').getBoundingClientRect();
    return { a, b, onScreen: r.width > 100 && r.height > 100 };
  });
  console.log(vis.a >= 12 && vis.b >= 12 && vis.onScreen
    ? `PASS | marquee cards rendered & sized (${vis.a}+${vis.b} cards)`
    : 'FAIL | marquee render problem');

  /* mobile nav toggle works */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.click('.nav-toggle');
  const navOpen = await page.evaluate(() => document.getElementById('main-nav').classList.contains('open'));
  console.log(navOpen ? 'PASS | mobile nav opens' : 'FAIL | mobile nav broken');

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
