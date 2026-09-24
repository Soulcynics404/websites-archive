/* ============================================================
   Editorial realtor sites — shared JS
   Mobile nav · scroll reveal · pointer-tilt 3D cards · hero parallax
   ============================================================ */

/* ---------------- Mobile nav ---------------- */
(() => {
  const toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;
  const close = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", close));
  window.addEventListener("resize", () => { if (window.innerWidth > 820) close(); });
})();

/* ---------------- Scroll reveal ---------------- */
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in-view")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
    });
  }, { threshold: .12 });
  els.forEach((el) => io.observe(el));
})();

/* ---------------- Pointer-tilt 3D property cards ---------------- */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const cards = document.querySelectorAll("[data-tilt]");
  cards.forEach((card) => {
    let raf = null;
    card.addEventListener("pointermove", (e) => {
      if (raf || e.pointerType === "touch") return;
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
        card.style.transition = "transform .08s linear";
        raf = null;
      });
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
      card.style.transform = "";
    });
  });
})();

/* ---------------- Hero layered parallax ---------------- */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const layers = document.querySelectorAll("#hero-bg[data-depth]");
  if (!layers.length) return;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    layers.forEach((el) => {
      el.style.transform = "translate3d(0," + (y * parseFloat(el.dataset.depth)).toFixed(1) + "px,0)";
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

/* ---------------- Footer year ---------------- */
(() => {
  const y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();
