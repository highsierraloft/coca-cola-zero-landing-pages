const progressFill = document.querySelector(".progress-bar span");
const header = document.querySelector(".site-header");
const sectionLinks = [...document.querySelectorAll(".site-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealTargets = [...document.querySelectorAll("[data-reveal]")];

if (window.lucide) {
  window.lucide.createIcons();
}

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

  progressFill.style.transform = `scaleX(${progress})`;
  header.classList.toggle("is-scrolled", scrollTop > 12);
};

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const navObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) {
      return;
    }

    const activeId = visibleEntry.target.id;

    sectionLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  },
  {
    threshold: [0.2, 0.45, 0.7],
    rootMargin: "-20% 0px -55% 0px",
  }
);

sections.forEach((section) => navObserver.observe(section));

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

updateScrollState();
