/* =============================================================================
   Coca-Cola Zero — progressive enhancement
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -------------------------------------------------- Header scroll state -- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------------------------------------- Mobile nav ---- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("data-open", open ? "true" : "false");
      document.body.setAttribute("data-nav-open", open ? "true" : "false");
    };
    setNav(false);

    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNav(false);
      }
    });
  }

  /* ------------------------------------------------- Reveal on scroll ------ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
  // Signal the head-script safety net that reveal handling is wired up.
  window.__revealReady = true;

  /* ------------------------------------------------- Animated counters ----- */
  var counterGroup = document.querySelector("[data-counters]");
  if (counterGroup && "IntersectionObserver" in window) {
    var runCounters = function () {
      var nums = counterGroup.querySelectorAll("[data-count-to]");
      nums.forEach(function (node) {
        var target = parseInt(node.getAttribute("data-count-to"), 10) || 0;
        var suffix = node.getAttribute("data-count-suffix") || "";
        if (reduceMotion || target === 0) {
          node.textContent = String(target) + suffix;
          return;
        }
        var duration = 1400;
        var start = null;
        var step = function (now) {
          if (start === null) start = now;
          var progress = Math.min((now - start) / duration, 1);
          // easeOutCubic
          var eased = 1 - Math.pow(1 - progress, 3);
          node.textContent = String(Math.round(target * eased)) + suffix;
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      });
    };

    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    counterObserver.observe(counterGroup);
  }

  /* ------------------------------------------------- Active nav link ------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('[data-nav-menu] a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* --------------------------------------------------- Hero can tilt ------- */
  var tiltZone = document.querySelector("[data-tilt]");
  var tiltTarget = document.querySelector("[data-tilt-target]");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (tiltZone && tiltTarget && finePointer && !reduceMotion) {
    tiltZone.addEventListener("pointermove", function (event) {
      var rect = tiltZone.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;
      tiltTarget.style.setProperty("--tiltY", (px * 12).toFixed(2) + "deg");
      tiltTarget.style.setProperty("--tiltX", (-py * 10).toFixed(2) + "deg");
    });
    tiltZone.addEventListener("pointerleave", function () {
      tiltTarget.style.setProperty("--tiltY", "0deg");
      tiltTarget.style.setProperty("--tiltX", "0deg");
    });
  }

  /* ----------------------------------------------------- Join form --------- */
  var joinForm = document.querySelector("[data-join-form]");
  if (joinForm) {
    var status = joinForm.querySelector("[data-join-status]");
    var input = joinForm.querySelector('input[type="email"]');
    joinForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!input || !status) return;
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        status.style.color = "";
        status.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      status.style.color = "#7CFFB2";
      status.textContent = "You're on the list. Stay cold. 🥤";
      joinForm.reset();
    });
  }

  /* ----------------------------------------------------- Footer year ------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
