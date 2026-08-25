/* ============================================================
   Martil Cafe — shared JS
   - Cart (localStorage, cross-page) with floating pill + drawer
   - Scroll reveal
   - Mobile nav
   ============================================================ */

/* ---------------- Cart ---------------- */
const MartilCart = (() => {
  const KEY = "martil_cart_v1";
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  };
  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
  };

  const items = read;
  const count = () => items().reduce((n, i) => n + i.qty, 0);
  const total = () => items().reduce((n, i) => n + i.qty * i.price, 0);

  function add(id, name, price, photo) {
    const list = read();
    const found = list.find((i) => i.id === id);
    if (found) found.qty += 1;
    else list.push({ id, name, price, photo, qty: 1 });
    write(list);
    bump();
  }
  function setQty(id, qty) {
    let list = read();
    const it = list.find((i) => i.id === id);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) list = list.filter((i) => i.id !== id);
    write(list);
  }
  function remove(id) {
    write(read().filter((i) => i.id !== id));
  }
  function clear() { write([]); }

  /* ---- floating pill ---- */
  function ensurePill() {
    if (document.getElementById("martil-cart-pill")) return;
    if (!document.body) return;
    const pill = document.createElement("div");
    pill.id = "martil-cart-pill";
    pill.className = "cart-pill";
    pill.setAttribute("role", "status");
    pill.innerHTML =
      '<span class="cart-pill-icon">🛍️</span>' +
      '<span class="cart-pill-text"><strong class="cart-pill-count">0</strong> items · <strong class="cart-pill-total">£0.00</strong></span>';
    pill.addEventListener("click", openDrawer);
    document.body.appendChild(pill);
  }

  function bump() {
    const pill = document.getElementById("martil-cart-pill");
    if (!pill) return;
    pill.classList.remove("bump");
    void pill.offsetWidth;
    pill.classList.add("bump");
  }

  /* ---- drawer ---- */
  function ensureDrawer() {
    if (document.getElementById("martil-drawer")) return;
    if (!document.body) return;
    const d = document.createElement("div");
    d.id = "martil-drawer";
    d.innerHTML =
      '<div class="drawer-backdrop" data-close></div>' +
      '<aside class="drawer" role="dialog" aria-label="Your order">' +
      '  <div class="drawer-head"><h3>Your Order</h3><button class="drawer-x" data-close aria-label="Close cart">×</button></div>' +
      '  <div class="drawer-body" id="drawer-body"></div>' +
      '  <div class="drawer-foot"><a href="menu.html#order-summary" class="btn btn-primary" style="justify-content:center">View Full Order Summary</a></div>' +
      "</aside>";
    document.body.appendChild(d);
    d.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeDrawer();
    });
  }

  function openDrawer() {
    ensureDrawer();
    document.getElementById("martil-drawer").classList.add("open");
    render();
  }
  function closeDrawer() {
    const d = document.getElementById("martil-drawer");
    if (d) d.classList.remove("open");
  }

  function render() {
    const n = count(), t = total();
    // pill
    const pill = document.getElementById("martil-cart-pill");
    if (pill) {
      pill.querySelector(".cart-pill-count").textContent = n;
      pill.querySelector(".cart-pill-total").textContent = "£" + t.toFixed(2);
      pill.classList.toggle("show", n > 0);
      pill.classList.toggle("hidden", n === 0 && !document.getElementById("martil-drawer")?.classList.contains("open"));
      if (n === 0) pill.classList.add("hidden"); else pill.classList.remove("hidden");
    }
    // header badge
    const badge = document.querySelector(".cart-count");
    if (badge) {
      badge.textContent = n;
      badge.style.display = n > 0 ? "" : "none";
    }
    // drawer body
    const body = document.getElementById("drawer-body");
    if (body) {
      if (!items().length) {
        body.innerHTML = '<p class="cart-empty">Your order is empty. Head to the <a href="menu.html">menu</a> and pick something delicious.</p>';
      } else {
        body.innerHTML = items().map((i) =>
          '<div class="cart-line" data-id="' + i.id + '">' +
          '<img src="' + i.photo + '" alt="" loading="lazy">' +
          '<div class="cart-line-info"><strong>' + i.name + '</strong><span>£' + i.price.toFixed(2) + '</span></div>' +
          '<div class="qty-controls"><button class="qty-btn" data-dec aria-label="Decrease">−</button>' +
          '<span class="qty-num">' + i.qty + '</span>' +
          '<button class="qty-btn" data-inc aria-label="Increase">+</button></div></div>'
        ).join("") +
        '<div class="cart-line-total"><span>Total</span><strong>£' + t.toFixed(2) + '</strong></div>';
      }
    }
  }

  /* drawer qty buttons */
  document.addEventListener("click", (e) => {
    const dec = e.target.closest("[data-dec]");
    const inc = e.target.closest("[data-inc]");
    if (!dec && !inc) return;
    const line = e.target.closest(".cart-line");
    const id = line && line.dataset.id;
    if (!id) return;
    const it = read().find((i) => i.id === id);
    if (!it) return;
    setQty(id, inc ? it.qty + 1 : it.qty - 1);
  });

  function init() {
    ensurePill(); ensureDrawer(); render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  return { add, remove, setQty, clear, count, total, items, openDrawer };
})();

/* ---------------- Add-to-order buttons ---------------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  MartilCart.add(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.photo);
  btn.classList.add("added");
  const label = btn.querySelector(".add-label");
  if (label) { const old = label.textContent; label.textContent = "Added ✓"; setTimeout(() => (label.textContent = old), 1200); }
});

/* ---------------- Scroll reveal ---------------- */
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in-view")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); } });
  }, { threshold: .12 });
  els.forEach((el) => io.observe(el));
})();

/* ---------------- Footer year ---------------- */
(() => {
  const y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();
