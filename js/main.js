/* ============================================================
   Coffee in the Wood — shared behaviour
   ============================================================ */
(function () {
  'use strict';

  var CART_KEY = 'citw_cart_v1';

  /* ---------------- Cart store (localStorage) ---------------- */
  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      var v = JSON.parse(raw);
      return Array.isArray(v) ? v.filter(function (i) { return i && typeof i.id === 'string' && i.qty > 0; }) : [];
    } catch (e) { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new CustomEvent('cart:changed'));
  }
  window.CITW = {
    CART_KEY: CART_KEY,
    getCart: readCart,
    setCart: writeCart,
    add: function (item) {
      var items = readCart();
      var hit = null;
      for (var i = 0; i < items.length; i++) if (items[i].id === item.id) hit = items[i];
      if (hit) hit.qty += item.qty || 1;
      else items.push({ id: item.id, name: item.name, price: item.price, qty: item.qty || 1 });
      writeCart(items);
    },
    setQty: function (id, qty) {
      var items = readCart();
      if (qty <= 0) items = items.filter(function (i) { return i.id !== id; });
      else items.forEach(function (i) { if (i.id === id) i.qty = qty; });
      writeCart(items);
    },
    remove: function (id) {
      writeCart(readCart().filter(function (i) { return i.id !== id; }));
    },
    clear: function () { writeCart([]); },
    count: function () { return readCart().reduce(function (n, i) { return n + i.qty; }, 0); },
    total: function () { return readCart().reduce(function (n, i) { return n + i.qty * i.price; }, 0); }
  };

  /* ---------------- Header cart badge (all pages) ---------------- */
  function paintBadges() {
    var n = window.CITW.count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = String(n); });
  }
  paintBadges();
  document.addEventListener('cart:changed', paintBadges);

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  /* ---------------- Current-page highlight ---------------- */
  (function () {
    var file = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === file || (file === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ---------------- Scroll reveals ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Count-up numbers ---------------- */
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-countup'), 10);
    if (!target) { el.textContent = el.textContent; return; }
    var t0 = performance.now();
    var dur = 1600;
    function frame(t) {
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * p).toLocaleString('en-GB');
    }
    requestAnimationFrame(frame);
    // drive to completion even if rAF throttled
    var iv = setInterval(function () {
      if (parseInt(el.textContent.replace(/,/g, ''), 10) >= target) clearInterval(iv);
      else requestAnimationFrame(frame);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 5000);
  }
  (function initCounters() {
    var els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(runCounter); return; }
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { cio.observe(el); });
  })();

  /* ============================================================
     INDEX — hero mouse-parallax + signature card tilt
     ============================================================ */
  var stage = document.getElementById('heroStage');
  if (stage && matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var fine = matchMedia('(pointer:fine)').matches;
    if (fine) {
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--ry', (nx * 4).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (-ny * 2.5).toFixed(2) + 'deg');
      });
      stage.addEventListener('mouseleave', function () {
        stage.style.setProperty('--ry', '0deg');
        stage.style.setProperty('--rx', '0deg');
      });
    }
  }

  /* signature tilt cards (index + reuse elsewhere) */
  document.querySelectorAll('.tilt-card').forEach(function (card) {
    if (!matchMedia('(hover:hover)').matches) return;
    var inner = card.querySelector('.tilt-inner');
    if (!inner) return;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform =
        'rotateX(' + (-ny * 7).toFixed(2) + 'deg) rotateY(' + (nx * 9).toFixed(2) + 'deg) translateZ(10px)';
    });
    card.addEventListener('mouseleave', function () { inner.style.transform = ''; });
  });
})();
