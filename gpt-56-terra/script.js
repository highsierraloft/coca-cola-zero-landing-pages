const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

if (menuButton && nav) {
  const mobileQuery = window.matchMedia('(max-width: 760px)');

  const setMenuState = (open) => {
    const isOpen = open && mobileQuery.matches;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.querySelector('.sr-only').textContent = isOpen ? 'Close navigation' : 'Open navigation';
    nav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = mobileQuery.matches && menuButton.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (event.key === 'Escape') {
      setMenuState(false);
      menuButton.focus();
      return;
    }

    if (event.key === 'Tab') {
      const focusableItems = [menuButton, ...nav.querySelectorAll('a[href]')];
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }
  });

  const resetMenuForDesktop = (event) => {
    if (event.matches) return;

    const toggleHadFocus = document.activeElement === menuButton;
    setMenuState(false);

    if (toggleHadFocus) {
      window.requestAnimationFrame(() => nav.querySelector('a[href]')?.focus({ preventScroll: true }));
    }
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', resetMenuForDesktop);
  } else {
    mobileQuery.addListener(resetMenuForDesktop);
  }
}

const flavourButtons = document.querySelectorAll('[data-flavour-select]');
const flavourSelection = document.querySelector('[data-flavour-selection]');

flavourButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFlavour = button.dataset.flavour;

    flavourButtons.forEach((flavourButton) => {
      const selected = flavourButton === button;
      const flavourName = flavourButton.dataset.flavour;
      flavourButton.setAttribute('aria-pressed', String(selected));
      flavourButton.closest('.flavour-card')?.classList.toggle('is-selected', selected);
      flavourButton.querySelector('[data-flavour-label]').textContent = selected
        ? `${flavourName} selected`
        : `Select ${flavourName}`;
      flavourButton.querySelector('[aria-hidden="true"]').textContent = selected ? '✓' : '↗';
    });

    if (flavourSelection) {
      flavourSelection.textContent = `${selectedFlavour} selected.`;
    }
  });
});

const locationForm = document.querySelector('[data-location-form]');
const formMessage = document.querySelector('[data-form-message]');

if (locationForm && formMessage) {
  locationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const location = new FormData(locationForm).get('location')?.trim();
    if (!location) {
      formMessage.textContent = 'Enter a city or postcode to search Google Maps.';
      return;
    }

    const searchQuery = `Coca-Cola Zero Sugar near ${location}`;
    window.location.assign(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`);
  });
}
