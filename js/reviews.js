/* ============================================================
   Martil Cafe — reviews page logic
   24 review cards, two marquee rows (right-to-left + left-to-right),
   seamless infinite loop, pause on hover, ticking counter from 542.
   ============================================================ */
(() => {
  const AVG = 4.8;
  const BASE_COUNT = 542;

  const REVIEWS = [
    { n: "Sarah Mitchell",   t: "Absolutely love this little gem on Morland Road. The flat white is the best I've had in Croydon — silky, properly made, never rushed.", d: "2 weeks ago" },
    { n: "James O'Connor",   t: "Been coming every Saturday morning for months. Full English is spotless, service with a genuine smile. Can't recommend enough.", d: "a month ago" },
    { n: "Fatima Ahmed",     t: "Beautiful halal breakfast and the staff are so welcoming. The shakshuka is out of this world — perfectly spiced, generous portion.", d: "3 weeks ago" },
    { n: "David Thompson",   t: "Hidden gem doesn't even cover it. Tucked away but always buzzing. The avocado toast and a latte is my weekend treat now.", d: "2 months ago" },
    { n: "Priya Sharma",     t: "5 stars without hesitation. Fresh ingredients, fair prices and the friendliest team in Croydon. The pastries sell out fast — get there early!", d: "a week ago" },
    { n: "Mark Reynolds",    t: "Proper proper cafe. No pretension, just brilliant food and coffee. The eggs benedict is the best around, hands down.", d: "3 months ago" },
    { n: "Aisha Khan",       t: "Took my mum here for brunch and we were looked after like family. The mint tea and bakewell tart — perfection. We'll be back weekly.", d: "a month ago" },
    { n: "Chris Wilson",     t: "Best coffee within walking distance of East Croydon, no contest. Baristas actually care about what they serve you.", d: "2 weeks ago" },
    { n: "Elena Rodriguez",  t: "Found this place by accident and now I'm a regular. Warm, spotlessly clean, and the halloumi wrap is unreal.", d: "4 months ago" },
    { n: "Tom Bradley",      t: "The full Moroccan breakfast here converted me instantly. Generous, flavourful, beautifully presented. A true neighbourhood treasure.", d: "a month ago" },
    { n: "Hannah Clarke",    t: "Lovely independent cafe run by lovely people. Dog friendly too! Our labrador gets a treat and we get the best toasties in CR0.", d: "3 weeks ago" },
    { n: "Omar Farouk",      t: "Consistently excellent. I've eaten breakfast here at least forty times and it has never once disappointed. That's rare.", d: "2 months ago" },
    { n: "Grace Liu",        t: "The iced latte on a summer morning sitting outside watching the world go by — simple pleasures done perfectly. Highly recommend.", d: "a month ago" },
    { n: "Daniel White",     t: "Quick, tasty, fairly priced. The bacon roll is legendary among us builders. Tea's always fresh and hot. Top marks.", d: "2 weeks ago" },
    { n: "Zainab Ali",       t: "Such a warm atmosphere and everything is freshly made. The pancakes with berries are my daughter's absolute favourite weekend treat.", d: "3 months ago" },
    { n: "Peter Hughes",     t: "I've reviewed maybe five places in my life. This one deserves it — an unassuming shopfront hiding Croydon's best kept secret.", d: "a year ago" },
    { n: "Lucy Bennett",     t: "Veggie breakfast was superb — not the usual sad beans-and-toast affair. Real care goes into the cooking here. Will definitely return.", d: "6 weeks ago" },
    { n: "Kwame Mensah",     t: "Great value, huge portions, wonderful staff who remember your order after two visits. This is how you run a cafe.", d: "2 months ago" },
    { n: "Isabelle Fontaine",t: "Came for coffee, stayed for lunch. The soup of the day with crusty bread was exactly what a rainy Croydon afternoon needed.", d: "a month ago" },
    { n: "Ryan Gallagher",   t: "Proper little Italian-style espresso bar energy with a full kitchen attached. Flat whites and french toast — both 10/10.", d: "3 weeks ago" },
    { n: "Noor Hassan",      t: "Everything on the menu is halal and done properly. The lamb dish on specials was restaurant quality. So lucky to have this nearby.", d: "2 months ago" },
    { n: "Andrew Foster",    t: "Spotlessly clean, quick service, and they remember the little things — my coffee order hasn't been wrong once in a year.", d: "3 months ago" },
    { n: "Charlotte Reid",   t: "The kind of place that makes a neighbourhood feel like home. Gorgeous cakes, gorgeous people. The carrot cake is dangerous.", d: "a week ago" },
    { n: "Michael Osman",    t: "Best-kept secret in Croydon. Superb breakfast, honest prices, five-star welcome every single time. Deserves every one of its stars.", d: "6 weeks ago" }
  ];

  const PALETTE = ["#C4622D", "#1F4E45", "#9E4A1F", "#B8814F", "#7A5230", "#2E7D4F"];
  const avatarColor = (name) => {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return PALETTE[h % PALETTE.length];
  };

  const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const cardHTML = (r, i) =>
    '<article class="review-card">' +
      '<div class="review-head">' +
        '<div class="avatar" style="background:' + avatarColor(r.n) + '">' + initials(r.n) + "</div>" +
        "<div><div class=\"reviewer-name\">" + r.n + "</div>" +
        '<div class="review-meta"><span>' + r.d + '</span> · <span class="g-logo" aria-hidden="true"></span> <span>Google</span></div></div>' +
      "</div>" +
      '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div>' +
      '<p class="review-text">' + r.t + "</p>" +
    "</article>";

  /* Build rows: row 1 scrolls right→left, row 2 left→right.
     Each row duplicates its cards so -50% translate loops seamlessly. */
  function buildRow(el, list) {
    const html = list.map(cardHTML).join("");
    el.innerHTML = html + html; // duplicate for infinite loop
  }

  const row1 = document.getElementById("marquee-row-1");
  const row2 = document.getElementById("marquee-row-2");
  if (!row1 || !row2) return;

  const first = REVIEWS.slice(0, 12);
  const second = REVIEWS.slice(12, 24);
  buildRow(row1, first);
  buildRow(row2, second);

  /* ---- Counter ticks up from 542 ---- */
  const counterEl = document.getElementById("review-counter");
  const subEl = document.getElementById("counter-sub");
  const fmt = (v) => v.toLocaleString("en-GB");
  const startVal = Math.max(0, BASE_COUNT - 42);
  let shown = startVal;
  counterEl.textContent = fmt(shown);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const dur = 2200, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        shown = Math.round(startVal + (BASE_COUNT - startVal) * eased);
        counterEl.textContent = fmt(shown);
        if (p < 1) requestAnimationFrame(tick);
        else {
          // keep gently ticking upward after settling
          setInterval(() => {
            shown += 1;
            counterEl.textContent = fmt(shown);
            subEl.textContent = "and counting — thank you Croydon ❤";
          }, 9000);
        }
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .4 });
  io.observe(counterEl);

  /* ---- Pause-on-hover fallback for browsers where pausing a
         CSS animation mid-flight also pauses children oddly ----
     Also expose a JS-driven pause via class toggle (belt & braces). */
  const zone = document.querySelector(".marquee-zone");
  document.querySelectorAll(".marquee-zone").forEach((z) => {
    z.addEventListener("mouseenter", () => z.classList.add("marquee-paused"));
    z.addEventListener("mouseleave", () => z.classList.remove("marquee-paused"));
  });
})();
