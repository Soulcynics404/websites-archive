/* Chic Maquillage Artistry — interactions: nav, 3D tilt, form */
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

  /* ---------- pointer 3D tilt ---------- */
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

  /* ---------- booking form (client-side demo only — no email sent) ---------- */
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
      note.textContent = "Merci, " + name + "! Jennifer will reply to " + email +
        " within a day. Need an answer sooner? Text (623) 399-7654.";
      form.reset();
    });
  }
})();
