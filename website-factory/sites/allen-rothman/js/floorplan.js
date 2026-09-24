// Interactive floor plan — click rooms, drag to tilt (3D perspective)
(function () {
  var svg = document.getElementById('floorPlan');
  if (!svg) return;
  var card = document.getElementById('planCard');
  var info = document.getElementById('planInfo');

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }

  // Rooms: x,y,w,h,label,dims,blurb
  var rooms = [
    { x: 20,  y: 20,  w: 250, h: 200, label: 'Living Room',   dims: "18' × 14'", blurb: 'South-facing with pre-war detail, two exposures and original herringbone floors.' },
    { x: 280, y: 20,  w: 160, h: 120, label: 'Kitchen',       dims: "11' × 9'",  blurb: 'Renovated galley kitchen with stone counters and a window over the sink.' },
    { x: 450, y: 20,  w: 130, h: 200, label: 'Primary Bed',   dims: "15' × 12'", blurb: 'Quiet rear bedroom with generous closets and en-suite bath access.' },
    { x: 280, y: 150, w: 160, h: 70,  label: 'Dining Area',   dims: "11' × 6'",  blurb: 'Open to the kitchen — comfortably seats six under the original sconces.' },
    { x: 20,  y: 230, w: 130, h: 150, label: 'Second Bed',    dims: "12' × 10'", blurb: 'Bright corner bedroom ideal as a nursery, office, or guest suite.' },
    { x: 160, y: 230, w: 110, h: 70,  label: 'Bath',          dims: "8' × 6'",   blurb: 'Full bath restored with period tile and modern fixtures.' },
    { x: 280, y: 230, w: 300, h: 150, label: 'Terrace',       dims: "22' × 10'", blurb: "Wrap-around terrace with open skyline views — the home's signature space." }
  ];

  rooms.forEach(function (r, i) {
    var g = el('g', { class: 'room-group', 'data-index': i });
    var rect = el('rect', { class: 'room', x: r.x, y: r.y, width: r.w, height: r.h, rx: 4 });
    var label = el('text', {
      class: 'room-label',
      x: r.x + r.w / 2, y: r.y + r.h / 2 - 4,
      'text-anchor': 'middle'
    }, r.label);
    var dim = el('text', {
      class: 'room-dim',
      x: r.x + r.w / 2, y: r.y + r.h / 2 + 14,
      'text-anchor': 'middle'
    }, r.dims);
    g.appendChild(rect); g.appendChild(label); if (r.h > 60) g.appendChild(dim);
    svg.appendChild(g);
  });

  // doors
  [[270, 90, 290, 110], [270, 260, 280, 280], [150, 220, 170, 230], [440, 100, 450, 130]].forEach(function (d) {
    svg.appendChild(el('line', { class: 'door', x1: d[0], y1: d[1], x2: d[2], y2: d[3] }));
  });

  function select(i) {
    var rects = svg.querySelectorAll('.room');
    rects.forEach(function (r) { r.classList.remove('is-active'); });
    rects[i].classList.add('is-active');
    var r = rooms[i];
    info.innerHTML =
      '<h3>' + r.label + '</h3>' +
      '<p class="dim-big">' + r.dims + '</p>' +
      '<p>' + r.blurb + '</p>';
  }

  svg.addEventListener('click', function (e) {
    var t = e.target.closest('.room-group');
    if (t) select(+t.getAttribute('data-index'));
  });

  // Drag to tilt (3D), works for touch + mouse
  var dragging = false, startX = 0, startY = 0, rx = 0, ry = 0;
  function down(x, y) { dragging = true; startX = x; startY = y; card.style.cursor = 'grabbing'; }
  function move(x, y) {
    if (!dragging) return;
    ry = Math.max(-18, Math.min(18, ry + (x - startX) * 0.08));
    rx = Math.max(-14, Math.min(14, rx - (y - startY) * 0.08));
    card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    startX = x; startY = y;
  }
  function up() { dragging = false; card.style.cursor = 'grab'; }

  card.addEventListener('mousedown', function (e) { e.preventDefault(); down(e.clientX, e.clientY); });
  window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
  window.addEventListener('mouseup', up);
  card.addEventListener('touchstart', function (e) { var t = e.touches[0]; down(t.clientX, t.clientY); }, { passive: true });
  card.addEventListener('touchmove', function (e) { var t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });
  card.addEventListener('touchend', up);

  select(0);
})();
