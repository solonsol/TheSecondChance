function copyText(value, button) {
  const done = () => {
    const old = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = old;
    }, 1100);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
  } else {
    fallbackCopy(value, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch (e) {
    /* ignore */
  }
  document.body.removeChild(ta);
  done();
}

function setupCopyButtons() {
  const buttons = document.querySelectorAll(".copy-btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-copy");
      if (!value) return;
      copyText(value, button);
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  items.forEach((item) => io.observe(item));
}

function setupScrollProgress() {
  const inner = document.getElementById("scrollProgressInner");
  if (!inner) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    inner.style.transform = "scaleX(1)";
    return;
  }

  let ticking = false;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    inner.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

function setupHeroMouseTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const shell = document.getElementById("heroShell");
  const fx = document.querySelector(".hero-bg-effects");
  if (!shell || !fx) return;

  shell.addEventListener("mousemove", (e) => {
    const r = shell.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    fx.style.transform = `translate(${x * 22}px, ${y * 16}px)`;
  });

  shell.addEventListener("mouseleave", () => {
    fx.style.transform = "";
  });
}

/** Stronger abstract eye / watchful layers after scroll or while pointer is over hero. */
function setupProphecyWake() {
  const shell = document.getElementById("heroShell");
  if (!shell) return;

  const scrollWakePx = 100;
  let hovering = false;

  function updateAwake() {
    const scrolled = window.scrollY > scrollWakePx;
    shell.classList.toggle("hero-shell--awake", hovering || scrolled);
  }

  shell.addEventListener("mouseenter", () => {
    hovering = true;
    updateAwake();
  });

  shell.addEventListener("mouseleave", () => {
    hovering = false;
    updateAwake();
  });

  window.addEventListener("scroll", updateAwake, { passive: true });
  updateAwake();
}

/** Background audio: first-party <audio> only (no YouTube / third-party iframes). */
function setupBackgroundAudio() {
  const audioEl = document.getElementById("bgAudioEl");
  const toggle = document.getElementById("audioToggle");
  if (!toggle || !audioEl) return;

  let playing = true;

  audioEl.loop = true;
  audioEl.load();

  function startAudio() {
    return audioEl.play();
  }

  function stopAudio() {
    audioEl.pause();
    audioEl.currentTime = 0;
  }

  startAudio().catch(() => {});

  toggle.textContent = "Disable Background Audio";

  toggle.addEventListener("click", () => {
    if (playing) {
      stopAudio();
      toggle.textContent = "Enable Background Audio";
      playing = false;
    } else {
      playing = true;
      toggle.textContent = "Disable Background Audio";
      startAudio().catch(() => {});
    }
  });

  function tryUnlockAudio() {
    if (!playing) return;
    startAudio().catch(() => {});
  }

  document.addEventListener("click", tryUnlockAudio, { capture: true, once: true });
  document.addEventListener("keydown", tryUnlockAudio, { capture: true, once: true });
}

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
  setupCopyButtons();
  setupReveal();
  setupScrollProgress();
  setupHeroMouseTilt();
  setupProphecyWake();
  setupBackgroundAudio();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
