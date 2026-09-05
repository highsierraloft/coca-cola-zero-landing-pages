/**
 * Coca-Cola Zero Sugar — Interactive Landing Page Engine
 * Pure AI Implementation with Native Canvas, Web Audio API & Modern Interactions
 */

// ----------------------------------------------------
// 1. Web Audio API Acoustic Synthesizer (Realistic Sound FX)
// ----------------------------------------------------
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    const soundBars = document.querySelectorAll('.sound-bar');
    soundBars.forEach(b => {
      if (this.muted) {
        b.classList.remove('active');
        b.style.height = '4px';
      } else {
        b.classList.add('active');
      }
    });
    return this.muted;
  }

  // Realistic Can Snap & High-Pressure Carbonation Burst
  playCanCrack() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Phase 1: Aluminum metallic tab pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);

    // Phase 2: High pressure hiss / gas release (bandpass noise)
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3800, t);
    filter.Q.setValueAtTime(2.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t + 0.02);

    // Trigger visualizer wave
    this.animateVisualizer();
  }

  // Effervescent Micro-Bubbles sound
  playFizz() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.8;
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(5000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Pure Refreshment Chime (Harmonic chord)
  playChime() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.7);
    });
  }

  animateVisualizer() {
    const bars = document.querySelectorAll('.sound-bar');
    bars.forEach((b, i) => {
      setTimeout(() => {
        b.style.height = `${Math.floor(Math.random() * 18 + 8)}px`;
        setTimeout(() => {
          if (!this.muted) b.style.height = '';
        }, 300);
      }, i * 40);
    });
  }
}

const audio = new SoundEngine();

