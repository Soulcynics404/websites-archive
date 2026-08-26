// Shared behavior: mobile nav, featured listings, listing grid + filters, contact form
(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var LISTINGS = [
    { price: '$3,850,000', title: 'Pre-War Co-op · Riverside Drive', meta: '3 Bed · 2.5 Bath · 2,100 sq ft', area: 'Uptown', seed: 'riverside-prewar-coop' },
    { price: '$2,495,000', title: 'Renovated Condo · Lincoln Square', meta: '2 Bed · 2 Bath · 1,450 sq ft', area: 'Uptown', seed: 'lincoln-square-condo' },
    { price: '$5,200,000', title: 'Estate Residence · Central Park West', meta: '4 Bed · 3.5 Bath · 2,900 sq ft', area: 'Uptown', seed: 'cpw-estate-residence' },
    { price: '$1,975,000', title: 'Corner One-Bed · NoMad Tower', meta: '1 Bed · 1.5 Bath · 1,100 sq ft', area: 'Midtown', seed: 'nomad-tower-corner' },
    { price: '$7,400,000', title: 'Penthouse · Gramercy Park', meta: '4 Bed · 4 Bath · 3,300 sq ft', area: 'Downtown', seed: 'gramercy-penthouse' },
    { price: '$2,890,000', title: 'Loft · Tribeca Cast-Iron District', meta: '2 Bed · 2 Bath · 1,700 sq ft', area: 'Downtown', seed: 'tribeca-castiron-loft' }
  ];

  function cardHTML(l) {
    return '<article class="listing-card">' +
      '<div class="listing-media"><img loading="lazy" width="640" height="440" alt="' + l.title + '" ' +
      'src="https://picsum.photos/seed/' + l.seed + '/640/440.jpg"></div>' +
      '<div class="listing-body"><p class="listing-price">' + l.price + '</p>' +
      '<p class="listing-title">' + l.title + '</p>' +
      '<p class="listing-meta">' + l.meta + '</p>' +
      '<span class="listing-tag">' + l.area + '</span></div></article>';
  }

  var grid = document.getElementById('featuredGrid');
  if (grid) grid.innerHTML = LISTINGS.slice(0, 3).map(cardHTML).join('');

  var listGrid = document.getElementById('listingGrid');
  if (listGrid) {
    function render(filter) {
      var items = filter === 'all' ? LISTINGS : LISTINGS.filter(function (l) { return l.area === filter; });
      listGrid.innerHTML = items.map(cardHTML).join('');
      document.getElementById('noResults').hidden = items.length > 0;
    }
    render('all');
    document.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        render(chip.getAttribute('data-filter'));
      });
    });
  }

  // Contact form (front-end only)
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      if (!name || !email || !msg || email.indexOf('@') < 0) {
        note.textContent = 'Please complete your name, a valid email, and a note about your property.';
        return;
      }
      note.textContent = 'Thank you, ' + name.split(' ')[0] + ' — Allen will reply personally within one business day.';
      form.reset();
    });
  }
})();
