/* Moby's Coffee Shop — home: 3D mouse parallax */
(function () {
  "use strict";
  var scene = document.getElementById("hero-scene");
  if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var layers = scene.querySelectorAll("[data-depth]");
  var targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;
  var MAX_TILT = 6;   // deg
  var LERP = 0.08;    // smoothing factor

  // Pointer position -> normalized (-1..1) from viewport center
  function onMove(e) {
    var nx = (e.clientX / window.innerWidth - 0.5) * 2;
    var ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx;
    targetY = ny;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    curX += (targetX - curX) * LERP;
    curY += (targetY - curY) * LERP;

    var t = "rotateY(" + (-curX * MAX_TILT).toFixed(3) + "deg) rotateX(" + (curY * MAX_TILT).toFixed(3) + "deg)";
    scene.style.transform = t;

    for (var i = 0; i < layers.length; i++) {
      var el = layers[i];
      var d = parseFloat(el.getAttribute("data-depth")) || 0.5;
      var tx = (-curX * d * 26).toFixed(2);
      var ty = (-curY * d * 16).toFixed(2);
      el.style.transform = "translate3d(" + tx + "px, " + ty + "px, 0)";
    }
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("mousemove", onMove, { passive: true });
})();