document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const mobileViewport = window.matchMedia("(max-width: 800px)");

function closeMenu({ restoreFocus = false } = {}) {
  const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", "false");
  primaryNav.classList.remove("is-open");
  if (restoreFocus && wasOpen) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a") && mobileViewport.matches) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu({ restoreFocus: true });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

mobileViewport.addEventListener("change", () => {
  const focusWillBeHidden = mobileViewport.matches && primaryNav.contains(document.activeElement);
  closeMenu();
  if (focusWillBeHidden) menuToggle.focus();
});

document.querySelector("#year").textContent = String(new Date().getFullYear());

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection;

document.querySelectorAll("[data-background-media]").forEach((frame) => {
  const video = frame.querySelector("video");
  const source = video.dataset.src.trim();
  if (!source) return;

  const toggle = frame.querySelector(".video-toggle");
  const status = frame.parentElement.querySelector(".video-status");
  let inView = false;
  let userPaused = false;
  let userRequested = false;
  let failed = false;
  let pending = false;
  let interrupted = false;

  video.muted = true;
  video.defaultMuted = true;
  toggle.hidden = false;

  function setStatus(message) {
    status.textContent = message;
    status.classList.toggle("sr-only", !message);
  }

  function motionAllowed() {
    return userRequested || (!reducedMotion.matches && !connection?.saveData);
  }

  function shouldPlay() {
    return inView && !document.hidden && !userPaused && !failed && motionAllowed();
  }

  function showPlaybackFailure() {
    failed = true;
    video.pause();
    frame.classList.remove("has-video");
    toggle.textContent = "Retry background video";
    setStatus("The background video could not play. The still image is shown instead.");
  }

  async function syncPlayback() {
    if (!shouldPlay()) {
      if (pending) interrupted = true;
      video.pause();
      if (!motionAllowed()) {
        frame.classList.remove("has-video");
        setStatus("Background motion is off for your motion or data-saving preference. Play to load the video.");
      }
      return;
    }
    if (pending) return;
    if (!video.hasAttribute("src")) video.src = source;
    pending = true;
    interrupted = false;
    try {
      await video.play();
      if (!shouldPlay()) video.pause();
    } catch (error) {
      // Leaving the viewport or changing preferences can interrupt a pending play request.
      if (error.name !== "AbortError" || !interrupted) showPlaybackFailure();
    } finally {
      pending = false;
      if (interrupted && shouldPlay()) syncPlayback();
    }
  }

  video.addEventListener("playing", () => {
    if (!shouldPlay()) {
      video.pause();
      return;
    }
    frame.classList.add("has-video");
    toggle.textContent = "Pause background video";
    setStatus("");
  });

  video.addEventListener("pause", () => {
    if (!failed) toggle.textContent = "Play background video";
  });

  video.addEventListener("error", showPlaybackFailure);

  toggle.addEventListener("click", () => {
    if (!video.paused || pending) {
      userPaused = true;
      userRequested = false;
      syncPlayback();
      return;
    }
    userPaused = false;
    userRequested = true;
    if (failed) {
      failed = false;
      video.load();
    }
    setStatus("");
    syncPlayback();
  });

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.1 });
  observer.observe(frame);

  document.addEventListener("visibilitychange", syncPlayback);
  function preferenceChanged() {
    userRequested = false;
    syncPlayback();
  }
  reducedMotion.addEventListener("change", preferenceChanged);
  connection?.addEventListener("change", preferenceChanged);
  syncPlayback();
});
