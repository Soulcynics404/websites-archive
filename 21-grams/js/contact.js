/* 21 GRAMS — contact page: show status note on first FormSubmit activation */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form || !status) return;
  form.addEventListener('submit', function () {
    status.style.display = 'block';
  });
})();
