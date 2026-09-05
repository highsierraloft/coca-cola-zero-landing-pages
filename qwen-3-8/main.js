(function () {
  "use strict";

  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  var header = document.querySelector(".site-header");

  navToggle.addEventListener("click", function () {
    var open = navMenu.classList.toggle("open");
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      header.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  var form = document.getElementById("join-form");
  var note = document.getElementById("form-note");
  var emailInput = document.getElementById("email");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = emailInput.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      note.classList.remove("ok");
      note.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }
    note.classList.add("ok");
    note.textContent = "You're on the list. Stay cold.";
    form.reset();
  });
})();
