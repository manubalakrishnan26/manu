/* =========================================================
   Manu O B — Portfolio  ·  interactions
   custom cursor · magnetic letter hero · scroll reveals ·
   tilt cards · magnetic buttons
   ========================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* -------------------------------------------------------
     1.  BUILD THE MAGNETIC NAME
     each letter is its own span so it can be displaced
  --------------------------------------------------------*/
  document.querySelectorAll("[data-word]").forEach((wEl) => {
    const word = wEl.getAttribute("data-word");
    [...word].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ltr";
      s.textContent = ch;
      s.style.animationDelay = (240 + i * 55) + "ms";
      wEl.appendChild(s);
    });
  });
  const letters = [...document.querySelectorAll(".namefield .ltr")];

  // enable the entrance enhancement once we have a live frame (base state is visible)
  requestAnimationFrame(() => document.body.classList.add("anim-ready"));

  // Failsafe: setTimeout fires even when the compositor/animation timeline is
  // frozen (some iframed preview contexts pause animations + transitions while
  // still reporting the document as visible). Unconditionally settle the hero
  // into its resting visible state once the entrance window has elapsed — this
  // coincides with the natural end of the entrance in real sessions (harmless)
  // and guarantees the above-the-fold name, intro line and stats are never
  // left blank in a frozen context.
  setTimeout(() => document.body.classList.add("force-shown"), 1200);

  /* -------------------------------------------------------
     2.  CUSTOM CURSOR
  --------------------------------------------------------*/
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;          // ring follows with lag

  if (finePointer && !reduced) {
    document.body.classList.add("cursor-on");
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    (function ringLoop() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(ringLoop);
    })();

    // hover states
    const hoverSel = "a, button, .exp-row, .tools span, .cap-list li";
    document.querySelectorAll(hoverSel).forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cur-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cur-hover"));
    });
    // "view" state on work cards
    const ringLabel = ring.querySelector(".label");
    document.querySelectorAll("[data-view]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        document.body.classList.add("cur-view");
        ringLabel.textContent = "View";
      });
      el.addEventListener("pointerleave", () => document.body.classList.remove("cur-view"));
    });
  } else {
    if (dot) dot.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  /* -------------------------------------------------------
     3.  HERO  — letter displacement + spotlight
  --------------------------------------------------------*/
  const hero = document.getElementById("hero");
  const spot = document.querySelector(".hero-spot");
  const letterState = letters.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
  let pointerInHero = false, hx = 0, hy = 0;

  if (hero && !reduced && finePointer) {
    hero.addEventListener("pointermove", (e) => {
      pointerInHero = true;
      hx = e.clientX; hy = e.clientY;
      const r = hero.getBoundingClientRect();
      spot.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      spot.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { pointerInHero = false; });

    const RADIUS = 190;
    (function letterLoop() {
      letters.forEach((el, i) => {
        const st = letterState[i];
        if (pointerInHero) {
          const b = el.getBoundingClientRect();
          const cx = b.left + b.width / 2;
          const cy = b.top + b.height / 2;
          const dx = cx - hx, dy = cy - hy;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const force = (1 - dist / RADIUS);
            const ang = Math.atan2(dy, dx);
            st.tx = Math.cos(ang) * force * 46;
            st.ty = Math.sin(ang) * force * 46;
            el.classList.toggle("hot", force > 0.42);
          } else {
            st.tx = 0; st.ty = 0; el.classList.remove("hot");
          }
        } else {
          st.tx = 0; st.ty = 0; el.classList.remove("hot");
        }
        st.x = lerp(st.x, st.tx, 0.14);
        st.y = lerp(st.y, st.ty, 0.14);
        el.style.transform = `translate(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px)`;
      });
      requestAnimationFrame(letterLoop);
    })();
  }

  /* -------------------------------------------------------
     4.  SCROLL REVEALS (reveal + maskline)
  --------------------------------------------------------*/
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .maskline").forEach((el) => io.observe(el));

  /* stagger sibling masklines inside a statement */
  document.querySelectorAll(".statement").forEach((st) => {
    [...st.querySelectorAll(".maskline")].forEach((m, i) => {
      m.style.setProperty("--d", i * 90 + "ms");
    });
  });

  /* -------------------------------------------------------
     5.  MAGNETIC BUTTONS  (.mag)
  --------------------------------------------------------*/
  if (finePointer && !reduced) {
    document.querySelectorAll(".mag").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* -------------------------------------------------------
     6.  WORK CARD TILT  (subtle 3d follow)
  --------------------------------------------------------*/
  if (finePointer && !reduced) {
    document.querySelectorAll(".project").forEach((card) => {
      const frame = card.querySelector(".frame");
      card.addEventListener("pointermove", (e) => {
        const r = frame.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform =
          `translateY(-6px) perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => { frame.style.transform = ""; });
    });
  }

  /* -------------------------------------------------------
     7.  HEADER hide-on-scroll-down nicety
  --------------------------------------------------------*/
  const head = document.querySelector(".site-head");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > lastY && y > 200) head.style.transform = "translateY(-120%)";
    else head.style.transform = "translateY(0)";
    head.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    lastY = y;
  }, { passive: true });

  /* -------------------------------------------------------
     8.  HEADER light/dark colour over dark sections
  --------------------------------------------------------*/
  const darkSections = document.querySelectorAll(".contact");
  const headH = 80;
  const flip = () => {
    let overDark = false;
    darkSections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= headH && r.bottom >= headH) overDark = true;
    });
    document.body.classList.toggle("head-light", overDark);
  };
  window.addEventListener("scroll", flip, { passive: true });
  flip();

})();
