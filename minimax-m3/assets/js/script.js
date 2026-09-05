/* =========================================================
   Coca-Cola Zero Landing — small interaction layer.
   Vanilla JS only. No external dependencies.
   ========================================================= */
(function () {
  "use strict";

  // ----- Sticky / scrolled nav -----
  const nav = document.querySelector(".cz-nav");
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ----- Mobile nav toggle -----
  const burger = document.querySelector(".cz-nav__burger");
  const links  = document.querySelector(".cz-nav__links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      links.style.display = open ? "flex" : "";
      links.style.position = open ? "absolute" : "";
      links.style.top      = open ? "100%" : "";
      links.style.left     = open ? "0" : "";
      links.style.right    = open ? "0" : "";
      links.style.flexDirection = open ? "column" : "";
      links.style.background    = open ? "rgba(5,5,5,0.95)" : "";
      links.style.padding       = open ? "20px" : "";
      links.style.borderTop     = open ? "1px solid var(--c-line)" : "";
    });
  }

  // ----- Smooth scroll for in-page anchors -----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ----- Feature card cursor glow -----
  document.querySelectorAll(".cz-feature").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });

  // ----- Scroll reveal -----
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".cz-reveal").forEach((el) => io.observe(el));

  // ----- Stat number count-up -----
  const counters = document.querySelectorAll("[data-count]");
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.firstChild
          ? (el.firstChild.nodeValue = value.toFixed(decimals) + suffix)
          : (el.textContent = value.toFixed(decimals) + suffix);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterIO.observe(c));

  // ----- Newsletter form (demo only) -----
  const form = document.querySelector(".cz-cta__form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const note  = document.querySelector(".cz-cta__note");
      if (!input || !input.value.includes("@")) {
        if (note) { note.textContent = "Please enter a valid email."; note.style.color = "#fff"; }
        return;
      }
      if (note) { note.textContent = "Thanks — you're on the list."; }
      input.value = "";
    });
  }

  // ----- Year -----
  const year = document.getElementById("cz-year");
  if (year) year.textContent = new Date().getFullYear();
})();
