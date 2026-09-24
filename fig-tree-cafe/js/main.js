/* ============================================================
   FIG TREE CAFE — shared JS
   Cart (localStorage) · 3D mouse-parallax · scroll reveals ·
   review counter · mobile nav. No dependencies.
   ============================================================ */
'use strict';

/* ---------------- Cart engine ---------------- */
const FIG = (() => {
  const KEY = 'figtree_cart_v2';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; }
  if (!Array.isArray(items)) items = [];

  const save  = () => localStorage.setItem(KEY, JSON.stringify(items));
  const money = n => '£' + n.toFixed(2);
  const find  = id => items.find(i => i.id === id);
  const count = () => items.reduce((s, i) => s + i.qty, 0);
  const total = () => items.reduce((s, i) => s + i.price * i.qty, 0);

  function add(item){
    if (!item || !item.id || typeof item.price !== 'number') return;
    const ex = find(item.id);
    if (ex) ex.qty += item.qty || 1;
    else items.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: item.qty || 1 });
    save(); render();
  }
  function setQty(id, q){
    const it = find(id); if (!it) return;
    it.qty = Math.max(0, q);
    if (it.qty === 0) remove(id); else { save(); render(); }
  }
  function remove(id){
    items = items.filter(i => i.id !== id);
    save(); render();
  }
  function clear(){ items = []; save(); }

  /* ---------- drawer UI ---------- */
  let drawerEl = null, backdropEl = null;

  function ensureDrawer(){
    if (drawerEl) return;
    drawerEl = document.createElement('aside');
    drawerEl.className = 'cart-drawer';
    drawerEl.setAttribute('aria-label', 'Your order');
    drawerEl.innerHTML = `
      <div class="cart-head">
        <h2>Your Order</h2>
        <button class="cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-items"></div>
      <div class="cart-foot">
        <div class="total-row"><span>Total</span><span class="grand">£0.00</span></div>
        <a class="btn btn-primary" href="order.html">Review order &amp; checkout →</a>
        <p class="mini-note">Collection orders · pay at the counter</p>
      </div>`;
    document.body.appendChild(drawerEl);

    backdropEl = document.createElement('div');
    backdropEl.className = 'drawer-backdrop';
    document.body.appendChild(backdropEl);

    drawerEl.querySelector('.cart-close').addEventListener('click', closeDrawer);
    backdropEl.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    renderDrawer();
  }
  function openDrawer(){ ensureDrawer(); drawerEl.classList.add('open'); backdropEl.classList.add('open'); }
  function closeDrawer(){
    if (!drawerEl) return;
    drawerEl.classList.remove('open');
    backdropEl.classList.remove('open');
  }

  function renderDrawer(){
    if (!drawerEl) return;
    const box = drawerEl.querySelector('.cart-items');
    if (!items.length){
      box.innerHTML = '<div class="cart-empty">Your cart is empty — add something delicious from the menu.</div>';
    } else {
      box.innerHTML = items.map(i => `
        <article class="ci">
          <img src="${i.img}" alt="">
          <div>
            <h4>${i.name}</h4>
            <p class="ci-price">${money(i.price)} each</p>
            <div class="qty">
              <button data-act="dec" data-id="${i.id}" aria-label="Decrease ${i.name}">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" data-id="${i.id}" aria-label="Increase ${i.name}">+</button>
              <button data-act="rm"  data-id="${i.id}" aria-label="Remove ${i.name}"
                      title="Remove" style="margin-left:.35rem">✕</button>
            </div>
          </div>
          <span class="ci-line">${money(i.price * i.qty)}</span>
        </article>`).join('');
    }
    drawerEl.querySelector('.grand').textContent = money(total());
    bindCartButtons(box);
  }

  function bindCartButtons(scope){
    scope.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.id, act = b.dataset.act;
        const it = find(id); if (!it && act !== 'rm') return;
        if (act === 'inc') setQty(id, it.qty + 1);
        else if (act === 'dec') setQty(id, it.qty - 1);
        else if (act === 'rm') remove(id);
      };
    });
  }

  /* ---------- header chips + toast ---------- */
  let toastEl = null, toastTimer = 0;
  function toast(msg){
    if (!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  function syncChips(){
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count());
  }
  function render(){
    syncChips();
    if (drawerEl) renderDrawer();
    if (document.body.dataset.page === 'order' && typeof window.renderSummaryPage === 'function'){
      window.renderSummaryPage();
    }
  }

  /* ---------- global listeners ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    add({
      id: btn.dataset.add,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      img: btn.dataset.img,
      qty: 1,
    });
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 900);
    toast('✓ ' + btn.dataset.name + ' added to your order');
  });
  document.querySelectorAll('[data-open-cart]').forEach(b =>
    b.addEventListener('click', openDrawer));
  /* delegated: clear-cart buttons may be rendered dynamically (order page) */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-clear-cart]')) { clear(); render(); }
  });

  const bootChips = () => syncChips();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootChips);
  else bootChips();
  return { items: () => items, count, total, add, setQty, remove, clear, money, openDrawer, closeDrawer };
})();
window.FIG = FIG;

/* ---------------- DOM-dependent init ---------------- */
function initDom(){

  /* Mobile nav */
  document.querySelectorAll('.nav-toggle').forEach(t => {
    t.addEventListener('click', () => {
      const nav = document.getElementById('main-nav');
      nav.classList.toggle('open');
      t.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  });

  /* Scroll reveal */
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)){ els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  els.forEach(el => io.observe(el));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDom);
else initDom();

/* ---------------- 3D hero parallax ---------------- */
function initParallax(){
  const stage = document.querySelector('.stage');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scene  = stage.querySelector('.scene');
  const layers = stage.querySelectorAll('[data-depth]');
  let raf = null, tx = 0, ty = 0;

  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - .5;
    ty = (e.clientY - r.top) / r.height - .5;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  stage.addEventListener('mouseleave', () => {
    tx = ty = 0;
    if (!raf) raf = requestAnimationFrame(apply);
  });

  function apply(){
    raf = null;
    scene.style.transform =
      'rotateX(' + (-ty * 6).toFixed(2) + 'deg) rotateY(' + (tx * 8).toFixed(2) + 'deg)';
    layers.forEach(l => {
      const d = parseFloat(l.dataset.depth) || 0;
      l.style.translate = (tx * d).toFixed(1) + 'px ' + (ty * d).toFixed(1) + 'px';
    });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initParallax);
else initParallax();

/* ---------------- Review counter (436 → 512) ---------------- */
function initCounter(){
  const el = document.getElementById('rev-counter');
  if (!el) return;
  const BASE = 436, TARGET = 512, DUR = 24000;
  const t0 = performance.now() + 800;
  function tick(now){
    const p = Math.min(Math.max((now - t0) / DUR, 0), 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(BASE + (TARGET - BASE) * eased).toLocaleString('en-GB');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCounter);
else initCounter();

/* ---------------- Footer year ---------------- */
function initYear(){
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initYear);
else initYear();
