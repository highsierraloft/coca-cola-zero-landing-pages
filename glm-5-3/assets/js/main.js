(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    revealIO.observe(el);
  });

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countIO.unobserve(el);
        const target = Number(el.dataset.count || "0");
        if (reduced || target === 0) {
          el.textContent = String(target);
          return;
        }
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = String(Math.round(easeOut(p) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".count").forEach((el) => countIO.observe(el));

  const bubbles = document.getElementById("bubbles");
  if (bubbles && !reduced) {
    for (let i = 0; i < 20; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = 6 + Math.random() * 26;
      b.style.setProperty("--x", `${Math.random() * 100}%`);
      b.style.setProperty("--s", `${size}px`);
      b.style.setProperty("--dur", `${9 + Math.random() * 14}s`);
      b.style.setProperty("--delay", `${-Math.random() * 20}s`);
      b.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
      bubbles.appendChild(b);
    }
  }

  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-py * 7}deg) rotateY(${px * 7}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  const form = document.getElementById("joinForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("email");
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = "Please enter a valid email address.";
      note.style.color = "#ff8a94";
      input.focus();
      return;
    }
    form.reset();
    note.textContent = "You're in. Welcome to the zero side. ❄";
    note.style.color = "#7be3a2";
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
