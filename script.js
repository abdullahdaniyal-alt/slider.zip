(function () {
  var DELAY = 4500; // autoplay interval in milliseconds

  var slider = document.getElementById("slider");
  var slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
  var dotsBox = document.getElementById("dots");
  var counter = document.getElementById("count");
  var fill = document.getElementById("fill");
  var ppBtn = document.getElementById("pp");
  var index = 0, timer = null, userPaused = false, hoverPaused = false;

  // build the dots
  var dots = slides.map(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dot";
    b.setAttribute("aria-label", "Go to slide " + (i + 1));
    b.addEventListener("click", function () { goTo(i); });
    dotsBox.appendChild(b);
    return b;
  });

  function update() {
    slides.forEach(function (s, i) {
      var on = i === index;
      s.classList.toggle("active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    dots.forEach(function (d, i) { d.setAttribute("aria-current", i === index ? "true" : "false"); });
    counter.textContent = (index + 1) + " / " + slides.length;
  }

  function goTo(n) {
    index = (n + slides.length) % slides.length; // wraps around at both ends
    update();
    restart();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // ---- autoplay with setInterval ----
  function stop() {
    clearInterval(timer); timer = null;
    fill.style.animation = "none"; fill.style.width = "0";
  }
  function restart() {
    stop();
    if (userPaused || hoverPaused || document.hidden) return;
    timer = setInterval(next, DELAY);
    void fill.offsetWidth; // restart the progress bar animation
    fill.style.animation = "fill " + DELAY + "ms linear forwards";
  }

  document.getElementById("next").addEventListener("click", next);
  document.getElementById("prev").addEventListener("click", prev);

  ppBtn.addEventListener("click", function () {
    userPaused = !userPaused;
    ppBtn.classList.toggle("paused", userPaused);
    ppBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    restart();
  });

  // pause while the pointer is over the slider or a control has focus
  slider.addEventListener("mouseenter", function () { hoverPaused = true; restart(); });
  slider.addEventListener("mouseleave", function () { hoverPaused = false; restart(); });
  slider.addEventListener("focusin", function () { hoverPaused = true; restart(); });
  slider.addEventListener("focusout", function () { hoverPaused = false; restart(); });
  document.addEventListener("visibilitychange", restart);

  // keyboard arrows
  slider.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });

  // touch swipe
  var startX = 0, startY = 0;
  slider.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  slider.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  // safety: the slider box must never scroll (focus can nudge hidden overflow)
  slider.addEventListener("scroll", function () { slider.scrollLeft = 0; slider.scrollTop = 0; });

  update();
  restart();
})();
