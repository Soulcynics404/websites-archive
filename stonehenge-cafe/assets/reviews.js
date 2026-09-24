/* Stonehenge Cafe — reviews page: pause-on-hover + reduced-motion fallback */
(function () {
  'use strict';

  var zone = document.getElementById('marqueeZone');

  function initPauseOnHover() {
    if (!zone) return;
    zone.addEventListener('mouseenter', function () { zone.classList.add('mq-zone-hover'); });
    zone.addEventListener('mouseleave', function () { zone.classList.remove('mq-zone-hover'); });

    /* touch: tap toggles pause */
    zone.addEventListener('touchstart', function () { zone.classList.add('mq-zone-hover'); }, { passive: true });
    var t = null;
    zone.addEventListener('touchend', function () {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(function () { zone.classList.remove('mq-zone-hover'); }, 4000);
    }, { passive: true });
  }

  /* prefers-reduced-motion: stop the tracks entirely */
  try {
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      var style = document.createElement('style');
      style.textContent = '.mq-track{animation:none !important}';
      document.head.appendChild(style);
    }
  } catch (e) { /* noop */ }

  document.addEventListener('DOMContentLoaded', initPauseOnHover);
})();
