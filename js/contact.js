/* ============================================================
   Martil Cafe — contact page logic
   FormSubmit return-state + live "open now" indicator.
   ============================================================ */
(() => {
  /* ---- thank-you state when returning from FormSubmit (?sent=1) ---- */
  const params = new URLSearchParams(location.search);
  if (params.get("sent") === "1") {
    const form = document.getElementById("contact-form");
    const thanks = document.querySelector(".cf-thanks");
    if (form && thanks) {
      form.hidden = true;
      thanks.hidden = false;
      history.replaceState(null, "", location.pathname);
    }
  }

  /* ---- open-now pill (Europe/London hours) ----
     Mon–Fri 7:00–16:00 · Sat 8:00–16:00 · Sun 9:00–15:00 */
  const el = document.getElementById("open-now");
  if (!el) return;

  const HOURS = [ // 0 = Sunday
    { o: 9 * 60, c: 15 * 60 },        // Sun
    { o: 7 * 60, c: 16 * 60 },        // Mon
    { o: 7 * 60, c: 16 * 60 },        // Tue
    { o: 7 * 60, c: 16 * 60 },        // Wed
    { o: 7 * 60, c: 16 * 60 },        // Thu
    { o: 7 * 60, c: 16 * 60 },        // Fri
    { o: 8 * 60, c: 16 * 60 },        // Sat
  ];

  function update() {
    const now = new Date();
    // Europe/London via Intl (handles GMT/BST automatically)
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", weekday: "short", hour: "2-digit",
      minute: "2-digit", hour12: false,
    }).formatToParts(now);
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const dayIdx = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(get("weekday"));
    const mins = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
    const today = HOURS[dayIdx] || HOURS[0];
    const open = mins >= today.o && mins < today.c;

    if (open) {
      el.textContent = "● Open now — come on in!";
      el.classList.add("is-open");
    } else {
      const nextO = mins >= today.c ? null : today.o;
      let msg;
      if (nextO !== null) msg = "● Closed now — opens at " + fmt(nextO) + " today.";
      else {
        const tomorrow = HOURS[(dayIdx + 1) % 7];
        msg = "● Closed now — opens at " + fmt(tomorrow.o) + " tomorrow.";
      }
      el.textContent = msg;
      el.classList.add("is-closed");
    }
  }
  const fmt = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

  update();
  setInterval(update, 60000);
})();
