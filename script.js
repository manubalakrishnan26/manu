/* =========================================================
   Manu O B — Portfolio v2  ·  interactions
   ========================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* -------------------------------------------------------
     1.  SCROLL PROGRESS BAR
  --------------------------------------------------------*/
  const progressBar = document.querySelector(".progress-bar");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });

  /* -------------------------------------------------------
     2.  MAGNETIC NAME — build letter spans
  --------------------------------------------------------*/
  document.querySelectorAll("[data-word]").forEach((wEl) => {
    const word = wEl.getAttribute("data-word");
    [...word].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ltr";
      s.textContent = ch;
      s.style.animationDelay = (260 + i * 55) + "ms";
      wEl.appendChild(s);
    });
  });
  const letters = [...document.querySelectorAll(".namefield .ltr")];
  requestAnimationFrame(() => document.body.classList.add("anim-ready"));
  setTimeout(() => document.body.classList.add("force-shown"), 1200);

  /* -------------------------------------------------------
     3.  CUSTOM CURSOR
  --------------------------------------------------------*/
  const dot  = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  if (finePointer && !reduced) {
    document.body.classList.add("cursor-on");

    /* palette colours that auto-cycle on the ring */
    const palette = ["#CAE4DB", "#DCAE1D", "#7A9D96", "#00303F"];
    let palIdx = 0;
    setInterval(() => {
      palIdx = (palIdx + 1) % palette.length;
      ring.style.borderColor = palette[palIdx];
      dot.style.background   = palette[palIdx];
    }, 2200);

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    }, { passive: true });

    (function ringLoop() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    })();

    const hoverSel = "a, button, .exp-row, .tools span, .cap-list li, .about-card, .btn-ghost, .btn-primary";
    document.querySelectorAll(hoverSel).forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cur-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cur-hover"));
    });
    const ringLabel = ring.querySelector(".label");
    document.querySelectorAll("[data-view]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        document.body.classList.add("cur-view");
        ringLabel.textContent = "View";
      });
      el.addEventListener("pointerleave", () => document.body.classList.remove("cur-view"));
    });
  } else {
    if (dot)  dot.style.display  = "none";
    if (ring) ring.style.display = "none";
  }

  /* -------------------------------------------------------
     4.  HERO letter displacement + spotlight
  --------------------------------------------------------*/
  const hero = document.getElementById("hero");
  const spot = document.querySelector(".hero-spot");
  const letterState = letters.map(() => ({ x:0, y:0, tx:0, ty:0 }));
  let pointerInHero = false, hx = 0, hy = 0;

  if (hero && !reduced && finePointer) {
    hero.addEventListener("pointermove", (e) => {
      pointerInHero = true;
      hx = e.clientX; hy = e.clientY;
      const r = hero.getBoundingClientRect();
      spot.style.setProperty("--mx", ((e.clientX - r.left) / r.width)  * 100 + "%");
      spot.style.setProperty("--my", ((e.clientY - r.top)  / r.height) * 100 + "%");
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { pointerInHero = false; });

    const RADIUS = 200;
    (function letterLoop() {
      letters.forEach((el, i) => {
        const st = letterState[i];
        if (pointerInHero) {
          const b = el.getBoundingClientRect();
          const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
          const dx = cx - hx, dy = cy - hy;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const force = 1 - dist / RADIUS;
            const ang = Math.atan2(dy, dx);
            st.tx = Math.cos(ang) * force * 50;
            st.ty = Math.sin(ang) * force * 50;
            el.classList.toggle("hot", force > 0.4);
          } else {
            st.tx = 0; st.ty = 0; el.classList.remove("hot");
          }
        } else {
          st.tx = 0; st.ty = 0; el.classList.remove("hot");
        }
        st.x = lerp(st.x, st.tx, 0.13);
        st.y = lerp(st.y, st.ty, 0.13);
        el.style.transform = `translate(${st.x.toFixed(2)}px,${st.y.toFixed(2)}px)`;
      });
      requestAnimationFrame(letterLoop);
    })();
  }

  /* -------------------------------------------------------
     5.  SCROLL REVEALS
  --------------------------------------------------------*/
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll(".reveal, .maskline").forEach((el) => io.observe(el));

  // hero divider uses scaleX transition, tag it with reveal
  const heroDivider = document.querySelector(".hero-divider");
  if (heroDivider) io.observe(heroDivider);

  // timeline line
  const timelineLine = document.querySelector(".timeline-line");
  if (timelineLine) {
    const tio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); tio.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    tio.observe(timelineLine);
  }

  // stagger masklines inside .statement
  document.querySelectorAll(".statement").forEach((st) => {
    [...st.querySelectorAll(".maskline")].forEach((m, i) => {
      m.style.setProperty("--d", i * 88 + "ms");
    });
  });

  /* -------------------------------------------------------
     6.  MAGNETIC BUTTONS  (.mag)
  --------------------------------------------------------*/
  if (finePointer && !reduced) {
    document.querySelectorAll(".mag").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width  / 2)) * 0.32;
        const y = (e.clientY - (r.top  + r.height / 2)) * 0.32;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* -------------------------------------------------------
     7.  WORK CARD TILT
  --------------------------------------------------------*/
  if (finePointer && !reduced) {
    document.querySelectorAll(".project").forEach((card) => {
      const frame = card.querySelector(".frame");
      card.addEventListener("pointermove", (e) => {
        const r = frame.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        frame.style.transform =
          `translateY(-5px) perspective(900px) rotateX(${(-py * 4.5).toFixed(2)}deg) rotateY(${(px * 5.5).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => { frame.style.transform = ""; });
    });
  }

  /* -------------------------------------------------------
     8.  HEADER — hide on scroll-down, frosted on scroll
  --------------------------------------------------------*/
  const head = document.querySelector(".site-head");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    head.classList.toggle("scrolled", y > 40);
    if (y > lastY && y > 220) head.style.transform = "translateY(-120%)";
    else head.style.transform = "translateY(0)";
    head.style.transition = "transform .5s cubic-bezier(.22,1,.36,1), color .5s, backdrop-filter .3s";
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------
     9.  HEADER light-mode over dark sections
  --------------------------------------------------------*/
  const darkSecs = document.querySelectorAll(".contact, .caps, .principles-strip");
  const headH = 72;
  const flip = () => {
    let over = false;
    darkSecs.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= headH && r.bottom >= headH) over = true;
    });
    document.body.classList.toggle("head-light", over);
  };
  window.addEventListener("scroll", flip, { passive: true });
  flip();

  /* -------------------------------------------------------
     10.  INK SPLASH ANIMATION
  --------------------------------------------------------*/
  if (!reduced) {
    const inkContainer = document.getElementById("inkSplashes");
    const inkColors = [
      { color: "#b8d9f5", op: 0.38 }, // light blue
      { color: "#f5c6d0", op: 0.36 }, // light pink
      { color: "#b8e8c8", op: 0.38 }, // light green
      { color: "#fcd9a8", op: 0.36 }, // light orange
    ];
    const blobs = [
      "42% 58% 62% 38% / 55% 45% 65% 35%",
      "55% 45% 38% 62% / 48% 56% 44% 52%",
      "38% 62% 45% 55% / 60% 40% 58% 42%",
      "62% 38% 50% 50% / 42% 60% 40% 58%",
      "50% 50% 42% 58% / 56% 44% 62% 38%",
      "45% 55% 58% 42% / 50% 60% 40% 55%",
      "68% 32% 44% 56% / 38% 62% 44% 56%",
      "35% 65% 55% 45% / 62% 38% 52% 48%",
    ];

    function spawnInk() {
      const pick = inkColors[Math.floor(Math.random() * inkColors.length)];
      const blob = blobs[Math.floor(Math.random() * blobs.length)];
      const w = 120 + Math.random() * 520;
      const h = 80 + Math.random() * 440;
      const x = -5 + Math.random() * 110;
      const y = -5 + Math.random() * 110;
      const rot = Math.random() * 360;

      const el = document.createElement("div");
      el.className = "ink-drop";
      el.style.cssText = `
        width: ${w}px; height: ${h}px;
        left: ${x}%; top: ${y}%;
        background: ${pick.color};
        border-radius: ${blob};
        --op: ${pick.op};
        transform: translate(-50%, -50%) scale(0.5) rotate(${rot}deg);
      `;
      inkContainer.appendChild(el);

      // fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = `translate(-50%, -50%) scale(1) rotate(${rot}deg)`;
          el.classList.add("in");
        });
      });

      // hold then fade out
      const hold = 3500 + Math.random() * 4500;
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = `translate(-50%, -50%) scale(1.12) rotate(${rot + 8}deg)`;
        setTimeout(() => el.remove(), 2600);
      }, hold);
    }

    // initial burst — 3 splashes staggered
    setTimeout(() => spawnInk(), 300);
    setTimeout(() => spawnInk(), 900);
    setTimeout(() => spawnInk(), 1600);

    // then keep spawning every 2.5–4s
    setInterval(() => spawnInk(), 2500 + Math.random() * 1500);
  }

})();
