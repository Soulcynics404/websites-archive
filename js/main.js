/* Le Bon Cafe — shared behaviour: nav, cart, reveal animations */
(function () {
  'use strict';

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Cart (localStorage) ---------------- */
  var KEY = 'leboncart_v1';
  function readCart() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeCart(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    renderCart();
  }
  window.LBC = window.LBC || {};
  window.LBC.cart = {
    add: function (id, name, price) {
      var cart = readCart();
      if (cart[id]) cart[id].qty += 1;
      else cart[id] = { name: name, price: price, qty: 1 };
      writeCart(cart);
    },
    setQty: function (id, qty) {
      var cart = readCart();
      if (!cart[id]) return;
      if (qty <= 0) delete cart[id];
      else cart[id].qty = qty;
      writeCart(cart);
    },
    remove: function (id) {
      var cart = readCart();
      delete cart[id];
      writeCart(cart);
    },
    clear: function () { writeCart({}); },
    count: function () {
      var c = 0, cart = readCart();
      for (var k in cart) c += cart[k].qty;
      return c;
    },
    total: function () {
      var t = 0, cart = readCart();
      for (var k in cart) t += cart[k].price * cart[k].qty;
      return Math.round(t * 100) / 100;
    },
    items: function () { return Object.keys(readCart()).map(function (k) {
      var it = readCart()[k]; return { id: k, name: it.name, price: it.price, qty: it.qty };
    }); },
    onChange: function (fn) { window.LBC._onChange.push(fn); }
  };
  window.LBC._onChange = [];
  window.LBC._emit = function () { window.LBC._onChange.forEach(function (f) { try { f(); } catch (e) {} }); };

  function money(n) { return '£' + n.toFixed(2); }

  /* Header badge */
  function updateBadge() {
    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = String(window.LBC.cart.count());
    });
  }

  /* Drawer rendering (present on all pages via include markup) */
  function lineRow(item, compact) {
    var li = document.createElement('div');
    li.className = compact ? 'mini-line' : 'order-line';
    li.innerHTML =
      '<div class="ol-name">' + item.name + '</div>' +
      '<div class="ol-price">' + money(item.price * item.qty) + '</div>' +
      '<span class="qty-stepper">' +
        '<button class="qty-btn" data-act="dec" aria-label="Decrease quantity of ' + item.name + '">−</button>' +
        '<span class="qty-val">' + item.qty + '</span>' +
        '<button class="qty-btn" data-act="inc" aria-label="Increase quantity of ' + item.name + '">+</button>' +
      '</span>' +
      '<button class="ol-remove" data-act="remove">remove</button>';
    li.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-act');
        if (act === 'inc') window.LBC.cart.setQty(item.id, item.qty + 1);
        if (act === 'dec') window.LBC.cart.setQty(item.id, item.qty - 1);
        if (act === 'remove') window.LBC.cart.remove(item.id);
      });
    });
    return li;
  }

  function renderCart() {
    updateBadge();
    var items = window.LBC.cart.items();
    var miniList = document.getElementById('miniCartItems');
    var drawerTotal = document.getElementById('drawerTotal');
    var emptyMsg = document.querySelector('.cart-empty');
    if (miniList) {
      miniList.innerHTML = '';
      items.forEach(function (it) { miniList.appendChild(lineRow(it, true)); });
    }
    if (emptyMsg) emptyMsg.style.display = items.length ? 'none' : '';
    if (drawerTotal) drawerTotal.textContent = money(window.LBC.cart.total());

    /* order summary panel on menu page */
    var panelLines = document.getElementById('orderLines');
    var panelEmpty = document.getElementById('orderEmpty');
    var panelTotal = document.getElementById('orderTotal');
    if (panelLines) {
      panelLines.innerHTML = '';
      items.forEach(function (it) { panelLines.appendChild(lineRow(it, false)); });
      if (panelEmpty) panelEmpty.style.display = items.length ? 'none' : '';
      if (panelTotal) panelTotal.textContent = money(window.LBC.cart.total());
      var waBtn = document.getElementById('whatsappOrder');
      if (waBtn) {
        var lines = items.map(function (it) {
          return encodeURIComponent(it.name + ' x' + it.qty);
        }).join('%0A');
        waBtn.href = 'https://wa.me/442034575618?text=' +
          encodeURIComponent('Bonjour! Order from ') + lines;
      }
    }
    window.LBC._emit();
  }
  window.LBC.renderCart = renderCart;

  /* Drawer open/close */
  function bindDrawer() {
    var drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    var overlay = document.getElementById('cartOverlay');
    document.querySelectorAll('[data-open-cart]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('show');
      });
    });
    function close() {
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
    }
    var closeBtn = drawer.querySelector('.cart-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    /* navigating from the drawer (e.g. "Review & Place Order") should close it */
    drawer.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', close);
    });
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* Toast */
  var toastTimer = null;
  window.LBC.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.querySelector('.toast-msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  };

  /* Add-to-order buttons (menu page) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.add-btn');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var name = btn.getAttribute('data-name');
    var price = parseFloat(btn.getAttribute('data-price'));
    window.LBC.cart.add(id, name, price);
    btn.classList.add('added');
    setTimeout(function () { btn.classList.remove('added'); }, 900);
    window.LBC.toast(name + ' added to your order');
  });

  /* Scroll reveals */
  function initReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Boot */
  document.addEventListener('DOMContentLoaded', function () {
    bindDrawer();
    renderCart();
    initReveals();
  });
})();
