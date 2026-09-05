(function () {
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var progress = document.getElementById("progress");
  var year = document.getElementById("year");
  var stage = document.getElementById("heroStage");
  var can = stage ? stage.querySelector(".hero__can") : null;
  var canvas = document.getElementById("fizz");
  var form = document.getElementById("finder");
  var msg = document.getElementById("finderMsg");
  var flavorCan = document.getElementById("flavorCan");
  var flavorTitle = document.getElementById("flavorTitle");
  var flavorCopy = document.getElementById("flavorCopy");
  var flavorKicker = document.getElementById("flavorKicker");
  var flavorNotes = document.getElementById("flavorNotes");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-on", y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav && links) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (!reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        });
      },
      { threshold: 0.16 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (stage && can && !reduce) {
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      can.style.transform = "translate(" + x * 18 + "px," + y * 12 + "px) rotate(" + x * 6 + "deg)";
    });
    stage.addEventListener("mouseleave", function () {
      can.style.transform = "";
    });
  }

  var flavors = {
    original: {
      src: "./assets/images/can-original.svg",
      kicker: "Original",
      title: "Coca-Cola Zero Sugar",
      copy: "The flagship. Deep cola, bright sparkle, and a dry, refreshing close. The can you reach for when the night is still deciding what it wants to be.",
      notes: ["Caramel", "Citrus spark", "Clean finish"]
    },
    cherry: {
      src: "./assets/images/can-cherry.svg",
      kicker: "Cherry",
      title: "Cherry Zero Sugar",
      copy: "Dark cherry laid over classic cola. Lush, late-night, and still zero sugar — a velvet ribbon through the fizz.",
      notes: ["Black cherry", "Cola depth", "Soft spice"]
    },
    vanilla: {
      src: "./assets/images/can-vanilla.svg",
      kicker: "Vanilla",
      title: "Vanilla Zero Sugar",
      copy: "Warm vanilla against cold carbonation. Dessert energy without the dessert. Smooth, golden, still unmistakably Coke.",
      notes: ["Vanilla bean", "Caramel", "Silk fizz"]
    },
    lime: {
      src: "./assets/images/can-lime.svg",
      kicker: "Lime",
      title: "Lime Zero Sugar",
      copy: "A sharp green twist. Cola backbone, lime lift, extra snap on the finish — built for heat and high volume.",
      notes: ["Lime zest", "Bright acid", "Ice-cold"]
    },
    orange: {
      src: "./assets/images/can-orange.svg",
      kicker: "Orange Vanilla",
      title: "Orange Vanilla Zero",
      copy: "Sunset in a black can. Orange brightness, vanilla roundness, Coca-Cola structure. Zero sugar, full color.",
      notes: ["Orange peel", "Vanilla", "Sunset cola"]
    }
  };

  document.querySelectorAll(".flavor-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var id = chip.getAttribute("data-id");
      var data = flavors[id];
      if (!data) return;
      document.querySelectorAll(".flavor-chip").forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
      });
      if (flavorCan) {
        flavorCan.src = data.src;
        flavorCan.alt = data.title + " can";
      }
      if (flavorKicker) flavorKicker.textContent = data.kicker;
      if (flavorTitle) flavorTitle.textContent = data.title;
      if (flavorCopy) flavorCopy.textContent = data.copy;
      if (flavorNotes) {
        flavorNotes.innerHTML = data.notes.map(function (n) {
          return "<li>" + n + "</li>";
        }).join("");
      }
    });
  });

  if (form && msg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var city = (document.getElementById("city") || {}).value || "";
      city = city.trim();
      msg.textContent = city
        ? "Zero is chilling near " + city + ". Check the nearest cooler — this tribute page does not connect to live store data."
        : "Enter a city to continue.";
      form.reset();
    });
  }

  if (!canvas || reduce) return;

  var ctx = canvas.getContext("2d");
  var bubbles = [];
  var running = true;

  function resize() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function spawn(n) {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    for (var i = 0; i < n; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.4 + 0.4,
        v: Math.random() * 0.7 + 0.2,
        a: Math.random() * 0.35 + 0.08
      });
    }
  }

  function tick() {
    if (!running) return;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.y -= b.v;
      b.x += Math.sin(b.y / 40) * 0.15;
      if (b.y < -4) {
        b.y = h + 4;
        b.x = Math.random() * w;
      }
      ctx.globalAlpha = b.a;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  resize();
  spawn(70);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () {
    running = document.visibilityState === "visible";
    if (running) tick();
  });
  tick();
})();
