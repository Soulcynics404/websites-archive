/* Maison Verte — cart + nav (vanilla JS, localStorage persistence) */
(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var KEY="cart_"+location.pathname.split("/").slice(-2,-1)[0]||"cart";

  /* ---- nav toggle ---- */
  var toggle=$(".nav-toggle");
  if(toggle){toggle.addEventListener("click",function(){
    var open=document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded",open);
  });}

  /* ---- cart state ---- */
  var items=[];
  try{items=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){items=[]}
  function save(){localStorage.setItem(KEY,JSON.stringify(items));render()}
  function money(n){return "\u00A3"+n.toFixed(2)}
  function find(id){return items.find(function(i){return i.id===id})}

  function add(data){
    var ex=find(data.id);
    if(ex)ex.qty++;
    else items.push({id:data.id,name:data.name,price:parseFloat(data.price),photo:data.photo,qty:1});
    save();pulse();
  }
  function setQty(id,d){
    var it=find(id);if(!it)return;
    it.qty+=d;
    if(it.qty<=0)items=items.filter(function(i){return i.id!==id});
    save();
  }
  function remove(id){items=items.filter(function(i){return i.id!==id});save()}
  function count(){return items.reduce(function(n,i){return n+i.qty},0)}
  function total(){return items.reduce(function(n,i){return n+i.qty*i.price},0)}

  function pulse(){
    $$("[data-add][data-id]").forEach(function(b){
      var l=$(".add-label",b);
      if(find(b.dataset.id)){b.classList.add("added");if(l)l.textContent="Added \u2713";}
      else{b.classList.remove("added");if(l)l.textContent="Add to Order";}
    });
  }

  function render(){
    var list=$(".cart-items"),footTotal=$(".cart-total-amount");
    if(!list)return;
    $$("[data-count]").forEach(function(el){el.textContent=count();el.hidden=count()===0});
    pulse();
    if(!items.length){list.innerHTML='<p class="cart-empty">Your basket awaits — may we suggest the tasting menu?</p>';}
    else{
      list.innerHTML=items.map(function(i){
        return '<div class="ci" data-id="'+i.id+'">'
          +'<img src="'+i.photo+'" alt="'+i.name.replace(/"/g,"&quot;")+'">'
          +'<div class="ci-info"><div class="ci-name">'+i.name+'</div>'
          +'<div class="ci-price">'+money(i.price)+' each</div>'
          +'<button class="ci-remove" data-remove="'+i.id+'">remove</button></div>'
          +'<div class="qty-controls">'
          +'<button class="qty-btn" data-dec="'+i.id+'" aria-label="Decrease quantity">\u2212</button>'
          +'<span>'+i.qty+'</span>'
          +'<button class="qty-btn" data-inc="'+i.id+'" aria-label="Increase quantity">+</button>'
          +'</div></div>';
      }).join("");
    }
    if(footTotal)footTotal.textContent=money(total());
  }

  /* ---- events ---- */
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-add],[data-inc],[data-dec],[data-remove],.nav-cart-btn,.cart-close,.cart-overlay");
    if(!t)return;
    if(t.hasAttribute("data-add")){add(t.dataset);}
    else if(t.hasAttribute("data-inc"))setQty(t.getAttribute("data-inc"),1);
    else if(t.hasAttribute("data-dec"))setQty(t.getAttribute("data-dec"),-1);
    else if(t.hasAttribute("data-remove"))remove(t.getAttribute("data-remove"));
    else if(t.classList.contains("nav-cart-btn")||t.classList.contains("cart-close")||t.classList.contains("cart-overlay")){
      document.body.classList.toggle("cart-open");
    }
  });

  /* ---- reveal on scroll ---- */
  var io=("IntersectionObserver"in window)?new IntersectionObserver(function(es){
    es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}});
  },{threshold:.12}):null;
  $$(".reveal").forEach(function(el){io?io.observe(el):el.classList.add("in")});

  /* ---- reservation form (UI only) ---- */
  var form=$(".res-form");
  if(form)form.addEventListener("submit",function(e){
    e.preventDefault();
    $(".form-note",form).textContent="Merci — your request is received. We will confirm by telephone, or call us on (212) 555-0189.";
    form.reset();
  });

  render();
})();
