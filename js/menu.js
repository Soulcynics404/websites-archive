/* ============================================================
   Coffee in the Wood — menu page: add-to-order + cart + summary
   ============================================================ */
(function () {
  'use strict';

  if (!window.CITW) return;

  var itemsEl   = document.getElementById('cart-items');
  var emptyEl   = document.getElementById('cart-empty');
  var totalEl   = document.getElementById('cart-total');
  var summaryEl = document.getElementById('summary-list');
  var clearBtn  = document.getElementById('clearCart');
  var checkout  = document.getElementById('checkoutBtn');
  var money = function (n) { return '£' + n.toFixed(2); };

  function render() {
    var cart = window.CITW.getCart();

    /* line items */
    if (itemsEl) {
      itemsEl.innerHTML = '';
      cart.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'cart-item';

        var left = document.createElement('span');
        left.className = 'cart-item-name';
        left.textContent = item.name;
        li.appendChild(left);

        var qtyWrap = document.createElement('span');
        qtyWrap.className = 'qty-controls';
        var minus = document.createElement('button');
        minus.className = 'qty-btn'; minus.type = 'button';
        minus.setAttribute('aria-label', 'Decrease ' + item.name);
        minus.textContent = '−';
        var qty = document.createElement('b');
        qty.textContent = String(item.qty);
        var plus = document.createElement('button');
        plus.className = 'qty-btn'; plus.type = 'button';
        plus.setAttribute('aria-label', 'Increase ' + item.name);
        plus.textContent = '+';
        qtyWrap.appendChild(minus); qtyWrap.appendChild(qty); qtyWrap.appendChild(plus);
        li.appendChild(qtyWrap);

        var right = document.createElement('span');
        var priceSpan = document.createElement('span');
        priceSpan.className = 'cart-item-price';
        priceSpan.textContent = money(item.qty * item.price);
        right.appendChild(priceSpan);
        var rm = document.createElement('button');
        rm.className = 'cart-remove'; rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + item.name);
        rm.setAttribute('title', 'Remove');
        rm.textContent = '✕';
        right.appendChild(rm);
        li.appendChild(right);

        minus.addEventListener('click', function () { window.CITW.setQty(item.id, item.qty - 1); });
        plus.addEventListener('click', function () { window.CITW.setQty(item.id, item.qty + 1); });
        rm.addEventListener('click', function () { window.CITW.remove(item.id); });

        itemsEl.appendChild(li);
      });
    }

    /* empty state + totals + checkout gating */
    if (emptyEl) emptyEl.style.display = cart.length ? 'none' : 'block';
    var total = window.CITW.total();
    var count = window.CITW.count();
    if (totalEl) totalEl.textContent = money(total);
    if (checkout) {
      checkout.classList.toggle('is-disabled', !count);
      checkout.setAttribute('aria-disabled', String(!count));
    }

    /* order summary list */
    if (summaryEl) {
      summaryEl.innerHTML = '';
      if (!cart.length) {
        var ph = document.createElement('li');
        ph.className = 'os-placeholder';
        ph.textContent = 'Nothing added yet.';
        summaryEl.appendChild(ph);
      } else {
        cart.forEach(function (item) {
          var li = document.createElement('li');
          var nameSpan = document.createElement('span');
          nameSpan.textContent = item.qty + '× ' + item.name;
          var priceSpan = document.createElement('span');
          priceSpan.textContent = money(item.qty * item.price);
          li.appendChild(nameSpan); li.appendChild(priceSpan);
          summaryEl.appendChild(li);
        });
        var totLi = document.createElement('li');
        totLi.className = 'os-total';
        var tLabel = document.createElement('span'); tLabel.textContent = 'Total';
        var tVal = document.createElement('span'); tVal.textContent = money(total);
        totLi.appendChild(tLabel); totLi.appendChild(tVal);
        summaryEl.appendChild(totLi);
      }
    }
  }

  /* Add-to-order buttons */
  document.querySelectorAll('.add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.CITW.add({
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-price')),
        qty: 1
      });
      btn.classList.add('added');
      var prev = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(function () { btn.classList.remove('added'); btn.textContent = prev; }, 1100);
    });
  });

  if (clearBtn) clearBtn.addEventListener('click', function () { window.CITW.clear(); });

  document.addEventListener('cart:changed', render);
  render();
})();
