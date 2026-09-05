const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const revealItems = document.querySelectorAll('.reveal');
const productCards = document.querySelectorAll('.product-card');
const selectionNote = document.querySelector('[data-selection-note]');
const mobileMenuQuery = window.matchMedia('(max-width: 760px)');
let menuReturnFocus = null;

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const setNavAvailability = (isAvailable) => {
  if (!siteNav) return;
  siteNav.toggleAttribute('inert', !isAvailable);
  siteNav.setAttribute('aria-hidden', String(!isAvailable));
  navLinks.forEach((link) => {
    if (isAvailable) link.removeAttribute('tabindex');
    else link.setAttribute('tabindex', '-1');
  });
};

const setMenuState = (isOpen, { restoreFocus = true } = {}) => {
  if (!menuToggle || !siteNav) return;
  const shouldOpen = isOpen && mobileMenuQuery.matches;

  if (shouldOpen) {
    menuReturnFocus = document.activeElement || menuToggle;
  }

  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  siteNav.classList.toggle('is-open', shouldOpen);
  document.body.classList.toggle('menu-open', shouldOpen);
  setNavAvailability(shouldOpen || !mobileMenuQuery.matches);

  if (!shouldOpen && restoreFocus && mobileMenuQuery.matches) {
    (menuReturnFocus?.isConnected ? menuReturnFocus : menuToggle).focus();
  }
};

const syncMenuForViewport = () => {
  const isMobile = mobileMenuQuery.matches;
  const wasOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
  const focusWasInMenu = document.activeElement === menuToggle || siteNav?.contains(document.activeElement);

  setMenuState(false, { restoreFocus: false });

  if (isMobile) {
    setNavAvailability(false);
    if (focusWasInMenu) menuToggle?.focus();
    return;
  }

  setNavAvailability(true);
  if ((wasOpen || focusWasInMenu) && siteNav) siteNav.querySelector('a')?.focus();
};

setMenuState(false, { restoreFocus: false });
syncMenuForViewport();

if (mobileMenuQuery.addEventListener) mobileMenuQuery.addEventListener('change', syncMenuForViewport);
else mobileMenuQuery.addListener?.(syncMenuForViewport);

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  setMenuState(false, { restoreFocus: false });
  window.setTimeout(() => {
    if (mobileMenuQuery.matches && menuToggle?.isConnected) menuToggle.focus();
  }, 0);
}));

document.addEventListener('keydown', (event) => {
  const isOpen = mobileMenuQuery.matches && menuToggle?.getAttribute('aria-expanded') === 'true';
  if (!isOpen) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    setMenuState(false);
    return;
  }

  if (event.key !== 'Tab') return;
  const focusable = [menuToggle, ...navLinks].filter((element) => element && !element.hasAttribute('disabled'));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('focusin', (event) => {
  const isOpen = mobileMenuQuery.matches && menuToggle?.getAttribute('aria-expanded') === 'true';
  if (!isOpen || siteNav?.contains(event.target) || event.target === menuToggle) return;
  navLinks[0]?.focus();
});

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
    productCards.forEach((otherCard) => {
      const otherButton = otherCard.querySelector('.product-select');
      const isSelected = otherCard === card;
      otherCard.classList.toggle('is-selected', isSelected);
      otherButton?.setAttribute('aria-pressed', String(isSelected));
    });
    if (selectionNote) selectionNote.textContent = productLabels[product] || 'Format selected.';
  });
});

const year = document.querySelector('.current-year');
if (year) year.textContent = String(new Date().getFullYear());
