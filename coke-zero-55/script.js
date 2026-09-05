const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((section) => activeObserver.observe(section));

const productStage = document.querySelector("[data-product-stage]");
const canStage = document.querySelector(".can-stage");

if (productStage && canStage && !prefersReducedMotion) {
  productStage.addEventListener("pointermove", (event) => {
    const bounds = productStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    canStage.style.transform = `rotate(${x * 5}deg) translateY(${y * -12}px)`;
  });

  productStage.addEventListener("pointerleave", () => {
    canStage.style.transform = "";
  });
}

const form = document.querySelector(".zip-form");
const note = document.querySelector(".form-note");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const zip = new FormData(form).get("zip").trim();
  note.textContent = zip
    ? `Checking cold availability near ${zip}.`
    : "Enter a ZIP code to check nearby shelves.";
});
