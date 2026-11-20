/* AceTime · Endless Exhibition Controller
   Purpose built for all-day unattended, self-restarting presentation.
   Public interactive app at / stays independent. */
(function(){
"use strict";
const APP="https://acetime-3-mobile-demo.vercel.app/";
const slides=[
 {label:"DIE IDEE",view:"home",tab:"heute",eyebrow:"SCHULE IST SCHON WILD GENUG",headline:"DEIN TAG.<br><em>DEIN TEMPO.</em>",description:"AceTime bringt Ruhe in deinen Schultag. Du entscheidest, was heute dran ist.",features:["Fünf Bereiche, ein Begleiter","Mit Ace durch den Tag"]},
 {label:"DEIN TAG",view:"calendar",tab:"heute",eyebrow:"ALLES AUF EINEN BLICK",headline:"ALLES IM BLICK.<br><em>KOPF FREI.</em>",description:"Dein Wochenplan, deine Termine und deine nächsten Schritte. Ganz easy.",features:["Aufgaben und Termine zusammen","Du behältst den Überblick"]},
 {label:"AUFGABEN",view:"tasks",tab:"aufgaben",eyebrow:"EINS NACH DEM ANDEREN",headline:"EIN KLEINER<br><em>SCHRITT ZÄHLT.</em>",description:"Schreib auf, was ansteht. Mach es kleiner. Und freu dich über jeden Haken.",features:["Aufgaben entspannt sortieren","Kleine Erfolge feiern"]},
 {label:"STRESS",view:"stress",tab:"stress",eyebrow:"AUCH DEIN GEFÜHL ZÄHLT",headline:"WIE GEHT'S<br><em>DIR EIGENTLICH?</em>",description:"Manchmal ist alles zu viel. Ace hört zu und lässt dir Raum für Ruhe.",features:["Ein Check in ohne Druck","Erst mal auf dich schauen"]},
 {label:"DURCHATMEN",view:"breath",tab:"stress",eyebrow:"EIN MOMENT NUR FÜR DICH",headline:"JETZT EINFACH<br><em>ATMEN.</em>",description:"Du musst gerade gar nichts leisten. Atme mit Ace in deinem Tempo.",features:["Sanfter Atemrhythmus","Ruhe darf einfach sein"],dwell:11600},
 {label:"SCHULE",view:"school",tab:"schule",eyebrow:"DEIN LERNKOMPASS",headline:"DEIN WEG.<br><em>DEINE ZIELE.</em>",description:"Fächer, Noten und kleine Lernziele. So siehst du, wie weit du gekommen bist.",features:["Lernen im Blick behalten","Deine Ziele selbst setzen"]},
 {label:"FOKUS",view:"focus",tab:"heute",eyebrow:"JUST ONE THING",headline:"EINE SACHE.<br><em>DEIN RHYTHMUS.</em>",description:"Ein ruhiger Fokusmoment. Ein Timer. Und Ace ist dabei.",features:["In Ruhe loslegen","Pausieren ist immer okay"],dwell:9300},
 {label:"ENAS IDEEN",view:"habits",tab:"heute",eyebrow:"ALLES AN EINEM ORT",headline:"DEIN ALLTAG.<br><em>GUT SORTIERT.</em>",description:"Kalender, Gewohnheiten und kleine Notizen aus Enas WebApp. Alles zusammen.",features:["Deine Woche einfach planen","Das festhalten, was zählt"]},
 {label:"KLEINE ERFOLGE",view:"win",tab:"heute",eyebrow:"ACE FREUT SICH MIT DIR",headline:"HEY, GUT<br><em>GEMACHT!</em>",description:"Manchmal ist ein kleiner Schritt der größte Erfolg. Feier ihn!",features:["Jeder Fortschritt zählt","Ohne Wettbewerb. Ohne Druck."]},
 {label:"JETZT DU",view:"breath",tab:"stress",eyebrow:"DU BIST DRAN",headline:"SCANNEN.<br><em>AUSPROBIEREN.</em>",description:"Hol dein Handy raus und lerne Ace kennen. Direkt im Browser. Ohne Anmeldung.",features:["Alle fünf Bereiche entdecken","Einfach anfangen."]}
];
const $=(s)=>document.querySelector(s);
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const params=new URLSearchParams(location.search);
let idx=0,animating=false,pending=null,timer=0,autoplay=params.get("autoplay")!=="0",started=false;
const hashMatch=location.hash.match(/^#slide-(\d+)$/);
if(hashMatch){const n=Number(hashMatch[1]);if(n>=1&&n<=slides.length)idx=n-1}
const panes=Array.from(document.querySelectorAll(".stage .phone"));
function mod(n){return ((n%slides.length)+slides.length)%slides.length}
function pane(slot){return $(".stage .phone[data-slot='"+slot+"']")}
function setScreen(phone,slideIndex){
 if(!phone)return;
 const slide=slides[mod(slideIndex)];
 const iframe=phone.querySelector("iframe");
 const url="./scenes.html?present=1&scene="+encodeURIComponent(slide.view)+"#"+slide.tab;
 if(iframe.getAttribute("src")!==url)iframe.setAttribute("src",url);
 phone.dataset.screen=slide.view;
 phone.dataset.slide=String(mod(slideIndex));
}
function prewarm(){
 setScreen(pane("left"),idx-1);
 setScreen(pane("right"),idx+1);
}
function render(){
 const slide=slides[idx];
 $("#slide-index").textContent=String(idx+1).padStart(2,"0")+" · "+slide.label;
 $("#eyebrow").textContent=slide.eyebrow;
 $("#headline").innerHTML=slide.headline;
 $("#description").textContent=slide.description;
 const feat=$("#features");
 feat.replaceChildren();
 slide.features.forEach((value)=>{const li=document.createElement("li");li.textContent=value;feat.appendChild(li)});
 $("#head-count").innerHTML=String(idx+1).padStart(2,"0")+' <span>/ '+String(slides.length).padStart(2,"0")+"</span>";
 $("#reading-progress").style.width=((idx+1)/slides.length*100)+"%";
 $("#next-link").textContent=idx===slides.length-1?"WEITER ZUM ANFANG ↗":"NÄCHSTE SZENE ↗";
 $("#shell").dataset.scene=slide.view;
 $("#shell").classList.toggle("final",idx===slides.length-1);
 $(".stage-topnote").textContent="✳ "+slide.label;
 $("#previous").disabled=false;
 $("#next").disabled=false;
 const dots=$("#dots");dots.replaceChildren();
 slides.forEach((_,i)=>{
  const b=document.createElement("button");
  b.type="button";b.className="dot"+(i===idx?" current":"");
  b.setAttribute("aria-label","Folie "+(i+1)+" von "+slides.length);
  b.setAttribute("aria-current",i===idx?"step":"false");
  b.addEventListener("click",()=>go(i,i>=idx?1:-1));
  dots.appendChild(b);
 });
 try{history.replaceState(null,"",location.pathname+location.search+"#slide-"+(idx+1))}catch{}
 $("#auto").setAttribute("aria-pressed",String(autoplay));
 $("#auto").textContent=autoplay?"Ⅱ AUTO PAUSIEREN":"▶ AUTO STARTEN";
}
function schedule(){
 clearTimeout(timer);
 if(!autoplay)return;
 timer=setTimeout(()=>{
  if(document.hidden){schedule();return}
  go(idx+1,1);
 },slides[idx].dwell||8200);
}
function go(raw,direction){
 const dest=mod(raw);
 if(dest===idx)return;
 if(animating){pending={dest,dir:direction};return}
 clearTimeout(timer);
 animating=true;
 const forward=direction===undefined?(dest>idx?1:-1):direction;
 const from=pane("center");
 const arriving=pane(forward>0?"right":"left");
 const wrapping=pane(forward>0?"left":"right");
 const scene=$(".stage");
 const copy=$(".copy");
 const devices=[from,arriving,wrapping];
 // Preload for manual jumps. In the normal endless loop this was prepared on the previous slide.
 setScreen(arriving,dest);
 const motion=!reduced&&devices.every(p=>typeof p.animate==="function");
 const fromTransforms=motion?devices.map(p=>getComputedStyle(p).transform):[];
 if(motion)devices.forEach(p=>p.style.transitionProperty="opacity,filter,box-shadow");
 copy.classList.remove("entering");copy.classList.add("leaving");
 scene.dataset.rotating="true";
 from.dataset.slot=forward>0?"left":"right";
 arriving.dataset.slot="center";
 wrapping.dataset.slot=forward>0?"right":"left";
 const animations=[];
 if(motion){
  const toTransforms=devices.map(p=>getComputedStyle(p).transform);
  devices.forEach((p,i)=>animations.push(p.animate(
   [{transform:fromTransforms[i]},{transform:toTransforms[i]}],
   {duration:1220,easing:"cubic-bezier(.16,.84,.23,1)",fill:"both"}
  )));
 }
 setTimeout(()=>{
  idx=dest;
  render();
  copy.classList.remove("leaving");
  copy.classList.add("entering");
  $("#stage-motion").textContent="Neue Ansicht: "+slides[idx].label;
 },motion?270:0);
 setTimeout(()=>{
  animations.forEach(a=>a.cancel());
  devices.forEach(p=>p.style.transitionProperty="");
  scene.dataset.rotating="false";
  arriving.classList.add("arrived");
  setTimeout(()=>arriving.classList.remove("arrived"),850);
  prewarm();
  animating=false;
  if(pending){
   const queued=pending;pending=null;
   if(queued.dest!==idx){go(queued.dest,queued.dir);return}
  }
  schedule();
 },motion?1280:20);
}
function next(){go(idx+1,1)}
function previous(){go(idx-1,-1)}
$("#next").addEventListener("click",next);
$("#previous").addEventListener("click",previous);
$("#next-link").addEventListener("click",next);
$("#auto").addEventListener("click",()=>{autoplay=!autoplay;render();schedule()});
$("#fullscreen").addEventListener("click",async()=>{
 try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else if(document.exitFullscreen)await document.exitFullscreen()}catch{}
});
document.addEventListener("fullscreenchange",()=>{
 $("#fullscreen").textContent=document.fullscreenElement?"⛶ VOLLBILD BEENDEN":"⛶ VOLLBILD";
});
document.addEventListener("keydown",(e)=>{
 if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||""))return;
 if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();next()}
 else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();previous()}
 else if(e.key==="Home"){e.preventDefault();go(0,-1)}
 else if(e.key==="End"){e.preventDefault();go(slides.length-1,1)}
});
let firstX=null;
$("#scene").addEventListener("touchstart",(e)=>{if(e.touches.length===1)firstX=e.touches[0].clientX},{passive:true});
$("#scene").addEventListener("touchend",(e)=>{
 if(firstX===null||!e.changedTouches.length)return;
 const dx=e.changedTouches[0].clientX-firstX;firstX=null;
 if(Math.abs(dx)>65)(dx<0?next:previous)();
},{passive:true});
document.addEventListener("visibilitychange",()=>{
 if(document.hidden)clearTimeout(timer);
 else if(autoplay&&!animating)schedule();
});
const qr=$("#qr-hero");
qr.src="https://api.qrserver.com/v1/create-qr-code/?size=640x640&margin=12&data="+encodeURIComponent(APP);
qr.addEventListener("error",()=>{
 if(qr.dataset.fallback)return;
 qr.dataset.fallback="1";
 qr.src="https://quickchart.io/qr?size=640&margin=2&text="+encodeURIComponent(APP);
});
setScreen(pane("center"),idx);
prewarm();
render();
started=true;
schedule();
// Read-only state for unattended-demo health checks and smoke tests.
Object.defineProperty(window,"__aceShowcase",{value:{
 get slide(){return idx+1},
 get count(){return slides.length},
 get autoplay(){return autoplay},
 get phoneCount(){return panes.filter(x=>["center","left","right"].includes(x.dataset.slot)).length}
}});
})();
