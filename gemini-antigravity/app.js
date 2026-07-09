/* ==========================================================================
   Coca-Cola Zero Sugar Landing Page Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBubbleCanvas();
  init3DTilt();
  initCtaButtons();
  initTasteSlider();
  initSoundEffects();
  initScrollspy();
});

/* ==========================================================================
   1. Canvas Carbonation Bubble System
   ========================================================================== */

function initBubbleCanvas() {
  const canvas = document.getElementById('bubble-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  let bubbles = [];
  const bubbleCount = Math.min(60, Math.floor(width / 20));
  
  let mouse = { x: null, y: null };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });
  
  class Bubble {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Distribute vertically initially
    }
    
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.radius = Math.random() * 3 + 1; // 1px to 4px small crisp bubbles
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.angle = Math.random() * Math.PI * 2;
      this.speedAngle = Math.random() * 0.02 - 0.01;
    }
    
    update() {
      this.y -= this.speedY;
      this.angle += this.speedAngle;
      this.x += Math.sin(this.angle) * 0.25 + this.speedX;
      
      // Interaction with mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const force = (120 - distance) / 120;
          const angle = Math.atan2(dy, dx);
          // Push bubble away
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 1;
        }
      }
      
      // Reset if out of bounds or faded
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
      
      // Add subtle outer shell reflection for larger bubbles
      if (this.radius > 2.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 1.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  
  // Initialize bubble pool
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].update();
      bubbles[i].draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* ==========================================================================
   2. 3D Parallax Tilt for Hero Can
   ========================================================================== */

function init3DTilt() {
  const container = document.getElementById('interactive-can-container');
  const can = document.getElementById('hero-can-img');
  const glow = container ? container.querySelector('.glow-backdrop') : null;
  
  if (!container || !can) return;
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    // Convert to percentage coordinates (-0.5 to 0.5)
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    // Degrees of rotation (max 15 deg)
    const rotateX = py * -18;
    const rotateY = px * 18;
    
    // Glow offset
    const glowX = px * -30;
    const glowY = py * -30;
    
    // Apply transformations with smooth scale
    can.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    can.style.transition = 'transform 0.05s ease-out';
    
    if (glow) {
      glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      glow.style.opacity = '0.55';
      glow.style.transition = 'transform 0.05s ease-out, opacity 0.2s ease';
    }
  });
  
  container.addEventListener('mouseleave', () => {
    // Reset position smoothly
    can.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    can.style.transition = 'transform 0.5s ease';
    
    if (glow) {
      glow.style.transform = 'translate(0px, 0px)';
      glow.style.opacity = '0.35';
      glow.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    }
  });
}

/* ==========================================================================
   3. CTA Buttons
   ========================================================================== */

function initCtaButtons() {
  const navCta = document.getElementById('nav-cta-btn');
  const heroCta = document.getElementById('hero-primary-btn');

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (navCta) {
    navCta.addEventListener('click', () => scrollToSection('features'));
  }

  if (heroCta) {
    heroCta.addEventListener('click', () => scrollToSection('taste-paradox'));
  }
}

/* ==========================================================================
   4. Interactive Taste Paradox Slider
   ========================================================================== */

function initTasteSlider() {
  const slider = document.getElementById('taste-slider');
  const mask = document.getElementById('pour-overlay-mask');
  const sugarVal = document.getElementById('sugar-val');
  const matchVal = document.getElementById('match-val');
  const caloriesVal = document.getElementById('calories-val');
  
  if (!slider || !mask) return;
  
  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    
    // Map overlay opacity: 0 (Zero sugar) -> fully dark/desaturated mask, 100 (Original) -> transparent mask
    const opacity = 0.9 - (val / 100) * 0.9;
    mask.style.opacity = opacity;
    
    // Update Telemetry Indicators
    // Sugar Content: 0g -> 35.0g per can
    const sugar = (val / 100) * 35;
    sugarVal.textContent = `${sugar.toFixed(1)}g`;
    if (sugar > 0) {
      sugarVal.style.color = '#f40009';
    } else {
      sugarVal.style.color = '#ffffff';
    }
    
    // Caloric Index: 0 -> 139 kcal
    const calories = Math.round((val / 100) * 139);
    caloriesVal.textContent = `${calories} kcal`;
    if (calories > 0) {
      caloriesVal.style.color = '#f40009';
    } else {
      caloriesVal.style.color = '#ffffff';
    }
    
    // Taste Match Label Mapping
    if (val === 0) {
      matchVal.textContent = '100% ZERO';
      matchVal.style.color = '#ffffff';
    } else if (val < 50) {
      matchVal.textContent = '99.9% TASTE';
      matchVal.style.color = '#ffffff';
    } else if (val < 99) {
      matchVal.textContent = '99.9% MATCH';
      matchVal.style.color = '#f40009';
    } else {
      matchVal.textContent = '100% CLASSIC';
      matchVal.style.color = '#f40009';
    }
  });
}

/* ==========================================================================
   5. Audio Synthesis and Visualizer
   ========================================================================== */

