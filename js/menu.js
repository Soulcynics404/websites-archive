/* Moby's Coffee Shop — menu page: cart UI + order summary */
(function () {
  "use strict";

  function $(s) { return document.querySelector(s); }

  /* ---------- Add-to-order buttons (event delegation) ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-btn");
    if (!btn) return;
    window.MobyCart.add({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      img: btn.dataset.img || "",
      qty: 1
    });
    var label = btn.textContent;
    btn.textContent = "✓ Added!";
    setTimeout(function () { btn.textContent = label; }, 900);
    if (window.mobyToast) window.mobyToast(btn.dataset.name + " added to your order");
  });

  /* ---------- Order summary rendering ---------- */
  function renderCart() {
    var cart = window.MobyCart.items();
    var linesEl = $("#cart-lines");
    var sumWrap = $("#cart-summary");
    var emptyMsg = $("#empty-cart-msg");
    var bar = $("#cart-bar");
    if (!linesEl) return;

    linesEl.innerHTML = "";
    var count = 0, subtotal = 0;

    cart.forEach(function (l) {
      count += l.qty;
      subtotal += l.qty * l.price;
      var row = document.createElement("div");
      row.className = "cart-line";
      row.setAttribute("data-id", l.id);
      row.innerHTML =
        '<img class="cart-thumb" src="' + l.img + '" alt="">' +
        '<div><h4>' + escapeHtml(l.name) + '</h4>' +
        '<span class="unit">' + window.MobyCart.money(l.price) + ' each</span></div>' +
        '<div class="qty-controls">' +
        '<button aria-label="Decrease quantity of ' + escapeHtml(l.name) + '" onclick="mobySetQty(\'' + l.id + '\',-1)">−</button>' +
        '<span class="qty-num">' + l.qty + '</span>' +
        '<button aria-label="Increase quantity of ' + escapeHtml(l.name) + '" onclick="mobySetQty(\'' + l.id + '\',1)">+</button>' +
        '</div>' +
        '<span class="line-total">' + window.MobyCart.money(l.qty * l.price) + '</span>' +
        '<button class="remove-x" aria-label="Remove ' + escapeHtml(l.name) + ' from order" onclick="mobyRemoveItem(\'' + l.id + '\')" title="Remove">✕</button>';
      linesEl.appendChild(row);
    });

    var hasItems = cart.length > 0;
    sumWrap.style.display = hasItems ? "block" : "none";
    emptyMsg.style.display = hasItems ? "none" : "block";

    if (hasItems) {
      $("#sum-count").textContent = count;
      $("#sum-subtotal").textContent = window.MobyCart.money(subtotal);
      $("#sum-total").textContent = window.MobyCart.money(subtotal);
    }

    // sticky bar
    if (bar) {
      if (count > 0) {
        bar.classList.remove("hidden");
        $("#bar-total").textContent = window.MobyCart.money(subtotal);
        $("#bar-count").textContent = count + (count === 1 ? " item" : " items") + " in your order";
      } else {
        bar.classList.add("hidden");
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Global handlers used by inline onclick ---------- */
  window.mobySetQty = function (id, delta) {
    var line = window.MobyCart.items().find(function (l) { return l.id === id; });
    if (!line) return;
    window.MobyCart.setQty(id, line.qty + delta);
  };
  window.mobyRemoveItem = function (id) { window.MobyCart.remove(id); };
  window.clearMobyCart = function () {
    window.MobyCart.clear();
    if (window.mobyToast) window.mobyToast("Order cleared");
  };
  window.scrollToSummary = function (e) {
    if (e) e.preventDefault();
    var t = document.getElementById("order-summary");
    if (t) t.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", renderCart);
  document.addEventListener("cart:changed", renderCart);
})();