/* Stonehenge Cafe — index page: mouse-parallax tilt + scroll-driven depth */
(function () {
  'use strict';
  var stage = document.getElementById('heroStage');

  function reducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- mouse parallax (fine pointers only) ---------- */
  function initParallax() {
    if (!stage || reducedMotion()) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var LAYERS = [
      { sel: '.dc-main', d: 10 },
      { sel: '.dc-a', d: 22 },
      { sel: '.dc-b', d: 30 },
      { sel: '.dc-c', d: 16 },
      { sel: '.fb-1', d: 38 },
      { sel: '.fb-2', d: 44 }
    ];
    var nodes = [];
    LAYERS.forEach(function (l) {
      var el = stage.querySelector(l.sel);
      if (el) nodes.push({ el: el, d: l.d });
    });
    if (!nodes.length) return;

    var raf = null, tx = 0, ty = 0;
    var scene = stage.closest('.hero-scene') || document.body;

    scene.addEventListener('mousemove', function (e) {
      var r = scene.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(applyTilt);
    });
    scene.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(applyTilt);
    });

    function applyTilt() {
      raf = null;
      nodes.forEach(function (n) {
        n.el.style.transform = 'translate3d(' + (-tx * n.d).toFixed(1) + 'px,' +
          (-ty * n.d * 0.6).toFixed(1) + 'px,0)';
      });
    }
  }

  /* ---------- scroll-driven drift for framed images ---------- */
  function initScrollDepth() {
    var imgs = document.querySelectorAll('.parallax-img');
    if (!imgs.length || reducedMotion()) return;
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;
        var d = parseFloat(img.getAttribute('data-depth') || '12');
        img.style.transform = 'scale(1.04) translateY(' + (progress * d).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initParallax();
    initScrollDepth();
  });
})();
