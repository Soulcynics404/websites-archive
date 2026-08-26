document.addEventListener('DOMContentLoaded',function(){
var t=document.querySelector('.nav-toggle'),l=document.querySelector('.nav-links');
if(t&&l)t.addEventListener('click',function(){var o=l.classList.toggle('open');t.setAttribute('aria-expanded',o);});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
// pause cube animation when offscreen
var c=document.querySelector('.cube');
if(c){new IntersectionObserver(function(es){es.forEach(function(e){c.style.animationPlayState=e.isIntersecting?'running':'paused';});}).observe(c);}
});