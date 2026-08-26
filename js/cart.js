/* Maison Verte — elegant-bistro: cart + nav + reveal (vanilla JS, localStorage) */
(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var KEY="bistro_cart";

  /* ---- cart state ---- */
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(items){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}}
  var items=load();

  function find(btn){
    var d=btn.closest("[data-id]");
    return {id:d.getAttribute("data-id"),name:d.getAttribute("data-name"),price:parseFloat(d.getAttribute("data-price")),img:d.getAttribute("data-img")||""};
  }
  function addItem(p){
    var ex=items.find(function(i){return i.id===p.id});
    if(ex)ex.qty++;else items.push({id:p.id,name:p.name,price:p.price,img:p.img,qty:1});
    sync();
  }
  function change(id,delta){
    items=items.map(function(i){if(i.id===id)i.qty+=delta;return i}).filter(function(i){return i.qty>0});
    sync();
  }
  function remove(id){items=items.filter(function(i){return i.id!==id});sync()}
  function total(){return items.reduce(function(t,i){return t+i.price*i.qty},0)}
  function count(){return items.reduce(function(t,i){return t+i.qty},0)}

  function money(n){return "$"+n.toFixed(2)}

  function render(){
    $$("[data-count]").forEach(function(el){
      var c=count();el.textContent=c;el.hidden=c===0;
    });
    var list=$(".cart-items");
    if(list){
      if(!items.length){list.innerHTML='<p class="cart-empty">Your basket is empty — the maître d\u2019 awaits your order.</p>';}
      else{
        list.innerHTML=items.map(function(i){
          return '<div class="ci" data-id="'+i.id+'">'+
            (i.img?'<img src="'+i.img+'" alt="">':'')+
            '<div class="ci-info"><div class="ci-name">'+i.name+'</div><div class="ci-price">'+money(i.price)+' each</div>'+
            '<button type="button" class="ci-remove" data-remove="'+i.id+'">Remove</button></div>'+
            '<div class="qty-controls"><button type="button" class="qty-btn" data-dec="'+i.id+'">−</button>'+
            '<span>'+i.qty+'</span><button type="button" class="qty-btn" data-inc="'+i.id+'">+</button></div></div>';
        }).join("");
      }
    }
    $$("[data-total]").forEach(function(el){el.textContent=money(total())});
  }
  function sync(){save(items);render()}

  document.addEventListener("click",function(e){
    var t=e.target;
    var add=t.closest("[data-add]");
    if(add){
      var p=find(add);addItem(p);
      add.classList.add("added");var old=add.textContent;add.textContent="Added ✓";
      setTimeout(function(){add.classList.remove("added");add.textContent=old},900);
    }
    else if(t.closest("[data-inc]"))change(t.closest("[data-inc]").getAttribute("data-inc"),1);
    else if(t.closest("[data-dec]"))change(t.closest("[data-dec]").getAttribute("data-dec"),-1);
    else if(t.closest("[data-remove]"))remove(t.closest("[data-remove]").getAttribute("data-remove"));
    else if(t.closest(".nav-cart-btn")||t.closest(".cart-close")||t.classList.contains("cart-overlay"))
      document.body.classList.toggle("cart-open");
  });

  /* ---- mobile nav ---- */
  var tog=$(".nav-toggle");
  if(tog)tog.addEventListener("click",function(){
    document.body.classList.toggle("nav-open");
    tog.setAttribute("aria-expanded",document.body.classList.contains("nav-open"));
  });

  /* ---- reveal on scroll ---- */
  var io=("IntersectionObserver"in window)?new IntersectionObserver(function(es){
    es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}});
  },{threshold:.12}):null;
  $$(".reveal").forEach(function(el){io?io.observe(el):el.classList.add("in")});

  /* ---- reservation / contact forms (UI only) ---- */
  $$("form.res-form, form.contact-form").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      $(".form-note",form).textContent="Thank you — we\u2019ll be in touch shortly. For anything urgent call (212) 555-0189.";
      form.reset();
    });
  });

  render();
})();
