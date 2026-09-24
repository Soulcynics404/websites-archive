/* Ann Bryan Realty — interactions: nav, 3D tilt, listing filters, form */
(function () {
  "use strict";

  /* ---------- mobile nav ---------- */
  document.querySelectorAll(".nav-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var links = btn.parentElement.querySelector(".nav-links");
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- pointer 3D tilt on media cards ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt], [data-tilt-sm]").forEach(function (el) {
      var strength = el.hasAttribute("data-tilt") ? 8 : 5;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (px * strength).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-py * strength).toFixed(2) + "deg");
        el.classList.add("is-tilting");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tilting");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      });
    });
  }

  /* ---------- listings price filter ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll("#listing-grid .card[data-price]");
  var empty = document.getElementById("no-results");
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var f = chip.dataset.filter;
        var visible = 0;
        cards.forEach(function (card) {
          var p = Number(card.dataset.price || 0);
          var show = f === "all" || (f === "under600" && p < 600000) || (f === "over600" && p >= 600000);
          card.style.display = show ? "" : "none";
          if (show) visible++;
        });
        if (empty) empty.hidden = visible > 0;
      });
    });
  }

  /* ---------- contact form (client-side demo only — no email sent) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("form-note");
      var name = form.querySelector('input[name=name]').value.trim();
      var email = form.querySelector('input[name=email]').value.trim();
      if (!name || !email || email.indexOf("@") < 0) {
        note.textContent = "Please add your name and a valid email.";
        return;
      }
      note.textContent = "Thanks, " + name + "! Ann will reply to " + email +
        " shortly. In a hurry? Call or text (404) 567-6450.";
      form.reset();
    });
  }
})();
