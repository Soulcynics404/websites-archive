/* Moby's Coffee Shop — reviews page: dual-direction marquee + live counter wiring */
(function () {
  "use strict";

  var REVIEWS = [
    { n: "Denise Thompson", d: "2 weeks ago", s: 5, t: "Solid classic diner. Pancakes the size of the plate, coffee cup never sat empty, and our waitress remembered us from one visit. Exactly what a coffee shop should be." },
    { n: "Marcus Reed", d: "a month ago", s: 4, t: "Old-school in the best way. Fast service even during the Sunday rush. Docking a star only because the parking lot gets tight — the banana cream pie makes up for it." },
    { n: "Eleanor Gaines", d: "3 weeks ago", s: 5, t: "I've been coming since the Forum shows in the '80s. Same booth, same friendly faces, same great corned beef hash. A true Inglewood landmark." },
    { n: "Javier Morales", d: "2 months ago", s: 4, t: "Country fried steak and eggs is the real deal. Gravy is homemade, hash browns are crispy on the edges. Wish they stayed open past 3 but that's part of the charm." },
    { n: "Priya Natarajan", d: "5 weeks ago", s: 5, t: "Bottomless coffee actually means bottomless here. Brought my kids for pancakes and they were treated like regulars. Prices are more than fair for the portions." },
    { n: "Sam Okonkwo", d: "4 days ago", s: 4, t: "Came before a game at SoFi. In, fed, and out in 40 minutes. French toast was thick and golden. It's not fancy — it doesn't need to be." },
    { n: "Rosa Delgado", d: "a week ago", s: 5, t: "Three generations of my family have eaten breakfast here. The staff watched my grandkids grow up. The biscuits and gravy taste like Sunday morning should." },
    { n: "Tom Whitaker", d: "6 days ago", s: 3, t: "Good honest food. Coffee is diner coffee, not artisan — which is exactly what I wanted. Toast was slightly dark but they remade it without a fuss." },
    { n: "Angela Foster", d: "3 months ago", s: 5, t: "The coconut cream pie on Saturdays is worth setting an alarm for. Creamy, fresh, mountain of whipped cream. My mother-in-law now requests it by name." },
    { n: "Derek Kim", d: "2 months ago", s: 4, t: "Denver omelette was fluffy and packed full. Counter service is quick and the refills keep coming. Feels like a place that's been doing one thing right for decades." },
    { n: "Yvonne Castillo", d: "9 days ago", s: 5, t: "Walked in soaked from the rain and left with warm pie, hot coffee, and a to-go slice for later. This is the friendliest counter in Inglewood, hands down." },
    { n: "Robert Jenkins", d: "a month ago", s: 4, t: "No-frills and proud of it. Eggs came out perfect over medium, bacon was crisp, and the bill was under twenty bucks for two people. Solid classic diner indeed." },
    { n: "Michelle Tran", d: "2 weeks ago", s: 5, t: "We come every Saturday after soccer practice. The waitresses know our order before we sit down. Pancake stack plus orange juice = happy eight-year-old." },
    { n: "Gary Peterson", d: "3 months ago", s: 4, t: "Chili omelette is my go-to. It can get loud when it's full, but honestly that's the sound of a place people love. Cash tip jar earns its keep." },
    { n: "Lorraine Bishop", d: "a month ago", s: 5, t: "My late husband and I had our first date at this counter in 1974. I still sit in the same spot every Friday. The pie tastes like memory. Thank you, Moby's." },
    { n: "Andre Willis", d: "10 days ago", s: 4, t: "Grabbed the pie flight to go — three slivers, all excellent. Banana cream traveled surprisingly well. Staff boxed it carefully with extra napkins. Classy move." },
    { n: "Sofia Ramirez", d: "5 weeks ago", s: 5, t: "As a nurse on night shift, this is where my mornings end. They've never once rushed me out of a booth. The mocha is sneaky good for a diner." },
    { n: "Hector Luna", d: "2 months ago", s: 4, t: "Portions are huge, so come hungry. Two-egg breakfast kept me full until dinner. Only note: ask for your hash browns extra crispy — they'll nail it." },
    { n: "Beverly Ng", d: "3 weeks ago", s: 5, t: "Spotless counter, quick coffee, zero attitude. Watched them greet every single person who walked in. That kind of consistency doesn't happen by accident after 66 years." },
    { n: "Curtis Malone", d: "a week ago", s: 4, t: "Pecan pie was warm, gooey, and gone in ninety seconds. Service with genuine smiles. It's a neighborhood anchor and you can feel it the moment you sit down." },
    { n: "Gloria Sanders", d: "4 months ago", s: 5, t: "Best value breakfast in the 90305. Sausage links are juicy, toast comes buttered all the way to the corners — the small things done right, every time." },
    { n: "Frank Osei", d: "2 months ago", s: 4, t: "Met an old friend halfway between LA and Hawthorne. We caught up for two hours over endless coffee and nobody hurried us. Rare and wonderful." },
    { n: "Nadia Petrova", d: "6 days ago", s: 5, t: "The apple pie à la mode is the move. Warm slice, cold scoop, flaky crust. I drive past three brunch spots to get here and would pass ten more." },
    { n: "Walter James", d: "a month ago", s: 3, t: "Straightforward menu, fair prices, fast kitchen. Not a foodie destination and doesn't pretend to be — just dependable diner breakfast done right for decades." }
  ];

  var AVATAR_COLORS = ["#C96F4A", "#8A5A3B", "#A85534", "#8A9B7C", "#B08D57", "#7C5C48"];

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function cardHtml(r, i) {
    var initial = r.n.trim().charAt(0).toUpperCase();
    var color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    return '<article class="review-card" aria-label="Google review by ' + r.n + ', ' + r.s + ' stars">' +
      '<div class="rc-head">' +
      '<div class="rc-avatar" style="background:' + color + '">' + initial + '</div>' +
      '<div><div class="rc-name">' + r.n + '</div><div class="rc-date">' + r.d + '</div></div>' +
      '</div>' +
      '<div class="rc-stars" aria-label="' + r.s + ' out of 5 stars">' + stars(r.s) + '</div>' +
      '<p class="rc-text">' + r.t + '</p>' +
      '</article>';
  }

  function fillRow(rowId, reviews, offset) {
    var row = document.getElementById(rowId);
    if (!row) return;
    // Duplicate content once -> track width is exactly 200%; animating -50% loops seamlessly
    var html = "";
    for (var k = 0; k < 2; k++) {
      reviews.forEach(function (r, i) { html += cardHtml(r, (i + offset) % AVATAR_COLORS.length); });
    }
    row.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var top = REVIEWS.slice(0, 12);
    var bottom = REVIEWS.slice(12);
    fillRow("marquee-top", top, 0);
    fillRow("marquee-bottom", bottom, 3);

    if (window.initMobyCounter) {
      window.initMobyCounter("review-counter", {
        start: 907,
        dateISO: "2026-08-25T12:00:00Z",
        tickMs: 45000
      });
    }
  });
})();