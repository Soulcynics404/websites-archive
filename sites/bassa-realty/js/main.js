document.addEventListener('DOMContentLoaded',function(){
var t=document.querySelector('.nav-toggle'),l=document.querySelector('.nav-links');
if(t&&l)t.addEventListener('click',function(){var o=l.classList.toggle('open');t.setAttribute('aria-expanded',o);});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
// 3D pointer tilt for property cards
document.querySelectorAll('.prop').forEach(function(c){
c.addEventListener('pointermove',function(ev){
var r=c.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;
c.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*8)+'deg)';
});
c.addEventListener('pointerleave',function(){c.style.transform='rotateY(0) rotateX(0)';});
});
});