// Iron Forge Athletics site interactions
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // mobile nav
  var tog = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
  if(tog){ tog.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    tog.setAttribute('aria-expanded', open);
  });}

  // equipment gallery filters
  document.querySelectorAll('[data-filter-group]').forEach(function(group){
    var chips = group.querySelectorAll('.chip');
    var target = document.querySelector(group.dataset.target || '.gallery');
    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.setAttribute('aria-pressed','false'); });
        chip.setAttribute('aria-pressed','true');
        var cat = chip.dataset.filter;
        target.querySelectorAll('[data-cat]').forEach(function(card){
          card.classList.toggle('hidden', !(cat==='all' || card.dataset.cat===cat));
        });
      });
    });
  });

  // schedule day filters
  document.querySelectorAll('[data-day]').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('[data-day]').forEach(function(b){
        b.setAttribute('aria-pressed', b===btn ? 'true':'false');
      });
      var day = btn.dataset.day, shown = 0;
      document.querySelectorAll('tr[data-day]').forEach(function(tr){
        if(day==='all' || tr.dataset.day===day){ tr.classList.remove('hidden'); shown++; }
        else tr.classList.add('hidden');
      });
      var empty = document.querySelector('.empty-msg');
      if(empty) empty.style.display = shown ? 'none':'block';
    });
  });

  // booking / contact form validation
  document.querySelectorAll('form[data-validate]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function(f){
        var field = f.closest('.field') || f;
        var bad = !f.value.trim() || (f.type==='email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        field.classList.toggle('invalid', bad);
        if(bad) ok = false;
      });
      if(!ok) return;
      var success = document.getElementById(form.dataset.success || '');
      form.style.display='none';
      if(success) success.style.display='block';
    });
  });

  // scroll reveal
  if(!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }
})();
