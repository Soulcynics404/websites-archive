/* ============================================================
   Coffee in the Wood — contact form niceties.
   The form POSTs natively to https://formsubmit.co/harshraj8253@gmail.com
   (first-ever submission triggers FormSubmit's one-time email
   activation for that address). We just show a friendly status
   line on submit; no fetch interception so the handoff always works,
   even if JS fails.
   ============================================================ */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (!form || !status) return;
  form.addEventListener('submit', function () {
    status.classList.add('show');
  });
})();
