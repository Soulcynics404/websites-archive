/* CrossFit Deerfield Beach — interactions */
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

  /* free-intro form validation */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email || email.indexOf('@') < 0) {
        note.textContent = 'Name and a valid email are all we need — add them and hit send.';
        return;
      }
      note.textContent = 'You’re in, ' + name.split(' ')[0] + '! We’ll text you within a few hours to lock in your free class.';
      form.reset();
    });
  }
})();
