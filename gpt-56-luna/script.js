const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const revealItems = document.querySelectorAll('.reveal');
const productCards = document.querySelectorAll('.product-card');
const selectionNote = document.querySelector('[data-selection-note]');

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const setMenuState = (isOpen) => {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  siteNav.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const productLabels = {
  can: 'Can selected — crisp, cold, ready when you are.',
  bottle: 'Bottle selected — take the full taste with you.',
  'share pack': 'Share pack selected — more zero moments to go around.',
};

productCards.forEach((card) => {
  const button = card.querySelector('.product-select');
  const product = card.dataset.product;

  button?.addEventListener('click', () => {
    productCards.forEach((otherCard) => otherCard.classList.remove('is-selected'));
    card.classList.add('is-selected');
    if (selectionNote) selectionNote.textContent = productLabels[product] || 'Format selected.';
  });
});

const year = document.querySelector('.current-year');
if (year) year.textContent = String(new Date().getFullYear());
