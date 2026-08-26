/* Colleen Cassel — Manhattan · interactions */
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

  /* neighborhood flip cards — tap toggles on touch, hover handled by CSS */
  document.querySelectorAll('.hood-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

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
        note.textContent = 'Please add your name, a valid email and a short note.';
        return;
      }
      note.textContent = 'Got it, ' + name.split(' ')[0] + " — I'll reply personally within one business day.";
      form.reset();
    });
  }
})();
