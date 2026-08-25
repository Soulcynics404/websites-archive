/* Stonehenge Cafe — shared JS: cart (localStorage) + scroll reveals + counter */
(function () {
  'use strict';

  var KEY = 'stonehenge_cart_v2';

  function readCart() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (it) {
        return it && typeof it.id === 'string' && typeof it.qty === 'number' && it.qty > 0;
      });
    } catch (e) { return []; }
  }

  function writeCart(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
    syncBadges();
  }

  function count() {
    return readCart().reduce(function (n, it) { return n + it.qty; }, 0);
  }

  window.__shCart = {
    read: readCart,
    write: writeCart,
    count: count,
    add: function (id, name, price, img) {
      var items = readCart();
      var found = null;
      for (var i = 0; i < items.length; i++) { if (items[i].id === id) { found = items[i]; break; } }
      if (found) { found.qty += 1; } else { items.push({ id: id, name: name, price: price, qty: 1, img: img }); }
      writeCart(items);
    },
    setQty: function (id, qty) {
      var items = readCart().map(function (it) {
        if (it.id === id) { var next = Object.assign({}, it); next.qty = qty; return next; }
        return it;
      }).filter(function (it) { return it.qty > 0; });
      writeCart(items);
    },
    clear: function () { writeCart([]); }
  };

  function syncBadges() {
    var n = String(count());
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; });
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: n } }));
  }

  /* ---------- scroll reveals ---------- */
  function initReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up on view ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count-to]');
    if (!nums.length) return;
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10);
      if (!isFinite(target) || target <= 0) { el.textContent = '351'; return; }
      var t0 = performance.now(), dur = 1800;
      var from = Math.max(0, target - 120);
      function frame(t) {
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * eased).toLocaleString('en-GB');
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(function (el) { animate(el); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initCounters();
    syncBadges();
  });
})();
