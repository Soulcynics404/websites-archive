/* ============================================================
   Martil Cafe — index interactions
   Mouse-parallax 3D depth on hero layers + scroll-driven reveals.
   rAF-throttled; disabled for touch & reduced-motion users.
   ============================================================ */
(() => {
  const stage = document.getElementById("hero-stage");
  if (!stage) return;

  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = Array.from(stage.querySelectorAll("[data-depth]"));
  const bg = document.getElementById("hero-bg");

  if (!fine || reduced || !layers.length) return;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  const apply = () => {
    raf = null;
    // smooth follow
    cx += (tx - cx) * 0.085;
    cy += (ty - cy) * 0.085;
    layers.forEach((el) => {
      const d = parseFloat(el.dataset.depth) || 0;
      el.style.translate = (cx * d * 100).toFixed(2) + "px " + (cy * d * 100).toFixed(2) + "px";
    });
    if (bg) {
      bg.style.backgroundPosition =
        (cx * 12).toFixed(1) + "px " + (cy * 12).toFixed(1) + "px, " +
        (-cx * 18).toFixed(1) + "px " + (-cy * 18).toFixed(1) + "px";
    }
    // keep easing until settled
    if (Math.abs(tx - cx) > .05 || Math.abs(ty - cy) > .05) start();
  };

  const start = () => { if (!raf) raf = requestAnimationFrame(apply); };

  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;   // -1 .. 1
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    start();
  }, { passive: true });

  /* gentle scroll-driven tilt: hero content lifts as you scroll away */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      if (y < window.innerHeight) {
        stage.style.transform = "translateY(" + (y * -0.06).toFixed(1) + "px)";
        stage.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * .9)));
      }
    });
  }, { passive: true });
})();
