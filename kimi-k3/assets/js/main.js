/* Coca-Cola Zero Sugar — landing page interactions (vanilla JS) */
(function () {
  "use strict";

  /* ---------- sticky nav state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  links.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- hero can: gentle pointer tilt ---------- */
  var can = document.getElementById("heroCan");
  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (can && fine && !reduceMotion) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      can.style.animation = "none";
      can.style.transform =
        "translateY(" + y * -18 + "px) rotateY(" + x * 16 + "deg) rotateX(" + y * -8 + "deg)";
    });
    hero.addEventListener("mouseleave", function () {
      can.style.animation = "";
      can.style.transform = "";
    });
  }

  /* ---------- notify form ---------- */
  var form = document.getElementById("notifyForm");
  var email = document.getElementById("email");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = email.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      email.classList.add("is-error");
      note.classList.remove("is-success");
      note.textContent = "Please enter a valid email address.";
      window.setTimeout(function () { email.classList.remove("is-error"); }, 450);
      return;
    }

    note.classList.add("is-success");
    note.textContent = "You’re on the list. Stay frosty — zero is coming your way.";
    form.reset();
  });
})();
