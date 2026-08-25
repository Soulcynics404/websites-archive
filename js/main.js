/* Moby's Coffee Shop — shared JS (nav, reveals, cart engine, counter) */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  window.mobyToggleNav = function () {
    var links = document.getElementById("nav-links");
    if (links) links.classList.toggle("open");
  };

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Cart engine (localStorage) ---------- */
  var KEY = "mobys_cart_v1";

  function getCart() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) { /* storage unavailable */ }
    updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:changed"));
  }

  window.MobyCart = {
    items: getCart,
    add: function (item) {
      var cart = getCart();
      var found = cart.find(function (l) { return l.id === item.id; });
      if (found) found.qty += item.qty || 1;
      else cart.push({ id: item.id, name: item.name, price: item.price, qty: item.qty || 1, img: item.img || "" });
      saveCart(cart);
    },
    setQty: function (id, qty) {
      var cart = getCart();
      qty = parseInt(qty, 10);
      if (isNaN(qty)) qty = 1;
      if (qty <= 0) {
        cart = cart.filter(function (l) { return l.id !== id; });
      } else {
        cart.forEach(function (l) { if (l.id === id) l.qty = qty; });
      }
      saveCart(cart);
    },
    remove: function (id) {
      saveCart(getCart().filter(function (l) { return l.id !== id; }));
    },
    clear: function () { saveCart([]); },
    count: function () {
      return getCart().reduce(function (n, l) { return n + l.qty; }, 0);
    },
    total: function () {
      return getCart().reduce(function (n, l) { return n + l.price * l.qty; }, 0);
    },
    money: function (n) { return "$" + n.toFixed(2); }
  };

  function updateCartBadge() {
    var badge = document.getElementById("cart-count");
    if (!badge || typeof window.MobyCart === "undefined") return;
    var n = window.MobyCart.count();
    badge.textContent = n;
    badge.classList.toggle("empty", n === 0);
  }

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  window.mobyToast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  };

  /* ---------- Live review counter ---------- */
  window.initMobyCounter = function (startElId, opts) {
    opts = opts || {};
    var el = document.getElementById(startElId);
    if (!el) return;
    var start = opts.start || 907;
    var target = new Date(opts.dateISO || "2026-08-25T12:00:00Z").getTime();
    var now = Date.now();
    // ~3.5 new Google reviews/day since the anchor snapshot; never dip below start
    var current = Math.max(start, Math.floor(start + ((now - target) / 86400000) * 3.5));
    var shown = null;

    function render() {
      current += 1;
      el.textContent = current.toLocaleString("en-US");
    }
    // First paint: set without waiting a full interval
    shown = current;
    el.textContent = shown.toLocaleString("en-US");

    var interval = opts.tickMs || 45000;
    setInterval(render, interval);

    // Ticker effect when scrolled into view
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || el.dataset.counted) return;
        el.dataset.counted = "1";
        var from = shown - 24;
        var step = Math.max(1, Math.round(24 / 28));
        var iv = setInterval(function () {
          from += step;
          if (from >= shown) { from = shown; clearInterval(iv); el.textContent = shown.toLocaleString("en-US"); return; }
          el.textContent = from.toLocaleString("en-US");
        }, 40);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  };

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initReveals();
    updateCartBadge();
    document.addEventListener("cart:changed", updateCartBadge);
  });
})();