(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ---------------------------------- Nav scroll state ---------------------------------- */

  const nav = document.getElementById('siteNav');

  function updateNavState() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });

  /* ---------------------------------- Mobile menu ---------------------------------- */

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------- Scroll reveals ---------------------------------- */

  const revealTargets = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------- Stat counters ---------------------------------- */

  const counters = document.querySelectorAll('[data-count-to]');

  function animateCounter(el) {
    const target = Number(el.getAttribute('data-count-to'));
    const suffix = el.querySelector('small');
    const suffixHTML = suffix ? suffix.outerHTML : '';
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.innerHTML = `${value}${suffixHTML}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.innerHTML = `${target}${suffixHTML}`;
      }
    }

    if (prefersReducedMotion) {
      el.innerHTML = `${target}${suffixHTML}`;
      return;
    }

    requestAnimationFrame(tick);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------------------------- Flavor selector ---------------------------------- */

  const flavorButtons = document.querySelectorAll('.flavor-swatch');
  const flavorGlow = document.getElementById('flavorGlow');
  const flavorName = document.getElementById('flavorName');
  const flavorDesc = document.getElementById('flavorDesc');

  flavorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      flavorButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      const accent = getComputedStyle(button).getPropertyValue('--accent').trim();
      if (flavorGlow) flavorGlow.style.setProperty('--accent', accent);
      if (flavorName) flavorName.textContent = button.getAttribute('data-name') || '';
      if (flavorDesc) flavorDesc.textContent = button.getAttribute('data-desc') || '';
    });
  });

  /* ---------------------------------- Testimonial slider ---------------------------------- */

  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDotsWrap = document.getElementById('sliderDots');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');

  if (sliderTrack && sliderDotsWrap) {
    const slides = Array.from(sliderTrack.querySelectorAll('.testimonial'));
    let activeIndex = 0;
    let autoTimer = null;

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show story ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      sliderDotsWrap.appendChild(dot);
    });

    const dots = Array.from(sliderDotsWrap.children);

    function render() {
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === activeIndex);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    }

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      render();
    }

    function next() {
      goTo(activeIndex + 1);
    }

    function prev() {
      goTo(activeIndex - 1);
    }

    function startAuto() {
      if (prefersReducedMotion) return;
      stopAuto();
      autoTimer = window.setInterval(next, 6000);
    }

    function stopAuto() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    if (sliderNext) sliderNext.addEventListener('click', () => { next(); startAuto(); });
    if (sliderPrev) sliderPrev.addEventListener('click', () => { prev(); startAuto(); });

    const sliderRoot = document.querySelector('[data-slider]');
    if (sliderRoot) {
      sliderRoot.addEventListener('mouseenter', stopAuto);
      sliderRoot.addEventListener('mouseleave', startAuto);
      sliderRoot.addEventListener('focusin', stopAuto);
      sliderRoot.addEventListener('focusout', startAuto);
    }

    render();
    startAuto();
  }

  /* ---------------------------------- Recycling meter ---------------------------------- */

  const meterFill = document.getElementById('meterFill');

  if (meterFill && 'IntersectionObserver' in window) {
    const meterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fill = entry.target.getAttribute('data-fill') || '0';
            entry.target.style.width = `${fill}%`;
            meterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    meterObserver.observe(meterFill);
  } else if (meterFill) {
    meterFill.style.width = `${meterFill.getAttribute('data-fill') || '0'}%`;
  }

  /* ---------------------------------- Newsletter form ---------------------------------- */

  const signupForm = document.getElementById('signupForm');
  const signupStatus = document.getElementById('signupStatus');
  const emailInput = document.getElementById('emailInput');

  if (signupForm && signupStatus && emailInput) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      signupStatus.classList.remove('is-success', 'is-error');

      if (!isValid) {
        signupStatus.textContent = 'Please enter a valid email address.';
        signupStatus.classList.add('is-error');
        emailInput.focus();
        return;
      }

      signupStatus.textContent = "You're on the list. Welcome to Zero.";
      signupStatus.classList.add('is-success');
      signupForm.reset();
    });
  }

  /* ---------------------------------- Footer year ---------------------------------- */

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
