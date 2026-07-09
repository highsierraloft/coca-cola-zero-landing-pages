const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLabel = menuToggle?.querySelector(".menu-toggle__label");
const pageMain = document.querySelector("main");
const pageFooter = document.querySelector("footer");
const brandLink = document.querySelector(".site-header .brand");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMenu(open) {
  if (!menu || !menuToggle) return;

  menu.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  pageMain?.toggleAttribute("inert", open);
  pageFooter?.toggleAttribute("inert", open);
  brandLink?.toggleAttribute("inert", open);
  if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
}

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(willOpen);
  if (willOpen) menu?.querySelector("a")?.focus();
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && menuToggle?.getAttribute("aria-expanded") === "true") {
    const focusable = [menuToggle, ...(menu?.querySelectorAll("a") ?? [])];
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 960 && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
  }
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 32),
  { passive: true },
);

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -4%" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function attachTilt(stage, target, xName, yName, intensity = 7) {
  if (!stage || !target || prefersReducedMotion.matches) return;

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    target.style.setProperty(xName, `${x * intensity}deg`);
    target.style.setProperty(yName, `${y * -intensity}deg`);
  });

  stage.addEventListener("pointerleave", () => {
    target.style.setProperty(xName, "0deg");
    target.style.setProperty(yName, "0deg");
  });
}

const hero = document.querySelector(".hero");
const heroProduct = document.querySelector("[data-hero-product]");
attachTilt(hero, heroProduct, "--pointer-x", "--pointer-y", 8);

const productStage = document.querySelector("[data-product-stage]");
const spotlightCan = productStage?.querySelector(".spotlight__can");
attachTilt(productStage, spotlightCan, "--stage-x", "--stage-y", 12);

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
