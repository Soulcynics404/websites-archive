/* ============================================================
   Martil Cafe — index interactions (v3)
   - Scroll parallax on hero photo layers
   - Mouse drift on floating dish cards (composes with CSS anims)
   - Count-up stats on scroll
   ============================================================ */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches && !reduced;

  /* ---- scroll parallax: real photo layers (transform) ---- */
  const layers = Array.from(document.querySelectorAll(".hero-photo-layer[data-parallax]"));
  if (!reduced && layers.length) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.4) return;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = "translate3d(0," + (y * d / 100).toFixed(1) + "px,0)";
      });
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---- mouse drift: float cards use the `translate` property so it
         composes with (never fights) their CSS drift animations ---- */
  const floats = Array.from(document.querySelectorAll(".float-card[data-parallax]"));
  if (fine && floats.length) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const apply = () => {
      raf = null;
      cx += (tx - cx) * .06;
      cy += (ty - cy) * .06;
      floats.forEach((el) => {
        const amp = (parseFloat(el.dataset.parallax) || 0) * .18;
        el.style.translate = (cx * amp).toFixed(2) + "px " + (cy * amp).toFixed(2) + "px";
      });
      if (Math.abs(tx - cx) > .02 || Math.abs(ty - cy) > .02) start();
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("mousemove", (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      start();
    }, { passive: true });
  }

  /* ---- count-up stats ---- */
  const nums = document.querySelectorAll(".count[data-count-to]");
  if (nums.length) {
    const run = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = target.toFixed(dec) + suffix; return; }
      const dur = 1700;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: .5 });
    nums.forEach((el) => io.observe(el));
  }
})();
