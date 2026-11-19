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
