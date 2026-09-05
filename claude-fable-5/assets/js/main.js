/* Coca-Cola Zero — concept page interactions.
   Plain JS, no dependencies. Everything is progressive enhancement:
   with scripts disabled the page stays complete and readable. */
(function () {
  'use strict';

  /* opt in to JS-only styling (scroll reveals) as early as possible */
  document.documentElement.classList.add('js');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky header state ---------- */
  var header = $('#site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile nav ---------- */
  var toggle = $('.nav-toggle');
  var navList = $('#nav-list');
  if (toggle && navList) {
    var closeNav = function () {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        closeNav();
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (navList.classList.contains('open') &&
          !e.target.closest('.site-nav')) closeNav();
    });
  }

  /* ---------- reveal on scroll ----------
     Anything already in the viewport reveals immediately (no flash of
     hidden content); the observer only handles below-the-fold elements. */
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.add('no-io');
  } else if (reveals.length) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    var viewH = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < viewH && rect.bottom > 0) {
        el.classList.add('in');
      } else {
        revealIO.observe(el);
      }
    });
  }

  /* ---------- stat countdown (35g -> 0g etc.) ---------- */
  var stats = $$('.stat-num');
  if (stats.length && 'IntersectionObserver' in window && motionOK) {
    var animateStat = function (el) {
      var from = parseFloat(el.getAttribute('data-from') || '0');
      var to = parseFloat(el.getAttribute('data-to') || '0');
      var dur = 1500;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3); /* easeOutCubic */
        el.textContent = String(Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { statIO.observe(el); });
  }

  /* ---------- hero bubbles ---------- */
  (function bubbles() {
    var canvas = $('#bubbles');
    if (!canvas || !motionOK || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pool = [], rafId = 0, running = false;

    var rnd = Math.random;
    var makeBubble = function (anywhere) {
      return {
        x: rnd() * W,
        y: anywhere ? rnd() * H : H + 12,
        r: 1 + rnd() * 3.8,
        v: 0.25 + rnd() * 0.85,
        drift: rnd() * 1000,
        a: 0.07 + rnd() * 0.25,
        red: rnd() < 0.14
      };
    };

    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(24, Math.min(64, Math.round((W * H) / 26000)));
      pool = [];
      for (var i = 0; i < count; i++) pool.push(makeBubble(true));
    };

    var tick = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pool.length; i++) {
        var b = pool[i];
        b.y -= b.v;
        b.x += Math.sin((b.y + b.drift) / 58) * 0.22;
        if (b.y < -14) { pool[i] = makeBubble(false); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.red
          ? 'rgba(244,0,9,' + (b.a * 1.25).toFixed(3) + ')'
          : 'rgba(255,255,255,' + b.a.toFixed(3) + ')';
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };

    var start = function () {
      if (!running) { running = true; rafId = requestAnimationFrame(tick); }
    };
    var stop = function () {
      running = false;
      cancelAnimationFrame(rafId);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else if (heroVisible) { start(); }
    });

    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible && !document.hidden) { start(); } else { stop(); }
      }, { threshold: 0.02 }).observe(canvas);
    } else {
      start();
    }
  })();

  /* ---------- flavor switcher ---------- */
  var FLAVORS = {
    classic: {
      name: 'Zero Sugar',
      tag: 'The icon, minus the sugar.',
      accent: '#F40009',
      ink: '#fff',
      notes: ['Deep caramel', 'Citrus spark', 'Vanilla-spice'],
      sizes: '330 ml · 500 ml · 1 L · 1.5 L'
    },
    cherry: {
      name: 'Zero Sugar Cherry',
      tag: 'Dark cherry poured over crisp cola.',
      accent: '#D81B60',
      ink: '#fff',
      notes: ['Black cherry', 'Toasted almond', 'Cola bite'],
      sizes: '330 ml · 500 ml'
    },
    vanilla: {
      name: 'Zero Sugar Vanilla',
      tag: 'Smooth and creamy. Still absolutely zero.',
      accent: '#EAD9B0',
      ink: '#231303',
      notes: ['Vanilla cream', 'Soft caramel', 'Silky finish'],
      sizes: '330 ml · 500 ml'
    },
    decaf: {
      name: 'Zero Sugar Caffeine-Free',
      tag: 'Full taste, none of the caffeine. Night-shift approved.',
      accent: '#B08D2E',
      ink: '#fff',
      notes: ['Full cola taste', 'Zero caffeine', 'Evening-proof'],
      sizes: '330 ml · 1 L'
    }
  };

  var stage = $('#flavor-stage');
  if (stage) {
    var nameEl = $('#flavor-name');
    var tagEl = $('#flavor-tag');
    var notesEl = $('#flavor-notes');
    var sizesEl = $('#flavor-sizes');
    var info = $('.stage-info', stage);
    var btns = $$('.flavor-btn');

    var applyFlavor = function (key) {
      var f = FLAVORS[key];
      if (!f) return;
      stage.style.setProperty('--accent', f.accent);
      stage.style.setProperty('--can-ink', f.ink);
      nameEl.textContent = f.name;
      tagEl.textContent = f.tag;
      sizesEl.textContent = f.sizes;
      notesEl.innerHTML = '';
      f.notes.forEach(function (n) {
        var li = document.createElement('li');
        li.textContent = n;
        notesEl.appendChild(li);
      });
      btns.forEach(function (b) {
        var active = b.getAttribute('data-flavor') === key;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      if (info && motionOK) {
        info.classList.remove('swap');
        void info.offsetWidth; /* restart animation */
        info.classList.add('swap');
      }
    };

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        applyFlavor(b.getAttribute('data-flavor'));
      });
    });
  }

  /* ---------- chill slider ---------- */
  var range = $('#temp');
  if (range) {
    var out = $('#temp-out');
    var tier = $('#temp-tier');
    var badge = $('#perfect-badge');
    var chillSection = $('#chill');
    var chillCan = $('#chill-can');
    var glow = $('.chill-glow');

    var tiers = [
      [16, 'Room temperature. Technically drinkable. Spiritually wrong.'],
      [9, 'Cooling down. The fizz is getting organized.'],
      [4, 'Fridge standard. Crisp enough to hear.'],
      [1, 'Nearly there. Hold your nerve.'],
      [0, 'Zero degrees. Maximum crisp. Open it now.']
    ];

    var applyTemp = function () {
      var v = parseInt(range.value, 10) || 0;
      out.textContent = String(v);
      for (var i = 0; i < tiers.length; i++) {
        if (v >= tiers[i][0]) { tier.textContent = tiers[i][1]; break; }
      }
      var cold = (24 - v) / 24;                       /* 0 warm .. 1 at zero  */
      var frost = Math.max(0, (10 - v) / 10);          /* kicks in below 10deg */
      if (chillCan) {
        chillCan.style.setProperty('--frost', (frost * 0.85).toFixed(3));
        chillCan.style.setProperty('--drops', (0.2 + cold * 0.7).toFixed(3));
        chillCan.style.setProperty('--cold', cold.toFixed(3));
      }
      if (glow) glow.style.setProperty('--cold', cold.toFixed(3));
      var perfect = v === 0;
      if (badge) badge.hidden = !perfect;
      if (chillSection) chillSection.classList.toggle('zero-hit', perfect);
    };

    range.addEventListener('input', applyTemp);
    applyTemp();
  }

  /* ---------- notify form (demo only) ---------- */
  var form = $('#notify');
  if (form) {
    var email = $('#email');
    var err = $('#form-err');
    var done = $('#form-done');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      if (!ok) {
        err.hidden = false;
        email.setAttribute('aria-invalid', 'true');
        email.setAttribute('aria-describedby', 'form-err');
        email.focus();
        return;
      }
      err.hidden = true;
      form.hidden = true;
      done.hidden = false;
    });
    email.addEventListener('input', function () {
      err.hidden = true;
      email.removeAttribute('aria-invalid');
    });
  }

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
