/* Carter Tappan — Palo Alto · interactions */
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

  /* 3D hero tilt (desktop pointers only) */
  var stage = document.getElementById('heroStage');
  if (stage && window.matchMedia('(pointer:fine)').matches) {
    var hero = stage.closest('.hero') || document.body;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      stage.style.setProperty('--ry', (nx * 12).toFixed(2) + 'deg');
    });
    hero.addEventListener('mouseleave', function () {
      stage.style.setProperty('--ry', '-8deg');
    });
  }

  /* listings filter */
  var filter = document.getElementById('statusFilter');
  if (filter) {
    var cards = document.querySelectorAll('#listingGrid .listing-card');
    var empty = document.getElementById('emptyNote');
    filter.addEventListener('change', function () {
      var v = filter.value, shown = 0;
      cards.forEach(function (c) {
        var show = v === 'all' || c.getAttribute('data-status') === v;
        c.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* contact form validation */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      if (!name || !email || email.indexOf('@') < 0 || !msg) {
        note.textContent = 'Please add your name, a valid email and a line about the property.';
        return;
      }
      note.textContent = 'Thank you, ' + name.split(' ')[0] + ' — your request is in. Carter will reply within two business days.';
      form.reset();
    });
  }
})();
