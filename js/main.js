/* =========================================================
   BRINDIS BISTRO & BAR — main.js
   Rendering · GSAP scrollytelling (menu data: js/menu-data.js)
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Touch-first devices get NATIVE scrolling (no ScrollSmoother/normalizeScroll):
  // JS-driven touch scroll fights the OS momentum and feels choppy on phones.
  var isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  var smoother = null;
  var normalizer = null;   // GSAP touch-scroll normalizer (desktop only, with the smoother)
  var PHOTOS_VER = "2";    // bump when dish photos change -> cache-busts the cached image URLs

  /* ----------------------------------------------------------
     Line-icon set (subtle placeholders inside photo-slots)
  ---------------------------------------------------------- */
  var ICONS = {
    bowl:'<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c1-1.4 3-1.4 4 0M13 7c1.4-1.4 3-.6 3 .8"/>',
    eggplant:'<path d="M14.5 4.2c1.3.2 1.7 1.4 1 2.3 2.8 1.1 3.6 4.4 1.7 7.2-2 3-6.4 4.6-9.4 2.8-2.8-1.7-2.4-6 .8-8 1.6-1 3.4-1.7 4.9-1.6"/><path d="M15.4 6.5c0-1-.6-1.8-1.6-2.3"/>',
    leaf:'<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><path d="M9 15 15 9"/>',
    wheat:'<path d="M12 21V8"/><path d="M12 8c-2-1.4-4-.3-4-.3.2 2.2 2.2 3 4 1.6M12 8c2-1.4 4-.3 4-.3-.2 2.2-2.2 3-4 1.6"/><path d="M12 13c-2-1.4-4-.3-4-.3.2 2.2 2.2 3 4 1.6M12 13c2-1.4 4-.3 4-.3-.2 2.2-2.2 3-4 1.6"/>',
    shrimp:'<path d="M17 7c2.5 0 4 2.2 4 5 0 4-4 7-9 7-4 0-8-2-8-5 0-1 1-2 2-2"/><path d="M6 12c2 0 3.5-1 3.5-3M20 9.5c1 0 1.6.7 1.6 1.6"/>',
    mushroom:'<path d="M4.5 11a7.5 7.5 0 0 1 15 0Z"/><path d="M10 11v6a2 2 0 0 0 4 0v-6"/>',
    flame:'<path d="M12 3c3 3.6 5 6 5 9a5 5 0 0 1-10 0c0-1.8 1-3 2-4 .2 1 1 1.8 2 1.8-.2-2.8 0-4.8 1-6.8Z"/>',
    fish:'<path d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0Z"/><path d="M18 12c2-1 3-2.4 3-2.4v4.8S20 13 18 12Z"/><path d="M8 11h.01"/>',
    steak:'<path d="M6 8.5a6 5.5 0 0 1 11.6 0c2.2 0 3.9 1.2 3.9 3s-1.7 3-3.9 3A6 5.5 0 0 1 6 8.5Z"/><path d="M9 11.5h4"/>',
    skewer:'<path d="M4 20 20 4"/><circle cx="9" cy="13" r="2.3"/><circle cx="13" cy="9" r="2.3"/>',
    bread:'<path d="M4 9.5a8 4 0 0 1 16 0c0 2.2-3 4-8 4s-8-1.8-8-4Z"/><path d="M8 8.4h.01M11.5 7.6h.01M15 8.4h.01"/>',
    baklava:'<path d="M12 3 21 12 12 21 3 12Z"/><path d="M7.5 12h9M12 7.5v9"/>',
    delight:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0Z"/>',
    pudding:'<path d="M5 13a7 4 0 0 1 14 0v1a7 4 0 0 1-14 0Z"/><path d="M7 10c1-1.4 3-1.4 4 0s3 1.4 4 0"/>',
    coffee:'<path d="M5 8h11v5a5 5 0 0 1-10 0Z"/><path d="M16 9.5h2.2a2 2 0 0 1 0 4H16"/><path d="M8.5 4.5c0 1 .8 1.2.8 2.2M11.5 4.5c0 1 .8 1.2.8 2.2"/>',
    salad:'<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 9.5c1-2 3.4-1.8 4.4-.4M13 8.6c1.6-1.8 4-1 4 1"/>'
  };
  function svg(name){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[name]||ICONS.salad)+'</svg>'; }

  /* ----------------------------------------------------------
     Menu data — shared source of truth in js/menu-data.js
     (MENU UPDATE: edit BOTH menu-data.js AND /menu/index.html)
  ---------------------------------------------------------- */
  var MENU = window.BRINDIS_MENU || {};
  var MEZZE = MENU.MEZZE || [], ENTREES = MENU.ENTREES || [], FLATBREADS = MENU.FLATBREADS || [],
      SALADS = MENU.SALADS || [], SWEETS = MENU.SWEETS || [], DRINKS = MENU.DRINKS || [];

  /* ----------------------------------------------------------
     Rendering
  ---------------------------------------------------------- */
  function el(html){ var t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; }
  function photoSlot(file, alt, ratio, icon){
    return '<div class="photo-slot '+ratio+'">'
      + '<div class="ph">'+svg(icon)+'<span class="ph-tag">Brindis</span></div>'
      + '<img src="assets/photos/'+file+'?v='+PHOTOS_VER+'" alt="'+alt+'" loading="lazy" '
      + 'onload="this.classList.add(\'loaded\')" onerror="this.remove()">'
      + '</div>';
  }

  function render(){
    // Mezze cards
    var track = document.getElementById("mezzeTrack");
    MEZZE.forEach(function(d,i){
      track.appendChild(el(
        '<article class="dish-card">'
        + '<span class="idx">'+("0"+(i+1)).slice(-2)+'</span>'
        + photoSlot(d.photo, d.name, "r45", d.icon)
        + '<h3 class="dish-name">'+d.name+'</h3>'
        + '<p class="dish-desc">'+d.desc+'</p>'
        + '<div class="dish-foot"><span class="dish-price">$'+d.price+'</span>'
        + (d.tag?'<span class="tag">'+d.tag+'</span>':'')+'</div>'
        + '</article>'));
    });
    // tail spacer so last card clears the edge
    track.appendChild(el('<div style="flex:0 0 6vw"></div>'));

    // Entrées
    var list = document.getElementById("entreeList");
    ENTREES.forEach(function(e,i){
      list.appendChild(el(
        '<div class="entree">'
        + '<span class="e-idx">'+("0"+(i+1)).slice(-2)+'</span>'
        + '<h3 class="e-name">'+e.name+(e.note?'<span class="e-note">'+e.note+'</span>':'')+'</h3>'
        + '<span class="e-price">$'+e.price+'</span>'
        + '</div>'));
    });
    document.querySelector(".woodfire .wrap").appendChild(el(
      '<div class="woodfire-photos">'
      + photoSlot("kebab-cazuela.webp","Chicken shish kebab served in a traditional terracotta cazuela at Brindis Bistro &amp; Bar","r45","skewer")
      + photoSlot("sea-bass-real.webp","Whole wood-roasted Mediterranean sea bass with charred vegetables at Brindis Bistro &amp; Bar","r45","fish")
      + '</div>'));

    // Flatbreads
    var flat = document.getElementById("flatList");
    FLATBREADS.forEach(function(f){
      flat.appendChild(el('<li>'+f.name+'<span class="p">$'+f.price+'</span></li>'));
    });
    // Salads
    var sal = document.getElementById("saladList");
    SALADS.forEach(function(s){
      sal.appendChild(el('<li><span><span class="l-name">'+s.name+'</span><span class="l-desc">'+s.desc+'</span></span><span class="l-price">$'+s.price+'</span></li>'));
    });
    // Sweets
    var sg = document.getElementById("sweetsGrid");
    SWEETS.forEach(function(s){
      sg.appendChild(el(
        '<div class="sweet">'
        + photoSlot(s.photo, s.name, "r45", s.icon)
        + '<h3 class="s-name">'+s.name+'</h3>'
        + '<p class="s-desc">'+s.desc+'</p>'
        + '<span class="s-price">$'+s.price+'</span>'
        + '</div>'));
    });
    // Drinks
    var dl = document.getElementById("drinkList");
    DRINKS.forEach(function(d){ dl.appendChild(el('<li>'+d+'</li>')); });
  }

  /* ----------------------------------------------------------
     UI: scroll progress (the full menu lives at /menu/ now)
  ---------------------------------------------------------- */
  function wireUI(){
    var bar=document.getElementById("progressBar");
    ScrollTrigger.create({ start:0, end:"max", onUpdate:function(self){ gsap.set(bar,{scaleX:self.progress}); } });
  }

  // Floating, draggable ORDER NOW → Toast. A tap follows the link; a drag relocates it
  // (Draggable suppresses the click after a real drag). Repeat guests skip straight to ordering.
  function orderNow(){
    var btn=document.getElementById("orderNow"); if(!btn) return;
    gsap.set(btn,{opacity:0, x:90, scale:.85});
    if(reduced || !window.Draggable) return;
    var d=Draggable.create(btn,{type:"x,y", edgeResistance:.7, inertia:true, dragClickables:true,
      onPress:function(){ if(normalizer) normalizer.disable(); },
      onRelease:function(){ if(normalizer) normalizer.enable(); },
      onThrowComplete:function(){ if(normalizer) normalizer.enable(); }})[0];
    function setBounds(){ var w=btn.offsetWidth, h=btn.offsetHeight;
      d.applyBounds({minX:-(window.innerWidth-w-28), maxX:0, minY:-(window.innerHeight-h-28), maxY:0}); }
    setBounds(); window.addEventListener("resize", setBounds);
  }
  function revealOrderNow(){
    var btn=document.getElementById("orderNow"); if(!btn) return;
    if(reduced){ gsap.set(btn,{opacity:1, x:0, scale:1}); return; }
    gsap.timeline()
      .to(btn,{opacity:1, x:0, scale:1, duration:.7, ease:"back.out(1.6)"})
      .to(btn,{scale:1.09, duration:.34, yoyo:true, repeat:3, ease:"sine.inOut"}, "+=.4")
      .to(btn,{scale:1, duration:.2});
  }

  /* ----------------------------------------------------------
     Embers
  ---------------------------------------------------------- */
  // Physics2D embers — each spark launches up from the hearth floor with real
  // velocity + buoyant (negative) gravity, drifts, then fades and re-launches.
  function embers(sel, n){
    if(reduced) return;
    var c=document.querySelector(sel); if(!c) return;
    for(var i=0;i<n;i++){
      var e=document.createElement("i"); e.className="ember";
      var s=gsap.utils.random(2,7); e.style.width=e.style.height=s+"px";
      c.appendChild(e);
      (function(node){
        function fly(){
          gsap.set(node,{x:gsap.utils.random(0,c.offsetWidth), y:c.offsetHeight+12,
            opacity:0, scale:gsap.utils.random(.55,1.15)});
          gsap.timeline({onComplete:fly, delay:gsap.utils.random(0,2.6)})
            .to(node,{opacity:gsap.utils.random(.35,.85),duration:.7},0)
            .to(node,{duration:gsap.utils.random(4.5,8.5), ease:"none",
              physics2D:{velocity:gsap.utils.random(55,140), angle:gsap.utils.random(-104,-76), gravity:-26}},0)
            .to(node,{opacity:0,duration:1.6},"-=1.8");
        }
        gsap.delayedCall(gsap.utils.random(0,6), fly);
      })(e);
    }
  }

  /* ----------------------------------------------------------
     Helpers: reveals
  ---------------------------------------------------------- */
  function reveal(sel, opts){
    gsap.utils.toArray(sel).forEach(function(node){
      gsap.from(node, Object.assign({opacity:0, y:30, duration:.9, ease:"brindi",
        scrollTrigger:{trigger:node, start:"top 86%"}}, opts||{}));
    });
  }
  function splitTitle(sel){
    gsap.utils.toArray(sel).forEach(function(node){
      var split=new SplitText(node,{type:"lines", mask:"lines"});
      gsap.from(split.lines,{yPercent:115, opacity:0, duration:1, ease:"brindi", stagger:.09,
        scrollTrigger:{trigger:node, start:"top 84%"}});
    });
  }

  /* ----------------------------------------------------------
     Act timelines
  ---------------------------------------------------------- */
  function heroIntro(){
    // words,chars: chars animate individually but stay grouped inside word
    // wrappers, so lines can only break BETWEEN words (never "Cuisin / e").
    var split=new SplitText(".hero-title .line",{type:"words,chars"});
    // Hide the hero IMMEDIATELY so it sits blank behind the preloader — this prevents
    // any flash of un-animated text when the intro curtain lifts. Returns a paused
    // timeline the caller plays once the intro slide is gone, so the text only ever
    // appears via the animation on an already-blank screen.
    gsap.set(".site-nav",{opacity:0,y:-14});
    gsap.set(".hero-kicker",{opacity:0,y:22});
    gsap.set(".hero-logo",{opacity:0,y:36,scale:.94});
    gsap.set(split.chars,{yPercent:120,opacity:0});
    gsap.set(".hero-tag",{opacity:0,y:20});
    gsap.set(".scroll-cue",{opacity:0,y:12});
    var tl=gsap.timeline({paused:true, defaults:{ease:"brindi"}});
    tl.to(".hero-kicker",{opacity:1,y:0,duration:1.2})
      .to(".hero-logo",{opacity:1,y:0,scale:1,duration:1.5},"-=.75")
      .to(split.chars,{yPercent:0,opacity:1,stagger:.035,duration:1.2},"-=.85")
      .to(".hero-tag",{opacity:1,y:0,duration:1.1},"-=.6")
      .to(".site-nav",{opacity:1,y:0,duration:1},"-=.7")
      .to(".scroll-cue",{opacity:1,y:0,duration:1.1},"-=.45")
      // a soft, repeating breath on the cue so the held hero gently invites a scroll
      .to(".scroll-cue",{opacity:.55,duration:1.6,ease:"sine.inOut",yoyo:true,repeat:-1},"+=.1");
    return tl;
  }
  function heroParallax(){
    gsap.to(".hero-inner",{yPercent:-14, ease:"none",
      scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
    gsap.to(".hero-emblem",{scale:1.18, rotation:6, ease:"none",
      scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
  }

  function fireStory(){
    var lines=gsap.utils.toArray(".fire-line");
    lines.forEach(function(l){ l._w=new SplitText(l.querySelector(".t"),{type:"words"}).words; });
    var tl=gsap.timeline({scrollTrigger:{trigger:".fire", start:"top top",
      end:"+="+(lines.length*110)+"%", pin:true, scrub:1, anticipatePin:1}});
    lines.forEach(function(l,i){
      var d=l.dataset.dir;
      var from = d==="left"?{xPercent:-55}: d==="right"?{xPercent:55}: d==="scale"?{scale:.7}:{yPercent:90};
      tl.fromTo(l,{opacity:0},{opacity:1,duration:.18},i);
      tl.fromTo(l._w, Object.assign({opacity:0},from),
        {opacity:1,xPercent:0,yPercent:0,scale:1,stagger:.035,duration:.55,ease:"brindi"}, i+0.02);
      if(i<lines.length-1){
        tl.to(l._w,{opacity:0,yPercent:-40,stagger:.02,duration:.4}, i+0.72);
        tl.to(l,{opacity:0,duration:.18}, i+0.85);
      }
    });
    gsap.to(".fire-glow",{yPercent:-12,ease:"none",
      scrollTrigger:{trigger:".fire",start:"top bottom",end:"bottom top",scrub:true}});
    // flame flicker (CustomWiggle) + a wood-fired oven temperature count-up
    CustomWiggle.create("flicker",{wiggles:10,type:"random"});
    gsap.to(".fire-glow",{opacity:.74,duration:4,ease:"flicker",repeat:-1});
    var temp={v:0};
    ScrollTrigger.create({trigger:".fire",start:"top 72%",once:true,onEnter:function(){
      gsap.to(temp,{v:900,duration:2.2,ease:"power2.out",onUpdate:function(){
        var el=document.getElementById("ovenTemp"); if(el) el.textContent=Math.round(temp.v)+"°";
      },onComplete:fireBurst});
    }});
  }

  // The moment the oven hits 900°: one ember burst from the hearth + a glow surge.
  function fireBurst(){
    if(reduced) return;
    gsap.fromTo(".fire-glow",{opacity:.6},{opacity:1,duration:.32,yoyo:true,repeat:1,ease:"power2.in"});
    var c=document.querySelector(".fire"); if(!c) return;
    for(var i=0;i<16;i++){
      var e=document.createElement("i"); e.className="ember";
      var s=gsap.utils.random(3,8); e.style.width=e.style.height=s+"px";
      c.appendChild(e);
      gsap.set(e,{x:c.offsetWidth*gsap.utils.random(.36,.64), y:c.offsetHeight*.86,
        opacity:gsap.utils.random(.5,.95), scale:gsap.utils.random(.6,1.2), zIndex:3});
      gsap.timeline({onComplete:function(node){ node.remove(); }, onCompleteParams:[e]})
        .to(e,{duration:gsap.utils.random(1.6,2.8), ease:"none",
          physics2D:{velocity:gsap.utils.random(190,330), angle:gsap.utils.random(-122,-58), gravity:140}},0)
        .to(e,{opacity:0,duration:.7},"-=.7");
    }
  }

  function mezze(){
    var track=document.getElementById("mezzeTrack");
    var amount=function(){ return track.scrollWidth - window.innerWidth + 40; };
    var hTween=gsap.to(track,{ x:function(){return -amount();}, ease:"none",
      scrollTrigger:{ trigger:".mezze", start:"top top", end:function(){return "+="+amount();},
        pin:true, scrub:1, invalidateOnRefresh:true, anticipatePin:1 } });
    // intro reveal
    splitTitleInContainer(".mezze-intro .sect-title");
    gsap.utils.toArray(".dish-card").forEach(function(card){
      gsap.from(card.querySelectorAll(".idx,.dish-name,.dish-desc,.dish-foot"),
        {y:26,opacity:0,stagger:.07,duration:.7,ease:"brindi",
         scrollTrigger:{trigger:card, containerAnimation:hTween, start:"left 88%"}});
      gsap.from(card.querySelector(".photo-slot"),
        {scale:1.12,opacity:0,duration:.8,ease:"brindi",
         scrollTrigger:{trigger:card, containerAnimation:hTween, start:"left 92%"}});
    });
  }
  // title reveal that works whether or not inside container animation (no ST here, plays on section enter)
  function splitTitleInContainer(sel){
    gsap.utils.toArray(sel).forEach(function(node){
      var split=new SplitText(node,{type:"lines",mask:"lines"});
      gsap.from(split.lines,{yPercent:115,duration:1,ease:"brindi",stagger:.09,
        scrollTrigger:{trigger:".mezze",start:"top 70%"}});
    });
  }

  function woodfire(){
    splitTitle(".woodfire-head .sect-title");
    reveal(".woodfire-head .kicker");
    reveal(".woodfire-head .sect-lede",{y:24});
    gsap.utils.toArray(".entree").forEach(function(row,i){
      gsap.from(row,{opacity:0,y:34,duration:.8,ease:"brindi",
        scrollTrigger:{trigger:row,start:"top 90%"}});
      gsap.from(row.querySelector(".e-name"),{xPercent:(i%2?5:-5),duration:.9,ease:"brindi",
        scrollTrigger:{trigger:row,start:"top 90%"}});
    });
    gsap.utils.toArray(".woodfire-photos .photo-slot").forEach(function(p,i){
      gsap.from(p,{opacity:0,y:50,duration:1,ease:"brindi",delay:i*.1,
        scrollTrigger:{trigger:".woodfire-photos",start:"top 84%"}});
    });
  }

  function lunchReveals(){
    reveal(".lunch .kicker");
    splitTitle(".lunch-head .sect-title");
    reveal(".lunch-head .sect-lede",{y:22});
    reveal(".scene-toggle",{y:16});
    reveal(".scene-stage",{y:26});
    reveal(".lunch-sub",{y:18});
    gsap.utils.toArray(".tag-list li").forEach(function(li,i){
      gsap.from(li,{opacity:0,scale:.85,y:14,duration:.6,ease:"brindi",
        scrollTrigger:{trigger:".tag-list",start:"top 88%"},delay:i*.06});
    });
    gsap.utils.toArray(".line-list li").forEach(function(li){
      gsap.from(li,{opacity:0,x:24,duration:.7,ease:"brindi",
        scrollTrigger:{trigger:li,start:"top 92%"}});
    });
  }

  // LUNCH ⇆ DINNER — the same scene physically rearranges (Flip) between a bright
  // quick-lunch state and a candlelit dinner state. Works instantly under reduced motion.
  function lunchToggle(){
    var scene=document.getElementById("lunchScene"); if(!scene) return;
    var btns=scene.querySelectorAll(".lt-btn");
    var COPY={
      lunch:{chip:"Midday", head:"Wood-fired in ~90 seconds.",
        sub:"Fast and casual on our big misted patio — pides and flatbreads ready in minutes.",
        price:"Pides & Flatbreads · $12–15"},
      dinner:{chip:"Evening", head:"Lingering, by candlelight.",
        sub:"The full Mediterranean table — wine, sangria & live music on the patio.",
        price:"Entrées · $20–26"}
    };
    function setMode(mode){
      if(scene.dataset.mode===mode) return;
      var stage=scene.querySelector(".scene-stage");
      var targets=scene.querySelectorAll(".scene-media,.scene-copy");
      var doFlip = !reduced && window.Flip;
      // Reserve the stage's height for the duration of the flip. Flip uses absolute:true,
      // which lifts the children out of flow — without this the stage collapses to 0 and the
      // flatbread/salad menu below jumps up and overlaps. Released on complete.
      if(doFlip){ stage.style.height = stage.offsetHeight + "px"; }
      var state = doFlip ? Flip.getState(targets) : null;
      scene.dataset.mode=mode;
      scene.classList.toggle("is-dinner", mode==="dinner");
      var c=COPY[mode];
      scene.querySelector("#sceneChip").textContent=c.chip;
      scene.querySelector("#sceneHeadline").textContent=c.head;
      scene.querySelector("#sceneSub").textContent=c.sub;
      scene.querySelector("#scenePrice").textContent=c.price;
      btns.forEach(function(b){ var on=b.dataset.mode===mode;
        b.classList.toggle("is-on",on); b.setAttribute("aria-selected",String(on)); });
      if(doFlip){
        Flip.from(state,{duration:.7,ease:"power3.inOut",absolute:true,
          onEnter:function(el){ return gsap.fromTo(el,{opacity:0},{opacity:1,duration:.4}); },
          onComplete:function(){ stage.style.height=""; }});
      }
    }
    btns.forEach(function(b){ b.addEventListener("click", function(){ setMode(b.dataset.mode); }); });
    // arrow keys move between the Lunch / Dinner tabs (WAI-ARIA tablist pattern)
    scene.querySelector(".scene-toggle").addEventListener("keydown", function(e){
      if(e.key!=="ArrowLeft" && e.key!=="ArrowRight") return;
      e.preventDefault();
      var mode = e.key==="ArrowLeft" ? "lunch" : "dinner";
      setMode(mode);
      scene.querySelector('.lt-btn[data-mode="'+mode+'"]').focus();
    });
  }

  // MorphSVG: a round of dough "bakes" into a charred, irregular wood-fired flatbread as you scroll
  function lunchMorph(){
    if(reduced || !window.MorphSVGPlugin) return;
    gsap.to("#breadMorph",{morphSVG:{shape:"#breadCooked",type:"rotational"}, fill:"#c2683d",
      ease:"none", scrollTrigger:{trigger:"#lunch",start:"top 62%",end:"center 58%",scrub:1}});
  }

  /* ----------------------------------------------------------
     The Experience — reveals, music equalizer, draggable gallery
  ---------------------------------------------------------- */
  function experienceAct(){
    splitTitle(".exp-head .sect-title");
    reveal(".exp-head .kicker");
    reveal(".exp-head .sect-lede",{y:22});
    gsap.utils.toArray(".g-card").forEach(function(card,i){
      gsap.from(card,{opacity:0,y:38,duration:.8,ease:"brindi",delay:i*.06,
        scrollTrigger:{trigger:"#gallery",start:"top 84%"}});
    });
    reveal(".gallery-hint",{y:10});
    equalizer();
    ambianceGallery();
  }
  function equalizer(){
    if(reduced) return;
    gsap.utils.toArray(".equalizer i").forEach(function(bar,i){
      gsap.to(bar,{scaleY:gsap.utils.random(1.7,3.4),duration:gsap.utils.random(.34,.62),
        ease:"sine.inOut",yoyo:true,repeat:-1,delay:i*.08});
    });
  }
  // one Draggable + Inertia gallery (axis-locked so it never fights vertical scroll;
  // disables the touch normalizer while dragging — the same idiom the menu modal uses)
  function ambianceGallery(){
    var track=document.getElementById("galleryTrack");
    var viewport=document.getElementById("galleryViewport");
    if(!track||!viewport) return;
    if(reduced || !window.Draggable) return;   // CSS gives a native scroll-snap fallback
    function bounds(){ return { minX:Math.min(0, viewport.offsetWidth - track.scrollWidth), maxX:0 }; }
    var inst=Draggable.create(track,{
      type:"x", bounds:bounds(), edgeResistance:.85, dragResistance:.05, inertia:true, throwResistance:1700,
      onPress:function(){ if(normalizer) normalizer.disable(); },
      onRelease:function(){ if(normalizer) normalizer.enable(); },
      onThrowComplete:function(){ if(normalizer) normalizer.enable(); }
    })[0];
    ScrollTrigger.addEventListener("refreshInit", function(){ if(inst) inst.applyBounds(bounds()); });
    var hint=document.getElementById("galleryHint");
    if(hint){ var fade=function(){ gsap.to(hint,{opacity:0,duration:.5}); track.removeEventListener("pointerdown",fade); };
      track.addEventListener("pointerdown",fade); }
    // keyboard panning for the focused gallery (left/right arrows, one card at a time)
    viewport.addEventListener("keydown", function(e){
      if(e.key!=="ArrowLeft" && e.key!=="ArrowRight") return;
      e.preventDefault();
      var card=track.querySelector(".g-card");
      var step=card ? card.offsetWidth+24 : 320;
      var b=bounds();
      var cur=gsap.getProperty(track,"x");
      var next=gsap.utils.clamp(b.minX, 0, cur + (e.key==="ArrowLeft" ? step : -step));
      gsap.to(track,{x:next,duration:.5,ease:"brindi",onUpdate:function(){ if(inst) inst.update(); }});
    });
  }

  function sweetsReveals(){
    reveal(".sweets .kicker");
    splitTitle(".sweets-head .sect-title");
    gsap.utils.toArray(".sweet").forEach(function(s,i){
      gsap.from(s,{opacity:0,y:40,duration:.9,ease:"brindi",delay:i*.1,
        scrollTrigger:{trigger:".sweets-grid",start:"top 84%"}});
    });
    reveal(".drinks .kicker");
    gsap.from(".drink-list li",{opacity:0,y:16,stagger:.08,duration:.7,ease:"brindi",
      scrollTrigger:{trigger:".drink-list",start:"top 90%"}});
  }

  function tableReveals(){
    reveal(".table .kicker");
    gsap.utils.toArray(".table-quote .ql").forEach(function(q,i){
      var ch=new SplitText(q,{type:"words,chars"}).chars;   // word-safe wrapping on small screens
      gsap.from(ch,{yPercent:110,opacity:0,stagger:.025,duration:.9,ease:"brindi",
        scrollTrigger:{trigger:".table-quote",start:"top 78%"},delay:i*.12});
    });
    reveal(".table-meta",{y:24});
    reveal(".btn-menu",{y:18});
  }

  function footReveals(){
    splitTitle(".foot-line");
    reveal(".foot-logos",{y:30});
    reveal(".foot-meta");
    reveal(".foot-credit");
  }

  // Hours: a clean character-rise reveal (no scramble) when the reservations block enters
  function tableHours(){
    if(reduced) return;
    gsap.utils.toArray(".table .hours").forEach(function(el,i){
      var chars=new SplitText(el,{type:"chars"}).chars;
      gsap.from(chars,{opacity:0, yPercent:90, duration:.7, ease:"brindi", stagger:0.03, delay:i*0.12,
        scrollTrigger:{trigger:".table-meta", start:"top 82%", once:true}});
    });
  }

  // Finale — "Stay tuned for big things" rises in, underline draws, place fades up,
  // and a faint "B" constellation traces itself into the stars.
  function finaleAct(){
    reveal("#finale .finale-kicker",{y:16});
    gsap.from("#finale .fl",{yPercent:60,opacity:0,duration:1.1,ease:"brindi",stagger:.14,
      scrollTrigger:{trigger:"#finale",start:"top 72%"}});
    gsap.from("#finale .finale-underline path",{drawSVG:"0%",duration:1.2,ease:"brindi",
      scrollTrigger:{trigger:"#finale",start:"top 56%"}});
    reveal("#finale .finale-place",{y:12});
    gsap.from(".finale-constellation .c-line",{drawSVG:"0%",duration:2.2,ease:"power1.inOut",
      scrollTrigger:{trigger:"#finale",start:"top 60%"}});
    gsap.from(".finale-constellation .c-stars circle",{opacity:0,scale:0,transformOrigin:"50% 50%",
      stagger:.14,duration:.5,ease:"back.out(2)",
      scrollTrigger:{trigger:"#finale",start:"top 60%"}});
  }

  // Voices — guest quotes drift up as the night settles
  function voicesReveal(){
    reveal(".voices-kicker",{y:14});
    gsap.from(".voices .quote-card",{opacity:0,y:30,stagger:.12,duration:.85,ease:"brindi",
      scrollTrigger:{trigger:".voices",start:"top 80%"}});
  }

  /* ----------------------------------------------------------
     Boot
  ---------------------------------------------------------- */
  function seenThisSession(){
    try{ return sessionStorage.getItem("brindis-seen")==="1"; }catch(e){ return false; }
  }
  function markSeen(){ try{ sessionStorage.setItem("brindis-seen","1"); }catch(e){} }

  function preloaderOut(after){
    var pl=document.getElementById("preloader");
    // Repeat visit this session? Skip the curtain entirely — straight to the food.
    if(seenThisSession()){ pl.style.display="none"; if(after) after(); return; }
    markSeen();
    // Let the wordmark draw in, hold a short beat so it reads, then lift the curtain.
    gsap.timeline({defaults:{ease:"brindi"}, onComplete:function(){ pl.style.display="none"; if(after) after(); }})
      .to("#preRule",{scaleX:1,duration:.75},0)
      .to(".pre-inner",{opacity:0,y:-12,duration:.55},1.0)
      .to(pl,{yPercent:-100,duration:.9,ease:"power3.inOut"},1.2);
  }

  /* ----------------------------------------------------------
     Day → Night atmosphere — one fixed sky that scrubs the
     palette dawn→deep-night while a sun/moon orb arcs across it.
  ---------------------------------------------------------- */
  // Each phase also styles the orb's anatomy (core / body / limb edge / glow):
  // blazing and warm while it's the sun, cooling to pale bone once it's the moon.
  var SKY = {
    dawn:  {"--sky-top":"#cfe1ef","--sky-bot":"#f5e7cc","--orb-core":"#fff6dc","--orb-color":"#ffd98a","--orb-edge":"#f59b4d","--orb-glow":"#ffc163","--star-op":0},
    midday:{"--sky-top":"#bfe0f2","--sky-bot":"#eef0d8","--orb-core":"#ffffff","--orb-color":"#fff8d6","--orb-edge":"#ffd27a","--orb-glow":"#ffe9a8","--star-op":0},
    golden:{"--sky-top":"#f3c98b","--sky-bot":"#e89a5c","--orb-core":"#fff3d0","--orb-color":"#ffc24f","--orb-edge":"#ff7e35","--orb-glow":"#ff9f57","--star-op":0.06},
    dusk:  {"--sky-top":"#a4503f","--sky-bot":"#5a1f33","--orb-core":"#ffd9a8","--orb-color":"#ff8448","--orb-edge":"#c2451f","--orb-glow":"#d65f2e","--star-op":0.20},
    night: {"--sky-top":"#3a1626","--sky-bot":"#1c0b13","--orb-core":"#f3ead9","--orb-color":"#d9c7b0","--orb-edge":"#b89c92","--orb-glow":"#7a2e48","--star-op":0.72},
    deep:  {"--sky-top":"#170810","--sky-bot":"#0c0409","--orb-core":"#e9dfd0","--orb-color":"#cdbfae","--orb-edge":"#a89289","--orb-glow":"#4a1e33","--star-op":1}
  };
  function setStaticSky(state){
    gsap.set(document.documentElement, state || SKY.golden);
    var orb=document.getElementById("orb");
    if(orb) gsap.set(orb,{xPercent:-50,yPercent:-50,
      x:window.innerWidth*0.74, y:window.innerHeight*0.20, scale:1});
  }
  function dayNight(isMobile){
    var root=document.documentElement, orb=document.getElementById("orb");
    gsap.set(root, SKY.dawn);
    gsap.set(orb,{xPercent:-50,yPercent:-50});
    // place the orb on its arc for a given scroll progress (0=dawn rise → .5=zenith → 1=set)
    function placeOrb(p){
      var arc=4*p*(1-p);
      gsap.set(orb,{ x:(-0.06+1.12*p)*window.innerWidth,
                     y:(0.86-0.74*arc)*window.innerHeight,
                     scale:1+0.45*(1-arc) });
    }
    placeOrb(0);
    var skyTl = gsap.timeline({defaults:{ease:"none"},
        scrollTrigger:{trigger:"#smooth-content",start:"top top",end:"bottom bottom",scrub:1.2,invalidateOnRefresh:true}});
    skyTl.to(root, Object.assign({duration:0.28}, SKY.midday))
      .to(root, Object.assign({duration:0.18}, SKY.golden))
      .to(root, Object.assign({duration:0.14}, SKY.dusk))
      .to(root, Object.assign({duration:0.18}, SKY.night))
      .to(root, Object.assign({duration:0.22}, SKY.deep));
    // Sun → crescent moon: the eclipse begins in the golden-hour band as the
    // woodfire approaches (measured: woodfire enters ≈ .75, "After Dark" ≈ .96)
    // and the crescent is fully formed midway through the entrées — a mask
    // circle slides across the disc, leaving a crescent lit toward the sunset.
    skyTl.to("#orb",{"--moon-x":"32%",duration:0.18,ease:"none"},0.64);
    // the orb arcs bottom-left → zenith → bottom-right across the same scroll range
    ScrollTrigger.create({trigger:"#smooth-content",start:"top top",end:"bottom bottom",scrub:1.2,
      onUpdate:function(self){ placeOrb(self.progress); },
      onRefresh:function(self){ placeOrb(self.progress); }});
  }

  // Lockpoints — when you stop scrolling NEAR a landing section, the page eases to land
  // on it. Stays out of the way inside the pinned acts (only snaps within ~40% of a point).
  function lockpoints(){
    if(reduced || !smoother) return;
    var sel=["#hero","#lunch","#woodfire","#experience","#sweets","#voices","#table","#finale","#foot"];
    function points(){
      var arr=[];
      sel.forEach(function(s){ var el=document.querySelector(s); if(el) arr.push(smoother.offset(el,"top top")); });
      return arr.sort(function(a,b){ return a-b; });
    }
    ScrollTrigger.create({
      start:0, end:"max",
      snap:{
        snapTo:function(value){
          var max=ScrollTrigger.maxScroll(window); if(!max) return value;
          var cur=value*max, pts=points(), near=pts[0], best=Math.abs(pts[0]-cur);
          for(var i=1;i<pts.length;i++){ var d=Math.abs(pts[i]-cur); if(d<best){ best=d; near=pts[i]; } }
          // only snap when close to a landing — leave the pinned acts (fire, mezze) free
          if(best > window.innerHeight*0.42) return value;
          return near/max;
        },
        duration:{min:0.25, max:0.6}, delay:0.14, ease:"power2.inOut"
      }
    });
  }

  function setup(){
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Observer, SplitText, DrawSVGPlugin,
      MorphSVGPlugin, Physics2DPlugin, InertiaPlugin, Draggable, Flip,
      CustomEase, CustomWiggle);
    CustomEase.create("brindi","M0,0,C0.16,1,0.3,1,1,1");
    gsap.defaults({ease:"brindi"});

    wireUI();
    orderNow();

    if(reduced){
      // content already visible via CSS; set a static golden-hour sky, then lift the curtain
      setStaticSky();
      revealOrderNow();
      preloaderOut(function(){ ScrollTrigger.refresh(); });
      return;
    }

    // ignoreMobileResize stops ScrollTrigger refreshing (and jumping) when the
    // mobile address bar shows/hides.
    ScrollTrigger.config({ ignoreMobileResize:true });
    if(!isTouch){
      // Desktop: wheel-smoothed scrolling. Phones/tablets keep NATIVE momentum —
      // ScrollTrigger pins and scrubs work fine against native touch scroll.
      smoother=ScrollSmoother.create({wrapper:"#smooth-wrapper", content:"#smooth-content",
        smooth:1.2, normalizeScroll:true});
      normalizer=ScrollTrigger.normalizeScroll();
    }
    var isMobile=window.matchMedia("(max-width:860px)").matches;
    dayNight(isMobile);
    embers("#emberHero", isTouch?5:(isMobile?8:16));
    embers("#emberWood", isTouch?8:(isMobile?10:26));

    // Prepare the hero NOW so it's already blank behind the preloader, then play its
    // reveal only after the intro slide has lifted (no flash of un-animated text).
    var heroTl=heroIntro();
    heroParallax();
    fireStory();
    lunchReveals();
    lunchToggle();
    lunchMorph();
    mezze();
    woodfire();
    experienceAct();
    sweetsReveals();
    voicesReveal();
    tableReveals();
    tableHours();
    finaleAct();
    footReveals();
    lockpoints();

    preloaderOut(function(){
      ScrollTrigger.refresh();
      gsap.delayedCall(.35, function(){ heroTl.play(); revealOrderNow(); });
    });
  }

  function boot(){
    render();
    var started=false;
    function go(){ if(started) return; started=true;
      try{ setup(); }
      catch(err){ console.error("Brindis init error:", err);
        var pl=document.getElementById("preloader"); if(pl) pl.style.display="none"; }
    }
    // wait for fonts so SplitText measures correctly; fall back after 1.6s
    if(document.fonts && document.fonts.ready){ document.fonts.ready.then(go); }
    setTimeout(go, 1600);
  }

  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
