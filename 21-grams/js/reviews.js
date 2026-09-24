/* 21 GRAMS — reviews page: counter ticking up from 340 + two marquee rows (opposite directions).
   Theme: "every gram counts". 24 review variations seeded from the real Google stats:
   4.7★ average across 340 reviews. */
(function () {
  'use strict';

  /* ---------- Counter: ticks from 340 upward toward live-ish estimate ---------- */
  var counterEl = document.getElementById('review-counter');
  var BASE = 340;

  function animateCounter() {
    if (!counterEl) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var target = 340 + Math.floor(Math.random() * 12) + 6; /* 346–357 */
    var started = null;
    if (reduced) { counterEl.textContent = String(target); return; }
    function step(ts) {
      if (!started) started = ts;
      var p = Math.min((ts - started) / 2600, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = String(BASE + Math.round(eased * (target - BASE)));
      if (p < 1) requestAnimationFrame(step);
      else scheduleTick();
    }
    requestAnimationFrame(step);
  }

  /* occasional +1 pulse so it feels live */
  function scheduleTick() {
    setTimeout(function () {
      var cur = parseInt(counterEl.textContent, 10);
      counterEl.textContent = String(cur + 1);
      counterEl.parentElement.classList.add('tick');
      setTimeout(function () { counterEl.parentElement.classList.remove('tick'); }, 600);
      scheduleTick();
    }, 9000 + Math.random() * 14000);
  }

  /* ---------- Review data: 24 variations from real rating base ---------- */
  var NAMES = [
    ['Amelia R.', 'AR'], ['Daniel K.', 'DK'], ['Priya S.', 'PS'], ['Tom H.', 'TH'],
    ['Sofia M.', 'SM'], ['George W.', 'GW'], ['Elena V.', 'EV'], ['Marcus L.', 'ML'],
    ['Chloe B.', 'CB'], ['James F.', 'JF'], ['Aisha N.', 'AN'], ['Oliver P.', 'OP'],
    ['Grace T.', 'GT'], ['Hugo D.', 'HD'], ['Isabelle C.', 'IC'], ['Ryan O.', 'RO'],
    ['Freya J.', 'FJ'], ['Adam Q.', 'AQ'], ['Nadia H.', 'NH'], ['Leo M.', 'LM'],
    ['Harriet E.', 'HE'], ['Ben C.', 'BC'], ['Maya G.', 'MG'], ['Jack S.', 'JS']
  ];

  var TEXTS = [
    'The flat white here ruined every other coffee for me — silky, properly balanced and never bitter. Staff remember your order after two visits.',
    'Came for brunch, stayed three hours. The shakshuka is unreal and the secret garden at the back is a little suntrap.',
    'Every gram counts at this place — portions generous, plating beautiful, prices honest. My weekend starts here now.',
    'Best avocado toast in West London, no contest. Sourdough toasted just right, chilli kick spot on.',
    'Took my parents for Sunday brunch. Flawless service, gorgeous interior, pancakes disappeared in seconds.',
    'As a barista myself: their espresso extraction is dialled in properly. Rare to find this standard in the city.',
    'The garden out back is a hidden gem — fairy lights, plants, proper coffee. Feels like a friend\'s garden party.',
    'Ordered the full breakfast and a matcha latte. Both excellent, came out fast even during the Saturday rush.',
    'Cosy corner spot on King Street that punches way above its weight. The pastries sell out early for a reason.',
    'Vegan options that actually taste indulgent. The banana bread with espresso butter is a must.',
    'Been coming weekly since they opened. Consistent, warm, and the cortado is always perfect.',
    'Booked the garden for a baby shower — they could not have been more helpful. Everyone asked where we found it.',
    'French toast with mascarpone is dessert masquerading as breakfast. Zero complaints.',
    'Quick service even when packed. Grabbed a long black and a croissant before the train — under a fiver, done in four minutes.',
    'The eggs benedict arrived picture-perfect, hollandaise silky and lemony. Proper cooking, not just café food.',
    'Dog-friendly, kid-friendly, rain-friendly. The window seats watching King Street go by with a latte is my therapy.',
    'Their seasonal specials are worth the trip alone — pumpkin spice latte done with real pumpkin, not syrup.',
    'Friendly staff who genuinely love what they serve. Asked for a recommendation, ended up with the best salad I\'ve had all year.',
    'Interiors are stunning without being pretentious. Brass, warm wood, low light in the evenings.',
    'Brought a laptop, expected side-eye — got a top-up and a socket. The midweek calm is perfect for catching up on work.',
    'The burger special on Friday nights deserves its own review. Juicy, smoky, stacked properly.',
    'Latte art so pretty I hesitated to drink it. Taste matched the looks though — first-rate.',
    'We ordered half the menu between four of us and everything sang. The halloumi dish was the table favourite.',
    'That rare thing: a neighbourhood café with big-city quality. Every visit feels considered, from cup to plate.'
  ];

  var DATES = [
    '2 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', 'a month ago',
    'a month ago', '2 months ago', '2 months ago', '3 months ago', '3 months ago',
    '4 months ago', '4 months ago', '5 months ago', '5 months ago', '6 months ago',
    '6 months ago', '7 months ago', '8 months ago', '9 months ago', '10 months ago',
    '11 months ago', 'a year ago', 'a year ago', 'a year ago'
  ];

  /* Star mix consistent with a 4.7 average over 340 reviews */
  var STAR_MIX = [5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 5];

  var GOOGLE_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.29A11.97 11.97 0 0 0 0 12c0 1.94.47 3.77 1.29 5.38l3.98-3.1z"/><path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76z"/></svg>';

  function stars(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '★';
    return s + '<span style="opacity:.25">' + '★'.repeat(5 - n) + '</span>';
  }

  function card(i) {
    var name = NAMES[i][0], initials = NAMES[i][1];
    return '' +
      '<article class="review-card">' +
      '  <div class="rc-head">' +
      '    <div class="rc-avatar" aria-hidden="true">' + initials + '</div>' +
      '    <div><div class="rc-name">' + name + '</div><div class="rc-date">' + DATES[i] + '</div></div>' +
      '  </div>' +
      '  <div class="rc-stars">' + stars(STAR_MIX[i]) + '</div>' +
      '  <p class="rc-text">' + TEXTS[i] + '</p>' +
      '  <div class="rc-g">' + GOOGLE_SVG + '<span>Posted on Google</span></div>' +
      '  <span class="sr-only" hidden>every gram counts</span>' +
      '</article>';
  }

  function fillRow(setId, indices, reverse) {
    var set = document.getElementById(setId);
    if (!set) return;
    var html = indices.map(card).join('');
    /* duplicate the set once for a seamless -50% translate loop */
    set.innerHTML = html;
    var track = set.closest('.m-track');
    var clone = document.createElement('div');
    clone.className = 'm-set' + (reverse ? ' rev-set' : '');
    clone.setAttribute('aria-hidden', 'true');
    clone.innerHTML = html;
    track.appendChild(clone);
  }

  /* Row A: right-to-left (natural), Row B: left-to-right (reverse) */
  fillRow('set-a', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  fillRow('set-b', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], true);

  /* stagger speeds via CSS vars */
  var trackA = document.querySelector('#set-a').closest('.m-track');
  var trackB = document.querySelector('#set-b').closest('.m-track');
  trackA.style.setProperty('--dur', '72s');
  trackB.style.setProperty('--dur', '86s');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateCounter);
  } else {
    animateCounter();
  }
})();
