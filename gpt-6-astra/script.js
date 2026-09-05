'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}

menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !opening;
});

mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  const target = document.querySelector(link.getAttribute('href'));
  closeMenu();
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

window.matchMedia('(min-width: 601px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const filterButtons = document.querySelectorAll('[data-filter]');
const productCards = document.querySelectorAll('[data-category]');

filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  let visibleCount = 0;
  filterButtons.forEach(item => {
    const selected = item === button;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  productCards.forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
    if (!card.hidden) visibleCount += 1;
  });
  document.querySelector('#filter-status').textContent = `${visibleCount} ${visibleCount === 1 ? 'flavor' : 'flavors'} shown.`;
}));

const products = {
  original: {
    title: 'Coca-Cola Zero Sugar',
    tag: 'THE ICON',
    description: 'The unmistakable Coca-Cola taste you know and love. Crisp, refreshing, and ready for whatever the day brings. All the feeling, with zero sugar.',
    image: './assets/images/original-zero.jpg',
    background: '#e9e5db',
    search: 'Coca Cola Zero Sugar'
  },
  cherry: {
    title: 'Cherry Zero Sugar',
    tag: 'A BOLD LITTLE TWIST',
    description: 'Your familiar Coca-Cola taste, with a playful burst of cherry flavor. A bold little twist for the days you feel like something different. Zero sugar, of course.',
    image: './assets/images/cherry-zero.png',
    background: '#eadde0',
    search: 'Coca Cola Cherry Zero Sugar'
  },
  vanilla: {
    title: 'Vanilla Zero Sugar',
    tag: 'SMOOTH MOVES',
    description: 'That classic Coca-Cola taste meets a smooth hint of vanilla. A softer twist that makes an everyday break feel like a little treat. With zero sugar.',
    image: './assets/images/vanilla-zero.png',
    background: '#f3e7cc',
    search: 'Coca Cola Vanilla Zero Sugar'
  }
};

const productDialog = document.querySelector('#product-dialog');
const shopDialog = document.querySelector('#shop-dialog');
let selectedProduct = 'original';
let returnFocus = null;

function openDialog(dialog, trigger) {
  returnFocus = trigger || document.activeElement;
  document.body.classList.add('has-dialog');
  dialog.showModal();
  dialog.scrollTop = 0;
}

document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
  selectedProduct = button.dataset.product;
  const product = products[selectedProduct];
  document.querySelector('#product-dialog-title').textContent = product.title;
  document.querySelector('#dialog-product-tag').textContent = product.tag;
  document.querySelector('#dialog-product-description').textContent = product.description;
  const image = document.querySelector('#dialog-product-image');
  image.src = product.image;
  image.alt = `${product.title} can`;
  image.parentElement.style.background = product.background;
  openDialog(productDialog, button);
}));

function openShop(trigger, keepProduct = false) {
  if (!keepProduct) selectedProduct = 'original';
  const query = encodeURIComponent(products[selectedProduct].search);
  document.querySelector('#tesco-link').href = `https://www.tesco.com/groceries/en-GB/search?query=${query}`;
  document.querySelector('#sainsburys-link').href = `https://www.sainsburys.co.uk/gol-ui/SearchResults/${query}`;
  document.querySelector('#shop-status').textContent = '';
  openDialog(shopDialog, trigger);
}

document.querySelectorAll('[data-shop]').forEach(button => button.addEventListener('click', () => openShop(button)));

document.querySelector('#product-shop-button').addEventListener('click', () => {
  const trigger = returnFocus;
  productDialog.close();
  openShop(trigger, true);
});

[productDialog, shopDialog].forEach(dialog => {
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  let pointerStartedOutside = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { pointerStartedOutside = outside(event); });
  dialog.addEventListener('click', event => {
    if (pointerStartedOutside && outside(event)) dialog.close();
    pointerStartedOutside = false;
  });
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    document.body.classList.remove('has-dialog');
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
});

const storeForm = document.querySelector('#store-form');
const locationInput = document.querySelector('#store-location');
locationInput.addEventListener('input', () => locationInput.setCustomValidity(''));

storeForm.addEventListener('submit', event => {
  event.preventDefault();
  const location = locationInput.value.trim();
  if (location.length < 2) {
    locationInput.setCustomValidity('Enter a city or postcode with at least two characters.');
    locationInput.reportValidity();
    return;
  }
  const query = encodeURIComponent(`${products[selectedProduct].search} shops near ${location}`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  const status = document.querySelector('#shop-status');
  status.replaceChildren(document.createTextNode('Your map search is ready. '));
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Open Google Maps';
  link.setAttribute('aria-label', 'Open Google Maps in a new tab');
  status.append(link);
});
