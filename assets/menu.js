/* Stonehenge Cafe — menu page: catalog, filters, cart drawer, order summary */
(function () {
  'use strict';

  function U(pid) {
    return 'https://images.unsplash.com/' + pid + '?auto=format&fit=crop&w=600&q=80';
  }

  var MENU = [
    /* ---- Full English breakfasts ---- */
    { id: 'full-stonehenge', cat: 'breakfasts', name: 'The Full Stonehenge', price: 9.50, tag: 'Most popular', hot: true,
      desc: 'Two bacon, two sausage, two eggs any style, tomato, mushrooms, beans and four toast.',
      img: U('photo-1533089860892-a7c6f0a88666') },
    { id: 'mega-morning', cat: 'breakfasts', name: 'Mega Morning', price: 12.50, tag: 'Big one',
      desc: 'The Full Stonehenge plus extra sausage, black pudding, hash brown and chips on the side.',
      img: U('photo-1608039829572-78524f79c4c7') },
    { id: 'builders-breakfast', cat: 'breakfasts', name: "Builder's Breakfast", price: 6.90,
      desc: 'Bacon, egg, sausage, beans and one slice of toast. Gets you through till teatime.',
      img: U('photo-1598214886806-c87b84b7078b') },
    { id: 'regular-fryup', cat: 'breakfasts', name: 'Regular Fry-Up', price: 5.90, tag: 'Best value',
      desc: 'One bacon, one sausage, one egg, beans and toast. The classic counter order.',
      img: U('photo-1525351484163-7529414344d8') },
    { id: 'veggie-stonehenge', cat: 'breakfasts', name: 'Veggie Stonehenge', price: 7.90, tag: 'Veggie',
      desc: 'Vegetarian sausage, grilled tomato, mushrooms, eggs, beans and toast. No compromise.',
      img: U('photo-1510693206972-df098062cb71') },
    { id: 'eggs-benedict', cat: 'breakfasts', name: 'Eggs Benedict', price: 7.50,
      desc: 'Poached eggs, ham and hollandaise on a toasted muffin. The weekend treat.',
      img: U('photo-1614145121029-83a9f7b68bf4') },
    { id: 'american-pancakes', cat: 'breakfasts', name: 'American Pancakes', price: 7.20,
      desc: 'Three fluffy pancakes, crispy bacon and maple syrup. Sweet meets proper.',
      img: U('photo-1567620905732-2d1ec7ab7445') },
    { id: 'avo-poached-toast', cat: 'breakfasts', name: 'Avocado & Poached Egg Toast', price: 7.40,
      desc: 'Smashed avo on sourdough with two poached eggs and chilli flakes.',
      img: U('photo-1541519227354-08fa5d50c44d') },
    { id: 'beans-on-toast', cat: 'breakfasts', name: 'Beans on Toast', price: 3.50,
      desc: 'Heinz beans on buttered thick-cut toast. A British institution.',
      img: U('photo-1484723091739-30a097e8f929') },

    /* ---- Sandwiches ---- */
    { id: 'bacon-bap', cat: 'sandwiches', name: 'Bacon Bap', price: 3.80, tag: 'Cafe classic', hot: true,
      desc: 'Proper back bacon in a soft floury bap. Brown sauce optional but encouraged.',
      img: U('photo-1528735602780-2552fd46c7af') },
    { id: 'sausage-roll', cat: 'sandwiches', name: 'Sausage Roll', price: 2.60,
      desc: 'Oven-fresh, flaky all-butter pastry. With or without mustard mayo.',
      img: U('photo-1603532648955-039310d9ed75') },
    { id: 'chicken-club', cat: 'sandwiches', name: 'Chicken Club', price: 6.50,
      desc: 'Grilled chicken, bacon, lettuce, tomato and mayo stacked on toasted bloomer.',
      img: U('photo-1520072959219-c595dc870360') },
    { id: 'tuna-bloomer', cat: 'sandwiches', name: 'Tuna & Cucumber Bloomer', price: 4.40,
      desc: 'Creamy tuna mayo with cucumber on thick-cut bloomer bread.',
      img: U('photo-1509722747041-616f39b57569') },
    { id: 'cheese-pickle', cat: 'sandwiches', name: 'Cheese & Pickle', price: 3.90,
      desc: 'Mature cheddar, tangy pickle, buttered granary. Simple done right.',
      img: U('photo-1553909489-cd47e0907980') },
    { id: 'ham-salad-bap', cat: 'sandwiches', name: 'Ham Salad Bap', price: 4.20,
      desc: 'Honey ham, salad cream and crisp salad in a soft bap.',
      img: U('photo-1588137378633-dea1336ce1e2') },

    /* ---- Sides & sweets ---- */
    { id: 'chips', cat: 'sides', name: 'Chips', price: 2.80,
      desc: 'Thick-cut, twice-cooked, salt and vinegar on request.',
      img: U('photo-1573080496219-bb080dd4f877') },
    { id: 'toast-jam', cat: 'sides', name: 'Toast & Jam', price: 1.80,
      desc: 'Two slices of thick white or granary toast with butter and jam.',
      img: U('photo-1484723091739-30a097e8f929') },
    { id: 'croissant', cat: 'sides', name: 'Buttered Croissant', price: 2.20,
      desc: 'All-butter croissant, warmed through if you like.',
      img: U('photo-1555507036-ab1f4038808a') },
    { id: 'bread-basket', cat: 'sides', name: 'Fresh Bread Basket', price: 2.50,
      desc: 'Warm bloomer and granary slices straight from the morning bake.',
      img: U('photo-1509440159596-0249088772ff') },

    /* ---- Drinks ---- */
    { id: 'flat-white', cat: 'drinks', name: 'Flat White', price: 2.90, tag: 'Barista', hot: true,
      desc: 'Double shot, silky milk, proper crema.',
      img: U('photo-1541167760496-1628856ab772') },
    { id: 'latte', cat: 'drinks', name: 'Latte', price: 2.80,
      desc: 'Latte art as standard. Skim, semi or whole milk — your shout.',
      img: U('photo-1495474472287-4d71bcdd2085') },
    { id: 'americano', cat: 'drinks', name: 'Americano', price: 2.50,
      desc: 'Long black, strong enough to pass the spoon test.',
      img: U('photo-1509042239860-f550ce710b93') },
    { id: 'pot-of-tea', cat: 'drinks', name: 'Pot of Tea', price: 1.90,
      desc: 'Loose-leaf pot for one, milk on the side, biscuit on the saucer.',
      img: U('photo-1571934811356-5cc061b6821f') }
  ];

  var CATS = [
    { key: 'all', label: 'Everything' },
    { key: 'breakfasts', label: 'Full English Breakfasts' },
    { key: 'sandwiches', label: 'Sandwiches' },
    { key: 'sides', label: 'Sides & Sweets' },
    { key: 'drinks', label: 'Tea, Coffee & More' }
  ];

  var grid = document.getElementById('menuGrid');
  var chipsWrap = document.getElementById('catChips');
  var drawer = document.getElementById('cartDrawer');
  var backdrop = document.getElementById('drawerBackdrop');
  var drawerBody = document.getElementById('drawerBody');
  var drawerTotal = document.getElementById('drawerTotal');
  var cartBar = document.getElementById('cartBar');
  var cartBarTotal = document.getElementById('cartBarTotal');
  var summaryLines = document.getElementById('summaryLines');
  var summaryTotal = document.getElementById('summaryTotal');
  var detailsField = document.getElementById('orderDetailsField');
  var emptySummary = document.getElementById('emptySummary');
  var orderForm = document.getElementById('orderForm');

  var activeCat = 'all';
  var cart = window.__shCart;

  function money(n) {
    return '£' + Number(n).toFixed(2);
  }

  function findItem(id) {
    for (var i = 0; i < MENU.length; i++) {
      if (MENU[i].id === id) return MENU[i];
    }
    return null;
  }

  /* ================= menu grid ================= */

  function visibleItems() {
    if (activeCat === 'all') return MENU;
    return MENU.filter(function (m) { return m.cat === activeCat; });
  }

  function cardHtml(m) {
    var tagHtml = '';
    if (m.tag) {
      var cls = m.hot ? 'dish-tag hot' : 'dish-tag';
      tagHtml = '<span class="' + cls + '">' + m.tag + '</span>';
    }
    var html = '<article class="dish-card" data-cat="' + m.cat + '" data-id="' + m.id + '">';
    html += '<div class="dish-media"><img src="' + m.img + '" alt="' + m.name + '" loading="lazy">' + tagHtml + '</div>';
    html += '<div class="dish-body">';
    html += '<div class="dish-row"><h3>' + m.name + '</h3><span class="price">' + money(m.price) + '</span></div>';
    html += '<p>' + m.desc + '</p>';
    html += '<button class="add-btn" type="button" data-add="' + m.id + '">Add to Order · ' + money(m.price) + '</button>';
    html += '</div></article>';
    return html;
  }

  function renderMenu() {
    var list = visibleItems();
    var parts = [];
    for (var i = 0; i < list.length; i++) parts.push(cardHtml(list[i]));
    grid.innerHTML = parts.join('');
  }

  function bindAddButtons() {
    var btns = grid.querySelectorAll('[data-add]');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        var item = findItem(btn.getAttribute('data-add'));
        if (!item) return;
        cart.add(item.id, item.name, item.price, item.img);
        renderCartUI();
        var prev = btn.textContent;
        btn.classList.add('added');
        btn.textContent = 'Added ✓';
        window.setTimeout(function () {
          btn.classList.remove('added');
          btn.textContent = prev;
        }, 1100);
      });
    });
  }

  function renderChips() {
    var parts = [];
    for (var i = 0; i < CATS.length; i++) {
      var c = CATS[i];
      var sel = c.key === activeCat ? ' active' : '';
      parts.push('<button type="button" role="tab" aria-selected="' + (c.key === activeCat) +
        '" class="chip' + sel + '" data-cat="' + c.key + '">' + c.label + '</button>');
    }
    chipsWrap.innerHTML = parts.join('');
    var chips = chipsWrap.querySelectorAll('.chip');
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        activeCat = chip.getAttribute('data-cat');
        renderChips();
        renderMenu();
        bindAddButtons();
      });
    });
  }

  /* ================= cart drawer ================= */

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
  }

  function lineTotal(it) { return it.price * it.qty; }

  function totalOf(items) {
    var t = 0;
    for (var i = 0; i < items.length; i++) t += lineTotal(items[i]);
    return t;
  }

  function renderDrawer() {
    var items = cart.read();
    if (items.length === 0) {
      drawerBody.innerHTML = '<div class="cart-empty"><div class="big">🛒</div>' +
        '<p><b>Your tray is empty.</b></p><p>Add something tasty from the menu above.</p></div>';
    } else {
      var rows = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var row = '<div class="cart-item" data-line="' + it.id + '">';
        row += '<img src="' + it.img + '" alt="" loading="lazy">';
        row += '<div><div class="ci-name">' + it.name + '</div>';
        row += '<div class="ci-price">' + money(it.price) + ' each</div>';
        row += '<div class="qty">';
        row += '<button type="button" class="dec" data-dec="' + it.id + '" aria-label="Decrease quantity">−</button>';
        row += '<span>' + it.qty + '</span>';
        row += '<button type="button" class="inc" data-inc="' + it.id + '" aria-label="Increase quantity">+</button>';
        row += '</div></div>';
        row += '<div style="text-align:right"><div class="ci-line-total">' + money(lineTotal(it)) + '</div>';
        row += '<button type="button" class="ci-remove" data-remove="' + it.id + '">Remove</button></div>';
        row += '</div>';
        rows.push(row);
      }
      drawerBody.innerHTML = rows.join('');
    }
    drawerTotal.textContent = money(totalOf(items));
    cartBarTotal.textContent = money(totalOf(items));
    cartBar.classList.toggle('show', items.length > 0);
  }

  function bindDrawerControls() {
    var incs = drawerBody.querySelectorAll('[data-inc]');
    Array.prototype.forEach.call(incs, function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-inc');
        cart.setQty(id, qtyOf(id) + 1);
        renderCartUI();
      });
    });
    var decs = drawerBody.querySelectorAll('[data-dec]');
    Array.prototype.forEach.call(decs, function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-dec');
        cart.setQty(id, qtyOf(id) - 1);
        renderCartUI();
      });
    });
    var rems = drawerBody.querySelectorAll('[data-remove]');
    Array.prototype.forEach.call(rems, function (b) {
      b.addEventListener('click', function () {
        cart.setQty(b.getAttribute('data-remove'), 0);
        renderCartUI();
      });
    });
  }

  function qtyOf(id) {
    var items = cart.read();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i].qty;
    }
    return 0;
  }

  /* ================= order summary ================= */

  function renderSummary() {
    var items = cart.read();
    var parts = [];
    if (items.length === 0) {
      parts.push('<p style="color:rgba(59,47,38,.55);font-size:.92rem;padding:.6rem 0">Nothing added yet — pick something from the menu above.</p>');
    } else {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        parts.push('<div style="display:flex;justify-content:space-between;gap:1rem;padding:.45rem 0;font-size:.95rem">' +
          '<span>' + it.qty + '× ' + it.name + '</span><b>' + money(lineTotal(it)) + '</b></div>');
      }
    }
    summaryLines.innerHTML = parts.join('');
    summaryTotal.textContent = money(totalOf(items));

    var detailParts = [];
    for (var j = 0; j < items.length; j++) {
      detailParts.push(items[j].qty + 'x ' + items[j].name + ' @ ' + money(items[j].price) + ' = ' + money(lineTotal(items[j])));
    }
    detailsField.value = detailParts.join('; ');

    var submitBtn = document.getElementById('placeOrderBtn');
    if (items.length === 0) {
      emptySummary.style.display = 'block';
      orderForm.style.display = 'none';
    } else {
      emptySummary.style.display = 'none';
      orderForm.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
    }
  }

  function renderCartUI() {
    renderDrawer();
    bindDrawerControls();
    renderSummary();
  }

  /* ================= boot ================= */

  function boot() {
    renderChips();
    renderMenu();
    bindAddButtons();
    renderCartUI();

    cartBar.addEventListener('click', openDrawer);
    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    var checkout = document.getElementById('checkoutBtn');
    checkout.addEventListener('click', function () { closeDrawer(); });

    orderForm.addEventListener('submit', function () {
      try { window.localStorage.removeItem('stonehenge_cart_v2'); } catch (e) { /* noop */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
