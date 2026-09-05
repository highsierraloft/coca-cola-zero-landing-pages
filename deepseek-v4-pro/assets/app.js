(() => {
  'use strict';

  const header = document.querySelector('.site-header');

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        header.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.can-stage');

  if (hero && stage && !reduceMotion.matches) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty('--mx', x.toFixed(3));
      stage.style.setProperty('--my', y.toFixed(3));
    });

    hero.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', '0');
      stage.style.setProperty('--my', '0');
    });
  }

  const form = document.querySelector('.find-form');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const note = form.parentElement.querySelector('.form-note');
      if (note) {
        note.hidden = false;
        note.textContent = 'You\u2019re on the list. The nearest fridge awaits.';
      }
    });
  }
})();