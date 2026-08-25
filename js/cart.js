/* 21 GRAMS — client-side cart (localStorage) + order summary.
   Storage key: grams21_cart_v1  →  [{id,name,price,img,qty}] */
(function () {
  'use strict';
  var KEY = 'grams21_cart_v1';

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (i) {
        return i && typeof i.id === 'string' && typeof i.price === 'number' && typeof i.qty === 'number' && i.qty > 0;
      }) : [];
    } catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ }
    syncAll(items);
  }

  function find(items, id) { return items.find(function (i) { return i.id === id; }); }

  function add(item) {
    var items = load();
    var ex = find(items, item.id);
    if (ex) { ex.qty += 1; } else { items.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 }); }
    save(items);
  }
  function setQty(id, qty) {
    var items = load();
    var it = find(items, id);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) items = items.filter(function (i) { return i.id !== id; });
    save(items);
  }
  function remove(id) {
    save(load().filter(function (i) { return i.id !== id; }));
  }
  function clear() { save([]); }
  function count() { return load().reduce(function (n, i) { return n + i.qty; }, 0); }
  function total() { return load().reduce(function (n, i) { return n + i.price * i.qty; }, 0); }

  function money(n) { return '£' + n.toFixed(2); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- UI sync ---------- */
  var drawer = document.getElementById('cart-drawer');
  var backdrop = document.getElementById('drawer-backdrop');

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function renderDrawer(items) {
    if (!drawer) return;
    var listEl = drawer.querySelector('.cart-items');
    var footEl = drawer.querySelector('.cart-foot');
    if (!items.length) {
      listEl.innerHTML = '<p class="cart-empty">Your tray is empty — every gram counts.</p>';
      footEl.innerHTML = '';
      return;
    }
    listEl.innerHTML = items.map(function (i) {
      return '' +
        '<div class="ci" data-id="' + esc(i.id) + '">' +
        '  <img src="' + esc(i.img) + '" alt="' + esc(i.name) + '">' +
        '  <div>' +
        '    <div class="ci-name">' + esc(i.name) + '</div>' +
        '    <div class="ci-price">' + money(i.price) + '</div>' +
        '    <div class="qty">' +
        '      <button type="button" data-action="dec" aria-label="Decrease quantity of ' + esc(i.name) + '">−</button>' +
        '      <span data-qty>' + i.qty + '</span>' +
        '      <button type="button" data-action="inc" aria-label="Increase quantity of ' + esc(i.name) + '">+</button>' +
        '    </div>' +
        '  </div>' +
        '  <div style="text-align:right">' +
        '    <div class="ci-line-total">' + money(i.price * i.qty) + '</div>' +
        '    <button type="button" class="ci-remove" data-action="remove">Remove</button>' +
        '  </div>' +
        '</div>';
    }).join('');

    footEl.innerHTML =
      '<div class="cart-total-row"><span>Total</span><b>' + money(total()) + '</b></div>' +
      '<a class="btn btn-gold" href="checkout.html" data-close>Review &amp; Order →</a>' +
      '<button type="button" class="btn btn-ghost" id="clear-cart-btn">Clear tray</button>';
  }

  function renderSummary(items) {
    var panel = document.querySelector('.summary-panel');
    if (!panel) return;
    var lines = panel.querySelector('.sum-lines');
    var totalRow = panel.querySelector('.sum-total b');
    var submitBtn = panel.querySelector('.summary-submit');
    if (!lines) return;
    if (!items.length) {
      lines.innerHTML = '<p class="cart-empty">Your tray is empty. Head back to the <a href="menu.html" style="color:#C9A227">menu</a>.</p>';
      if (totalRow) totalRow.textContent = money(0);
      if (submitBtn) submitBtn.disabled = true;
      return;
    }
    lines.innerHTML = items.map(function (i) {
      return '<div class="sum-line"><span><b>' + i.qty + '×</b> ' + esc(i.name) + '</span><span class="amt">' + money(i.price * i.qty) + '</span></div>';
    }).join('');
    if (totalRow) totalRow.textContent = money(total());
    if (submitBtn) submitBtn.disabled = false;
  }

  function syncAll(items) {
    var n = count.call(null);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      el.classList.toggle('empty', n === 0);
    });
    renderDrawer(items);
    renderSummary(items);
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 450);
    }, 1900);
  }

  /* ---------- wiring ---------- */
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-add], .qty button, [data-action="remove"], #clear-cart-btn, [data-open-cart], [data-close]') : null;

    if (!el) return;

    if (el.hasAttribute('data-add')) {
      add({
        id: el.getAttribute('data-add'),
        name: el.getAttribute('data-name'),
        price: parseFloat(el.getAttribute('data-price')),
        img: el.getAttribute('data-img')
      });
      toast('Added to your tray ✓');
      return;
    }

    var ci = ev.target.closest('.ci');
    if (ci && ci.contains(el)) {
      var id = ci.getAttribute('data-id');
      var action = el.getAttribute('data-action');
      var items = load();
      var it = find(items, id);
      if (!it) return;
      if (action === 'inc') setQty(id, it.qty + 1);
      else if (action === 'dec') setQty(id, it.qty - 1);
      else if (action === 'remove') remove(id);
      return;
    }

    if (el.id === 'clear-cart-btn') { clear(); toast('Tray cleared'); return; }

    if (el.hasAttribute('data-open-cart')) { openDrawer(); return; }
    if (el.hasAttribute('data-close')) { closeDrawer(); return; }
  });

  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* initial paint */
  syncAll(load());

  /* expose for QA */
  window.GramsCart = { load: load, add: add, remove: remove, setQty: setQty, count: count, total: total, clear: clear };
})();
