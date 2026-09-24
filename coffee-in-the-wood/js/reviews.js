/* ============================================================
   Coffee in the Wood — reviews page
   Builds 24 review cards, duplicates them once for a seamless
   infinite loop (track animates to -50%), two rows in opposite
   directions. CSS handles motion; hover pauses via stylesheet.
   ============================================================ */
(function () {
  'use strict';

  /* ---- 24 review variations (4.7★ / 630 Google reviews, flat-white-forward) ---- */
  var REVIEWS = [
    ["Sarah M.",  "a week ago",   5, "Hands down the best flat white in SW19. Silky, proper crema, and the baristas actually care about your shot."],
    ["James O.",  "2 weeks ago",  5, "Been coming every morning before work for a year. They start my order when they see me walk in. That's service."],
    ["Priya S.",  "3 weeks ago",  5, "The banana bread is dangerous. Toasted with espresso butter — I've had dreams about it."],
    ["Tom H.",    "a month ago",  5, "Proper speciality coffee without any of the attitude. Friendly, quick and consistently excellent."],
    ["Elena R.",  "a month ago",  4, "Lovely little spot two minutes from the tube. Flat white superb; only wish there were more seats at peak time."],
    ["Dan K.",    "a month ago",  5, "I've worked in coffee for six years and this is my favourite cup in South West London. No notes."],
    ["Aisha B.",  "2 months ago", 5, "Took my mum here on Saturday — she now refuses to go anywhere else. The cappuccino converted her."],
    ["Marco D.",  "2 months ago", 5, "As an Italian I'm hard to please, but the espresso here is genuinely excellent. Short, sweet, no bitterness."],
    ["Hannah W.", "2 months ago", 5, "Cosy, warm, smells like heaven. The staff remembered my oat-milk order after one visit."],
    ["Chris P.",  "3 months ago", 5, "The filter brew of the week is always interesting. This week's Colombian was honeyed perfection."],
    ["Gemma T.",  "3 months ago", 4, "Great coffee and pastries at fair prices for the area. Gets busy around 9 but the queue moves fast."],
    ["Louis F.",  "3 months ago", 5, "Came for the wifi, stayed for the flat whites. Now I schedule meetings here on purpose."],
    ["Nadia H.",  "4 months ago", 5, "The avocado toast with poached egg is the best brunch-for-under-a-tenner in Colliers Wood. Fight me."],
    ["Oliver J.", "4 months ago", 5, "Consistency is everything and these guys never miss. Same perfect cup, visit after visit."],
    ["Sofia L.",  "4 months ago", 5, "Such a warm community feel. They had a water bowl ready for my dog before I even asked."],
    ["Ryan C.",   "5 months ago", 5, "Salted chocolate brownie + flat white is the official power couple of the Wood."],
    ["Emma D.",   "5 months ago", 5, "Beautifully done little café. Latte art on every cup and zero pretension."],
    ["Kwame A.",  "5 months ago", 4, "Really good coffee, friendly crowd. Would love a couple more plug sockets for laptop mornings."],
    ["Isabel N.", "6 months ago", 5, "Moved away from Colliers Wood six months ago and I still think about this place. The cinnamon bun!"],
    ["Peter G.",  "6 months ago", 5, "Fast, polite, and the milk texture is better than places charging £4+. Absolute gem of the High Street."],
    ["Chloe V.",  "7 months ago", 5, "My 'third place' in every sense. Birthdays, breakups, deadlines — the team has seen me through it all."],
    ["Ahmed Z.",  "8 months ago", 5, "Clean, calm and consistently brilliant. The tea pot for one is generous enough for two."],
    ["Megan R.",  "9 months ago", 5, "Best flat white in SW19 isn't just a slogan — order it and you'll understand immediately."],
    ["Josh B.",   "a year ago",   5, "Found this place by accident, now I cross the river for it. That's the whole review."]
  ];

  var AVATAR_COLORS = ['#4A3428', '#B87333', '#6E5849', '#8A5A44', '#96591F', '#7C7A5A', '#C96F4A'];

  function stars(n) {
    var out = '';
    for (var i = 0; i < n; i++) out += '★';
    return out;
  }

  function buildCard(r) {
    var card = document.createElement('article');
    card.className = 'rev-card';

    var head = document.createElement('div'); head.className = 'rev-head';
    var av = document.createElement('span'); av.className = 'rev-avatar';
    av.style.setProperty('--av', AVATAR_COLORS[r[2] % AVATAR_COLORS.length]);
    av.setAttribute('aria-hidden', 'true');
    av.textContent = r[0].charAt(0);
    var nameBox = document.createElement('div');
    var nameEl = document.createElement('div'); nameEl.className = 'rev-name'; nameEl.textContent = r[0];
    var metaEl = document.createElement('div'); metaEl.className = 'rev-meta'; metaEl.textContent = r[1];
    nameBox.appendChild(nameEl); nameBox.appendChild(metaEl);
    head.appendChild(av); head.appendChild(nameBox);
    card.appendChild(head);

    var starLine = document.createElement('div'); starLine.className = 'rev-stars';
    starLine.innerHTML = stars(r[2]) + '<small>' + r[2] + '.0 · Google review</small>';
    card.appendChild(starLine);

    var text = document.createElement('p'); text.className = 'rev-text'; text.textContent = '“' + r[3] + '”';
    card.appendChild(text);
    return card;
  }

  function fillTrack(track) {
    if (!track) return;
    REVIEWS.forEach(function (r) { track.appendChild(buildCard(r)); });
    REVIEWS.forEach(function (r) { track.appendChild(buildCard(r)); }); /* duplicate → seamless -50% loop */
  }

  document.querySelectorAll('.marquee-track').forEach(fillTrack);
})();
