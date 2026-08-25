/* 21 GRAMS — menu page: order summary + FormSubmit order submission */
(function () {
  'use strict';

  var form = document.getElementById('order-form');
  if (!form || !window.GramsCart) return;

  function refresh() {
    var items = window.GramsCart.load();
    var lines = items.map(function (i) {
      return i.qty + 'x ' + i.name + ' — £' + (i.price * i.qty).toFixed(2);
    });
    var total = 'Total: £' + window.GramsCart.total().toFixed(2);
    document.getElementById('order-items-field').value = lines.join('; ') || '(empty tray)';
    document.getElementById('order-total-field').value = total;
  }

  form.addEventListener('submit', function () {
    refresh();
    /* keep the tray so guests can re-order; they can clear it from the drawer */
  });

  refresh();
})();
