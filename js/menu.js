/* ============================================================
   Martil Cafe — menu page logic
   Category filters, live order summary, FormSubmit handoff.
   ============================================================ */
(() => {
  /* ---------------- category filter chips ---------------- */
  const chips = document.querySelectorAll(".filter-chip");
  const cats = document.querySelectorAll(".menu-category");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => { c.classList.toggle("active", c === chip); c.setAttribute("aria-selected", c === chip ? "true" : "false"); });
      const f = chip.dataset.filter;
      cats.forEach((catEl) => {
        catEl.classList.toggle("dimmed", f !== "all" && catEl.dataset.cat !== f);
      });
    });
  });

  /* ---------------- order summary rendering ---------------- */
  const linesEl = document.getElementById("order-lines");
  const totalsEl = document.getElementById("order-totals");
  const totalEl = document.getElementById("os-total");
  const detailsInput = document.getElementById("order-details-input");
  const submitBtn = document.getElementById("os-submit");
  if (!linesEl) return;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function renderSummary() {
    const items = MartilCart.items();
    const total = MartilCart.total();

    if (!items.length) {
      linesEl.innerHTML =
        '<p class="os-empty">Your order is empty — add a few things from the menu above.<br>' +
        '<a href="#top" class="btn btn-ghost btn-sm" style="margin-top:12px">Browse the menu ↑</a></p>';
      totalsEl.style.display = "none";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = ".55"; }
      detailsInput.value = "";
      return;
    }

    linesEl.innerHTML = items.map((i) =>
      '<div class="order-line" data-id="' + i.id + '">' +
        '<img src="' + i.photo + '" alt="" loading="lazy">' +
        '<div class="ol-name"><strong>' + esc(i.name) + "</strong><span>£" + i.price.toFixed(2) + " each</span></div>" +
        '<div class="qty-controls">' +
          '<button class="qty-btn" data-dec aria-label="Decrease quantity of ' + esc(i.name) + '">−</button>' +
          '<span class="qty-num">' + i.qty + "</span>" +
          '<button class="qty-btn" data-inc aria-label="Increase quantity of ' + esc(i.name) + '">+</button>' +
          '<button class="ol-remove" data-remove aria-label="Remove ' + esc(i.name) + '">✕</button>' +
        "</div>" +
        '<div class="ol-price">£' + (i.qty * i.price).toFixed(2) + "</div>" +
      "</div>"
    ).join("");

    totalsEl.style.display = "";
    totalEl.textContent = "£" + total.toFixed(2);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ""; }

    // hidden field for FormSubmit
    detailsInput.value = items.map((i) => i.qty + "× " + i.name + " (£" + (i.qty * i.price).toFixed(2) + ")").join("\n") + "\nTOTAL: £" + total.toFixed(2);
  }

  document.addEventListener("click", (e) => {
    const rem = e.target.closest("[data-remove]");
    if (rem) {
      const id = rem.closest(".order-line").dataset.id;
      MartilCart.remove(id);
      return;
    }
    const dec = e.target.closest(".order-line [data-dec]");
    const inc = e.target.closest(".order-line [data-inc]");
    if (dec || inc) {
      const line = e.target.closest(".order-line");
      const it = MartilCart.items().find((i) => i.id === line.dataset.id);
      if (!it) return;
      MartilCart.setQty(line.dataset.id, inc ? it.qty + 1 : it.qty - 1);
    }
  });

  const clearBtn = document.getElementById("clear-order");
  if (clearBtn) clearBtn.addEventListener("click", () => MartilCart.clear());

  renderSummary();
  // live-update the summary when items are added anywhere on the page
  window.addEventListener("martil-cart-changed", renderSummary);

  /* ---------------- form: attach summary, show thanks ---------------- */
  const form = document.getElementById("order-form");
  const wrap = document.querySelector(".order-summary");
  if (!form) return;

  form.addEventListener("submit", () => {
    if (MartilCart.count() > 0) {
      // keep a copy so we can restore the summary view after redirect-back
      try { localStorage.setItem("martil_last_order", detailsInput.value); } catch {}
    }
  });

  // Show thank-you state when returning from FormSubmit (?sent=1)
  const params = new URLSearchParams(location.search);
  if (params.get("sent") === "1") {
    form.hidden = true;
    const empty = linesEl.innerHTML;
    document.querySelector(".os-thanks").hidden = false;
    linesEl.innerHTML = "";
    totalsEl.style.display = "none";
    MartilCart.clear();
    history.replaceState(null, "", location.pathname + "#order-summary");
  }

  // Smooth-scroll to summary when arriving with #order-summary
  if (location.hash === "#order-summary") {
    setTimeout(() => wrap.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }
})();
