const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

if (menuButton && nav) {
  const setMenuState = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
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
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
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
}

const toast = document.querySelector('[data-toast-message]');
let toastTimer;

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!toast) return;
    toast.textContent = button.dataset.toast;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
  });
});

const locationForm = document.querySelector('[data-location-form]');
const formMessage = document.querySelector('[data-form-message]');

if (locationForm && formMessage) {
  locationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const location = new FormData(locationForm).get('location')?.trim();
    formMessage.textContent = location
      ? `Looking for Coca-Cola Zero Sugar near ${location}.`
      : 'Enter a city or postcode to start your search.';
  });
}