function initSoundEffects() {
  const heroBtn = document.getElementById('hero-sound-btn');
  const sensoryBtn = document.getElementById('sensory-trigger-btn');
  const visualizerCanvas = document.getElementById('audio-visualizer');
  const statusLabel = document.getElementById('visualizer-status');
  
  if (!sensoryBtn || !visualizerCanvas) return;
  
  let audioCtx = null;
  let visualizerAnimId = null;
  
  // Sound triggers
  const triggerSound = () => {
    // Initialize Audio Context on user gesture
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Visual indicator active
    sensoryBtn.classList.add('active');
    if (statusLabel) {
      statusLabel.textContent = 'CRACKING SODA';
      statusLabel.style.color = '#f40009';
    }
    
    // Synthesize physical can opening and bubbling noise
    synthesizeCrackAndFizz(audioCtx, visualizerCanvas, statusLabel, () => {
      sensoryBtn.classList.remove('active');
      if (statusLabel) {
        statusLabel.textContent = 'STANDBY';
        statusLabel.style.color = '#8e8e93';
      }
    });
  };
  
  sensoryBtn.addEventListener('click', triggerSound);
  if (heroBtn) {
    heroBtn.addEventListener('click', triggerSound);
  }
}

// Generate White Noise Buffer
function generateNoiseBuffer(ctx, duration) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Real-Time Soda ASMR Synthesis Node Graph
function synthesizeCrackAndFizz(ctx, canvas, statusLabel, onEnded) {
  const noiseBuffer = generateNoiseBuffer(ctx, 3.5);
  
  // Analyser node for the visualizer
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 128;
  analyser.connect(ctx.destination);
  
  // LAYER 1: Aluminium Crack (Bass click + snap)
  const crackNoise = ctx.createBufferSource();
  crackNoise.buffer = noiseBuffer;
  
  const crackFilter = ctx.createBiquadFilter();
  crackFilter.type = 'bandpass';
  crackFilter.frequency.setValueAtTime(1600, ctx.currentTime);
  crackFilter.Q.setValueAtTime(3.0, ctx.currentTime);
  
  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0, ctx.currentTime);
  crackGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.003);
  crackGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  
  crackNoise.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(analyser);
  
  // Metal snap click generator
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(80, ctx.currentTime);
  clickOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);
  
  clickGain.gain.setValueAtTime(0.9, ctx.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  clickOsc.connect(clickGain);
  clickGain.connect(analyser);
  
  // LAYER 2: Pressure Release (The initial high-pressure "Psssshh")
  const psshNoise = ctx.createBufferSource();
  psshNoise.buffer = noiseBuffer;
  
  const psshFilter = ctx.createBiquadFilter();
  psshFilter.type = 'bandpass';
  psshFilter.frequency.setValueAtTime(4500, ctx.currentTime);
  psshFilter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.35);
  
  const psshGain = ctx.createGain();
  psshGain.gain.setValueAtTime(0, ctx.currentTime);
  psshGain.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 0.01);
  psshGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
  
  psshNoise.connect(psshFilter);
  psshFilter.connect(psshGain);
  psshGain.connect(analyser);
  
  // LAYER 3: Effervescent Carbonation (Decaying bubbling "Fizzzzz")
  const fizzNoise = ctx.createBufferSource();
  fizzNoise.buffer = noiseBuffer;
  
  const fizzFilter = ctx.createBiquadFilter();
  fizzFilter.type = 'highpass';
  fizzFilter.frequency.setValueAtTime(8000, ctx.currentTime);
  
  // LFO (Low-Freq Oscillator) to modulate fizz amplitude and sound like bursts of bubbles
  const lfo = ctx.createOscillator();
  lfo.type = 'sawtooth';
  lfo.frequency.setValueAtTime(15, ctx.currentTime); // 15 Hz wobble
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
  
  const fizzGain = ctx.createGain();
  fizzGain.gain.setValueAtTime(0, ctx.currentTime);
  fizzGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.04);
  fizzGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15); // Rising sizzling volume
  fizzGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0); // Declines over 3 seconds
  
  lfo.connect(lfoGain);
  lfoGain.connect(fizzGain.gain); // Modulate gain
  
  fizzNoise.connect(fizzFilter);
  fizzFilter.connect(fizzGain);
  fizzGain.connect(analyser);
  
  // Playback schedules
  crackNoise.start(ctx.currentTime);
  clickOsc.start(ctx.currentTime);
  psshNoise.start(ctx.currentTime);
  fizzNoise.start(ctx.currentTime);
  lfo.start(ctx.currentTime);
  
  // Cleanup schedule
  crackNoise.stop(ctx.currentTime + 0.2);
  clickOsc.stop(ctx.currentTime + 0.1);
  psshNoise.stop(ctx.currentTime + 0.5);
  fizzNoise.stop(ctx.currentTime + 3.2);
  lfo.stop(ctx.currentTime + 3.2);
  
  // Launch visualizer rendering
  renderVisualizer(analyser, canvas, statusLabel, onEnded);
}

// Waveform visualizer renderer
function renderVisualizer(analyser, canvas, statusLabel, onEnded) {
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  let animationId = null;
  const startTime = Date.now();
  const duration = 3200; // Match fizz duration
  
  function draw() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= duration) {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onEnded();
      return;
    }
    
    animationId = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    
    // Scale canvas to match bounding box dynamically
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(34, 34, 37, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw waveform line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f40009'; // Red coke wave
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(244, 0, 9, 0.6)';
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
    
    // Dynamic text status change
    if (statusLabel) {
      if (elapsed > 450) {
        statusLabel.textContent = 'CARBONATING FIZZ';
        statusLabel.style.color = 'rgba(255, 255, 255, 0.8)';
      }
    }
  }
  
  draw();
}

/* ==========================================================================
   6. Scrollspy for Navigation Menu
   ========================================================================== */

function initScrollspy() {
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    if (currentSectionId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}
