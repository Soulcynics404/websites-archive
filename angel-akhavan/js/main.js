// Angel Akhavan — nav, reveal, 3D tilt + listing filters
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    document.querySelectorAll('.section > h2, .card, .stat, .contact-card').forEach(function (el) {
      el.classList.add('reveal');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  // Listing type filter
  var chips = document.querySelectorAll('.chip');
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var f = chip.getAttribute('data-filter');
        document.querySelectorAll('.listing-grid .card').forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-type') === f;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // 3D tilt
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.style.transition = 'transform .16s ease';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }
})();
