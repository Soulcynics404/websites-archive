/* Caffe Cinos — Bromley · interactions */
(function () {
  'use strict';

  /* mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* 3D hero mouse tilt (desktop only, pointer-fine) */
  var stage = document.getElementById('heroStage');
  if (stage && window.matchMedia('(pointer:fine)').matches) {
    var hero = stage.closest('.hero') || document.body;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      stage.style.setProperty('--ry', (nx * 14).toFixed(2) + 'deg');
    });
    hero.addEventListener('mouseleave', function () {
      stage.style.setProperty('--ry', '-9deg');
    });
  }

  /* reviews counter */
  var counter = document.getElementById('reviewCounter');
  if (counter) {
    var target = 4.8, started = false;
    var run = function () {
      if (started) return; started = true;
      var t0 = performance.now();
      var step = function (t) {
        var p = Math.min((t - t0) / 1400, 1);
        p = 1 - Math.pow(1 - p, 3);
        counter.textContent = (target * p).toFixed(1);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) run(); });
    }, { threshold: 0.4 }).observe(counter);
  }

  /* cart — localStorage persistence */
  var KEY = 'caffecinos_cart_v1';
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }

  var lines = document.getElementById('orderLines');
  var count = document.getElementById('cartCount');
  var total = document.getElementById('cartTotal');
  var obTotal = document.getElementById('obTotal');

  var money = function (n) { return n.toFixed(2); };

  var render = function () {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
    var names = Object.keys(cart), n = 0, sum = 0;
    names.forEach(function (k) { n += cart[k].qty; sum += cart[k].qty * cart[k].price; });
    if (count) count.textContent = n;
    if (total) total.textContent = money(sum);
    if (obTotal) obTotal.textContent = money(sum);
    if (!lines) return;
    lines.innerHTML = '';
    if (!names.length) {
      var li = document.createElement('li');
      li.className = 'order-empty';
      li.textContent = 'Nothing here yet — tap “Add” on anything above.';
      lines.appendChild(li);
      return;
    }
    names.forEach(function (k) {
      var it = cart[k];
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.textContent = it.qty + ' × ' + k;
      var right = document.createElement('span');
      right.textContent = '£' + money(it.qty * it.price);
      var x = document.createElement('button');
      x.setAttribute('aria-label', 'Remove ' + k);
      x.textContent = '✕';
      x.addEventListener('click', function () { delete cart[k]; render(); });
      li.appendChild(span); li.appendChild(right); li.appendChild(x);
      lines.appendChild(li);
    });
  };

  document.querySelectorAll('.add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-name').replace('&amp;', '&');
      var price = parseFloat(btn.getAttribute('data-price'));
      if (!cart[name]) cart[name] = { qty: 0, price: price };
      cart[name].qty += 1;
      btn.classList.add('added');
      var old = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(function () { btn.classList.remove('added'); btn.textContent = old; }, 900);
      render();
    });
  });

  var checkout = document.getElementById('checkoutBtn');
  if (checkout) {
    checkout.addEventListener('click', function () {
      var note = document.getElementById('orderNote');
      if (!Object.keys(cart).length) {
        note.textContent = 'Add something tasty first — the menu’s just above.';
        return;
      }
      note.textContent = 'Order noted! Show this list at the counter — we’ll start it now.';
    });
  }

  /* contact form validation */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = form.elements['name'].value.trim();
      var email = form.elements['email'].value.trim();
      var msg = form.elements['message'].value.trim();
      if (!name || !email || email.indexOf('@') < 0 || !msg) {
        note.textContent = 'Please add your name, a valid email and a quick message.';
        return;
      }
      note.textContent = 'Thanks, ' + name.split(' ')[0] + ' — we’ll get back to you within a day. Or just swing by!';
      form.reset();
    });
  }

  render();
})();
