/* Agata Kennedy — interactions: nav, floor plan, 3D drag, filters, form */
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

  /* ---------- interactive floor plan ---------- */
  var ROOM_INFO = {
    great:   { name: "Great Room", detail: "780 sqft of glass-wrapped living with a linear fireplace and direct access to the terrace. Mountain views from every seat." },
    kitchen: { name: "Kitchen",    detail: "420 sqft double-island chef's kitchen — integrated appliances, quartzite counters and a hidden walk-in pantry." },
    primary: { name: "Primary Suite", detail: "560 sqft suite with a private morning patio, spa bath with soaking tub and dual dressing rooms." },
    office:  { name: "Office",     detail: "190 sqft glass-lined study — ideal work-from-home space with its own desert view." },
    patio:   { name: "Terrace",    detail: "1,100 sqft covered terrace with outdoor kitchen, fire lounge and negative-edge pool beyond." }
  };
  var detailEl = document.getElementById("room-detail");
  var plan = document.getElementById("floorplan");

  function selectRoom(key) {
    if (!ROOM_INFO[key] || !detailEl) return;
    plan.querySelectorAll(".room").forEach(function (r) {
      r.classList.toggle("is-active", r.dataset.room === key);
    });
    var info = ROOM_INFO[key];
    detailEl.innerHTML =
      "<li><strong>" + info.name + "</strong><br>" + info.detail + "</li>";
  }

  if (plan && detailEl) {
    plan.querySelectorAll(".room").forEach(function (r) {
      r.addEventListener("click", function () { selectRoom(r.dataset.room); });
      r.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectRoom(r.dataset.room); }
      });
    });
    selectRoom("great"); // default state, no animation on load
  }

  /* ---------- touch-draggable CSS 3D house ---------- */
  var house = document.getElementById("house3d");
  if (house) {
    var rx = -12, ry = 28, dragging = false, lastX = 0, lastY = 0;
    function apply() { house.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)"; }
    function start(x, y) { dragging = true; lastX = x; lastY = y; }
    function move(x, y) {
      if (!dragging) return;
      ry += (x - lastX) * 0.5;
      rx = Math.max(-70, Math.min(20, rx - (y - lastY) * 0.3));
      lastX = x; lastY = y; apply();
    }
    house.addEventListener("pointerdown", function (e) { start(e.clientX, e.clientY); house.setPointerCapture(e.pointerId); });
    window.addEventListener("pointermove", function (e) { move(e.clientX, e.clientY); });
    window.addEventListener("pointerup", function () { dragging = false; });
    apply();
  }

  /* ---------- listings price filter ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll("#listing-grid .card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.dataset.filter;
      cards.forEach(function (card) {
        var p = Number(card.dataset.price || 0);
        var show = f === "all" ||
          (f === "under3m" && p < 3000000) ||
          (f === "over3m" && p >= 3000000);
        card.style.display = show ? "" : "none";
      });
    });
  });

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
      note.textContent = "Thanks, " + name + "! Your message is noted — Agata will reach out at " + email + ". For anything urgent, call (602) 697-0401.";
      form.reset();
    });
  }
})();