// ----------------------------------------------------
// 2. HTML5 Canvas Effervescent Fizz Particle Simulation
// ----------------------------------------------------
class FizzCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bubbles = [];
    this.numBubbles = 75;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initBubbles();
    this.animate();

    // Spawn bubbles on mouse click/tap
    window.addEventListener('click', (e) => {
      this.burstAt(e.clientX, e.clientY, 15);
    });
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initBubbles() {
    this.bubbles = [];
    for (let i = 0; i < this.numBubbles; i++) {
      this.bubbles.push(this.createBubble(false));
    }
  }

  createBubble(atBottom = true) {
    return {
      x: Math.random() * this.width,
      y: atBottom ? this.height + Math.random() * 20 : Math.random() * this.height,
      radius: Math.random() * 3 + 1,
      speedY: Math.random() * 1.5 + 0.8,
      wobbleSpeed: Math.random() * 0.03 + 0.01,
      wobbleAmp: Math.random() * 1.8 + 0.5,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.2,
      redTint: Math.random() > 0.7
    };
  }

  burstAt(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.bubbles.push({
        x: x,
        y: y,
        radius: Math.random() * 4 + 1.5,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1.5,
        wobbleSpeed: 0.02,
        wobbleAmp: 1,
        angle: 0,
        opacity: 0.8,
        redTint: Math.random() > 0.5,
        isBurst: true,
        life: 1.0
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];

      if (b.isBurst) {
        b.x += b.speedX;
        b.y += b.speedY;
        b.speedY -= 0.03; // buoyancy
        b.life -= 0.02;
        b.opacity = b.life * 0.7;

        if (b.life <= 0) {
          this.bubbles.splice(i, 1);
          i--;
          continue;
        }
      } else {
        b.angle += b.wobbleSpeed;
        b.x += Math.sin(b.angle) * b.wobbleAmp;
        b.y -= b.speedY;

        if (b.y < -10) {
          this.bubbles[i] = this.createBubble(true);
        }
      }

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      
      if (b.redTint) {
        this.ctx.fillStyle = `rgba(244, 0, 9, ${b.opacity * 0.6})`;
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
      }
      this.ctx.fill();

      // Specular shine on bubble
      if (b.radius > 2.5) {
        this.ctx.beginPath();
        this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
        this.ctx.fill();
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ----------------------------------------------------
// 3. Interactive 3D Can Parallax & Mouse Response
// ----------------------------------------------------
function initCan3D() {
  const heroSection = document.getElementById('hero');
  const canWrap = document.getElementById('hero-can-wrap');
  if (!heroSection || !canWrap) return;

  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetTiltX = -y * 22; // max tilt degrees
    targetTiltY = x * 28;
  });

  heroSection.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // Smooth lerp loop
  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    canWrap.style.transform = `rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
    requestAnimationFrame(updateTilt);
  }
  updateTilt();
}

// ----------------------------------------------------
// 4. Interactive Flavor Spectrum Switcher
// ----------------------------------------------------
const flavorsData = {
  classic: {
    name: "Coca-Cola Zero Sugar",
    tagline: "The Original Legend. Maximum Taste.",
    svg: "./assets/coke-can-classic.svg",
    accentColor: "#f40009",
    glowClass: "ambient-glow-red",
    profile: { sweetness: 92, crispness: 98, fizz: 95, chill: 100 },
    notes: "Authentic, time-tested secret formula. Zero sugar, zero compromise.",
    badge: "100% Iconic",
    size: "330mL Can / 500mL Bottle / 2L"
  },
  cherry: {
    name: "Coca-Cola Zero Cherry",
    tagline: "Rich Wild Cherry Meets Cold Black Soda.",
    svg: "./assets/coke-can-cherry.svg",
    accentColor: "#d60045",
    glowClass: "ambient-glow-cherry",
    profile: { sweetness: 96, crispness: 90, fizz: 92, chill: 95 },
    notes: "Deep, velvety wild black cherry burst layered over signature Coca-Cola fizz.",
    badge: "Fan Favorite",
    size: "330mL Sleek Can"
  },
  vanilla: {
    name: "Coca-Cola Zero Vanilla",
    tagline: "Velvety Bourbon Vanilla Warmth Over Ice.",
    svg: "./assets/coke-can-vanilla.svg",
    accentColor: "#e6a440",
    glowClass: "ambient-glow-vanilla",
    profile: { sweetness: 98, crispness: 88, fizz: 89, chill: 92 },
    notes: "Smooth, aromatic vanilla bean aromatics rounded out with ultra-fine bubbles.",
    badge: "Limited Edition",
    size: "330mL Can"
  },
  lime: {
    name: "Coca-Cola Zero Lime",
    tagline: "Zesty Electric Citrus Awakening.",
    svg: "./assets/coke-can-lime.svg",
    accentColor: "#2ee66b",
    glowClass: "ambient-glow-lime",
    profile: { sweetness: 85, crispness: 100, fizz: 98, chill: 99 },
    notes: "Bright key-lime essential zest delivering an electrifying sub-zero refresh.",
    badge: "Summer Ultra-Crisp",
    size: "330mL Sleek Can"
  }
};

function initFlavorSwitcher() {
  const pills = document.querySelectorAll('.flavor-pill');
  const heroCanImg = document.getElementById('hero-can-img');
  const flavorDisplayCan = document.getElementById('flavor-showcase-img');
  const flavorTitle = document.getElementById('flavor-title');
  const flavorTagline = document.getElementById('flavor-tagline');
  const flavorNotes = document.getElementById('flavor-notes');
  const flavorBadge = document.getElementById('flavor-badge');
  const barSweetness = document.getElementById('bar-sweetness');
  const barCrispness = document.getElementById('bar-crispness');
  const barFizz = document.getElementById('bar-fizz');
  const barChill = document.getElementById('bar-chill');
  const valSweetness = document.getElementById('val-sweetness');
  const valCrispness = document.getElementById('val-crispness');
  const valFizz = document.getElementById('val-fizz');
  const valChill = document.getElementById('val-chill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const flavorKey = pill.getAttribute('data-flavor');
      const flavor = flavorsData[flavorKey];
      if (!flavor) return;

      // Update active state
      pills.forEach(p => p.classList.remove('active', 'border-red-600', 'bg-red-950/40'));
      pill.classList.add('active', 'border-red-600', 'bg-red-950/40');

      // Play audio effect
      audio.playFizz();

      // Smooth swap image
      if (flavorDisplayCan) {
        flavorDisplayCan.style.opacity = '0';
        flavorDisplayCan.style.transform = 'scale(0.92) rotate(-5deg)';
        setTimeout(() => {
          flavorDisplayCan.src = flavor.svg;
          flavorDisplayCan.style.opacity = '1';
          flavorDisplayCan.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
      }

      // Update hero can if requested
      if (heroCanImg && pill.hasAttribute('data-update-hero')) {
        heroCanImg.src = flavor.svg;
      }

      // Update text & stats
      if (flavorTitle) flavorTitle.textContent = flavor.name;
      if (flavorTagline) flavorTagline.textContent = flavor.tagline;
      if (flavorNotes) flavorNotes.textContent = flavor.notes;
      if (flavorBadge) flavorBadge.textContent = flavor.badge;

      if (barSweetness) barSweetness.style.width = `${flavor.profile.sweetness}%`;
      if (barCrispness) barCrispness.style.width = `${flavor.profile.crispness}%`;
      if (barFizz) barFizz.style.width = `${flavor.profile.fizz}%`;
      if (barChill) barChill.style.width = `${flavor.profile.chill}%`;

      if (valSweetness) valSweetness.textContent = `${flavor.profile.sweetness}%`;
      if (valCrispness) valCrispness.textContent = `${flavor.profile.crispness}%`;
      if (valFizz) valFizz.textContent = `${flavor.profile.fizz}%`;
      if (valChill) valChill.textContent = `${flavor.profile.chill}%`;
    });
  });
}

// ----------------------------------------------------
// 5. Interactive Sensory Experience Timeline
// ----------------------------------------------------
function initSensoryTimeline() {
  const steps = document.querySelectorAll('.sensory-card');
  steps.forEach((step, idx) => {
    step.addEventListener('mouseenter', () => {
      if (idx === 0) audio.playCanCrack();
      else if (idx === 1) audio.playFizz();
      else if (idx === 2) audio.playChime();
      else audio.playFizz();
    });

    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('border-red-500', 'bg-red-950/20'));
      step.classList.add('border-red-500', 'bg-red-950/20');
      audio.playChime();
    });
  });
}

// ----------------------------------------------------
// 6. Interactive Comparison Split View Slider & Blind Test
// ----------------------------------------------------
function initComparisonSlider() {
  const slider = document.getElementById('comparison-slider');
  const zeroSide = document.getElementById('compare-zero-side');
  const classicSide = document.getElementById('compare-classic-side');
  const divider = document.getElementById('slider-divider');

  if (!slider || !zeroSide || !divider) return;

  let isDown = false;

  function setSliderPos(xRatio) {
    const clamped = Math.max(0.05, Math.min(0.95, xRatio));
    const percent = clamped * 100;
    zeroSide.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    divider.style.left = `${percent}%`;
  }

  slider.addEventListener('mousedown', () => isDown = true);
  window.addEventListener('mouseup', () => isDown = false);
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const rect = slider.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setSliderPos(ratio);
  });

  // Touch events for mobile
  slider.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = slider.getBoundingClientRect();
    const ratio = (touch.clientX - rect.left) / rect.width;
    setSliderPos(ratio);
  });
}

// Blind Taste Quiz Mini-Game
function initBlindTasteGame() {
  const options = document.querySelectorAll('.blind-test-btn');
  const resultCard = document.getElementById('blind-test-result');
  const quizCard = document.getElementById('blind-test-quiz');
  const resetBtn = document.getElementById('blind-test-reset');

  if (!options || !resultCard || !quizCard) return;

  options.forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playCanCrack();
      setTimeout(() => {
        audio.playChime();
        triggerConfetti();
      }, 300);

      quizCard.classList.add('hidden');
      resultCard.classList.remove('hidden');
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resultCard.classList.add('hidden');
      quizCard.classList.remove('hidden');
    });
  }
}

// ----------------------------------------------------
// 7. Cold-Finder Store Locator Mockup
// ----------------------------------------------------
const storeData = {
  "10001": [
    { name: "Target Midtown Herald Square", dist: "0.2 miles", status: "Chilled Cans in Stock", temp: "2°C Sub-Zero", hours: "Open until 11 PM" },
    { name: "7-Eleven 8th Avenue", dist: "0.4 miles", status: "Grab & Go 20oz Cold", temp: "1.8°C Ice-Cold", hours: "Open 24 Hours" },
    { name: "Whole Foods Manhattan West", dist: "0.6 miles", status: "12-Packs Chilled", temp: "2.2°C", hours: "Open until 10 PM" }
  ],
  "default": [
    { name: "Downtown Express Market", dist: "0.3 miles", status: "Chilled in Stock", temp: "1.9°C Sub-Zero", hours: "Open Now" },
    { name: "MegaMart Supercenter", dist: "0.8 miles", status: "All Flavors Stocked", temp: "2.0°C Ice-Cold", hours: "Open until Midnight" },
    { name: "Corner Chill Bodega", dist: "1.1 miles", status: "Zero & Cherry Chilled", temp: "2.1°C", hours: "Open 24 Hours" }
  ]
};

function initStoreLocator() {
  const input = document.getElementById('store-zip-input');
  const searchBtn = document.getElementById('store-search-btn');
  const resultsList = document.getElementById('store-results');
  const quickPills = document.querySelectorAll('.store-city-pill');

  function renderStores(zip) {
    if (!resultsList) return;
    const stores = storeData[zip] || storeData["default"];

    resultsList.innerHTML = stores.map(store => `
      <div class="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/10 hover:border-red-500/40 transition">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-white text-base">${store.name}</h4>
            <span class="text-xs bg-red-600/30 text-red-400 font-semibold px-2 py-0.5 rounded-full border border-red-500/20">${store.temp}</span>
          </div>
          <p class="text-sm text-gray-400 mt-0.5">${store.dist} • ${store.status} • <span class="text-green-400">${store.hours}</span></p>
        </div>
        <button class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-red-600 text-white transition flex items-center gap-1.5" onclick="alert('Navigating to ${store.name}...')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Directions
        </button>
      </div>
    `).join('');
  }

  if (searchBtn && input) {
    searchBtn.addEventListener('click', () => {
      audio.playCanCrack();
      renderStores(input.value.trim());
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        audio.playCanCrack();
        renderStores(input.value.trim());
      }
    });
  }

  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      quickPills.forEach(p => p.classList.remove('bg-red-600', 'text-white'));
      pill.classList.add('bg-red-600', 'text-white');
      if (input) input.value = pill.getAttribute('data-zip');
      audio.playFizz();
      renderStores(pill.getAttribute('data-zip'));
    });
  });

  // Initial render
  renderStores("default");
}

// ----------------------------------------------------
// 8. Newsletter VIP Sign Up & Confetti Celebration
// ----------------------------------------------------
function triggerConfetti() {
  const colors = ['#f40009', '#ffffff', '#ff4d54', '#000000', '#ffd27a'];
  for (let i = 0; i < 45; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = `${window.scrollY + Math.random() * 200}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 12 + 8}px`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 2600);
  }
}

function initNewsletter() {
  const form = document.getElementById('vip-form');
  const input = document.getElementById('vip-email');
  const feedback = document.getElementById('vip-feedback');

  if (!form || !input || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    audio.playChime();
    triggerConfetti();

    form.classList.add('hidden');
    feedback.classList.remove('hidden');
  });
}

// ----------------------------------------------------
// 9. Sound FX Button & Crack Open Cold One Trigger
// ----------------------------------------------------
function initSoundButtons() {
  const muteBtn = document.getElementById('sound-toggle-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      muteBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
      const label = document.getElementById('sound-toggle-label');
      if (label) label.textContent = isMuted ? 'Sound: OFF' : 'Sound: ON';
    });
  }

  const crackTriggers = document.querySelectorAll('.trigger-crack-sound');
  crackTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      audio.playCanCrack();
      audio.playFizz();

      // Visual button feedback
      btn.classList.add('scale-95');
      setTimeout(() => btn.classList.remove('scale-95'), 150);
    });
  });
}

// ----------------------------------------------------
// 10. Mobile Menu Navigation & Sticky Bar Blur
// ----------------------------------------------------
function initNavigation() {
  const navToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      if (isOpen) {
        mobileMenu.classList.add('hidden');
      } else {
        mobileMenu.classList.remove('hidden');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Sticky navbar shadow upon scroll
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('bg-black/80', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'py-3');
      nav.classList.remove('py-5');
    } else {
      nav.classList.remove('bg-black/80', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'py-3');
      nav.classList.add('py-5');
    }
  });
}

// ----------------------------------------------------
// Global Startup Initialization
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  new FizzCanvas('fizz-canvas');
  initCan3D();
  initFlavorSwitcher();
  initSensoryTimeline();
  initComparisonSlider();
  initBlindTasteGame();
  initStoreLocator();
  initNewsletter();
  initSoundButtons();
  initNavigation();
});
