/* Shirley Cafe — shared cart (localStorage) + toast + mobile nav + reveal-on-scroll */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const money = n => "£" + n.toFixed(2);
  window.SC = { $, $$, money };

  /* ---------- Cart state ---------- */
  const KEY = "shirleycafe_cart_v2";
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* ignore */ } };

  function renderBadge() {
    const badge = $("#cartCount");
    if (!badge) return;
    const n = items.reduce((s, it) => s + it.qty, 0);
    badge.textContent = String(n);
    badge.classList.toggle("show", n > 0);
  }

  function toast(msg) {
    const t = $("#cartToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function emit() { document.dispatchEvent(new CustomEvent("cart:changed")); }

  SC.cartItems = () => items.slice();

  SC.addToCart = function (name, price) {
    name = String(name); price = Number(price);
    if (!name || !isFinite(price)) return;
    const found = items.find(it => it.name === name);
    if (found) found.qty += 1;
    else items.push({
      id: String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name, price: Math.round(price * 100) / 100, qty: 1
    });
    save(); renderBadge();
    toast(`Added ${name} to your order`);
    emit();
  };

  SC.setQty = function (id, qty) {
    const it = items.find(i2 => i2.id === id);
    if (!it) return;
    it.qty = Math.max(0, Number(qty) | 0);
    if (it.qty === 0) items = items.filter(x => x.id !== id);
    save(); renderBadge(); emit();
  };

  SC.removeItem = function (id) {
    items = items.filter(x => x.id !== id);
    save(); renderBadge(); emit();
  };

  /* ---------- Add-to-order buttons (menu page & elsewhere) ---------- */
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    SC.addToCart(btn.dataset.add, btn.dataset.price);
  });

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const links = $("#navLinks");
      links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", links.classList.contains("open"));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  renderBadge();
})();
